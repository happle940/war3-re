# M7 Refactor Rejection Patterns：重构拒收模式

> 用途：Codex review M7 slice 时，用来识别哪些“只是 refactor”的改动应拒绝、延期，或改写成合同/测试任务。

## 基本口径

M7 只接受零行为变化硬化。只要改动无法证明“同样输入、同样初始状态、同样玩家可见结果”，就不要按 M7 hardening 接受。拒收不是否定问题重要性，而是要求先把行为边界写清楚。

## 常见拒收模式

| 拒收模式 | 为什么危险 | 正确下一步 | 例子 |
| --- | --- | --- | --- |
| 1. 抽取时顺手改了条件分支或执行顺序 | RTS 行为常靠时机和优先级成立，条件顺序变化会让同一输入产生不同结果，但 diff 看起来像整理代码。 | 拒绝当前 slice；要求恢复等价抽取，或先补对应合同。 | 选择逻辑中把 `mouseup` commit 提前，导致右拖框选和单击选择边界漂移。 |
| 2. 一个 slice 同时搬多个高风险子系统 | selection、command、HUD、AI、placement、cleanup 混在一起时，review 无法判断哪一处改变了行为。 | 要求拆小；每个 slice 只移动一个明确边界，并附对应测试包。 | 同时抽 `setupInput`、右键命令、命令卡刷新和选中圈更新。 |
| 3. “整理坐标/锚点/尺寸”导致 placement 语义漂移 | 建筑 mesh anchor、footprint、占地网格和视觉位置强耦合，半格偏移变化会破坏建造、寻路和点击。 | 拒绝作为 M7；先转 pathing/footprint 或 placement 合同任务。 | 抽 `spawnBuilding` 时把 `x + 0.5` 改成整数坐标，导致建筑看似对齐但占地释放错位。 |
| 4. 把 AI 逻辑抽出时改变节拍、资源读写或恢复判断 | AI 压力、经济和恢复是 M4/M6 可玩性的核心证据，微小调度变化会改变对局体验。 | 延期；先写 AI 活动/恢复合同，证明旧行为和新行为哪一个正确。 | 抽 `SimpleAI` 访问层时改变训练检查频率，首波从“会来”变成“偶尔不来”。 |
| 5. HUD presenter / cache 重构让显示状态滞后或过期 | HUD 可能内部状态正确但玩家看到旧命令卡、旧资源或旧选择信息，测试若不看状态转换会漏掉。 | 拒绝或要求补 HUD 状态 regression；不能只靠截图或 typecheck。 | 改 `_lastCmdKey` / `_lastSelKey` 生成规则后，切换单位仍显示上一个建筑的命令卡。 |
| 6. cleanup 抽取漏掉引用失效或释放顺序 | 死亡清理同时影响选择、血条、占地、采集目标、攻击目标、builder 状态和 mesh disposal，漏一项会制造幽灵状态。 | 拒绝当前 slice；补 death/cleanup 合同后再移动。 | 单位死亡后 mesh 被删了，但攻击目标引用还在，下一帧 combat 访问已失效对象。 |
| 7. 用全局状态、单例、事件总线或循环 import “简化依赖” | 这会把显式状态流变成隐式副作用，短期看文件变薄，长期更难证明零行为变化。 | 拒绝；要求用显式参数、窄接口或更小模块边界重做。 | 新 `SelectionManager` 直接读全局 HUD 和 Game 实例，导致选中变化重复触发 DOM 更新。 |
| 8. 把真实 bug fix 包装成 refactor | bug fix 可能是正确的，但它改变玩家可见行为；M7 不能用 hardening 绕过合同和回归。 | 改写成 contract/test task；先定义期望行为，再修复。 | “顺便修一下”右键续建、供给封顶训练、AI 工人损失恢复或塔攻击状态。 |
| 9. 证据只剩 typecheck 或泛泛的 “tests pass” | 类型通过只能证明接口能编译，不能证明输入语义、生命周期、HUD 刷新和 AI 行为等价。 | 延期；要求补完整命令输出、相关 runtime pack，以及必要时 `npm run test:runtime`。 | 抽 cleanup helper 后只跑 `tsc`，没有跑死亡清理、选择输入或 command regression。 |

## 具体领域的拒收提醒

### Selection / Controls

应拒收：

- 改变 left-down / left-up / right-click 的提交时机。
- 把 box select、单击选择、control group、Tab subgroup 和 command dispatch 放进同一 slice。
- 抽取后选中圈、HUD portrait、命令目标不再从同一选择状态更新。

正确做法：先保持输入事件语义完全不变；若发现原行为不清楚，补 selection/input regression，而不是靠试玩感觉接受。

### Placement / Pathing

应拒收：

- 改 building anchor、mesh origin、`GameData.size`、footprint rounding 或 fallback pathing 语义。
- 将 placement preview、占地标记、spawn 位置和 builder agency 一起重排。
- 用视觉对齐作为“等价”的证据。

正确做法：先补 pathing/footprint 或 building-agency 合同；M7 slice 只能搬迁已受保护的逻辑。

### AI

应拒收：

- 抽取时改变 AI tick、资源读写、供应判断、波次触发或失败恢复条件。
- 把“AI 更聪明 / 更有压力”写成 refactor 收益。
- 只用一局人工观察证明 AI 没坏。

正确做法：把 AI 行为变化转为 M4/M6 合同或平衡任务；M7 只接受等价移动。

### HUD / Feedback

应拒收：

- 修改命令卡、资源 HUD、portrait、选择反馈或错误提示的刷新条件。
- 用缓存减少 DOM 更新但没有证明状态不会过期。
- 视觉微调混进 presenter 抽取。

正确做法：先确认状态转换合同；若只是品味或可读性选择，移出 M7 给 human gate。

### Cleanup / Lifecycle

应拒收：

- 把 mesh disposal、selection removal、healthbar cleanup、occupancy release 和 target invalidation 拆开后没有统一生命周期证据。
- 删除看似重复的 null check、target validation 或 builder reset。
- 只验证“没有崩溃”，没有验证残留状态。

正确做法：补 death/cleanup runtime spec，证明死亡后引用、占地、HUD 和目标状态都被清干净。

## Codex 判定规则

- 行为确定变了：拒绝 M7，转合同/测试或功能修复。
- 行为可能变了但证据不足：延期，要求补验证或拆小。
- 行为没变但 slice 太大：延期，要求按风险区重切。
- 只能靠用户体感判断：停止 M7 review，转回对应 milestone 的 human judgment。
- 证明等价、范围小、验证足：才可作为 M7 hardening 接受。
