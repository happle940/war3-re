# V9 HERO13-CLOSE1 Devotion Aura 分支收口盘点

> 生成时间：2026-04-16
> 前置：Task 238–243 全部已 accepted。
> 范围：盘点 HERO13 Devotion Aura 分支已完成的内容和明确延后的内容。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 分支切片引用

| 切片 | 任务号 | 文档 | 源文件 |
|------|--------|------|--------|
| CONTRACT1 | Task 238 | `docs/V9_HERO13_DEVOTION_AURA_CONTRACT.zh-CN.md` | — |
| SRC1 | Task 239 | `docs/V9_HERO13_DEVOTION_AURA_SOURCE_BOUNDARY.zh-CN.md` | — |
| DATA1 | Task 240 | `docs/V9_HERO13_DEVOTION_AURA_DATA_SEED.zh-CN.md` | `GameData.ts` |
| IMPL1 | Task 241 | `docs/V9_HERO13_DEVOTION_AURA_RUNTIME_SLICE.zh-CN.md` | `Game.ts` |
| IMPL2 | Task 242 | `docs/V9_HERO13_DEVOTION_AURA_LEARN_SLICE.zh-CN.md` | `Game.ts` |
| UX1 | Task 243 | `docs/V9_HERO13_DEVOTION_AURA_VISIBLE_FEEDBACK.zh-CN.md` | `Game.ts` |

---

## 2. 已验证证明文件

| 证明文件 | 类型 | 验证命令 |
|---------|------|---------|
| `tests/v9-hero13-devotion-aura-contract.spec.mjs` | 静态 | `node --test tests/v9-hero13-devotion-aura-contract.spec.mjs` |
| `tests/v9-hero13-devotion-aura-source-boundary.spec.mjs` | 静态 | `node --test tests/v9-hero13-devotion-aura-source-boundary.spec.mjs` |
| `tests/v9-hero13-devotion-aura-data-seed.spec.mjs` | 静态 | `node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs` |
| `tests/v9-hero13-devotion-aura-runtime.spec.ts` | 运行时 | `./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-runtime.spec.ts` |
| `tests/v9-hero13-devotion-aura-learn-runtime.spec.ts` | 运行时 | `./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-learn-runtime.spec.ts` |
| `tests/v9-hero13-devotion-aura-visible-feedback.spec.ts` | 运行时 | `./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-visible-feedback.spec.ts` |
| `tests/v9-hero13-devotion-aura-closure.spec.mjs` | 静态 | `node --test tests/v9-hero13-devotion-aura-closure.spec.mjs` |

---

## 3. 玩家当前能力

完成 HERO13 分支后，玩家可以：

- **学习** Devotion Aura：在命令卡消费技能点，等级 1/2/3 需要英雄等级 1/3/5。
- **被动光环**：Paladin 学习后，以自身为中心 9.0 半径内向友方非建筑单位提供护甲加成（+1.5/+3/+4.5）。
- **自我加成**：Paladin 自身也获得护甲加成。
- **HUD 反馈**：选中 Paladin 时显示 `虔诚光环 Lv${level}`；选中受影响友方单位时显示 `虔诚光环 +${bonus} 护甲`。
- **自动生效**：无需施放按钮、无魔力消耗、无冷却时间。
- **死亡移除**：Paladin 死亡时所有友方单位失去护甲加成。
- **范围进出**：单位进入范围获得加成，离开范围失去加成。
- **不叠加**：同源 Devotion Aura 不重复累计。
- **敌方无关**：敌方单位和建筑不受友方 Devotion Aura 影响。
- **不永久修改**：护甲加成是临时的，不会永久修改基础护甲值。

---

## 4. 明确延后（不在 HERO13 范围内）

- Devotion Aura 地面视觉效果（粒子、光环圈）
- Devotion Aura 范围指示器
- Resurrection（复活终极技能）
- 其他 Paladin 技能
- 其他 Human 英雄（Archmage、Mountain King、Blood Mage）
- AI 英雄策略
- 物品系统
- 商店
- Tavern
- 视觉特效（粒子、图标、声音）
- 资产（美术资源）
- 第二种族
- 空军
- 多人联机
- ABILITIES.devotion_aura 运行时条目（继续使用 HERO_ABILITY_LEVELS）
- 建筑/空中单位受影响范围扩展
- 完整圣骑士
- 完整英雄系统
- 完整人族
- V9 发布

---

## 5. 合同声明

HERO13 分支 **仅** 实现 Paladin 的 Devotion Aura 被动光环学习、运行时效果和可见反馈。

HERO13 分支 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现 Resurrection
- 已实现 AI 使用 Devotion Aura
- 已实现视觉特效
- 已实现建筑/空中单位受影响范围
- Devotion Aura 有施放按钮（被动技能，无施放按钮）
