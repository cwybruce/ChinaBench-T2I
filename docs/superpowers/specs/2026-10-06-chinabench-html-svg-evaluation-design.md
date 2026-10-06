# ChinaBench-T2I HTML/SVG Evaluation UI — Design Spec

Date: 2026-10-06  
Status: design approved in conversation; implementation not started  
Repository: cwybruce/ChinaBench-T2I

## 1. Goal

Replace the current duplicated static result-detail pages with one reusable, explainable benchmark viewer.

The viewer must make the evaluation logic visible:

Prompt → atomic conditions → dependency graph → animated verification → score/failure analysis.

The HTML/SVG scene is a **test-spec illustration**, not the model output. Real model outputs remain separate evidence and must never be visually confused with the schematic.

V0.1 scope:
- 24 core questions
- 6 anchor questions
- 30 total cases
- 8 capability classes C1-C8

## 2. Design principle

ChinaBench should not be a score table with opaque numbers.

Each case should answer four questions:
1. What exactly does the prompt ask?
2. What atomic conditions are checked?
3. Which conditions depend on other conditions?
4. Why did the model pass or fail?

The visual language combines:
- TIFA-style atomic question decomposition
- GenEval-style primitive/object/attribute/relation checks
- dependency-aware evaluation DAGs
- ChinaBench cultural-accuracy checks

## 3. Approaches considered

### A. Thirty bespoke standalone HTML pages
Pros: fastest to prototype visually.  
Cons: duplicated CSS/JS, hard to fix globally, high drift risk.

### B. Shared renderer + declarative case specifications — chosen
Pros:
- one visual system for all 30 tests
- one bug fix updates every case
- benchmark data and UI stay separable
- easier to add V0.2 cases
- GitHub Pages compatible

Cons:
- requires a small scene grammar and icon library.

### C. Canvas/WebGL animation engine
Pros: most visual freedom.  
Cons: unnecessary complexity, worse inspectability/accessibility, harder static hosting.

## 4. Information architecture

### Results overview
Path: `web/results/index.html`

Shows:
- total cases
- generated/scored/pending state
- capability filters C1-C8
- zodiac filters
- difficulty filters
- case cards
- current score only when a real reviewed score exists

### Case viewer
Canonical path:
`web/results/case.html?id=CB-001`

Existing URLs such as `CB-001.html` remain as thin redirects/wrappers for compatibility.

Desktop layout:

```
┌──────────────────────────────┬───────────────────────────┐
│ TEST SPEC / SVG              │ PROMPT                    │
│                              │                           │
│ entities + props + arrows    │ capability tags           │
│ animated callouts            │                           │
│ relation highlight           │ ATOMIC CHECKLIST          │
│                              │ q0 ...                     │
│                              │ q1 depends on q0           │
│                              │ q2 depends on q0,q1        │
│                              │                           │
│                              │ RESULT / SCORE             │
└──────────────────────────────┴───────────────────────────┘
```

Case viewer has two evidence modes:
- **Spec View**: pure HTML/CSS/SVG schematic. Always available.
- **Result View**: real model-generated image, only when an actual result exists.

The two modes must be labeled clearly.

## 5. Animation sequence

Every case uses the same sequence:

1. `PROMPT LOCKED`
2. `PARSE` — prompt clauses highlight
3. `BUILD GRAPH` — atomic nodes appear
4. `VERIFY` — q0...qn checked one by one
5. dependency propagation
6. `AGGREGATE`
7. final score/failure summary

Controls:
- Play
- Pause
- Reset
- Step forward
- Step backward
- Animation speed: 0.5x / 1x / 2x

No animation is required for reading the content; reduced-motion mode must remain usable.

## 6. Dependency-aware atomic model

Each rubric item becomes a node.

Example:

```json
{
  "id": "q4",
  "capability": "C5",
  "label": "中间白鼠提着红灯笼",
  "points": 1,
  "depends_on": ["q0", "q2"],
  "kind": "action_relation"
}
```

Node states:
- pending
- pass
- fail
- skipped
- n/a

Rules:
- If a required parent entity is absent, dependent attribute/action/relation nodes are skipped or failed according to rubric policy.
- A child cannot earn points when its required parent does not exist.
- Negative constraints are independent checks unless explicitly tied to a parent.
- Official total comes only from reviewed atomic results, never from the SVG schematic.

## 7. Scene grammar

The left panel is generated from declarative SVG scene data rather than thirty hand-coded full pages.

Supported primitives:

### Entities
- zodiac animal
- other animal
- person
- prop
- instrument
- vehicle
- architecture
- text plaque / paper / lantern
- environment

### Attributes
- color
- count
- size
- clothing
- Chinese cultural style
- text content

### Relations
- left_of / right_of
- behind / in_front_of
- riding
- holding
- playing
- pouring_into
- writing_on
- connected_to
- facing
- inside / under
- non_overlap

### Rendering
Use a reusable SVG symbol library for:
- 12 zodiac animals
- lantern
- erhu
- drum
- teapot/cup
- moon/mortar
- Chinese dragon
- xiangqi
- bamboo/stone lantern
- kite
- bicycle/car
- guqin/pipa
- embroidery frame
- dragon boat
- lion dance head
- paifang
- red paper/couplets
- dumpling tools

The art style is schematic and benchmark-oriented:
- dark neutral background
- clear silhouettes
- limited accent colors
- green = pass
- red = fail
- amber = pending/skipped
- cyan/blue = neutral relation or structure

## 8. Data files

Add:

`web/data/cases-v0.1.json`

Each case contains:
- id
- title
- suite
- zodiac
- difficulty
- capabilities
- prompt
- rubric
- evaluation_graph
- scene_spec
- expected_failures

Do not duplicate authoritative prompt/rubric content manually when it can be generated from:
- `benchmark/v0.1/questions.json`
- `benchmark/v0.1/anchors.json`

Add:
- `web/js/eval-viewer.js`
- `web/js/scene-renderer.js`
- `web/css/eval-viewer.css`

Optional:
- `web/svg/symbols.svg`

## 9. Result integration

Existing run source:
`results/chatgpt-image/run-2026-10-06.json`

Viewer behavior:
- if `result_image` exists → show Result View toggle
- if atomic scores are null → show `已生成 · 待复核`
- if reviewed → animate real pass/fail states
- if no output → show `待生成`
- never display an estimated score as official

Metadata shown:
- Generator Product
- Generator Model
- Generator Model Visibility
- Generation Date
- Selection Policy
- Generation ID
- Evaluator Model
- Evaluation Type

## 10. Thirty-case conversion

Phase 1 builds the reusable engine and converts representative cases:
- CB-001: counting + attribute + spatial order
- CB-007: multi-subject action binding
- CB-022: Chinese text
- CB-A05: 12-object counting/completeness
- CB-A06: long Chinese text + spatial placement

These five cases cover the hardest renderer patterns.

Phase 2 converts the remaining 25 cases using the same grammar.

## 11. Accuracy guardrails

The SVG illustration must never be used as evidence of model success.

Every case page must display one of:
- `SPEC ILLUSTRATION`
- `MODEL OUTPUT`

Official scoring uses only the model output.

If a model result is absent:
- no pass/fail state is asserted
- no total score is calculated

If a score is pending review:
- animation may demonstrate the rubric structure
- it must use neutral/pending states, not green pass states

## 12. Accessibility / UX

- mobile responsive
- keyboard-accessible controls
- `prefers-reduced-motion` support
- readable without animation
- SVG elements include labels/ARIA descriptions
- color is not the only status cue; use ✓ / ✕ / • / — as well

## 13. Testing

### Data validation
- 30 unique case IDs
- every rubric sums to 10
- every dependency points to an existing node
- no dependency cycles
- all C1-C8 tags valid
- scene spec contains required referenced entities

### UI checks
- all 30 cases render without JS error
- legacy URLs resolve
- mobile layout works
- reduced-motion mode works
- pending cases do not display pass/fail
- reviewed cases display totals consistent with atomic scores

### Deployment
GitHub Pages workflow must publish:
- `web/results`
- `web/data`
- `web/js`
- `web/css`
- `web/svg`
- `web/assets`

## 14. Acceptance criteria

The redesign is complete when:
1. All 30 V0.1 cases open in the shared viewer.
2. Every case has a pure HTML/SVG test-spec visualization.
3. Every rubric is represented as atomic nodes.
4. Dependencies are visible and enforced.
5. Existing real model images remain separately viewable.
6. No schematic is mistaken for model evidence.
7. Pending scores remain pending.
8. GitHub Pages deploy succeeds.
9. Adding a V0.2 case requires data entry, not a new handcrafted page.

## 15. Non-goals for V0.1

Do not add:
- backend server
- user accounts
- database
- WebGL/3D
- AI auto-judge service
- live model generation from the browser
- leaderboard inference from unreviewed scores

Keep V0.1 static, inspectable, reproducible, and easy to extend.
