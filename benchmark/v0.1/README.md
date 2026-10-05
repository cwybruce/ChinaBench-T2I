# ChinaBench-T2I V0.1

## Composition

- **Core Suite:** 24 questions — 12 zodiac animals × 2
- **Anchor Suite:** 6 long-term regression questions
- **Total tracked tests:** 30

## Why Core + Anchor are separate

Core Suite gives balanced zodiac coverage. Anchor Suite preserves several high-value regression tests that do not fit the strict “two questions per zodiac” matrix, such as the full 12-zodiac counting test and Chinese couplet layout test.

## Files

- `questions.json` — canonical 24-question core dataset
- `questions.md` — human-readable core index
- `anchors.json` — canonical 6-question anchor dataset
- `anchor-questions.md` — human-readable anchor rubric
- `../../scoring/rubric.json` — machine-readable scoring policy

## Official run policy

A score becomes official only when:

1. A real image is generated.
2. Generator metadata is recorded.
3. The image is scored item-by-item against the fixed rubric.
4. The result image is retained or linked.
5. Selection policy is disclosed.
