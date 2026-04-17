# V6-W3L1 War3-like 第一眼审查包种子

> 生成时间：2026-04-15  
> 适用版本：V6 War3 identity alpha  
> 对应 gate：`V6-W3L1` War3-like identity first-look  
> 用途：在 `V6-ID1` 和 `V6-FA1` 工程证据成立后，把证据合成一份可审查材料包，防止 V6 继续无边界补任务。

## 0. 当前状态

`V6-W3L1` 的工程证据已经补齐，当前只保留异步人眼判断：

| 前置 | 当前状态 | 对 W3L1 的作用 |
| --- | --- | --- |
| `V6-NUM1` | `engineering-pass` | 证明单位、建筑、科技和可见提示不是散落字段。 |
| `V6-ID1` | `engineering-pass` | 已有人族集结号令作为最小身份能力证据。 |
| `V6-FA1` | `engineering-pass` | Footman / Rifleman 角色差异证明包已由 Codex 接管修正并本地复核通过。 |

这份种子现在记录 W3L1 如何收口：不再派新内容实现，只把 NUM1、ID1、FA1 的真实证据合成审查包。

## 1. W3L1 要回答什么

W3L1 不是问“是不是已经复刻 War3”，而是问：

```text
当前 V6 slice 是否已经比纯 RTS 原型更像一个 War3-like 身份 alpha？
```

它必须把三类证据放在同一个审查视角里：

1. 玩家能看见数值和科技信息。
2. 玩家能触发一个有状态、有反馈、有冷却或限制的身份能力。
3. 玩家能看出至少一组兵种定位差异。

缺任何一项，都不能说 V6 identity alpha 工程收口。

## 2. 审查包内容

W3L1 审查包只需要一份短材料，不做宣传页、不做完整报告。

| 模块 | 必须包含 | 不需要包含 |
| --- | --- | --- |
| 当前版本状态 | 当前 commit / branch、V6 gate 状态、已通过的 runtime proof。 | 发布计划、营销文案、完整路线图。 |
| 第一眼路径 | 从开局到选择单位、查看数值、触发身份能力、观察兵种差异的最短步骤。 | 长局、多人、战役、完整教学。 |
| 证据列表 | NUM1 / ID1 / FA1 的 spec 名称、通过结果、证明什么、不证明什么。 | 全量测试日志粘贴。 |
| 人眼判断问题 | 3-5 个给用户或 tester 的判断问题。 | 自动替用户给 pass。 |
| 剩余债务 | 明确哪些还不是完整 War3：英雄池、物品、完整人族、真实素材、平衡、音效等。 | 把债务藏进“后续优化”。 |

## 3. 任务链

| 顺序 | 任务 | 泳道 | 触发条件 | 交付物 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `W3-A` | W3L1 审查包模板 | Codex | 现在可准备，不碰运行时代码。 | 本文件；固定审查包结构、停止条件和输入证据。 | `done` |
| `W3-B` | W3L1 证据合成包 | Codex | `V6-ID1 accepted` 且 `V6-FA1 accepted`。 | `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md`，包含三类证据和人眼问题。 | `engineering-pass` |
| `W3-C` | W3L1 focused smoke / screenshot packet | GLM 或 Codex | W3-B 发现缺同 build 可视证据时。 | 最小截图或 state-log proof；只证明审查路径可复现。 | `conditional` |
| `W3-D` | V6 工程收口复核 | Codex | W3-B/W3-C 通过后。 | 更新 V6 ledger / remaining gates；确认是否可进入下一版本预热。 | `in-progress` |

## 4. 人眼判断问题

W3L1 审查包最后只问这些问题：

1. 第一眼是否能看出这是一个有基地、采集、训练、科技和战斗的 RTS 对局，而不是随机场景？
2. 玩家是否能看懂 Footman / Rifleman 或等价单位的定位差异？
3. 玩家是否能看懂“集结号令”或等价身份能力正在发生、何时不可用、带来什么影响？
4. 数值提示是否足够支撑当前选择，而不是只靠猜？
5. 当前 slice 是否已经进入 “War3-like identity alpha”，还是仍只像一个通用 RTS prototype？

用户或 tester 可以回答 `pass`、`pass-with-debt`、`reject` 或 `defer`。自动化只能准备证据，不能代替这个结论。

## 5. 工程关闭条件

`V6-W3L1` 可以工程通过的最低条件：

1. `V6-NUM1` 已经是 `engineering-pass`。
2. `V6-ID1` 已经是 `engineering-pass` 或 `accepted`。
3. `V6-FA1` 已经是 `engineering-pass` 或 `accepted`。
4. W3L1 审查包存在，并能从同一当前版本解释“数值底座 + 身份能力 + 兵种差异”如何一起被玩家看到。
5. 审查包明确列出不证明的内容，不能写成完整 War3 parity。

达到这些条件后，W3L1 的工程面可以关闭。`V6-UA1` 仍保留为异步人眼 verdict，不阻塞后续工程预热。

## 6. 禁止内容

W3L1 不允许为了“更像 War3”临时扩张：

- 新增完整英雄系统。
- 新增完整物品、背包、商店或掉落。
- 扩到完整人族所有单位。
- 导入真实素材或做素材审批。
- 重写主菜单审美。
- 让自动化替用户做最终审美判断。

如果发现这些缺口，只能写成后续版本债务。

## 7. 自动推进规则

| 情况 | 动作 |
| --- | --- |
| ID1 未 accepted | 不做 W3-B，只复核或修复 ID1。 |
| FA1 未 accepted | 不做 W3-B，只派或复核 FA1。 |
| ID1 / FA1 都 accepted | Codex 生成 W3-B 证据合成包。 |
| W3-B 缺同 build 视觉证据 | 派 W3-C 最小截图或 state-log proof。 |
| W3-B/W3-C 通过 | 更新 W3L1 为工程通过，保留 V6-UA1 异步人眼判断。 |

## 8. 当前结论

```text
W3L1 的收口方式已经固定并完成：不是继续补内容，而是把 NUM1、ID1、FA1 的真实证据合成一份第一眼审查包。
ID1 和 FA1 已 accepted，W3L1 工程面已经进入 oracle / transition 复核。
后续不应继续无限生成 V6 新任务；如果 oracle 显示工程 blocker 清零，应进入 V7 预热或切换。
```
