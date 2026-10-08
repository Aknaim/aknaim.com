export type InterestId =
  | "photography"
  | "climbing"
  | "cooking"
  | "travel"
  | "woodworking"
  | "chess"
  | "video-games";

export type NavItemId = "travel" | "notes" | "about";

export type SkillCategory =
  | "language"
  | "framework"
  | "tool"
  | "platform"
  | "cloud"
  | "soft";

export type SkillProficiency = "learning" | "comfortable" | "expert";

export type SocialPlatform =
  | "github"
  | "linkedin"
  | "email"
  | "twitter"
  | "other";

export type PhotographyTag = "all" | "landscapes" | "urban" | "wildlife";

export type ClimbingTag = "logbook" | "routes" | "lessons" | "gear";

export type CookingTag = "all" | "savoury" | "sweet";

export type TravelTag = "all" | "europe" | "asia";

export type WoodworkingTag = "projects" | "tools" | "lessons";

export type ChessTag = "peaks" | "games" | "profiles";

export type VideoGamesTag = "games" | "league" | "profiles";

export interface AboutCta {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
  icon: string;
}

export interface PersonalInfo {
  name: string;
  siteTitle: string;
  headlinePrefix: string;
  headlineEmphasis: string;
  headlineSuffix: string;
  bio: string;
  bagPeekHint: string;
  aboutCta: AboutCta;
  location: string;
  email: string;
  social: SocialLink[];
}

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  external: boolean;
}

export type ActivityStatus = "active" | "dormant";

export interface TabContentItem {
  id: string;
  title: string;
  meta: string;
  thumbnail?: string;
  linkUrl?: string;
}

export interface InterestTab {
  id: string;
  label: string; // e.g., "Logbook", "Gear", "Galleries"
  items: TabContentItem[];
}

export interface InterestCategory {
  id: InterestId;
  label: string;
  icon: string;
  status: ActivityStatus; // 'active' -> table, 'dormant' -> cupboard
  
  // Skeuomorphic Asset Maps
  bagImage: string;        // The closed bag/item image
  peekImage: string;       // The open/revealed internal contents image
  peekCaption: string;     // Contextual description of the gear inside
  
  // Shelf copy (workbench + cupboard)
  workbenchNote?: string; // Status note under the bag on either shelf
  lastActive?: string; // Optional season/date, e.g. "Fall 2024"
  panelAnchor: string;

  // New Fields for the Bento Inner Detail Page
  tagline: string;         // Under-the-hood subtitle text (e.g., "Capturing moments and chasing light")
  heroImage: string;       // The cinematic, atmospheric header background image
  tabs: InterestTab[];     // The dynamic rows and columns data array
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  icon: string;
  relatedProjectIds: string[];
}

export interface TabDefinition {
  id: string;
  label: string;
}

export interface BaseEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  href: string;
}

export interface PhotographyProject extends BaseEntry {
  category: "photography";
  tag: PhotographyTag;
  location: string;
  alt: string;
}

export interface ClimbingProject extends BaseEntry {
  category: "climbing";
  tag: ClimbingTag;
  grade: string;
  location: string;
  routeName: string;
  highlight: boolean;
}

export interface CookingProject extends BaseEntry {
  category: "cooking";
  tag: CookingTag;
  thumbnail: string;
  recipeType: string;
}

export interface TravelProject extends BaseEntry {
  category: "travel";
  tag: TravelTag;
  thumbnail: string;
  region: string;
  country: string;
}

export interface WoodworkingProject extends BaseEntry {
  category: "woodworking";
  tag: WoodworkingTag;
  featured: boolean;
  material: string;
}

export type Project =
  | PhotographyProject
  | ClimbingProject
  | CookingProject
  | TravelProject
  | WoodworkingProject;

export type SectionTabsMap = Record<InterestId, TabDefinition[]>;

export interface SiteData {
  personal: PersonalInfo;
  navigation: NavItem[];
  interests: InterestCategory[];
  skills: Skill[];
  projects: Project[];
  sectionTabs: SectionTabsMap;
}
