"use client";

import { useActionState } from "react";
import {
  AdminDateField,
  AdminSelect,
  AdminTextarea,
} from "@/components/sections/admin/AdminField";
import {
  saveInterestSettings,
  type InterestSaveState,
} from "@/lib/actions/admin/interests";
import { toInputDate } from "@/lib/dates";
import type { InterestSettingRow } from "@/lib/db/queries/interests";

export function InterestAdminForm({
  setting,
  saved,
}: {
  setting: InterestSettingRow;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState<InterestSaveState, FormData>(
    saveInterestSettings,
    null
  );

  return (
    <form action={action} className="space-y-6 max-w-xl">
      <input type="hidden" name="id" value={setting.id} />

      {saved ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Saved
        </p>
      ) : null}
      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      <AdminSelect
        label="Status"
        name="status"
        required
        defaultValue={setting.status}
        options={[
          { id: "active", label: "Active (workbench)" },
          { id: "dormant", label: "Dormant (cupboard)" },
        ]}
      />

      <div className="space-y-2">
        <AdminTextarea
          label="Note"
          name="workbenchNote"
          defaultValue={setting.workbenchNote ?? ""}
          placeholder="Shown under the bag on the workbench and in the cupboard"
          rows={3}
        />
        <p className="text-xs text-foreground-muted">
          Same note on both shelves.
        </p>
      </div>

      <AdminDateField
        label="Last active"
        name="lastActive"
        defaultValue={toInputDate(setting.lastActive)}
        hint="Optional. Same date picker as climbs — shown under the note on both shelves."
      />

      <button
        type="submit"
        disabled={pending}
        className="border border-accent/50 bg-accent/10 px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-accent/20 transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
