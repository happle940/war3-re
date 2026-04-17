# V3 Briefing Explanation Acceptance

> 用途：记录 `V3.1 battlefield + product-shell clarity` 中 `V3-PS3` 的开局解释层验收与收口复核。  
> 这份文档只处理 `V3-PS3`：start path 的 truthful explanation layer。它不关闭 `V3-PS1` 入口焦点、`V3-PS2` return/re-entry、`V3-PS4` menu quality 或 `V3-PS5` help/settings usefulness。

## 0. 当前口径

`V3-PS3` 要回答的是：

```text
玩家从 start path 进入 gameplay 前，是否能看到一个真实说明当前 source、mode、controls 或目标的解释层，并且这个解释层不伪装成完整 campaign、ladder 或完整模式池。
```

它不回答：

- 当前可玩入口是否是 primary action；那是 `V3-PS1`。
- 返回 menu 后再次 start 是否干净；那是 `V3-PS2`。
- 主菜单是否有 War3-referenced quality；那是 `V3-PS4`。
- help/settings/results 是否整体有用；那是 `V3-PS5`。

## 1. Truthful Explanation 与 Fake Framing

| 文案类型 | 可接受吗 | 规则 |
| --- | --- | --- |
| 当前 source | 可接受 | 可以说明当前来自内置单图、当前 slice、当前测试地图或当前 build。 |
| 当前 mode | 可接受 | 可以说明是当前可玩 skirmish-like slice、single-map slice、training-like slice。 |
| 当前 controls | 可接受 | 可以说明选择、移动、建造、采集、攻击等当前已实现控制。 |
| 当前目标 | 可接受 | 可以说明本局目标、可尝试动作或当前 alpha 目标。 |
| 限制说明 | 可接受 | 可以明确写 campaign / ladder / multiplayer / full mode pool 尚未实现或不在当前 slice。 |
| campaign chapter | 拒绝 | 不能把当前单图或 slice 包装成战役章节。 |
| ladder / ranked queue | 拒绝 | 不能暗示匹配、排名、赛季、MMR 或天梯存在。 |
| 完整模式池 | 拒绝 | 不能暗示已经有完整 skirmish / campaign / custom / multiplayer pool。 |
| 完整教程 / 任务链 | 拒绝 | 不能暗示已存在完整 tutorial progression 或 mission chain。 |
| 纯氛围句 | 不足 | 可以作为辅助，但不能替代 source / mode / controls / objective 的真实说明。 |

## 2. 通过 V3-PS3 必需证据

| 证据 | 必填内容 | 不可替代项 |
| --- | --- | --- |
| explanation surface proof | start path 中出现的 briefing、loading、start confirmation 或 equivalent explanation layer 截图/DOM proof。 | 只证明 loading screen 存在。 |
| copy truth audit | 逐句列出 source、mode、controls、objective、limits，并确认没有 fake campaign/ladder/full mode claim。 | 氛围文案、logo、背景图。 |
| route placement proof | 说明 explanation layer 在 start path 的哪个 seam 出现，且玩家进入 gameplay 前可见。 | 进入游戏后的 HUD 提示或 help 页面。 |
| focused proof | 真实命令、结果、覆盖的 route / copy / state。 | “菜单看起来有说明”。 |
| next-owner boundary | 明确若缺实现由 GLM 做 bounded seam；若缺产品判断由 Codex/user 处理。 | 泛化“继续优化 shell”。 |

## 3. 2026-04-14 收口复核

Gate: `V3-PS3`

State before: `blocked-by-evidence-gap`

### 当前可用证据

| 证据 | 当前状态 | 结论 |
| --- | --- | --- |
| V2 secondary surface truth | V2 只允许最小 truthful briefing/usefulness debt 后移。 | 可作为输入；不能单独关闭 V3-PS3。 |
| explanation surface screenshot / DOM proof | GLM closeout 记录 `pre-match-briefing-truth-contract.spec.ts`、`briefing-source-truth-contract.spec.ts`、`briefing-continue-start-contract.spec.ts` 合计 9/9 通过。 | `pass-by-focused-DOM-proof` |
| source / mode / controls / objective copy audit | `pre-match-briefing-truth-contract.spec.ts` 3/3 证明 source label 为“程序化地图”、mode 为“沙盒模式”、controls 文案真实。 | `pass` |
| fake framing audit | `briefing-source-truth-contract.spec.ts` 3/3 证明 briefing shell 使用正确 map source、真实 mode label，并且没有 fake labels。当前 proof 不接受 campaign、ladder、完整 skirmish setup、完整教程或完整模式池 framing。 | `pass` |
| route placement proof | `briefing-continue-start-contract.spec.ts` 3/3 证明 briefing start button 进入 play phase、隐藏 briefing shell、生成 units。 | `pass` |
| focused proof command result | GLM closeout 记录 `npm run build` clean、`npx tsc --noEmit -p tsconfig.app.json` clean、三条 focused specs 9/9 pass。 | `pass` |

### Closeout verdict

```text
engineering-pass
```

理由：

- start path 的 explanation layer 已有 focused DOM / route proof，不再是未登记 surface。
- source、mode、controls 的当前文案由 focused specs 证明为真实；没有把当前 slice 包装成 campaign、ladder、完整 skirmish setup、完整教程或完整模式池。
- briefing start seam 已证明会进入当前 gameplay、隐藏 briefing shell 并生成 units。
- `engineering-pass` 只关闭 `V3-PS3` 的 truthful explanation 工程 proof；不代表用户已认可解释层是否足够好用。
- 不能用这次 PS3 proof 关闭 menu quality、help/settings usefulness、return/re-entry 或 front-door hierarchy。

## 4. 后续 bounded seam

若后续用户或指定 reviewer 认为解释层仍不够降低理解成本，后续任务应是一个 bounded copy / placement tuning seam，而不是泛化 shell 重构：

- 保留当前 start path 中 gameplay 前的 briefing / explanation seam。
- 文案继续覆盖 source、mode、controls、objective 中至少一类；推荐覆盖两类以上。
- 文案必须明确当前 slice 边界，不假装 campaign、ladder、multiplayer、full mode pool、完整教程或任务链。
- 若改 copy 或 route placement，继续记录 DOM proof 或截图 proof，并 rerun 三条 PS3 focused specs。

允许 GLM 做：

- 改写 explanation copy。
- 增加 route proof 或 focused regression。
- 删除或改写 fake framing。

不允许 GLM 做：

- 实现 campaign、ladder、multiplayer 或 full mode pool。
- 重做主菜单 hierarchy；那是 `V3-PS1` / `V3-PS4`。
- 实现 return-to-menu / re-entry；那是 `V3-PS2`。
- 把 help/settings usefulness 当成 explanation layer closeout；那是 `V3-PS5`。

## 5. Review 记录模板

```text
Gate: V3-PS3
Build / commit:

Explanation surface:
- route seam:
- screenshot / DOM proof:
- visible before gameplay:

Copy truth audit:
- source:
- mode:
- controls:
- objective:
- limits:

Fake framing audit:
- campaign:
- ladder / ranked:
- multiplayer:
- full mode pool:
- tutorial / mission chain:

Focused proof:
- Command:
- Result:
- Covered route / copy:
- Known gaps:

Verdict:
Next owner:
Next route:
```

## 6. 本文档完成边界

本文档完成只表示：

```text
V3-PS3 当前 closeout 复核已经落成 engineering-pass，并给出后续 copy / placement tuning 的最小边界。
```

它不表示：

- 用户已确认解释层足够降低理解成本。
- menu quality、return/re-entry 或 help/settings usefulness 已通过。
