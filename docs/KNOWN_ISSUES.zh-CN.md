# Known Issues

> 用途：给后续私测 / 外部试玩 / release packet 一个稳定的已知问题来源。
> 原则：只记录当前真实存在、会影响体验理解或反馈质量的问题；不把未来愿望写成 issue。

---

## 当前阶段定位

- 当前版本是 `V9 maintenance and expansion runway`，不是公开发行版。
- V8 外部试玩候选的工程阻塞已经清零；V9 反馈闭环、baseline 复跑和扩展方向均已有工程通过证据，当前问题集中在真实内容厚度和后续 Human / numeric runway 执行。
- 线上 GitHub Pages 版本适合 milestone 回看、受控试玩和反馈收集，不适合当作“完整 Warcraft-like demo”对外扩散。

---

## 会影响外部试玩理解的问题

### 1. 反馈闭环已有样例证明，但真实外部反馈仍会异步进入

- V8 已经建立反馈记录、分级和 gate 回流规则。
- V9 已经用样例证明反馈能进入 hotfix / patch / debt / user gate，而不是停在聊天或文档里。
- 真实外部 tester 反馈仍是异步输入；它会按同一规则进入后续任务，而不是自动批准或自动关闭阶段。

### 2. V8 baseline 已有 V9 复跑包

- V8 demo smoke 和 V8 RC smoke 已经通过。
- V9 已把这些 smoke、cleanup、已知缺口和恢复路径收成可复跑 baseline。
- 后续若 baseline 失败，应按回归处理，而不是重新打开“是否有 baseline”这个问题。

### 3. 完整 Human 与数值系统仍未完成

- 当前 playable slice 仍是很窄的 Human-like 内容：worker、footman、Guard Tower、Priest、Mortar Team 和少量基础建筑/科技。
- 没有完整 Human roster、完整科技树、英雄、物品、商店、野怪、空军、完整升级线或完整 AI 使用策略。
- V9 下一轮扩展已固定主攻完整 Human 核心与数值系统，但这还只是 runway 收口，不是已完成能力。

### 4. 视觉资产仍以 proxy / fallback 为主

- 当前版本重心是系统合同、可玩性和合法来源，不是最终美术。
- 外部试玩者看到的建筑/单位视觉，只能代表当前可读性与方向，不代表最终资产品质。

### 5. 体验解释仍依赖项目上下文

- 核心操作已经可用，但试玩者如果没有最小背景说明，仍可能误解当前范围：
  - 这是系统优先的 alpha
  - 不是完整内容版
  - 不是最终视觉版

---

## 已知的工程 / 发布层限制

### 1. Release packet 不是 public release

- README 和 V8/V9 证据台账已经开始对齐。
- 但当前状态仍是受控试玩和维护扩展，不是公开发布。
- 不能写成完整 War3、完整 Human race、public demo released 或 release-ready。

### 2. Demo smoke path 和 RC smoke 已锁定为 baseline 输入

- `tests/v8-demo-path-smoke.spec.ts` 覆盖入口、开始、暂停返回/重开、结果返回和范围说明。
- `tests/v8-release-candidate-stability.spec.ts` 覆盖 V7 内容数据、训练/战斗、普通入口会话、HUD/命令状态和清理恢复。
- V9 已用 `tests/v9-baseline-replay-smoke.spec.ts` 把它们收成 baseline replay 记录。

### 3. 扩展方向已推荐，但未完成

- 当前固定方向是完整 Human 核心与数值系统补全。
- 后续仍要逐项证明单位、建筑、科技、英雄、AI 使用、HUD 可见状态和数值模型。
- 第二阵营、多人、公开发布和纯视觉包装暂不进入当前 live queue。

---

## 不应再作为“已知问题”重复报告的事项

下面这些问题已经被当前 runtime 合同覆盖，不应再把它们当成未处理状态：

- 单矿最多 5 个有效采金工人，第 6 个进入等待/递减收益
- crowded goldmine 左键可选中、右键可采集
- clear rally 不再制造假 rally
- 建造中断后可续建，取消建造可释放占地并清理 builder 状态
- AI 金矿饱和策略已按 5 工人合同工作
- AI impossible placement spam 已被修复并通过全量 runtime

---

## 当前更适合收集的反馈类型

- `V9-HOTFIX1` 已工程通过：反馈会按严重程度进入 hotfix、patch、debt 或 user gate；继续收集“最阻止试玩的问题、是否可复现、影响是什么”。
- `V9-BASELINE1` 已工程通过：继续报告 baseline 是否出现新回归。
- `V9-EXPAND1` 已工程通过：继续反馈完整 Human 核心与数值系统中，最应该先补单位、科技、英雄、AI 使用还是 HUD 可见状态。

---

## 更新规则

- 每次准备私测 / 对外试玩前都要重读并更新本文件。
- 如果某个问题已经被 runtime 合同锁定并在当前工作树验证通过，应从“当前 issue”转为“已覆盖说明”。
- 如果某个问题需要人的主观判断，必须明确写它还缺的是 `human gate`，而不是假装成工程未完成。
