import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { AssetImage } from "./AssetImage";

interface ListRowProps {
  title: string;
  date: string;
  href?: string;
  thumbnail?: string;
  thumbnailFallback?: boolean;
  thumbnailIcon?: string;
  badge?: string;
}

export function ListRow({
  title,
  date,
  href,
  thumbnail,
  thumbnailFallback = false,
  thumbnailIcon = "Camera",
  badge,
}: ListRowProps) {
  const content = (
    <>
      {thumbnail ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-image border border-[#262626] bg-surface-elevated">
          <AssetImage
            src={thumbnail}
            alt=""
            icon={thumbnailIcon}
            forceFallback={thumbnailFallback}
            fill
            sizes="48px"
            fallbackVariant="panel"
            fallbackClassName="rounded-image"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-body-sm font-medium text-foreground">
            {title}
          </p>
          {badge ? (
            <span className="shrink-0 rounded-pill border border-[#262626] bg-surface-elevated px-2 py-0.5 text-meta uppercase text-accent">
              {badge}
            </span>
          ) : null}
        </div>
        <time className="mt-1 block text-meta" dateTime={date}>
          {formatDate(date)}
        </time>
      </div>
    </>
  );

  const className =
    "flex items-center gap-3 rounded-card border border-[#262626]/80 bg-surface/40 p-3 transition-colors hover:border-[#262626] hover:bg-surface-hover";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
