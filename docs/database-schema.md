# Database Schema

**Last updated:** July 2026  
**Source of truth:** [`src/lib/db/schema/index.ts`](../src/lib/db/schema/index.ts)  
**Migrations:** [`drizzle/`](../drizzle/)

Postgres stores **content metadata and relationships**. Image/video **bytes** live in `public/images/` (today) or a CDN (planned). Tables store URLs only via `media_assets`.

---

## Overview

```mermaid
flowchart TB
  media_assets[media_assets]

  subgraph cooking [Cooking]
    recipes[recipes]
    ingredient_groups[ingredient_groups]
    ingredients[ingredients]
    recipe_steps[recipe_steps]
    recipe_final_images[recipe_final_images]
  end

  subgraph climbing [Climbing]
    climbing_locations[climbing_locations]
    climbing_projects[climbing_projects]
    climbing_sends[climbing_sends]
    climbing_progression[climbing_progression]
    climbing_stats[climbing_stats]
  end

  subgraph travel [Travel]
    destinations[destinations]
    trips[trips]
    trip_route_stops[trip_route_stops]
    trip_timeline[trip_timeline]
    trip_moments[trip_moments]
    trip_field_notes[trip_field_notes]
    trip_favorite_places[trip_favorite_places]
    travel_stats[travel_stats]
  end

  subgraph shared [Shared]
    gallery_items[gallery_items]
    gear_items[gear_items]
  end

  media_assets --> recipes
  media_assets --> recipe_steps
  media_assets --> recipe_final_images
  media_assets --> climbing_projects
  media_assets --> climbing_sends
  media_assets --> destinations
  media_assets --> trips
  media_assets --> trip_moments
  media_assets --> trip_favorite_places
  media_assets --> gallery_items

  recipes --> ingredient_groups --> ingredients
  recipes --> recipe_steps
  recipes --> recipe_final_images
  recipes --> gallery_items

  climbing_locations --> climbing_projects
  climbing_locations --> climbing_sends

  destinations --> trips
  trips --> trip_route_stops
  trips --> trip_timeline
  trips --> trip_moments
  trips --> trip_field_notes
  trips --> trip_favorite_places
```

### Design rules

1. **`media_assets` is the single media registry** — every image/video URL lives here once.
2. **Domain tables reference media by UUID FK** — never store duplicate URL strings on content rows (except legacy path values that seed into `media_assets`).
3. **`gallery_items` is the browse layer** — one row per gallery card; `filters` JSON drives UI chips.
4. **Stats tables are singletons** (`id = 1`) for landing-page counters that are editorial, not computed.
5. **Site shell** (nav, interests, skills, personal bio) is **not** in Postgres yet.

### Enums

| Enum | Values |
|------|--------|
| `media_type` | `image`, `video` |
| `gallery_interest` | `travel`, `climbing`, `cooking` |
| `gear_interest` | `cooking`, `climbing` |
| `climb_type` | `lead`, `bouldering`, `top-rope` |
| `project_status` | `in-progress`, `projecting`, `on-deck` |

---

## Shared tables

### `media_assets`

Canonical store for every media URL used by content.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default random |
| `url` | text unique | e.g. `/images/travel/oman/hero-oman.jpg` or CDN URL |
| `alt` | text | optional |
| `media_type` | enum | `image` (default) or `video` |
| `poster_url` | text | video thumbnail |
| `duration_label` | text | e.g. `0:42` |
| `width` / `height` | int | optional |
| `created_at` | timestamptz | |

### `gallery_items`

Unified browse surface for `/gallery/travel|climbing|cooking`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | stable string id (`recipe-slug`, `climb-1`, `oman-hero`) |
| `interest` | enum | which gallery |
| `media_asset_id` | uuid FK → media_assets | display image/video |
| `title` | text | |
| `date_taken` | date | |
| `filters` | jsonb | e.g. `{ "category": "dinner", "cuisine": "italian" }` |
| `recipe_slug` | text | optional link to recipe detail |
| `duration_label` | text | climbing session length display |
| `sort_order` | int | |
| `published` | boolean | |

**Typical filter keys by interest:**

| Interest | `filters` keys |
|----------|----------------|
| cooking | `category`, `cuisine` |
| climbing | `location`, `type`, `grade` |
| travel | `trip`, `category` (+ year from `date_taken`) |

### `gear_items`

Shared gear lists for cooking and climbing landings.

| Column | Type |
|--------|------|
| `id` | serial PK |
| `interest` | enum (`cooking` \| `climbing`) |
| `title`, `description` | text |
| `sort_order` | int |

```mermaid
erDiagram
  media_assets {
    uuid id PK
    text url UK
    text alt
    media_type media_type
    text poster_url
    text duration_label
    int width
    int height
    timestamptz created_at
  }

  gallery_items {
    text id PK
    gallery_interest interest
    uuid media_asset_id FK
    text title
    date date_taken
    jsonb filters
    text recipe_slug
    text duration_label
    int sort_order
    boolean published
  }

  gear_items {
    serial id PK
    gear_interest interest
    text title
    text description
    int sort_order
  }

  media_assets ||--o{ gallery_items : media_asset_id
```

---

## Cooking

```mermaid
erDiagram
  media_assets ||--o{ recipes : "image_media_id / hero_media_id"
  media_assets ||--o{ recipe_steps : image_media_id
  media_assets ||--o{ recipe_final_images : media_asset_id
  recipes ||--o{ ingredient_groups : recipe_slug
  ingredient_groups ||--o{ ingredients : group_id
  recipes ||--o{ recipe_steps : recipe_slug
  recipes ||--o{ recipe_final_images : recipe_slug
  recipes ||--o{ gallery_items : "recipe_slug (soft)"

  recipes {
    text slug PK
    text title
    text date_label
    date date_taken
    uuid image_media_id FK
    uuid hero_media_id FK
    text category_id
    text category_label
    text cuisine
    text description
    text notes
    int servings
    text total_time
    text difficulty
    text oven_temp
    text info_cuisine
    text info_course
    text info_method
    text info_diet
    jsonb keywords
    int calories
    text protein
    text carbs
    text fat
    boolean published
    timestamptz created_at
    timestamptz updated_at
  }

  ingredient_groups {
    serial id PK
    text recipe_slug FK
    text label
    int sort_order
  }

  ingredients {
    serial id PK
    int group_id FK
    text quantity
    text quantity_metric
    text name
    int sort_order
  }

  recipe_steps {
    serial id PK
    text recipe_slug FK
    int step_number
    text title
    text description
    uuid image_media_id FK
  }

  recipe_final_images {
    serial id PK
    text recipe_slug FK
    uuid media_asset_id FK
    text alt
    int sort_order
  }
```

**Public mapping:** `RecipeDetail` in [`src/lib/types/recipe.ts`](../src/lib/types/recipe.ts) ← `getRecipeBySlug` in [`src/lib/db/queries/recipes.ts`](../src/lib/db/queries/recipes.ts).

---

## Climbing

```mermaid
erDiagram
  climbing_locations ||--o{ climbing_projects : location_id
  climbing_locations ||--o{ climbing_sends : location_id
  media_assets ||--o{ climbing_projects : image_media_id
  media_assets ||--o{ climbing_sends : image_media_id

  climbing_locations {
    text id PK
    text name
  }

  climbing_projects {
    text id PK
    text grade
    text name
    text location_id FK
    climb_type type
    project_status status
    uuid image_media_id FK
    int sort_order
  }

  climbing_sends {
    text id PK
    text grade
    text route_name
    text location_id FK
    climb_type type
    text send_date_label
    text duration_label
    uuid image_media_id FK
    int sort_order
  }

  climbing_progression {
    serial id PK
    text year_label
    text milestone_label
    int sort_order
  }

  climbing_stats {
    int id PK
    int sessions
    int locations
    int routes_sent
    int outdoor_trips
  }
```

**Location ids today:** `the-hive`, `home-gym`, `reach`, `outdoor`.

**Public mapping:** landing uses projects, stats, progression, gear; gallery uses `gallery_items` where `interest = 'climbing'`.

---

## Travel

```mermaid
erDiagram
  destinations ||--o| trips : "id shared PK/FK"
  media_assets ||--o{ destinations : image_media_id
  media_assets ||--o{ trips : "hero / route_map / gear"
  media_assets ||--o{ trip_moments : image_media_id
  media_assets ||--o{ trip_favorite_places : image_media_id
  trips ||--o{ trip_route_stops : trip_id
  trips ||--o{ trip_timeline : trip_id
  trips ||--o{ trip_moments : trip_id
  trips ||--o{ trip_field_notes : trip_id
  trips ||--o{ trip_favorite_places : trip_id

  destinations {
    text id PK
    text display_number
    text title
    text subtitle
    int photos_count
    int notes_count
    text date_label
    uuid image_media_id FK
    real map_x
    real map_y
    int sort_order
  }

  trips {
    text id PK_FK
    text country
    text date_label
    text summary
    uuid hero_media_id FK
    int stat_days
    int stat_regions
    int stat_photos
    int stat_countries
    uuid route_map_media_id FK
    uuid gear_media_id FK
    text reflection_excerpt
    text reflection_slug
  }

  trip_route_stops {
    serial id PK
    text trip_id FK
    text name
    real coord_x
    real coord_y
    int sort_order
  }

  trip_timeline {
    serial id PK
    text trip_id FK
    text day_label
    text label
    int sort_order
  }

  trip_moments {
    serial id PK
    text trip_id FK
    text title
    int photo_count
    uuid image_media_id FK
    int sort_order
  }

  trip_field_notes {
    serial id PK
    text trip_id FK
    text note_text
    int sort_order
  }

  trip_favorite_places {
    serial id PK
    text trip_id FK
    text title
    text location
    text description
    uuid image_media_id FK
    int sort_order
  }

  travel_stats {
    int id PK
    int places
    text photos_label
    text notes_label
    text memories_label
  }
```

**Note:** Every destination has a card row. Only destinations with a `trips` row have a detail page (today: `oman`). Others still 404 on `/travel/[id]` until trip detail is added.

---

## Cascade / delete behavior

| Relationship | On delete |
|--------------|-----------|
| Content → `media_assets` | `restrict` (don’t orphan media accidentally) |
| Recipe children → `recipes` | `cascade` |
| Trip children → `trips` | `cascade` |
| `trips` → `destinations` | `cascade` |
| Step image → `media_assets` | `set null` |

---

## Query layer

| Module | Main exports |
|--------|----------------|
| [`queries/recipes.ts`](../src/lib/db/queries/recipes.ts) | `getRecipeBySlug`, `getAllRecipes`, `getCookingStats`, `getCookingGearItems` |
| [`queries/climbing.ts`](../src/lib/db/queries/climbing.ts) | `getClimbingStats`, `getClimbingProjects`, `getClimbingProgression`, `getClimbingGearItems` |
| [`queries/travel.ts`](../src/lib/db/queries/travel.ts) | `getDestinations`, `getTravelStats`, `getTripById`, `getTravelGalleryConfig` |
| [`queries/gallery.ts`](../src/lib/db/queries/gallery.ts) | `getGalleryItems(interest, filters)` |

Seed: [`src/lib/db/seed.ts`](../src/lib/db/seed.ts) — idempotent upsert from legacy TS modules.

---

## Related docs

- [Application architecture](application-architecture.md) — runtime routes, admin, migration status
- [ARCHITECTURE.md](../ARCHITECTURE.md) — original UI/design blueprint
