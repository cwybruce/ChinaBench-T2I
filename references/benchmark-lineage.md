# Benchmark Lineage

本项目不从零发明测试方法，而是吸收经典 T2I Benchmark 的设计思想，再加入中国文化测试层。

## DrawBench

核心贡献：

- 人工构造困难 Prompt
- 覆盖颜色、数量、空间、文字、复杂组合
- 使用异常关系打破模型统计惯性

## PartiPrompts

核心贡献：

- 内容类别 × 难度维度矩阵
- 大规模人工与筛选 Prompt
- 强调多样化能力覆盖

## DDPO / RL-Diffusion

经典案例：

> a parrot driving a car

关键思想：

- unseen subject
- unseen activity
- 组合泛化

ChinaBench 对应设计：

> 生肖主体 × 低共现动作 / 反常动作

## T2I-CompBench

核心贡献：

- 属性绑定
- 空间关系
- 非空间关系
- 复杂组合

## GenEval

核心贡献：

- 简单、可自动判定的原子能力测试
- 对象、数量、颜色、位置、属性绑定

## TIFA

核心贡献：

- 将 Prompt 分解成事实问题
- 使用问答方式检查生成图中的细粒度事实

## DPG-Bench

核心贡献：

- Dense Prompt
- 多实体、多属性、多关系同时成立
- 测试长 Prompt 遵循能力

## ChinaBench-T2I 的增量

在上述能力框架之上增加：

- 中国文字
- 中国文化对象
- 中国文化关系
- 中国龙与西方龙等文化先验冲突
- 生肖统一角色体系
- 中国传统节日、器物、民俗与艺术形式
