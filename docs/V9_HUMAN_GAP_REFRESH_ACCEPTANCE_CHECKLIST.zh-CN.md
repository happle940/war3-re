# V9-HUMAN-GAP-REFRESH 接收清单

> 用途：Task300 accepted 后，先把 Human 当前真实缺口刷新成最新口径，再决定下一张相邻任务。
> 目标：避免旧盘点继续把 Paladin / Archmage 写成整块缺失，也避免系统直接跳到 Blood Mage、物品、空军或发布线。
> 状态：Codex 预热清单；不是任务派发，不代表已经进入实现。

## 1. 触发条件

只能在以下条件同时满足后启动：

- Task300 / HERO22-CLOSE1 已经被 Codex 本地复核 accepted。
- `docs/V9_HERO22_ARCHMAGE_AI_CLOSURE.zh-CN.md` 已存在且通过静态 proof。
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md` 明确 V9 仍未工程关闭。
- GLM 没有正在编辑 Human gap inventory 或 HERO22 closure 相关文件。

如果 Task300 没有 accepted，不能启动这个刷新任务。

## 2. 必须读取的真实来源

Human gap refresh 不能只改一句话，必须重新读取并对齐这些来源：

- `docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/V9_HERO15_PALADIN_MINIMAL_KIT_CLOSURE.zh-CN.md`
- `docs/V9_HERO16_PALADIN_AI_STRATEGY_CLOSURE.zh-CN.md`
- `docs/V9_HERO21_MASS_TELEPORT_CLOSURE_INVENTORY.zh-CN.md`
- `docs/V9_HERO22_ARCHMAGE_AI_CLOSURE.zh-CN.md`
- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/game/SimpleAI.ts`

## 3. 必须刷新成的用户可读事实

刷新后的缺口盘点必须用正常用户能看懂的话写清楚：

- 已有：Town Hall / Keep / Castle 主基地升级链。
- 已有：Barracks / Blacksmith / Lumber Mill / Workshop / Arcane Sanctum / Farm / Tower 的最小 Human 核心链。
- 已有：Footman、Rifleman、Mortar Team、Priest、Sorceress、Knight 的最小训练或战斗链。
- 已有：Blacksmith 多段近战、远程、护甲、Leather Armor、Animal War Training 等研究链。
- 已有：Paladin 玩家侧最小能力套件和 Paladin 最小 AI 链路。
- 已有：Archmage 玩家侧 Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 最小链路。
- 已有：Archmage AI 能训练、学习技能、召唤 Water Elemental、按合同施放 Blizzard。
- 仍未完成：Archmage AI 自动 Mass Teleport runtime。
- 仍未完成：Mountain King、Blood Mage。
- 仍未完成：Spell Breaker、Siege Engine、Flying Machine、Gryphon Rider、Dragonhawk Rider。
- 仍未完成：Arcane Vault、物品、商店、Tavern、背包。
- 仍未完成：AI Keep -> Castle 自动升级、AI 主动 Knight、完整中后期 AI 编队。
- 仍未完成：Gryphon Aviary、空军系统、完整地形/战役/多人/第二阵营。
- 仍未完成：最终模型、图标、粒子、声音和公开发布质量。

## 4. 候选任务评分标准

刷新任务必须给下一张相邻任务打分，不允许凭感觉补货。评分维度如下：

| 维度 | 高分含义 |
| --- | --- |
| 玩家可见价值 | 玩家下一局能明显感到 Human 更接近 War3。 |
| 依赖成熟度 | 现有数据、运行时、UI 和测试底座足够支撑小切片。 |
| 可证明性 | 能用静态 proof 或 focused runtime 明确验收，不靠主观描述。 |
| 文件风险 | 不需要大面积改 `Game.ts` 或同时触碰多个高风险系统。 |
| 防越界能力 | 不会一口气扩成完整英雄系统、物品系统、空军或发布线。 |
| 相邻性 | 直接承接当前 V9-HEROCHAIN1 / Human core gap，不开远线。 |

候选至少包括：

- `HERO23-CONTRACT1`：Mountain King 分支边界合同。
- `HERO22-AI7`：Mass Teleport AI runtime 重新打开合同或实现切片。
- `HERO24-CONTRACT1`：Blood Mage 分支边界合同。
- `V9-HN8`：Spell Breaker / Sanctum 高阶法师线合同。
- `V9-HN9`：Siege Engine / Workshop T3 工程线合同。
- `V9-HN10`：Gryphon Aviary / 空军系统合同。
- `V9-ITEM1`：Arcane Vault / 物品商店合同。
- `V9-AI-MID1`：AI Castle / Knight / 中期编队合同。

如果没有新的用户反馈，默认先做 `V9-HUMAN-GAP-REFRESH` 本身，再由刷新结果选择下一张 GLM 任务；不得直接越级派发 Blood Mage、物品、商店、空军、战役、多人或发布线。

## 5. 必须拒收的内容

- 继续把 Paladin 或 Archmage 写成完全缺失。
- 把 Archmage AI Mass Teleport 策略合同写成自动 runtime 已实现。
- 把当前 proxy 视觉写成最终素材。
- 把完整 Human、完整英雄系统、完整 AI 或 V9 发布写成已完成。
- 一次性把所有候选都放进 live queue。
- 未评分就选择下一条任务。
- 直接改生产代码、素材或 runtime 测试。

## 6. 建议验证命令

这是文档刷新任务，默认不启动浏览器：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-human-gap-refresh-acceptance-checklist.spec.mjs
./scripts/cleanup-local-runtime.sh
```

如果后续实际刷新了 Human gap inventory，应新增或更新对应静态 proof，再把该 proof 加入复验命令。

## 7. 通过后的下一步

通过后只允许生成一张下一任务卡：

- 如果评分最高是继续英雄：生成 `HERO23-CONTRACT1`，且只能做 Mountain King 分支合同。
- 如果评分最高是补 Archmage AI 完整性：生成 `HERO22-AI7`，且必须先定义 Mass Teleport AI runtime 合同或最小实现边界。
- 如果评分最高是补 Human 非英雄核心：生成对应 HN 分支合同。

无论选择哪条，都必须保持：

- 一个 GLM live task。
- 一个 Codex watch / review task。
- 不重复派发已经 accepted 的任务。
- 不把候选池当 live queue。
