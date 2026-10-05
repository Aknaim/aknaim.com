import {
  CLIMB_COLOR_OPTIONS,
  GALLERY_GRADE_FILTER_OPTIONS,
} from "@/lib/climbing-grades";
import type { GalleryConfig } from "@/lib/types/gallery";

export const climbingGalleryConfig: GalleryConfig = {
  interest: "climbing",
  title: "Climbing Sessions",
  subtitle: "Gym and outdoor sends, attempts, and moments.",
  defaultSort: "date-desc",
  sortOptions: [
    { id: "date-desc", label: "Most Recent" },
    { id: "date-asc", label: "Oldest First" },
    { id: "grade-desc", label: "Hardest Grade" },
  ],
  filterGroups: [
    {
      id: "location",
      label: "Location",
      type: "list",
      paramKey: "location",
      allowAll: true,
      options: [
        { id: "climbers-rock", label: "Climbers Rock" },
        { id: "gravity", label: "Gravity" },
        { id: "the-hub", label: "The Hub" },
        { id: "outdoor", label: "Outdoor" },
      ],
    },
    {
      id: "type",
      label: "Type",
      type: "list",
      paramKey: "type",
      allowAll: true,
      options: [
        { id: "lead", label: "Lead" },
        { id: "bouldering", label: "Boulder" },
        { id: "top-rope", label: "Top Rope" },
      ],
    },
    {
      id: "result",
      label: "Result",
      type: "list",
      paramKey: "result",
      allowAll: true,
      options: [
        { id: "onsight", label: "Onsight" },
        { id: "flash", label: "Flash" },
        { id: "redpoint", label: "Redpoint" },
        { id: "send", label: "Send" },
        { id: "one-hang", label: "One hang" },
        { id: "project", label: "Project" },
      ],
    },
    {
      id: "color",
      label: "Color",
      type: "list",
      paramKey: "color",
      allowAll: true,
      options: CLIMB_COLOR_OPTIONS.filter((option) => option.id),
    },
    {
      id: "grade",
      label: "Grade",
      type: "select",
      paramKey: "grade",
      allowAll: true,
      options: GALLERY_GRADE_FILTER_OPTIONS,
    },
  ],
};

export { getClimbingGalleryHref } from "@/lib/db/queries/climbing";
