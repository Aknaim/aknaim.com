import { siteData } from "./data";
import type {
  InterestCategory,
  InterestId,
  Project,
  Skill,
  SkillCategory,
} from "../types";

export function getActiveInterests(): InterestCategory[] {
  return siteData.interests.filter((interest) => interest.status === "active");
}

export function getDormantInterests(): InterestCategory[] {
  return siteData.interests.filter((interest) => interest.status === "dormant");
}

const INTEREST_PAGE_HREF: Partial<Record<InterestId, string>> = {
  climbing: "/climbing",
  cooking: "/cooking",
  travel: "/travel",
};

export function getInterestHref(interestId: InterestId): string {
  return INTEREST_PAGE_HREF[interestId] ?? `/interests/${interestId}`;
}

export function getProjectsByCategory(category: InterestId): Project[] {
  return siteData.projects.filter((project) => project.category === category);
}

export function getProjectsByTag(
  category: InterestId,
  tagId: string,
): Project[] {
  const categoryProjects = getProjectsByCategory(category);

  if (tagId === "all") {
    return categoryProjects;
  }

  return categoryProjects.filter((project) => {
    if ("tag" in project) {
      return project.tag === tagId;
    }
    return false;
  });
}

export function getFeaturedProject(category: InterestId): Project | undefined {
  return getProjectsByCategory(category).find((project) => {
    if (project.category === "climbing") {
      return project.highlight;
    }
    if (project.category === "woodworking" || project.category === "engineering") {
      return project.featured;
    }
    return false;
  });
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return siteData.skills.filter((skill) => skill.category === category);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
