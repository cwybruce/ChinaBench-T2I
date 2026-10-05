# ChinaBench-T2I V0.1 — Core Questions

V0.1 核心题库共 **24 题**，十二生肖每个生肖恰好 2 题；另有 6 道长期回归 Anchor，见 `anchor-questions.md` / `anchors.json`。

> 结构化真相源：`questions.json`。本文件用于快速浏览。

| ID | 生肖 | 标题 | 难度 | 能力 | 满分 | 状态 |
|---|---|---|---:|---|---:|---|
| CB-001 | 鼠 | 三鼠颜色与位置 | L2 | C1/C2/C3/C4 | 10 | Ready |
| CB-002 | 鼠 | 老鼠拉二胡 | L3 | C1/C5/C8 | 10 | Ready |
| CB-003 | 牛 | 黑牛在白马左侧 | L2 | C1/C3/C4 | 10 | Ready |
| CB-004 | 牛 | 水牛放燕子风筝 | L3 | C1/C5/C8 | 10 | Ready |
| CB-005 | 虎 | 双虎围巾属性绑定 | L2 | C1/C2/C3/C4 | 10 | Ready |
| CB-006 | 虎 | 老虎打中国鼓 | L3 | C1/C5/C8 | 10 | Ready |
| CB-007 | 兔 | 双兔茶具动作绑定 | L4 | C1/C3/C5/C6/C8 | 10 | Ready |
| CB-008 | 兔 | 月宫玉兔捣药 | L3 | C1/C5/C8 | 10 | Ready |
| CB-009 | 龙 | 中国龙形态辨识 | L3 | C1/C8 | 10 | Ready |
| CB-010 | 龙 | 龙与猴下中国象棋 | L4 | C1/C5/C6/C8 | 10 | Ready |
| CB-011 | 蛇 | 蛇与竹石灯笼空间关系 | L2 | C1/C3/C4/C8 | 10 | Ready |
| CB-012 | 蛇 | 生肖蛇打太极 | L4 | C1/C5/C8 | 10 | Ready |
| CB-013 | 马 | 四色四马计数 | L3 | C1/C2/C3/C4 | 10 | Ready |
| CB-014 | 马 | 马操作活字印刷 | L5 | C1/C5/C6/C8 | 10 | Ready |
| CB-015 | 羊 | 绵羊与山羊区分 | L3 | C1/C2/C3/C4 | 10 | Ready |
| CB-016 | 羊 | 白羊弹琵琶 | L3 | C1/C5/C8 | 10 | Ready |
| CB-017 | 猴 | 猴子刺绣牡丹 | L4 | C1/C5/C6/C8 | 10 | Ready |
| CB-018 | 猴 | 双猴琴茶动作绑定 | L4 | C1/C4/C5/C6/C8 | 10 | Ready |
| CB-019 | 鸡 | 公鸡划龙舟猴击鼓 | L4 | C1/C4/C5/C6/C8 | 10 | Ready |
| CB-020 | 鸡 | 鸡狗猪三体空间关系 | L4 | C1/C4/C6 | 10 | Ready |
| CB-021 | 狗 | 柴犬穿舞狮服 | L4 | C1/C6/C8 | 10 | Ready |
| CB-022 | 狗 | 狗写“春”字 | L4 | C1/C5/C7/C8 | 10 | Ready |
| CB-023 | 猪 | 猪兔包饺子动作绑定 | L4 | C1/C5/C6/C8 | 10 | Ready |
| CB-024 | 猪 | 双灯笼中文与位置 | L5 | C1/C4/C7/C8 | 10 | Ready |

## 能力代码

- **C1** — Subject Recognition
- **C2** — Counting
- **C3** — Attribute Binding
- **C4** — Spatial Relation
- **C5** — Action Relation
- **C6** — Composition
- **C7** — Chinese Text
- **C8** — Cultural Accuracy

## 执行规则

1. Prompt 原样输入，不针对某个模型改写。
2. 默认使用 **first image**，不挑图；如使用 best-of-N，必须单独标注。
3. 每题按照 JSON 中的 rubric 逐项评分，总分 10。
4. 正式结果必须记录生成产品、生成模型可见性、评分模型、日期和图片路径。
5. 没有真实生成图，不给模型正式分数。
