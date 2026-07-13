# Application Architecture Overview

**Last updated:** July 2026  
**Branch context:** `feat/postgres-data-layer` (Postgres migration in progress)

This document describes how the **running application** is structured today: routes, data sources, media, admin, and dev infrastructure.

For the original UI/design blueprint (colors, typography, mockup planning), see [`ARCHITECTURE.md`](../ARCHITECTURE.md) at the repo root.

---

## 1. High-level system

```mermaid
flowchart TB
  subgraph client [Browser]
    PublicUser[Public visitor]
    AdminUser[Admin user]
  end

  subgraph next [Next.js App]
    AppRouter[App Router pages]
    ServerComponents[Server Components]
    ServerActions[Server Actions]
    StaticFiles["public/images/"]
  end

  subgraph data [Data layer]
    Postgres[(PostgreSQL in Docker)]
    StaticTS["Static TS modules src/lib/data*.ts"]
  end

  PublicUser --> AppRouter
  AdminUser --> AppRouter
  AppRouter --> ServerComponents
  AdminUser --> ServerActions
  ServerComponents --> Postgres
  ServerComponents --> StaticTS
  ServerActions --> Postgres
  ServerComponents --> StaticFiles
  PublicUser --> StaticFiles
```

| Layer | Technology | Role |
|--------|------------|------|
| **UI** | React 19, Tailwind CSS, Lucide | Pages and reusable sections |
| **App framework** | Next.js App Router | Routing, SSR, metadata, server actions |
| **Content DB** | PostgreSQL 16 + Drizzle ORM | Recipes, gallery rows, climbing/travel (seeded; cooking wired) |
| **Site config** | TypeScript modules | Nav, interests, skills, hero copy (still in code) |
| **Media** | `public/images/` | Actual image files; DB stores URL paths only |
| **Dev infra** | Docker Compose | Postgres container; optional full app container |

### WSL development note

When developing from **WSL**, use `host.docker.internal` in `DATABASE_URL`. WSL often runs its own Postgres on `localhost:5432`, which is a different instance than Docker Desktop’s container.

```env
DATABASE_URL=postgresql://aknaim:aknaim@host.docker.internal:5432/aknaim
```

---

## 2. Information architecture (routes)

Content-heavy interests use a **landing + gallery** pattern:

```mermaid
flowchart LR
  Home["/ Workbench"]
  About["/about"]
  Interest["/interests/id"]

  TravelLand["/travel"]
  TravelDetail["/travel/id"]
  TravelGal["/gallery/travel"]

  CookLand["/cooking"]
  CookDetail["/cooking/slug"]
  CookGal["/gallery/cooking"]

  ClimbLand["/climbing"]
  ClimbGal["/gallery/climbing"]

  AdminLogin["/admin/login"]
  AdminDash["/admin"]
  AdminRecipes["/admin/recipes"]

  Home --> TravelLand
  Home --> CookLand
  Home --> ClimbLand
  Home --> About
  Home --> Interest

  TravelLand --> TravelDetail
  TravelLand --> TravelGal
  TravelDetail --> TravelGal

  CookLand --> CookGal
  CookGal --> CookDetail
  CookDetail --> CookGal

  ClimbLand --> ClimbGal

  AdminLogin --> AdminDash
  AdminDash --> AdminRecipes
```

| Route type | Purpose |
|------------|---------|
| **Landing** (`/cooking`, `/climbing`, `/travel`) | Editorial hero, stats, gear, CTA to gallery |
| **Gallery** (`/gallery/*`) | Filterable photo grid + lightbox |
| **Detail** (`/cooking/[slug]`, `/travel/[id]`) | Full content (recipe steps, trip timeline) |
| **Workbench** (`/`) | Interest “bag” metaphor — active vs dormant interests |
| **Admin** (`/admin/*`) | Password-protected CRUD (recipes today) |

---

## 3. Code organization

Follows project conventions in `.cursor/rules/architecture.mdc`:

```mermaid
flowchart TB
  subgraph app [src/app]
    Pages[Route pages - server by default]
    AdminRoutes[admin route group]
  end

  subgraph sections [src/components/sections]
    Hero[Hero Workbench etc]
    Gallery[GalleryView Grid Sidebar]
    CookingUI[RecipeIngredients Steps etc]
    AdminUI[RecipeAdminForm]
  end

  subgraph ui [src/components/ui]
    Primitives[ImageLightbox TabList etc]
  end

  subgraph lib [src/lib]
    DataStatic[data.ts travelData climbingData]
    DataRecipes[data/recipes legacy TS]
    DbLayer[db schema queries seed]
    Actions[actions/admin]
    Auth[auth/admin]
    Types[types gallery recipe travel]
    Utils[gallery-utils asset-utils]
  end

  Pages --> sections
  sections --> ui
  Pages --> lib
  AdminRoutes --> Actions
  Actions --> DbLayer
  DbLayer --> Postgres[(Postgres)]
  Pages --> DataStatic
```

| Folder | Responsibility |
|--------|----------------|
| `src/app/` | File-based routes, metadata, page composition |
| `src/components/sections/` | Page-level UI (Hero, galleries, recipe layout) |
| `src/components/ui/` | Small reusable primitives (lightbox, tabs) |
| `src/lib/db/` | Drizzle schema, queries, seed |
| `src/lib/data/` | Legacy static content (still used where not migrated) |
| `src/lib/types/` | Domain TypeScript types |

---

## 4. Content model: two sources (transitional)

The site is mid-migration from static TypeScript data to Postgres.

```mermaid
flowchart LR
  subgraph static [Static in code]
    SiteData[siteData - nav interests skills]
    TravelTS[travelData.ts]
    ClimbTS[climbingData.ts seed only]
  GalleryTS[gallery TS for travel]
  RecipeTS[recipe TS files seed only]
  end

  subgraph db [Postgres via Drizzle]
    MediaAssets[media_assets]
    Recipes[recipes + children]
    GalleryItems[gallery_items]
    ClimbingTables[climbing_*]
    TravelTables[destinations trips etc]
  end

  subgraph pages [Pages today]
    HomePage[Home About Interests]
    CookingPages[Cooking pages]
    ClimbPages[Climbing pages]
    TravelPages[Travel pages]
  end

  SiteData --> HomePage
  TravelTS --> TravelPages
  GalleryTS --> TravelPages

  Recipes --> CookingPages
  ClimbingTables --> ClimbPages
  GalleryItems --> CookingPages
  GalleryItems --> ClimbPages
  MediaAssets --> Recipes
  MediaAssets --> ClimbingTables
  MediaAssets --> GalleryItems

  TravelTables -. seeded not wired .-> TravelPages
  RecipeTS -. seed source .-> Recipes
  ClimbTS -. seed source .-> ClimbingTables
```

**Cooking and climbing are live on DB.** Travel is seeded in Postgres but pages still read static TS files. Site shell (nav, interests, about) stays in code for now.

---

## 5. Domain schema (Postgres)

Shared principle: **media is canonical**, domain tables reference it, galleries are a browse layer.

```mermaid
erDiagram
  media_assets ||--o{ recipes : image_and_hero
  media_assets ||--o{ recipe_steps : step_image
  media_assets ||--o{ recipe_final_images : result_photo
  media_assets ||--o{ gallery_items : display_src

  recipes ||--o{ ingredient_groups : has
  ingredient_groups ||--o{ ingredients : has
  recipes ||--o{ recipe_steps : has
  recipes ||--o{ recipe_final_images : has
  recipes ||--o{ gallery_items : recipeSlug

  destinations ||--o| trips : optional_detail
  trips ||--o{ trip_moments : has
  climbing_locations ||--o{ climbing_projects : at
  climbing_locations ||--o{ gallery_items : filter_location
```

- **Gallery filters** live as JSON on `gallery_items.filters` (e.g. `{ category, cuisine }` or `{ trip, location, grade }`).
- **Filter UI config** (labels, sort options) remains in TypeScript — it describes the UI, not the content.
- Schema source: [`src/lib/db/schema/index.ts`](../src/lib/db/schema/index.ts)
- Migrations: [`drizzle/`](../drizzle/)

---

## 6. Request flow: cooking (DB-backed)

Example: `GET /cooking/wood-fired-margherita-pizza`

```mermaid
sequenceDiagram
  participant Browser
  participant NextPage as cooking/slug page
  participant Queries as db/queries/recipes
  participant DB as PostgreSQL
  participant Public as public/images

  Browser->>NextPage: GET /cooking/slug
  NextPage->>Queries: getRecipeBySlug(slug)
  Queries->>DB: SELECT recipes + joins
  DB-->>Queries: rows with media URLs
  Queries-->>NextPage: RecipeDetail
  NextPage-->>Browser: HTML with image paths
  Browser->>Public: GET /images/hero/peek-cooking.jpg
  Public-->>Browser: JPEG bytes
```

Same pattern for `/gallery/cooking`: `getGalleryItems("cooking")` joins `gallery_items` → `media_assets` → `GalleryView`.

---

## 7. Gallery + lightbox

```mermaid
flowchart TB
  GalleryPage[gallery page server]
  GalleryView[GalleryView client]
  Sidebar[GallerySidebar filters]
  Grid[GalleryGrid]
  Lightbox[ImageLightbox]

  GalleryPage -->|"items + config"| GalleryView
  GalleryView --> Sidebar
  GalleryView --> Grid
  Grid -->|"click image"| Lightbox
  Lightbox -->|"recipeSlug"| RecipePage["/cooking/slug"]
```

- **Server:** loads items + parses URL search params for filters
- **Client:** grid, filter state, lightbox prev/next, keyboard nav
- **Cooking:** lightbox can link to full recipe via `recipeSlug`

Key files:

- [`src/components/sections/gallery/GalleryView.tsx`](../src/components/sections/gallery/GalleryView.tsx)
- [`src/components/ui/ImageLightbox.tsx`](../src/components/ui/ImageLightbox.tsx)
- [`src/lib/gallery-utils.ts`](../src/lib/gallery-utils.ts)

---

## 8. Admin architecture

Admin is the **content CMS for every interest that has post-like entries**. Recipes were implemented first because cooking was the first domain switched to Postgres. Climbing, travel, and gallery upload land next, once those pages read from the DB.

| Interest | Post-like unit | Admin today | Admin next |
|----------|----------------|-------------|------------|
| Cooking | Recipe | List / create / edit / delete | Media upload polish |
| Travel | Destination + trip detail | — | CRUD after travel is DB-wired |
| Climbing | Project, send, session media | — | CRUD after climbing is DB-wired |
| Gallery | Media + filters | Via recipe save | Dedicated upload + tagging UI |
| Site shell | Nav, interests, skills | — | Optional later |

```mermaid
flowchart TB
  Login["/admin/login"]
  Protected["/admin protected layout"]
  RecipesList["/admin/recipes"]
  RecipeForm["RecipeAdminForm"]
  AuthAction[loginAdmin server action]
  RecipeAction[createOrUpdateRecipe server action]
  SessionCookie[Signed session cookie]
  DB[(Postgres)]

  Login --> AuthAction
  AuthAction --> SessionCookie
  SessionCookie --> Protected
  Protected --> RecipesList
  RecipesList --> RecipeForm
  RecipeForm --> RecipeAction
  RecipeAction --> DB
  RecipeAction -->|"revalidatePath"| NextCache[Next.js cache]
```

- **Auth:** single password from `ADMIN_PASSWORD`, HMAC-signed cookie
- **Mutations:** Server Actions write to Postgres and revalidate public routes
- **Media:** admin accepts image **URLs** (paths under `/images/...`); file upload not built yet
- **Expansion rule:** add an admin section only after that domain’s public pages read from Postgres

---

## 9. Dev / deploy topology

```mermaid
flowchart TB
  subgraph wsl [WSL Ubuntu]
    NextDev[npm run dev]
    WslPostgres[Local Postgres on localhost:5432]
  end

  subgraph docker [Docker Desktop]
    PgContainer[postgres:16-alpine]
  end

  subgraph host [Windows host]
    Browser[Browser localhost:3000]
  end

  NextDev -->|"DATABASE_URL host.docker.internal:5432"| PgContainer
  NextDev -.->|"localhost:5432 wrong DB"| WslPostgres
  Browser --> NextDev
  NextDev --> PublicImages[public/images on disk]
```

### Local commands

```bash
npm run docker:up    # Postgres only (docker-compose.dev.yml)
npm run db:push      # apply schema
npm run db:seed      # load content from legacy TS files
npm run dev          # Next.js dev server
```

Optional production path (not fully wired):

```mermaid
flowchart LR
  DockerCompose[docker-compose.yml]
  WebContainer[Next.js standalone container]
  DbContainer[Postgres container]
  CDN[CDN R2 or Cloudinary future]

  DockerCompose --> WebContainer
  DockerCompose --> DbContainer
  WebContainer --> DbContainer
  WebContainer --> CDN
```

---

## 10. Media strategy (current vs planned)

| Today | Planned |
|-------|---------|
| Image bytes in `public/images/` | Bulk photos/videos on CDN (R2, Cloudinary, etc.) |
| DB stores paths like `/images/travel/oman/hero-oman.jpg` | DB stores CDN URLs |
| Admin pastes URL strings | Admin uploads files → storage provider |

The `media_assets` table already has columns for future video support (`media_type`, `poster_url`, `duration_label`).

---

## 11. Design principles

1. **Server-first:** Pages are Server Components; `'use client'` only where interaction is required.
2. **Landing vs gallery:** One editorial landing per interest; one browse/filter surface in `/gallery/*`.
3. **URLs in DB, bytes on disk (for now):** Postgres stores paths; Next serves files from `public/`.
4. **Phased migration:** Full schema + seed upfront; wire pages domain by domain.
5. **Static site config vs dynamic content:** Brand, nav, and interest metadata stay in code until admin needs them.

---

## 12. Current migration status

| Area | Data source | Media |
|------|-------------|-------|
| Home, About, Interests | Static TS | `public/images/` |
| Cooking + cooking gallery | **Postgres** | `public/images/` via DB URLs |
| Climbing + climbing gallery | **Postgres** | `public/images/` via DB URLs |
| Travel | Static TS (DB seeded, not wired) | `public/images/` |
| Admin | Postgres (recipes) | URL input only |

### Remaining work

- Wire travel pages to DB queries
- Expand admin beyond recipes: gallery upload → travel → climbing (after travel is DB-wired)
- Optional: move site config into DB
- CDN integration for production-scale media
- Remove legacy static data files once all domains are DB-wired and admin covers them

---

## Related files

| File | Purpose |
|------|---------|
| [`docker-compose.dev.yml`](../docker-compose.dev.yml) | Local Postgres |
| [`docker-compose.yml`](../docker-compose.yml) | App + Postgres |
| [`drizzle.config.ts`](../drizzle.config.ts) | Drizzle Kit config |
| [`src/lib/db/seed.ts`](../src/lib/db/seed.ts) | Idempotent seed from legacy data |
| [`.env.example`](../.env.example) | Required environment variables |
