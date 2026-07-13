import type { GalleryConfig } from "@/lib/types/gallery";

export const climbingGalleryConfig: GalleryConfig = {
  interest: "climbing",
  title: "Climbing Sessions",
  subtitle: "All gym and outdoor sessions, sends, attempts, and moments.",
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
        { id: "home-gym", label: "Home Gym" },
        { id: "the-hive", label: "The Hive" },
        { id: "reach", label: "Reach Climbing" },
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
      id: "grade",
      label: "Grade",
      type: "select",
      paramKey: "grade",
      allowAll: true,
      options: [
        { id: "v4", label: "V4" },
        { id: "v5", label: "V5" },
        { id: "v6", label: "V6" },
        { id: "5-10", label: "5.10" },
        { id: "5-11", label: "5.11" },
        { id: "5-12", label: "5.12" },
      ],
    },
  ],
};

export { getClimbingGalleryHref } from "@/lib/db/queries/climbing";
