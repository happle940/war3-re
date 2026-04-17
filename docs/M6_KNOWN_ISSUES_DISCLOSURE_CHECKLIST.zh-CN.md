# M6 Known Issues Disclosure Checklist

> 用途：审计 `KNOWN_ISSUES.zh-CN.md` 是否足够支撑少量私测或公开分享候选。本文不批准 release，也不要求把 Known Issues 写成宣传页。

## 1. Private Playtest 前必须披露什么

任何少量私测前，Known Issues 至少要让 tester 知道：

| 披露项 | Yes / No | 证据 / 位置 |
| --- | --- | --- |
| 当前是 `gameplay alpha`，不是公开发行版或完整 demo。 |  |  |
| 线上版本适合 milestone 回看 / 定向试玩，不适合无上下文扩散。 |  |  |
| 视觉仍可能是 proxy / fallback，不代表最终资产品质。 |  |  |
| `M3` 空间 / 镜头 / 视觉方向仍待用户判断。 |  |  |
| `M4` 人机 alpha 质量仍待短局人工判断。 |  |  |
| `M5` 内容范围和视觉身份仍未最终决定。 |  |  |
| 胜负闭环已有表达，但重开、赛后统计、发行级包装仍是债。 |  |  |
| 当前私测应反馈打开、可读性、控制、训练、AI 活动和阻断项。 |  |  |
| 最终美术、完整内容、长期平衡、公开传播价值不是当前主要反馈目标。 |  |  |
| 已被 runtime 合同覆盖的问题不要重复当作当前 issue 报告。 |  |  |

如果 Known Issues 没有刷新到目标候选版本，private playtest gate 默认应为 `NO`。

## 2. Public Share 前还要追加什么

公开分享比私测更严格。Known Issues 还必须能让陌生 tester 不读聊天记录也理解范围：

- 当前版本不是完整 Warcraft-like demo。
- 公开入口里的 Known Issues 链接清晰可见。
- 会影响第一印象的限制写在前面，不藏在长文末尾。
- proxy / fallback 视觉不会被误解为最终资产承诺。
- M3/M4/M5 未决点不会被文案包装成已确认。
- 哪些已知债可以接受，哪些仍阻止公开分享，要分开写。
- 如果某个 issue 已被当前候选版本证据关闭，应写明证据来源；否则不要删。
- 公开 tester 应反馈什么、不应反馈什么，要能独立理解。
- 用户未批准公开前，Known Issues 不能暗示 “public-ready”。

公开候选的 Known Issues 应回答：

```text
陌生 tester 打开链接前，是否能理解这是 alpha、怎么试、哪些限制已知、哪些反馈有用？
```

答案不是明确 `Yes`，就不要 promotion 到 public share。

## 3. Known Issues vs Queue Docs vs Invite Copy

| 内容类型 | 应放哪里 | 不应放哪里 |
| --- | --- | --- |
| 当前真实存在、会影响体验理解或反馈质量的限制 | `KNOWN_ISSUES.zh-CN.md` | queue docs |
| 任务状态、owner、允许文件、验证命令、closeout 结果 | queue docs | Known Issues |
| 给 tester 的短上下文、试玩步骤、反馈方式、禁止转发边界 | invite copy / session log | Known Issues 作为唯一入口 |
| 未来愿望、路线图、想做但还没做的内容 | product direction docs / roadmap | Known Issues |
| 已被当前候选证据关闭的问题 | Known Issues 的“已覆盖说明”或移除，需保留证据 | 不带证据直接删除 |
| 私测中发现的新阻断项 | Known Issues + triage/session record | 只留在聊天记录 |
| 公开分享 approval | release decision / user approval record | Known Issues |

Known Issues 不是队列，不记录“谁去做”；Known Issues 是外部/私测理解边界，记录“当前 tester 需要知道什么”。

## 4. 太强或误导的 wording

### 禁止写

- “M6 已通过。”
- “release ready。”
- “公开 demo 已准备好。”
- “适合所有人试玩。”
- “完整 Warcraft-like demo。”
- “Known Issues 已解决”，但没有当前候选证据。
- “当前只有小问题”，但仍有 M3/M4/M5/M6 未决点。
- “视觉只是暂时的，最终会更好”，但没有明确当前反馈边界。
- “私测通过，所以可以公开。”

### 允许写

- “当前版本仍是 gameplay alpha。”
- “候选版本适合定向试玩 / 少量知情私测，是否公开仍需单独判断。”
- “以下限制会影响外部 tester 理解。”
- “以下事项已由 runtime 合同覆盖，不应重复报告为当前 issue。”
- “以下问题仍需用户判断，不是工程未完成的同义词。”
- “公开分享仍需 public checklist 和用户明确 approval。”

措辞原则：准确说明风险，不把限制写成营销话术，也不把未来愿望写成当前事实。

## 5. 如何连接 Smoke Evidence 和私测反馈

Known Issues 更新时要能追溯到证据来源：

| 来源 | Known Issues 应怎么处理 |
| --- | --- |
| Candidate smoke pass | 可把对应 red line 从“当前 issue”转为“已覆盖说明”，但要指向候选版本证据。 |
| Candidate smoke fail / incomplete | 写入当前限制，说明影响 private / public 的级别。 |
| Private playtest P0/P1 feedback | 写入当前 issue 或 release red line；不要只留在反馈表。 |
| Private playtest P2 engineering contract | 写成可复现工程限制，并链接到后续 regression/contract owner。 |
| P3 acceptable debt | 可以披露为已知债，说明不阻断少量私测但可能阻断公开。 |
| P4 user judgment | 写成“仍需用户判断”，不要写成工程 bug。 |
| 已覆盖/重复反馈 | 放到“不应再重复报告”的说明中，前提是当前候选证据仍成立。 |

推荐字段：

```text
证据来源：
候选版本：
影响级别：阻断任何外部分享 / 阻断公开 / 可私测披露 / 仅记录债务
下一步：
```

## 6. One Candidate Audit Block

```text
Candidate Known Issues Audit

候选记录 ID：
候选 commit / 链接：
审计日期：
审计人：

Private playtest disclosure:
- gameplay alpha 范围已写清：Yes / No
- proxy / fallback 视觉已写清：Yes / No
- M3/M4/M5/M6 未决点已写清：Yes / No
- 胜负/重开/赛后体验债已写清：Yes / No
- 有用反馈与无效反馈边界已写清：Yes / No
- 已覆盖问题不会被重复报告：Yes / No

Public share disclosure:
- 陌生 tester 不读聊天也能理解当前范围：Yes / No
- README / share copy 能链接到 Known Issues：Yes / No
- 会误导公开反馈的问题已前置披露：Yes / No
- public wording 没有把 private-ready 写成 public-ready：Yes / No
- 用户 approval 状态没有被 Known Issues 代替：Yes / No

Evidence linkage:
- build/typecheck/smoke 证据已指向目标候选：Yes / No
- 私测反馈 P0/P1/P2 已反映到 Known Issues：Yes / No / Not applicable
- 已关闭 issue 有当前候选证据：Yes / No / Not applicable

结论：
- Known Issues ready for private playtest: YES / NO
- Known Issues ready for public share candidate: YES / NO

阻断项：
下一步：
默认 owner：
```

## 7. 审计结论口径

- `ready for private playtest` 只表示 Known Issues 能支撑少量知情 tester，不表示能公开。
- `ready for public share candidate` 只表示 Known Issues disclosure 足够进入公开候选判断，不表示用户已批准公开。
- 如果 Known Issues 只靠乐观话术降低风险感，结论应为 `NO`。
- 如果 Known Issues 写得很完整但没有候选 smoke / feedback 证据支撑，结论仍应为 `NO` 或 `incomplete`。
