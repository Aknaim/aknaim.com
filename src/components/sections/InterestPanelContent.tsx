"use client";

import { useMemo, useState } from "react";
import type { InterestId, Project, TabDefinition } from "@/types";
import { TabList } from "@/components/ui/TabList";
import { ListRow } from "@/components/ui/ListRow";
import { ImageFrame } from "@/components/ui/ImageFrame";
interface InterestPanelContentProps {
  interestId: InterestId;
  label: string;
  icon: string;
  tabs: TabDefinition[];
  projects: Project[];
  defaultTabId: string;
  fallbackBySrc: Record<string, boolean>;
}

function shouldFallback(
  fallbackBySrc: Record<string, boolean>,
  src: string,
): boolean {
  return fallbackBySrc[src] ?? false;
}

export function InterestPanelContent({
  interestId,
  label,
  icon,
  tabs,
  projects,
  defaultTabId,
  fallbackBySrc,
}: InterestPanelContentProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId);

  const filtered = useMemo(() => {
    if (activeTab === "all") {
      return projects;
    }
    return projects.filter((project) => {
      if ("tag" in project) {
        return project.tag === activeTab;
      }
      return false;
    });
  }, [activeTab, projects]);

  return (
    <div className="flex h-full flex-col gap-5">
      <TabList tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
      <PanelBody
        interestId={interestId}
        label={label}
        icon={icon}
        projects={filtered}
        fallbackBySrc={fallbackBySrc}
      />
    </div>
  );
}

function PanelBody({
  interestId,
  label,
  icon,
  projects,
  fallbackBySrc,
}: {
  interestId: InterestId;
  label: string;
  icon: string;
  projects: Project[];
  fallbackBySrc: Record<string, boolean>;
}) {
  switch (interestId) {
    case "photography":
      return (
        <PhotographyBody
          projects={projects}
          label={label}
          icon={icon}
          fallbackBySrc={fallbackBySrc}
        />
      );
    case "climbing":
      return (
        <ClimbingBody
          projects={projects}
          icon={icon}
          fallbackBySrc={fallbackBySrc}
        />
      );
    case "cooking":
      return (
        <CookingBody
          projects={projects}
          icon={icon}
          fallbackBySrc={fallbackBySrc}
        />
      );
    case "travel":
      return (
        <TravelBody
          projects={projects}
          icon={icon}
          fallbackBySrc={fallbackBySrc}
        />
      );
    case "woodworking":
      return (
        <WoodworkingBody
          projects={projects}
          label={label}
          icon={icon}
          fallbackBySrc={fallbackBySrc}
        />
      );
    default:
      return null;
  }
}

function PhotographyBody({
  projects,
  label,
  icon,
  fallbackBySrc,
}: {
  projects: Project[];
  label: string;
  icon: string;
  fallbackBySrc: Record<string, boolean>;
}) {
  const gallery = projects.filter((p) => p.category === "photography");

  return (
    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
      {gallery.map((project) => (
        <ImageFrame
          key={project.id}
          src={project.image}
          alt={project.alt}
          icon={icon}
          forceFallback={shouldFallback(fallbackBySrc, project.image)}
          className="aspect-[4/3] min-h-[140px]"
        />
      ))}
      {gallery.length === 0 ? (
        <p className="text-body-sm text-foreground-subtle col-span-full">
          No {label.toLowerCase()} entries for this filter.
        </p>
      ) : null}
    </div>
  );
}

function ClimbingBody({
  projects,
  icon,
  fallbackBySrc,
}: {
  projects: Project[];
  icon: string;
  fallbackBySrc: Record<string, boolean>;
}) {
  const climbing = projects.filter((p) => p.category === "climbing");
  const highlight = climbing.find((p) => p.highlight);
  const logbook = climbing.filter((p) => !p.highlight);

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_1fr]">
      <ul className="flex flex-col gap-2">
        {logbook.map((entry) => (
          <li key={entry.id}>
            <ListRow
              title={entry.title}
              date={entry.date}
              href={entry.href}
              badge={entry.grade}
            />
          </li>
        ))}
      </ul>
      {highlight ? (
        <div className="flex flex-col gap-3 rounded-card border-default bg-surface-elevated p-4">
          <p className="text-tab text-accent">Session Highlight</p>
          <ImageFrame
            src={highlight.image}
            alt={highlight.title}
            icon={icon}
            forceFallback={shouldFallback(fallbackBySrc, highlight.image)}
            className="aspect-[4/3] min-h-[160px]"
          />
          <div>
            <p className="text-body-sm text-foreground">{highlight.title}</p>
            <p className="mt-1 text-meta leading-relaxed text-foreground-muted">
              {highlight.description}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CookingBody({
  projects,
  icon,
  fallbackBySrc,
}: {
  projects: Project[];
  icon: string;
  fallbackBySrc: Record<string, boolean>;
}) {
  const recipes = projects.filter((p) => p.category === "cooking");

  return (
    <ul className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <ListRow
            title={recipe.title}
            date={recipe.date}
            href={recipe.href}
            thumbnail={recipe.thumbnail}
            thumbnailIcon={icon}
            thumbnailFallback={shouldFallback(
              fallbackBySrc,
              recipe.thumbnail,
            )}
            badge={recipe.recipeType}
          />
        </li>
      ))}
    </ul>
  );
}

function TravelBody({
  projects,
  icon,
  fallbackBySrc,
}: {
  projects: Project[];
  icon: string;
  fallbackBySrc: Record<string, boolean>;
}) {
  const travel = projects.filter((p) => p.category === "travel");
  const mapEntry = travel.find((p) => p.id.includes("map"));
  const stories = travel.filter((p) => !p.id.includes("map"));

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_1fr]">
      <ul className="flex flex-col gap-2">
        {stories.map((story) => (
          <li key={story.id}>
            <ListRow
              title={story.title}
              date={story.date}
              href={story.href}
              thumbnail={story.thumbnail}
              thumbnailIcon={icon}
              thumbnailFallback={shouldFallback(
                fallbackBySrc,
                story.thumbnail,
              )}
              badge={story.country}
            />
          </li>
        ))}
      </ul>
      {mapEntry ? (
        <ImageFrame
          src={mapEntry.image}
          alt={mapEntry.title}
          icon={icon}
          forceFallback={shouldFallback(fallbackBySrc, mapEntry.image)}
          className="min-h-[200px] flex-1"
        />
      ) : null}
    </div>
  );
}

function WoodworkingBody({
  projects,
  label,
  icon,
  fallbackBySrc,
}: {
  projects: Project[];
  label: string;
  icon: string;
  fallbackBySrc: Record<string, boolean>;
}) {
  const wood = projects.filter((p) => p.category === "woodworking");
  const featured = wood.find((p) => p.featured) ?? wood[0];

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_1fr]">
      <ul className="flex flex-col gap-2">
        {wood.map((project) => (
          <li key={project.id}>
            <ListRow
              title={project.title}
              date={project.date}
              href={project.href}
              badge={project.material}
            />
          </li>
        ))}
      </ul>
      {featured ? (
        <ImageFrame
          src={featured.image}
          alt={`${label} featured project`}
          icon={icon}
          forceFallback={shouldFallback(fallbackBySrc, featured.image)}
          className="min-h-[220px]"
        />
      ) : null}
    </div>
  );
}

