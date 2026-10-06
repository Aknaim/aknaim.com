"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";
import { siteData } from "@/lib/data";
import { getInterestHref } from "@/lib/utils";

interface WorkshopSceneProps {
  activeItems: InterestCategory[];
  dormantItems: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
}

export function WorkshopScene({
  activeItems,
  dormantItems,
  fallbackBySrc,
}: WorkshopSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(
    activeItems[0]?.id ?? null,
  );
  const [cupboardOpen, setCupboardOpen] = useState(false);

  const focused =
    activeItems.find((item) => item.id === hoveredId) ?? activeItems[0] ?? null;

  const { personal } = siteData;
  const categoryLine = [
    ...activeItems.map((item) => item.label.toUpperCase()),
    ...dormantItems.map((item) => item.label.toUpperCase()),
  ].join(" / ");

  return (
    <section className="workshop-scene" aria-label="Workshop">
      <div className="workshop-scene-stage">
        <Image
          src="/images/hero/workshop-scene.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="workshop-scene-photo"
        />
        <div className="workshop-scene-veil" aria-hidden />
      </div>

      <div className="workshop-scene-content">
        {/* Left copy — matches reference overlay */}
        <div className="workshop-hero-copy">
          <p className="text-tab text-[#d4c4a8]">{categoryLine}</p>
          <h1 className="workshop-hero-title">
            The gear.{" "}
            <em className="text-accent not-italic italic">The worlds.</em>
          </h1>
          <p className="workshop-hero-bio">
            {personal.bio}
          </p>
          <p className="workshop-hero-cta">Open a kit to explore →</p>
        </div>

        {/* Cupboard hotspot — right rear of scene */}
        <div
          className={`workshop-cupboard-hotspot ${cupboardOpen ? "is-open" : ""}`}
          onMouseEnter={() => setCupboardOpen(true)}
          onMouseLeave={() => setCupboardOpen(false)}
          onFocusCapture={() => setCupboardOpen(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setCupboardOpen(false);
            }
          }}
        >
          <p className="workshop-cupboard-hint" aria-hidden={!cupboardOpen}>
            Stowed gear
          </p>
          <div
            className="workshop-cupboard-shelf"
            aria-hidden={!cupboardOpen}
            {...(!cupboardOpen ? { inert: true } : {})}
          >
            <ul className="grid grid-cols-2 gap-2">
              {dormantItems.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <li key={item.id}>
                    <Link
                      href={getInterestHref(item.id)}
                      className="flex items-center gap-2 rounded-card border border-[#4a4034]/80 bg-[#1a1612]/90 p-2 transition-colors hover:border-accent/40"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-image border border-[#2a241c]">
                        <AssetImage
                          src={item.bagImage}
                          alt=""
                          icon={item.icon}
                          forceFallback={fallbackBySrc[item.bagImage] ?? false}
                          fill
                          sizes="40px"
                          fallbackVariant="cupboard"
                          fallbackMuted
                          imageClassName="object-cover grayscale brightness-90"
                        />
                      </div>
                      <span className="flex min-w-0 items-center gap-1">
                        <Icon
                          className="h-3 w-3 shrink-0 text-accent/80"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <span className="truncate text-[10px] uppercase tracking-wider text-[#e8e0d4]">
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Desk strip — bags sit on the photographed tabletop */}
        <div className="workshop-desk-strip">
          <p className="mb-4 text-meta text-[#d4c4a8]/90">
            {personal.bagPeekHint}
          </p>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-8">
            <ul className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
              {activeItems.map((item) => (
                <DeskBag
                  key={item.id}
                  item={item}
                  isActive={item.id === focused?.id}
                  bagFallback={fallbackBySrc[item.bagImage] ?? false}
                  onEnter={() => setHoveredId(item.id)}
                />
              ))}
            </ul>

            {focused ? (
              <Link
                href={getInterestHref(focused.id)}
                className="group/peek block w-full shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent lg:w-[min(100%,22rem)]"
              >
                <PeekCard
                  item={focused}
                  peekFallback={fallbackBySrc[focused.peekImage] ?? false}
                />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeskBag({
  item,
  isActive,
  bagFallback,
  onEnter,
}: {
  item: InterestCategory;
  isActive: boolean;
  bagFallback: boolean;
  onEnter: () => void;
}) {
  const Icon = getIcon(item.icon);

  return (
    <li>
      <Link
        href={getInterestHref(item.id)}
        onMouseEnter={onEnter}
        onFocus={onEnter}
        aria-label={`Open ${item.label}`}
        className={`group relative flex flex-col outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-accent ${
          isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
        }`}
      >
        <div
          className={`relative aspect-[3/4] overflow-hidden rounded-sm border shadow-[0_18px_40px_rgba(0,0,0,0.55)] ${
            isActive
              ? "border-accent/60 ring-1 ring-accent/30"
              : "border-[#5a4e40]/70"
          }`}
        >
          <AssetImage
            src={item.bagImage}
            alt={`${item.label} kit`}
            icon={item.icon}
            forceFallback={bagFallback}
            fill
            sizes="(max-width: 640px) 45vw, 16vw"
            fallbackVariant="bag"
            imageClassName="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div
            className={`pointer-events-none absolute inset-0 ${
              isActive
                ? "bg-linear-to-t from-black/40 via-transparent to-accent/10"
                : "bg-black/10"
            }`}
            aria-hidden
          />
        </div>
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          <Icon
            className={`h-3 w-3 ${isActive ? "text-accent" : "text-[#d4c4a8]"}`}
            strokeWidth={1.5}
            aria-hidden
          />
          <span
            className={`text-[10px] font-medium uppercase tracking-[0.14em] ${
              isActive ? "text-accent" : "text-[#d4c4a8]"
            }`}
          >
            {item.label}
          </span>
        </div>
      </Link>
    </li>
  );
}

function PeekCard({
  item,
  peekFallback,
}: {
  item: InterestCategory;
  peekFallback: boolean;
}) {
  return (
    <article className="peek-frame peek-frame-enter overflow-hidden rounded-sm border border-accent/35 bg-[#1a1612]/92 shadow-[0_20px_48px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="relative aspect-[16/11] w-full">
        <AssetImage
          src={item.peekImage}
          alt={item.peekCaption}
          icon={item.icon}
          forceFallback={peekFallback}
          fill
          sizes="22rem"
          priority
          fallbackVariant="peek"
          imageClassName="object-cover transition-transform duration-500 group-hover/peek:scale-[1.03]"
        />
        <div className="peek-frame-glow" aria-hidden />
      </div>
      <div className="border-t border-accent/20 px-4 py-3">
        <p className="text-tab text-accent">{item.label}</p>
        <p className="mt-1 line-clamp-2 text-body-sm text-[#f0ebe3]">
          {item.peekCaption}
        </p>
        <p className="mt-2 text-meta uppercase tracking-widest text-accent/90 group-hover/peek:text-accent">
          Enter →
        </p>
      </div>
    </article>
  );
}
