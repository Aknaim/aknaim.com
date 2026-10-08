import type { ChangeEventHandler } from "react";

export function AdminField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  type = "text",
  hint,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  hint?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
      />
      {hint ? (
        <span className="font-mono text-[9px] text-foreground-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

export function AdminSelect({
  label,
  name,
  defaultValue,
  required,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminTextarea({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
      />
    </label>
  );
}

/** Native date picker — same pattern as climbing session dates. */
export function AdminDateField({
  label,
  name,
  defaultValue,
  value,
  required,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  hint?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        {label}
      </span>
      <input
        type="date"
        name={name}
        required={required}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
        className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent [color-scheme:dark]"
      />
      {hint ? (
        <span className="font-mono text-[9px] text-foreground-subtle">{hint}</span>
      ) : null}
    </label>
  );
}
