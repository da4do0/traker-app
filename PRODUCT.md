# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two audiences served by one product, simple by default with technical depth on demand:
- People who want to lose or maintain weight and need an easy daily food diary.
- Gym-goers doing bulk/cut/recomposition who count macros and read body metrics (BMI, FFMI).

Job: log what they eat in seconds (search, barcode, custom food), see where they stand against a daily calorie target, and track body weight toward a goal over weeks.

Secondary audience for this redesign: visitors of the author's portfolio site, who see the product through Figma screenshot exports and a link to the GitHub repo.

## Product Purpose
A nutrition and weight tracker. Success for the user: a daily routine of logging meals and weigh-ins that stays fast, and a clear picture of progress toward a personal calorie target and weight goal.

Success for this redesign: a complete Figma redesign (all screens, desktop 1440 + mobile 390) good enough to present as a portfolio case study. Code implementation is a later, separate phase.

## Positioning
The calorie target is personal and computed, not generic: onboarding derives it from Mifflin-St Jeor BMR × activity multiplier ± goal adjustment (−500 kcal lose, +400 kcal gain), shown live while the user fills the form. Food data comes from OpenFoodFacts (text search and barcode), so products carry Nutri-Score, NOVA group, ingredients and allergens. Weight tracking pairs the scale number with BMI/FFMI and goal progress.

## Operating Context
- Daily use, short sessions: logging a meal right after eating, often on a phone; barcode scan with the camera in hand.
- Weekly-ish weigh-ins added to a history with a chart over 1M/3M/6M/1A.
- Interface language: Italian.

## Capabilities and Constraints
Confirmed, existing functionality (only these get designed; navigation points only to real pages):
- Login; 3-step registration (account data → body data: sex, birth date, height, weight → activity level 1–5 and weight goal lose/maintain/gain, target weight, live daily kcal estimate).
- Home dashboard: kcal eaten today vs goal with macro split (carbs/protein/fat), current weight, BMR and TDEE.
- Food search: text query → OpenFoodFacts results; numeric query → barcode lookup; camera barcode scanner; create custom food (name, description, image URL, kcal/protein/carbs/fat per 100 g).
- Food detail: image, brand, quantity, category, Nutri-Score, NOVA, kcal and macros per 100 g, serving size, ingredients, allergens, product code.
- Add to diary: meal (Colazione, Pranzo, Cena, Spuntino), quantity with presets 50/100/150/200 g and ±10 g, live kcal/macro preview.
- Diary: meals as expandable sections, per-item edit (quantity, meal) and delete with confirmation, daily totals and remaining kcal, text filter.
- Weight: goal progress card (start, current, target, % progress, on-track flag, estimated days, weekly average), BMI and FFMI with category, height, monthly trend, history chart with target line and period filter, add measurement (date, weight, height, BMI preview), summary.
- 404 page; error and empty states.

Not to be designed (exist only as dead buttons or commented code): Profile, Statistics, Hydration, Recent foods.

Tech context for the later code phase: React 19 + TypeScript + Vite, Tailwind v4, MUI X-Charts, lucide-react, ZXing; ASP.NET Core 8 + SQL Server backend.

## Brand Commitments
None binding. The current name "FoodTracker" and logo may be fully replaced; a new name is proposed during the visual direction round. No alignment required with the author's portfolio site identity.

## Evidence on Hand
- No real users, testimonials, metrics or press. Do not fabricate any.
- Mockup content is synthetic: an invented user persona and realistic food/weight data, labeled as demo where it could be mistaken for real.
- Existing logo: `tracker_app/public/logo.png` (to be replaced).

## Product Principles
1. Logging is the core loop: adding a food must be the fastest, most visible action everywhere.
2. Simple first, depth on demand: the number that matters (kcal left, weight vs goal) leads; macros, FFMI, NOVA sit one level down.
3. Honest data: every figure shown is one the product actually computes or fetches.
4. Show the method: personal targets are explained (BMR → TDEE → goal), not handed down.
