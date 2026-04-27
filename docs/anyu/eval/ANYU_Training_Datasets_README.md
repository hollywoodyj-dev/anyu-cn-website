# AnYu Training Datasets

This folder contains Wisewave-provided training sets in machine-readable JSONL.

## Files

- `anyu_household_response_batch1_001_025.jsonl`
- `anyu_household_response_batch1_026_050.jsonl`
- `anyu_household_response_batch2_051_100.jsonl`
- `anyu_continuous_dialogue_3turn_batch1.jsonl`

## Notes

- Single-turn set now includes ids `1-100` (complete).
- All records keep the same schema:
  - single-turn: `id`, `input`, `emotion`, `response`, `risk_level`, `style_tag`
  - 3-turn: `scene`, `turns[3]`, `risk_level`

## Validate

Run:

`npm run eval:validate`

It checks:

- JSONL parsing
- required fields
- risk level enum
- 3-turn structure
- missing ids in single-turn corpus
