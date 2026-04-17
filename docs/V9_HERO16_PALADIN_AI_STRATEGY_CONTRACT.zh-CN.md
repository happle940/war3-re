# V9 HERO16-CONTRACT1 Paladin AI 英雄策略边界合同

> 生成时间：2026-04-17
> 前置：Task253 / HERO15-CLOSE1 已 accepted，Paladin 最小能力套件完成全局静态收口。
> 任务编号：Task 254
> 本文档定义 AI 侧 Paladin 使用的最小安全合同。不实现任何 AI 行为、不修改生产代码、不宣称完整 AI 策略、完整英雄系统、完整人族或 V9 发布。

---

## 1. 基线引用

本合同基于以下已 accepted 收口证据链：

| 分支 | 收口证明 |
|------|----------|
| HERO8 | `tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs` — 最小英雄运行时 |
| HERO9 | `tests/v9-hero9-death-revive-closure.spec.mjs` — 英雄死亡/Altar 复活 |
| HERO10 | `tests/v9-hero10-xp-leveling-closure.spec.mjs` — XP/升级/技能点 |
| HERO11 | `tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs` — 技能学习 |
| HERO12 | `tests/v9-hero12-divine-shield-closure.spec.mjs` — 神圣护盾 |
| HERO13 | `tests/v9-hero13-devotion-aura-closure.spec.mjs` — 虔诚光环 |
| HERO14 | `tests/v9-hero14-resurrection-closure.spec.mjs` — 复活术 |
| HERO15 | `tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` — Paladin 最小能力套件全局收口 |

---

## 2. 当前边界事实（阶段感知更新）

> **阶段说明**：本合同撰写时（Task254），`SimpleAI.ts` 确实没有任何 Paladin 相关行为。
> Task255（AI1）到 Task259（AI5）已按本合同定义的分阶段顺序逐一实施并通过验收。
> 以下列出的是 **合同撰写时的基线事实**，已在后续任务中改变的部分标注了对应任务编号。

合同撰写时 `SimpleAI.ts` 的边界事实：

- ~~不建造 Altar of Kings~~ → Task255/HERO16-AI1 已实施
- ~~不召唤 Paladin~~ → Task255/HERO16-AI1 已实施
- ~~不学习 Paladin 技能~~ → Task256/HERO16-AI2 已实施
- ~~不施放 Holy Light~~ → Task257/HERO16-AI3 已实施
- ~~不施放 Divine Shield~~ → Task258/HERO16-AI4 已实施
- 不受 Devotion Aura 影响决策（光环本身是被动，不影响 AI 决策）
- ~~不施放 Resurrection~~ → Task259/HERO16-AI5 已实施

当前 `SimpleAI.ts` 的 Paladin AI 行为通过 `AIContext` 接口委托到 `Game.ts` 的公共包装方法，不复制法力、冷却、范围、目标选择或复活数学公式。

---

## 3. 分阶段未来顺序

AI Paladin 使用按以下严格顺序分阶段实施。每个阶段必须在前一阶段 accepted 后才能开始。

### 顺序约束

HERO16-AI1 → HERO16-AI2 → HERO16-AI3 → HERO16-AI4 → HERO16-AI5

每个阶段前置必须为 `accepted`（Codex 本地复核通过），而非仅 `completed`。

### HERO16-AI1：AI Altar 建造 + Paladin 召唤就绪

AI 在满足以下条件时建造 Altar 并召唤 Paladin：

1. 经济允许（足够黄金和人口）。
2. 尚未拥有 Paladin（唯一性约束：同阵营最多一个 Paladin）。
3. Altar 不已存在或已在建造队列中。

此阶段只处理建筑和单位生产，不涉及技能或施法。

### HERO16-AI2：AI 技能学习优先级

AI 在 Paladin 获得技能点时按以下默认优先级学习：

1. **Holy Light**：第一优先，因为持续治疗在当前 AI 经济压力下价值最高。
2. **Divine Shield**：第二优先，提供生存能力。
3. **Devotion Aura**：第三优先，被动增益。
4. **Resurrection**：仅在英雄等级 6 且已学习前三个技能时学习。

除非有明确理由（如特定战术实验），否则不偏离此优先级。

此阶段只处理 `heroSkillPoints` 分配，不涉及主动施放。

### HERO16-AI3：AI Holy Light 防御性治疗施放

AI 在以下条件满足时施放 Holy Light：

1. Paladin 已学习 Holy Light（至少 1 级）。
2. Paladin 存活且非死亡状态。
3. 法力充足（≥ 当前等级法力消耗）。
4. 技能不在冷却中。
5. 存在受伤友方单位（HP < maxHP）在施法范围内。
6. 目标选择遵循现有 `castHolyLight` 规则（友方、非建筑、在范围内）。

此阶段不改变 Holy Light 的游戏机制，只添加 AI 决策何时施放。

### HERO16-AI4：AI Divine Shield 自保施放

AI 在以下条件满足时施放 Divine Shield：

1. Paladin 已学习 Divine Shield（至少 1 级）。
2. Paladin 存活。
3. Paladin HP 低于阈值（具体阈值在 AI1 实施时确定）或处于受攻击状态。
4. 法力充足。
5. 技能不在冷却中。

此阶段不改变 Divine Shield 的游戏机制，只添加 AI 决策何时施放。

### HERO16-AI5：AI Resurrection 施放

AI 在以下条件满足时施放 Resurrection：

1. Paladin 已学习 Resurrection（终极技能）。
2. Paladin 存活。
3. 英雄等级 ≥ 6。
4. 法力充足（≥ 200）。
5. 技能不在冷却中。
6. `deadUnitRecords` 中存在至少 N 个可复活记录（N 在实施时确定，至少 1）。
7. 可复活记录在 Paladin 的 `areaRadius` 范围内。

此阶段不改变 Resurrection 的游戏机制，只添加 AI 决策何时施放。

---

## 4. Devotion Aura 说明

Devotion Aura 是被动技能，不需要主动施放策略：

- AI 不需要"决定何时施放"Devotion Aura。
- AI 学习 Devotion Aura 后，附近友方单位自动获得护甲加成。
- AI 受益于 Devotion Aura 的方式与玩家相同，无需额外 AI 代码。
- AI 可能在未来版本中受益于"将 Paladin 移到需要护甲加成的友军附近"的定位策略，但这不属于 HERO16 任何阶段。

---

## 5. 明确延后

以下内容不属于 HERO16 合同范围：

- 其他三个 Human 英雄的 AI 策略（Archmage、Mountain King、Blood Mage）
- 物品/背包系统
- 商店系统
- Tavern 系统
- 新视觉/音频资产（图标、粒子、声音）
- 全知敌人作弊（超出当前 `game-state` 检查范围的敌方信息获取）
- 完整 AI 策略宣称
- 完整英雄系统宣称
- 完整人族宣称
- V9 发布宣称

---

## 6. 合同声明

本合同不宣称以下任何一项：

- 完整 AI 策略已完成（HERO16-AI1 到 AI5 仅覆盖最小 Paladin AI 链路）
- 其他英雄 AI 已完成
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
