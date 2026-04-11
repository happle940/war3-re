# 命令/Order 模型边界清单

> 目的：记录当前命令分发入口和直接状态修改区域，为未来 OrderController 提取提供最小变更路线图。
> 日期：2026-04-12
> 状态：M2 baseline 快照，不含任何实现变更。

## 1. 统一命令入口（通过 `dispatchGameCommand`）

所有以下入口都经过 `GameCommand.ts` 的 `issueCommand()` 函数：

### 1.1 UI 交互入口

| 入口 | 文件:行号 | 命令类型 | 说明 |
|------|-----------|----------|------|
| 右键地面 | `Game.ts:2246` | `move` | 无树时普通移动 |
| 右键地面（附近有树） | `Game.ts:2232` | `gather` / `move` | worker 采木，非 worker 移动 |
| 右键金矿 | `Game.ts:2162` | `gather` / `move` | worker 采金，非 worker 移动 |
| 右键敌方单位 | `Game.ts:2180` | `attack` | 攻击命令 |
| 右键己方未完成建筑 | `Game.ts:2189` | `build`（通过 assignBuilderToConstruction） | 续建 |
| 右键己方建筑 | `Game.ts:2199` | `move` | 移动到建筑旁 |
| A 模式左键点击 | `Game.ts:2277` | `attackMove` | 攻击移动 |
| Shift+右键地面 | `Game.ts:2217` | 入队 `move` | 追加移动命令 |
| Shift+A+点击 | `Game.ts:2266` | 入队 `attackMove` | 追加攻击移动 |
| 集结点点击地面 | `Game.ts:2351` | `setRally` | 设置建筑集结点 |
| 集结点点击金矿 | `Game.ts:2341` | `setRally` | 集结到金矿 |

### 1.2 键盘快捷键入口

| 快捷键 | 文件:行号 | 命令类型 | 说明 |
|--------|-----------|----------|------|
| S | `Game.ts:1900` | `stop` | 停止 + suppressAggroFor |
| H | `Game.ts:1903` | `holdPosition` | 驻守 |
| A | `Game.ts:1906` | 进入 attackMoveMode | 模式切换，左键时才发命令 |

### 1.3 命令卡按钮入口

| 按钮 | 文件:行号 | 命令类型 | 说明 |
|------|-----------|----------|------|
| 停止 | `Game.ts:4219` | `stop` | 军事单位命令卡 |
| 驻守 | `Game.ts:4227` | `holdPosition` | 军事单位命令卡 |
| 攻击移动 | `Game.ts:4233` | 进入 attackMoveMode | 模式切换 |
| 训练 | `Game.ts:4354` | `train` | 建筑 trainingQueue |
| 取消建造 | `Game.ts:4208` | `cancelConstruction` | 走独立路径（设 hp=0） |

### 1.4 系统自动入口

| 入口 | 文件:行号 | 命令类型 | 说明 |
|------|-----------|----------|------|
| 训练完成出兵 | `Game.ts:771-772` | `move` | 集结点移动 |
| 续建分配 | `Game.ts:1606` | `build` | assignBuilderToConstruction |

### 1.5 测试入口

| 入口 | 文件:行号 | 说明 |
|------|-----------|------|
| `g.issueCommand(units, cmd)` | `Game.ts:1672` | 委托到 dispatchGameCommand |
| `g.suppressAggroFor(units, dur)` | `Game.ts:1658` | 独立于 issueCommand 的 aggro suppression |
| `g.planPath(unit, target)` | `Game.ts:1929` | 路径规划（不设 state） |
| `g.planAttackMovePath(unit, target)` | `Game.ts:955` | attackMove 专用路径规划 |

## 2. 直接状态修改区域

以下区域不经过 `issueCommand`，直接修改单位字段。

### 2.1 合法的模拟更新（不应通过命令系统）

| 区域 | 文件:行号 | 修改内容 | 分类 |
|------|-----------|----------|------|
| `updateUnitMovement()` | `Game.ts:490-540` | pos.x/z, moveTarget, waypoints | 移动模拟 |
| `updateUnitState()` | `Game.ts:543-627` | state, gatherTimer, carryAmount, moveTarget | 状态机推进 |
| `updateBuildProgress()` | `Game.ts:630-656` | buildProgress, mesh.scale | 建造进度 |
| `updateTrainingQueue()` | `Game.ts:744-777` | trainingQueue.shift(), spawned unit fields | 训练推进 |
| `updateCombat()` | `Game.ts:782-871` | attackTimer, moveTarget (chase), attackTarget drop | 战斗模拟 |
| `updateStaticDefense()` | `Game.ts:883-937` | attackTarget acquire/drop, attackTimer | 塔防模拟 |
| `updateAutoAggro()` | `Game.ts:1196-1238` | attackTarget, state → Attacking, previousState chain | 自动索敌 |
| `dealDamage()` | `Game.ts:1069-1106` | target.hp, visual effects | 伤害结算 |
| `applySeparation()` | `Game.ts:421-480` | mesh.position | 碰撞分离 |
| `settleGather()` | `Game.ts:1419-1446` | tree.remainingLumber, mine.remainingGold | 资源扣减 |
| `startGatherNearest()` | `Game.ts:1449-1472` | state, resourceTarget, moveTarget | 采集重试 |
| `handleDeadUnits()` | `Game.ts:1325-1390` | 清理死亡单位引用 | 死亡处理 |

### 2.2 风险区域（潜在的命令旁路）

| 区域 | 文件:行号 | 修改内容 | 风险等级 | 说明 |
|------|-----------|----------|----------|------|
| `updateAutoAggro()` | `Game.ts:1218-1236` | state=Attacking, attackTarget, previousState chain | **中** | 自动索敌直接改 state，跳过 issueCommand。语义合理（不是玩家命令），但如果未来要统一所有 state 转换，需要包装 |
| `restorePreviousOrder()` | `Game.ts:976-1026` | 恢复 state/gatherType/resourceTarget/moveTarget/moveQueue | **中** | 恢复被中断的命令。如果未来有 OrderController，restore 应该是控制器方法 |
| `executeQueuedCommand()` | `Game.ts:1045-1066` | state=Moving/AttackMove, moveTarget, attackMoveTarget | **中** | 队列弹出后直接设字段。move 分支缺少 previousState 清理（因为队列命令不需要），但和 issueCommand 的 move 分支有微妙差异 |
| `updateTrainingQueue()` 集结 | `Game.ts:763-768` | spawned.gatherType, spawned.resourceTarget, spawned.state | **低** | 新生成单位的初始状态赋值，不走 issueCommand 是合理的 |
| `handleDeadUnits()` 引用清理 | `Game.ts:1343-1362` | other.buildTarget=null, other.state=Idle | **低** | 死亡时的清理，不是命令 |
| `updateCombat()` 追击 | `Game.ts:854-855` | moveTarget=target.position (chase) | **低** | 战斗模拟中的追击移动 |

### 2.3 命令分发后的辅助操作

以下操作在 `issueCommand` 之后执行，是命令语义的一部分但不在 `GameCommand.ts` 中：

| 操作 | 调用位置 | 说明 |
|------|----------|------|
| `planPath()` / `planPathForUnits()` | 右键、attackMove、build | 路径规划 |
| `suppressAggroFor()` | 右键地面、S 键、build | aggro 抑制 |
| `planAttackMovePath()` | attackMove 入口 | attackMove 专用路径 |
| `u.resourceTarget = {...}` | 右键采金/采木、集结到金矿 | 设置具体资源引用 |

## 3. 最小提取路线图

### Phase 0（当前已完成）

- `GameCommand.ts` 已存在，`issueCommand()` 已是统一写入入口
- 所有 UI/键盘入口都通过 `dispatchGameCommand`
- `g.issueCommand()` 测试钩子已存在

### Phase 1：OrderController（最小包装）

提取目标：
- 新建 `OrderController` 类，持有 `issueCommand` + `planPath` + `suppressAggroFor` + `planAttackMovePath` + `resourceTarget` 赋值
- `Game.ts` 所有命令入口改为调用 `this.orders.issue(...)` 
- 不改变任何状态机逻辑，只改变调用入口的归属

文件变更：
- 新建 `src/game/OrderController.ts`
- `Game.ts` 减少约 20 行（路径规划调用合并到 OrderController）
- 测试不变（`g.issueCommand` 仍然委托到同一函数）

### Phase 2：AbilityController（能力注册）

提取目标：
- 每个 ability（move/stop/attack/attackMove/gather/build/train/setRally/holdPosition）注册为独立 Ability 对象
- 每个 Ability 持有：可用条件检查、执行逻辑、禁用原因
- `OrderController` 变为 Ability 注册表的分发层
- 命令卡 UI 直接从 Ability 注册表渲染

文件变更：
- 新建 `src/game/AbilityController.ts`
- 重构 `GameCommand.ts` 为 Ability 注册机制
- 命令卡逻辑从 `Game.ts` 移到 AbilityController

### Phase 3：Order 生命周期（完整 war3 命令链）

提取目标：
- Unit 持有 `currentOrder` / `queuedOrders` 而非分散字段
- `previousState` chain 变为 `suspendedOrder`（被中断挂起的命令）
- `restorePreviousOrder()` 变为 `resumeSuspendedOrder()`
- auto-aggro 不再直接改 state，而是通过 OrderController 挂起/恢复

文件变更：
- 新建 `src/game/Order.ts`（Order 数据结构）
- 重构 `Unit` interface（减少 ~15 个分散字段 → 3 个 Order 字段）
- 重构 `updateAutoAggro()` 和 `updateCombat()` 的恢复逻辑

## 4. 不应重构的区域（当前 baseline 约束）

以下区域在 M2 阶段不应变动：

1. **`GameCommand.ts` 的字段修改列表**：当前每个 case 的字段清理列表是正确的 baseline。任何重构都必须先证明所有现有测试仍然通过。

2. **`updateAutoAggro()` 的 previousState 保存逻辑**：这是战斗控制合同的核心。直接改 state 是刻意的（auto-aggro 不是玩家命令），不应该强制走 issueCommand。

3. **`executeQueuedCommand()` 的简化路径**：队列弹出后的状态设置比 issueCommand 简化（不清 carryAmount 等），这是正确的——队列命令是同一意图的延续。

4. **`restorePreviousOrder()` 的恢复链**：这是 M2 战斗控制 regression 的核心。恢复语义必须保持和现有测试一致。

5. **测试钩子 `g.issueCommand`**：这是边界回归测试的基础。任何重构都必须保持这个 API 不变。

6. **`suppressAggroFor()` 的独立性**：它不在 issueCommand 内部，因为只有部分命令（move/stop/build）需要 suppression，attackMove/attack 不需要。这个设计是正确的。

7. **所有现有 regression 测试**：combat-control-regression、command-regression、closeout 等测试是 M2 的 gate。任何命令模型变更都必须先运行这些测试。

## 5. 边界测试覆盖

| 测试文件 | 覆盖范围 | 入口方式 |
|----------|----------|----------|
| `tests/command-regression.spec.ts` | move/stop/holdPosition/attackMove/queue | 直接字段修改（早期测试风格） |
| `tests/combat-control-regression.spec.ts` | move覆盖攻击/suppression/stop清除链/holdPosition/attackMove/attack清suppression | `g.issueCommand()` |
| `tests/order-model-boundary-regression.spec.ts` | issueCommand 和直接路径的一致性 | `g.issueCommand()` + 运行时验证 |

`command-regression.spec.ts` 中的测试 1-3 使用了直接字段修改而不是 `g.issueCommand`，这是因为它们编写于 issueCommand 钩子暴露之前。未来可以考虑迁移，但当前不影响正确性。
