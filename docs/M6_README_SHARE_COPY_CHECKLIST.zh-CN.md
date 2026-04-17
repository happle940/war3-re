# M6 README / Share Copy Checklist：分享文案检查表

> 用途：在私测或公开分享链接发出前，检查 README / 分享页 / 邀请文案是否把 alpha 预期说清楚。本文只检查文案，不批准任何外部分享。

## 1. 第一屏必须说清什么

第一屏 copy 不应先宣传愿景，应先设定测试语境：

| 检查项 | Yes / No |
| --- | --- |
| 明确这是 Warcraft-like RTS 的 `gameplay alpha`。 |  |
| 明确当前不是完整发行版、不是公开 demo、不是最终视觉版本。 |  |
| 明确这次要验证基础操控、经济、生产、AI 压力和可读性。 |  |
| 明确建议试玩时长是短局或 5-10 分钟，而不是完整内容评测。 |  |
| 明确视觉仍可能是 proxy / fallback，不代表最终资产品质。 |  |
| 明确在用户批准前，当前链接不应被转发或包装成正式 demo。 |  |

合格第一屏应让 tester 立刻知道：这不是“来看成品”，而是“按边界帮忙验证 alpha 可玩路径”。

## 2. Alpha 范围和非目标

README / 分享文案必须列出当前范围：

- 开局是否看得懂。
- worker 是否能采集。
- Town Hall / Barracks 是否能生产。
- AI 是否不是静止摆设。
- HUD / 控制是否误导。
- 短局是否能形成基本压力或卡点判断。

同时必须列出非目标：

- 不评价最终美术质量。
- 不要求完整阵营、完整科技树、完整战役。
- 不要求完整 onboarding 或发行级包装。
- 不把 proxy / fallback 视觉当成最终资产承诺。
- 不把当前版本称为 public demo、release ready 或完整 Warcraft-like 游戏。
- 不把私测许可等同于公开分享许可。

## 3. 必须提到的控制和测试路径

文案至少要说明这些基本操作：

- 左键选择单位或建筑。
- 左键拖框选择多个单位。
- 右键地面移动。
- 右键金矿让 worker 采集。
- 选择 Town Hall / Barracks 后训练 worker 或 footman。
- 必要时说明 `A` attack-move、`S` stop、`H` hold、`Esc` 取消模式。

建议测试路径必须短而具体：

1. 打开链接，确认无白屏、无启动崩溃。
2. 看默认镜头，确认 Town Hall、worker、金矿、树线和 HUD 可读。
3. 选中 worker，右键地面移动，再右键金矿采集。
4. 选中 Town Hall 或 Barracks，训练一个 worker 或 footman。
5. 观察资源扣除、单位出生和 HUD 状态。
6. 继续 5-10 分钟，观察 AI 是否采集、出兵或形成压力。
7. 遇到赢、输、卡住或明显阻塞时，记录原因和复现步骤。

## 4. 必须存在的链接和边界

发链接前，README / 分享页 / 邀请文案至少要提供：

| 链接或说明 | 私测 | 公开分享 |
| --- | --- | --- |
| 试玩链接或目标版本链接 | 必须 | 必须 |
| 已知问题入口 | 必须 | 必须 |
| 反馈提交路径或反馈模板 | 必须 | 必须 |
| 私测邀请说明或测试范围说明 | 必须 | 可替换为公开分享页 |
| 分享边界：不可转发 / 可转发范围 | 必须 | 必须 |
| 当前不是最终视觉 / 完整内容版的说明 | 必须 | 必须 |
| release red lines 或停止报告条件 | 建议 | 必须 |
| 用户已批准公开分享的状态 | 不适用 | 必须 |

推荐链接目标：

- [Known Issues](./KNOWN_ISSUES.zh-CN.md)
- [M6 Private Playtest Invite Template](./M6_PRIVATE_PLAYTEST_INVITE_TEMPLATE.zh-CN.md)
- [M6 Public Share Checklist](./M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md)
- [M6 Release Red Lines](./M6_RELEASE_RED_LINES.zh-CN.md)

## 5. 常见过度表述错误

下面措辞应避免，除非用户已经明确批准对应状态：

| 错误措辞 | 为什么危险 | 更安全的说法 |
| --- | --- | --- |
| “公开 demo 已上线” | 会让 tester 用成品标准评价。 | “gameplay alpha，可按指定路径试玩。” |
| “Warcraft-like demo” | 暗示内容、视觉和 polish 已接近 demo。 | “Warcraft-like RTS gameplay alpha。” |
| “可以公开试玩 / 欢迎转发” | 越过用户 release 判断。 | “仅限少量私测，请勿转发。” |
| “核心体验已经完成” | 把客观合同和人工判断混在一起。 | “核心路径已有验证，仍需人工判断。” |
| “最终美术之后再换” | 容易让 proxy 被理解成低质量最终承诺。 | “当前视觉为 proxy / fallback，只用于可读性验证。” |
| “胜负系统已完成” | 如果胜负表达仍偏原型，会污染反馈。 | “请记录你是否能理解赢、输或卡住的原因。” |
| “适合所有人试玩” | 当前仍需要上下文和反馈边界。 | “适合能接受 alpha 范围的少量 tester。” |
| “release ready” | 直接宣称 M6 批准。 | “release 判断输入仍在准备 / 待用户确认。” |

## 6. 发出前最终检查

只选一个结论：

```text
README/share copy: 可用于私测 / 可用于公开分享 / 不可发出
```

判 `可用于私测` 前至少满足：

- 第一屏说明 alpha 范围。
- 有短测试路径。
- 有 known issues 和反馈路径。
- 有不可转发或受控分享边界。
- 没有把当前版本包装成公开 demo。

判 `可用于公开分享` 前还必须满足：

- [M6 Public Share Checklist](./M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md) 可判 `YES`。
- 用户明确批准公开分享。
- 文案让陌生人不读聊天记录也能理解范围、操作、已知问题和反馈边界。

否则结论写：

```text
README/share copy: 不可发出
原因：
下一步：
```
