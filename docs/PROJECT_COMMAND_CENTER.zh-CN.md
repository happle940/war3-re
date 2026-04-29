# War3 RE 项目总控入口

最后更新：2026-04-29

## 一句话判断

这个项目现在不是“双 AI 自动化项目”，而是一个需要稳定推进的浏览器 RTS 游戏项目。旧的双泳道、看板、watch、自动补货系统已经超过收益，正式停止维护。

当前顶层路线以 `PLAN.zh-CN.md` 的 `R0-R15` Roadmap 为准：从功能完整度和用户体验完整度两个视角推进，从打开网页像打开游戏开始，到 Human 短局、War3-like 身份系统、产品壳层和外部试玩逐步补齐。当前 R1-R15 都已有私有 alpha 级 runtime proof，后续重点是深度打磨，不是改回旧流程。

当前每轮复盘以 `War3GapSystem` 为新增顶层信号：R15 诊断反馈包会汇总前门、第一分钟、操控、经济、战斗、Human、英雄、地图/Fog/物品、AI、视觉音频、试玩发布和架构 12 个 War3 差距域。它用于“全面追赶 War3 差距”，不是宣布已经追平。

代码结构重构以 `PLAN.zh-CN.md` 的 `R-ARCH` 横切主线为准：重构必须绑定具体 Roadmap 切片，保持行为不变，用 focused runtime 测试验收，不做一次性大重写。

## 现在保留什么

- 游戏本体：`src/`
- 浏览器入口：`index.html`
- 运行时测试：`tests/*.spec.ts`
- 构建与测试脚本：`scripts/run-runtime-tests.sh`、`scripts/run-runtime-suite.sh`、`scripts/cleanup-local-runtime.sh`
- 关键产品文档：路线图、终局差距、人族能力板、已知问题、回归清单

## 现在砍掉什么

- 本地看板页面和 JSON 生成器。
- Codex / GLM watch 后台会话。
- 双泳道 companion、feed、queue refill、task synthesis。
- 自动版本切换和预热脚本。
- 长队列、长事故日志、runway 和 transition 自动化文档。
- 3G 级别本地日志和 Playwright 历史产物。

## 新执行规则

1. 当前 Codex 会话就是唯一执行者。
2. 一次只处理一个主攻问题。
3. 任务来源从 `PLAN.zh-CN.md` 的 `R0-R15` Roadmap、产品缺口和玩家试玩反馈来，不从自动补货队列来。
4. 行为改动必须跑 `npm run build`、`npm run typecheck:app` 和相关 focused runtime 测试。
5. 结构重构必须映射到 `R-ARCH`，每次只拆一个明确边界；不允许无测试的大范围改写。
6. 结束前清理本地 runtime 残留，避免再次拖慢机器。
7. 文档只写能减少未来判断成本的内容。

## 当前项目理解

已有基础：

- RTS 基础操作和 Human-like 开局已经成立。
- 打开网页前门、第一局开始、第一分钟可读、RTS 操控、经济/生产、战斗底盘、AI、三英雄/能力链路、War3-like 身份、产品壳层、视觉 / 音频 cue 和外部试玩反馈入口都已有当前私有 alpha 运行时闭环。
- R15 反馈包已接入 War3 全局差距雷达，后续每轮结束要按 12 个差距域汇报进展和剩余缺口。
- 有大量 focused runtime 回归，能够保护核心行为。

最大问题：

- 从打开网页到关闭网页的玩家旅程和 R15 试玩反馈入口已经有当前闭环，但还不是公开发布级包装。
- 内容扩张快于系统收敛，导致英雄、单位、科技、数值、UI、音效和模型体验仍需继续统一。
- AI、短局节奏、战场第一眼、产品壳层、War3-like 身份和视觉 / 音频身份都有 proof，但仍不足以宣称完整 War3-like demo。
- `Game.ts` 仍承担过多职责；后续架构必须渐进拆分，不能继续把新系统全部塞回单一控制器。
- 文档和自动化曾经服务推进速度，现在已经反过来消耗上下文和机器资源。

## 当前主攻顺序

第一阶段：`R0` 项目口径统一

- README、Known Issues、Roadmap、Command Center 统一到 Codex-only 和当前真实阶段。
- 清掉旧 V8/V9 runway、队列、GLM、watch 叙述对当前决策的影响。

第二阶段：`R1-R3` 开局体验

- 已完成第一轮 runtime 闭环：打开网页第一屏、第一局开始和第一分钟可读都进入 `FoundationMilestoneSystem`。
- 后续继续补发布级氛围、镜头引导、局前配置深度和第一分钟提示质量。

第三阶段：`R4-R6` RTS 信任底盘

- 已完成第一轮 runtime 闭环：命令入口、经济/建造/生产和战斗底盘都进入 `FoundationMilestoneSystem`。
- 后续继续补更强 cursor 状态、资源/人口/科技不足层级、战斗动画/音效和系统拆分；命令卡当前已具备字母热键执行、禁用原因反馈、程序化 icon 身份、命令状态徽标、冷却/生效 meter、法力缺口 badge 和目标模式高亮基线。

第四阶段：`R7-R10` Human 短局

- 当前已完成第一轮 runtime 闭环并继续深化：Human 路线、T1/T2/T3 节奏阶段、战术角色、混编覆盖、兵种克制读法、科技收益、结果页战斗原因复盘、下一步动作、命令卡路线角色提示、字母热键执行、命令卡 icon 身份、HUD 背包槽、命令状态层级、冷却/生效 meter、法力缺口 badge、目标模式高亮、英雄技能、技能可用/阻断/目标提示、AI 对手和短局胜负可验收。
- 后续继续补真实二本/三本数值曲线、升级平衡、克制调参、发布级图标/冷却充能表现/可配置热键体系、英雄施法表现、AI 侦察/撤退/适应和 10-15 分钟稳定性。

第五阶段：`R11-R15` 战场、身份、壳层、试玩

- R11/R12/R13/R14 已完成第一轮 runtime 闭环：战场目标、Fog/侦察/物品/商店/回城、产品壳层、视觉/音频身份和战场表现快照都有 proof。
- R15 已完成当前 runtime 闭环：试玩信息、已知问题入口、诊断反馈包、暂停/结果反馈入口、关闭保护、性能预算信号、兼容矩阵、错误缓冲、反馈分类、Human 解锁层、战场表现层、War3 全局差距雷达和恢复按钮都有 proof。
- 当前主攻转向 R14/R7/R-ARCH/R15/WAR3-GAP 深度打磨，AI 长局先放低优先级：真实动作/音效素材门禁、Human 混编/克制/科技收益/解锁 icon/cue、命令卡路线/热键/视觉身份一致性、结构拆分、真实浏览器矩阵、性能阈值、反馈运营和全局差距复盘优先；动作 runtime 已支持有 GLB clip 优先播放、无 clip 回退 procedural，R14 当前合同已覆盖 51/51 基础 clips 和 10/10 wav cues，并已补出英雄范围圈、主动目标合法性、复活尸体 marker/范围环、命令卡程序化 icon、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge、目标模式高亮、技能特效爆发和结果页视觉复盘。后续报告重点转向真实数值曲线、动作质量、发布级技能特效、最终图标、真实多充能体系、音频 identity 和最终资产批准。

横切阶段：`R-ARCH` 渐进重构

- R1/R13 做 session shell 时，优先抽 `SessionShellController`。
- R4/R7 做命令反馈和 Human 内容时，抽 command card / HUD presenter。
- R5/R6/R8/R9 做经济、战斗、技能、AI 时，分别抽系统边界。
- R14/R15 做表现和试玩收口时，优先抽 milestone/playtest/表现快照边界；当前 `MilestoneSignalSystem` 已接管 R15 里程碑信号组装，`UnitPresentationSystem` 已接管单位表现状态和 clip/fallback 动作来源，`AudioCueSystem` 已支持 asset-backed cue 优先、失败回退程序音，`BattlefieldPerceptionSystem` 已接管命令、战斗、技能、死亡、建造和音效语义覆盖的玩家感知快照，`PresentationAssetReadinessSystem` 已接管真实动作 clip 与真实音效素材门禁，`HeroAbilityPresentationSystem` 已接管英雄施法距离/范围/光标语义和主动目标合法性快照，`ResurrectionReadabilitySystem` 已接管 Paladin 复活尸体可读快照，`ResultPresentationSystem` 已接管结果页视觉复盘快照。
- 全局追赶复盘由 `War3GapSystem` 接管，`Game.ts` 只收集快照并把结果交给 R15 反馈包。
- 任何重构都必须保持当前玩家行为，不以“架构正确”为理由牺牲可玩性。

## 读文档顺序

1. `PLAN.zh-CN.md`
2. `docs/PROJECT_COMMAND_CENTER.zh-CN.md`
3. `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
4. `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
5. `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
6. `docs/KNOWN_ISSUES.zh-CN.md`
7. 只在需要验证具体行为时读对应测试。
