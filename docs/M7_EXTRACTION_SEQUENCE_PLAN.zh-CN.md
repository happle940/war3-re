# M7 Extraction Sequence Plan

> 用途：在 `Task 33`、`Task 34`、`Task 35` 到来前，先把 M7 的安全抽取顺序和 no-go 边界写死。
> 原则：先抽低风险、已被合同保护的边界；不让 GLM 在 `Game.ts` 里即兴找“看起来能拆”的块。

---

## 1. 进入 M7 前先确认

开始 M7 slice 前，至少要满足：

- `Task 31` 已收口，M4 AI recovery 没有留下明显行为歧义
- `Task 32` 有基本 smoke 方向，release 线不会反向拖住硬化线
- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`
- 相关 runtime packs 处于可复验状态

如果这些前提没站住，先别把工程问题伪装成“可以先抽模块”。

---

## 2. 推荐顺序

### 第 1 步：SelectionController 小切片

目标：只抽“选择相关但不改语义”的边界。

优先抽：

- selection query / lookup helper
- 选中集合到显示层的纯映射
- selection ring / subgroup / box select 的无副作用 helper

不要碰：

- 右键命令语义
- 攻击 / 采集 / rally 判定
- 输入事件时序
- control group 行为定义

最低验证面：

- `tests/selection-input-regression.spec.ts`
- `tests/command-surface-regression.spec.ts` 或等价命令路径证明
- 必要时 `npm run test:runtime`

### 第 2 步：PlacementController 小切片

目标：只抽“放置和 preview 边界”，不顺手改 builder agency、资源扣除或占地语义。

优先抽：

- placement mode state
- ghost / preview helper
- placement validation boundary
- 与 `PlacementValidator` 的桥接

不要碰：

- builder 指派规则
- 建造资源支付时机
- build progress 语义
- 取消建造 / 续建 / 占地释放的外部行为

最低验证面：

- `tests/building-agency-regression.spec.ts`
- `tests/construction-lifecycle-regression.spec.ts`
- `tests/pathing-footprint-regression.spec.ts`
- 必要时 `npm run test:runtime`

### 第 3 步：Coverage gap sweep

在两个 extraction slice 都落稳后，再做 coverage gap sweep。

优先补：

- HUD cache / command-card 状态漂移
- death cleanup 后 stale reference
- selection/placement 抽取后暴露出来的等价性缺口

不要把 sweep 变成：

- 新一轮大重构
- 顺手优化 gameplay
- 顺手改视觉风格

---

## 3. 明确 no-go 区

下面这些块在当前 M7 默认不应碰：

- gather / resource settle
- training / supply / payment
- combat / auto-aggro / order recovery
- AI economy / AI recovery
- map loading / W3X camera focus
- asset refresh / async visual swap

这些区域不是不能改，而是不能借 `M7 extraction` 名义改。

---

## 4. 每个 slice 的接受底线

每个 slice 都必须回答：

1. 这次只抽什么，不抽什么？
2. 哪些行为明确不变？
3. 哪个 regression pack 是底线？
4. 哪些文件绝对不能碰？
5. 如果行为看起来变了，应该退回、缩 scope，还是转合同任务？

只要其中任一项回答不清，就不应开始这个 slice。

---

## 5. Codex 接管或改写条件

出现下面任一情况，Codex 应接管或重写任务：

- GLM 想把 selection 和 input 时序一起搬
- GLM 想把 placement 和 builder agency 一起搬
- diff 已经不再是“小切片”，而是多子系统串改
- review 只能靠“试玩感觉差不多”判断等价
- 为了让测试过而顺手改了原行为

这时正确动作不是继续赌，而是：

- 缩小 slice
- 改写 allowed files
- 或先补 focused regression

---

## 6. 当前默认顺序总结

当前 M7 默认顺序应固定为：

1. `Task 33`：SelectionController 小切片
2. `Task 34`：PlacementController 小切片
3. `Task 35`：coverage gap sweep

如果第 1 步没有稳住，不进入第 2 步；如果前两步没稳住，不做第 3 步。
