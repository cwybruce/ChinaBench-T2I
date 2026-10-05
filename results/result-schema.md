# Result Schema

每一次正式测试必须同时记录 **生成模型** 与 **评分模型**。

## 必填元数据

- Test ID
- Prompt
- Generator Product
- Generator Model
- Generator Model Visibility: public / undisclosed
- Generation Date
- Image Count
- Selection Policy: first image / best-of-N / fixed seed
- Image Size
- Seed（如可用）
- Evaluator Model
- Evaluator Type: human / model / hybrid
- Atomic Scores
- Total Score
- Failure Notes
- Result Image Path

## 当前 ChatGPT 基线命名

在当前环境下：

- **Evaluator Model:** GPT-5.6 Sol
- **Generator Product:** ChatGPT Image Generation
- **Generator Model:** exact model name not exposed by the product interface
- **Generator Model Visibility:** undisclosed

因此正式结果中不得把“GPT-5.6 Sol”直接写成生图模型。

推荐展示格式：

> Generator: ChatGPT Image Generation (exact model undisclosed)
> Evaluator: GPT-5.6 Sol

## 评分纪律

1. 没有实际生成图，不给正式分数。
2. 不用“预计能做到”替代实测。
3. 每题按 Atomic Conditions 逐项打分。
4. 如果模型名不可见，明确标注 undisclosed，而不是猜测型号。
5. 同一排行榜只比较相同 Selection Policy 的结果。
