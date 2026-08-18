# Changelog

## 3.1.0 — Tayyibat Intelligence Engine
- Added a dedicated Tayyibat Intelligence hub based on a dated snapshot of the public altayebaat.com frequency guide.
- Added 200 source entries with hundreds of searchable food names and aliases across basic, daily, weekly, occasional and forbidden categories.
- Added explicit source-conflict handling: conflicting site classifications are marked Needs Review instead of being guessed.
- Added “Can I have this today?” checks using the user’s local frequency history.
- Added daily / weekly / monthly counters and special handling for the source guide’s fish and non-consecutive meat frequency rules.
- Added a meal checker that parses comma/newline-separated ingredients and can calculate calories when gram weights match the existing local nutrition database.
- Added source-derived forbidden-food alternatives for eggs, chicken, milk/fresh cheese, white flour/pasta and black tea.
- Added a local 7-day Tayyibat meal-plan generator that avoids source-forbidden/conflicted items and supports 3 meals, 2 meals or an intermittent-fasting eating window.
- Added a recipe browser with rule checks and frequency logging.
- Added “My Tayyibat Journey” daily check-in with weight, sleep, digestion, energy and streak history.
- Added a Tayyibat learning game with level mode (10 questions / 3 lives) and a 45-second speed mode.
- Added a dedicated Intelligence overlay integrated with the existing v3.0 interface while retaining the v3.0 nutrition guide, workouts, fasting, weight, wellness, scanners, reports and bilingual UI.

Data / safety notes:
- The Tayyibat engine is a source-system classification snapshot, not medical advice or a medical nutrition guideline.
- Where pages on altayebaat.com disagree, the app shows Needs Review and the conflict explanation.
- Nutrition values remain generic references and may vary by brand, recipe and preparation.
