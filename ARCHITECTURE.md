# aknaim.com — Architecture Blueprint

**Source:** `.design/layout-design.png`  
**Purpose:** Structural planning document only. Do not implement TSX until this blueprint is reviewed and approved.  
**Owner:** Akbar Naim  
**Stack:** Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, Lucide React

---

## Design Summary

Single-page portfolio with a dark craftsman aesthetic. Structure top-to-bottom:

1. **Site header** — Journal, Travel, Notes, About, theme toggle (sun icon).
2. **Hero** — Serif headline “The *world* of Akbar Naim”, bio, About Me CTA, six bag images with hover-to-peek interaction.
3. **Category navigation** — Pill buttons: Engineering, Photography, Climbing, Cooking, Travel, Woodworking.
4. **Bento grid** — Six content panels in a 2×3 grid on desktop; stacked on mobile.

---

## 1. Inferred Global Theme Data

All values below are **single canonical hex codes** inferred from the screenshot. Use these exactly in `src/app/globals.css` and Tailwind `@theme inline`.

### 1.1 Color palette (dark mode — default)

| Token name | CSS variable | Hex | RGB | Usage |
|------------|--------------|-----|-----|-------|
| `background` | `--color-background` | `#0A0A0A` | `rgb(10, 10, 10)` | Page canvas, `<body>` |
| `background-secondary` | `--color-background-secondary` | `#141414` | `rgb(20, 20, 20)` | Bento panel shells |
| `surface` | `--color-surface` | `#161616` | `rgb(22, 22, 22)` | Cards, list rows |
| `surface-elevated` | `--color-surface-elevated` | `#1E1E1E` | `rgb(30, 30, 30)` | Hover states, active tabs |
| `surface-hover` | `--color-surface-hover` | `#252525` | `rgb(37, 37, 37)` | Bag hover, pill hover |
| `foreground` | `--color-foreground` | `#E5E5E5` | `rgb(229, 229, 229)` | Primary text, nav links |
| `foreground-muted` | `--color-foreground-muted` | `#888888` | `rgb(136, 136, 136)` | Dates, captions, metadata |
| `foreground-subtle` | `--color-foreground-subtle` | `#6B6B6B` | `rgb(107, 107, 107)` | Disabled tabs, hints |
| `accent` | `--color-accent` | `#C5A059` | `rgb(197, 160, 89)` | Hero emphasis, icons, active pills/tabs |
| `accent-hover` | `--color-accent-hover` | `#D4B06A` | `rgb(212, 176, 106)` | Accent hover |
| `accent-muted` | `--color-accent-muted` | `#8A7344` | `rgb(138, 115, 68)` | Accent borders, secondary highlights |
| `border` | `--color-border` | `#262626` | `rgb(38, 38, 38)` | Card borders, grid dividers |
| `border-subtle` | `--color-border-subtle` | `#1A1A1A` | `rgb(26, 26, 26)` | Inner dividers |
| `overlay-start` | `--color-overlay-start` | `#000000` | `rgb(0, 0, 0)` | Image gradient (opaque) |
| `overlay-end` | `--color-overlay-end` | `transparent` | — | Image gradient (fade) |
| `scrim` | `--color-scrim` | `rgba(0, 0, 0, 0.65)` | — | Hero peek overlay |
| `focus-ring` | `--color-focus-ring` | `#C5A059` | `rgb(197, 160, 89)` | Keyboard focus outline |

### 1.2 Color palette (light mode — theme toggle)

| Token name | CSS variable | Hex | Usage |
|------------|--------------|-----|-------|
| `background` | `--color-background` | `#F5F2EB` | Light page canvas |
| `background-secondary` | `--color-background-secondary` | `#EDE8DD` | Light panels |
| `surface` | `--color-surface` | `#FFFFFF` | Light cards |
| `surface-elevated` | `--color-surface-elevated` | `#F0EBE0` | Light hover |
| `foreground` | `--color-foreground` | `#1A1A1A` | Light primary text |
| `foreground-muted` | `--color-foreground-muted` | `#5C5C5C` | Light secondary text |
| `foreground-subtle` | `--color-foreground-subtle` | `#8A8A8A` | Light tertiary text |
| `accent` | `--color-accent` | `#C5A059` | Unchanged brand gold |
| `accent-hover` | `--color-accent-hover` | `#A8863E` | Light-mode accent hover |
| `border` | `--color-border` | `#D4CFC4` | Light borders |

Accent gold `#C5A059` stays identical in both themes for brand consistency.

### 1.3 Typography

| Token | Font family | Google Font import | Weight | Style | Size | Line height | Letter-spacing | Usage |
|-------|-------------|-------------------|--------|-------|------|-------------|----------------|-------|
| `font-display` | Playfair Display | `Playfair_Display` | 400, 500, 600 | italic for emphasis | `clamp(2.5rem, 5vw, 4rem)` | 1.1 | `-0.02em` | Hero headline |
| `font-display-section` | Playfair Display | `Playfair_Display` | 500 | normal | `1.125rem` | 1.3 | `0.12em` | Section titles (uppercase in UI) |
| `font-sans` | Inter | `Inter` | 400, 500 | normal | `1rem` | 1.6 | `0` | Body, bio, nav |
| `font-sans-sm` | Inter | `Inter` | 400 | normal | `0.9375rem` | 1.5 | `0` | List titles |
| `font-mono` | Geist Mono | existing scaffold | 400 | normal | `0.75rem` | 1.4 | `0.04em` | Dates, logbook |
| `font-tab` | Inter | `Inter` | 500 | normal | `0.6875rem` | 1.2 | `0.08em` | Tab labels (uppercase) |

**Hero headline composition (from mockup):**

- Prefix: `The ` (foreground `#E5E5E5`, Playfair regular)
- Emphasis: `world` (accent `#C5A059`, Playfair italic)
- Suffix: ` of Akbar Naim` (foreground `#E5E5E5`, Playfair regular)

### 1.4 Spacing scale

| Token | CSS variable | Value | Tailwind equivalent | Usage |
|-------|--------------|-------|---------------------|-------|
| `space-page-x-sm` | `--space-page-x-sm` | `24px` | `px-6` | Mobile horizontal padding |
| `space-page-x-md` | `--space-page-x-md` | `48px` | `px-12` | Tablet horizontal padding |
| `space-page-x-lg` | `--space-page-x-lg` | `64px` | `px-16` | Desktop horizontal padding |
| `space-section-y` | `--space-section-y` | `48px` | `py-12` | Vertical section rhythm |
| `space-bento-gap` | `--space-bento-gap` | `16px` | `gap-4` | Gap between bento cells |
| `space-card-padding` | `--space-card-padding` | `20px` | `p-5` | Inner card padding |
| `space-card-padding-lg` | `--space-card-padding-lg` | `24px` | `p-6` | Large card padding |
| `space-list-gap` | `--space-list-gap` | `12px` | `gap-3` | Between list rows |
| `space-tab-gap` | `--space-tab-gap` | `24px` | `gap-6` | Between tab items |

### 1.5 Layout constants

| Token | Value | Usage |
|-------|-------|-------|
| `max-width-content` | `1400px` | `Container` max width |
| `radius-card` | `8px` | Bento panels, cards |
| `radius-image` | `6px` | Thumbnails, gallery |
| `radius-pill` | `9999px` | Category pills |
| `border-width-default` | `1px` | Card borders |
| `bento-columns` | `12` | CSS grid column count |
| `hero-bag-height` | `280px` | Bag strip image area |
| `panel-min-height` | `420px` | Minimum bento cell height |

### 1.6 Motion

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Bag peek crossfade | `250ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Opacity swap on hover |
| Tab active indicator | `200ms` | `ease-out` | Underline or color |
| Card image hover scale | `300ms` | `ease-out` | `transform: scale(1.02)` |
| Theme toggle | `150ms` | `ease-in-out` | Color token swap on `<html>` |
| Reduced motion | `0ms` | — | Honor `prefers-reduced-motion: reduce` |

### 1.7 Complete `globals.css` token block (implement in Phase 1)

```css
@import "tailwindcss";

:root {
  --color-background: #0A0A0A;
  --color-background-secondary: #141414;
  --color-surface: #161616;
  --color-surface-elevated: #1E1E1E;
  --color-surface-hover: #252525;
  --color-foreground: #E5E5E5;
  --color-foreground-muted: #888888;
  --color-foreground-subtle: #6B6B6B;
  --color-accent: #C5A059;
  --color-accent-hover: #D4B06A;
  --color-accent-muted: #8A7344;
  --color-border: #262626;
  --color-border-subtle: #1A1A1A;
  --color-scrim: rgba(0, 0, 0, 0.65);
  --color-focus-ring: #C5A059;
  --font-display: var(--font-playfair);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  --space-page-x: 24px;
  --space-bento-gap: 16px;
  --radius-card: 8px;
  --radius-pill: 9999px;
  --max-width-content: 1400px;
}

[data-theme="light"] {
  --color-background: #F5F2EB;
  --color-background-secondary: #EDE8DD;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #F0EBE0;
  --color-surface-hover: #E8E2D6;
  --color-foreground: #1A1A1A;
  --color-foreground-muted: #5C5C5C;
  --color-foreground-subtle: #8A8A8A;
  --color-border: #D4CFC4;
  --color-border-subtle: #E8E2D6;
}

@theme inline {
  --color-background: var(--color-background);
  --color-background-secondary: var(--color-background-secondary);
  --color-surface: var(--color-surface);
  --color-surface-elevated: var(--color-surface-elevated);
  --color-foreground: var(--color-foreground);
  --color-foreground-muted: var(--color-foreground-muted);
  --color-foreground-subtle: var(--color-foreground-subtle);
  --color-accent: var(--color-accent);
  --color-accent-hover: var(--color-accent-hover);
  --color-border: var(--color-border);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}
```

---

## 2. Component Hierarchy & Exact Folder Layout

### 2.1 Repository target tree (every file path)

```
aknaim.com/
├── .cursor/
│   └── rules/
│       └── architecture.mdc
├── .design/
│   └── layout-design.png
├── public/
│   ├── favicon.ico
│   └── images/
│       ├── hero/
│       │   ├── bags-row.jpg
│       │   ├── bag-peek-engineering.jpg
│       │   ├── bag-peek-photography.jpg
│       │   ├── bag-peek-climbing.jpg
│       │   ├── bag-peek-cooking.jpg
│       │   ├── bag-peek-travel.jpg
│       │   └── bag-peek-woodworking.jpg
│       ├── photography/
│       │   ├── landscape-01.jpg
│       │   ├── urban-01.jpg
│       │   └── wildlife-01.jpg
│       ├── climbing/
│       │   └── session-highlight.jpg
│       ├── cooking/
│       │   ├── sourdough.jpg
│       │   ├── tagine.jpg
│       │   └── matcha.jpg
│       ├── travel/
│       │   ├── italy-map.jpg
│       │   ├── story-01.jpg
│       │   ├── story-02.jpg
│       │   ├── story-03.jpg
│       │   └── story-04.jpg
│       ├── woodworking/
│       │   └── featured-project.jpg
│       └── engineering/
│           └── system-diagram.jpg
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── journal/
│   │   │   └── page.tsx
│   │   └── notes/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── GridCell.tsx
│   │   │   ├── Heading.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── ImageFrame.tsx
│   │   │   ├── ListRow.tsx
│   │   │   ├── NavLink.tsx
│   │   │   ├── Pill.tsx
│   │   │   ├── SectionLabel.tsx
│   │   │   ├── Tab.tsx
│   │   │   ├── TabList.tsx
│   │   │   ├── Text.tsx
│   │   │   └── index.ts
│   │   └── sections/
│   │       ├── BagStrip.tsx
│   │       ├── BentoGrid.tsx
│   │       ├── CategoryNav.tsx
│   │       ├── ClimbingPanel.tsx
│   │       ├── CookingPanel.tsx
│   │       ├── EngineeringPanel.tsx
│   │       ├── Hero.tsx
│   │       ├── PhotographyPanel.tsx
│   │       ├── SiteFooter.tsx
│   │       ├── SiteHeader.tsx
│   │       ├── TravelPanel.tsx
│   │       ├── WoodworkingPanel.tsx
│   │       └── index.ts
│   └── lib/
│       ├── constants.ts
│       ├── data.ts
│       ├── types.ts
│       └── utils.ts
├── ARCHITECTURE.md
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

### 2.2 Migration mapping (current repo → target)

| Current path | Action | Target path |
|--------------|--------|-------------|
| `app/layout.tsx` | Move | `src/app/layout.tsx` |
| `app/page.tsx` | Move + replace content | `src/app/page.tsx` |
| `app/globals.css` | Move + replace tokens | `src/app/globals.css` |
| `app/favicon.ico` | Move | `src/app/favicon.ico` |
| `public/*` | Keep | `public/*` (add `images/` subfolders) |
| (none) | Create | `src/components/ui/*.tsx` |
| (none) | Create | `src/components/sections/*.tsx` |
| (none) | Create | `src/lib/types.ts` |
| (none) | Create | `src/lib/data.ts` |
| (none) | Create | `src/lib/constants.ts` |
| (none) | Create | `src/lib/utils.ts` |

### 2.3 `src/components/ui/` — atomic components

| File | Export | Props / behavior | `'use client'` |
|------|--------|------------------|----------------|
| `Container.tsx` | `Container` | `children`, `className?`; max-width `1400px`, responsive `px` | No |
| `Heading.tsx` | `Heading` | `variant: 'hero' \| 'section' \| 'card'`, `children`, `className?` | No |
| `Text.tsx` | `Text` | `variant: 'body' \| 'muted' \| 'caption'`, `children` | No |
| `SectionLabel.tsx` | `SectionLabel` | `label: string`, `icon?: LucideIcon` | No |
| `Button.tsx` | `Button` | `variant: 'primary' \| 'ghost'`, `href?`, `onClick?`, `showArrow?: boolean` | Only if `onClick` without `href` |
| `NavLink.tsx` | `NavLink` | `href`, `label`, `isActive?` | No |
| `Pill.tsx` | `Pill` | `label`, `icon?`, `isActive?`, `href?`, `onClick?` | Yes when `onClick` |
| `TabList.tsx` | `TabList` | `tabs`, `activeId`, `onChange` | Yes |
| `Tab.tsx` | `Tab` | Internal to `TabList` | Yes |
| `Card.tsx` | `Card` | `children`, `className?`; bg `#161616`, border `#262626` | No |
| `ListRow.tsx` | `ListRow` | `date`, `title`, `href?`, `thumbnail?`, `badge?` | No |
| `Badge.tsx` | `Badge` | `label: string` | No |
| `ImageFrame.tsx` | `ImageFrame` | `src`, `alt`, `aspectRatio`, `priority?`, `scrim?` | No |
| `IconButton.tsx` | `IconButton` | `icon`, `label` (aria), `onClick` | Yes |
| `Divider.tsx` | `Divider` | `className?` | No |
| `GridCell.tsx` | `GridCell` | `colSpan`, `rowSpan?`, `children` | No |
| `index.ts` | barrel re-exports | — | — |

### 2.4 `src/components/sections/` — page compositions

| File | Export | Composes | `'use client'` |
|------|--------|----------|----------------|
| `SiteHeader.tsx` | `SiteHeader` | `Container`, `NavLink`, `IconButton` (theme) | Yes (theme toggle) |
| `Hero.tsx` | `Hero` | `Heading`, `Text`, `Button`, `BagStrip` | No |
| `BagStrip.tsx` | `BagStrip` | Reads `interests` from data; bag images + peek | Yes (hover state) |
| `CategoryNav.tsx` | `CategoryNav` | `Pill` for each `InterestCategory` | Yes (scroll-spy optional) |
| `BentoGrid.tsx` | `BentoGrid` | CSS grid wrapper for all panels | No |
| `PhotographyPanel.tsx` | `PhotographyPanel` | `SectionLabel`, `TabList`, 3× `ImageFrame` | Yes (tab filter) |
| `ClimbingPanel.tsx` | `ClimbingPanel` | `TabList`, `ListRow`, highlight `Card` | Yes (tab filter) |
| `CookingPanel.tsx` | `CookingPanel` | `TabList`, `ListRow` with thumbnails | Yes (tab filter) |
| `TravelPanel.tsx` | `TravelPanel` | `TabList`, `ListRow`, map `ImageFrame` | Yes (tab filter) |
| `WoodworkingPanel.tsx` | `WoodworkingPanel` | `TabList`, `ListRow`, featured `ImageFrame` | Yes (tab filter) |
| `EngineeringPanel.tsx` | `EngineeringPanel` | `TabList`, `ListRow`, diagram `ImageFrame`, skills list | Yes (tab filter) |
| `SiteFooter.tsx` | `SiteFooter` | `Text` muted copyright | No |
| `index.ts` | barrel re-exports | — | — |

### 2.5 `src/app/` — routes

| File | Responsibility |
|------|----------------|
| `layout.tsx` | `Playfair_Display`, `Inter`, `Geist_Mono` via `next/font/google`; `<html lang="en" data-theme="dark">`; wrap with `SiteHeader`; export `metadata` |
| `page.tsx` | Server page: `<main><Hero /><CategoryNav /><BentoGrid /></main>` |
| `globals.css` | Tokens from §1.7 |
| `about/page.tsx` | Extended bio + full skills list (Phase 7) |
| `journal/page.tsx` | Placeholder “Coming soon” (Phase 7) |
| `notes/page.tsx` | Placeholder “Coming soon” (Phase 7) |

### 2.6 `src/lib/` — data and utilities

| File | Responsibility |
|------|----------------|
| `types.ts` | All TypeScript interfaces and union types (§3.1) |
| `constants.ts` | `SECTION_TABS`, `NAV_ITEMS`, `INTEREST_ORDER`, icon name map |
| `data.ts` | `siteData` constant implementing `SiteData` (§3.2) |
| `utils.ts` | `formatDate`, `getProjectsByCategory`, `getProjectsByTag`, `getFeaturedProject`, `getSkillsByCategory` |

---

## 3. Skills & Data Structure

### 3.1 Complete TypeScript types (`src/lib/types.ts`)

```typescript
export type InterestId =
  | "engineering"
  | "photography"
  | "climbing"
  | "cooking"
  | "travel"
  | "woodworking";

export type NavItemId = "journal" | "travel" | "notes" | "about";

export type SkillCategory =
  | "language"
  | "framework"
  | "tool"
  | "platform"
  | "cloud"
  | "soft";

export type SkillProficiency = "learning" | "comfortable" | "expert";

export type PhotographyTag = "all" | "landscapes" | "urban" | "wildlife";

export type ClimbingTag = "logbook" | "routes" | "lessons" | "gear";

export type CookingTag = "all" | "savoury" | "sweet";

export type TravelTag = "all" | "europe" | "asia";

export type WoodworkingTag = "projects" | "tools" | "lessons";

export type EngineeringTag = "projects" | "system-design" | "docs";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  external: boolean;
}

export interface SocialLink {
  platform: "github" | "linkedin" | "email" | "twitter" | "other";
  label: string;
  url: string;
  icon: string;
}

export interface AboutCta {
  label: string;
  href: string;
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

export interface InterestCategory {
  id: InterestId;
  label: string;
  icon: string;
  bagImage: string;
  peekImage: string;
  peekCaption: string;
  panelAnchor: string;
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

export interface EngineeringProject extends BaseEntry {
  category: "engineering";
  tag: EngineeringTag;
  stack: string[];
  diagramImage: string;
  featured: boolean;
  repositoryUrl: string;
}

export type Project =
  | PhotographyProject
  | ClimbingProject
  | CookingProject
  | TravelProject
  | WoodworkingProject
  | EngineeringProject;

export type SectionTabsMap = Record<InterestId, TabDefinition[]>;

export interface SiteData {
  personal: PersonalInfo;
  navigation: NavItem[];
  interests: InterestCategory[];
  skills: Skill[];
  projects: Project[];
  sectionTabs: SectionTabsMap;
}
```

### 3.2 Complete `siteData` specification (`src/lib/data.ts`)

Copy this object verbatim when implementing Phase 2. All strings are taken from or aligned with the layout mockup.

```typescript
import type { SiteData } from "./types";

export const siteData: SiteData = {
  personal: {
    name: "Akbar Naim",
    siteTitle: "Akbar Naim — Portfolio",
    headlinePrefix: "The ",
    headlineEmphasis: "world",
    headlineSuffix: " of Akbar Naim",
    bio: "Building systems. Exploring the world. Living with intention.",
    bagPeekHint: "Hover over a bag to peek inside.",
    aboutCta: {
      label: "About Me",
      href: "/about",
    },
    location: "United States",
    email: "hello@aknaim.com",
    social: [
      {
        platform: "github",
        label: "GitHub",
        url: "https://github.com/aknaim",
        icon: "Github",
      },
      {
        platform: "linkedin",
        label: "LinkedIn",
        url: "https://linkedin.com/in/aknaim",
        icon: "Linkedin",
      },
      {
        platform: "email",
        label: "Email",
        url: "mailto:hello@aknaim.com",
        icon: "Mail",
      },
    ],
  },

  navigation: [
    {
      id: "journal",
      label: "Journal",
      href: "/journal",
      external: false,
    },
    {
      id: "travel",
      label: "Travel",
      href: "#travel",
      external: false,
    },
    {
      id: "notes",
      label: "Notes",
      href: "/notes",
      external: false,
    },
    {
      id: "about",
      label: "About",
      href: "/about",
      external: false,
    },
  ],

  interests: [
    {
      id: "engineering",
      label: "Engineering",
      icon: "Cpu",
      bagImage: "/images/hero/bags-row.jpg",
      peekImage: "/images/hero/bag-peek-engineering.jpg",
      peekCaption: "Laptop, notebook, and architecture sketches.",
      panelAnchor: "engineering",
    },
    {
      id: "photography",
      label: "Photography",
      icon: "Camera",
      bagImage: "/images/hero/bags-row.jpg",
      peekImage: "/images/hero/bag-peek-photography.jpg",
      peekCaption: "Camera body, lenses, and field notes.",
      panelAnchor: "photography",
    },
    {
      id: "climbing",
      label: "Climbing",
      icon: "Mountain",
      bagImage: "/images/hero/bags-row.jpg",
      peekImage: "/images/hero/bag-peek-climbing.jpg",
      peekCaption: "Harness, shoes, chalk, and guidebook.",
      panelAnchor: "climbing",
    },
    {
      id: "cooking",
      label: "Cooking",
      icon: "ChefHat",
      bagImage: "/images/hero/bags-row.jpg",
      peekImage: "/images/hero/bag-peek-cooking.jpg",
      peekCaption: "Knives, spices, and a well-worn apron.",
      panelAnchor: "cooking",
    },
    {
      id: "travel",
      label: "Travel",
      icon: "Plane",
      bagImage: "/images/hero/bags-row.jpg",
      peekImage: "/images/hero/bag-peek-travel.jpg",
      peekCaption: "Passport, maps, and a folded journal.",
      panelAnchor: "travel",
    },
    {
      id: "woodworking",
      label: "Woodworking",
      icon: "Hammer",
      bagImage: "/images/hero/bags-row.jpg",
      peekImage: "/images/hero/bag-peek-woodworking.jpg",
      peekCaption: "Hand planes, chisels, and measuring tools.",
      panelAnchor: "woodworking",
    },
  ],

  skills: [
    {
      id: "skill-typescript",
      name: "TypeScript",
      category: "language",
      proficiency: "expert",
      icon: "FileCode",
      relatedProjectIds: ["eng-portfolio", "eng-api-gateway"],
    },
    {
      id: "skill-python",
      name: "Python",
      category: "language",
      proficiency: "comfortable",
      icon: "FileCode",
      relatedProjectIds: ["eng-data-pipeline"],
    },
    {
      id: "skill-react",
      name: "React",
      category: "framework",
      proficiency: "expert",
      icon: "Layers",
      relatedProjectIds: ["eng-portfolio"],
    },
    {
      id: "skill-nextjs",
      name: "Next.js",
      category: "framework",
      proficiency: "expert",
      icon: "Layers",
      relatedProjectIds: ["eng-portfolio"],
    },
    {
      id: "skill-node",
      name: "Node.js",
      category: "platform",
      proficiency: "comfortable",
      icon: "Server",
      relatedProjectIds: ["eng-api-gateway"],
    },
    {
      id: "skill-postgres",
      name: "PostgreSQL",
      category: "tool",
      proficiency: "comfortable",
      icon: "Database",
      relatedProjectIds: ["eng-data-pipeline"],
    },
    {
      id: "skill-docker",
      name: "Docker",
      category: "tool",
      proficiency: "comfortable",
      icon: "Box",
      relatedProjectIds: ["eng-api-gateway"],
    },
    {
      id: "skill-aws",
      name: "AWS",
      category: "cloud",
      proficiency: "comfortable",
      icon: "Cloud",
      relatedProjectIds: ["eng-data-pipeline", "eng-api-gateway"],
    },
    {
      id: "skill-terraform",
      name: "Terraform",
      category: "cloud",
      proficiency: "learning",
      icon: "CloudCog",
      relatedProjectIds: ["eng-infra-automation"],
    },
    {
      id: "skill-system-design",
      name: "System Design",
      category: "soft",
      proficiency: "expert",
      icon: "Network",
      relatedProjectIds: [
        "eng-api-gateway",
        "eng-data-pipeline",
        "eng-infra-automation",
      ],
    },
  ],

  projects: [
    {
      id: "photo-landscape-01",
      category: "photography",
      tag: "landscapes",
      title: "Dawn over the ridge",
      date: "2024-05-12",
      description: "Golden-hour landscape from a weekend hike.",
      image: "/images/photography/landscape-01.jpg",
      href: "/photography/dawn-over-the-ridge",
      location: "Colorado, USA",
      alt: "Mountain ridge at sunrise with low clouds",
    },
    {
      id: "photo-urban-01",
      category: "photography",
      tag: "urban",
      title: "Alley geometry",
      date: "2024-03-08",
      description: "Urban lines and shadow play between buildings.",
      image: "/images/photography/urban-01.jpg",
      href: "/photography/alley-geometry",
      location: "Chicago, USA",
      alt: "Narrow urban alley with strong perspective lines",
    },
    {
      id: "photo-wildlife-01",
      category: "photography",
      tag: "wildlife",
      title: "Heron at the marsh",
      date: "2024-01-22",
      description: "Long lens capture at wetland preserve.",
      image: "/images/photography/wildlife-01.jpg",
      href: "/photography/heron-at-the-marsh",
      location: "Wisconsin, USA",
      alt: "Great blue heron standing in shallow marsh water",
    },

    {
      id: "climb-log-01",
      category: "climbing",
      tag: "logbook",
      title: "The Nose — partial ascent",
      date: "2024-04-18",
      description: "Multi-pitch trad day on iconic granite.",
      image: "/images/climbing/session-highlight.jpg",
      href: "/climbing/the-nose-partial",
      grade: "5.9 C2",
      location: "Yosemite, CA",
      routeName: "The Nose",
      highlight: false,
    },
    {
      id: "climb-log-02",
      category: "climbing",
      tag: "logbook",
      title: "Midnight Lightning",
      date: "2024-02-03",
      description: "Classic boulder problem in Camp 4.",
      image: "/images/climbing/session-highlight.jpg",
      href: "/climbing/midnight-lightning",
      grade: "V8",
      location: "Yosemite, CA",
      routeName: "Midnight Lightning",
      highlight: false,
    },
    {
      id: "climb-log-03",
      category: "climbing",
      tag: "logbook",
      title: "Epicenter",
      date: "2023-11-15",
      description: "Overhanging sport route with technical crux.",
      image: "/images/climbing/session-highlight.jpg",
      href: "/climbing/epicenter",
      grade: "5.12a",
      location: "Smith Rock, OR",
      routeName: "Epicenter",
      highlight: false,
    },
    {
      id: "climb-log-04",
      category: "climbing",
      tag: "logbook",
      title: "Outer Limits",
      date: "2023-09-02",
      description: "Steep pocket climbing on quality stone.",
      image: "/images/climbing/session-highlight.jpg",
      href: "/climbing/outer-limits",
      grade: "5.11d",
      location: "Red River Gorge, KY",
      routeName: "Outer Limits",
      highlight: false,
    },
    {
      id: "climb-highlight-01",
      category: "climbing",
      tag: "logbook",
      title: "Session Highlight — Pitch 3",
      date: "2024-04-18",
      description: "Clean send on the crux pitch before rain moved in.",
      image: "/images/climbing/session-highlight.jpg",
      href: "/climbing/session-highlight-pitch-3",
      grade: "5.10c",
      location: "Yosemite, CA",
      routeName: "The Nose — Pitch 3",
      highlight: true,
    },

    {
      id: "cook-sourdough",
      category: "cooking",
      tag: "savoury",
      title: "Sourdough boule",
      date: "2024-05-05",
      description: "75% hydration, overnight cold proof, cast-iron bake.",
      image: "/images/cooking/sourdough.jpg",
      href: "/cooking/sourdough-boule",
      thumbnail: "/images/cooking/sourdough.jpg",
      recipeType: "Bread",
    },
    {
      id: "cook-tagine",
      category: "cooking",
      tag: "savoury",
      title: "Lamb tagine",
      date: "2024-03-20",
      description: "Slow-braised with apricots, almonds, and ras el hanout.",
      image: "/images/cooking/tagine.jpg",
      href: "/cooking/lamb-tagine",
      thumbnail: "/images/cooking/tagine.jpg",
      recipeType: "Main",
    },
    {
      id: "cook-matcha",
      category: "cooking",
      tag: "sweet",
      title: "Matcha tiramisu",
      date: "2024-02-14",
      description: "Layered mascarpone cream with ceremonial-grade matcha.",
      image: "/images/cooking/matcha.jpg",
      href: "/cooking/matcha-tiramisu",
      thumbnail: "/images/cooking/matcha.jpg",
      recipeType: "Dessert",
    },

    {
      id: "travel-story-01",
      category: "travel",
      tag: "europe",
      title: "Amalfi coast by ferry",
      date: "2024-06-10",
      description: "Coastal towns, lemon groves, and late dinners in Positano.",
      image: "/images/travel/story-01.jpg",
      href: "/travel/amalfi-coast",
      thumbnail: "/images/travel/story-01.jpg",
      region: "Campania",
      country: "Italy",
    },
    {
      id: "travel-story-02",
      category: "travel",
      tag: "europe",
      title: "Kyoto temple walk",
      date: "2023-10-18",
      description: "Autumn maples and early-morning meditation paths.",
      image: "/images/travel/story-02.jpg",
      href: "/travel/kyoto-temple-walk",
      thumbnail: "/images/travel/story-02.jpg",
      region: "Kansai",
      country: "Japan",
    },
    {
      id: "travel-story-03",
      category: "travel",
      tag: "asia",
      title: "Hanoi street food circuit",
      date: "2023-07-04",
      description: "Pho, bún chả, and coffee on plastic stools.",
      image: "/images/travel/story-03.jpg",
      href: "/travel/hanoi-street-food",
      thumbnail: "/images/travel/story-03.jpg",
      region: "Red River Delta",
      country: "Vietnam",
    },
    {
      id: "travel-story-04",
      category: "travel",
      tag: "europe",
      title: "Iceland ring road — segment 3",
      date: "2022-08-22",
      description: "Waterfalls, black sand, and midnight sun drives.",
      image: "/images/travel/story-04.jpg",
      href: "/travel/iceland-ring-road",
      thumbnail: "/images/travel/story-04.jpg",
      region: "South Coast",
      country: "Iceland",
    },
    {
      id: "travel-map-italy",
      category: "travel",
      tag: "europe",
      title: "Italy — travel map",
      date: "2024-06-10",
      description: "Static map visual highlighting coastal route.",
      image: "/images/travel/italy-map.jpg",
      href: "/travel/italy-map",
      thumbnail: "/images/travel/italy-map.jpg",
      region: "Italy",
      country: "Italy",
    },

    {
      id: "wood-project-01",
      category: "woodworking",
      tag: "projects",
      title: "Walnut dining table",
      date: "2024-01-10",
      description: "Breadboard ends, hand-cut joinery, oil finish.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/walnut-dining-table",
      featured: true,
      material: "American walnut",
    },
    {
      id: "wood-project-02",
      category: "woodworking",
      tag: "projects",
      title: "Maple wall shelf",
      date: "2023-09-14",
      description: "Floating shelf with concealed brass pins.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/maple-wall-shelf",
      featured: false,
      material: "Hard maple",
    },
    {
      id: "wood-project-03",
      category: "woodworking",
      tag: "projects",
      title: "Cherry keepsake box",
      date: "2023-05-02",
      description: "Dovetail corners and suede-lined interior.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/cherry-keepsake-box",
      featured: false,
      material: "Cherry",
    },
    {
      id: "wood-project-04",
      category: "woodworking",
      tag: "projects",
      title: "Ash workbench top",
      date: "2022-11-28",
      description: "Laminated top with dog holes and vise retrofit.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/ash-workbench-top",
      featured: false,
      material: "Ash",
    },

    {
      id: "eng-portfolio",
      category: "engineering",
      tag: "projects",
      title: "aknaim.com",
      date: "2026-05-22",
      description: "Personal portfolio built with Next.js App Router and Tailwind v4.",
      image: "/images/engineering/system-diagram.jpg",
      href: "https://github.com/aknaim/aknaim.com",
      stack: ["Next.js", "TypeScript", "Tailwind CSS"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: true,
      repositoryUrl: "https://github.com/aknaim/aknaim.com",
    },
    {
      id: "eng-api-gateway",
      category: "engineering",
      tag: "system-design",
      title: "API gateway service",
      date: "2024-08-01",
      description: "Rate-limited edge gateway with JWT validation and observability.",
      image: "/images/engineering/system-diagram.jpg",
      href: "/engineering/api-gateway",
      stack: ["Node.js", "Redis", "Docker", "AWS"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: false,
      repositoryUrl: "https://github.com/aknaim/api-gateway",
    },
    {
      id: "eng-data-pipeline",
      category: "engineering",
      tag: "system-design",
      title: "Event ingestion pipeline",
      date: "2024-02-15",
      description: "Batch and stream processing with idempotent writes to warehouse.",
      image: "/images/engineering/system-diagram.jpg",
      href: "/engineering/data-pipeline",
      stack: ["Python", "PostgreSQL", "S3", "Lambda"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: false,
      repositoryUrl: "https://github.com/aknaim/data-pipeline",
    },
    {
      id: "eng-infra-automation",
      category: "engineering",
      tag: "docs",
      title: "Infrastructure automation",
      date: "2023-12-01",
      description: "Terraform modules for reproducible staging and production environments.",
      image: "/images/engineering/system-diagram.jpg",
      href: "/engineering/infra-automation",
      stack: ["Terraform", "AWS", "GitHub Actions"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: false,
      repositoryUrl: "https://github.com/aknaim/infra-automation",
    },
  ],

  sectionTabs: {
    photography: [
      { id: "all", label: "ALL" },
      { id: "landscapes", label: "LANDSCAPES" },
      { id: "urban", label: "URBAN" },
      { id: "wildlife", label: "WILDLIFE" },
    ],
    climbing: [
      { id: "logbook", label: "LOGBOOK" },
      { id: "routes", label: "ROUTES" },
      { id: "lessons", label: "LESSONS" },
      { id: "gear", label: "GEAR" },
    ],
    cooking: [
      { id: "all", label: "ALL" },
      { id: "savoury", label: "SAVOURY" },
      { id: "sweet", label: "SWEET" },
    ],
    travel: [
      { id: "all", label: "ALL" },
      { id: "europe", label: "EUROPE" },
      { id: "asia", label: "ASIA" },
    ],
    woodworking: [
      { id: "projects", label: "PROJECTS" },
      { id: "tools", label: "TOOLS" },
      { id: "lessons", label: "LESSONS" },
    ],
    engineering: [
      { id: "projects", label: "PROJECTS" },
      { id: "system-design", label: "SYSTEM DESIGN" },
      { id: "docs", label: "DOCS" },
    ],
  },
};
```

### 3.3 Utility function signatures (`src/lib/utils.ts`)

```typescript
import type {
  InterestId,
  Project,
  Skill,
  SkillCategory,
} from "./types";
import { siteData } from "./data";

export function formatDate(isoDate: string): string {
  // "2024-05-05" → "May 5, 2024"
}

export function getProjectsByCategory(category: InterestId): Project[] {
  return siteData.projects.filter((p) => p.category === category);
}

export function getProjectsByTag(
  category: InterestId,
  tagId: string,
): Project[] {
  return getProjectsByCategory(category).filter((p) => {
    if ("tag" in p && tagId !== "all") {
      return p.tag === tagId;
    }
    return true;
  });
}

export function getFeaturedProject(category: InterestId): Project | undefined {
  return getProjectsByCategory(category).find((p) => {
    if (p.category === "climbing" && "highlight" in p) return p.highlight;
    if (p.category === "woodworking" && "featured" in p) return p.featured;
    if (p.category === "engineering" && "featured" in p) return p.featured;
    return false;
  });
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return siteData.skills.filter((s) => s.category === category);
}
```

### 3.4 Constants (`src/lib/constants.ts`)

```typescript
import type { InterestId } from "./types";

export const INTEREST_ORDER: InterestId[] = [
  "engineering",
  "photography",
  "climbing",
  "cooking",
  "travel",
  "woodworking",
];

export const BENTO_GRID_TEMPLATE = {
  desktop: `
    "photography photography photography photography climbing climbing climbing climbing"
    "cooking cooking cooking cooking travel travel travel travel"
    "woodworking woodworking woodworking woodworking engineering engineering engineering engineering"
  `,
  mobile: `
    "photography"
    "climbing"
    "cooking"
    "travel"
    "woodworking"
    "engineering"
  `,
} as const;
```

---

## 4. Nine-Phase Implementation Roadmap

### Phase 1 — Project structure, fonts, and design tokens

**Goal:** Align the repository with `src/` conventions and apply the exact color and typography tokens from §1.

**Tasks:**

1. Create directory `src/app/`, `src/components/ui/`, `src/components/sections/`, `src/lib/`.
2. Move `app/layout.tsx` → `src/app/layout.tsx`.
3. Move `app/page.tsx` → `src/app/page.tsx`.
4. Move `app/globals.css` → `src/app/globals.css` and replace contents with §1.7 token block.
5. Move `app/favicon.ico` → `src/app/favicon.ico`.
6. Delete empty root `app/` folder after migration.
7. Update `tsconfig.json` paths if needed so `@/*` resolves to `src/*`.
8. Run `npm install lucide-react`.
9. Configure fonts in `src/app/layout.tsx`:
   - `Playfair_Display` → CSS variable `--font-playfair`
   - `Inter` → CSS variable `--font-inter`
   - Keep `Geist_Mono` → `--font-geist-mono`
10. Set `<html lang="en" className="dark" data-theme="dark">` on root element.
11. Create `public/images/` subfolders listed in §2.1 (empty placeholders acceptable until assets arrive).
12. Verify `npm run dev` serves from `src/app` without errors.

**Exit criteria:** Dev server runs; page background is `#0A0A0A`; fonts load; no root `app/` folder remains.

---

### Phase 2 — Data layer (types, constants, data, utils)

**Goal:** Centralize all content before building UI.

**Tasks:**

1. Create `src/lib/types.ts` with every interface from §3.1.
2. Create `src/lib/constants.ts` with `INTEREST_ORDER` and `BENTO_GRID_TEMPLATE` from §3.4.
3. Create `src/lib/data.ts` exporting `siteData` exactly as §3.2.
4. Create `src/lib/utils.ts` implementing all four helper functions from §3.3.
5. Add unit-less smoke test: import `siteData` in `page.tsx` and `console.log` project counts during dev only, then remove.
6. Confirm strict TypeScript: zero `any`, zero type errors on `npm run build`.

**Exit criteria:** `siteData` compiles; `getProjectsByCategory("climbing")` returns 5 entries; `getFeaturedProject("climbing")` returns `climb-highlight-01`.

---

### Phase 3 — UI primitive components

**Goal:** Build the design system atoms using tokens `#0A0A0A`, `#E5E5E5`, `#C5A059`, `#262626`.

**Tasks:**

1. Implement `Container.tsx` — max-width `1400px`, padding `24px` / `48px` / `64px` breakpoints.
2. Implement `Heading.tsx` — variants map to Playfair sizes in §1.3.
3. Implement `Text.tsx` — body `#E5E5E5`, muted `#888888`, caption `0.75rem` mono dates.
4. Implement `Card.tsx` — background `#161616`, border `1px solid #262626`, radius `8px`.
5. Implement `Button.tsx` — primary fill `#C5A059`, text `#0A0A0A`, arrow icon from Lucide.
6. Implement `NavLink.tsx` — inactive `#888888`, active/hover `#E5E5E5`, underline accent `#C5A059`.
7. Implement `SectionLabel.tsx` — uppercase `0.6875rem`, letter-spacing `0.12em`, icon color `#C5A059`.
8. Implement `TabList.tsx` and `Tab.tsx` — active tab text `#C5A059`, inactive `#6B6B6B`.
9. Implement `Pill.tsx` — inactive bg `#161616`, active border `#C5A059`.
10. Implement `ListRow.tsx` — date in mono `#888888`, title `#E5E5E5`.
11. Implement `Badge.tsx` — bg `#1E1E1E`, text `#C5A059`.
12. Implement `ImageFrame.tsx` — `next/image`, optional bottom scrim gradient.
13. Implement `IconButton.tsx` — sun icon for theme, `aria-label="Toggle color theme"`.
14. Implement `Divider.tsx` — `1px solid #262626`.
15. Implement `GridCell.tsx` — accepts `colSpan` for bento grid.
16. Create barrel `src/components/ui/index.ts`.
17. Run accessibility contrast check: `#E5E5E5` on `#0A0A0A` (passes WCAG AA), `#888888` on `#0A0A0A` (passes for large text).

**Exit criteria:** Story-less visual check in a temporary `page.tsx` fragment renders all primitives correctly.

---

### Phase 4 — Site shell, header, hero, and bag interaction

**Goal:** Reproduce the top half of the mockup: nav, headline, bio, CTA, bags, category pills.

**Tasks:**

1. Implement `SiteHeader.tsx` — four `NavLink`s from `siteData.navigation`, `IconButton` theme toggle on right.
2. Wire theme toggle: toggle `data-theme` between `dark` and `light` on `<html>`, swap sun/moon Lucide icons.
3. Implement `Hero.tsx`:
   - Headline with `headlinePrefix`, `headlineEmphasis` (`#C5A059` italic), `headlineSuffix`
   - Bio string from `siteData.personal.bio`
   - `Button` linking to `/about`
4. Implement `BagStrip.tsx` (client):
   - Render six bag hotspots over `bags-row.jpg`
   - On hover, show `peekImage` and `peekCaption` with `250ms` crossfade
   - Display `bagPeekHint` below strip
5. Implement `CategoryNav.tsx` — six `Pill` components from `siteData.interests` in `INTEREST_ORDER`.
6. Update `src/app/layout.tsx` to render `SiteHeader` above `{children}`.
7. Update `src/app/page.tsx` to render `Hero` and `CategoryNav` only (bento deferred to Phase 5).
8. Set `metadata` title to `Akbar Naim` and description to bio string.

**Exit criteria:** Localhost matches mockup hero layout; bag hover reveals peek panel; theme toggle swaps `#0A0A0A` ↔ `#F5F2EB`.

---

### Phase 5 — Bento grid and static section panels

**Goal:** Render all six panels with real data, static active tabs (no filtering yet).

**Tasks:**

1. Implement `BentoGrid.tsx` — CSS grid, `gap: 16px`, desktop 2-column panel layout per §2.1 wireframe.
2. Implement `PhotographyPanel.tsx` — label PHOTOGRAPHY, tabs from `sectionTabs.photography`, three `ImageFrame` from photography projects.
3. Implement `ClimbingPanel.tsx` — tabs, four `ListRow` logbook entries, `Card` session highlight with `climb-highlight-01`.
4. Implement `CookingPanel.tsx` — tabs, three recipe `ListRow` with thumbnails.
5. Implement `TravelPanel.tsx` — tabs, four story `ListRow`, large `ImageFrame` for `travel-map-italy`.
6. Implement `WoodworkingPanel.tsx` — tabs, four project rows, featured image from `wood-project-01`.
7. Implement `EngineeringPanel.tsx` — tabs, four project rows, diagram `ImageFrame`, compact skills list (names only) from `siteData.skills`.
8. Add `id` anchors on each panel matching `panelAnchor` (`id="photography"`, etc.).
9. Wire `CategoryNav` pills to `scrollIntoView` matching panel anchor.
10. Compose full page: `Hero` → `CategoryNav` → `BentoGrid`.
11. Implement `SiteFooter.tsx` — `© 2026 Akbar Naim` in `#888888`.

**Exit criteria:** Full-page screenshot structurally matches `.design/layout-design.png` at 1440px width.

---

### Phase 6 — Interactivity, filtering, images, and responsive layout

**Goal:** Tabs filter content; images optimized; mobile layout polished.

**Tasks:**

1. Wire `TabList` `onChange` in each panel to filter via `getProjectsByTag`.
2. Default active tab per panel: `all` for photography/cooking/travel; `logbook` for climbing; `projects` for woodworking/engineering.
3. Replace `<img>` with `next/image` in all `ImageFrame` and `ListRow` thumbnails; set explicit `width`, `height`, `sizes`.
4. Add keyboard navigation: arrow keys switch tabs; Enter activates focused pill.
5. Add `focus-visible` ring `2px solid #C5A059` on interactive elements.
6. Mobile breakpoint `< 768px`: single-column bento stack per `BENTO_GRID_TEMPLATE.mobile`.
7. Mobile tabs: horizontal scroll container, no wrap.
8. Bag strip: stack peek overlay below bags on narrow screens.
9. Honor `prefers-reduced-motion: reduce` — disable scale and crossfade.
10. Photography panel: hide non-matching images when tab changes (opacity transition `200ms`).

**Exit criteria:** Each tab click shows only matching projects; Lighthouse accessibility ≥ 90.

---

### Phase 7 — Secondary routes, SEO, and metadata

**Goal:** Nav links resolve; SEO tags complete.

**Tasks:**

1. Create `src/app/about/page.tsx` — full bio, all skills grouped by `SkillCategory`, social links.
2. Create `src/app/journal/page.tsx` — minimal placeholder with link back home.
3. Create `src/app/notes/page.tsx` — minimal placeholder with link back home.
4. Update `metadata` in `layout.tsx`:
   - `title.default`: `Akbar Naim`
   - `description`: `Building systems. Exploring the world. Living with intention.`
   - `openGraph.images`: `/images/hero/bags-row.jpg`
5. Add `src/app/opengraph-image` or static OG asset in `public/`.
6. Add `src/app/robots.ts` exporting allow all.
7. Add `src/app/sitemap.ts` with `/`, `/about`, `/journal`, `/notes`.

**Exit criteria:** All nav hrefs return 200; OG tags validate in Twitter Card debugger.

---

### Phase 8 — Quality gates and performance

**Goal:** Production-ready build with no lint or type errors.

**Tasks:**

1. Run `npm run lint` — fix all ESLint errors.
2. Run `npm run build` — fix all TypeScript and Next.js build errors.
3. Run Lighthouse on `/` — targets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
4. Verify all images exist under `public/images/` or add temporary solid-color placeholders with correct paths.
5. Verify focus order: header → hero CTA → bags → pills → panels.
6. Test theme toggle persistence via `localStorage` key `theme` (optional enhancement).
7. Cross-browser manual test: Chrome, Firefox, Safari.
8. Validate HTML: one `<h1>` in hero, each panel has `<h2>` via `SectionLabel`.

**Exit criteria:** Clean build; Lighthouse thresholds met; no console errors in production build.

---

### Phase 9 — Deployment to production

**Goal:** Live site at `aknaim.com` on Vercel.

**Tasks:**

1. Initialize git repository if not present; push to GitHub remote `github.com/aknaim/aknaim.com`.
2. Import repository in Vercel dashboard.
3. Set framework preset: Next.js; Node.js version 20.x; build command `npm run build`; output default.
4. Add custom domain `aknaim.com` and `www.aknaim.com`; configure DNS A/CNAME per Vercel instructions.
5. Set production environment variable `NEXT_PUBLIC_SITE_URL=https://aknaim.com`.
6. Enable automatic deployments on push to `main`.
7. Enable preview deployments for pull requests.
8. After first deploy: verify fonts load from Google via `next/font`.
9. After first deploy: verify favicon, OG image, and HTTPS redirect.
10. Run post-deploy Lighthouse on production URL.
11. Submit sitemap to Google Search Console.

**Exit criteria:** `https://aknaim.com` serves the portfolio; all nav routes work; SSL active; preview deploys succeed on PR.

---

## Appendix A — Bento grid wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│  Journal   Travel   Notes   About                          [☀]   │
├──────────────────────────────────────────────────────────────────┤
│  The world of Akbar Naim                                         │
│  Building systems. Exploring the world. Living with intention.   │
│  [ About Me → ]                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  [bag][bag][bag][bag][bag][bag]  ← hover peek overlay      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Hover over a bag to peek inside.                                  │
│  [Engineering][Photography][Climbing][Cooking][Travel][Woodworking]│
├───────────────────────────────┬──────────────────────────────────┤
│  PHOTOGRAPHY                  │  CLIMBING                        │
│  ALL | LANDSCAPES | URBAN …   │  LOGBOOK | ROUTES | LESSONS …    │
│  [img] [img] [img]            │  [list rows]  | [Session Highlight]│
├───────────────────────────────┼──────────────────────────────────┤
│  COOKING                      │  TRAVEL                          │
│  ALL | SAVOURY | SWEET        │  ALL | EUROPE | ASIA              │
│  [recipe list + thumbs]       │  [story list]  | [Italy map img]  │
├───────────────────────────────┼──────────────────────────────────┤
│  WOODWORKING                  │  ENGINEERING                     │
│  PROJECTS | TOOLS | LESSONS   │  PROJECTS | SYSTEM DESIGN | DOCS │
│  [project list] | [featured]  │  [project list] | [diagram img]  │
└───────────────────────────────┴──────────────────────────────────┘
```

## Appendix B — Panel-to-data mapping

| Panel | `InterestId` | `sectionTabs` key | `getProjectsByCategory` count | Featured entry |
|-------|--------------|-------------------|-------------------------------|----------------|
| Photography | `photography` | `photography` | 3 | none (gallery) |
| Climbing | `climbing` | `climbing` | 5 | `climb-highlight-01` |
| Cooking | `cooking` | `cooking` | 3 | none |
| Travel | `travel` | `travel` | 5 | `travel-map-italy` (map visual) |
| Woodworking | `woodworking` | `woodworking` | 4 | `wood-project-01` |
| Engineering | `engineering` | `engineering` | 4 | `eng-portfolio` |

## Appendix C — Default decisions (locked for v1)

| Decision | v1 choice |
|----------|-----------|
| Skills visibility | Engineering panel list + full list on `/about` |
| Nav routes | Real routes for Journal, Notes, About; Travel links to `#travel` anchor |
| Light theme | Ship toggle in Phase 4 |
| Bag interaction | Hover peek overlay + category pill scroll to panel |
| Travel map | Static image `/images/travel/italy-map.jpg` (no map library) |

---

*Last updated: 2026-05-22. Edit this file when design or data decisions change; implementation phases must match §4 checklist order.*
