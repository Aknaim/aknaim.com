export interface GearItem {
  title: string;
  description: string;
}

interface InterestGearListProps {
  items: GearItem[];
  heading?: string;
  id?: string;
}

export function InterestGearList({
  items,
  heading = "Gear & Equipment",
  id = "gear",
}: InterestGearListProps) {
  if (items.length === 0) return null;

  return (
    <section id={id} className="space-y-6 scroll-mt-8">
      <div className="border-b border-[#141414] pb-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          {heading}
        </h2>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 rounded-card border border-[#141414] bg-[#0c0c0c] px-4 py-3"
          >
            <span className="text-sm text-white font-medium">{item.title}</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
