# Results

## 当前基线

`chatgpt-image/run-2026-10-06.json` 已建立完整 30 题结果槽位：

- Generator Product: **ChatGPT Image Generation**
- Generator Model: **exact model undisclosed**
- Evaluator Model: **GPT-5.6 Sol**
- Selection Policy: **first_image**
- 当前状态: **awaiting_generation**

注意：这不是模型得分。没有真实生成图时，`total_score` 必须保持 `null`。

## 正式结果流程

1. 使用固定 Prompt 生成真实图片。
2. 保存图片或填写稳定路径。
3. 用固定 Atomic Rubric 逐项判定。
4. 写入生成模型与评分模型信息。
5. 汇总结果后再进入 leaderboard。

## 禁止

- 不允许根据“模型大概能做到”填写预测分。
- 不允许只挑最好的一张却标记为 first-image。
- 不允许隐藏失败图。
