# 二级壳层 Surface 验收 Brief

> 用途：定义 settings、help/controls、loading/briefing 在当前 `V2 credible page-product vertical slice` 中怎样才算真实，而不是只有容器、按钮或占位文案。

## 0. 当前口径

本文对应 `C77`。

这里的二级壳层 surface 指：

- `settings`
- `help / controls`
- `loading / briefing`

它们不是 V2 的主要完成证明；V2 的主证明仍然是 front door、真实开始路径、pause/results/reload/return 等会话事实。

但如果这些二级 surface 出现在产品中，就必须诚实：

```text
能说明当前状态；
能连接真实会话或真实信息；
不能把 dormant placeholder 写成 page product acceptance。
```

## 1. Settings 必须证明什么

Settings 只有同时满足下面条件，才算 truthful settings surface。

| Gate | 必须证明 | 不通过时 |
| --- | --- | --- |
| `SET0` 入口真实 | 从 front door、pause 或 session shell 的明确入口进入。 | 只能叫 dormant container。 |
| `SET1` 返回路径真实 | 返回后回到进入前的上下文：menu、pause、setup 或 playing seam，不丢 source。 | 不算可接受 settings。 |
| `SET2` 设置项真实 | 每个可操作项要么真的影响 runtime/UI，要么明确标注只读/未开放。 | 禁用、隐藏或移除。 |
| `SET3` 状态稳定 | apply、cancel、reset、back 的结果可预测，不污染 pause/results/reload。 | 退回实现。 |
| `SET4` 文案诚实 | 不暗示完整图形、音频、热键、可访问性、存档或账户设置已经存在。 | 改文案或删除入口。 |
| `SET5` 回归可证明 | 至少证明进入、返回、禁用项不触发假行为，已实现项状态不丢。 | 只能作为 planned。 |

`V2` 可接受的最小 settings：

```text
一个可进入、可返回的设置页；
只有真实可调项 enabled；
其他项 disabled 或 absent；
不把静态面板写成完整设置系统。
```

## 2. Help / Controls 必须证明什么

Help / controls 只有说明当前真实控制和当前未实现边界，才算 truthful。

| Gate | 必须证明 | 不通过时 |
| --- | --- | --- |
| `HELP0` 内容对应当前实现 | 鼠标选择、移动、采集、建造、攻击、暂停、重载等说明必须和当前实现一致。 | 退回 Codex truth review。 |
| `HELP1` 未实现边界明确 | 没有实现的热键、队列、编队、英雄、法术、完整 race tech 不能写成可用。 | 删除或标注未开放。 |
| `HELP2` 入口和返回真实 | 从 menu/pause/settings 进入后能回到原上下文。 | 只能叫静态说明草稿。 |
| `HELP3` 文案可执行 | 玩家读完能知道下一步怎么开始或继续，而不是泛泛介绍 RTS。 | 退回文案。 |
| `HELP4` 错误不扩散 | 帮助内容不能复制 War3 官方完整快捷键或不存在命令。 | 直接拒绝。 |
| `HELP5` 回归可证明 | 入口、返回、焦点、滚动或折叠不会破坏 session shell。 | 退回 GLM-safe 实现。 |

`V2` 可接受的最小 help/controls：

```text
一页当前控制说明；
明确哪些能力已实现、哪些没有；
从前门或 pause 可进可回；
不伪装成完整教程或完整 War3 manual。
```

## 3. Loading / Briefing 必须证明什么

Loading / briefing 是从菜单世界进入对局世界的过渡，不是战役剧情承诺。

| Gate | 必须证明 | 不通过时 |
| --- | --- | --- |
| `BRF0` 来源真实 | 显示的 map/source 必须和即将进入的 runtime source 一致。 | 不能显示地图名或只显示 generic loading。 |
| `BRF1` 目标真实 | 目标说明必须来自当前可玩 slice，例如采集、建造、击败当前 AI，而不是假任务链。 | 改成当前目标或移除。 |
| `BRF2` 控制提示真实 | 提示必须和当前 help/controls 一致。 | 退回。 |
| `BRF3` 进入路径真实 | loading / briefing 之后进入同一 source 的 playing state，不偷偷换图或重置 source truth。 | 退回实现。 |
| `BRF4` 失败可恢复 | source 缺失、加载失败或取消时有返回或错误说明。 | 不算 truthful briefing。 |
| `BRF5` 不暗示战役 | 不出现章节、剧情、任务奖励、英雄出场、官方 campaign 文案。 | 拒绝。 |
| `BRF6` 回归可证明 | 进入、完成、失败、返回路径至少有 focused proof。 | 只能叫 planned transition。 |

`V2` 可接受的最小 loading/briefing：

```text
一个短过渡 surface；
显示当前 source、当前目标和当前控制提示；
能进入真实对局或返回前门；
不承诺 campaign、完整任务或正式 onboarding。
```

## 4. Dormant placeholder 不算 acceptance

下面情况只能写成 dormant / planned / placeholder，不能写成二级壳层已通过。

| Surface | 不算 acceptance 的情况 |
| --- | --- |
| `settings` | 只有齿轮按钮、空面板、假 slider、无效 checkbox、没有返回路径、设置改变后没有效果也没有 disabled 说明。 |
| `help / controls` | 只有“coming soon”、泛 RTS 说明、官方 War3 热键表、与当前实现不一致的控制说明、不能返回原上下文。 |
| `loading / briefing` | 只有 spinner、固定背景图、假地图名、假任务、没有 source truth、没有失败恢复、直接 sleep 后进局。 |
| `shared` | 只有 DOM 容器、路由占位、按钮可见、GLM closeout green，但没有真实信息和状态证明。 |

Dormant placeholder 可以保留在代码或计划里，但必须这样描述：

```text
surface exists / placeholder exists / planned；
not accepted as truthful settings/help/briefing。
```

## 5. GLM-safe slices

GLM 可以在 Codex 给出边界后做这些窄实现。

| Slice | GLM 可以做什么 | 必须带什么证明 |
| --- | --- | --- |
| `settings-shell-entry` | 接入口、返回、disabled 状态、已存在偏好项的机械 wiring。 | 进入/返回/disabled no-op/focus regression。 |
| `help-controls-copy-surface` | 按 Codex 给定文案接帮助页、折叠区、返回路径。 | 文案不变、入口/返回/滚动/焦点 regression。 |
| `briefing-transition-proxy` | 接最小 loading/briefing proxy，显示 source、目标、控制提示，完成后进入同一 source。 | source truth、进入、失败返回 regression。 |
| `secondary-shell-fallback` | 缺素材或缺图时使用 CSS/token/text fallback。 | deterministic fallback proof。 |

GLM-safe 的前提：

- 文案、能力边界、enabled/disabled/absent 已由 Codex 决定。
- 不触碰 gameplay、AI、经济、路径、胜负规则。
- 不新增远期承诺。

## 6. Codex-only truth work

下面内容不能丢给 GLM 代判。

| 事项 | Codex 为什么必须 owning |
| --- | --- |
| 哪些设置项可以出现 | 这决定产品承诺和用户预期，不是机械接线。 |
| help/controls 的真实控制清单 | 必须和当前 gameplay truth 对齐，不能复制理想 War3 手册。 |
| briefing 目标文案 | 这会影响玩家认为当前 slice 在证明什么。 |
| disabled vs absent | 会影响公开观感和 V2/V3 边界。 |
| acceptance wording | 不能把结构存在写成产品通过。 |
| 用户反馈转任务 | 需要把“看不懂、误导、不够像产品”拆成可执行后续。 |

## 7. 当前 scope 外的用户判断

这些判断不由本 brief 直接关闭。

| 判断 | 为什么仍需用户或 tester |
| --- | --- |
| 设置项是否足够有用 | 自动化只能证明能进能回，不能证明设置集合合适。 |
| help/controls 是否真的降低第一次进入成本 | 需要人读、试、反馈。 |
| briefing 是否让玩家愿意开始一局 | 需要产品语气和理解判断。 |
| 二级 surface 的视觉可信度 | 需要人眼判断，不由 DOM 或 regression 证明。 |
| 是否适合公开分享 | 需要结合 README、release brief、已知问题和用户 gate。 |

自动化和 GLM closeout 只能证明：

```text
surface wiring 不坏；
文案按给定内容出现；
返回和 fallback 可重复；
不能证明玩家已经接受这些 secondary surfaces。
```

## 8. 接受 / 延期 / 打回

| 结论 | 条件 |
| --- | --- |
| `accept-secondary-surface` | 入口、返回、真实内容、disabled/absent 边界和 focused regression 都齐。 |
| `defer-as-dormant` | 容器或入口存在，但内容、返回、效果或证明不完整。 |
| `reject-as-fake-product` | 把空设置、假帮助、假 briefing、不可用功能或远期承诺写成产品完成。 |
| `needs-user-judgment` | 结构真实，但是否清楚、可用、不误导仍需人读或试玩。 |

## 9. 当前 PS4 曝光审计

审计时间：`2026-04-13`。

Conclusion: `accept-secondary-surface / visible-pass / user-open`。

当前可见二级 surface：

| Surface | 当前可见入口 | 工程结论 | 证据路径 | 不证明什么 |
| --- | --- | --- | --- | --- |
| `help / controls` | `menu-help-button` -> `help-shell`；`help-close-button` 或 `Escape` 返回 menu。 | 接受为 V2 最小 truthful help：内容只列当前控制入口，能进能回，不复制完整 War3 手册。 | `tests/help-shell-entry-contract.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`、`tests/shell-backstack-truth-contract.spec.ts`、`tests/menu-shell-escape-back-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。 | 不证明完整教程、完整热键手册、onboarding 已足够好懂，也不证明 pause 内 help 入口已经暴露。 |
| `settings` | `menu-settings-button` -> `settings-shell`；`settings-close-button` 返回 menu。 | 接受为 V2 truthful no-options surface：明确写“当前版本无额外可配置项”，没有假 slider、假 checkbox 或 unsupported 设置。 | `tests/settings-shell-truth-contract.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。 | 不证明设置系统完成，也不证明音频、图形、热键、可访问性、存档或账号设置存在。 |
| `briefing / loading proxy` | `menu-start-button` -> `briefing-shell`；`briefing-start-button` 进入 gameplay；`Escape` 返回 menu。 | 接受为 V2 最小 truthful briefing：显示当前 map/source、mode 和控制提示，显式继续后进入同一 runtime path，不暗示战役剧情。 | `tests/pre-match-briefing-truth-contract.spec.ts`、`tests/briefing-source-truth-contract.spec.ts`、`tests/briefing-continue-start-contract.spec.ts`、`tests/menu-shell-start-current-map-contract.spec.ts`、`tests/shell-backstack-truth-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。 | 不证明完整 loading、完整失败恢复、完整任务说明、正式 onboarding 或 campaign briefing。 |

当前未暴露 / 不计入 PS4 的内容：

- pause 内 settings/help 入口；如后续可见，需要新增 `secondary-shell-pause-origin-return-contract` 或等价 proof。
- 真实可调设置项；如后续出现，需要 `settings-implemented-option-effect-contract` 或等价 proof。
- briefing 的 source-failure / cancel UI；如后续可见，需要 `briefing-source-failure-return-contract` 或等价 proof。
- 完整 tutorial、完整 controls remapping、完整 loading progress、战役 briefing、任务奖励或正式 onboarding。

Fake product claim found: `no` for the current visible minimal surfaces. Settings 当前是诚实 no-options note；help 是当前控制说明；briefing 是 source-truth transition proxy。

Remaining user judgment:

- help/controls 是否真的降低第一次进入成本。
- settings 仅显示 no-options 是否比隐藏入口更合适。
- briefing 的语气、长度、信息量是否足以让玩家愿意开始一局。

## 10. 当前结论

Settings、help/controls、loading/briefing 可以作为 V2 page-product slice 的辅助证据，但不能替代 front door、真实开始路径、pause/results 和 return/reload 事实。

```text
二级壳层通过 = 真实信息 + 真实返回 + 真实边界 + 可重复回归；
不是容器存在，也不是按钮能点。
```
