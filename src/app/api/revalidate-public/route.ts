import { revalidatePublicSite } from "@/lib/cache/revalidate-public";

function authorize(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization")?.trim() ?? "";
  return header === `Bearer ${secret}`;
}

/** POST with `Authorization: Bearer <REVALIDATE_SECRET>` only. */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await revalidatePublicSite();
    return Response.json({ ok: true, revalidated: count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Revalidate failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
