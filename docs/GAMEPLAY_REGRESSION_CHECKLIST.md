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
- [ ] TH 训练农民 → 扣资源 → 出兵
- [ ] 兵营训练步兵 → 扣资源 → 出兵
- [ ] 人口上限（10 无农场）→ 训练被拒绝（HUD 不变化）
- [ ] 建农场后人口增加 → 可以继续训练
- [ ] 集结点（金矿）→ 新农民自动采金

## AI 对手行为（观察 AI 阵营）

- [ ] AI 农民自动采金
- [ ] AI 农民自动伐木
- [ ] AI 自动建造兵营
- [ ] AI 自动建造农场（人口不足时）
- [ ] AI 训练步兵（不超出人口上限）
- [ ] AI 训练农民（不超出人口上限且不超过 maxWorkers）
- [ ] AI 步兵积累后发起进攻（attackMove 方式）
- [ ] AI 第一波后能继续发波（不被幸存步兵卡死）
- [ ] AI 集结点自动设为金矿

## 战斗循环

- [ ] 步兵攻击敌方 → 正确追踪并攻击
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

### 单位可见性自动化覆盖

以下项目由 `tests/unit-visibility-regression.spec.ts` 自动验证（Playwright）：

- [x] W3X 异步地图加载完成后，玩家 0 农民仍在默认镜头视口内
- [x] 农民 mesh 有可见、不透明、非零缩放的渲染子对象
- [x] 农民世界包围盒达到 RTS 默认镜头可读阈值
- [x] 农民投影到屏幕后的像素高度/宽度达到可读阈值
- [x] 血条锚点在真实视觉包围盒上方且距离不过大
- [x] 显式 asset refresh 后农民可见性和 scale 不坍塌

## 仍未被自动化覆盖（需人工验证）

- [ ] 玩家手动操作的采集/建造/训练完整流程
- [ ] auto-aggro 命令恢复
- [ ] 战斗循环（伤害数字、护甲减伤）
- [ ] 建筑/地形/模型的主观视觉辨识度
- [ ] 布局语法（基地空间关系、路径可通性）

## 验证记录

| 日期 | 验证人 | 结果 | 备注 |
|------|--------|------|------|
| 2026-04-11 | Codex | Runtime Full Pack | `npm run test:runtime`: 33 tests green. Includes closeout, command, first-five, resource/supply, unit visibility. |
| 2026-04-11 | Codex | Unit Visibility Regression | `unit-visibility-regression.spec.ts`: 2 tests green. Fixed W3X map-load camera reset that left player workers offscreen. |
| 2026-04-11 | GLM-5.1 | Resource/Supply Regression | resource-supply-regression.spec.ts: 9 tests green. Supply, training, resource flow, AI spending contracts proven. |
| 2026-04-11 | GLM-5.1 | Command Regression | command-regression.spec.ts: 7 tests green. Move/stop/hold/attackMove/queue contracts proven. |
| 2026-04-11 | GLM-5.1 | Runtime Truth 01 | first-five-minutes.spec.ts: AI economy/build/train/attack automated. Player manual loop not yet covered. |
| 2026-04-11 | GLM-5.1 | pending | Order System Beta + Gameplay Alpha 完成后待验证 |
| 2026-04-10 | GLM-5.1 | Partial: AI economy ✅, Player micro ❌ | Runtime Hardening Phase 3: AI gather/build/train verified via Playwright. Player commands structurally verified but not runtime-tested. |
