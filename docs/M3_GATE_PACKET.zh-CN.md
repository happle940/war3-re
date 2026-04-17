# M3 Gate Packet — War3 感垂直切片

> 给用户的确认包草稿。当前用于 Codex/GLM 提前整理 `M3` 判断脚本，不代表 `M3` 已经达到可人工确认状态。
> 当前项目处于 `M2-M7 baton mode`：如果用户暂时不做人工裁决，Codex/GLM 继续推进后续客观工作，但不能把 `M3` 记成“已人工通过”。

---

## 目标问题

`M3` 要回答的不是“有没有再修几个数值”，而是：

**它是不是开始像一个有 War3 味的 RTS 战场，而不是网页原型。**

---

## 人工确认前的客观入口条件

在让用户回看 `M3` 之前，Codex/GLM 至少要准备好这些客观包：

- `tests/m3-scale-measurement.spec.ts`
- `tests/m3-base-grammar-regression.spec.ts`
- `tests/m3-camera-hud-regression.spec.ts`
- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`
- 相关 runtime packs 通过
- 本地浏览器 / Playwright / Vite 残留清理完成

补充参考规格：

- [docs/M3_WAR3_FEEL_BENCHMARK.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/M3_WAR3_FEEL_BENCHMARK.zh-CN.md)

---

## 手动确认时要看的东西

### 第一眼空间感

- 基地是不是一眼就能读成 RTS 基地
- Town Hall、金矿、树线、出口、兵营位置关系是否像有意布局，而不是随机摆放

### 比例和层级

- Worker / Footman / Farm / Barracks / Town Hall 的体量层级是否成立
- 金矿和基地之间是否既足够近，能读出经济路径，又不会挤成一团

### 镜头与 HUD

- 默认镜头是否能同时读清基地核心、矿区和主要操作区
- HUD 是否遮挡主战场或破坏 RTS 读图
- 选择圈、血条、反馈效果是否可读

### 视觉方向

- 即便还是 proxy，也要看起来属于同一个方向
- 不能再像混搭调试场景

---

## 你需要回答的问题

1. 第一眼是不是 RTS 战场，而不是网页原型？
2. 基地 / 金矿 / 树线 / 出口关系是不是有明确空间语法？
3. 单位和建筑比例是不是可以接受？
4. 镜头 framing 是否足够 RTS-like？
5. 视觉方向是否值得继续朝这个 War3-like 方向推进？

---

## 你只需要选一个结论

- `通过`
- `通过但有美术债`
- `失败：比例问题`
- `失败：地形问题`
- `失败：镜头问题`
- `失败：视觉身份问题`

---

## 当前执行备注

- 本文件当前是 gate packet 草稿，不代表 `M3` 已可人工确认。
- 在 baton mode 下，如果用户暂时不介入，Codex/GLM 可以继续推进 `M4`、`M5`、`M6`、`M7` 的客观工作。
- 只有当用户亲自回看并给出结论时，`M3` 才能从“客观已准备”变成“正式通过”。
