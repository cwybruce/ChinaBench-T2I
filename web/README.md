# HTML Test Bench

`index.html` 是 ChinaBench-T2I 的静态测试台。

功能：

- 加载 24 道 Core + 6 道 Anchor
- 按套件、生肖、能力筛选
- 查看固定 Prompt
- 逐项勾选 Atomic Rubric
- 自动计算单题与平均分
- 记录 Generator / Evaluator / 图片路径 / 失败说明
- 使用 localStorage 保存当前浏览器进度
- 导出标准结果 JSON

## 打开方式

由于页面通过 `fetch()` 读取仓库 JSON，不建议直接使用 `file://` 双击打开。

可使用任意静态 HTTP Server，或后续启用 GitHub Pages。
