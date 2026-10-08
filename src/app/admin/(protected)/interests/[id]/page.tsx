import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InterestAdminForm } from "@/components/sections/admin/InterestAdminForm";
import { getInterestSettingForAdmin } from "@/lib/db/queries/interests";

export const metadata: Metadata = {
  title: "Edit Interest",
};

export default async function AdminInterestEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const setting = await getInterestSettingForAdmin(id);
  if (!setting) notFound();

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/interests"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Interests
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          Edit {setting.label}
        </h1>
        <p className="text-sm text-foreground-muted mt-2">
          Controls home workbench / cupboard placement and the short status lines under each
          bag.
        </p>
      </div>
      <InterestAdminForm setting={setting} saved={saved === "1"} />
    </main>
  );
}
