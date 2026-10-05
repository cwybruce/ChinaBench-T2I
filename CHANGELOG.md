# Changelog

## 2026-10-06 — V0.1 Benchmark Ready

- 完成 24 道 Core Questions：十二生肖每个生肖 2 题
- 完成 6 道长期 Anchor Questions
- 总计建立 30 个可追踪测试
- 所有题目采用 10 分 Atomic Rubric
- 建立 C1–C8 八维能力体系
- 建立机器可读 `questions.json` / `anchors.json` / `rubric.json`
- 建立 Generator / Evaluator 双模型元数据规范
- 当前 Evaluator：GPT-5.6 Sol
- 当前 ChatGPT Generator 记录为：ChatGPT Image Generation (exact model undisclosed)
- 建立 `results/chatgpt-image/run-2026-10-06.json` 正式 Run Manifest
- 建立交互式 `web/index.html` 测试台
- HTML 支持筛选、逐项评分、自动计算、本地保存、导出结果 JSON
- 完成 V0.1 结构校验：
  - 12 个生肖全部覆盖
  - 每生肖恰好 2 道 Core
  - 30 个测试 ID 无重复
  - 每题 Rubric 严格等于 10 分
  - 所有能力标签均为 C1–C8
- 规定：无真实生成图不得填写正式模型分数

## 2026-10-06 — Initial Draft

- 初始化 ChinaBench-T2I 私有仓库
- 明确十二生肖 × 中国传统文化的 Benchmark 方向
- 建立初始评分框架与 Benchmark 设计谱系
