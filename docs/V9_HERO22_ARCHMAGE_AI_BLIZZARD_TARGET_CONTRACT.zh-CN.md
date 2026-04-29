# V9 HERO22-AI4 Archmage Blizzard AI 目标合同

> 生成时间：2026-04-18
> 任务编号：Task 297
> 本文档定义 Blizzard AI 目标选择合同。Task298（HERO22-AI5）将按本合同实现最小 Blizzard 施放；本合同 **不** 实现任何施法逻辑、不修改生产代码、不修改 SimpleAI.ts。
> 本文档 **不** 声称"Blizzard AI 已实现"、"完整 AI"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 前置证据链

| 任务 | 范围 | 状态 |
|------|------|------|
| Task293 | HERO22-CONTRACT1 Archmage AI 策略边界合同 | accepted |
| Task294 | HERO22-AI1 Archmage 训练就绪 | accepted |
| Task295 | HERO22-AI2 Archmage 技能学习顺序 | accepted |
| Task296 | HERO22-AI3 Water Elemental AI 最小施放 | accepted |
| Task297 | HERO22-AI4 Blizzard AI 目标合同（本文档） | accepted |

策略合同（Task293）第 3.5 节要求：Blizzard AI 需要在运行时之前定义独立的集群目标选择合同，在目标过滤被证明之前不得直接施放。

---

## 2. 当前基线

### 2.1 玩家侧 Blizzard 运行时（Game.ts）

`Game.ts` 的 `castBlizzard(archmage, targetX, targetZ): boolean` 是私有方法，执行以下检查：

- `learnedLevel >= 1`（已学习 Blizzard）
- `archmage.type === 'archmage'`
- `!archmage.isDead`
- `gameTime >= archmage.blizzardCooldownUntil`（冷却结束）
- 不同时存在同一 Archmage 的 Blizzard 通道
- `archmage.mana >= levelData.mana`（法力充足，75）
- 目标在施法范围内（`range = 8.0`）

通过后：
- 扣除法力（75），启动冷却（6 秒）
- 创建 `blizzardChannel` 通道对象，包含施法者、目标坐标、波次信息
- 创建 AOE 指示环（`areaRadius = 2.0`）

`executeBlizzardWave` 每波：
- 在目标点半径 `areaRadius`（2.0）内选取最多 `maxTargets`（5）个敌方单位
- **跳过友军单位**（`unit.team === ch.caster.team` 时 continue）— 当前无友军伤害
- 对建筑应用 `buildingDamageMultiplier`（0.5）
- 每波伤害 `effectValue`：30/40/50（按等级）
- 波次数 `waves`：6/8/10（按等级）

### 2.2 Blizzard 数据（GameData.ts）

`HERO_ABILITY_LEVELS.blizzard`：

| 等级 | effectValue | mana | cooldown | range | areaRadius | maxTargets | waves | requiredHeroLevel | buildingMult |
|------|-------------|------|----------|-------|------------|------------|-------|-------------------|-------------|
| 1    | 30          | 75   | 6        | 8.0   | 2.0        | 5          | 6     | 1                 | 0.5         |
| 2    | 40          | 75   | 6        | 8.0   | 2.0        | 5          | 8     | 3                 | 0.5         |
| 3    | 50          | 75   | 6        | 8.0   | 2.0        | 5          | 10    | 5                 | 0.5         |

### 2.3 SimpleAI 当前无 Blizzard 施法策略

Task296 accepted 后，SimpleAI 仅允许 Water Elemental 最小施放。AC22-12 静态证明确认 SimpleAI 不包含 `castBlizzard`、`castMassTeleport`、`aiCastArchmage` 等禁止关键词。

### 2.4 AIContext 接口

当前 `AIContext` 包含的 Archmage 施法方法：
- `castSummonWaterElemental(caster, targetX, targetZ): boolean`

本合同需要在未来新增：
- `castBlizzard(caster, targetX, targetZ): boolean` — 委托到 `Game.ts` 现有 `castBlizzard`（通过薄包装器 `aiCastBlizzard`）

---

## 3. 目标选择规则

### 3.1 正触发条件（全部必须满足）

| 条件 | 说明 |
|------|------|
| Archmage 存活 | `!archmage.isDead && archmage.hp > 0` |
| Blizzard 已学习 | `archmage.abilityLevels.blizzard >= 1` |
| 法力充足 | `archmage.mana >= 75`（从 `HERO_ABILITY_LEVELS.blizzard.levels[currentLevel - 1].mana` 读取，不硬编码） |
| 冷却结束 | 当前时间 >= `archmage.blizzardCooldownUntil` |
| 无进行中 Blizzard 通道 | 无同一 Archmage 的活跃通道 |
| 存在敌方集群目标 | 至少 `ENEMY_CLUSTER_MIN` 个敌方非建筑单位在某个候选点附近 |

### 3.2 敌方集群定义

- **ENEMY_CLUSTER_MIN** = 3（在同一候选区域内可见的敌方非建筑单位）
- **ENEMY_CLUSTER_RADIUS** = 2.0（从 `HERO_ABILITY_LEVELS.blizzard.levels[currentLevel - 1].areaRadius` 读取，不硬编码）
- 只有非建筑、存活、可见的敌方单位计入集群计数
- 建筑不计入集群计数（Blizzard 对建筑有 0.5 倍率，但 AI 目标选择优先打击单位集群）

### 3.3 友军安全规则

尽管当前 `executeBlizzardWave` 跳过友军，目标合同仍要求：

| 条件 | 说明 |
|------|------|
| FRIENDLY_SAFETY_RADIUS | 3.0（比 `areaRadius` 大 1.0 的缓冲区，防止边缘单位和后续规则变化） |
| FRIENDLY_MAX_IN_ZONE | 2（候选目标点 FRIENDLY_SAFETY_RADIUS 内友军非建筑单位不得超过此数） |
| 友军排除 | 仅非建筑友军计入（建筑不移动，不计入安全检查） |

**理由**：当前运行时跳过友军，但：(1) 后续版本可能引入友军伤害规则；(2) 友军密集区暗示己方部队在交战，Blizzard 可能干扰己方阵型移动；(3) 避免视觉上 Blizzard 落在己方头上造成误读。

### 3.4 目标点评分

候选目标点评分规则（SimpleAI 用于排序候选点）：

```
score = enemyCount * ENEMY_WEIGHT + hasBuilding * BUILDING_BONUS
```

- **enemyCount**：候选点 `ENEMY_CLUSTER_RADIUS` 内敌方非建筑单位数
- **hasBuilding**：候选点 `ENEMY_CLUSTER_RADIUS` 内是否有敌方建筑（0 或 1）
- **ENEMY_WEIGHT** = 10（单位权重）
- **BUILDING_BONUS** = 2（建筑额外加权，低于单位权重，因为建筑不移动且倍率低）
- 友军安全条件是硬性过滤（不满足则排除该候选点），不参与评分

### 3.5 候选点生成

- 候选点集合 = 所有存活、非建筑、可见敌方单位的位置
- 对每个候选点计算集群计数、友军安全、评分
- 选择评分最高的合法候选点
- 如果无合法候选点（所有点友军安全不通过或集群不足），不施放

### 3.6 施法范围约束

- 候选点必须在 Archmage 施法范围内（`range = 8.0`，从 `HERO_ABILITY_LEVELS` 读取）
- 超出范围的候选点排除

---

## 4. 负停止条件（任一满足则不施放）

| 条件 | 说明 |
|------|------|
| 无存活 Archmage | — |
| Blizzard 未学习 | `abilityLevels.blizzard < 1` |
| 法力不足 | `mana < levelData.mana` |
| 冷却中 | `gameTime < blizzardCooldownUntil` |
| 已有同一 Archmage 活跃通道 | — |
| 无敌方集群 | 所有候选点周围敌方单位 < `ENEMY_CLUSTER_MIN` |
| 友军密集 | 所有候选点周围友军 > `FRIENDLY_MAX_IN_ZONE` |
| 候选点超出范围 | — |
| Archmage 生命值过低 | `hp < archmage.maxHp * 0.2`（通道施法需要 Archmage 存活，低血量应优先撤退或自保） |

---

## 5. 委托原则

- `SimpleAI.ts` 只做意图选择（是否尝试施放 Blizzard、选择目标点）
- `SimpleAI.ts` 不复制 Blizzard 公式（伤害、波次、建筑倍率）
- `SimpleAI.ts` 不复制 `HERO_ABILITY_LEVELS.blizzard` 的数值
- `Game.ts` 拥有所有施放检查和伤害逻辑
- `AIContext` 新增的 `castBlizzard` 应遵循 Paladin/WE 模式：薄包装器委托到 `Game.ts` 现有路径
- 数值读取从 `GameData.ts` 的 `HERO_ABILITY_LEVELS.blizzard` 和 `WATER_ELEMENTAL_SUMMON_LEVELS` 进行，AI 不硬编码

---

## 6. 实现边界

### 6.1 Task298（HERO22-AI5）允许实现

- 在 `SimpleAI.ts` 新增 Blizzard 目标选择和施放意图逻辑
- 在 `AIContext` 接口新增 `castBlizzard` 方法
- 在 `Game.ts` 新增 `aiCastBlizzard` 薄包装器（同 `aiCastSummonWaterElemental` 模式）
- 新增 Blizzard AI 运行时测试

### 6.2 Task298 不得

- 修改 `castBlizzard` 私有方法的公式或逻辑
- 修改 `executeBlizzardWave` 的伤害或目标选择
- 修改 `HERO_ABILITY_LEVELS.blizzard` 数值
- 引入 Mass Teleport AI 施放
- 引入 Brilliance Aura 主动施放
- 修改 Water Elemental AI 逻辑
- 修改 Paladin AI 逻辑

---

## 7. 禁区

以下内容不属于 HERO22-AI4 或 HERO22-AI5：

- 修改 `Game.ts` Blizzard 公式或运行时规则
- 修改 `GameData.ts` Blizzard 数值
- 新增 Blizzard 专属图标、音效、粒子、模型素材
- Mass Teleport AI 施放
- Brilliance Aura 主动施放
- Mountain King 英雄分支
- Blood Mage 英雄分支
- 物品系统 / 商店 / Tavern
- 完整 AI 战术（侦查、撤退、集火、编队、技能组合、威胁评估）
- 完整英雄系统
- 完整人族
- V9 发布

---

## 8. 明确开放项

| 项目 | 状态 |
|------|------|
| Blizzard AI 施放实现（Task298） | 未开始 |
| Mass Teleport AI 策略合同 | 未开始 |
| Mountain King 英雄分支 | 未开始 |
| Blood Mage 英雄分支 | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 最终素材/图标/粒子/音效 | 未开始 |
| 完整 AI 战术 | 未完成 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 9. 非声称

本文档 **不** 声称：

- Blizzard AI 已实现（本合同只定义目标选择规则，不写代码）
- 完整 AI 已完成
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- SimpleAI 已接入 Blizzard 或 Mass Teleport AI 施放
- Game.ts Blizzard 运行时已修改

---

## 10. 合同声明

HERO22-AI4 只说明：

1. Blizzard 玩家侧运行时（`castBlizzard`）已存在且完整（Task285 accepted）。
2. `HERO_ABILITY_LEVELS.blizzard` 定义了 3 级数据：mana 75、cooldown 6、range 8.0、areaRadius 2.0、maxTargets 5、waves 6/8/10、buildingMult 0.5。
3. 当前运行时 `executeBlizzardWave` 跳过友军单位，但目标合同仍要求友军安全规则。
4. AI Blizzard 目标选择需要敌方集群至少 3 个非建筑单位，且候选点周围友军不超过 2 个（FRIENDLY_SAFETY_RADIUS = 3.0）。
5. 下一步安全任务是 Task298（HERO22-AI5）：按本合同规则实现 Blizzard 最小施放。
6. `Game.ts` 拥有公式和合法施放，`SimpleAI` 只做意图选择。

HERO22-AI4 不说明：

- Blizzard AI 已实现。
- 完整 AI 已完成。
- 完整英雄系统已完成。
- 完整人族已完成。
- V9 已发布。
