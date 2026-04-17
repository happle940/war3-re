# V9 HERO14-CLOSE1 Resurrection 分支收口盘点

> 生成时间：2026-04-17
> 任务编号：Task 252
> 本文档是 HERO14 Resurrection 分支的收口盘点。不宣称完整圣骑士、完整英雄系统、完整人族或 V9 发布。

---

## 1. 分支任务链

| 任务 | 阶段 | 产出 |
|------|------|------|
| Task 245 | HERO14-CONTRACT1 | 分支合同、运行时证明义务、延后边界 |
| Task 246 | HERO14-SRC1 | 来源边界、Blizzard 主源值、来源歧义记录 |
| Task 247 | HERO14-DATA1 | `HERO_ABILITY_LEVELS.resurrection` 数据种子 |
| Task 248 | HERO14-IMPL1A | Paladin 学习入口、命令卡学习按钮 |
| Task 249 | HERO14-IMPL1B | `deadUnitRecords` 死亡记录底座 |
| Task 250 | HERO14-IMPL1C | `castResurrection` 最小施放运行时 |
| Task 251 | HERO14-UX1 | 最小可见反馈（等级、冷却、复活数量） |
| Task 252 | HERO14-CLOSE1 | 本收口盘点 |

---

## 2. 证明文件清单

### 文档

| 文件 | 内容 |
|------|------|
| `docs/V9_HERO14_RESURRECTION_CONTRACT.zh-CN.md` | 分支合同、证明义务、延后声明 |
| `docs/V9_HERO14_RESURRECTION_SOURCE_BOUNDARY.zh-CN.md` | 来源层级、采纳值、行为规则、项目映射 |
| `docs/V9_HERO14_RESURRECTION_DATA_SEED.zh-CN.md` | 数据种子记录、源值映射、延后未知 |
| `docs/V9_HERO14_RESURRECTION_LEARN_SLICE.zh-CN.md` | 学习入口切片能力与边界 |
| `docs/V9_HERO14_RESURRECTION_DEAD_RECORD_SLICE.zh-CN.md` | 死亡记录底座能力与边界 |
| `docs/V9_HERO14_RESURRECTION_CAST_RUNTIME_SLICE.zh-CN.md` | 施放运行时能力与边界 |
| `docs/V9_HERO14_RESURRECTION_VISIBLE_FEEDBACK.zh-CN.md` | 可见反馈能力与边界 |

### 静态证明

| 文件 | 测试数 |
|------|--------|
| `tests/v9-hero14-resurrection-contract.spec.mjs` | 30 |
| `tests/v9-hero14-resurrection-source-boundary.spec.mjs` | 30 |
| `tests/v9-hero14-resurrection-data-seed.spec.mjs` | 18 |

### 运行时证明

| 文件 | 测试数 |
|------|--------|
| `tests/v9-hero14-resurrection-learn-runtime.spec.ts` | 3 |
| `tests/v9-hero14-resurrection-dead-record-runtime.spec.ts` | 2 |
| `tests/v9-hero14-resurrection-cast-runtime.spec.ts` | 5 |
| `tests/v9-hero14-resurrection-visible-feedback.spec.ts` | 5 |

总计：93 个证明。

---

## 3. 玩家当前能做什么

1. **学习 Resurrection**：Paladin 在英雄等级 6 时，可通过技能点学习 Resurrection（1 级终极技能，最多 1 级）。学习后在命令卡显示，单位属性面板显示 `复活术 Lv1`。
2. **施放 Resurrection**：已学习的 Paladin 选中后，命令卡出现 `复活` 按钮。按钮在以下情况禁用并给出中文原因：已死亡、法力不足（< 200）、冷却中、无可复活单位。
3. **复活单位**：成功施放消耗 200 法力，启动 240 秒冷却，以 Paladin 为中心 9.0 半径内，按最早死亡顺序复活最多 6 个友方普通地面非英雄、非建筑死亡单位。复活单位出现在记录的死亡位置，使用 `spawnUnit` 默认状态。
4. **可见反馈**：施放后单位属性面板短暂显示 `刚复活 N 个单位`（约 5 秒），Paladin 上方浮动数字显示复活数量。冷却中时属性面板显示 `复活冷却 Ns`，命令按钮显示 `冷却中 N.Ns`。
5. **HERO9 Altar revive 独立**：Paladin 死亡后仍通过祭坛复活，不进入 `deadUnitRecords`。祭坛复活后保留已学习的 Resurrection 等级。

---

## 4. 生产代码边界确认

| 文件 | 包含 | 不包含 |
|------|------|--------|
| `src/game/GameData.ts` | `HERO_ABILITY_LEVELS.resurrection` 数据种子（mana 200, cooldown 240, range 4.0, areaRadius 9.0, maxTargets 6, requiredHeroLevel 6） | `ABILITIES.resurrection` 条目 |
| `src/game/Game.ts` | `castResurrection()`、`getResurrectionEligibleRecordIndices()`、`deadUnitRecords` 底座、学习入口、命令卡按钮、`resurrectionCooldownUntil`、`resurrectionLastRevivedCount`、`resurrectionFeedbackUntil`、浮动数字反馈 | `ABILITIES.resurrection`、`群体复活` 措辞 |
| `src/game/SimpleAI.ts` | — | 无任何 Resurrection 行为 |

---

## 5. 数据种子值

| 字段 | 值 | 来源 |
|------|------|------|
| mana | 200 | Blizzard Classic Battle.net 主源 |
| cooldown | 240s | 主源 |
| range | 4.0 | 主源 Range 40 × 0.1 |
| areaRadius | 9.0 | 主源 AoE 90 × 0.1 |
| maxTargets | 6 | 主源 |
| requiredHeroLevel | 6 | 主源 |
| maxLevel | 1 | 终极技能 |

---

## 6. 仍然延后

以下内容不属于 HERO14 分支，不应被误宣称为已完成：

- `ABILITIES.resurrection` 条目
- AI 英雄使用 Resurrection 策略
- 粒子、声音、图标、素材
- 尸体存在时间 / corpse decay timer
- 来源精确 most-powerful 排序
- 友方英雄尸体是否可复活
- 其他 Human 英雄（Archmage、Mountain King、Blood Mage）
- 物品、商店、Tavern
- 第二种族、空军、多人联机
- 完整圣骑士、完整英雄系统、完整人族
- V9 发布

---

## 7. 合同声明

HERO14 Resurrection 分支不宣称以下任何一项：
- 完整圣骑士
- 完整英雄系统
- 完整人族
- V9 已发布
