# ChinaBench-T2I

> A Chinese-culture-centered benchmark for evaluating text-to-image models.

**ChinaBench-T2I** 是一套以十二生肖与中国传统文化为统一载体的文生图（Text-to-Image）能力测试框架。

它不是“看谁画得更好看”，而是把图像生成拆成可以被验证、比较和复测的能力单元：对象、数量、属性绑定、空间关系、动作关系、中文文字、文化准确性、长指令遵循与组合泛化。

## 核心目标

1. 建立一套具有中国文化辨识度、但底层能力定义通用的 T2I Benchmark。
2. 使用固定题目与原子评分，让不同模型、不同版本能够横向与纵向比较。
3. 区分“视觉质量”与“是否真正完成题目”，避免审美掩盖指令失败。
4. 保留一组长期不变的 Anchor Questions，观察模型能力演进。
5. 记录每道题的设计来源、能力目标、失败模式与评分依据。

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

## V0.1 方向

第一版先做 **24 题**：

- 十二生肖作为统一角色系统
- 每个生肖 2 道题
- 覆盖基础识别、计数、属性绑定、空间、动作、中文、文化知识、复杂指令
- 其中 6 道设为长期固定 Anchor Questions

## 评分原则

总分 100：

| 维度 | 权重 |
|---|---:|
| Instruction Following | 20 |
| Object / Counting | 15 |
| Attribute Binding | 10 |
| Spatial Relationship | 10 |
| Action Relationship | 10 |
| Chinese Text | 15 |
| Cultural Accuracy | 15 |
| Visual Quality | 5 |

**视觉美感只占 5%。** Benchmark 的第一目标是“答对题”，不是“画得漂亮”。

## 仓库结构

```text
ChinaBench-T2I/
├── docs/               # 设计理念、能力体系、路线图
├── benchmark/          # 题库与版本
├── scoring/            # 评分规则
├── references/         # 经典 Benchmark 来源与设计谱系
├── results/            # 模型测试结果与排行榜
└── CHANGELOG.md
```

## 当前状态

**V0.1 / Private Draft**

当前重点不是快速扩题，而是先把：

> 能力定义 → 出题原则 → 原子评分 → Anchor Questions

这条闭环建立稳定。

---

Created: 2026-10-06
