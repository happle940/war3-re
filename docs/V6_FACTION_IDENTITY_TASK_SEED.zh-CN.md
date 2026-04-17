# V6-FA1 阵营与兵种身份任务种子包

> 生成时间：2026-04-15  
> 适用版本：V6 War3 identity alpha  
> 对应 gate：`V6-FA1` Faction or unit identity difference  
> 用途：在 `V6-ID1` 人族集结号令收口后，给双泳道提供下一批相邻任务，避免队列断供、重复派发或扩张到完整人族内容量。

## 0. 当前状态

V6 当前已经完成 `V6-NUM1` 数值底座，`V6-ID1` 人族集结号令已由 Codex 接管复核通过。`V6-FA1` 的第一批最小切片也已通过：`FA-B` Footman / Rifleman 角色差异证明包由 GLM 写出初版，首轮 runtime 失败并卡住后由 Codex 接管修正和本地复核。

这份文档只做一件事：

```text
把“阵营或单位身份差异”拆成能直接派发、能被测试、能停止的最小任务链。
```

它声明 `V6-FA1` 的当前最小工程面已经通过，但不要求扩张完整人族。后续如果要补完整人族 roster、科技树或平衡，只能进入后续版本，不得倒灌成 V6-FA1 当前任务。

## 1. FA1 要证明什么

`V6-FA1` 的关闭标准不是“多一个单位名字”，而是玩家能看到并验证至少一组身份差异：

| 维度 | 通过口径 | 不通过口径 |
| --- | --- | --- |
| 读图差异 | 选择、命令卡、射程/护甲/攻击类型/成本/前置等信息能让玩家区分单位定位。 | 只换名字、颜色、按钮顺序或一句描述。 |
| 能力差异 | 单位在战斗、生产、科技或使用方式上有可测不同。 | 只在数据表里有字段，但 runtime 不使用。 |
| 选择差异 | 玩家或 AI 有理由在 Footman / Rifleman 等单位之间做不同选择。 | 所有单位只是同一战斗模板。 |
| 证据差异 | focused runtime 能在 fresh state 下证明差异来自真实数据和真实行为。 | 单场胜负、截图观感或硬编码断言。 |

## 2. 当前最短切片

第一批 FA1 不做完整人族、不做四族、不做英雄池。当前最短路径是：

```text
Footman 近战前排身份 + Rifleman 远程火力身份 + Long Rifles 科技后差异
```

选择这条切片的原因：

- 两个单位都已经在 V5 / V6 的数值与科技链里出现，避免凭空新增内容。
- `NUM-C` 已有攻击/护甲类型，`NUM-D` 已有 research effect model，`NUM-E` 已有可见数值提示，可以直接复用。
- 这条线能同时证明“读图差异、战斗角色差异、生产选择差异”，足够关闭 FA1 的最小工程面。

## 3. 任务链

| 顺序 | 任务 | 泳道 | 触发条件 | 交付物 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `FA-A` | 当前人族兵种身份盘点 | Codex | 现在即可做，不碰 GLM 正在改的游戏代码。 | 本文件；明确 Footman / Rifleman 最小证明范围、禁止扩张和停止条件。 | `done` |
| `FA-B` | Footman / Rifleman 角色差异 runtime proof | GLM + Codex takeover | `人族集结号令最小证明包 accepted` 后派发；GLM 首轮失败并卡住后由 Codex 接管。 | `tests/v6-footman-rifleman-role-identity-proof.spec.ts`，必要时只做最小实现修复。 | `accepted` |
| `FA-C` | FA-B Codex 本地复核与 gate 更新 | Codex | GLM closeout 或卡住后。 | build、typecheck、FA-B focused runtime、相关 NUM/V5 回归；更新 V6 ledger / remaining gates。 | `done` |
| `FA-D` | War3-like first-look review packet 输入 | Codex | FA1 accepted 后。 | 给 `V6-W3L1` 的 review packet 输入：NUM1 + ID1 + FA1 证据如何一起支撑“更像 War3-like”。 | `done / covered by W3L1 packet` |

## 4. FA-B 最小测试要求

GLM 的 FA-B 任务必须至少覆盖下面四类 proof，不能只写一个“按钮存在”测试。

| Proof | 要验证什么 | 推荐证据形态 |
| --- | --- | --- |
| 数据来源 | Footman / Rifleman 的成本、人口、攻击、护甲、射程、前置来自 `GameData`，不是测试硬编码。 | Playwright runtime 从页面读 DOM，同时 spec 导入 `GameData` 对照。 |
| 生产选择 | Barracks / Blacksmith / Long Rifles 相关路径让 Rifleman 和 Footman 在生产和科技上有不同选择。 | fresh state 中分别验证训练可见性、禁用原因、科技后说明或属性变化。 |
| 战斗角色 | Footman 以近战前排方式接敌，Rifleman 以远程方式输出；Long Rifles 只强化 Rifleman 远程身份。 | 受控 combat state log；检查距离、目标、伤害或攻击发生条件。 |
| 玩家可读 | 选择面板或命令卡能把这些差异展示给玩家。 | 选择单位/建筑后的 HUD 文本与 runtime state 对齐。 |

最低接受线：

```text
同一 fresh runtime 中，玩家能训练或观察到 Footman 与 Rifleman 的定位不同；测试能证明这些差异来自真实数据、真实科技和真实战斗路径。
```

## 5. 禁止扩张

FA1 这批任务不得做：

- 完整人族所有单位。
- 完整四族阵营系统。
- 英雄、物品、法术书扩张；这些属于 ID1 或后续版本。
- 真实素材导入、素材授权判断或外部素材搜索。
- 大规模 balance tuning。
- 主菜单、发布文案或 UI polish。

如果测试发现上述缺口，只能记录为后续债务，不得把它们塞进 FA1 当前实现任务。

## 6. 验收与停止条件

`V6-FA1` 可以在满足以下条件后工程通过：

1. `FA-B` focused runtime 通过，并且 Codex 本地复核通过。
2. 测试不是硬编码当前数字，而是从 `GameData` / runtime state 推导期望。
3. 证据同时覆盖可见差异、使用差异和至少一个真实战斗或科技行为差异。
4. `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md` 记录 FA1 工程证据。
5. `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md` 把 FA1 更新为 `engineering-pass`，且明确没有声明完整人族。

达到这些条件后停止 FA1 当前链条，转向 `V6-W3L1`。不要继续补“再多一个兵种”的任务来拖延 V6 收口。

## 7. Codex 复核清单

GLM 交回 FA-B closeout 后，Codex 不直接接受，按下面顺序复核：

| 步骤 | 检查什么 | 失败时怎么处理 |
| --- | --- | --- |
| 1 | 只改了允许文件，且没有扩张到 AI、素材、主菜单、英雄、物品或完整人族。 | 标记 blocked，要求收窄或由 Codex 接管修正。 |
| 2 | 新 proof 是否从 `GameData` / runtime state 推导期望，而不是硬编码当前数字。 | 退回测试质量问题。 |
| 3 | Footman / Rifleman 是否同时有可见差异和行为差异。 | 回流 FA1，不关闭 W3L1。 |
| 4 | Long Rifles 是否只强化 Rifleman 远程身份，没有顺手调 Footman 或全局战斗公式。 | 回流实现范围问题。 |
| 5 | build、typecheck、FA-B focused runtime 和相关 NUM/V5 回归是否通过。 | 先修失败项，不更新 gate。 |
| 6 | cleanup 后没有 Vite、Playwright、Chromium 残留。 | 先清理运行环境，再记录结果。 |

复核命令：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh \
  tests/v6-footman-rifleman-role-identity-proof.spec.ts \
  tests/v6-visible-numeric-hints-proof.spec.ts \
  tests/v6-research-effect-model-proof.spec.ts \
  tests/v6-attack-armor-type-proof.spec.ts \
  tests/v5-human-long-rifles-tech.spec.ts \
  --reporter=list
./scripts/cleanup-local-runtime.sh
```

复核已经通过，Codex 可以把 `V6-FA1` 改成 `engineering-pass`，并把证据写入 `V6-W3L1` 审查包。

本次复核结果：

- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- `./scripts/run-runtime-tests.sh tests/v6-footman-rifleman-role-identity-proof.spec.ts --reporter=list` 通过，5/5。
- 相关 runtime pack 通过，22/22：`tests/v6-footman-rifleman-role-identity-proof.spec.ts`、`tests/v6-visible-numeric-hints-proof.spec.ts`、`tests/v6-research-effect-model-proof.spec.ts`、`tests/v6-attack-armor-type-proof.spec.ts`、`tests/v5-human-long-rifles-tech.spec.ts`。
- `./scripts/cleanup-local-runtime.sh` 已执行，未留下测试浏览器残留。

## 8. 自动派发规则

| 情况 | 动作 |
| --- | --- |
| GLM 正在跑 `FA-B` | Codex 只做非冲突文档、复核准备和看板更新，不派第二个 GLM 实现任务。 |
| `FA-B` closeout 但未 Codex accepted | Codex 本地复核；不关闭 FA1。 |
| `V6-ID1` rejected / blocked | 先派 ID1 repair；FA-B 暂停。 |
| FA-B 通过并 accepted | 更新 FA1 gate，然后准备 `V6-W3L1` review packet。 |

这条规则的核心是：

```text
下一个任务来自当前 V6 gate 的相邻缺口，不来自无限任务生成。
```

## 9. 当前结论

```text
V6-FA1 的第一批任务已经完成：Footman / Rifleman 角色差异证明。
ID1 已经 accepted，FA-B 已经由 Codex 接管并 accepted。
FA1 工程面已关闭，V6 应进入或完成 W3L1 first-look review packet，而不是继续扩张人族内容量。
```
