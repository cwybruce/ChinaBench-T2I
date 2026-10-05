# ChinaBench-T2I

> A Chinese-culture-centered benchmark for evaluating text-to-image models.

**ChinaBench-T2I** 是一套以十二生肖与中国传统文化为统一载体的文生图（Text-to-Image）能力测试框架。

它不以“谁画得更漂亮”为核心，而是把生成能力拆成可验证、可比较、可复测的能力单元：对象、数量、属性绑定、空间关系、动作关系、组合、中文文字与中国文化准确性。

## V0.1 已完成

- **Core Suite：24 题** — 十二生肖每个生肖 2 题
- **Anchor Suite：6 题** — 长期固定回归测试
- **总计：30 个测试**
- 每题固定 **10 分原子评分**
- 已建立 ChatGPT Image Generation 基线 Run Manifest
- 已建立交互式 HTML Test Bench
- 已通过 V0.1 数据结构自检

## 核心方法

```text
经典 Benchmark
DrawBench / PartiPrompts / DDPO / T2I-CompBench / GenEval / TIFA / DPG-Bench
                              ↓
                         能力拆解
                              ↓
               十二生肖 × 中国传统文化
                              ↓
             反常组合 / 控制变量 / 长指令
                              ↓
                       原子条件评分
                              ↓
                     ChinaBench Score
```

## 8 个能力维度

| ID | 能力 |
|---|---|
| C1 | Subject Recognition |
| C2 | Counting |
| C3 | Attribute Binding |
| C4 | Spatial Relation |
| C5 | Action Relation |
| C6 | Composition |
| C7 | Chinese Text |
| C8 | Cultural Accuracy |

## 快速入口

- `benchmark/v0.1/questions.json` — 24 题机器可读真相源
- `benchmark/v0.1/anchors.json` — 6 道 Anchor
- `benchmark/v0.1/questions.md` — 24 题浏览表
- `benchmark/v0.1/anchor-questions.md` — Anchor 详细评分
- `scoring/rubric.json` — 机器可读评分规则
- `web/index.html` — 交互式测试台
- `results/chatgpt-image/run-2026-10-06.json` — 当前基线结果槽位
- `tests/v0.1-validation.md` — V0.1 自检报告

## 结果模型标注

每条正式结果必须同时写：

- **Generator Product / Model**
- **Evaluator Model**

当前默认：

```text
Generator Product: ChatGPT Image Generation
Generator Model: exact model undisclosed
Evaluator Model: GPT-5.6 Sol
```

不能把 GPT-5.6 Sol 错写成图像生成模型。

## 正式评分纪律

1. Prompt 原样输入。
2. 默认使用 first image，不挑图。
3. 没有真实生成图，不给正式分。
4. 每题逐项 Atomic Scoring。
5. 模型名、日期、Selection Policy、图片必须可追踪。
6. 视觉美感不能抵消指令、关系、文字或文化错误。

## 当前状态

**V0.1 / Private Benchmark Ready**

下一阶段是执行真实模型 Run，并把图片与分数写回结果集。

---

Created: 2026-10-06
