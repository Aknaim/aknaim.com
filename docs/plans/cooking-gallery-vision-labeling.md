# Cooking gallery vision labeling — feasibility

**Status: parked plan** (do not implement yet).

Feasibility of AI-labeling ~94 cooking gallery images for dish name, category, cuisine, and optional course/session match: modest cost; accuracy varies by field — course-by-date is strong, dish names need review.

## Current data gap

Neon cooking gallery: **95** published items.

- Titles: almost all camera filenames (`20240919 190250`), not dish names
- Category / cuisine filters: filled on **1** row (the sample recipe); **~94** need labels
- Allowed values already exist in [`src/lib/data/galleries/cookingGalleryData.ts`](../../src/lib/data/galleries/cookingGalleryData.ts) + [`src/lib/recipe/cuisines.ts`](../../src/lib/recipe/cuisines.ts)

## How hard (engineering)

**Easy–moderate** for a one-off script, not a product feature:

1. Load cooking `gallery_items` + R2 image URLs
2. Call a vision model with a constrained JSON schema (`title`, `category` enum, `cuisine` enum, `confidence`)
3. Write a review JSON / CSV; apply updates only after you approve

Reuse Neon AI Gateway ([`.agents/skills/neon-ai-gateway`](../../.agents/skills/neon-ai-gateway/SKILL.md)) or any OpenAI-compatible vision endpoint. No UI required for v1.

## How likely is the model to get it right?

Rough expectations for your set (~94 R2 photos, titles are timestamps; courses already have `started_on` / `completed_on` in Neon):

| Field | Likely accuracy | Why |
| --- | --- | --- |
| **Course (by date)** | **High (~85–95%)** when a photo’s `date_taken` falls in exactly one course window | This is mostly **calendar logic**, not vision. You already have ranges e.g. Culinary Arts 1 `2022-05-08→2022-08-14`, Breads `2024-05-12→2024-07-28`, Dosa masterclass `2024-09-19`. Gaps / overlapping windows / photos outside all courses → leave null. |
| **Session / syllabus dish** (match vision name → `sessions[].items[]`) | **Medium–high (~60–80%)** when the plate is a distinctive syllabus item | Best when course is known first, then fuzzy-match suggested dish to that course’s item list (e.g. “Beef Stroganoff”, “Lasagna al Forno”). Generic “soup” / “salad” will collide. |
| **Dish name** (free text) | **Medium (~50–70% “good enough”)** | Distinctive plated dishes do well; sauces, mise, partial plates, and similar pastas mislabel often. Expect useful drafts, not cookbook titles. |
| **Category** (dinner / dessert / baking…) | **Medium (~60–75%)** | Baking vs dessert vs dinner is often guessable; breakfast vs lunch vs dinner is weak from a plate alone. |
| **Cuisine** | **Medium-low (~40–65%)** | Clear cuisines (dosa, ramen) fine; George Brown “continental / technique” plates often look generically European → wrong or forced cuisine. Prefer `null` when unsure. |

**Best pipeline:** date → candidate course(s) → vision dish name (+ category/cuisine) → fuzzy match against that course’s session items → you review low-confidence rows.

So: **courses-by-date are the reliable win**; **dish names are assistive drafts**. Don’t auto-apply dish/cuisine without a pass.

Accuracy caveats:

- Ambiguous plating ("is this lunch or dinner?")
- Fusion / unclear cuisine → model should return `null` when unsure
- Multiple dishes in one frame
- Photos outside all `course_completions` windows (gallery spans 2022–2026; some dates won’t map)

**AI proposes, you confirm** — not fully automatic write to prod.

## Token burn / cost (~94 images)

Vision cost is driven by **image tokens**, not the short prompt.

| Mode | Rough scale for ~94 photos |
| --- | --- |
| Low detail (enough for dish/category/cuisine) | ~0.05–0.3M image tokens total → typically **well under $1** on a cheap vision model |
| High detail | Several× more; still usually **a few dollars**, not tens |

Cursor chat analyzing 94 images inline would be far more expensive/noisy than a batch script. Prefer a script (or small agent run) with `detail: low` and structured output.

## Recommended approach (when implementing)

- One script: dry-run → review file → `--apply` to local/Neon `filters` + `title`
- Constrain enums to existing category/cuisine ids
- Skip rows that already have category+cuisine
- Keep human review for low-confidence rows

## Not recommended

- Pasting 94 images into chat for manual analysis
- Auto-writing to Neon without a review pass

## Verdict

**Worth doing** when you want filters to work. Hardness: a small scripting task. Token cost: low if batched with low-detail vision + review step.
