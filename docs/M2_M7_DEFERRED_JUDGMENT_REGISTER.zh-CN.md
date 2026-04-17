# M2-M7 Deferred Judgment Register：待用户裁决登记表

> 用途：集中记录 `M2`-`M7` 仍需用户判断的事项。本文不批准任何里程碑，只防止“待人工判断”散落在 milestone prose 里。

## 使用口径

- 客观证据可以证明“值得判断”，不能代替用户判断“已经通过”。
- 可复现、可写期望行为、可写 regression 的问题，先回工程合同。
- “像不像、够不够、值不值得发、方向怎么选”必须留给用户。
- 用户回来前，Codex/GLM 可以继续准备证据和低风险工作，但不能把准备状态写成正式批准。

## 待裁决总表

| 里程碑 | 客观证据已经能说明什么 | 用户仍必须决定什么 | 不等用户也可以继续什么 | 用户回来前不能声称什么 |
| --- | --- | --- | --- | --- |
| `M2` 核心系统规则感 | build、typecheck、`test:m2`、建造生命周期、静态防御、命令卡反馈、单位体积、战斗控制等 runtime 合同可以证明核心规则没有明显破坏。 | 这些系统组合起来是否有 RTS 规则感；建造恢复/取消、箭塔、命令反馈、体积和战斗控制是否符合直觉；是否 `通过`、`带债通过` 或按子系统 `失败`。 | 继续维护 M2 runtime packs；把可复现的建造、箭塔、命令卡、单位体积、战斗控制问题拆成合同任务；准备短 review 脚本。 | 不能声称 `M2` 已人工通过；不能把自动化全绿等同于“规则感已被用户接受”。 |
| `M3` 空间语法 / 镜头 / 可读性 | scale、base grammar、camera/HUD、visibility 等客观包可以证明默认场景、核心对象、HUD 和反馈具备被人工评审的基础。 | 第一眼是否像 War3-like RTS 战场；基地、金矿、树线、出口、比例、framing、HUD 和 proxy 视觉方向是否可接受；是否 `通过`、`通过但有美术债` 或具体失败。 | 继续维护 M3 regression；把镜头遮挡、对象缺失、反馈错位、加载失败等可复现问题转工程合同；准备短 review script。 | 不能声称 `M3` 已确认空间感成立；不能让 GLM 代替用户判断视觉品味或 War3-like 方向。 |
| `M4` 人机 Alpha 对局 | match-loop、AI recovery、AI economy、player-reported issues 等 regression 可以证明核心操作、AI 存活性、恢复和部分胜负/反馈路径不崩。 | 一局短 Alpha 是否有开始、中期压力、可理解结束或卡点；控制是否公平；AI 是否低级坏死；是否 `Alpha 通过`、`带债通过` 或按控制/AI/节奏/胜负失败。 | 继续跑和维护 M4 客观包；把控制、AI、节奏、胜负表达、HUD 误导等可复现问题拆成合同；准备 playtest script 和 issue routing。 | 不能声称 `M4` 已是一局可接受的人机 Alpha；不能把 AI/胜负测试通过写成用户已认可 alpha 质量。 |
| `M5` 内容与视觉身份方向 | 方向 memo、scorecard 和返回包已准备默认建议：`hybrid + one polished Human slice + polish feel`，并列出 proxy-first、asset-pack-first、content scope 和 next-goal 选项的成本/风险。 | 是否接受默认方向；视觉方向、内容范围、下一产品目标是否改选；是否先打磨一个 Human slice，还是转向 Human vs Orc、systems-first sandbox、asset-pack-first 或 public-demo 目标。 | 继续整理选项、风险、scorecard、决策材料；保持 M2-M4/M6/M7 客观准备；不做会锁死产品方向的实现承诺。 | 不能声称 `M5` 产品方向已正式决定；不能把默认建议写成用户批准的 roadmap。 |
| `M6` 私测 / 公开分享 | release brief、known issues、live smoke path、red lines、私测包和反馈模板可以定义分享等级、证据要求、红线和反馈边界。 | 当前 build 是否允许 `公开分享`、`少量私测` 或 `再等一个里程碑`；外部 tester 是否会被 proxy 视觉、胜负表达、上下文不足或已知问题误导。 | 继续准备 README/分享说明、known issues、smoke path、私测 invite、feedback capture；修复启动、HUD、采集、训练、AI 存活性等不改变产品方向的 red line。 | 不能声称 `M6` 已批准；不能把当前版本包装成公开 demo；不能在用户点头前对外分享。 |
| `M7` 零行为变化硬化 | M7 acceptance brief、review checklist、rejection patterns、contract gap candidates 可以约束 extraction slice 的零行为变化证据、拒收条件和合同缺口。 | 只有当 refactor 影响玩家可见行为、视觉/AI/玩法感知、产品方向或开发节奏时，用户需要决定是否接受、拒绝或转回 milestone gate；否则 Codex 可按工程证据验收。 | 继续做小范围、可回退、已覆盖的 extraction；补 focused regression；review GLM slice；记录 accept/reject/defer 和缺口候选。 | 不能声称任何改变玩家可见行为的 refactor 仍只是 hardening；不能把缺少证据的抽取标成 `M7` 已接受；不能用 refactor 绕过产品判断。 |

## 推荐用户处理顺序

1. 先判 `M2`：核心规则感是否成立。
2. 再看 `M3`：第一眼空间语法和镜头可读性是否成立。
3. 打一局 `M4`：确认短 Alpha 是否有可理解 match loop。
4. 决定 `M5`：是否接受默认方向，或替换视觉/内容/目标选项。
5. 最后看 `M6`：只私测、公开分享，还是再等。
6. `M7` 只在出现用户感知或方向性影响时插入判断；纯等价 hardening 按工程证据走。

## 登记更新规则

- 如果用户给出明确结论，把对应 milestone 从“待用户裁决”改为“用户已裁决”，并保留一句原因。
- 如果新证据只来自测试或文档，不自动关闭用户判断项。
- 如果某个待判断问题被拆成可复现工程缺陷，应另开合同/测试任务；本表只保留仍需人工裁决的部分。
- 如果 Codex/GLM 发现自己需要替用户判断“够不够像、值不值得发、是否方向正确”，应停止该结论并回到本表。
