import Image from "next/image";
import type { RecipeStep } from "@/lib/types/recipe";

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#141414] pb-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Steps
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <article
            key={step.number}
            className="rounded-card border border-[#141414] bg-[#0c0c0c] overflow-hidden hover:border-[#262626] transition-colors"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={step.imageSrc}
                alt={step.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent/90 text-[#070707] font-mono text-xs font-medium">
                {step.number}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-sm text-white font-medium">{step.title}</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
