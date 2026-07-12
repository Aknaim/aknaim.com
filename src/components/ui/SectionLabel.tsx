import { getIcon } from "@/lib/icon-map";

interface SectionLabelProps {
  label: string;
  icon?: string;
}

export function SectionLabel({ label, icon }: SectionLabelProps) {
  const Icon = icon ? getIcon(icon) : null;

  return (
    <div className="flex items-center gap-2">
      {Icon ? (
        <Icon
          className="h-4 w-4 text-accent"
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
      <h2 className="text-section-title text-foreground">{label}</h2>
    </div>
  );
}
