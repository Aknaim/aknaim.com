import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";

interface StorageCupboardProps {
  items: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
}

export function StorageCupboard({
  items,
  fallbackBySrc,
}: StorageCupboardProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="page-container border-t border-border-subtle py-14 lg:py-16"
      aria-label="Stowed gear"
    >
      <div className="cupboard-header mb-8">
        <p className="text-tab text-foreground-subtle">Archive</p>
        <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground-muted">
          The Storage Cupboard
        </h2>
        <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-foreground-subtle">
          Interests in stasis — muted, catalogued, and waiting for the next
          season.
        </p>
      </div>

      <div className="cupboard-shelves rounded-card">
        <ul>
          {items.map((item, index) => (
            <CupboardShelf
              key={item.id}
              item={item}
              shelfIndex={index + 1}
              bagFallback={fallbackBySrc[item.bagImage] ?? true}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CupboardShelf({
  item,
  shelfIndex,
  bagFallback,
}: {
  item: InterestCategory;
  shelfIndex: number;
  bagFallback: boolean;
}) {
  const Icon = getIcon(item.icon);

  return (
    <li className="cupboard-shelf">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-image border border-[#1a1a1a] sm:h-20 sm:w-28">
          <AssetImage
            src={item.bagImage}
            alt={`${item.label} stowed on shelf ${shelfIndex}`}
            icon={item.icon}
            forceFallback={bagFallback}
            fill
            sizes="(max-width: 640px) 100vw, 112px"
            fallbackVariant="cupboard"
            fallbackMuted
            imageClassName="object-cover grayscale"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-black/40"
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <Icon
                className="h-3.5 w-3.5 text-foreground-subtle"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-tab text-foreground-subtle">
                {item.label}
              </span>
            </div>
            <span className="cupboard-shelf-label hidden sm:inline" aria-hidden>
              ·
            </span>
            <span className="cupboard-shelf-label">
              Shelf {String(shelfIndex).padStart(2, "0")}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-meta leading-relaxed text-foreground-subtle/75">
            {item.peekCaption}
          </p>

          {item.stowedDate ? (
            <p className="mt-3 text-meta text-foreground-subtle">
              {item.stowedDate}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
