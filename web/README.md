# ChinaBench-T2I Web Viewer

The V0.1 viewer uses one shared HTML/CSS/SVG renderer for all 30 cases.

- `results/index.html` — filterable results overview.
- `results/case.html?id=CB-001` — canonical case viewer.
- `data/cases-v0.1.json` — declarative case, rubric, dependency and scene data.
- `js/scene-renderer.js` — SVG specification renderer.
- `js/eval-viewer.js` — animation and result-state controller.

## Evidence rule

`SPEC ILLUSTRATION` explains what the benchmark checks. It is never model evidence.
`MODEL OUTPUT` is the real generated image. Official scores only appear after atomic review.
