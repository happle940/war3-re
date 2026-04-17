# War3 RE - Gameplay Regression Checklist

> 版本：v0.3 post-Order-System-Beta
> 用途：验证命令系统 + AI gameplay loop 无回归
> 预计耗时：8 分钟（跑一局前 5 分钟）

---

## 开局经济（玩家 + AI）

- [ ] 开局 5 农民空闲
- [ ] 右键金矿 → 农民走向金矿 → 到达后开始采集 → 采集完成 → 走回 TH → 资源增加 → 自动返回
- [ ] 右键树 → 农民走向树 → 到达后开始伐木 → 采完 → 走回 TH → 木头增加 → 自动返回
- [ ] 金矿耗尽后农民自动找新金矿（如果有的话）
- [ ] 树木耗尽后农民自动找新树

## 命令覆盖 / 中断

- [ ] 移动中右键新位置 → 覆盖原移动，前往新目标
- [ ] 采集中右键移动 → 停止采集，移动到新位置
- [ ] 建造中右键移动 → 停止建造，移动到新位置
- [ ] 训练中建筑被攻击 → 训练不中断（建筑继续工作）

## 命令恢复（auto-aggro）

- [ ] 移动中的步兵被敌人接近 → 自动反击
- [ ] 反击结束（敌人死亡或逃跑）→ 恢复移动到原目标
- [ ] 采集中被敌人接近 → 不触发自动反击（继续采集）
- [ ] 移动中的 worker 被敌人接近 → 自动反击（worker 会反击）
- [ ] 反击结束后 worker 恢复移动（不恢复采集）

## 队列系统

- [ ] Shift+右键地面（移动中）→ 追加到队列，黄色菱形标记
- [ ] 到达当前目标 → 消费下一个队列项
- [ ] Shift+A+左键地面 → attackMove 追加到队列，红色菱形标记
- [ ] 队列消费后状态正确（move → Moving, attackMove → AttackMove）
- [ ] 空闲单位获取队列项 → 立即启动
- [ ] stop 命令 → 清空队列
- [ ] 新的非 Shift 命令 → 清空队列

## 建造/训练/人口

- [ ] 农民放置建筑 → 扣资源 → 半透明 → 农民走去建造 → 进度增长 → 完成
- [x] 建造被中断后，农民右键未完成建筑 → 继续建造
- [x] 选中未完成建筑 → 点击取消 → 建筑消失、返还资源、释放占地
- [ ] TH 训练农民 → 扣资源 → 出兵
- [ ] 兵营训练步兵 → 扣资源 → 出兵
- [x] 人口上限（10 无农场）→ 训练被拒绝（HUD 显示人口阻塞原因且不扣资源）
- [x] 建农场后人口增加 → 可以继续训练
- [ ] 集结点（金矿）→ 新农民自动采金
- [ ] 清除集结点后，新农民不应出现“假 rally 移动”

## AI 对手行为（观察 AI 阵营）

- [ ] AI 农民自动采金
- [ ] AI 农民自动伐木
- [ ] AI 自动建造兵营
- [ ] AI 自动建造农场（人口不足时）
- [ ] AI 训练步兵（不超出人口上限）
- [ ] AI 训练农民（不超出人口上限且不超过 maxWorkers）
- [ ] AI 步兵积累后发起进攻（attackMove 方式）
- [ ] AI 第一波后能继续发波（不被幸存步兵卡死）
- [ ] AI 未饱和时自动设金矿集结；饱和后清除 gold rally

## 战斗循环

- [ ] 步兵攻击敌方 → 正确追踪并攻击
- [x] 完成箭塔后，敌方单位进入范围 → 箭塔自动攻击
- [ ] 超出追击范围 → 放弃追击
- [ ] 目标死亡 → 攻击者恢复原命令或转 Idle
- [ ] 攻击移动 → 沿途遇敌交战，战后继续前进
- [ ] 驻守 → 不移动，范围内敌人自动攻击，不追击
- [ ] 护甲减伤正确（观察伤害数字）

---

## 已知边界行为（非 bug）

- stop 丢弃携带中的资源（carryAmount 清零）
- holdPosition 清除 gatherType 但不清 carryAmount（资源在悬停状态）
- 采集中的单位不触发自动反击（设计选择）
- queue 只支持 move 和 attackMove（不支持 gather/attack）

---

## 自动化 Runtime Truth 覆盖

以下项目由 `tests/first-five-minutes.spec.ts` 自动验证（Playwright）：

- [x] 玩家基地存在：townhall + barracks + goldmine + 5 workers（t=0）
- [x] AI 基地存在：townhall + barracks + goldmine + 5 workers（t=0）
- [x] AI 农民自动进入采集状态（15s 内有 gather state）
- [x] AI 资源收入可观测（30s 内 gold/lumber 变化）
- [x] AI 建造农场（supply 不足时自动建）
- [x] AI 兵营存活且完整
- [x] AI 训练 footman（90s 内有 footman 或训练队列）
- [x] AI 训练 worker（90s 内 worker 数量 >= 4）
- [x] AI 资源被消费（90s 内 gold/lumber 低于初始值）
- [x] AI 积累 footmen 达到攻击阈值或攻击波已发出（150s）

### 命令系统自动化覆盖

以下项目由 `tests/command-regression.spec.ts` 自动验证（Playwright）：

- [x] 移动命令覆盖 Attacking 状态 + 抑制 auto-aggro（1.5s）
- [x] stop 清空所有命令状态（moveTarget, moveQueue, attackTarget, attackMoveTarget, gatherType, resourceTarget, buildTarget, carryAmount, previous* 链）
- [x] holdPosition 不追击范围外敌人
- [x] attackMove 自动接敌（aggroSuppressUntil=0）
- [x] Shift+move 空闲单位立即启动，保留剩余队列
- [x] Shift+attackMove 空闲单位立即启动，保留剩余队列
- [x] 普通 move 清空已有命令队列

### 资源/人口自动化覆盖

以下项目由 `tests/resource-supply-regression.spec.ts` 自动验证（Playwright）：

- [x] computeSupply 仅计算已完成建筑（buildProgress >= 1）
- [x] 人口上限拒绝训练，不扣资源
- [x] 成功训练精确扣一次资源（worker 75g, footman 135g）
- [x] 农民返还资源路径：carryAmount → resources.earn → carryAmount=0
- [x] stop 丢弃携带资源（不重复存入）
- [x] AI 有效人口（used + queued）不超过 total
- [x] AI 农场供应仅在完成后生效
- [x] 多建筑训练不可超支（200g + 2 barracks → 最多 1 footman）

### 集结点自动化覆盖

以下项目由 `tests/rally-contract-regression.spec.ts` 自动验证（Playwright）：

- [x] goldmine rally 仍然让新农民自动进入采金循环
- [x] `clearRally` 会同时清空 `rallyPoint` 与 `rallyTarget`
- [x] clear 后的新农民出生为 Idle，不会产生“朝 townhall 中心假移动”的伪 rally 状态

### 采矿饱和自动化覆盖

以下项目由 `tests/mining-saturation-regression.spec.ts` 自动验证（Playwright）：

- [x] 单座 goldmine 的并发 `Gathering` 工人数不会超过 `GOLDMINE_MAX_WORKERS = 5`
- [x] 溢出的第 6 个工人会在矿边等待可用槽位，而不是打开第 6 个有效采集槽
- [x] 默认 Town Hall / Gold Mine 经济尺度下，1..6 个采金工人的 gold curve 单调不降
- [x] 默认尺度下第 5 个工人仍有可测边际收益，第 6 个工人进入明显递减收益区间
- [x] 开局 5 个农民不会出生在矿边秒进矿，必须先走过可见矿线
- [x] 采金循环使用 5 个完整矿线预约槽；往返途中仍占槽，第 6 个农民不会填补路上空隙形成线性增产
- [x] 占到金矿槽位的农民不参与普通单位挤压，避免 5 人矿线在矿口/回本边缘互相推开导致卡死；未占槽单位仍不应坍缩成同一点

### 单位可见性自动化覆盖

以下项目由 `tests/unit-visibility-regression.spec.ts` 自动验证（Playwright）：

- [x] W3X 异步地图加载完成后，玩家 0 农民仍在默认镜头视口内
- [x] 农民 mesh 有可见、不透明、非零缩放的渲染子对象
- [x] 农民世界包围盒达到 RTS 默认镜头可读阈值
- [x] 农民投影到屏幕后的像素高度/宽度达到可读阈值
- [x] 血条锚点在真实视觉包围盒上方且距离不过大
- [x] 显式 asset refresh 后农民可见性和 scale 不坍塌

### 选择/输入自动化覆盖

以下项目由 `tests/selection-input-regression.spec.ts` 自动验证（Playwright）：

- [x] 左键拖框在 mouseup 当帧完成选择，不需要再点一下
- [x] 右键拖动/右键点击不启动 box selection
- [x] 右键拖动释放后不留下 ghost selection state
- [x] Shift+框选追加选择；HUD cache 重置为代码路径审查项
- [x] Tab subgroup 切换后 selection ring 仍贴在正确对象上
- [x] Control group restore 后 selection ring/object mapping 正确

### 寻路/建筑占地自动化覆盖

以下项目由 `tests/pathing-footprint-regression.spec.ts` 自动验证（Playwright）：

- [x] 开局单位不在任何建筑 blocker 内
- [x] 建筑运行时占地面积与 BUILDINGS[type].size 一致（内部全占，外部无泄漏）
- [x] PlacementValidator 拒绝重叠、允许相邻/对角放置
- [x] Worker → 金矿/树木 planPath 返回有效路径（非退化 null）
- [x] findPath: blocked goal 自动重定向到最近可达位置；blocked start 返回 null
- [x] 启动无严重控制台错误

### AI 开局经济/进攻自动化覆盖

以下项目由 `tests/ai-economy-regression.spec.ts` 自动验证（Playwright）：

- [x] 30 秒内 AI 同时有采金与伐木农民
- [x] AI 农民不会全部永久分配到金矿，金/木分配保持有界
- [x] AI 在人口阻塞前完成至少一个农场
- [x] AI 训练 worker/footman 时 `used + queued <= total`
- [x] 第一波进攻真实发出，且存在 attackMove/向玩家半场推进证据
- [x] 第一波后可发起第二波，`waveCount >= 2`，不再永久卡在 `attackWaveSent=true`
- [x] 早期损失 1 个 AI 农民后，AI 仍能继续采集/生产
- [x] AI 建筑放置失败不会产生无限建筑 spam
- [x] 5 分钟 AI 模拟无严重 console error
- [x] AI 金矿工人不超过饱和上限 5（t=45/90/120 采样）
- [x] AI 金矿饱和后不会继续保留 gold rally
- [x] AI 保持至少 1 个伐木工人到中期（饱和逻辑不饿死伐木）
- [x] 饱和逻辑下 AI 仍完成早期建造循环（农场+兵营+步兵）

### 资产管线自动化覆盖

以下项目由 `tests/asset-pipeline-regression.spec.ts` 自动验证（Playwright）：

- [x] 浏览器侧 fake glTF 资产使用真实 `AssetLoader -> Factory -> refresh` 路径，不用 Node-side cache 假证明
- [x] `Material[]` 会按实例深拷贝，蓝/红队伍实例不共享可变材质对象
- [x] `team_color` 材质在 team 0/team 1 克隆上分别变蓝/红，且不会串色
- [x] fallback scale 不会覆盖 replacement asset scale（0.2 fallback -> 2.5 replacement）
- [x] `dealDamage()` 攻击缩放动画不会把 glTF/root asset scale 重置为 1
- [x] refresh 移除旧视觉 root，不留下旧 child 混在新 root 下
- [x] 缺失资产路径仍能为 worker/footman/townhall/barracks/farm/tower/goldmine 创建可见 fallback
- [x] 显式 refresh 保留已有实体 position/rotation，且无严重 console error

### 建造者代理自动化覆盖

以下项目由 `tests/building-agency-regression.spec.ts` 自动验证（Playwright）：

- [x] 单个选中农民进入建造放置模式后，放置建筑会由同一个选中农民建造
- [x] 即使另一个空闲农民离建筑点更近，也不会抢走玩家指定农民的建造任务
- [x] 多选农民时使用确定性 primary 规则：`SelectionModel.units[0]` -> `placementWorkers[0]` -> builder
- [x] 进入放置模式后，若原选中农民死亡/失效，fallback 到最近存活空闲农民且不崩溃
- [x] 成功放置后清空 `placementWorkers` / `placementMode`
- [x] 取消/退出放置模式后清空 `placementWorkers` / ghost mesh
- [x] Shift-style 追加选择进入放置模式时保留 selection order，不污染 remembered worker list
- [x] 建造代理测试过程中无严重 console error

### 建造生命周期自动化覆盖

以下项目由 `tests/construction-lifecycle-regression.spec.ts` 自动验证（Playwright）：

- [x] 建造者被 stop 中断后，未完成建筑仍保留并可继续建造
- [x] 有效农民可以接手并恢复未完成建筑建造
- [x] 取消未完成建筑会移除实体并释放 footprint occupancy
- [x] 取消退款规则确定：返还建筑总成本的 `floor(75%)`
- [x] 取消同一未完成建筑不能重复返还资源
- [x] 选中未完成建筑时命令卡出现“取消”按钮
- [x] 取消选中的未完成建筑后，selection、selection ring、HUD、命令卡都恢复到有效空状态
- [x] 取消未完成建筑会清理 builder 的 `buildTarget` / move target / build state
- [x] 第二个 worker 不能抢走 Building 状态的 builder（builder-stealing 防护）
- [x] 第二个 worker 不能抢走 MovingToBuild 状态的 builder（分配后尚未到达）
- [x] 原始 builder 已停止/失效时，新 worker 可以接手建造

### M4 玩家实测问题自动化覆盖

以下项目由 `tests/m4-player-reported-issues.spec.ts` 自动验证（Playwright）：

- [x] 选中农民右键未完成建筑会通过真实 `handleRightClick()` 路径恢复建造，并由真实 `g.update()` 推进 `buildProgress`
- [x] 完成箭塔会在实战模拟中伤害敌人，选中箭塔时 HUD 显示可读名称和 HP
- [x] 建造中的箭塔不会攻击
- [x] 两个单位移动到同一目标点后不会保持精确重叠
- [x] 人口上限时，兵营步兵按钮显示人口阻塞；切到农民后，农场建造路径仍可用
- [x] 选中未完成建筑时命令卡显示取消，点击后释放 footprint、退款并清理 builder/selection/HUD

### 死亡/清理自动化覆盖

以下项目由 `tests/death-cleanup-regression.spec.ts` 自动验证（Playwright）：

- [x] 选中单位死亡后从 `selectionModel` 和 selection rings 中移除
- [x] 死亡单位的 healthbar、outline 引用和 scene mesh 引用被清理
- [x] 攻击目标死亡后，攻击者 `attackTarget` 清空并退出 Attacking 状态
- [x] 建筑死亡后释放 footprint occupancy，同一 tile 可再次放置
- [x] 建造中建筑死亡后，builder 的 `buildTarget` / move target / build state 被清理
- [x] 资源目标失效后，采集状态恢复路径清空 `resourceTarget` 且不崩溃
- [x] 强制死亡/清理场景无严重 console error

### 静态防御自动化覆盖

以下项目由 `tests/static-defense-regression.spec.ts` 自动验证（Playwright）：

- [x] 完成箭塔会在范围内自动获取敌方单位
- [x] 完成箭塔会按冷却造成伤害
- [x] 建造中的箭塔不会攻击
- [x] 箭塔不会攻击友军
- [x] 箭塔攻击时不会移动或追击
- [x] 目标死亡后，箭塔会清理旧 `attackTarget` 并重新获取新目标
- [x] 箭塔忽略金矿/建筑类非移动目标
- [x] 箭塔战斗模拟无严重 console error

### 命令卡状态自动化覆盖

以下项目由 `tests/command-card-state-regression.spec.ts` 自动验证（Playwright）：

- [x] 人口上限阻塞训练时，训练按钮显示禁用原因且不扣资源/不入队
- [x] 金币不足阻塞训练时，训练按钮显示禁用原因且不入队
- [x] 木材不足阻塞建造时，建造按钮显示禁用原因且不进入 placement mode
- [x] 资源与人口充足时，同一训练命令保持可用并正常入队扣费
- [x] 农场完成、人口上限变化后，不重新选择单位也会刷新命令卡状态
- [x] 资源变化后，不重新选择单位也会刷新命令卡状态
- [x] 命令卡状态测试过程无严重 console error

### 战斗控制自动化覆盖

以下项目由 `tests/combat-control-regression.spec.ts` 自动验证（Playwright）：

- [x] 正在攻击的单位收到玩家移动命令后，会退出攻击并进入移动语义
- [x] 玩家移动/停止后的 suppression 窗口内不会被 auto-aggro 立即抢回
- [x] suppression 过期后，空闲单位仍可重新 auto-aggro
- [x] attack-move 不继承 suppression，会沿途自动交战
- [x] stop 会清空队列、攻击目标和 previous-order 恢复链
- [x] hold position 会本地索敌，但目标离开攻击范围后不会追击或退回 Idle
- [x] 明确 attack 命令会清除 suppression，代表进攻意图
- [x] Moving 单位即使 suppression 为 0，也不会被 auto-aggro 打断
- [x] 战斗控制测试过程无严重 console error

### 命令模型边界自动化覆盖

以下项目由 `tests/order-model-boundary-regression.spec.ts` 自动验证（Playwright）：

- [x] move 命令通过 `g.issueCommand()` 正确设置 Moving 状态并清除所有 previous-chain 字段
- [x] stop 命令通过 `g.issueCommand()` 正确设置 Idle 状态并清除所有命令字段
- [x] attackMove 命令通过 `g.issueCommand()` 清除 aggro suppression（aggroSuppressUntil=0）
- [x] issueCommand 对建筑单位（isBuilding）不产生任何状态变化
- [x] issueCommand 对相同输入是确定性的（两次调用产生相同输出字段）

### M3 比例/布局测量自动化覆盖

以下项目由 `tests/m3-scale-measurement.spec.ts` 自动验证（Playwright）：

- [x] Worker/Footman 视觉包围盒非零，两者均为可见实体
- [x] 建筑占地层级：Farm < Barracks <= GoldMine <= TownHall（footprint area）
- [x] 建筑比例测量只使用完工建筑（`buildProgress >= 1`），避免建造中缩放污染 M3 数据
- [x] Tower 具有竖向防御轮廓：高度 > 宽度，且底座宽度 > 0.8
- [x] Farm 视觉面积 / TH 面积在 [0.08, 0.40] 范围内（compact wall piece）
- [x] Footman 剪影面积 / Worker 剪影面积 > 1.3（军事单位更重）
- [x] Tower 高度 / TH 高度 < 1.7（防御标志不压倒主基地）
- [x] Tower 视觉面积 / TH 面积 > 0.05（有可见体量）
- [x] 树木最大高度 / TH 高度 < 1.5（填空物不主导基地）
- [x] TH 选择圈 / 视觉半径在 [0.3, 1.5] 范围内
- [x] Worker healthBarY > 0.8 × 视觉高度（血条在身体上方）
- [x] 开局农民不在任何建筑/金矿 blocker footprint 内
- [x] 默认镜头视口包含玩家基地锚点组：TownHall + GoldMine + 至少一个 Worker
- [x] 选择圈半径在实体 footprint 的合理因子范围内，不会坍缩为极小值
- [x] 输出结构化 JSON 比例摘要供 Codex review（非 snapshot/screenshot）

### 单位存在感/防堆叠自动化覆盖

以下项目由 `tests/unit-presence-regression.spec.ts` 自动验证（Playwright）：

- [x] 开局农民不在建筑/金矿 blocker footprint 内
- [x] 开局农民之间不是精确重叠
- [x] 多个完全同坐标单位会被确定性推开，且不会瞬移
- [x] 多单位移动到同一目标后保持最小间距
- [x] 多个采金农民靠近同一金矿时不会坍缩成同一点
- [x] 分离后单位不会被推入建筑/树木 blocker tile
- [x] 单位存在感测试过程无严重 console error

### M4 命令表面矩阵自动化覆盖

以下项目由 `tests/command-surface-regression.spec.ts` 自动验证（Playwright）：

- [x] Worker 右键未完成己方建筑 → handleRightClick + g.update() 恢复建造
- [x] Worker 右键金矿 → gather 命令 + resourceTarget 指向该 mine
- [x] 非Worker 右键金矿 → move near mine，不进入 gather 状态
- [x] 战斗单位右键敌方 → attack 命令 + attackTarget 指向敌人
- [x] 单位右键地面 → move 命令并清理 stale gather/build/attack state
- [x] 单位右键己方完成建筑 → move near，不触发 build/attack
- [x] Worker 命令卡显示 Farm/Barracks/Tower 建造按钮；资源不足时有明确 disabled reason
- [x] 选中未完成建筑暴露 Cancel；点击后释放 footprint + 清 builder
- [x] Completed Barracks 在 supply cap 时 Footman disabled，原因包含人口
- [x] Tower HUD/命令面板暴露 attackDamage/range/cooldown 可读文本
- [x] 拥挤金矿右键（多农民遮挡）→ resolve 到金矿 gather 而非 move 到 worker

## 仍未被自动化覆盖（需人工验证）

- [ ] 玩家手动操作的采集/建造/训练完整流程
- [ ] 战斗循环（伤害数字、护甲减伤）
- [ ] 建筑/地形/模型的主观视觉辨识度
- [ ] 布局语法（基地空间关系、路径可通性）

## Runtime Test Harness

### Task 21: Fast-start mode

Runtime regression tests 使用 `?runtimeTest=1` query-param 快速启动模式：
- 跳过 W3X 异步地图加载（省去 ~3s/测试的网络请求和解析）
- 使用程序化 Terrain 作为默认地图（Game constructor 生成的 64x64 地形）
- `map-status` 立即设为 `Runtime test mode: procedural map`，`waitForGame` 无需等待
- 线上 demo（不带 query param）不受影响，仍自动加载测试地图
- 用户手动上传地图功能保持原样

单测启动时间从 ~8-9s 降到 ~5.8-6.5s（每测试节省约 3s）。

### Task 22: Sharded local gate

`npm run test:runtime` 使用分片脚本 `scripts/run-runtime-suite.sh`：
- 5 个 shard，每个 shard 独立运行、独立打印进度和耗时
- 每个 shard 通过 locked runner `run-runtime-tests.sh` 执行，自动清理 runtime
- 失败时立即停在失败 shard，输出清晰可读
- 覆盖全部 17 个 spec 文件（M4 玩家实测问题包已加入）

Shard 分组：
1. `core-controls`: closeout, first-five-minutes, command-regression, combat-control
2. `ui-economy`: command-card-state, resource-supply
3. `presence-pathing`: unit-presence, unit-visibility, pathing-footprint, selection-input
4. `ai-assets-buildings`: ai-economy, asset-pipeline, building-agency, death-cleanup
5. `construction-defense`: construction-lifecycle, static-defense, m4-player-reported-issues

2026-04-12 closeout 结果：
- `core-controls`: 30 tests, 213s
- `ui-economy`: 16 tests, 107s
- `presence-pathing`: 18 tests, 159s
- `ai-assets-buildings`: 23 tests, 190s
- `construction-defense`: 16 tests, 110s
- 总计：5/5 shards, 103 tests, 779s

当前覆盖更新：M4 玩家实测问题包已并入 `construction-defense` shard；上面的 103-test 记录是 Task22 closeout 的历史结果，不包含 M4 新增的 6 个测试。

旧的单命令模式保留为 `npm run test:runtime:single`（不推荐日常使用）。

## 验证记录

| 日期 | 验证人 | 结果 | 备注 |
|------|--------|------|------|
| 2026-04-11 | Codex | AI Wave Regression Stabilization | `ai-economy-regression.spec.ts`: 9 tests green after fixing CI-reproduced wave timing/direction brittleness. Standard AI first pressure now launches at 2 footmen; wave timeout can reuse AttackMove footmen so later waves do not stay locked. |
| 2026-04-11 | GLM-5.1 + Codex takeover | Combat Control Regression | `combat-control-regression.spec.ts`: 8 tests green after Codex takeover. Added a runtime-test wrapper for the real GameCommand dispatcher and fixed a true HoldPosition bug where the generic chase-range branch restored the unit to Idle instead of staying on hold. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | GLM-5.1 + Codex takeover | Unit Presence Regression | `unit-presence-regression.spec.ts`: 4 tests green. Added lightweight unit separation, formation offsets for group movement, exact-overlap deterministic push, blocker guard, and runtime proof. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | Codex | Command Card State Regression | `command-card-state-regression.spec.ts`: 7 tests green. Added explicit disabled reasons for supply/resource blocked commands and made command-card cache include resources, supply, and queued supply. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | GLM-5.1 + Codex | Static Defense Regression | `static-defense-regression.spec.ts`: 7 tests green from GLM. Codex review integrated the spec into `npm run test:runtime` and added `npm run test:static-defense`. |
| 2026-04-11 | Codex | Construction Lifecycle Regression | `construction-lifecycle-regression.spec.ts`: 6 tests green. Added resumable construction, under-construction cancel, deterministic 75% refund, footprint release, selected-building HUD cleanup, and builder cleanup. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | Codex | Death/Cleanup Regression | `death-cleanup-regression.spec.ts`: 5 tests green. Selection/ring/healthbar/outline cleanup, attack target cleanup, building footprint release, builder cleanup, and invalid resource target recovery are now runtime-proven. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | Codex | Building Agency Regression | `building-agency-regression.spec.ts`: 5 tests green. Fixed `building.builder` never being set and `findNearestIdlePeasant()` considering dead workers during fallback. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | Codex | Asset Pipeline Regression | `asset-pipeline-regression.spec.ts`: 4 tests green. Fixed `Material[]` clone isolation, browser-side fake asset refresh proof, and `dealDamage()` scale reset that would break glTF asset scale. Added the spec to `npm run test:runtime`. |
| 2026-04-11 | GLM-5.1 + Codex | AI Economy Regression | `ai-economy-regression.spec.ts`: 9 tests green. Found and fixed AI second-wave deadlock plus `flashHit()` crash on nested/glTF materials. Codex tightened farm, queued-supply, first-wave, and second-wave assertions. |
| 2026-04-11 | GLM-5.1 + Codex | Pathing/Footprint Regression | `pathing-footprint-regression.spec.ts`: 6 tests green. Codex tightened the PathFinder blocked-start assertion to test `findPath` directly instead of accepting `planPath` fallback. |
| 2026-04-11 | Codex | Runtime Full Pack | `npm run test:runtime`: 45 tests green. Includes closeout, command, first-five, resource/supply, unit visibility, selection/input, pathing/footprint. |
| 2026-04-11 | GLM-5.1 + Codex | Selection/Input Regression | `selection-input-regression.spec.ts`: 6 tests green. Box select, right-drag guard, Shift+append via mouseup modifier state, Tab subgroup rings, control group rings. Codex added the spec to `npm run test:runtime`. |
| 2026-04-11 | Codex | Unit Visibility Regression | `unit-visibility-regression.spec.ts`: 2 tests green. Fixed W3X map-load camera reset that left player workers offscreen. |
| 2026-04-11 | GLM-5.1 | Resource/Supply Regression | resource-supply-regression.spec.ts: 9 tests green. Supply, training, resource flow, AI spending contracts proven. |
| 2026-04-11 | GLM-5.1 | Command Regression | command-regression.spec.ts: 7 tests green. Move/stop/hold/attackMove/queue contracts proven. |
| 2026-04-11 | GLM-5.1 | Runtime Truth 01 | first-five-minutes.spec.ts: AI economy/build/train/attack automated. Player manual loop not yet covered. |
| 2026-04-12 | GLM-5.1 | Order Model Boundary Regression | `order-model-boundary-regression.spec.ts`: 5 tests green. Proves `g.issueCommand()` dispatcher equivalence for move/stop/attackMove, isBuilding guard, and deterministic field mapping. |
| 2026-04-12 | GLM-5.1 | M4 Builder-Stealing Fix | `construction-lifecycle-regression.spec.ts`: 9/9 green (3 new). Fixed `assignBuilderToConstruction()` builder-stealing bug: guard now checks both `MovingToBuild` and `Building` states. Added tests for Building-state steal block, MovingToBuild-state steal block, and reassignment allowed when builder stopped. 聚焦 M4 包全部通过；全量 runtime 曾跑到 59 passed 0 failed 但被 `Terminated: 15` 截断，不作为完整通过证据。 |
| 2026-04-12 | GLM-5.1 + Codex review | Runtime Sharded Gate | `npm run test:runtime`: 5/5 shards green, 103 tests, 779s. `test:runtime` now runs `scripts/run-runtime-suite.sh`; `test:runtime:single` is retained with equivalent 16-spec coverage. |
| 2026-04-12 | GLM-5.1 + Codex correction | M4 Player-Reported UX Reality Pack | `m4-player-reported-issues.spec.ts`: 6/6 green. Converted live-play complaints into runtime contracts for right-click construction resume, tower attack reality, supply-block recovery path, unit body presence, and construction cancel. Codex corrected GLM's initial weak raycast proof and rejected the invalid terrain-height clamp; affected construction/static-defense/resource/unit-presence pack also passed 29/29. |
| 2026-04-11 | GLM-5.1 | pending | Order System Beta + Gameplay Alpha 完成后待验证 |
| 2026-04-10 | GLM-5.1 | Partial: AI economy ✅, Player micro ❌ | Runtime Hardening Phase 3: AI gather/build/train verified via Playwright. Player commands structurally verified but not runtime-tested. |
