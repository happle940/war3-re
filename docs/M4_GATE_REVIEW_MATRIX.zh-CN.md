# M4 Gate Review Matrix：客观证据 vs 人工 Alpha 判断

> 用途：把 `M4` 的自动化证据和用户短局判断分开。本文不代表 `M4` 已人工通过。

## 1. Review Matrix

| 维度 | 当前客观证据 | 仍需用户判断 | 应回工程合同的结果 |
| --- | --- | --- | --- |
| Control | build、typecheck、相关 runtime packs；M4 player-reported issues、command / selection / construction / resource 等合同可证明核心操作不崩 | 战斗中选择、右键、队列、建造、训练、集结、HUD 是否让玩家觉得公平、可控、能防守和反打 | 选中失败、右键不生效、队列丢失、建造中断/取消/续建错误、HUD 状态误导、同一操作不稳定 |
| AI activity | AI economy / first pressure 证据可证明 AI 会采集、建造、训练、发起第一波或推进，不是静止样机 | AI 是否真的像对手；压力是否出现得足够早、足够清楚，而不是只满足测试条件 | AI 不采集、不训练、不出兵、不推进；玩家只能在空地图里操作；AI 行为完全停摆 |
| AI recovery | Task 31 / AI recovery 应证明有限损失后仍能采集、生产、发后续波次，不作弊、不永久 no-op | AI 损失后恢复方式是否低级到污染体验；恢复后的压力是否仍能支撑短局判断 | 第一波后永久卡死；worker/building 损失后经济停摆；资源分配无界；建筑放置无限 spam；坏引用崩溃 |
| Match ending clarity | match-loop / victory-defeat 相关 regression 可证明状态转换、对象清理、关键 HUD 状态不崩 | 用户赢、输、僵持或卡住后，是否能说清原因；结束是否明确，而不是靠猜 | 胜负状态缺失或与实际不一致；死亡/清理/占地/引用导致不可恢复卡死；结束 HUD 明显误导 |
| Feedback quality | HUD、命令卡、选择圈、血条、反馈效果等可由 runtime 检查不缺失、不遮挡硬 blocker | 反馈是否足够帮助玩家理解当前状态、操作结果、AI 压力和失败原因 | 命令卡不可读；HUD 挡住关键对象；选择圈/血条/反馈错位或缺失；错误状态不显示或显示错误 |

## 2. 默认阅读顺序

用户回看 `M4` 时，建议按这个顺序：

1. **Control**：先确认自己能操作，单位是否听指令。
2. **AI activity**：确认 AI 不是静止样机，场上有对手压力。
3. **AI recovery**：观察 AI 第一波后、损失后是否低级坏死。
4. **Match ending clarity**：继续到赢、输、僵持或卡点，看原因是否能说清。
5. **Feedback quality**：最后判断 HUD、命令反馈、选择/血条是否帮助理解，而不是制造误导。

如果前两项失败，通常不用继续争论 Alpha 质量，先回工程合同。

## 3. 结论口径

- 客观证据通过：只能说明“值得拿给用户判断”。
- 用户短局通过：才能说 `M4 Alpha 通过`。
- 可复现失败：回 engineering contract / regression，不作为 taste 争论。
- 需要判断“像不像一局 Alpha、压力是否合理、结束是否能理解”：留给用户。

推荐用户最终只选一个：

- `Alpha 通过`
- `带债通过`
- `失败：控制问题`
- `失败：AI 问题`
- `失败：节奏问题`
- `失败：胜负不清晰`
