# V3 First-Look Approval Packet

> 用途：为 `V3.1 battlefield + product-shell clarity` 提供统一 first-look review 包。  
> 本轮更新只落 `V3-PS4` 主菜单质量评审口径；不关闭 `V3-PS1`、`V3-PS2`、`V3-PS3` 或任何 battlefield gate。

## 0. PS4 当前口径

`V3-PS4` 要回答的是：

```text
当前 front door 是否开始像一个产品主菜单，而不只是工程按钮集合。
```

它不回答：

- 当前可玩入口是否 truthful；那是 `V3-PS1`。
- pause / results 返回 menu 和再次开始是否干净；那是 `V3-PS2`。
- start path 是否有 truthful explanation layer；那是 `V3-PS3`。
- 用户是否整体理解所有 visible shell surface；那是 `V3-PS5`。

## 1. PS4 评审维度

| 维度 | 必看问题 | 退回路由 |
| --- | --- | --- |
| hierarchy | 当前 playable entry、次级动作、disabled / absent branch 的层级是否清楚。 | 如果当前入口不真实或被 fake route 同权干扰，退回 `V3-PS1`。 |
| focal entry | 玩家第一眼是否知道主要行动是什么，以及会进入什么当前 slice。 | 如果文案缺 source / mode / start truth，退回 `V3-PS1`。 |
| backdrop mood | 背景和氛围是否服务 War3-like battlefield mood，而不是抽象占位。 | 如果只是素材缺口，退回 `V3-AV1` 或后续 asset packet；如果是主菜单感弱，留在 `V3-PS4`。 |
| action grouping | 开始、继续、设置、帮助、退出等动作是否按产品语义分组。 | 如果 return / re-entry 行为不成立，退回 `V3-PS2`；如果 explanation 缺失，退回 `V3-PS3`。 |

## 2. Hard Rejects

下面这些不能当作 PS4 菜单质量提升：

- `Campaign`、`Ladder`、`Ranked`、`Multiplayer` 或完整模式池以同权入口出现。
- fake `Continue`、`Profile`、`Match History`、`Achievements`、完整战报或天梯徽章。
- 只换背景、只移动按钮、只加氛围文案，但没有更清楚的 hierarchy / focal entry / action grouping。
- 用未批准真实素材或原版提取素材冒充 visual quality。
- 用自动化命令结果替代用户或指定 reviewer 的 menu quality verdict。

## 3. Verdict 规则

| Verdict | 含义 | 后续路由 |
| --- | --- | --- |
| `accept` | hierarchy、focal entry、backdrop mood、action grouping 都足以支撑当前 slice，且 reviewer 明确认可。 | 可把 `V3-PS4` 写成通过；仍不关闭 `V3-PS1`、`V3-PS2`、`V3-PS3` 或 `V3-PS5`。 |
| `pass-with-tuning` | 主菜单质量基本成立，但仍有明确、非阻塞的视觉或文案 tuning。 | tuning 进入 PS4/PS5 后续债务；不得扩成 fake mode。 |
| `user-reject` | reviewer 明确认为仍不像产品主菜单，或第一眼仍是工程占位。 | 留在 `V3-PS4`，派发 bounded menu quality repair。 |
| `defer` | 当前缺截图、层级说明或 reviewer verdict，无法裁决。 | 先补 review packet，不写通过。 |

## 4. Review 记录模板

```text
Gate: V3-PS4
Build / commit:

Review evidence:
- default front-door screenshot:
- annotated hierarchy screenshot:
- visible copy summary:
- action grouping summary:
- asset / backdrop status:

Truth guard:
- campaign:
- ladder / ranked:
- multiplayer:
- full mode pool:
- continue / profile / history:
- fake same-rank route scan:

Verdict:
- hierarchy:
- focal entry:
- backdrop mood:
- action grouping:
- reviewer:
- menu quality verdict:
- notes:

Route back:
- PS1:
- PS2:
- PS3:
- PS4:
- AV1:
```

## 5. 2026-04-14 收口复核

Gate: `V3-PS4`

State before: `open`

当前结论：

```text
review-packet-ready / user-open
```

理由：

- PS4 的 hierarchy、focal entry、backdrop mood、action grouping 评审维度已定义。
- `accept`、`pass-with-tuning`、`user-reject`、`defer` verdict 规则已定义。
- 已明确 fake campaign / ladder / full mode pool / same-rank route 不能当作菜单质量提升。
- 当前还没有用户或指定 reviewer 的 menu quality verdict，因此不能关闭 `V3-PS4`。

最小后续任务：

- 产出当前 front door raw screenshot。
- 产出 annotated hierarchy screenshot。
- 填写 visible copy、action grouping、asset/backdrop status。
- 填写 fake route truth guard。
- 由用户或指定 reviewer 给出 `accept` / `pass-with-tuning` / `user-reject` / `defer`。
