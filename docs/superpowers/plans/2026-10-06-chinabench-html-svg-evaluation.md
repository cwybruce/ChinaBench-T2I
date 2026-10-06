# ChinaBench HTML/SVG Evaluation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one reusable static HTML/CSS/SVG evaluation viewer that renders all 30 ChinaBench-T2I V0.1 cases as explainable atomic-check animations while keeping real model outputs separate as evidence.

**Architecture:** Add a declarative case-data layer, one shared SVG scene renderer, one evaluation-viewer controller, and one shared stylesheet. Existing per-case URLs become lightweight compatibility wrappers that route into the shared viewer. Official scores continue to come only from reviewed run data.

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript ES2020+, inline SVG, JSON, GitHub Pages, Node.js validation scripts with no third-party runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-06-chinabench-html-svg-evaluation-design.md`

## Global Constraints

- V0.1 contains exactly 30 tracked cases: 24 core + 6 anchor.
- Every rubric remains scored out of 10.
- SVG is labeled `SPEC ILLUSTRATION`; real generated images are labeled `MODEL OUTPUT`.
- SVG schematic state must never be used as official evidence or official score.
- Pending results stay pending; do not synthesize pass/fail or totals.
- Supported atomic states: `pending`, `pass`, `fail`, `skipped`, `n/a`.
- Dependencies must be acyclic and must reference existing nodes.
- Parent absence prevents dependent children from earning points.
- Static GitHub Pages only: no backend, database, WebGL, account system, browser-side generation, or AI auto-judge.
- Existing `CB-001.html` … `CB-A06.html` URLs must continue to resolve.
- Viewer must support mobile layout, keyboard controls, and `prefers-reduced-motion`.

## Review Focus

1. A case with an absent parent entity must not allow dependent attribute/action nodes to score.
2. A pending run must never render green pass states or a numeric official total.
3. Chinese-text cases must preserve exact Unicode strings such as “春”, “福”, “春风入户”, “喜气盈门”, “万事如意”.
4. Legacy detail URLs must preserve the selected test ID instead of landing on a generic first case.
5. Missing or malformed scene data must fail safely with a readable spec fallback rather than blanking the page.

---

## File Structure

### Create
- `web/data/cases-v0.1.json` — derived 30-case viewer data, including rubric node IDs, dependencies, scene specs.
- `web/css/eval-viewer.css` — all shared layout, status, animation, responsive and reduced-motion styles.
- `web/js/scene-renderer.js` — declarative scene-spec → SVG renderer.
- `web/js/eval-viewer.js` — case loading, result integration, animation state machine, controls.
- `web/results/case.html` — canonical shared case viewer.
- `scripts/build-viewer-data.mjs` — deterministic builder from benchmark/runs to viewer JSON.
- `scripts/validate-viewer.mjs` — schema/dependency/render-input validation.
- `tests/viewer-data.test.mjs` — data and dependency tests.
- `tests/viewer-render.test.mjs` — static renderer/controller contract tests.

### Modify
- `web/results/index.html` — new filterable benchmark overview linking to the shared viewer.
- `web/results/CB-001.html` … `web/results/CB-024.html` — compatibility redirects.
- `web/results/CB-A01.html` … `web/results/CB-A06.html` — compatibility redirects.
- `.github/workflows/pages.yml` — publish data/js/css assets and run validation before deploy.
- `README.md` or `web/README.md` — document viewer URL and evidence/spec distinction.

---

### Task 1: Deterministic Viewer Data + Dependency Validation

**Files:**
- Create: `scripts/build-viewer-data.mjs`
- Create: `scripts/validate-viewer.mjs`
- Create: `tests/viewer-data.test.mjs`
- Create: `web/data/cases-v0.1.json`

**Interfaces:**
- Consumes: `benchmark/v0.1/questions.json`, `benchmark/v0.1/anchors.json`, `results/chatgpt-image/run-2026-10-06.json`
- Produces: `buildViewerData({core, anchors, run}) -> ViewerCase[]`
- Produces: `validateViewerCases(cases) -> {ok:boolean, errors:string[]}`
- Each `ViewerCase` exposes `id,title,suite,zodiac,difficulty,capabilities,prompt,rubric,evaluation_graph,scene_spec,result`.

- [ ] **Step 1: Write failing data tests**

Test assertions:
- exactly 30 unique IDs
- 24 core + 6 anchor
- every rubric points total 10
- every rubric node has stable `q0...` ID
- dependency targets exist in the same case
- dependency graph is acyclic
- result state is `pending` when atomic scores are null
- exact Chinese strings survive unchanged

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/viewer-data.test.mjs`  
Expected: FAIL because builder/validator do not exist.

- [ ] **Step 3: Implement the minimal builder and validator**

Implement:
- `buildViewerData({core, anchors, run})`
- `validateViewerCases(cases)`
- deterministic JSON output to `web/data/cases-v0.1.json`
- explicit dependency map for V0.1 cases
- initial scene-spec records for all 30 cases, allowing a generic entity/relation fallback

- [ ] **Step 4: Run build + tests**

Run:
- `node scripts/build-viewer-data.mjs`
- `node scripts/validate-viewer.mjs web/data/cases-v0.1.json`
- `node --test tests/viewer-data.test.mjs`

Expected: all PASS and JSON contains exactly 30 cases.

- [ ] **Step 5: Commit**

Commit message: `feat: add declarative ChinaBench viewer data`

---

### Task 2: Shared SVG Scene Renderer

**Files:**
- Create: `web/js/scene-renderer.js`
- Create: `tests/viewer-render.test.mjs`

**Interfaces:**
- Consumes: `scene_spec`, `evaluation_graph`
- Produces: `renderScene(container, caseData) -> RenderHandle`
- `RenderHandle.highlightNode(nodeId, state)`
- `RenderHandle.clearHighlights()`
- `RenderHandle.destroy()`

- [ ] **Step 1: Write failing renderer contract tests**

Cover:
- entity primitives render with stable `data-entity-id`
- relation edges render with `data-relation-id`
- text elements use exact Unicode
- unknown primitive falls back to a labeled benchmark node, not an exception
- highlight accepts `pending/pass/fail/skipped/n-a`

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/viewer-render.test.mjs`  
Expected: FAIL because renderer does not exist.

- [ ] **Step 3: Implement shared renderer**

Implement reusable SVG primitives for:
- animal/entity silhouette cards
- props/instruments/vehicles/architecture/text surfaces
- relation arrows/lines
- count groups
- left/right/front/behind regions
- Chinese text labels
- generic fallback nodes

Do not hand-code a full SVG page per test.

- [ ] **Step 4: Run renderer tests**

Run: `node --test tests/viewer-render.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add reusable SVG benchmark scene renderer`

---

### Task 3: Evaluation Viewer Controller + Shared UI

**Files:**
- Create: `web/results/case.html`
- Create: `web/css/eval-viewer.css`
- Create: `web/js/eval-viewer.js`
- Modify: `tests/viewer-render.test.mjs`

**Interfaces:**
- Consumes: `web/data/cases-v0.1.json`, query `?id=CB-001`
- Produces: shared viewer with Spec View / Result View and animation controls
- Controller functions: `loadCase(id)`, `play()`, `pause()`, `step(delta)`, `reset()`, `setSpeed(multiplier)`

- [ ] **Step 1: Add failing controller/static contract tests**

Assert:
- invalid/missing ID shows readable error/fallback
- pending result never displays numeric total or pass-green rubric state
- reviewed result total equals sum of awarded atomics
- Spec View is labeled `SPEC ILLUSTRATION`
- Result View is labeled `MODEL OUTPUT`
- keyboard controls exist
- reduced-motion CSS exists

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/viewer-render.test.mjs`  
Expected: FAIL for missing viewer/controller files.

- [ ] **Step 3: Implement viewer**

Layout:
- left: animated SVG spec scene
- right: prompt, tags, checklist, dependency labels, result summary
- mode toggle: Spec / Model Output
- controls: Play, Pause, Reset, Previous Step, Next Step, 0.5x/1x/2x

Animation states:
`PROMPT LOCKED → PARSE → BUILD GRAPH → VERIFY → PROPAGATE → AGGREGATE`.

Pending result animation uses neutral states only.

- [ ] **Step 4: Run tests**

Run: `node --test tests/viewer-render.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add shared animated evaluation viewer`

---

### Task 4: Five Representative Cases Must Render Correctly

**Files:**
- Modify: `web/data/cases-v0.1.json` via `scripts/build-viewer-data.mjs`
- Modify: `tests/viewer-data.test.mjs`
- Modify: `tests/viewer-render.test.mjs`

**Interfaces:**
- Uses renderer/controller from Tasks 2–3
- Produces explicit scene/dependency coverage for `CB-001`, `CB-007`, `CB-022`, `CB-A05`, `CB-A06`

- [ ] **Step 1: Add case-specific failing tests**

Assert:
- CB-001 exposes three ordered mice, three colors, middle-lantern binding
- CB-007 distinguishes left-white-rabbit tea action from right-gray-rabbit tray action
- CB-022 renders exact “春” node and no-extra-text check
- CB-A05 exposes 12 zodiac entity nodes and one complete-ring relation
- CB-A06 preserves all three exact couplet strings and right/left/top placement constraints

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/viewer-data.test.mjs tests/viewer-render.test.mjs`

- [ ] **Step 3: Implement explicit scene specs for the five cases**

Use only shared primitives. If a primitive is missing, add it generically to the renderer rather than embedding case-specific markup in `case.html`.

- [ ] **Step 4: Rebuild and run tests**

Run:
- `node scripts/build-viewer-data.mjs`
- `node scripts/validate-viewer.mjs web/data/cases-v0.1.json`
- `node --test tests/*.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: cover representative ChinaBench SVG cases`

---

### Task 5: Convert Remaining 25 V0.1 Cases

**Files:**
- Modify: `scripts/build-viewer-data.mjs`
- Regenerate: `web/data/cases-v0.1.json`
- Modify: `tests/viewer-data.test.mjs`

**Interfaces:**
- Uses existing `scene_spec` grammar only.
- Produces complete scene/dependency data for all 30 V0.1 cases.

- [ ] **Step 1: Add failing full-coverage test**

Assert for all 30:
- non-empty `scene_spec.entities`
- every rubric node maps to at least one entity/relation/text/negative-constraint visualization or a deliberate generic rubric node
- no unknown capability tag
- no dependency cycle

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/viewer-data.test.mjs`

- [ ] **Step 3: Add remaining scene specs**

Cover all remaining core and anchor prompts using shared primitives. Do not add page-specific JS branches unless a genuinely new reusable relation type is required.

- [ ] **Step 4: Rebuild and validate**

Run:
- `node scripts/build-viewer-data.mjs`
- `node scripts/validate-viewer.mjs web/data/cases-v0.1.json`
- `node --test tests/*.test.mjs`

Expected: exactly 30 valid cases.

- [ ] **Step 5: Commit**

Commit message: `feat: render all ChinaBench V0.1 cases`

---

### Task 6: Results Overview + Legacy URL Compatibility

**Files:**
- Modify: `web/results/index.html`
- Modify: `web/results/CB-001.html` … `CB-024.html`
- Modify: `web/results/CB-A01.html` … `CB-A06.html`
- Modify: `tests/viewer-render.test.mjs`

**Interfaces:**
- Overview links to `case.html?id=<TEST_ID>`
- Legacy wrapper preserves its own case ID.

- [ ] **Step 1: Add failing navigation tests**

Assert:
- overview contains all 30 IDs
- filters for suite/capability/zodiac/difficulty exist
- legacy `CB-022.html` redirects specifically to `case.html?id=CB-022`
- pending result card says pending, not numeric score

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/viewer-render.test.mjs`

- [ ] **Step 3: Implement overview and wrappers**

Use one compact wrapper template with only the target ID changed.

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `web: route all ChinaBench cases through shared viewer`

---

### Task 7: Pages Deployment + Final Verification

**Files:**
- Modify: `.github/workflows/pages.yml`
- Modify: `web/README.md`
- Optionally modify: `README.md`

**Interfaces:**
- GitHub Actions must run validation before publishing.
- Published site includes `web/results`, `web/data`, `web/js`, `web/css`, `web/svg`, `web/assets`.

- [ ] **Step 1: Add deployment/static-asset assertions**

In tests, verify workflow references all required public directories and invokes `node scripts/validate-viewer.mjs web/data/cases-v0.1.json`.

- [ ] **Step 2: Run and confirm current workflow fails the new assertion**

Run: `node --test tests/*.test.mjs`

- [ ] **Step 3: Update Pages workflow and docs**

Build sequence:
1. checkout
2. run viewer data validation
3. copy static site + all viewer assets
4. configure Pages
5. upload artifact
6. deploy

- [ ] **Step 4: Full local verification**

Run:
- `node scripts/build-viewer-data.mjs`
- `node scripts/validate-viewer.mjs web/data/cases-v0.1.json`
- `node --test tests/*.test.mjs`

Expected:
- 30/30 cases valid
- 0 dependency errors
- all tests pass

- [ ] **Step 5: Push and verify GitHub Actions**

Expected:
- Pages workflow conclusion: `success`
- public overview loads
- `case.html?id=CB-001`, `CB-022`, `CB-A05`, `CB-A06` load
- legacy `CB-001.html` resolves to the correct case
- model output toggle is visible only when result image exists
- pending cases do not show official scores

- [ ] **Step 6: Commit**

Commit message: `ci: validate and publish ChinaBench evaluation viewer`

---

## Plan Self-Review

- Spec coverage: all design sections map to Tasks 1–7.
- Evidence separation: covered in Tasks 3 and 7.
- Dependency semantics: covered in Tasks 1, 3, and 5.
- 30-case coverage: covered in Tasks 1 and 5.
- Representative hard cases: covered in Task 4.
- Legacy URLs: covered in Task 6.
- Accessibility/reduced motion: covered in Task 3.
- GitHub Pages publishing: covered in Task 7.
- No new backend or third-party runtime dependency is introduced.
