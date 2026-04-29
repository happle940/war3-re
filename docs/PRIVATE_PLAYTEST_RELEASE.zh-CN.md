# GitHub Pages 私测发布说明

最后更新：2026-04-29

## 结论

当前目标是 `R16 GitHub Pages 私测发布版`：让朋友通过浏览器链接打开并试玩当前 Human 私有 alpha。

试玩地址：

https://happle940.github.io/war3-re/

这个地址只用于受控试玩、里程碑回看和反馈收集。不要包装成公开发布、完整 War3-like demo、完整 Human race 或 release-ready。

## 朋友试玩口径

可以这样发：

```text
这是一个浏览器 RTS 私有 alpha。当前可以试玩 Human vs AI 的短局切片：采集、建造、训练、英雄、基础战斗、地图目标、暂停、重开和结果反馈。它不是正式发布版，也不是完整 War3 复刻。

试玩重点：
1. 能不能稳定打开和开始一局。
2. 开局基地、资源、农民、按钮是否看得懂。
3. 选择、右键命令、建造、训练是否可信。
4. AI 是否像一个会活动的对手。
5. 默认纯战场是否更像打开一局 RTS；顶部“显示面板”按钮 / F9 恢复大面板后，信息是否仍可理解。
6. 暂停、结果、重开、试玩信息是否清楚。

如果出问题，请发浏览器、设备、复现步骤、截图，以及最阻止继续玩的 1-3 个问题。
```

## 发布验收

每次准备给朋友试玩前，至少通过：

```bash
npm run build
npm run typecheck:app
npm run test:release
```

`test:release` 是 GitHub Pages 私测发布专用验收。它覆盖：

- 页面可打开并进入可玩开局。
- 玩家能选择、采集、训练，AI 会活动。
- R15 试玩信息、Known Issues、反馈包、恢复按钮可用。
- R1-R15 关键里程碑信号仍能运行时读取。
- menu / pause / results 的返回和重开路径可用。

完整回归仍然保留在 `npm run test:runtime`，但 Pages 部署先以发布 smoke 为门禁，避免历史全量套件把私测链接阻塞在非发布关键路径上。

## GitHub Pages 设置

仓库 Pages 设置应选择：

- Source：`GitHub Actions`
- 工作流：`.github/workflows/deploy-pages.yml`
- 发布分支：`main`

推送到 `main` 后，工作流会构建 `dist`，上传 Pages artifact，并部署到 GitHub Pages。

## 当前不能承诺

- 不能承诺多人、战役、回放、天梯、完整四族或完整 Human race。
- 不能承诺最终美术、最终音效、最终技能特效或完整 War3 parity。
- 不能承诺所有浏览器/设备都稳定；当前仍需要真实试玩反馈补浏览器矩阵。
- 不能把 GitHub Pages 链接当成正式公开发布入口。
