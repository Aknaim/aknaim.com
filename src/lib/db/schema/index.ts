import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const galleryInterestEnum = pgEnum("gallery_interest", [
  "travel",
  "climbing",
  "cooking",
]);
export const gearInterestEnum = pgEnum("gear_interest", ["cooking", "climbing"]);
export const climbTypeEnum = pgEnum("climb_type", ["lead", "bouldering", "top-rope"]);
export const locationKindEnum = pgEnum("location_kind", ["gym", "outdoor"]);
/**
 * How the climb went:
 * onsight/flash/redpoint/send = clean successful send
 * one-hang = finished after weighting the rope (not a clean send)
 * project = still working / unfinished
 */
export const climbResultEnum = pgEnum("climb_result", [
  "onsight",
  "flash",
  "redpoint",
  "send",
  "one-hang",
  "project",
]);
export const projectStatusEnum = pgEnum("project_status", [
  "in-progress",
  "projecting",
  "on-deck",
]);
export const activityStatusEnum = pgEnum("activity_status", ["active", "dormant"]);

/** Home workbench/cupboard shell fields — tabs/hero stay in siteData. */
export const interestSettings = pgTable("interest_settings", {
  id: text("id").primaryKey(),
  status: activityStatusEnum("status").notNull(),
  workbenchNote: text("workbench_note"),
  lastActive: text("last_active"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Date range for static course catalogs (photography, cooking, carpentry, …). */
export const courseCompletions = pgTable("course_completions", {
  id: text("id").primaryKey(),
  startedOn: date("started_on"),
  completedOn: date("completed_on"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull().unique(),
  alt: text("alt"),
  mediaType: mediaTypeEnum("media_type").notNull().default("image"),
  posterUrl: text("poster_url"),
  durationLabel: text("duration_label"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const galleryItems = pgTable("gallery_items", {
  id: text("id").primaryKey(),
  interest: galleryInterestEnum("interest").notNull(),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  title: text("title"),
  dateTaken: date("date_taken").notNull(),
  filters: jsonb("filters").$type<Record<string, string>>().notNull().default({}),
  recipeSlug: text("recipe_slug"),
  durationLabel: text("duration_label"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const recipes = pgTable("recipes", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  dateLabel: text("date_label").notNull(),
  dateTaken: date("date_taken").notNull(),
  imageMediaId: uuid("image_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  heroMediaId: uuid("hero_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  categoryId: text("category_id").notNull(),
  categoryLabel: text("category_label").notNull(),
  cuisine: text("cuisine").notNull(),
  description: text("description").notNull(),
  notes: text("notes").notNull().default(""),
  servings: integer("servings").notNull(),
  totalTime: text("total_time").notNull(),
  difficulty: text("difficulty").notNull(),
  ovenTemp: text("oven_temp"),
  infoCuisine: text("info_cuisine").notNull(),
  infoCourse: text("info_course").notNull(),
  infoMethod: text("info_method").notNull(),
  infoDiet: text("info_diet").notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  calories: integer("calories").notNull(),
  protein: text("protein").notNull(),
  carbs: text("carbs").notNull(),
  fat: text("fat").notNull(),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ingredientGroups = pgTable("ingredient_groups", {
  id: serial("id").primaryKey(),
  recipeSlug: text("recipe_slug")
    .notNull()
    .references(() => recipes.slug, { onDelete: "cascade" }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => ingredientGroups.id, { onDelete: "cascade" }),
  /** Amount only (e.g. "2", "1/2"), or freeform when unit is `text`. */
  quantity: text("quantity").notNull(),
  /** Legacy dual-field display; kept for older rows / seed fallback. */
  quantityMetric: text("quantity_metric").notNull().default(""),
  /** Canonical unit id — see `@/lib/recipe/units`. */
  unit: text("unit").notNull().default(""),
  /** Prep note, e.g. finely chopped. */
  note: text("note").notNull().default(""),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const recipeSteps = pgTable("recipe_steps", {
  id: serial("id").primaryKey(),
  recipeSlug: text("recipe_slug")
    .notNull()
    .references(() => recipes.slug, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageMediaId: uuid("image_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
});

export const recipeFinalImages = pgTable("recipe_final_images", {
  id: serial("id").primaryKey(),
  recipeSlug: text("recipe_slug")
    .notNull()
    .references(() => recipes.slug, { onDelete: "cascade" }),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  alt: text("alt").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const gearItems = pgTable("gear_items", {
  id: serial("id").primaryKey(),
  interest: gearInterestEnum("interest").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const climbingLocations = pgTable("climbing_locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: locationKindEnum("kind").notNull().default("gym"),
});

export const climbingProjects = pgTable("climbing_projects", {
  id: text("id").primaryKey(),
  grade: text("grade").notNull(),
  name: text("name").notNull(),
  locationId: text("location_id")
    .notNull()
    .references(() => climbingLocations.id, { onDelete: "restrict" }),
  type: climbTypeEnum("type").notNull(),
  status: projectStatusEnum("status").notNull(),
  imageMediaId: uuid("image_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** One gym/outdoor day — drives the Sessions / Outdoor Trips stats. */
export const climbingSessions = pgTable("climbing_sessions", {
  id: text("id").primaryKey(),
  sessionDate: date("session_date").notNull(),
  locationId: text("location_id")
    .notNull()
    .references(() => climbingLocations.id, { onDelete: "restrict" }),
  notes: text("notes"),
});

export const climbingSends = pgTable("climbing_sends", {
  id: text("id").primaryKey(),
  /** Folder slug, e.g. halloween-green */
  slug: text("slug").notNull().unique(),
  grade: text("grade").notNull(),
  routeName: text("route_name").notNull(),
  locationId: text("location_id")
    .notNull()
    .references(() => climbingLocations.id, { onDelete: "restrict" }),
  type: climbTypeEnum("type").notNull(),
  /** Hold/tape color for gym climbs; null outdoors */
  color: text("color"),
  result: climbResultEnum("result").notNull().default("send"),
  sessionId: text("session_id").references(() => climbingSessions.id, {
    onDelete: "set null",
  }),
  sendDateLabel: text("send_date_label").notNull(),
  durationLabel: text("duration_label").notNull(),
  imageMediaId: uuid("image_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const climbingProgression = pgTable("climbing_progression", {
  id: serial("id").primaryKey(),
  yearLabel: text("year_label").notNull(),
  milestoneLabel: text("milestone_label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** @deprecated Stats are computed from sessions/sends/locations. Kept for legacy rows. */
export const climbingStats = pgTable("climbing_stats", {
  id: integer("id").primaryKey().default(1),
  sessions: integer("sessions").notNull(),
  locations: integer("locations").notNull(),
  routesSent: integer("routes_sent").notNull(),
  outdoorTrips: integer("outdoor_trips").notNull(),
});

export const destinations = pgTable("destinations", {
  id: text("id").primaryKey(),
  displayNumber: text("display_number").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  photosCount: integer("photos_count").notNull(),
  notesCount: integer("notes_count").notNull(),
  dateLabel: text("date_label").notNull(),
  imageMediaId: uuid("image_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  mapX: real("map_x").notNull(),
  mapY: real("map_y").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const trips = pgTable("trips", {
  id: text("id")
    .primaryKey()
    .references(() => destinations.id, { onDelete: "cascade" }),
  country: text("country").notNull(),
  dateLabel: text("date_label").notNull(),
  summary: text("summary").notNull(),
  heroMediaId: uuid("hero_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  statDays: integer("stat_days").notNull(),
  statRegions: integer("stat_regions").notNull(),
  statPhotos: integer("stat_photos").notNull(),
  statCountries: integer("stat_countries").notNull(),
  routeMapMediaId: uuid("route_map_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  routeNote: text("route_note").notNull().default(""),
  gearMediaId: uuid("gear_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  reflectionExcerpt: text("reflection_excerpt").notNull(),
  reflectionSlug: text("reflection_slug").notNull(),
});

export const tripRouteStops = pgTable("trip_route_stops", {
  id: serial("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  coordX: real("coord_x").notNull(),
  coordY: real("coord_y").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tripTimeline = pgTable("trip_timeline", {
  id: serial("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  dayLabel: text("day_label").notNull(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tripMoments = pgTable("trip_moments", {
  id: serial("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  photoCount: integer("photo_count").notNull(),
  imageMediaId: uuid("image_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tripFieldNotes = pgTable("trip_field_notes", {
  id: serial("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  noteText: text("note_text").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tripFavoritePlaces = pgTable("trip_favorite_places", {
  id: serial("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  imageMediaId: uuid("image_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const travelStats = pgTable("travel_stats", {
  id: integer("id").primaryKey().default(1),
  places: integer("places").notNull(),
  photosLabel: text("photos_label").notNull(),
  notesLabel: text("notes_label").notNull(),
  memoriesLabel: text("memories_label").notNull(),
});
