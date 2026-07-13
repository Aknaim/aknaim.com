CREATE TYPE "public"."climb_type" AS ENUM('lead', 'bouldering', 'top-rope');--> statement-breakpoint
CREATE TYPE "public"."gallery_interest" AS ENUM('travel', 'climbing', 'cooking');--> statement-breakpoint
CREATE TYPE "public"."gear_interest" AS ENUM('cooking', 'climbing');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('in-progress', 'projecting', 'on-deck');--> statement-breakpoint
CREATE TABLE "climbing_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "climbing_progression" (
	"id" serial PRIMARY KEY NOT NULL,
	"year_label" text NOT NULL,
	"milestone_label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "climbing_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"grade" text NOT NULL,
	"name" text NOT NULL,
	"location_id" text NOT NULL,
	"type" "climb_type" NOT NULL,
	"status" "project_status" NOT NULL,
	"image_media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "climbing_sends" (
	"id" text PRIMARY KEY NOT NULL,
	"grade" text NOT NULL,
	"route_name" text NOT NULL,
	"location_id" text NOT NULL,
	"type" "climb_type" NOT NULL,
	"send_date_label" text NOT NULL,
	"duration_label" text NOT NULL,
	"image_media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "climbing_stats" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"sessions" integer NOT NULL,
	"locations" integer NOT NULL,
	"routes_sent" integer NOT NULL,
	"outdoor_trips" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" text PRIMARY KEY NOT NULL,
	"display_number" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"photos_count" integer NOT NULL,
	"notes_count" integer NOT NULL,
	"date_label" text NOT NULL,
	"image_media_id" uuid NOT NULL,
	"map_x" real NOT NULL,
	"map_y" real NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"interest" "gallery_interest" NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"title" text,
	"date_taken" date NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recipe_slug" text,
	"duration_label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gear_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"interest" "gear_interest" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_slug" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"quantity" text NOT NULL,
	"quantity_metric" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"media_type" "media_type" DEFAULT 'image' NOT NULL,
	"poster_url" text,
	"duration_label" text,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "recipe_final_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_slug" text NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"alt" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_slug" text NOT NULL,
	"step_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_media_id" uuid
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date_label" text NOT NULL,
	"date_taken" date NOT NULL,
	"image_media_id" uuid NOT NULL,
	"hero_media_id" uuid NOT NULL,
	"category_id" text NOT NULL,
	"category_label" text NOT NULL,
	"cuisine" text NOT NULL,
	"description" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"servings" integer NOT NULL,
	"total_time" text NOT NULL,
	"difficulty" text NOT NULL,
	"oven_temp" text,
	"info_cuisine" text NOT NULL,
	"info_course" text NOT NULL,
	"info_method" text NOT NULL,
	"info_diet" text NOT NULL,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calories" integer NOT NULL,
	"protein" text NOT NULL,
	"carbs" text NOT NULL,
	"fat" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_stats" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"places" integer NOT NULL,
	"photos_label" text NOT NULL,
	"notes_label" text NOT NULL,
	"memories_label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_favorite_places" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"image_media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_field_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"note_text" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_moments" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"title" text NOT NULL,
	"photo_count" integer NOT NULL,
	"image_media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_route_stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"name" text NOT NULL,
	"coord_x" real NOT NULL,
	"coord_y" real NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"day_label" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"country" text NOT NULL,
	"date_label" text NOT NULL,
	"summary" text NOT NULL,
	"hero_media_id" uuid NOT NULL,
	"stat_days" integer NOT NULL,
	"stat_regions" integer NOT NULL,
	"stat_photos" integer NOT NULL,
	"stat_countries" integer NOT NULL,
	"route_map_media_id" uuid NOT NULL,
	"gear_media_id" uuid NOT NULL,
	"reflection_excerpt" text NOT NULL,
	"reflection_slug" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "climbing_projects" ADD CONSTRAINT "climbing_projects_location_id_climbing_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."climbing_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "climbing_projects" ADD CONSTRAINT "climbing_projects_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "climbing_sends" ADD CONSTRAINT "climbing_sends_location_id_climbing_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."climbing_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "climbing_sends" ADD CONSTRAINT "climbing_sends_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_groups" ADD CONSTRAINT "ingredient_groups_recipe_slug_recipes_slug_fk" FOREIGN KEY ("recipe_slug") REFERENCES "public"."recipes"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_group_id_ingredient_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."ingredient_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_final_images" ADD CONSTRAINT "recipe_final_images_recipe_slug_recipes_slug_fk" FOREIGN KEY ("recipe_slug") REFERENCES "public"."recipes"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_final_images" ADD CONSTRAINT "recipe_final_images_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_slug_recipes_slug_fk" FOREIGN KEY ("recipe_slug") REFERENCES "public"."recipes"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_hero_media_id_media_assets_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_favorite_places" ADD CONSTRAINT "trip_favorite_places_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_favorite_places" ADD CONSTRAINT "trip_favorite_places_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_field_notes" ADD CONSTRAINT "trip_field_notes_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_moments" ADD CONSTRAINT "trip_moments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_moments" ADD CONSTRAINT "trip_moments_image_media_id_media_assets_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_route_stops" ADD CONSTRAINT "trip_route_stops_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_timeline" ADD CONSTRAINT "trip_timeline_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_id_destinations_id_fk" FOREIGN KEY ("id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_hero_media_id_media_assets_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_map_media_id_media_assets_id_fk" FOREIGN KEY ("route_map_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_gear_media_id_media_assets_id_fk" FOREIGN KEY ("gear_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;