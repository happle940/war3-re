# V9 HERO22-CLOSE1 Archmage AI 策略收口盘点

> 生成时间：2026-04-18
> 任务编号：Task 300
> 本文档是 HERO22 最小 Archmage AI 策略链路的收口盘点。汇总 Task293-299 的已接受证据，记录当前 AI 真实能力、委托边界、证明覆盖和未完成项。
> 本文档 **不** 声称"Archmage AI 已完成"、"完整 AI"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 已接受证据链

| 任务 | 编号 | 范围 | 状态 |
|------|------|------|------|
| Task293 | HERO22-CONTRACT1 | Archmage AI 策略边界合同 | accepted |
| Task294 | HERO22-AI1 | Archmage 训练就绪 | accepted |
| Task295 | HERO22-AI2 | Archmage 技能学习顺序 | accepted |
| Task296 | HERO22-AI3 | Water Elemental AI 最小施放 | accepted |
| Task297 | HERO22-AI4 | Blizzard AI 目标合同 | accepted |
| Task298 | HERO22-AI5 | Blizzard AI 最小施放 | accepted |
| Task299 | HERO22-AI6 | Mass Teleport AI 策略合同 | accepted |

HERO22 最小 AI 策略链路的 7 个任务均 accepted，每个任务的静态证明和/或运行时证明均已通过 Codex 本地复核。

---

## 2. 当前 AI 真实能力

### 2.1 训练（AI1，Task294）

- AI 可通过现有 Altar of Kings 路径训练 **恰好一个** Archmage
- 唯一性约束：每支 AI 队伍最多一个 Archmage（与 Paladin 唯一性一致）
- Paladin AI 不受影响

### 2.2 技能学习（AI2，Task295）

- AI 按固定顺序学习 Archmage 技能：Water Elemental → Brilliance Aura → Blizzard → Mass Teleport
- 每级只学一个技能，尊重 `HERO_ABILITY_LEVELS` 和 `WATER_ELEMENTAL_SUMMON_LEVELS` 中的 `requiredHeroLevel` 门槛
- `GameData.ts` 中的 `requiredHeroLevel` 是唯一的等级门槛源，AI 不硬编码

### 2.3 Water Elemental 施放（AI3，Task296）

- AI 可在战斗或敌方压力附近召唤一个 Water Elemental
- 使用现有运行时 `castSummonWaterElemental()` 路径，通过 `aiCastSummonWaterElemental` 薄包装器委托
- SimpleAI 只选择意图（何时、何地召唤），`Game.ts` 拥有法力、冷却、范围、目标合法性判断

### 2.4 Brilliance Aura

- 被动技能，AI 不施放
- AI 只在技能学习顺序到达时学习它
- 运行时 `updateBrillianceAura()` 自动处理光环施加

### 2.5 Blizzard 施放（AI4/AI5，Task297/298）

- AI 可按 Task297 合同条件尝试 Blizzard：
  - 敌方集群至少 3 个非建筑单位（ENEMY_CLUSTER_MIN = 3）
  - 友军安全硬性过滤（FRIENDLY_SAFETY_RADIUS = 3.0, FRIENDLY_MAX_IN_ZONE = 2）
  - 目标评分公式排序候选点
  - 低血量停止（hp < maxHp × 0.2）
- 使用现有运行时 `castBlizzard()` 路径，通过 `aiCastBlizzard` 薄包装器委托
- `Game.ts` 仍拥有通道、波次、伤害、建筑倍率、最大目标数等全部公式

### 2.6 Mass Teleport（AI6，Task299）

- **只有策略合同，没有自动 Mass Teleport runtime**
- 合同定义了两个最小触发场景：撤退（Archmage 低血量）和回防（基地受攻击）
- 目标建筑规则：己方已完成的 Town Hall / Keep / Castle / Altar
- 单位选择委托 `Game.ts` 运行时，AI 不手写传送名单
- **AI 当前不施放 Mass Teleport**

---

## 3. 委托边界

### 3.1 SimpleAI.ts 职责

- 意图选择：是否训练、学哪个技能、何时尝试施放、选择目标点
- 不复制任何技能公式（伤害、治疗、冷却、范围、波次、召唤参数、建筑倍率、传送延迟、单位收集）
- 不硬编码 `GameData.ts` 数值

### 3.2 Game.ts 职责

- 拥有所有能力规则的合法施放判断（mana、cooldown、range、target rule）
- 拥有施放效果（治疗、无敌、复活、召唤、通道伤害、传送）
- AI-facing 薄包装器：`aiCastSummonWaterElemental`、`aiCastBlizzard`

### 3.3 GameData.ts

- 所有 Archmage 能力数值的唯一定义源
- Task300 不修改 `Game.ts`
- Task300 不修改 `SimpleAI.ts`
- Task300 不修改 `GameData.ts`

---

## 4. 证明覆盖

| 证明文件 | 类型 | 测试数 | 覆盖范围 |
|----------|------|--------|----------|
| `tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs` | 静态 | 24 | 策略边界、分阶段序列、委托原则、禁区 |
| `tests/v9-hero22-archmage-ai-blizzard-target-contract.spec.mjs` | 静态 | 20 | Blizzard 目标合同规则 |
| `tests/v9-hero22-archmage-ai-mass-teleport-strategy-contract.spec.mjs` | 静态 | 21 | MT 策略合同规则 |
| `tests/v9-hero22-archmage-ai-closure.spec.mjs` | 静态 | 16 | 收口盘点 |
| `tests/v9-hero22-archmage-ai-training-readiness.spec.ts` | 运行时 | 5 | AI1 训练能力 |
| `tests/v9-hero22-archmage-ai-skill-learning-priority.spec.ts` | 运行时 | 5 | AI2 技能学习 |
| `tests/v9-hero22-archmage-ai-water-elemental-cast.spec.ts` | 运行时 | 5 | AI3 WE 施放 |
| `tests/v9-hero22-archmage-ai-blizzard-cast.spec.ts` | 运行时 | 5 | AI5 Blizzard 施放 |

验证命令：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero22-archmage-ai-closure.spec.mjs tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs tests/v9-hero22-archmage-ai-mass-teleport-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

---

## 5. 未完成项

| 项目 | 状态 |
|------|------|
| Mass Teleport AI 自动施放 runtime | 只有合同，未实现 |
| Mountain King 英雄分支 | 未开始 |
| Blood Mage 英雄分支 | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 空军单位 | 未开始 |
| 最终模型 / 图标 / 粒子 / 声音 | 未开始 |
| 完整 AI 战术（侦查、撤退、集火、编队、技能组合、威胁评估） | 未完成 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 6. 非声称

本文档 **不** 声称：

- Archmage AI 已完成（Mass Teleport AI runtime 未实现）
- 完整 AI 已完成
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Archmage 有终版视觉/音频效果
- SimpleAI 已接入完整 Archmage 行为
- SimpleAI 已接入 Mass Teleport AI 施放

---

## 7. 收口声明

HERO22-CLOSE1 只说明：

1. Task293-299 全部 accepted，构成 HERO22 最小 Archmage AI 策略收口证据。
2. AI 真实能力：训练一个 Archmage、按固定顺序学习技能、Water Elemental 最小施放、Blizzard 最小施放。
3. AI 只有 Mass Teleport 策略合同，不施放 Mass Teleport。
4. Brilliance Aura 是被动技能，AI 不施放。
5. `SimpleAI.ts` 只做意图选择，`Game.ts` 拥有所有公式和合法施放判断。
6. 下一步应由 Codex 根据相邻缺口选择：HERO23 Mountain King 合同，或 Human 完整度盘点。

HERO22-CLOSE1 不说明：

- Archmage AI 已完成。
- 完整 AI 已完成。
- 完整英雄系统已完成。
- 完整人族已完成。
- V9 已发布。
