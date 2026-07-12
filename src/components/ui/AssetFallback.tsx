import { getIcon } from "@/lib/icon-map";
import type { LucideIcon } from "lucide-react";

export type AssetFallbackVariant = "default" | "peek" | "bag" | "panel" | "cupboard";

interface AssetFallbackProps {
  icon?: string;
  iconComponent?: LucideIcon;
  label?: string;
  className?: string;
  muted?: boolean;
  variant?: AssetFallbackVariant;
}

const variantClasses: Record<AssetFallbackVariant, string> = {
  default: "asset-fallback",
  bag: "asset-fallback asset-fallback--bag",
  peek: "asset-fallback asset-fallback--peek",
  panel: "asset-fallback asset-fallback--panel",
  cupboard: "asset-fallback asset-fallback--cupboard",
};

export function AssetFallback({
  icon,
  iconComponent,
  label,
  className = "",
  muted = false,
  variant = "default",
}: AssetFallbackProps) {
  const Icon = iconComponent ?? (icon ? getIcon(icon) : getIcon("Box"));

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div
        className={`asset-fallback-icon-ring ${
          muted ? "asset-fallback-icon-ring--muted" : ""
        }`}
      >
        <Icon
          className={`asset-fallback-icon ${
            muted ? "text-foreground-subtle" : "text-accent/85"
          }`}
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
      {label && variant !== "bag" ? (
        <span className="asset-fallback-label">{label}</span>
      ) : null}
    </div>
  );
}
