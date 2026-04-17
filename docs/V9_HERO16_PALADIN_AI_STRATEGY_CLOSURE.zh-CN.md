# V9 HERO16-CLOSE1 Paladin AI 策略收口盘点

> 生成时间：2026-04-17 12:25:34 CST  
> 任务编号：Task 260  
> 本文档只收口 Paladin 最小 AI 链路，不新增运行时行为，不宣称完整 AI、完整英雄系统、完整人族或 V9 发布。

---

## 1. 任务链

| 任务 | 范围 | 结论 |
|------|------|------|
| Task 254 | HERO16-CONTRACT1 Paladin AI 英雄策略边界合同 | 定义 AI1-AI5 顺序、禁区和委托原则 |
| Task 255 | HERO16-AI1 AI Altar 建造 + Paladin 召唤 | AI 可在经济和唯一性条件满足时建造 Altar 并召唤一个 Paladin |
| Task 256 | HERO16-AI2 AI Paladin 技能学习优先级 | AI 按 Holy Light -> Divine Shield -> Devotion Aura -> Resurrection 学习 |
| Task 257 | HERO16-AI3 AI Holy Light 防御施放 | AI 复用现有 Holy Light 运行时治疗受伤友军 |
| Task 258 | HERO16-AI4 AI Divine Shield 自保施放 | AI 在低生命时复用现有 Divine Shield 运行时自保 |
| Task 259 | HERO16-AI5 AI Resurrection 施放 | AI 复用现有 Resurrection 运行时复活合法友方死亡记录 |
| Task 260 | HERO16-CLOSE1 Paladin AI 策略收口盘点 | 对齐 AI1-AI5 证据链、历史口径和延后范围 |

---

## 2. 证明文件

| 证明 | 用途 |
|------|------|
| `tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs` | Paladin AI 策略合同和委托边界 |
| `tests/v9-hero16-ai-altar-paladin-summon.spec.ts` | AI 建造 Altar 和召唤 Paladin |
| `tests/v9-hero16-ai-paladin-skill-learning.spec.ts` | AI 技能学习顺序 |
| `tests/v9-hero16-ai-holy-light-cast.spec.ts` | AI Holy Light 防御施放 |
| `tests/v9-hero16-ai-divine-shield-cast.spec.ts` | AI Divine Shield 自保施放 |
| `tests/v9-hero16-ai-resurrection-cast.spec.ts` | AI Resurrection 施放 |
| `tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs` | 本收口文档静态证明 |

---

## 3. 当前 AI 能做什么

Paladin 最小 AI 链路现在只覆盖以下能力：

- 在经济允许、已有基础开局且没有 Altar 或在建 Altar 时，建造 Altar of Kings。
- 在已有完成 Altar、没有己方 Paladin 且没有正在训练 Paladin 时，召唤一个 Paladin。
- Paladin 有技能点时，按 Holy Light -> Divine Shield -> Devotion Aura -> Resurrection 顺序学习，尊重英雄等级门槛。
- Holy Light：选择受伤友方普通目标，实际法力、冷却、范围、目标合法性和治疗量由 `Game.ts` 的施法路径判断。
- Divine Shield：只做低生命触发意图，实际法力、冷却、持续时间和无敌状态由 `Game.ts` 的施法路径判断。
- Devotion Aura：被动技能，只学习，不主动施放。
- Resurrection：只发起施法意图，实际法力、冷却、死亡记录过滤、范围、数量和复活逻辑由 `Game.ts` 的施法路径判断。

---

## 4. 委托边界

`SimpleAI.ts` 只做意图选择：

- 是否需要 Altar。
- 是否训练 Paladin。
- 学哪个技能。
- 何时尝试治疗、开盾或复活。

`Game.ts` 继续拥有所有能力规则：

- mana 成本。
- cooldown。
- range / areaRadius。
- duration。
- target rule。
- heal / invulnerability / revive 的实际效果。
- Resurrection 的 `deadUnitRecords` 过滤和复活数量。

这意味着 HERO16 没有在 AI 层复制 Paladin 技能公式，后续数值调整仍应优先改数据和 `Game.ts` 运行时规则。

---

## 5. 历史口径对齐

Task254 合同撰写时，`SimpleAI.ts` 确实没有 Paladin 行为；Task255 到 Task259 已按合同逐步把最小 Paladin AI 链路接入。

因此，旧文档中“AI 英雄策略仍延后”的正确新口径是：

- 完整 AI 英雄策略仍延后。
- HERO16 只完成 Paladin 最小 AI 链路。
- 其他英雄、物品、商店、Tavern、完整战术、完整敌情判断和完整编队仍未完成。

---

## 6. 明确延后

以下内容仍不属于 HERO16：

- Archmage、Mountain King、Blood Mage 的数据、运行时和 AI。
- 完整 AI 战术：侦查、撤退、集火、编队、位置控制、技能组合、威胁评估。
- 物品、背包、商店、Tavern。
- 新英雄图标、声音、粒子和专用模型素材。
- 空军、战役、第二种族、多人联机。
- 完整英雄系统、完整人族和 V9 发布。

---

## 7. 合同声明

HERO16-CLOSE1 只说明：Paladin 最小 AI 链路已有工程证据，并且没有复制技能公式。

HERO16-CLOSE1 不说明：

- 完整 AI 已完成。
- 完整英雄系统已完成。
- 完整人族已完成。
- V9 已发布。
