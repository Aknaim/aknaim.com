import { revalidatePublicSite } from "@/lib/cache/revalidate-public";

function authorize(request: Request): boolean {
  const secret =
    process.env.REVALIDATE_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization")?.trim() ?? "";
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret")?.trim();
  return querySecret === secret;
}

/** POST with `Authorization: Bearer <REVALIDATE_SECRET|SESSION_SECRET>`. */
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
