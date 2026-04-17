# 双泳道过程问题记录台账

> Last updated: 2026-04-16  
> 用途：记录 Codex / GLM 双泳道推进过程中出现过的真实问题、根因、修复和防复发措施。  
> 原则：凡是造成任务断供、假运行、重复派发、状态误报、资源异常、版本误判或用户无法判断进展的问题，都必须写入这里。

## 记录规则

每条问题记录必须包含：

1. **表象**：用户或系统看到的现象。
2. **影响**：它浪费了什么，或者阻塞了什么。
3. **根因**：尽量写到系统链路，不只写“某个脚本有 bug”。
4. **处置**：本次做了什么。
5. **验证**：跑了什么检查，结果如何。
6. **防复发**：以后靠什么机制避免再犯。
7. **后续观察**：还有什么需要继续盯。

如果问题只是聊天里解释过，但没有落到这份台账，就视为没有完成复盘。

---

## 2026-04-17

### DL-2026-04-17-01：Task262 来源边界初版把来源事实和阶段边界写错

**表象**

Task262 已显示 `completed`，但 Codex 复核发现来源边界初版存在四个会污染后续任务的问题：Archmage 官方 Attack Type 是 `Hero` 却被写成 `Magic`；Mass Teleport 主源冷却是 20 秒却采用了 15 秒；Water Elemental 被外推出“同一时刻最多 1 个”；Altar 训练列表扩展被放进了 Archmage data seed。

**影响**

- 下一张 data seed 会把 Archmage 错配成 Magic 攻击，破坏与 Paladin 的 Hero attack 映射一致性。
- Mass Teleport 后续数据会从错误冷却开始，后续 runtime proof 即使全绿也会证明错误数值。
- Water Elemental runtime 可能被硬写成单活跃召唤，和主源“Brilliance 可保持多个水元素活跃”的玩法描述冲突。
- `BUILDINGS.altar_of_kings.trains` 一旦在 data seed 里扩展，就会直接暴露玩家命令入口，跳过独立 runtime proof。

**根因**

1. GLM source packet 把“主源值、补丁历史、社区样本、项目映射”混成同一层级，没有让 proof 直接检查 adopted value。
2. 静态 proof 只检查关键词存在，没有检查 `AttackType.Magic`、`15s` adopted cooldown、单活跃上限和 Altar 暴露这些错误结论。
3. 合同里把 `trains` 扩展放在 data seed 任务中，但当前 Altar 训练列表已经会影响命令卡，实际上属于玩家可见暴露面。

**处置**

- Codex 修正 `docs/V9_HERO17_ARCHMAGE_SOURCE_BOUNDARY.zh-CN.md`：
  - Archmage 采用 `AttackType.Normal`，并明确来源 `Hero attack -> project Normal`。
  - Mass Teleport 采用 Classic 主源 20 秒冷却，15 / 30 秒只保留为补丁或冲突样本。
  - Water Elemental 活跃上限和 `deadUnitRecords` 处理延后到后续运行时合同。
  - `HERO17-DATA1` 只允许添加 `UNITS.archmage`，Altar 训练入口拆到 `HERO17-EXPOSE1`。
- Codex 同步修正 `docs/V9_HERO17_ARCHMAGE_BRANCH_CONTRACT.zh-CN.md`，把 `Altar Exposure` 加入 Archmage 分阶段顺序。
- Codex 加固 `tests/v9-hero17-archmage-source-boundary.spec.mjs`，直接拦截上述错误。
- 队列新增 Task263，限定为 Archmage unit data seed only。

**验证**

```bash
node --test tests/v9-hero17-archmage-source-boundary.spec.mjs tests/v9-hero17-archmage-branch-contract.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

结果：HERO17/HERO16 静态 proof 88/88、build、tsc、cleanup 通过。

**防复发**

- source boundary proof 必须检查 adopted value，而不是只检查来源页面或字段名称存在。
- 任何会改变玩家命令卡、训练列表、按钮或可见入口的修改，不能混入“纯 data seed”任务。
- 外部主源、补丁样本和项目映射必须在文档里分层记录。

**后续观察**

Task263 只能写 `UNITS.archmage`。如果 GLM 修改 Altar trains、Game.ts、SimpleAI、能力数据或 runtime 测试，Codex 必须拒收或接管。

### DL-2026-04-17-02：重启后 GLM tmux socket 派发被 sandbox 拦截

**表象**

Task263 已写入队列后，`./scripts/glm-watch-feed.sh status` 仍显示旧的 `queue_empty` 缓存。改用 `check` 真正派发时，首次运行失败，报错无法创建 `/var/folders/.../war3-re-tmux/glm-watch.sock`，并提示 GLM socket 不存在。

**影响**

- 如果只看旧 status，会误以为没有可派发任务。
- 如果不处理 socket 权限，GLM 仍会停在无任务状态，双泳道断供。
- 用户会看到“队列里有 Task263，但 GLM 没动”的不一致状态。

**根因**

1. `status` 是读取上次 feed 状态，不等于重新计算和派发。
2. 用户重启后 GLM tmux socket 消失。
3. 当前 Codex sandbox 对 tmux socket 创建有限制，需要使用已批准的 `./scripts/glm-watch-feed.sh` 升权运行。

**处置**

- 先确认 Task263 在队列表和任务卡均为 ready。
- 使用 `./scripts/glm-watch-feed.sh check` 重新派发；首次 sandbox 失败后，按审批流程升权重跑。
- 升权后 Task263 成功派发为 job `glm-mo2hgv0g-88aq4o`，队列表自动改为 `in_progress`，feed 显示 running。

**验证**

```bash
./scripts/glm-watch-feed.sh check
```

结果：`running: none: tracked glm job still running (glm-mo2hgv0g-88aq4o: Task 263 — V9 HERO17-DATA1 Archmage unit data seed)`。

**防复发**

- 需要真实推进时用 `check`，只看状态时才用 `status`。
- 重启后如果涉及 tmux socket，需要允许 `./scripts/glm-watch-feed.sh` 在 sandbox 外创建/连接 socket。
- 看板刷新和队列状态必须以最新 `check` 结果为准。

**后续观察**

继续观察 Task263 是否产生 diff 和 closeout；如果 GLM 长时间没有输出或越界修改，Codex 接管。

---

## 2026-04-16

### DL-2026-04-16-01：Task200 GLM 写完文档后再次停在 proof/closeout 前

**表象**

Task200 的 GLM 侧产出只完成了 HN7 Blacksmith branch global closure 文档，随后停在 proof / closeout 之前；队列表显示 `completed`，但还没有 Codex 本地 `accepted`。

**影响**

- 如果直接继续派发下一张任务，会让未复核的全局 closure 变成新任务的前提。
- 看板和队列容易误以为 Task200 已经完全验收，造成 Task200 重复提交或 Task201 过早启动。
- 过期的 AWT AI closure proof 还会因为后续正确加入 Blacksmith AI 逻辑而误报失败。

**根因**

1. GLM 仍存在“文档写完但 proof/closeout 没收完”的断点。
2. 队列状态 `completed` 和 Codex 验收状态 `accepted` 没有自动同步。
3. 旧 proof 用全文件扫描表达禁区，后续任务扩展 SimpleAI 后变成过期断言。

**处置**

- Codex 接管 Task200。
- 修正全局 closure 文档，把 16 格命令卡表述为“13 个研究按钮 + 3 个空槽”，不暗示额外动作。
- 新增 `tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs`。
- 修正 AWT AI closure proof，让它只检查 AWT 自身策略块，而不是禁止整个 `SimpleAI.ts` 里出现后续 Blacksmith AI 研究逻辑。
- 队列把 Task200 从 `completed` 改为 `accepted`，并补 Task201 作为下一张相邻任务。

**验证**

```bash
node --test tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs
node --test tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs tests/v9-hn7-leather-armor-closure.spec.mjs tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs tests/v9-hn7-animal-war-training-ai-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：单项 proof 22/22、联合 static 92/92、build、tsc 通过。

**防复发**

- GLM 的 `completed` 只能表示 worker 交付，不等于 Codex accepted。
- closure 类任务必须有静态 proof；只有文档没有 proof 不允许进入下一任务前提。
- 禁区 proof 要检查任务边界，而不是用全文件字符串扫描锁死未来正确扩展。

**后续观察**

Task201 只做 Human 核心缺口盘点和下一张相邻分支推荐；如果它生成一长串实现任务或直接修改生产代码，Codex 必须中断并接管。

### DL-2026-04-16-02：Task201 后台 Explore 被误判成 interrupted

**表象**

Task201 已经发给 GLM，终端里能看到 `Explore(Survey Human buildings/units)` 和 `Cooking…`，但 `glm-watch-feed status` 仍一度显示 Task201 是 `interrupted / same_title_freeze`。

**影响**

- 看板会显示 GLM 停了，用户看到的状态与真实终端不一致。
- 如果为了“补货”直接重复派同标题任务，会再次造成重复消耗。
- 如果完全相信 interrupted，又会让 Codex 过早接管，和 GLM 后台探索撞车。

**根因**

Claude Code 在后台 Explore / 子任务运行时，底部输入框仍可能显示 `❯`。旧判断只看到输入框，就把任务当作“回到提示符且无 closeout”，没有识别同一屏里的 `Explore(...) + Cooking…` 仍是活动状态。

**处置**

- `scripts/dual-lane-companion.mjs` 新增后台工作识别：最近输出中同时存在 `Explore(...)` / `Task(...)` / `researcher(...)` 或后台提示，以及 `Cooking…` 计时状态时，不再把任务判成 interrupted。
- `scripts/lane-feed.mjs` 同步识别后台 `Explore(...) + Cooking…`，让 feed status 显示 running，而不是因为 companion 的旧 interrupted 记录进入 same-title freeze。
- 补回归用例覆盖“后台 Cooking 但底部输入框可见”的真实画面。

**验证**

```bash
node --test tests/lane-feed.spec.mjs
node --test tests/dual-lane-companion.spec.mjs
node --check scripts/lane-feed.mjs
node --check scripts/dual-lane-companion.mjs
./scripts/glm-watch-feed.sh status
```

结果：lane-feed 55/55、dual-lane-companion 19/19、语法检查通过；feed status 现在显示 Task201 为 `running: runtime_progress_without_companion`，不会重复派发同标题。

**防复发**

- 监控不能只看底部提示符，必须结合 Claude Code 任务面板和后台工具状态。
- 同标题 freeze 仍保留，但当同一任务存在明确 runtime progress 时，状态展示必须优先显示 running。

**后续观察**

继续看 Task201 是否产出 `docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md` 和 `tests/v9-human-core-global-gap-inventory.spec.mjs`；如果 GLM 最终没有 closeout 或越界，Codex 再接管。

### DL-2026-04-16-03：Task201 缺口盘点初版过度宣称完整度和 AI Castle/Knight 覆盖

**表象**

Task201 最终产出了 Human 核心缺口盘点和静态 proof，但初版文档把当前多个对象写成“完整”，并在 AI 行为里误导性写成 Town Hall → Keep → Castle、Knight 训练/战术已覆盖。实际当前 AI 只可靠覆盖 Town Hall → Keep、二本建筑和部分训练/研究；AI Keep → Castle、主动 Knight 生产和 Knight 战术仍未完成。

**影响**

- 如果直接 accepted，后续任务会基于错误前提跳过 AI Castle/Knight 或误判完整 Human 进度。
- 看板会让用户以为“人族已经完整”，和真实产品差距相反。
- 静态 proof 如果只检查文档存在，会放过过度宣称，任务质量下降。

**根因**

1. 缺口盘点任务混合了“已有最小链路”和“War3 完整能力”两种口径，GLM 容易把局部实现写成完整实现。
2. proof 初版偏向字段/关键词存在，没有对“不得宣称完整”和“AI 未覆盖 Knight 策略”做负向约束。
3. 当前项目历史很长，AI 的真实覆盖面不能靠任务标题推断，必须回到 `SimpleAI.ts` 和已验收 runtime proof。

**处置**

- Codex 修正 `docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md`：
  - 把“完整”改成“已实现最小链路”。
  - 明确 AI Keep → Castle 自动升级、AI 主动训练 Knight、AI Knight 战术未完成。
  - AI 训练列表只保留 worker/footman/rifleman/mortar_team/priest，不写 Knight。
- Codex 加固 `tests/v9-human-core-global-gap-inventory.spec.mjs`：
  - 禁止 `完整：` 等过度完成口径。
  - 检查 AI 已实现区不宣称 Knight 训练策略。
  - 检查缺失英雄、空军、物品/商店、Siege Engine 等仍作为缺口列出。
- Task201 改为 Codex accepted 后才开放 Task202。

**验证**

```bash
node --test tests/v9-human-core-global-gap-inventory.spec.mjs
node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：gap static 24/24、联合 HN7 global 46/46、build、tsc 通过。

**防复发**

- 缺口盘点必须同时有正向清单和负向禁区，不允许只用“包含关键词”验收。
- 文档中“完整 / 全部 / 已完成”类词必须被 proof 控制，除非确实有全链路 runtime + static 证据。
- AI 能力必须按真实代码和 proof 验收，不能从单位数据存在推断 AI 已会使用该单位。

**后续观察**

Task202 只能是 Altar + Paladin 合同。若 GLM 直接写生产代码、打开四英雄、或把英雄系统写成已实现，Codex 必须接管并拒收。

### DL-2026-04-16-04：Task202 合同初版把未源校验英雄数值写成原版事实

**表象**

Task202 的 HERO1 合同结构正确，但初版把 Altar、Paladin、Holy Light 的若干精确数值直接写成“War3 ROC 原版”。这些值可能是合理候选，但本项目前面 HN7 的升级线已经形成规则：进入 `GameData.ts` 前，精确 War3-like 数值必须先有 source boundary。

**影响**

- 如果直接接受，下一张 data seed 会把未核对的候选值写进生产数据。
- 后续 proof 会把“合同候选值”误当成“已批准来源值”。
- 这会破坏前面建立的来源层级：官方/主源优先，非官方资料只能交叉校验或作为冲突样本。

**根因**

1. 合同任务容易把“定义候选切片”扩展成“确定最终数值”。
2. 英雄系统是新大块，缺少类似 HN7-SRC 的显式来源前置。
3. proof 初版检查了字段完整性，但没有检查“数值只是候选，不能直接进 data seed”。

**处置**

- Codex 修正 `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md`：
  - Altar / Paladin / Holy Light / revive 精确值全部改为候选参考值。
  - 新增来源边界说明：任何 `GameData.ts` 数据种子前必须先做 `HERO2-SRC1`。
  - 后续切片顺序改为 source boundary -> data seed -> runtime -> proof。
- Codex 加固 `tests/v9-hero1-altar-paladin-contract.spec.mjs`：
  - 证明候选值必须标记为 candidate reference。
  - 证明 `HERO2-SRC1` 在 data seed 之前。
  - 禁止继续使用未源校验的“原版造价”表述。
- Task202 accepted 后才开放 Task203。

**验证**

```bash
node --test tests/v9-hero1-altar-paladin-contract.spec.mjs tests/v9-human-core-global-gap-inventory.spec.mjs
node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：HERO1+gap static 45/45、HN7+gap 46/46、build、tsc 通过。

**防复发**

- 新内容分支只要包含外部游戏数值，就必须先有 source boundary，不能直接 data seed。
- 合同文档里的精确数值默认是候选值，只有 source boundary accepted 后才允许成为生产数据。
- Proof 必须检查 source -> data -> runtime 的顺序，而不只是检查字段存在。

**后续观察**

Task203 只允许做来源边界。若它写 `GameData.ts`、实现 Altar/Paladin 或把候选值写成已实现，Codex 必须拒收或接管。

## 2026-04-15

### DL-2026-04-15-23：Task121 GLM 失败后停在提示态并留下 runtime 锁

**表象**

GLM Task121 已写出代码和测试，但 focused runtime 失败后停在输入提示，状态仍可能被理解为“还在跑”。同时失败测试短时间留下 Playwright / Vite / Chrome 子进程，cleanup 第一次因为 runtime lock active 而跳过。

**影响**

- Task121 不能靠 GLM 自己 closeout。
- 如果继续派下一张任务，会基于未验收实现扩张，重复烧 token。
- runtime 锁和残留浏览器会让后续测试误等、误判或增加机器负载。

**根因**

1. GLM 的测试代码用错 `TeamResources` API，把不存在的 `addResource()` 当作补资源方法。
2. GLM 直接写 `g.selectedUnits = [th]`，但真实选择入口是 `selectionModel.setSelection()`；命令卡因此没走到真实选中状态。
3. 失败后没有完成 cleanup / closeout，watch 状态需要 Codex 接管判断，不能只看 running 字样。

**处置**

- Codex 接管 Task121。
- 修正 proof：资源补给改为 `g.resources.earn(0, 1000, 1000)`；选择改为 `g.selectionModel.setSelection([th])`；按钮查找改为读取 `.btn-label`。
- 加固生产边界：`startBuildingUpgrade()` 必须从 `BUILDINGS[building.type].upgradeTo` 验证目标，不能被内部调用升级到任意建筑。
- 重新跑完 build、typecheck、focused runtime、node proof，并二次 cleanup。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-upgrade-flow-regression.spec.ts --reporter=list
node --test tests/v9-keep-upgrade-flow-contract.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs
./scripts/cleanup-local-runtime.sh
pgrep -fl 'vite|playwright|chrome-headless|Chromium|run-runtime-tests|node .*vite'
```

结果：build 通过，typecheck 通过，focused runtime 3/3 通过，node proof 20/20 通过，cleanup 完成，无残留进程。

**防复发**

- GLM closeout 失败后，Codex 必须看真实测试输出和进程状态，不能只看 watch 是否 running。
- Runtime proof 必须走现有 API：资源用 `earn/spend/get`，选择用 `selectionModel`。
- 下一张 GLM 任务必须等上一张 Codex accepted 后再派发。

**后续观察**

Task122 继续沿 Keep 相邻任务推进，但只证明 post-upgrade command surface，不得扩到 Castle / Knight / 完整 T2。

### DL-2026-04-15-24：看板 Codex 卡片仍显示旧 codex-watch stalled

**表象**

当前 Codex 工作实际在这个对话里推进，但看板的 Codex 卡片 `session_state` 仍继承旧 `codex-watch` 的 `stalled` 状态。任务内容显示 active，状态字样却像 Codex 停了。

**影响**

- 用户会误以为当前 Codex 没在工作。
- 真实执行源和旧 watch 监控源混在一起，影响双泳道可信度。

**根因**

`generate-dual-lane-board.mjs` 已经在 monitor snapshot 里把旧 watch stalled 改写为 `current_session`，但 `task_views.codex.session_state` 仍直接写入 `monitor.state`。

**处置**

- Codex 修正 `buildCodexTaskView()`：当旧 monitor 是 `stalled` 且 Codex 队列有当前任务时，卡片 `session_state` 也显示 `current_session`。
- 重新生成 `public/dual-lane-board.json`。

**验证**

```bash
node --check scripts/generate-dual-lane-board.mjs
node scripts/generate-dual-lane-board.mjs
node --test tests/board-closeouts.spec.mjs
```

结果：语法检查通过，看板 JSON 刷新，board closeout tests 4/4 通过。看板现在显示 Codex `current_session`，GLM `running Task122`。

**防复发**

看板里“Codex 当前对话执行”和“旧 codex-watch 进程”必须分开显示；旧 watch 的 stalled 不能覆盖当前对话里的真实 active 任务。

### DL-2026-04-15-25：companion 列表状态查询会逐条刷新历史任务导致卡住

**表象**

手动执行 `node scripts/dual-lane-companion.mjs status --lane glm --json --all` 时长时间不返回。现场能看到一个 node 进程卡在 companion status 查询上，而不是 GLM 真正在做更多工作。

**影响**

- 看板或人工排查可能误以为“状态还在刷新 / 任务还在跑”。
- 历史 job 多时会反复调用 monitor / tmux 查询，浪费 CPU、时间和 token。
- 用户已经遇到过几十个 node、电脑卡顿和耗电问题，这类全量刷新会放大风险。

**根因**

`refreshAllJobs()` 对状态文件里的所有历史 job 都执行 `refreshJob()`。即使 60 多条已经是 `completed` / `cancelled` / `interrupted`，仍会逐条读取 monitor、tmux pane 和日志切片。

**处置**

- `scripts/dual-lane-companion.mjs` 新增 `shouldRefreshJobInList()`。
- 列表状态刷新默认只刷新非终态 job；终态历史 job 直接读取缓存。
- 保留显式 `refreshTerminal` 参数，未来如果真要全量重算，可以单独开启。

**验证**

```bash
node --check scripts/dual-lane-companion.mjs
node --test tests/dual-lane-companion.spec.mjs
time node scripts/dual-lane-companion.mjs status --lane glm --json --all
```

结果：companion 单测 16/16 通过；`status --all` 约 0.8 秒返回，不再卡在历史 job 全量刷新。

**防复发**

- 看板和状态列表只能刷新 active / running / non-terminal 任务。
- 历史 completed / accepted 任务作为审计记录读取，不作为每次 UI 刷新的实时对象。

### DL-2026-04-15-26：看板 Codex 最近完成取到旧历史任务

**表象**

Task123 / Task124 推进后，看板里 Codex 当前任务已经是 V9-CX12 / V9-CX13，但 “Codex 最近完成” 仍显示很早以前的 “人族基础数值账本”。

**影响**

- 用户会误以为 Codex 最近没有做当前 V9 任务。
- 最近完成卡片和当前队列脱节，降低看板可信度。

**根因**

`generate-dual-lane-board.mjs` 的 Codex 最近完成优先取 companion 历史 job；旧 codex-watch job 的完成时间比当前队列文档更新更早但仍被当成最新来源。队列表本身有当前 active 行和它前一条 done 行，却没有优先作为当前会话的最近完成。

**处置**

- 调整 `latestCompletedRow()`：优先找当前 active / in_progress 行之前最近一条 `accepted` / `completed` / `done`。
- `buildCodexTaskView()` 优先使用当前队列表推导出的最近完成，再回退到 companion 历史 job。
- 重新生成看板。

**验证**

```bash
node --check scripts/generate-dual-lane-board.mjs
node scripts/generate-dual-lane-board.mjs
node --test tests/board-closeouts.spec.mjs
```

结果：看板 Codex 最近完成显示 `V9-CX12 — Keep/T2 unlock contract packet dispatch`，GLM 最近完成显示 `Task 124 — V9 HN2-CONTRACT5 Keep/T2 unlock contract packet`。

**防复发**

- 当前会话队列表比旧 watch 历史 job 更接近真实工作流；看板上的当前任务和最近完成必须优先从同一队列推导。

### DL-2026-04-15-27：Task125 GLM 初版用代理证明替代真实 dry-run

**表象**

Task125 要求验证 Workshop / Arcane Sanctum 在“需要 Keep”的模拟状态下如何被 availability 和命令卡禁用。GLM 初版测试没有做到这一点，而是用 Tower / Lumber Mill 和 Arcane Sanctum / Barracks 的现有前置当代理证明，并在 Claude Code 0% context compact 处停住。

**影响**

- 如果直接接受，会得到一个假绿：证明了已有前置机制，但没有证明玩家看到的 “需要主城” 状态。
- GLM 低上下文 compact 会把任务留在 half-written 状态，队列显示 running/blocked，但没有可信 closeout。

**根因**

- 浏览器里的生产 `BUILDINGS` 模块不是直接挂在 `window` 上，GLM 没有找到安全的 runtime 注入点后退化成代理证明。
- 任务卡没有提前说明“如果不能直接改 BUILDINGS，就必须诚实改成模拟 availability proof，不能声称完成原目标”。

**处置**

- Codex 取消 `glm-mnzt3908-kl6jw7`，接管 Task125。
- 改写 `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts`：
  - RG-1 只证明现有 `techPrereq` 机制。
  - RG-2 / RG-3 临时覆盖当前 game 实例的 `getBuildAvailability()`，模拟 Workshop / Arcane Sanctum 需要 Keep，并验证命令卡显示“需要主城”。
  - RG-4 证明生产数据未变。
- 同步修正 Task125 任务卡和合同文档，避免继续声称“直接临时修改 BUILDINGS”。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

结果：build 通过，typecheck 通过，runtime dry-run 4/4 通过，node proof 12/12 通过，cleanup 后无残留进程。

**防复发**

- GLM 如果无法完成原定证明方式，必须在 closeout 里标 blocked，不能用代理证明替代原目标。
- Codex 复核时必须看 proof 是否真的证明任务标题，而不是只看测试是否绿。

### DL-2026-04-15-01：关机恢复后 GLM 队列断供与同标题冻结

**表象**

关机恢复后，V6 仍有打开 blocker，但 `glm-watch-feed` 返回 `queue_empty`。  
旧的 `攻击护甲最小模型证明包` 曾因关机中断留下同标题 cancelled job，新恢复任务一度被 same-title 保护逻辑冻住。

**影响**

- GLM 没有自动接到 V6-NUM1 的下一条真实任务。
- 如果直接触发空队列自动合成，Codex/GPT 会生成不必要任务，浪费 token。
- 用户看到 watch 进程存在，但两条泳道没有真实进展。

**根因**

这是恢复链路里的状态归属问题：

1. 队列文件里没有下一张可派的 V6-NUM1 任务。
2. 同标题 cancelled job 和新恢复任务没有区分，触发 same-title freeze。
3. 空队列时，feed 会尝试走 task synthesis；这对当前 V6 已有明确相邻任务的场景不合适。

**处置**

- 把旧 cancelled job 改名为 `关机中断记录 - 攻击护甲最小模型证明包`，和新恢复任务分开。
- 手动取消一次误触发的 Codex task synthesis job，避免 GPT 继续烧 token。
- 派发真实 GLM 任务 `研究效果数据模型证明包`，job id 为 `glm-mnzc4ozk-qs3jya`。
- 新增 `docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md`，记录当前 V6 最短链路：

```text
NUM-D -> NUM-E -> ID1 -> FA1 -> W3L1
```

- 在 `docs/GLM_READY_TASK_QUEUE.md` 补上后续两张带前置的任务卡：
  - `玩家可见数值提示证明包`
  - `人族集结号令最小证明包`

**验证**

运行：

```bash
git diff --check -- docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md docs/DOCS_INDEX.md
node scripts/generate-dual-lane-board.mjs
./scripts/glm-watch-feed.sh status --json
```

结果：

- diff check 通过。
- 看板 JSON 已刷新。
- `glm-watch-feed` 显示 GLM 正在跑 `研究效果数据模型证明包`，不是空队列。

**防复发**

- 关机中断、取消、失败和重新恢复的同名任务必须拆开标题或明确 re-dispatch 语义。
- active milestone 仍有 open blocker 时，不允许把 `queue_empty` 自动解释为“没任务了”。
- 如果当前 gate 已经有相邻任务链，优先补 live queue，不走泛化 task synthesis。
- 后续任务必须写 `Prerequisite`，让 feed 不越级派发。

**后续观察**

- 观察 `glm-mnzc4ozk-qs3jya` 是否完成 NUM-D runtime proof。
- Codex 必须本地复核 GLM closeout 后，才能把 NUM-D 写进 evidence ledger 并放行 NUM-E。

### DL-2026-04-15-02：NUM-D 未经 Codex 复核就自动派发 NUM-E

**表象**

GLM 把 `研究效果数据模型证明包` 写成 done 后，feed 立刻派发了下一张 `玩家可见数值提示证明包`。  
这发生在 Codex 还没有本地复核 NUM-D 的 build、typecheck 和 locked runtime 之前。

**影响**

- 如果 NUM-D 是假绿，NUM-E 会基于错误实现继续改 `Game.ts` / `GameData.ts`。
- GLM 会连续消耗上下文和时间，Codex 需要倒回来拆线。
- 用户看到“自动继续”是真的，但这个继续越过了集成 owner 的验收点。

**根因**

`lane-feed` 当前把 live queue 中的 `done` 当作可放行信号，但没有区分：

```text
worker 自报 done
!= Codex 本地复核 accepted
```

另外，NUM-E 的 `Prerequisite` 只写了 `研究效果数据模型证明包` 已完成，没有写“Codex verified / accepted”这个集成条件。

**处置**

- 停止 `glm-watch-feed-daemon`，防止继续自动派发。
- 中断 NUM-E 这次过早派发。
- 将 job `glm-mnzcflv1-dszoaj` 标记为 `cancelled / manual_cancelled`。
- 把 `玩家可见数值提示证明包` 退回 `ready`，并在任务卡里写明这次提前派发已暂停，需等 Codex 复核 NUM-D。
- Codex 接管 NUM-D 复核，修正 proof-2 并跑本地 locked runtime。

**验证**

运行：

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts --reporter=list
```

结果：build 通过，typecheck 通过，runtime `12/12` 通过。

**防复发**

- 后续队列前置如果依赖上一张实现，不能只写“上一任务完成”，要写“上一任务 Codex accepted”或在 feed 层增加 accepted 状态。
- Worker 可以继续做任务，但跨任务自动派发必须尊重集成复核点。
- 如果自动派发已经越过复核点，立即取消新 job，退回 ready，不让错误继续扩散。

**后续观察**

- 当前需要恢复 NUM-E 派发前，先确认 V6 evidence ledger 已写入 NUM-D 复核通过。
- 后续可以把 `accepted` 状态接入 `lane-feed.mjs`，避免靠文档备注约束。

### DL-2026-04-15-03：把 worker 完成态和 Codex 验收态拆开

**表象**

NUM-D 复核过程中已经证明，`completed/done` 只能表示 worker 自报完成，不能表示集成 owner 已接受。  
如果下一张任务只依赖“上一张 completed”，feed 会在 Codex 本地复验前继续派发。

**影响**

- 后续 V6-ID1、V6-FA1 可能基于未经复核的 NUM-E 继续扩展。
- 一旦前置实现有假绿，错误会沿任务链传播，回滚成本变高。
- 用户看到“持续工作”，但实际是在绕过质量门槛。

**根因**

旧的 `lane-feed` 只识别完成态：

```text
completed / done -> prerequisite satisfied
```

它没有表达：

```text
worker completed
Codex local review accepted
```

**处置**

- `scripts/lane-feed.mjs` 增加 `accepted` 前置解析。
- 如果任务卡写“Prerequisite: `X` accepted.”，`completed/done` 不再满足前置。
- `tests/lane-feed.spec.mjs` 增加回归：前置任务为 `completed` 时必须等待；改成 `accepted` 后才允许计划下一张。
- `人族集结号令最小证明包` 的前置改为 `玩家可见数值提示证明包 accepted`，避免 NUM-E 一完成就自动进入 ID1。

**验证**

运行：

```bash
node --test tests/lane-feed.spec.mjs
```

结果：`35/35` 通过。

**防复发**

- 跨实现链路的下一张任务默认写 `accepted` 前置。
- GLM 可以把任务写成 `completed`，但不能自行把它写成 `accepted`。
- Codex 本地跑完 build、typecheck、focused runtime 和 cleanup 后，才能把前置状态改成 `accepted`。

**后续观察**

- 观察 NUM-E 完成后，feed 是否停在 `prerequisite_wait`，而不是立刻派 `人族集结号令最小证明包`。

### DL-2026-04-15-04：GLM auto-compact 卡死但 monitor 仍显示 running

**表象**

- GLM 执行 `人族集结号令最小证明包` 时写出初版代码和测试，直接启动 `npx playwright test`。
- 修复两个测试失败后进入 Claude Code auto-compact / reconnect 状态，tmux pane 仍是 `node`，watch/feed 仍显示 running。
- 实际没有 closeout，也没有继续跑 locked runner。
- 停掉 GLM session 后，直接启动的 Playwright/Vite/Chrome 仍残留，需要 `./scripts/cleanup-local-runtime.sh` 清理。

**影响**

- 用户看到 running，但泳道没有继续产出。
- 直接 Playwright 子进程残留会占 CPU/内存/电量。
- 如果不取消 job，feed 会继续把同一张卡当作正在执行，后续 FA1 无法派发。

**根因**

- watch/feed 只能看到进程还活着，不能判断 Claude Code 是否卡在 auto-compact。
- GLM 直接跑 `npx playwright test` 绕过 locked runner，导致 session 被停止后子进程仍可能留下。
- monitor 的 inactive 秒数会被 spinner / reconnect 输出刷新，不能代表真实工程进展。

**处置**

- Codex 停止 `glm-watch` session。
- 使用 `node scripts/dual-lane-companion.mjs cancel glm-mnzd89mr-pxbkiu --json` 取消 stuck job。
- 运行 `./scripts/cleanup-local-runtime.sh` 清理残留 runtime 进程。
- Codex 接管验证：build、typecheck、ID1 focused 6/6、相关 runtime 30/30 通过。

**防复发**

- GLM 卡在 auto-compact / reconnect 且无新文件输出、无 closeout 时，不把 running 当作工作中。
- 停止 GLM 后必须立刻清理 runtime 残留并复查进程。
- GLM closeout 仍必须用 locked runner；直接 `npx playwright test` 只能作为中间调试，不作为验收。

## 2026-04-14

### DL-2026-04-14-01：GLM 显示 running，但实际停在输入框

**表象**

用户看到 GLM 长时间没有新日志，但页面和 feed 状态仍显示 `running`。  
终端里能看到 `glm-watch`、`claude`、`glm-watch-feed` 进程都活着，队列里也有 `in_progress` 任务。

**影响**

- GLM 没有真正推进 `V3 BG1 基地空间语法收口复跑`。
- lane-feed 以为已有任务在跑，不派下一条，导致 GLM 泳道实际停摆。
- 页面上的 `running` 容易误导用户，以为模型还在工作。

**根因**

这是三层状态没有对齐：

1. `glm-watch-feed` 已经把多行任务粘贴进 Claude Code。
2. Claude Code 没有把这段多行输入真正提交给模型，任务停在输入框。
3. `lane-feed` 只看 companion job 的 `running`，没有把 monitor 的 `stalled` 作为一等状态返回。

所以：

```text
进程活着
!= 任务已提交
!= 模型正在产出
```

**处置**

- 手动给当前 GLM 输入补了一次提交，避免重复派发同一任务。
- 修改 `scripts/glm-watch.sh`：
  - 多行任务粘贴后等待一小段时间再提交。
  - 对多行任务增加第二次提交间隔，降低“卡在输入框”的概率。
- 修改 `scripts/lane-feed.mjs`：
  - 如果 running job 的 `phase` 或 `monitorState` 是 `stalled`，feed 状态返回 `stalled`。
  - 不再把 20 分钟无变化的任务继续报告成普通 `running`。
- 补充 `tests/lane-feed.spec.mjs`：
  - 覆盖 stalled running job 必须被显式暴露，不能被当作活跃运行。

**验证**

运行：

```bash
node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs
```

结果：`25/25` 通过。

**防复发**

- 以后判断 worker 是否在干活，不能只看 tmux/进程是否存在。
- 看板和 feed 必须优先展示 job truth + monitor stalled，而不是单纯展示 runtime alive。
- GLM/Codex 多行任务派发必须经过 watch script 的稳定提交路径。

**后续观察**

- 继续观察当前 `glm-mnxi5cyw-lfi9cc` 是否真正产出 diff / closeout。
- 如果仍出现输入框停住，应把提交确认从“固定等待”升级为“检测 Claude Code 进入 working 状态后再认为派发成功”。

### DL-2026-04-14-02：V3 任务列表断供

**表象**

V3 仍有打开的工程项，但 GLM / Codex 队列出现空队列或长时间重复同一批任务的情况。

**影响**

- 自动补货不能稳定给两条泳道续任务。
- 用户无法判断是“已经达标进入下一版”，还是“任务系统断了”。

**根因**

三处问题叠加：

1. `milestone-oracle` 只读 `remaining gates` section 下第一张表，漏掉 V3 product-shell 后续 gate 表。
2. `queue-refill` 的 deterministic fallback 主要覆盖 V2，V3 缺少安全兜底任务。
3. GLM companion 曾允许把旧 closeout 文本误判成当前 job 完成，导致新任务被秒吃。

**处置**

- `scripts/milestone-oracle.mjs` 改为读取 section 内所有 gate 表，并过滤掉 route 表。
- `scripts/queue-refill.mjs` 增加 V3 的 Codex / GLM 兜底任务。
- `scripts/dual-lane-companion.mjs` 要求必须看到当前任务自己的 `JOB_COMPLETE: <job-id>` 才能判完成。
- 清理错误的 GLM job state，重新补充 V3 ready queue。

**验证**

运行：

```bash
node --test tests/dual-lane-companion.spec.mjs tests/milestone-oracle.spec.mjs tests/queue-refill.spec.mjs
```

结果：`25/25` 通过。

**防复发**

- milestone parser 不能假设一个 section 只有一张关键表。
- 每个 active version 都必须有 deterministic fallback，不允许只有 V2 有兜底。
- job 完成必须绑定当前 job id，不能靠泛化 closeout 文案。

**后续观察**

- 观察 V3 当前 gate 是否能按 oracle -> refill -> feed -> closeout 链路自然推进。
- 后续 V4/V5 模板准备时，复用同一套 fallback 与 closeout marker 规则。

### DL-2026-04-14-03：GLM 已完成任务，但 companion 没识别 closeout

**表象**

GLM 已经在终端里输出：

```text
JOB_COMPLETE: glm-mnxwz2ot-bkesps
```

并把 `V3 PS3 开局解释层收口复跑` 写成 completed。  
但 `lane-feed` 仍显示：

```text
tracked glm job still running
```

所以 GLM 看起来又停了。

**影响**

- 已完成任务没有被 companion 回收到 `completed`。
- feed 以为 GLM 仍在跑旧任务，不会派下一条。
- 用户看到的是“GLM 停住”，实际是 closeout parser 没收回结果。

**根因**

Claude Code 输出行前面带 UI 前缀，例如：

```text
⏺ JOB_COMPLETE: glm-mnxwz2ot-bkesps
```

旧 parser 只认整行严格等于：

```text
JOB_COMPLETE: <job-id>
```

没有先剥掉 Claude Code 的 UI 图标和 OSC 控制序列。  
另外，GLM 有时输出 `READY_FOR_NEXT_TASK` 而不是 `READY_FOR_NEXT_TASK:`，summary 提取也过窄。

**处置**

- 修改 `scripts/dual-lane-companion.mjs`：
  - `stripAnsi` 现在会清理 OSC title 控制序列。
  - `normalizeLogLine` 会剥掉 Claude Code UI 前缀图标。
  - `extractReadyLine` 接受 `READY_FOR_NEXT_TASK` 和 `READY_FOR_NEXT_TASK:` 两种形式。
- 修改 `tests/dual-lane-companion.spec.mjs`：
  - 新增 Claude Code UI 前缀 closeout marker 的回归测试。
- 手动刷新 companion 后，`glm-mnxwz2ot-bkesps` 已正确回收到 completed。
- `lane-feed` 已继续派发下一条：`CH1 镜头HUD协同证明包`。

**验证**

运行：

```bash
node --test tests/dual-lane-companion.spec.mjs tests/lane-feed.spec.mjs
```

结果：`26/26` 通过。

**防复发**

- closeout marker 必须绑定当前 job id，但识别前要先清理终端 UI 噪声。
- 不能因为 Claude Code 前缀、OSC 控制序列或 UI glyph 造成 completed 漏识别。

**后续观察**

- 当前新任务 `glm-mnxx9yvr-eavmdo / CH1 镜头HUD协同证明包` 已进入 Claude Code 运行态，需要继续观察它是否正常产出 diff / closeout。

### DL-2026-04-14-04：GLM 看似又卡住，实为状态读取和回收链路失真

**表象**

用户看到 GLM 又长时间没有明显变化，且看板里仍残留多条 `running` 任务。  
现场检查时，当前 GLM 任务 `CH1 镜头HUD协同证明包` 实际仍在 Claude Code 里运行，但 companion 里有历史任务处于“`running` 同时又有 `completedAt`”的矛盾状态。

**影响**

- 用户无法判断 GLM 是真卡死，还是只是页面/状态没更新。
- 历史 dirty job 污染 live queue 和看板，造成“GLM 一直 running”的假象。
- 如果任务真的 stalled，旧机制只会报告，不会主动催醒同一个 job。

**根因**

这是状态机链路的四个问题叠加：

1. companion 之前调用 monitor 的 `check` 输出，但 `check` 是人类文本，不是 JSON，导致 `monitorState` 经常变成 `unknown`。
2. monitor status 文件直接写入，存在读取半截 JSON 的窗口。
3. 已完成的历史 job 虽然有自己的 `JOB_COMPLETE: <job-id>`，但 companion 因为当前 pane 正在跑新任务，拒绝把旧 job 回收到 `completed`。
4. 真正 stalled 时，lane-feed 只会等待，不会给当前 job 发“继续或明确 closeout”的 watchdog 提醒。
5. 看板 daemon、feed daemon 和人工刷新会并发读写同一个 companion state；旧快照可能把刚回收好的终态又覆盖回 `running`。

**处置**

- monitor 读取改成先 `check` 更新，再 `status` 读取 JSON。
- `glm-watch-monitor.sh` / `codex-watch-monitor.sh` 改为临时文件写入后原子替换，避免半截 JSON。
- companion 增加历史脏状态回收：
  - 有匹配当前 job id 的 `JOB_COMPLETE` 就回收到 `completed`。
  - 有 `completedAt` 但没有匹配 marker 的 running job，退为 `interrupted / needs_reroute`。
- companion 写 job 文件和 summary 时增加终态保护：一旦 job 进入 `completed`、`blocked`、`interrupted` 或 `cancelled`，旧刷新不能把它降级回 `running`。
- lane-feed 增加 stalled watchdog：
  - 不重派新任务覆盖旧任务。
  - 只给当前 job 发一次有节流的提醒，要求继续产出、`JOB_COMPLETE` 或 `JOB_BLOCKED`。

**验证**

运行：

```bash
node --test tests/dual-lane-companion.spec.mjs tests/lane-feed.spec.mjs
```

结果：对应单元测试已扩到 `31/31` 通过。  
再次检查 monitor 时，GLM 为 `running`，`inactive_seconds` 为 `0`；CH1 已收口，系统自动续派到 `AV1 回退素材验证包`。

**防复发**

- 以后看 GLM 是否卡住，必须同时看 current job、monitor state、inactive seconds、closeout marker，不能只看 tmux 是否活着。
- 旧 job 的终态必须能被 companion 自动回收，不能让历史脏状态继续污染看板。
- 真 stalled 以后由 lane-feed watchdog 催醒当前 job，不再无限 passive wait。

**后续观察**

- 继续观察 `glm-mnxxv3qs-q68uai / AV1 回退素材验证包` 的最终 closeout。
- 如果 watchdog 触发后仍无输出，再记录为新问题，而不是合并进本条。

### DL-2026-04-14-05：看板“最近完成”被旧文档兜底覆盖

**表象**

GLM 已经从 `CH1 镜头HUD协同证明包` 自动推进到 `AV1 回退素材验证包`，但看板里 “GLM 最近完成” 仍可能显示很早以前的 `Task 57 — Front-Door Boot Gate Contract`。

**影响**

- 用户看页面会以为 GLM 没有推进。
- 实际 job truth 是新的，但页面摘要还在展示旧的静态文档内容。

**根因**

`generate-dual-lane-board.mjs` 里 GLM 的 `latest_completed` 优先用了 `docs/DUAL_LANE_STATUS.zh-CN.md` 的历史兜底字段，再看 companion job truth。  
这和 Codex 卡片逻辑不一致，也违背“看板先展示真实 job 状态”的原则。

**处置**

- 调整 GLM 看板生成逻辑：`latest_completed` 优先读 companion 中最新 completed job，再退回静态文档。

**验证**

运行：

```bash
node scripts/generate-dual-lane-board.mjs
```

结果：看板 JSON 中：

```text
glm_current = AV1 回退素材验证包
glm_latest = CH1 镜头HUD协同证明包
staleRunningCompleted = 0
```

**防复发**

- 看板上的“当前任务 / 最近完成”必须以 companion job truth 为准，文档字段只做兜底，不做主真源。
- 看板生成和页面轮询从 2 秒降到 5 秒，保持可见刷新，同时减少 node 频繁启动和状态写入压力。

**后续观察**

- 如果页面仍出现旧任务，需要继续查前端缓存或浏览器刷新，而不是再怀疑 GLM job 本身。

### DL-2026-04-14-06：资源风险，feed 高频扫描历史 job 过重

**表象**

用户担心再次出现几十个 node、电脑卡顿和耗电。现场检查时没有出现无限 node，但能看到 feed 正在用 `dual-lane-companion refresh --limit 50` 扫历史 job，单次可能持续十几秒。

**影响**

- 虽然 feeder shell 是串行执行，不会自己无限并发堆 node，但单次扫描太重会让 CPU 短时间升高。
- 历史 job 越多，常规巡检越不应该全量扫。

**根因**

早期为了清理历史 dirty 状态，常规 feed 刷新窗口设得过大。这个值适合人工清账，不适合常驻 daemon 每 5/10 秒跑。

**处置**

- 清掉本轮排查留下的 `tail -f` 日志进程。
- `lane-feed` 常规 companion 刷新默认从 `50` 降到 `15`，并开放 `LANE_FEED_COMPANION_REFRESH_LIMIT` 环境变量按需调大。
- 看板生成和页面轮询已经从 2 秒降到 5 秒。
- feed 常驻频率降档：GLM 从 5 秒一次改为 20 秒一次，Codex 从 10 秒一次改为 60 秒一次。GLM 仍优先推进，但不再高频打 CPU。

**验证**

现场检查：

```text
node 进程数量：4
Vite / Playwright / Chrome 测试残留：无
看板 daemon：单实例，5 秒刷新
feed daemon：codex 10 秒串行，glm 5 秒串行
```

**防复发**

- 常驻 daemon 只做小窗口巡检。
- 大范围历史清理只能人工触发，不能放进高频 loop。
- 每次修 watch/feed/board 后都要看进程数量和 CPU。

**后续观察**

- 如果 `dual-lane-companion refresh` 单次仍超过 10 秒，再继续做索引化或增量刷新，而不是调大频率。

### DL-2026-04-14-07：blocked 素材任务混在 GLM 可执行队列里

**表象**

用户在看板里一直看到 `Task 41 — Approved Asset Catalog Boundary Pack / 已批准素材目录边界包`，以为 GLM 队列里总有这条任务。

**影响**

- 容易误解为 GLM 重复卡在 Task 41。
- 也容易误解为 Task 41 会被自动派发。

**根因**

Task 41 本身是 `blocked`，用于记录“第一批素材未完成来源、授权、风格和回退审批前，不允许 GLM 做 approved asset import”。  
但看板生成逻辑把 `blocked` 行也放进 GLM 主队列视图，导致 blocked register 看起来像 live queue。

**处置**

- 看板 GLM 主队列只展示 `in_progress / ready`。
- `blocked` 任务继续保留在文档里，作为治理记录，但不再混进主队列。
- Task 41 文案改成中文，明确“现在不是可执行任务”。

**验证**

运行：

```bash
node scripts/generate-dual-lane-board.mjs
```

看板 GLM 队列不再展示 Task 41，文档仍保留 blocked 记录。

**防复发**

- `blocked` 不能混入用户看到的“当前可执行队列”。
- 如果需要展示 blocked，应单独做“暂缓/需前置条件”区域。

**后续观察**

- 等资产审批流程真正完成后，Task 41 需要由 Codex 或任务捕获系统重新转成具体可执行小任务，而不是直接解封旧大包。

### DL-2026-04-14-08：GLM 等素材批准包，但 Codex 活队列没有生产任务

**表象**

用户追问 `Task 41 — 已批准素材目录边界包` 在等谁审批，以及 Codex 有没有对应任务。排查发现：Codex 已完成素材规则和交接模板类任务，但当前 live queue 没有一条真正负责产出第一批 `approved-for-import` 素材批准包的任务。

**影响**

- GLM 的 Task 41 会长期保持 blocked。
- 看起来像 GLM 停了，实际是上游 Codex 没有把“批准包生产”拆成可执行任务。
- 任务系统可能继续围绕 V3 其他可读性任务补货，却漏掉素材审批这条前置链路。

**根因**

`C69 / C70 / C75` 只完成了 intake matrix、治理边界和 handoff packet 模板。它们定义了“怎么批准、怎么交接”，但没有生成“拿当前候选或 fallback，产出第一批批准包”的活任务。  
Task 41 文档明确 GLM 必须等 Codex packet，但 Codex 队列没有对应 producer task。

**处置**

- 已确认 Task 41 不是 GLM 当前可执行任务。
- 已确认 Codex 当前 live queue 为空，没有素材批准包生产任务。
- 下一步需要补一条 Codex 可执行任务：先产出 `A1` 战场素材批准候选包，允许结果为真实素材候选、批准的 `S0 fallback`，或明确延期清单；GLM 只接这份 packet 之后的机械导入、manifest、fallback 和回归验证。

**验证**

现场检查：

```text
Codex lane-feed status: idle / queue_empty
Codex 看板队列：当前无 active Codex task
GLM Task 41: blocked，等待第一批素材完成来源、授权、风格和回退审批
```

**防复发**

- 任何 blocked 任务如果写明“等待另一个泳道产物”，必须同时存在 producer task。
- 规则/模板完成不能等同于产物完成。
- 自动补货需要识别 blocked prerequisite，并优先生成上游 producer task，而不是只生成同阶段的旁路任务。

**后续观察**

- 修任务补货逻辑时，要让 `Task 41 -> Codex approval packet producer -> GLM asset import task` 成为可追踪链路。

### DL-2026-04-14-09：Codex live queue 为空，但候选任务仍存在

**表象**

用户看到 GPT / Codex 没任务，追问是不是“没有可以生成的任务了”。现场检查发现 Codex live queue 为 `idle / queue_empty`，但 `docs/TASK_SYNTHESIS_CANDIDATES.json` 里仍有 V3 可执行候选任务，例如 PS2、PS3、CH1 证据复核。

**影响**

- 用户会误以为 Codex 已经没事可做。
- GLM 仍在跑时，Codex lane 可能空转，违背双泳道持续推进原则。
- V3 open blocker 仍有 7 个，却因为派发层空队列造成“看起来接近 V4”的错觉。

**根因**

候选任务生成、live queue 派发和防重复节流是三层逻辑。当前防重复提示为“最近已经生成过 V3.1 任务”，但没有保证“如果 live queue 为空且候选仍 ready，就至少派发一条最高优先任务”。  
也就是说，系统有候选，但没有把候选稳定推进到 Codex 可执行队列。

**处置**

- 已确认这不是 V3 已完成，也不是没有任务可生成。
- 当前需要补派发兜底：live queue 为空、候选存在、当前版本仍有 open engineering blocker 时，必须从候选里选最高分任务进入 Codex live queue。

**验证**

现场检查：

```text
Codex lane-feed status: idle / queue_empty
TASK_SYNTHESIS_CANDIDATES: 存在 ready 的 V3-PS2、V3-PS3、V3-CH1 候选
version-transition-orchestrator: V3 仍有 7 个 blocker，V3_TO_V4 是 preheat-not-needed-yet
```

**防复发**

- “最近生成过任务”不能阻止“空队列补派发”。
- 看板如果显示 Codex 空闲，必须同时说明是“真的无候选”还是“候选未派发”。
- V3 blocker 未清零时，Codex 不应因为 queue 空而显示成接近完成。

**后续观察**

- 修 `lane-feed / queue-refill / task-synthesis` 时，要把“候选存在但 live queue 为空”作为失败态处理。

### DL-2026-04-14-10：质量评分把真实缺口词误杀，任务生成提示还停在旧版本文档

**表象**

Codex live queue 一度为空，但 V3 仍有 open blocker；候选文件里存在 `PS3 开局解释层证据复核`、`V3-AV1` 相关任务，却没有稳定进入 live queue。

**影响**

- 用户看到 GPT / Codex 没任务，以为 V3 可能只剩 GLM 做完就能进 V4。
- `blocked-by-evidence-gap` 这类正常 closeout 术语被误解成“这个任务依赖外部审批，不能做”。
- `Task 41` 的上游批准包没有被自动生成，GLM 资产目录任务长期悬空。

**根因**

`task-quality` 早期把 `blocked`、`approval` 这类词统一降分，导致“当前 gate 是 blocked-by-evidence-gap”或“需要 approval handoff packet”的正常任务被挡掉。  
`task-synthesis` 的提示词还写着只读 V2 gate docs，即使当前版本已经是 V3，也容易让候选任务生成偏离当前版本文档。

**处置**

- `task-quality` 不再把 `blocked-by-evidence-gap` 或 `approval packet` 当成外部等待；只继续拦截真正的用户审批/等待用户/等待外部确认类任务。
- `task-synthesis` 的提示改为读取当前 milestone 的 gate docs，而不是硬编码 V2 文档。
- `queue-refill` 为 `V3-AV1` 增加 Codex producer：`V3 A1 第一批素材批准交接包`，用于产出 GLM Task 41 的上游 handoff packet。
- 现场已把 Codex 队列恢复为：`PS3 开局解释层证据复核` running，`V3 AV1 素材回退清单收口复核` ready，`V3 A1 第一批素材批准交接包` ready。

**验证**

运行：

```bash
node --test tests/task-quality.spec.mjs tests/task-synthesis.spec.mjs tests/queue-refill.spec.mjs tests/lane-feed.spec.mjs
node scripts/queue-refill.mjs --lane codex --apply --json
node scripts/generate-dual-lane-board.mjs
```

结果：48/48 测试通过；看板 Codex 队列恢复为 running + ready，不再显示“当前无 active Codex task”。

**防复发**

- “blocked-by-evidence-gap”表示当前工程缺口，不等于等待人。
- “approval packet”在 Codex lane 可以是合法 producer，不应被质量评分误杀。
- 任务生成提示必须跟随当前版本文档，不能硬编码上一版。

**后续观察**

- 后续若 Codex 队列再次为空，先看是否候选被质量评分或 same-title freeze 挡掉，再判断是否真的无任务。

### DL-2026-04-14-11：看板没有把 V4 预热和自动切换拆开显示

**表象**

用户关注“进入 V4 前的预热能不能自动启动，V4 能不能自动进入”。看板顶部只显示 V4 未开启，没有直接说明预热触发条件、当前是否达到阈值、切换是否会自动执行；同时顶部阶段 chip 还残留 `V2` 文案。

**影响**

- 用户只能看到“未开启”，看不到“为什么未开启”。
- 容易把正常的未触发误解成自动化失效。
- 也容易担心系统会盲目跳 V4。

**根因**

版本判定器已经能给出 `preheat-not-needed-yet / preheat-due / preheated-awaiting-closeout / cutover-ready`，但看板只把它压成下一阶段摘要，没有拆成用户关心的两件事：预热、切换。

**处置**

- 看板 JSON 增加 `transition_status`。
- 顶部当前目标卡片增加两行：`V4 预热`、`V4 切换`。
- 顶部阶段 chip 改为当前真实版本，不再硬编码 `V2`。

**验证**

现场生成看板后，顶部状态应能看到：

```text
V4 预热暂不启动：还剩 5 项工程阻塞，降到 1 项以内会自动启动。
V4 不会切换：当前版本还没收口。
```

**防复发**

- 版本自动化要展示“当前为什么不动”，而不是只显示未开启。
- preheat 和 cutover 必须拆开讲，一个是准备下一版，一个是正式切换。

---

## 历史回溯补录

### DL-HIST-01：把聊天窗口误当成持续后台 worker

**表象**

用户希望 Codex 在同一个聊天页面里一直跑到 M7 / V3 / V4，但页面在回复结束后进入等待下一条消息的状态。

**影响**

- 用户以为“我说继续，它就会一直干”，实际聊天 UI 没有后台执行。
- Codex 侧出现“口头说继续，页面实际停住”的信任问题。
- 后续不得不补 tmux worker、watch、feed、monitor、board 才能支撑长跑。

**根因**

Codex 聊天线程不是 daemon。  
它可以在一次响应里连续执行工具，但响应结束后不会自己继续思考或继续派任务。

**处置**

- 明确把“聊天 UI”和“后台 worker”分层。
- 用 `codex-watch` / `glm-watch` 作为长跑 runtime。
- 后续再引入 `dual-lane-companion` 把 runtime 里的工作升级为 job。

**验证**

过程验证来自实际运行：只有 tmux/watch/companion 能在聊天回复后继续存在，聊天线程本身不会自动继续。

**防复发**

- 不再承诺“这个聊天页自己不停跑”。
- 所有持续执行必须落到 watch / companion / feed / automation 中的真实机制。

**后续观察**

- 当前仍需继续收敛到 companion job truth，避免再靠聊天语义判断“有没有继续”。

### DL-HIST-02：watch 进程存在，被误读成 worker 在干活

**表象**

页面或终端显示 `codex-watch` / `glm-watch` session 存在，右上角或 status 显示 running，但 pane 长时间没有变化。

**影响**

- 用户看到 running，以为两条泳道正在推进。
- 实际上可能只是 tmux session 活着，里面没有当前任务、没有模型输出，或任务停在输入框。

**根因**

早期监控只看 runtime 存活或 pane 状态，没有把 job id、任务生命周期、closeout 绑定起来。

**处置**

- 建立 `dual-lane-companion.mjs`。
- 引入 job id、status、result、cancel。
- 后续 feed 和 board 逐步从 watch 状态切向 companion job truth。

**验证**

`docs/DUAL_LANE_COMPANION_MODEL.zh-CN.md` 已把状态分层写成：

```text
job truth > runtime monitor > queue docs > free-form terminal interpretation
```

**防复发**

- 看板和调度不能只展示 session alive。
- running 必须尽量指向一条可追踪 job，而不是一个活着的 terminal。

**后续观察**

- board 仍需继续减少对旧 queue/watch 混合推断的依赖。

### DL-HIST-03：queue、runway、task card 三套真相打架

**表象**

同一任务在顶部 live queue、后面的 task card、runway 文档里出现不同状态；有的地方像 `ready`，有的地方又写着依赖前置条件。

**影响**

- feed 可能从错误状态派发任务。
- 用户看到任务列表时无法判断哪些是真的可做，哪些只是候选。
- GLM 可能拿到未授权或不完整任务。

**根因**

早期把 planning、dispatch state、task scope 混写在同一批文档里，没有明确“谁是派发真相源”。

**处置**

- 规定 live queue 顶部表只管派发状态。
- task card 只管边界、allowed files、验证和 stop condition。
- runway 退回候选池，不直接等于可派发任务。

**验证**

`docs/TASK_CAPTURE_SYSTEM.zh-CN.md` 已写明四层结构：

```text
Master Backlog -> Lane Runway -> Live Queue -> Task Card
```

**防复发**

- feed 只读 live queue 顶表。
- 任务范围必须回到匹配 task card。
- 不允许用聊天记忆覆盖 queue 状态。

**后续观察**

- closeout 后 queue 顶表仍可能滞后，后续要继续加强 closeout -> queue sync。

### DL-HIST-04：fake ready 让队首任务看起来可派发，实际还缺批准

**表象**

某些任务被标成 `ready`，但备注里写着需要 asset approval、human decision、Codex sourcing 或其他前置条件。

**影响**

- GLM 可能被派去做不该由它判断的素材、产品方向或权限任务。
- 队列看起来有货，实际没有真 ready。

**根因**

`ready` 早期被当成“看起来像下一步”，而不是“现在就能安全派发”。

**处置**

- 收紧状态词：`ready` 只能表示真可派发。
- 依赖批准的任务必须是 `blocked` / `captured` / `candidate`。
- 典型例子：asset intake 类任务不能交给 GLM 自行 sourcing 或批准。

**验证**

`docs/TASK_CAPTURE_SYSTEM.zh-CN.md` 和 `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` 已记录 GLM 只能接 approved-for-import packet。

**防复发**

- queue-refill 不得为了补 floor 把低质量或缺批准任务硬塞成 `ready`。
- 任务评分必须先过硬门槛，再进入 live queue。

**后续观察**

- 素材类任务尤其要继续守住 Codex approval -> GLM import 的边界。

### DL-HIST-05：没有 queue floor，worker 完成后掉进空队列

**表象**

GLM 或 Codex 完成一个任务后，没有下一条真实 ready，feed 进程还在但没有任务可派。

**影响**

- 双泳道变成“跑一条停一条”。
- 用户需要不断手动说“继续”。
- worker 停止被误归因到模型懒或任务少，实际是补货系统失效。

**根因**

没有要求 closeout 前保证下一批任务数量。  
早期 queue-refill 只读有限 runway，runway 被 dispatch 到头后就断粮。

**处置**

- 引入 queue floor。
- queue-refill 在 live queue 低于 ready floor 时自动补货。
- task-synthesis 在有限 runway 耗尽时生成结构化候选。

**验证**

`docs/TASK_CAPTURE_SYSTEM.zh-CN.md` 已写明：

```text
如果一个 lane 完成 closeout 后，5 分钟内没有下一条真任务可派，
那不是 worker 问题，是任务捕获系统失效。
```

**防复发**

- 每条 lane 至少保留一批非冲突 ready。
- closeout 验收时同时看“下一条任务是否存在”。

**后续观察**

- V4/V5 以后要继续确保每个 active version 都有 fallback 和 runway，不只 V2/V3。

### DL-HIST-06：Codex 有自动续派，GLM 没有，双泳道不对称

**表象**

Codex 侧能继续触发下一条，GLM 完成后经常空转或等人工重新下任务。

**影响**

- 用户以为双泳道都在自动跑，实际只有一边闭环。
- GLM 无法承担高频窄任务的优势。

**根因**

早期自动 feed 只先做了一边，GLM watch 更像“可观察终端”，不是完整自动派发 lane。

**处置**

- 补 `glm-watch-feed.sh` / `glm-watch-feed-daemon.sh`。
- `lane-feed.mjs` 按 lane 统一处理 queue sync、refill、cooldown、dispatch。

**验证**

当前 `logs/glm-watch-feed-daemon.log` 会持续记录 GLM lane-feed 状态；`docs/TASK_CAPTURE_SYSTEM.zh-CN.md` 已把双边 feed 列入落点。

**防复发**

- 所有“连续运行”需求必须检查两条 lane 是否都有 feed。
- 不能只启动 monitor，不启动 feed。

**后续观察**

- GLM feed 遇到 stalled job 时仍需要更强自动恢复策略，目前先显式报告，不盲目重派。

### DL-HIST-07：自动任务生成重复派发，浪费 token

**表象**

同一类任务、同一批候选或相近标题反复被生成和派发，用户看到 token 被大量消耗。

**影响**

- GPT 流量消耗过快。
- 队列看起来热闹，但没有推进新的 gate。
- 重复任务会污染“最近完成”和候选队列。

**根因**

早期只防止“当前正在跑的任务”重复派发，没有防止“刚跑过、刚失败、刚生成过”的同题重复。

**处置**

- 增加 same-title freeze。
- 增加 recent synthesis freeze。
- Codex lane 加入任务间 cooldown。
- 任务候选进入 live queue 前必须经过质量评分和硬门槛。

**验证**

相关规则和评分落在：

- `docs/TASK_CAPTURE_SYSTEM.zh-CN.md`
- `scripts/lane-feed.mjs`
- `scripts/task-quality.mjs`
- `tests/lane-feed.spec.mjs`
- `tests/task-quality.spec.mjs`

**防复发**

- 自动生成可以继续，但只有高分、硬门槛通过、直接逼近当前 gate 的任务才能进 ready。
- 同标题或同 gate 的近期任务必须冻结一段时间。

**后续观察**

- synthesis prompt 仍需继续收窄，避免“搜索太散、终端噪音偏大”。

### DL-HIST-08：`running + completedAt` 脏状态污染续派

**表象**

某些 companion job 同时表现出 `running` 和 `completedAt`，系统可能以为还在跑，也可能误以为已完成。

**影响**

- lane-feed 不敢派下一条。
- 或者反过来，把旧完成状态误用于新任务。
- 队列状态和 job truth 互相污染。

**根因**

作业生命周期恢复逻辑不完整。  
旧终端输出、重启后的 session log、closeout marker 和 job state 没有严格绑定。

**处置**

- companion 增加脏状态恢复。
- 当前 job 完成必须看到匹配 `JOB_COMPLETE: <job-id>`。
- session 重启后，旧 running job 会被标成 interrupted / needs_reroute。

**验证**

相关覆盖在 `tests/dual-lane-companion.spec.mjs`，包括：

- recovered completion 必须有匹配 job marker。
- stale completedAt 不能当成当前完成。
- 旧 log 的 running job 会被 retired。

**防复发**

- job lifecycle 必须优先于 terminal 文本。
- 不再靠泛化 `READY_FOR_NEXT_TASK` 或“verification passed”判断完成。

**后续观察**

- closeout parser 还要继续增强 result block 提取和 queue sync。

### DL-HIST-09：`cutover-ready` 了，但没有真正进入下一版

**表象**

系统已经判断 `V2 -> V3` 可以切换，但 active milestone 仍停在 V2。

**影响**

- 用户看到“为什么还没进入 V3”。
- 队列仍可能按旧版本补货。
- 后续模板和实际 active version 发生错位。

**根因**

之前只有判定器，没有执行器。  
`version-transition-orchestrator` 只能说“可以切”，不会真的更新 runtime state、清旧队列、播种新队列。

**处置**

- 增加 `docs/VERSION_RUNTIME_STATE.json`。
- 增加 `scripts/version-cutover.mjs`。
- `lane-feed` 在 Codex lane 检测到 cutover-ready 时可以执行单步 cutover。

**验证**

`docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md` 已记录该问题；`tests/version-cutover.spec.mjs` 覆盖单步切换。

**防复发**

- “能切”和“已经切”必须分层。
- 面板必须读 runtime state，不读旧文案。

**后续观察**

- V3 -> V4 要复用同一套 active milestone -> next milestone 单步切换规则。

### DL-HIST-10：担心 V3 后自动连跳 V4，缺少单步状态机

**表象**

用户担心修好自动切换后，系统会从 V3 直接继续自动进入 V4。

**影响**

- 自动化如果没有边界，会让版本推进失控。
- 用户无法异步插入判断和反馈。

**根因**

早期没有明确“每次只能从当前 active milestone 切到下一版”的硬规则。

**处置**

- `version-cutover` 只允许当前 active milestone -> next milestone。
- 切完后必须重新基于新版本自己的 gate 文档计算状态。

**验证**

`docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md` 第 08 条已记录；`tests/version-cutover.spec.mjs` 覆盖不连跳。

**防复发**

- 禁止 while-loop 式连续切版。
- 每一版必须独立 closeout 后才能再进入下一版。

**后续观察**

- 后续 V4/V5 切换时要继续检查 runtime state 是否只走一步。

### DL-HIST-11：`user-open` 被误当成工程阻塞项

**表象**

工程证据已闭合，但系统仍因为“需要用户确认”停住，不进入下一步。

**影响**

- 用户离开时项目无法继续推进。
- 异步反馈被错误地当成同步审批。

**根因**

把用户主观判断、工程 blocker、conditional residual 混成同一类 gate。

**处置**

- 明确 `user-open` 是异步判断，不阻塞工程主线。
- 用户可以后续插入任务或反馈，但工程 cutover 不再因此停住。

**验证**

`docs/PROJECT_OPERATING_MODEL.md` 已记录：

```text
user-open means async human judgment still welcome, not block the next stage.
```

**防复发**

- oracle 输出必须区分 engineering blocker、conditional、userDecisionPending。
- 页面给用户看的话术不能写成“等你确认才能继续”，除非真是不可替代的权限/素材/法律判断。

**后续观察**

- release、素材、审美类判断仍可能是真 human gate，需要逐类区分。

### DL-HIST-12：看板读旧常量和工程术语，导致用户看不懂真实状态

**表象**

仓库已切到新状态，但 board 还显示旧版本；页面上出现“门禁”“壳层”“前门”“收口”等工程词，用户无法快速判断到底在干什么。

**影响**

- 用户不信任看板。
- 任务状态、最近完成、当前阶段都要回聊天里问。

**根因**

board 早期混读 queue docs、watch pane、monitor json 和旧常量，没有统一读 oracle/runtime state。  
同时工程文档语言直接上了用户面板。

**处置**

- board 逐步改成从 milestone oracle、transition report、companion job、queue 状态生成。
- 页面话术改成用户能懂的短句。
- 最近完成限制条数、补时间戳、增强去重。

**验证**

`docs/WAR3_RE_DUAL_AI_RETROSPECTIVE.zh-CN.md` 已记录相关坑；`public/dual-lane-board.json` 由 `scripts/generate-dual-lane-board.mjs` 生成。

**防复发**

- 用户面板必须读系统真值。
- 用户面板不能直接复制工程术语。

**后续观察**

- board 仍应继续收敛到 companion job truth，避免多源拼接漂移。

### DL-HIST-13：最近完成卡片忽隐忽现

**表象**

某个完成项刚显示在“最近完成”，刷新一会儿又消失。

**影响**

- 用户以为任务完成记录丢了。
- closeout 可信度下降。

**根因**

closeout 聚合来源不稳定，去重和排序规则不统一；有时读 queue，有时读 companion，有时读 board 聚合。

**处置**

- 限定最近完成展示条数。
- 增加更新时间戳。
- 统一从更稳定的 closeout/job/queue 状态聚合。

**验证**

已在复盘文档中记录为监控和可视化类问题；board 生成器已多次调整。

**防复发**

- 完成项必须有稳定 id 或标题+时间去重。
- “最近完成”只展示最近 3 条，不再滚动污染用户判断。

**后续观察**

- 后续应把 latest completed 完全切到 companion result，而不是混合推断。

### DL-HIST-14：node 进程堆积导致内存、电量异常

**表象**

用户看到电脑卡顿、电量快速消耗、几十个 node 进程，占用大量内存。

**影响**

- 本地开发环境不可用。
- 用户需要重启电脑。
- 对自动化系统失去信任。

**根因**

常驻 daemon、board server、Vite/Playwright/runtime/browser 进程同时存在，缺少总量治理和统一清理策略。

**处置**

- 收缩常驻进程。
- 强调 node 要小心，不允许为了“实时”无限起进程。
- 引入 cleanup 脚本和 runtime lock hardening。

**验证**

`docs/WAR3_RE_DUAL_AI_RETROSPECTIVE.zh-CN.md` 已把它记录为资源治理问题。

**防复发**

- 自动化是成本中心，不是免费能力。
- 监控刷新频率、常驻 daemon 数量、浏览器残留都必须有上限。

**后续观察**

- 后续每次启动本地面板或 runtime 测试后，都要确认没有残留 Vite / Playwright / Chrome / Node 风暴。

### DL-HIST-15：runtime lock 和浏览器残留导致两条 lane 抢测试资源

**表象**

Codex 和 GLM 同时跑 runtime / Playwright 时，可能互相抢锁、误删锁、重复启动 headless 浏览器。

**影响**

- 测试结果不可信。
- 本地资源暴涨。
- 一个 worker 的 cleanup 可能影响另一个 worker。

**根因**

runtime lock 早期没有正确处理“lockdir 已创建但 pid 还没写入”的初始化窗口。  
清理脚本对 stale lock 的判断过激。

**处置**

- runtime lock hardening：无 pid 的 fresh lock 先给宽限期。
- 只有超过宽限时间仍无 pid，才按 stale lock 清理。
- 运行后执行 cleanup 并查残留进程。

**验证**

历史修复分支曾记录为 runtime lock hardening；复盘文档也把它列入资源治理类问题。

**防复发**

- 并发 runtime 测试必须先过锁。
- cleanup 不能误删正在初始化的锁。

**后续观察**

- 后续如果再出现 Playwright/Vite/Chrome 残留，要直接补进本台账的新条目。

### DL-HIST-16：心跳自动化被当成可靠持续执行器

**表象**

用户看到 automation 的 next run 时间，但 `last_run_at` 为空，或到了预期时间没有回复；用户怀疑 18:40 / 18:52 的触发被吃掉。

**影响**

- 用户以为“定时回来推进”已经成立，实际没有可见执行。
- Codex/GLM 的持续工作又回到不透明状态。

**根因**

heartbeat automation 是提醒/入口，不应被当成唯一执行器。  
它可能受平台调度、线程状态、UI 触发、RRULE 支持范围影响。真正长跑必须落到本地 worker/feed。

**处置**

- 把权威连续执行机制改回 tmux-backed worker pair。
- operating model 里明确 heartbeat automation 是 advisory，不是唯一执行来源。

**验证**

`docs/PROJECT_OPERATING_MODEL.md` 已记录：

```text
Heartbeat automations are advisory only.
The authoritative continuous-execution mechanism is the tmux-backed worker pair.
```

**防复发**

- 以后不能只靠 automation 证明“正在持续干活”。
- 页面必须能看到 watch/feed/job 的真实进展。

**后续观察**

- 如果继续使用 automation，要把触发结果写入可观察日志，不再只看 UI 的 next run。

### DL-2026-04-14-12：版本解析只认识 V2/V3 结论列，后续阶段可能误判已收口

**表象**

在检查 V3->V4、V4->V5 以及后续自动切换链路时，发现里程碑解析器只显式读取 `当前 V2 结论`、`当前 V3 结论` 和 `当前结论`。如果 V4/V5 模板自然写成 `当前 V4 结论` 或 `当前 V5 结论`，系统可能读不到 blocker 定义。

**影响**

- 后续阶段可能把真实 open blocker 误判为不存在。
- 预热和切换判断会建立在错误 blocker count 上，存在提前进入下一版本的风险。
- 看板也会跟着显示错误的“当前还差什么”。

**根因**

V2->V3 时的字段名被写进了解析逻辑，没有抽象成“当前 Vn 结论”。

**处置**

- `milestone-oracle` 改为识别任意 `当前 V数字 结论` 列。
- 补 V4 模板回归，证明 `当前 V4 结论` 能正确产生 blocker / conditional blocker。
- 同步把任务生成和预热 prompt 里的 V2/V3 示例改成当前 milestone / transition，避免后续生成任务时被旧示例带偏。

**验证**

新增/更新回归覆盖：

- V4 remaining gates 中的 `当前 V4 结论` 会被识别。
- V4->V5 transition 会进入 `preheat-due`，不会依赖 V2/V3 口径。
- V4->V5 preheat prompt 不再出现 `PREHEAT-V2_TO_V3-01` 或 V3 示例标题。

**防复发**

- 后续新增 V5/V6/V7/V8 模板时，表头可以自然使用 `当前 Vn 结论`，解析器必须统一处理。
- 任何 prompt 示例都不能固定成 V2/V3，必须从当前 oracle / transition 动态生成。

**沉淀位置**

- `docs/WAR3_RE_DUAL_AI_RETROSPECTIVE.zh-CN.md`：已作为“版本切换标准化”重点复盘。
- `docs/DUAL_AI_PROJECT_BASELINE.zh-CN.md`：已抽象成未来双 AI 中型项目的 P8 版本收口与切换硬规则。
- `docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md`：保留细节过程与本次修正链路。

### DL-2026-04-14-13：V3 收口后双泳道空转，V4 预热没有接棒

**表象**

Codex / GLM 都显示没有可派发任务，用户看到两条泳道停住；同时版本仍停在 V3，没有进入 V4，也没有稳定启动 V4 预热。

**影响**

- 用户看到“任务结束”，但系统没有自动推进下一阶段。
- 旧候选任务继续占住候选库存，导致 live queue 为空却不触发预热。
- 如果当前版本已经工程收口但下一版模板缺失，系统会停在 `cutover-blocked`，而不是自动补模板。

**根因**

1. `TASK_SYNTHESIS_CANDIDATES.json` 里的同名任务已经完成，但 `task-synthesis` 仍把它算作可用候选库存。
2. `lane-feed` 只有在 `no_adjacent_tasks` 时才会触发 preheat；遇到“候选库存存在但已耗尽”时不会接棒。
3. `version-preheat-runner` 只接受 `preheat-due`，不接受 `cutover-blocked`，导致“当前版本已收口但下一版模板缺失”时也不会补模板。
4. 队列表格行被清掉后，匹配的任务卡片仍可能停在 `active`，看板和文档给人假进行中的错觉。

**处置**

- `task-synthesis` 增加同名候选最近完成/失败/中断识别；这种候选不再计入可用库存，而是返回 `candidate_stock_exhausted`。
- `lane-feed` 把 `candidate_stock_exhausted` 视为“当前版本无可继续相邻任务”，可以启动下一版本预热。
- `lane-feed` 在 `cutover-blocked` 且缺下一版本模板时，也会派发 preheat candidate refresh 或 preheat task。
- `lane-feed` 同步最近完成任务时，即使队列表格没有该行，也会把匹配任务卡片状态改成 `done` / `completed`。
- V3-AV1 根据现有证据从 `conditional-open` 重分类为 `allowed-residual`：真实素材仍不批准、不导入，但 fallback/catalog/no-import 边界已经满足 V3 工程收口。

**验证**

新增回归覆盖：

- 已完成的同名 synthesis candidate 不再阻塞候选刷新。
- 当前任务候选耗尽后会触发下一版本预热。
- 当前版本已收口但下一版模板缺失时，也会补 transition pack。
- 缺表格行的完成任务卡片会被同步成完成状态。

**防复发**

- “候选存在”不等于“可派发”；必须同时检查最近同名执行历史。
- “预热”不只发生在 closeout 前；closeout 后发现模板缺失也必须能补。
- 看板状态、队列表格、任务卡片和 companion job 状态必须同步，不能只更新其中一层。

### DL-2026-04-14-14：状态命令显示 running，但对应任务实际已完成

**表象**

Codex 预热任务已经写出 `JOB_COMPLETE`，`dual-lane-companion refresh` 也能识别为 completed，但 `./scripts/codex-watch-feed.sh status` 仍显示旧的 running 状态。

**影响**

- 用户看到“还在跑”，实际派发器可能已经可以接下一条任务。
- 排查时容易误判为 Codex/GLM 卡住。
- `status --all --json` 曾输出完整终端日志，导致一次状态读取消耗大量 token。

**根因**

`lane-feed status` 只读上一次写入的 feed 状态文件，不会用 companion job 文件刷新缓存；同时 companion 的列表 JSON 直接返回完整 job 对象，包含超长 `resultText` 和 `progressPreview`。

**处置**

- `lane-feed status` 读取 cached running 状态时，会按 job id 或 task title 查 companion job；如果任务已经 completed / interrupted / blocked，就把 feed 状态改成 `tracked_job_settled`。
- `lane-feed` 派发 preheat refresh / preheat task 时记录 `jobId`，后续状态刷新可以精确对应任务。
- `dual-lane-companion` 的列表 JSON 改成瘦身对象，只保留 id、lane、title、status、summary、时间和 monitor 状态，不再带完整日志。
- companion 列表刷新跳过不可解析的临时/空 job 文件，避免状态读取被半写入文件打断。

**验证**

新增回归覆盖：

- cached running 状态对应的 companion job 已完成时，`printStatus` 会返回 `tracked_job_settled`。
- 没有 jobId、只有 taskTitle 的 preheat dispatch 状态，也能回查最新同名 job 并清掉 stale running。
- companion 列表输出不包含 `resultText` / `progressPreview`，避免重复吞日志。

**防复发**

- 状态页要读“当前事实”，不能只读上一次缓存。
- 列表接口只给摘要，完整日志只能通过单个 job result 显式查看。
- 派发动作必须记录 jobId；没有 jobId 时才降级用 task title 查最近任务。

### DL-2026-04-14-15：V4 证明包尚未完成，Codex 复核任务抢跑

**表象**

V4 任务生成后，系统同时把 GLM 的 `P1 开局压力证明包` 和 Codex 的 `P1/R1 证据收口复核` 放进 live queue。GLM 的证明包是正确任务，但 Codex 复核在证明包完成前被派出，属于抢跑。

**影响**

- Codex 会消耗 GPT 去复核不存在的证据。
- 看板会显示 Codex / GLM 都在做 V4，但实际顺序错误。
- 后续可能把 `insufficient-evidence` 写成假的收口结论，或者继续生成重复复核任务。

**根因**

1. task synthesis 只知道“这个 gate 还 open”，不知道“复核任务必须等证明任务完成”。
2. queue refill 会把结构化 Codex candidate 直接提升为 `ready`，没有检查前置 GLM proof 是否完成。
3. lane feed 派发普通任务后，状态文件写成 `ready/dispatched`，不是 `running + jobId`，取消后也不容易准确同步。
4. `dual-lane-companion cancel --json` 返回完整终端片段，取消一个错误任务也会吞大量 token。

**处置**

- 已取消错误派出的 Codex `P1 压力路径证据收口复核` 和 `R1 恢复反打证据收口复核`；GLM `P1 开局压力证明包` 保持运行。
- Codex 三条 V4 复核任务在 live queue 中改为 `blocked`，分别等待对应 GLM 证明包完成。
- synthesis candidate 支持 `requiresCompletedTaskTitle`；复核候选必须声明前置证明任务。
- queue refill 提升 Codex candidate 前会检查 GLM 队列表中对应任务是否 `completed/done`。
- lane feed 普通派发也记录 jobId，并在 `status` 中按 task title 刷新已取消 / 已完成任务。
- companion cancel 的 JSON 输出改为摘要对象，不再返回完整终端日志。

**验证**

新增回归覆盖：

- Codex 复核 candidate 在 GLM 前置 proof 未完成时不会进入 ready。
- GLM 前置 proof 完成后，对应 Codex 复核 candidate 才能提升。
- 普通 dispatched 状态能按 task title 刷新为 settled。
- synthesis prompt 明确要求 proof review 写 `requiresCompletedTaskTitle`。

**防复发**

- “同一个 gate 的证明任务”和“复核任务”不能同批无条件进入 ready。
- 证明先跑，复核后跑；否则就是浪费 token。
- 所有派发状态都必须能追到 companion job，而不是只记录一行文字。

### DL-2026-04-14-16：proof 读旧 `g.units`，把测试假失败误判成机制失败

**表象**

GLM 的 `R1 恢复反打证明包` 长时间卡在“训练 worker 后仍然只有 2 个 worker”。终端持续有输出，所以普通 stalled 检测没有报警。

**影响**

- GLM 在同一个假失败上反复改测试、重复跑 runtime，浪费时间和算力。
- 容易把测试写法问题误判成 `Game.ts` 训练系统或经济系统问题。
- 用户看到 GLM running，但实际进展质量很低。

**根因**

测试在 `page.evaluate` 里缓存了 `const units = g.units`。但 `Game.handleDeadUnits()` 会把 `this.units` 重赋为过滤后的新数组；后续训练出的单位进入新的 `g.units`，旧数组引用看不到新单位。

**处置**

- R1 proof 改为在死亡清理、训练、重建后重新读取 `g.units`。
- `lane-feed` 派发 prompt 新增 runtime proof safety：杀单位、换图、训练或触发清理后，不得继续用旧 `const units = g.units` 快照当 proof。
- 失败时先检查 proof 是否读旧 state / 旧 DOM，再考虑改游戏机制。

**验证**

- `tests/v4-recovery-counter-proof.spec.ts` 5/5 pass。
- `tests/lane-feed.spec.mjs` 覆盖派发 prompt 必须包含 stale-state safety 规则。

**防复发**

- runtime proof 不能把 mutable game state 缓存成长期真相。
- 对“机制不成立”的判断必须先排除测试读旧状态。

### DL-2026-04-14-17：GLM 已更新队列为 completed，但 companion 仍显示 running

**表象**

R1 证明包已经 5/5 通过，`docs/GLM_READY_TASK_QUEUE.md` 也被更新为 `completed`，但 companion job 仍是 `running`，因为没有看到精确 `JOB_COMPLETE` 行。

**影响**

- 已完成任务继续占住泳道，下一条 E1 不会自动派发。
- 看板会显示“还在跑”，用户无法判断真实进展。
- 自动化过度依赖单一终端标记，缺少队列源文件兜底。

**根因**

`dual-lane-companion refresh` 只从终端日志识别 `JOB_COMPLETE` / `JOB_BLOCKED`，没有回读 live queue 的同名任务状态。

**处置**

- `dual-lane-companion` 新增队列源文件恢复逻辑：running job 如果同名队列表行已经是 `completed` / `done`，刷新时恢复为 completed。
- 列表 JSON 仍保持瘦身输出，避免再次吞完整日志。
- 恢复后 `glm-watch-feed check` 正常派发 `E1 胜负结果证明包`。

**验证**

- `tests/dual-lane-companion.spec.mjs` 覆盖从队列表读取 completed 行，以及 running job 从 queue source-of-truth 恢复为 completed。
- 现场刷新后 `R1 恢复反打证明包` 变为 completed，`E1 胜负结果证明包` 自动进入 running。

**防复发**

- 终端 closeout marker 是首选，但不是唯一事实来源。
- 任务状态至少要能从 companion job、队列表格和任务卡片三层互相恢复。

### DL-2026-04-14-18：历史 cancelled 任务覆盖已完成 closeout

**表象**

Codex 曾取消过抢跑的 `R1 恢复反打证据收口复核`。后来 R1 证明包完成并被 Codex 复核为 `done`，但一次 feed/status 同步又把同名任务打回 `blocked`。

**影响**

- 用户会看到“刚收口的任务又没了/又 blocked 了”。
- 当前事实被历史取消记录覆盖，导致看板和队列反复抖动。
- 可能让系统误以为 R1 还不能收口，从而阻塞 V4->V5 预热判断。

**根因**

`lane-feed syncLaneQueue` 处理取消历史时优先级过高：只要 companion 里有同名 `cancelled` job，就把队列表行和任务卡片改成 `blocked`，没有先判断当前队列是否已经是 `done/completed`。

**处置**

- `lane-feed` 新增 completed 状态优先级：队列表或任务卡片已经是 `done/completed` 时，历史 `cancelled` 不能覆盖它。
- 取消记录仍会保护 active/ready/current 的同名任务，避免抢跑任务被再次派发。

**验证**

- `tests/lane-feed.spec.mjs` 新增“old cancelled attempt 不覆盖 completed queue truth”回归。
- 现场 R1 Codex 复核重新保持为 `done`。

**防复发**

- 状态优先级固定为：当前完成证据 > 当前运行事实 > 历史取消/失败。
- 历史取消只用于防止误派发，不能推翻后来的收口结论。

### DL-2026-04-14-19：已到下一版本预热阈值，但 synthesis 冷却挡住预热

**表象**

V4 只剩 `V4-E1` 一个工程 blocker，`V4_TO_V5` 已经是 `preheat-due`，但 Codex feed 仍显示 queue empty / synthesis skipped，没有启动 V5 预热。

**影响**

- GLM 在跑最后一个 V4 blocker 时，Codex 没有并行准备 V5。
- 阶段切换会等到最后一刻才补模板，容易再次出现“完成当前版本但下版材料缺失”的停顿。

**根因**

`lane-feed` 只有在“当前 milestone synthesis 证明没有相邻任务”后才触发 preheat。若 synthesis 因最近执行冷却而 skipped，即使 version orchestrator 已经判定 `preheat-due`，也不会进入预热。

**处置**

- `lane-feed` 在 live queue 无可派发任务时，先直接读取 version transition report。
- 如果当前 transition 已经 `preheat-due`，Codex 立即派发 next-version preheat task 或 candidate refresh，不再被当前版本 synthesis 冷却挡住。
- 保留原规则：如果当前版本仍有可派发的真实任务，优先做真实任务，不抢跑预热。

**验证**

- `tests/lane-feed.spec.mjs` 新增“transition threshold reached 时直接派发 preheat”的回归。

**防复发**

- N+1 预热由版本状态触发，不依赖当前版本任务生成器是否刚运行过。
- synthesis 冷却只能限制同类候选生成，不能阻止版本交接准备。

### DL-2026-04-14-20：E1 proof 绿了，但覆盖面和真实路径不够

**表象**

GLM 的 `E1 胜负结果证明包` 显示 5/5 pass，并把队列表写成 completed。  
但 Codex 复核测试文件后发现两处问题：

- `stall` 结果没有被实际触发，只被记录成未覆盖。
- return-to-menu 测试没有点击真实结果页按钮，而是在测试里手动隐藏 results / pause DOM。

**影响**

- 如果直接把 E1 写成 pass，会把“不完整 proof”当成工程收口。
- V4_TO_V5 可能被错误放行，后续再发现结果闭环不真实。
- 用户看到“已通过”，但实际证据没有覆盖 gate 原话里的 timeout/stall 和真实 return path。

**根因**

GLM 更适合快速写 bounded proof，但它会倾向于让当前测试通过；Codex 复核如果只看 pass 数字，不看 proof 是否等价于产品路径，就会放过假绿。

**处置**

- Codex 接管 E1 proof 复核，把 `tests/v4-ending-result-truth-proof.spec.ts` 加强为 6/6：
  - defeat。
  - victory。
  - stall / timeout。
  - summary 全量字段和真实 `g.units` state 对齐。
  - 点击真实 results shell 返回按钮。
  - no-fake-label 扫描。
- 更新 V4 remaining gates、evidence ledger、Codex queue、GLM queue，把 E1 写成 engineering-pass，同时保留 V4-UA1 人眼判断。

**验证**

运行：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v4-ending-result-truth-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

结果：

```text
tests/v4-ending-result-truth-proof.spec.ts 6/6 passed
```

**防复发**

- closeout 不能只看 `N/N passed`，必须审 proof 是否覆盖 gate 原话。
- 如果测试自己模拟生产路径的后置清理，不能算真实 product path proof。
- gate 里写了 win / lose / timeout-stall，就必须实际触发，除非把缺口保留为 blocker。

### DL-2026-04-14-21：V5 runway 人能读，但机器播种会漏任务或重复任务

**表象**

V4_TO_V5 已经 cutover-ready，V5 Codex/GLM runway 文件也存在，但进一步检查发现：

- Codex runway 的章节标题不是 `queue-refill` 识别的 `### Task Cxx: ...` 形状。
- GLM runway 只有 seed 表格，没有 `## Task xx — ...`、`Goal:`、`Write scope:`、`Must prove:` 结构。
- synthesis 又生成了一条 `ECO1 经济产能主链证明包`，和已经 in_progress 的 `Task 101 — ECO1 经济产能主链证明包` 语义重复。

**影响**

- cutover 表面成功，但 live queue 可能没有真正播种 runway 任务。
- 同一个 gate 可能被两个不同标题重复派发，浪费 GLM / GPT token。
- 用户会看到“进入 V5 了”，但双泳道仍可能断供或重复跑。

**根因**

runway 文档先按人类可读写法生成，缺少机器解析格式约束；`queue-refill` 去重只看标题，不看 gate / proof 语义，因此不能识别 “Task 101 — ECO1...” 和 “ECO1...” 是同一件事。

**处置**

- V5 Codex runway 增加可解析的 `### Task C88: ...` 到 `### Task C91: ...` seed 段落。
- V5 GLM runway 增加可解析的 `## Task 101 — ...` 到 `## Task 103 — ...` seed 段落。
- `queue-refill` 支持解析 `**Must satisfy:**`。
- `queue-refill` 新增同 gate 语义去重：非终态队列里已有 ECO1/TECH1/COUNTER1 任务时，不再提升另一个同 gate 标题。
- completed prerequisite 判断允许 `Task 101 — ECO1 ...` 与 `ECO1 ...` 这种前缀/后缀等价。
- 清掉 GLM queue 中重复的 `ECO1 经济产能主链证明包` ready 行和卡片。

**验证**

- 手动解析 V5 runways：Codex 4 个 seed、GLM 3 个 seed 都可被 `queue-refill` 读取。
- `tests/queue-refill.spec.mjs` 新增 same-gate duplicate 回归和 `Must satisfy` 解析回归。

**防复发**

- runway 不是只给人看的文档，也必须符合自动播种 parser。
- 队列去重不能只看标题，至少要按 gate 语义去重。
- synthesis 产生的候选必须让位给已经 running/ready 的同 gate runway 任务。

### DL-2026-04-14-22：复核任务抢跑 GLM proof，导致 Codex 空转消耗

**表象**

V5 的 Codex 复核任务 `C90 — TECH1...` 和 `C91 — COUNTER1...` 是“审 GLM proof”的任务，但在 `Task 102` / `Task 103` 仍为 `ready`、对应 focused spec 尚不存在时被派发。  
结果 Codex 只能写出 `blocked-by-pending-proof`，这不是有效 closeout，而是重复确认“还没轮到复核”。

**影响**

- GPT token 被用在没有上游证据的复核上。
- V5 gate 文档会出现“复核完成但 proof 缺失”的噪音。
- 后续真正 GLM proof 完成后，还需要再生成新复核任务，增加队列复杂度。

**根因**

V5 runway 已写了 `Requires completed GLM proof`，但 parser 没把它变成机器可执行的 prerequisite；`lane-feed` 派发 ready 任务时也没有检查 task card 里的 prerequisite 是否已 completed。

**处置**

- `queue-refill` 解析 Codex runway 的 `Requires completed GLM proof` / `Prerequisite` 字段，并写入 live task card。
- `lane-feed` 派发前读取 task card 的 prerequisite。
- prerequisite 会同时查 Codex / GLM 队列表的 completed/done 状态，并支持 `Task 102 — ...` 与短标题后缀等价。
- prerequisite 未满足时，lane feed 返回 `prerequisite_wait`，不派发、不合成新任务、不浪费一次空复核。

**验证**

- `tests/lane-feed.spec.mjs` 新增“review task waits for completed prerequisite”回归。
- `tests/queue-refill.spec.mjs` 新增 V5 gate duplicate 和 completed same-gate proof 不复活回归。
- 本轮 `node --test tests/queue-refill.spec.mjs tests/lane-feed.spec.mjs` 51/51 passed。

**防复发**

- 复核类任务必须有机器可执行 prerequisite，不再靠人读任务说明。
- “ready” 只表示任务卡可用，不表示所有上游证据已到位；派发前必须再过 prerequisite。
- 如果一个任务只是确认上游 proof 不存在，不能算有效 closeout。

### DL-2026-04-14-23：pending proof 没被算作 blocker，导致 V6 过早预热

**表象**

V5 仍有三条战略骨架工程 gate：

- `V5-ECO1` 是 `blocked / partial-proof`
- `V5-TECH1` 是 `blocked-by-pending-proof`
- `V5-COUNTER1` 是 `blocked-by-pending-proof`

但 `milestone-oracle` 只把 `blocked`、`open`、`insufficient-evidence` 这类少数字面状态算作工程阻塞，没把 `blocked-by-pending-proof` 算进去。  
结果 `version-transition-orchestrator` 误判 V5 只剩 1 个 blocker，触发 `V5_TO_V6` 预热，Codex 又开始生成 V6 transition pack。

**影响**

- 用户看到“GLM/Codex 都结束了但没进下一阶段”，实际系统在错误地准备下一阶段。
- V6 preheat 会提前消耗 GPT token。
- 页面显示“V6 已到预热条件”，但真实 V5 还没接近收口。

**根因**

状态词判定太窄，只识别少量固定词，没有把项目里已经使用的工程未收口状态统一归类。  
尤其是 `blocked-by-pending-proof` 语义上就是 blocker，但机器把它当成非阻塞状态。

**处置**

- `milestone-oracle` 新增统一的 open-engineering-status 判断。
- 以下状态现在都会阻塞工程 closeout：
  - `open`
  - `conditional-open`
  - `preheat-open`
  - `blocked`
  - `blocked-*`
  - `partial-proof`
  - `insufficient-evidence`
  - `pending-proof`
  - `evidence-gap`
  - `proof-missing`
  - `*-missing`
- `lane-feed` 的 preheat 文案改用真实 `blockerCount`，不再显示 `undefined engineering blocker(s)`。

**验证**

- `node --check scripts/milestone-oracle.mjs scripts/lane-feed.mjs scripts/version-transition-orchestrator.mjs scripts/version-preheat-runner.mjs` 通过。
- `node --test tests/milestone-oracle.spec.mjs tests/version-transition-orchestrator.spec.mjs tests/lane-feed.spec.mjs tests/version-preheat-runner.spec.mjs` 54/54 passed。
- 真实仓库 `node scripts/milestone-oracle.mjs --json` 显示 V5 当前 open blockers 为 `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1`。
- 真实仓库 `node scripts/version-transition-orchestrator.mjs --json` 显示 `V5_TO_V6` 为 `preheat-not-needed-yet`，原因是 V5 仍有 3 个工程阻塞，高于阈值 1。
- 真实仓库 `node scripts/version-preheat-runner.mjs dispatch-task --json` 返回 `not_preheat_due`，不会继续派 V6 预热任务。

**防复发**

- 阶段进阶不再依赖单个英文状态词，而是统一按“是否还缺工程证据”归类。
- 新增状态词时，必须同步 oracle 测试；否则不能进入自动调度链。
- `blocked-by-pending-proof` 这类“等上游 proof”的状态必须阻塞 cutover，也必须阻塞 preheat 阈值判断。

### DL-2026-04-14-24：V5 TECH1 窄证明被误读成“有人族科技线”

**表象**

用户试玩后指出：当前游戏里实际没有其他兵种和科技，只有农民、步兵、基础建筑和塔。  
但 V5 文档已经把 `V5-TECH1` 写成 `engineering-pass / blocker-cleared`，容易让系统和用户误以为“人族科技骨架已经成立”。

**影响**

- V5 可能在没有玩家可见新人族单位/科技线的情况下继续向 V6 预热或切换。
- GLM/Codex 后续任务可能继续围绕抽象 proof 打转，而不是补 Rifleman、Blacksmith、Long Rifles 这类玩家能看见的内容。
- 用户体验上会出现“文档说有科技，进游戏却没有科技”的信任断层。

**根因**

`V5-TECH1` 的 focused proof 范围太窄，只证明了 `TH -> gather -> Farm -> Barracks -> Footman` 的资源、人口、建筑前置和训练顺序。  
这对工程合同有价值，但不足以支撑玩家对“人族科技/兵种线”的期待。

**处置**

- 新增 `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`，完整列出人族单位、英雄、建筑、科技、素材需求和可执行切片。
- 在 V5 gate / ledger 里新增 `V5-HUMAN1` blocker：玩家可见的人族 roster/tech 线。
- 最小推荐路线改为 `Peasant -> Farm -> Barracks -> Blacksmith -> Rifleman -> Long Rifles -> AI composition`。

**防复发**

- “工程顺序 proof”不能自动等同于“玩家可见科技通过”。
- 任何 future strategy gate 都必须同时回答两件事：测试证明了什么，玩家实际能看到什么。
- 后续自动生成任务时，Codex 应先生成 H1 scope / asset packet，再让 GLM 做 Rifleman / Blacksmith / Long Rifles 小切片。

### DL-2026-04-14-25：watch 已粘贴任务但停在未提交队列提示

**表象**

GLM / Codex watch 已把多行任务粘贴到运行端，但 pane 底部仍停在 `Press up to edit queued messages` 这类提交提示。  
feed 或看板如果只看 companion job，就会把它显示成普通 `running`，用户看到的进度与真实运行端状态不一致。

**影响**

- 任务没有真正进入模型执行，却占住 lane。
- 手动解除后，如果状态文件仍是旧的 dispatched / awaiting 状态，同标题任务可能被再次派发，生成第二个 job id。
- 用户会把“未提交的输入框”误判成“模型正在工作”。

**根因**

watch 脚本此前只在多行 prompt 后固定补一次 Enter，没有读取 pane 底部确认输入是否仍在排队。  
`lane-feed` 也没有把“独立提交提示仍可见”作为运行端不健康状态，只能依赖 companion job 的 running / stalled 字段。

**处置**

- `codex-watch.sh send` 和 `glm-watch.sh send` 在粘贴后读取最近 pane 输出；若底部仍是独立的提交提示，会继续补提交，最多按环境变量配置重试。
- queued prompt 判定只认独立提示行，避免误把任务正文里引用的 `Press up to edit queued messages` 当成运行端提示。
- `lane-feed.mjs` 发现运行端仍在 queued prompt 时写入 `needs_submit / queued_prompt`，不再继续显示健康 `running`。
- `queued_prompt` 或 `needs_submit` 的同标题状态会被视为未确认派发，feed 不会再创建第二个同标题 job id。

**验证**

- `node --test tests/lane-feed.spec.mjs`：34/34 passed。
- `bash -n scripts/codex-watch.sh scripts/glm-watch.sh`：通过。

**防复发**

- 判断 lane 是否真实运行时，不能只看 companion job；必须把 runtime pane 的提交提示纳入状态。
- 多行任务派发必须经过“粘贴 -> 提交 -> pane 提示检查 -> 必要时补提交”的闭环。
- 同标题任务只要仍处于 queued / needs-submit 未确认状态，就不得再次派发。

**后续观察**

- 观察下一次 GLM 多行任务派发时，pane 是否从 queued prompt 正常进入模型输出。
- 如果未来出现新的 CLI 提交提示文案，需要把它补进独立提示行白名单，而不是扩大成模糊全文匹配。

### DL-2026-04-15-05：GLM 刚取消后短暂空队列误触发 Codex 任务合成

**表象**

GLM 的 `人族集结号令最小证明包` 因 Claude Code auto-compact 卡住被取消并由 Codex 接管验收。  
在 FA1 任务卡写入并派发前，feed 看到 GLM live queue 短暂为空，于是误触发了 `Codex task synthesis — V6 War3 identity alpha`。

**影响**

- Codex 侧出现一个不必要的新 job，容易浪费 GPT token。
- 用户看到“队列里又有自动补充任务”，但它不是当前 V6 收口真正需要的执行任务。
- 如果没有及时取消，会把 Codex 从 review / 调度修复工作拉去做重复任务生成。

**根因**

`lane-feed` 把“上一个 tracked job 刚刚 settled”和“长期没有可执行任务”都当成同一种空队列。  
实际上刚取消、刚完成、刚被接管验收后的几分钟，是队列文档和 gate 文档同步窗口，不能立刻合成新任务。

**处置**

- 取消误触发的 `codex-mnzdr07e-158l7i`，不继续消耗 GPT。
- `lane-feed.mjs` 新增 `post_settle_queue_pause`：上一个 tracked job 刚刚结束后的短窗口内，先暂停 task synthesis，给队列和 gate 文档同步时间。
- `tests/lane-feed.spec.mjs` 新增回归测试，保证短暂空队列不会直接派发 Codex 合成任务。

**防复发**

- 空队列分两类：刚收口后的同步窗口，只能暂停；确认没有相邻任务后的长期空队列，才允许合成。
- feed 的“自动补货”必须先尊重最近 job 生命周期，不能只看当前表格有没有 ready 行。
- 任何自动合成任务都应能解释“为什么现在不是等待文档同步”。

### DL-2026-04-15-06：看板 feed 卡片显示旧检查时间

**表象**

`codex-feed` 没有后台 daemon 时，`logs/codex-watch-feed.json` 里的 `checked_at` 可能停留在昨天。  
看板直接展示这个字段，会让用户误以为页面没有刷新，或者 feed 还卡在旧状态。

**影响**

- 用户看到“最近检查”很旧，会怀疑看板没有实时更新。
- 如果为了展示而直接改 feed 状态文件的 `checked_at`，又可能影响 cooldown、post-settle pause、同名冻结等调度判断。
- 展示层和调度层共用一个时间字段，会把 UI 信任问题变成调度风险。

**根因**

feed 状态文件既被调度逻辑读取，也被看板展示读取。  
对调度来说，旧 `checked_at` 可能是一个重要锚点；对页面来说，它只是“这张卡片什么时候刷新”的视觉信息。

**处置**

- `generate-dual-lane-board.mjs` 在生成看板 JSON 时，为 feed monitor 单独写入本次看板刷新时间。
- 原始 feed 文件时间保留到 `source_checked_at`，只做排查使用，不影响前端默认展示。
- 没有改 feed 状态文件本身，避免影响冷却、暂停和防重复判断。

**防复发**

- 调度状态和页面刷新状态必须分开。
- 看板可以“展示刷新时间”，但不能为了好看修改调度锚点。
- 以后新增 monitor 卡片时，先判断该时间字段是业务锚点还是纯展示字段。

### DL-2026-04-15-07：GLM 首轮 runtime 失败后卡在 queued prompt，V6-FA1 由 Codex 接管

**表象**

GLM 执行 `Footman / Rifleman 角色差异证明包` 时完成了初版实现和测试，但 runtime proof 首轮失败。  
随后给 GLM 的失败提示进入 queued prompt 状态，运行端没有继续消费，companion job 仍容易显示为 running。

**影响**

- V6-FA1 已有代码变更，但没有可信 closeout。
- 如果继续等待 GLM，V6-W3L1 会停在 pending FA1。
- 如果 feed 此时继续派发，可能再次触发重复任务或错误补货。

**根因**

首轮 proof 有两个真实测试缺陷：

- proof-4 读取了不存在的 `type-badge` selector，实际 DOM 是 `unit-type-badge`。
- proof-5 直接向 `completedResearches` 写入 Long Rifles，而不是走真实 research queue；因此已有 Rifleman 没有应用真实效果。

同时，watch 运行端进入 queued prompt 后没有继续提交，导致“看起来 running，但没有实际推进”。

**处置**

- Codex 停止 GLM watch session，并取消 companion job `glm-mnze1drz-a0hkcq`。
- 暂停 GLM feed daemon，避免接管期间再次派发。
- Codex 接管修正 `tests/v6-footman-rifleman-role-identity-proof.spec.ts`：
  - 使用真实 `unit-type-badge` selector。
  - 训练按钮 proof 先补足 supply，避免被初始人口上限误判。
  - Long Rifles proof 改走真实 research queue 完成路径。
  - range 期望从 `GameData` / research effect 推导，不写死当前数字。
- 验证通过：build、typecheck、FA1 focused 5/5、V6 identity 相关 runtime pack 22/22、lane-feed tests 36/36、cleanup complete。

**防复发**

- GLM closeout 不能只看“写了测试”；必须看首轮 runtime 原始结果。
- queued prompt / needs-submit 一律视为未继续执行，不能当健康 running。
- 当 GLM 首轮失败且 watch 卡住时，Codex 可以接管当前任务，但必须先停止 feed，避免同一任务重复派发。
- 测试不得绕过真实 runtime 路径写内部状态；研究、训练、战斗这类 proof 必须走玩家或系统真实入口。

### DL-2026-04-15-08：V6->V7 切换成功但 live queue 首次播种为空

**表象**

`version-cutover.mjs apply` 已经把当前版本切到 V7，但返回的 `seededQueues` 为空。  
看板和队列文件会显示 V7 active，却没有 V7-CX / Task 107 这类相邻任务，容易再次让双泳道断供。

**影响**

- V7 已经激活，但 GLM 和 Codex 没有可执行的下一张任务。
- 如果直接启动 feed，可能误以为“当前阶段没有任务”，进而触发泛化任务合成。
- 用户会看到“进入 V7 了但两条泳道都不动”，这和自动推进目标冲突。

**根因**

`queue-refill.mjs` 只认识旧 runway 格式：

- Codex: `### Task C64: ...`
- GLM: `## Task 107 — ...`

V7 Codex runway 使用了新版标题：

- `### V7-CX1：Beta 范围冻结包`

而 V7 GLM runway 早期只有 seed 表格，没有可解析的任务正文。  
结果是切换工具能找到 V7 transition artifacts，却无法从新 runway 格式里抽出 live queue 任务。

**处置**

- `parseCodexRunwayTasks` 已支持 `### V7-CX1：...` 和旧 `### Task Cxx: ...` 两种格式。
- Codex parser 现在能读取未加粗的 `Goal:`、`Allowed files:`、`Must satisfy:`。
- V7 GLM runway 补了明确的 `## Task 107 — ...` 到 `Task 111` 任务正文。
- `queueInsertionIndex` 修正为：如果没有 active / ready 行，新任务插到表格顶部，而不是历史 completed 行后面。
- 已重新执行 `queue-refill --lane all --apply`，V7-CX1..CX4 和 Task 107..110 已进入 live queue。

**验证**

- `git diff --check`：通过。
- `node --test tests/lane-feed.spec.mjs tests/queue-refill.spec.mjs tests/version-cutover.spec.mjs tests/version-transition-orchestrator.spec.mjs`：65/65 passed。
- `node scripts/milestone-oracle.mjs --json`：当前版本 V7，工程 blocker 从 6 个开始。
- `node scripts/version-transition-orchestrator.mjs --json`：当前 transition 为 V7_TO_V8，状态 `preheat-not-needed-yet`。

**防复发**

- 每个新版本 runway 格式必须先有 parser 回归测试，再允许 cutover。
- `version-cutover` 之后如果 `seededQueues` 为空，不能视为正常成功，必须触发补货检查。
- 新阶段任务名可以更用户化，但机器可解析字段必须稳定：标题、状态、目标、文件边界、证明标准。

### DL-2026-04-15-09：GLM Task 107 首轮越界修改视觉工厂

**表象**

GLM 执行 `Task 107 — Lumber Mill 与塔分支最小可玩切片` 时，先在 `src/game/BuildingVisualFactory.ts` 增加了 `lumber_mill` 视觉代理入口和 `createProxyLumberMill` 函数。  
这个文件不在 Task 107 的 allowed files 内。

**影响**

- Task 107 的目标是数据、前置、命令卡和 runtime proof，不是素材或视觉扩张。
- 如果允许越界，会把一个小 gameplay proof 变成视觉/素材任务，增加冲突面。
- 之后 GLM closeout 可能把“看起来有建筑”误当成 gameplay proof。

**根因**

Task 卡虽然写了 allowed files，但 GLM 在遇到新增建筑时按惯性补了视觉代理，没有先判断“视觉是否是当前 proof 的必要条件”。  
这说明 allowed files 约束需要在运行中主动审，而不能只等 closeout。

**处置**

- Codex 立即打断 GLM session。
- 给 GLM 发送修正指令：撤回 `BuildingVisualFactory.ts` 的 `lumber_mill` 越界改动；后续只允许修改 `GameData.ts`、`Game.ts`、focused spec 和队列 closeout。
- GLM 已移除 `lumber_mill` team-color slot、factory 分支和 `createProxyLumberMill` 函数。
- Task 107 继续执行；GLM 修正测试选择器误判后 focused runtime 6/6 通过。
- Codex 本地复核后 accepted：build、tsc、focused 6/6、command-surface 13/13、cleanup。

**防复发**

- GLM 任务只要新增建筑或单位，不能默认补视觉文件；除非 task card 显式允许。
- Codex 复核 GLM closeout 时必须检查 `git diff --name-only` 是否超出 allowed files。
- 视觉代理、素材、图标和模型应由单独的 presentation / asset 任务处理，不能混进 gameplay proof。

### DL-2026-04-15-10：Task 107 worker completed 后 Task 108 被过早派发

**表象**

GLM Task 107 跑完 focused runtime 并把队列表格标成 `completed` 后，feed daemon 立即派发了 `Task 108 — Arcane Sanctum 法师基础切片`。  
此时 Task 107 还没有经过 Codex 本地复验，也没有被标成 `accepted`。

**影响**

- Task 108 和 Task 107 都会修改 `src/game/GameData.ts`、`src/game/Game.ts`，如果直接继续，会把未复核 diff 和新任务 diff 混在一起。
- Codex 无法清楚判断 Task 107 的真实质量。
- `completed` 被误当成“可以继续扩张”的信号，削弱了 Codex review gate。

**根因**

当前 Task 108 没有显式写“必须等待 Task 107 accepted”。  
feed 只看到 Task 107 不再 `in_progress`，于是按队列表顺序派发下一张。

**处置**

- 停止 `glm-watch-feed-daemon`。
- 打断 GLM，要求 Task 108 暂停，不开始改文件。
- 取消 companion job `glm-mnzggrwa-tusv5u`。
- 把 Task 108 从 `in_progress` 改回 `ready`，并写明需要等 Task 107 Codex accepted 后再派发。
- Codex 完成 Task 107 本地复核并标记为 `accepted` 后，Task 108 才允许重新派发。

**防复发**

- 同文件连续任务必须显式依赖 `accepted`，不能只依赖 worker `completed`。
- feed 派发下一张前，需要识别“上一张同文件任务 completed-but-not-accepted”的状态。
- Codex review / accepted 是工程质量 gate，不是可选记录。

### DL-2026-04-15-11：Task 108 误派发不能只靠任务卡前置修

**表象**

Task 108 误派发后，最初处置只给 Task 108 补了 `Task 107 accepted` 前置。  
这能挡住 Task 108，但挡不住未来任何“上一张 GLM worker completed、下一张 ready”的同类错误。

**影响**

- 只修任务卡会把问题留给下一次：Task 109 completed 后仍可能立刻派 Task 110。
- 用户看到的就是“队列明明需要验收，却又开始花 token 做下一张”。
- 任务质量会从 Codex 本地复核驱动，退化成 worker 自报完成驱动。

**根因**

`lane-feed.mjs` 缺少 GLM lane 的全局验收刹车：  
它能识别任务自己的 `Prerequisite: ... accepted`，但不能识别“最新 GLM completed job 本身还没有 Codex accepted”。

**处置**

- 在 `scripts/lane-feed.mjs` 增加 `codex_review_wait` 状态。
- 规则改为：GLM 最新 completed job 只要队列状态不是 `accepted`，就不派任何新的 GLM implementation task。
- 只有 Codex 本地复核后把该任务标为 `accepted`，feed 才会继续找下一张 ready 任务。
- 新增/更新 `tests/lane-feed.spec.mjs` 回归：
  - worker completed 后必须等待 Codex review。
  - accepted 后才允许继续。
  - 原“刚 completed 就计划下一张”的旧预期已改掉。

**验证**

- `node --check scripts/lane-feed.mjs`：通过。
- `node --test tests/lane-feed.spec.mjs`：38/38 passed。

**防复发**

- GLM 的 `completed` 只代表 worker closeout，不代表项目接受。
- 看板/状态可以显示 completed，但 feed 不得把 completed 当成可继续扩张的信号。
- 后续如果出现新的 closeout 误派发，优先查 `codex_review_wait` 是否被绕过，而不是继续给单个任务补前置。

### DL-2026-04-15-12：GLM Task 109 卡在可选 UI 细节，Codex 接管收口

**表象**

GLM 执行 `Task 109 — Workshop / Mortar 战斗模型切片` 时，已经写入 Workshop / Mortar / Siege AOE 的核心数据和行为，但随后长时间停在显示名、徽章、HUD 文案等可选 UI 细节上。  
期间还出现了不该使用的脚本编辑方式，且没有及时产出 focused proof closeout。

**影响**

- Task 109 的核心目标是证明 Workshop 训练入口、Mortar 攻城数据和 AOE/filter 行为，不是补全所有 UI 文案。
- 如果继续等 GLM，会让 V7 主线停在非关键细节上。
- 如果直接接受 GLM 输出，会缺 Codex 本地 focused proof，后续 Task 110 AI 可能基于未验收内容继续扩张。

**根因**

Task 卡约束了内容目标，但没有把“可选 UI polish 不能阻塞 closeout”写成运行中止损规则。  
GLM 遇到新单位后倾向于补全所有显示路径，而不是先证明核心 gameplay contract。

**处置**

- 停止 GLM watch session。
- 取消 companion job `glm-mnzguyn3-wtjxp7`。
- Codex 接管 Task 109，补 `tests/v7-workshop-mortar-combat-model-proof.spec.ts`。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused runtime 3/3。
- Task 109 标为 `accepted`；Task 108 Priest 线恢复 `ready`。

**防复发**

- 后续 GLM task prompt 必须把 `core proof first, optional UI later` 写进 closeout 标准。
- 如果 GLM 超过软上限仍在可选 UI 细节里循环，Codex 应直接接管或重派，不继续追加提示消耗。
- GLM 不得用脚本绕过正常编辑边界；如果必须机械改动，先说明范围并保持 diff 可审。

### DL-2026-04-15-13：新验收门禁被历史 completed/done 与旧 cancelled 记录误挡

**表象**

Codex 接管并 accepted Task 109 后，准备恢复 GLM Task 108。  
第一次 `lane-feed` 没有派 Task 108，而是被更早的 `研究效果数据模型证明包` 历史 completed job 卡住；修完后，旧 Task 108 cancelled job 又把已恢复的 ready 状态重新挡住，最终 feed 派发了 Task 110。

**影响**

- GLM 会看起来“有队列但不按优先级执行”。
- 旧历史任务会永久阻塞新任务，造成断供。
- 被 Codex 明确恢复 ready 的任务，会因为历史 cancelled 记录继续被冻结，造成错派。

**根因**

`codex_review_wait` 的第一版实现向历史 completed jobs 回扫，而不是只检查最新 completed GLM job。  
同时，同名冻结和 cancelled 同步没有区分“刚取消的 current”与“Codex 后来明确恢复成 ready 的任务”。

**处置**

- `scripts/lane-feed.mjs` 改为只检查最新 completed GLM job 是否 accepted；旧历史 `done/completed` 不再永久挡住当前队列。
- cancelled 同步只会把 current / in_progress / active 的同名任务改成 blocked，不覆盖已经恢复为 ready 的任务。
- 同名冻结对 ready + cancelled 的显式重试放行；completed/running 仍按冻结规则防重复。
- 新增回归：
  - 最新 closeout accepted 后，旧 completed/done 不阻塞。
  - 旧 cancelled 不覆盖显式恢复的 ready。

**验证**

- `node --check scripts/lane-feed.mjs`：通过。
- `node --test tests/lane-feed.spec.mjs`：40/40 passed。

**防复发**

- 新的全局门禁只看最新 worker closeout，不做历史债务扫描。
- 如果 Codex 恢复某个 cancelled task 为 ready，它就应进入正常候选队列。
- 历史状态迁移问题要通过代码兼容解决，不能靠手工把几百条旧任务全改成 accepted。

### DL-2026-04-15-14：Task 110 初版 AI 内容接入饿死开局压制

**表象**

GLM 执行 `Task 110 — V7 内容 AI 同规则使用切片` 时，初版 focused proof 的 proof-5 两次失败，随后 closeout 使用 tail 截断输出，无法作为可信验收。  
Codex 接管后，Task110 focused proof 可以局部通过，但相关 `ai-economy-regression` 暴露第一波、第二波进攻间歇性失败：AI 到 212 秒只有 1 个 Footman，`waveCount=0`。

**影响**

- 如果只接受“AI 会造 V7 内容”，会把第一、第二波进攻节奏打坏。
- V7-AI1 的本意是“同规则使用新内容”，不是“高级内容抢光开局预算”。
- 截断日志会掩盖 proof 失败，继续浪费 token 和 runtime 时间。

**根因**

- AI 训练工人时只看当前工人数量，没有把 Town Hall 训练队列里的工人计入开局上限，导致开局经济过度补工人。
- Blacksmith / Long Rifles / V7 扩展在第一波前过早抢资源，Footman 数量不足以触发进攻波。
- V7 伐木场、塔、车间扩展没有绑定到“基础压制已经成立”的节奏前提。

**处置**

- 取消 GLM job `glm-mnzi2shn-un2pwe`，由 Codex 接管。
- `src/game/SimpleAI.ts` 增加开局预算保护：
  - 第一波前工人上限包含 queued workers，先停在小经济规模。
  - 昂贵科技只有在已发起进攻，或资源足够保留第一波 Footman 预算时才提前开。
  - V7 伐木场、塔、车间扩展放到两波进攻之后。
- `tests/v7-ai-same-rule-content-proof.spec.ts` 改为受控 post-opening fixture，明确验证 V7 内容走正常建造/训练路径。

**验证**

- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。
- Task110 focused + 第一/第二波关键回归：10/10 通过。
- 相关回归：`tests/ai-economy-regression.spec.ts`、`tests/v5-human-ai-rifleman-composition.spec.ts`、`tests/v7-workshop-mortar-combat-model-proof.spec.ts` 共 18/18 通过。
- `./scripts/cleanup-local-runtime.sh` 后无 Vite / Playwright / Chromium 残留。

**防复发**

- AI 新内容任务必须同时跑“新内容 proof”和“旧节奏 proof”，不能只证明 AI 会用新对象。
- GLM closeout 不允许用 tail 截断 runtime 结果代替原始通过信息。
- 后续 Priest / caster AI 接入时，必须先保护 opening pressure，再谈高级内容选择。

### DL-2026-04-15-15：Task 108 closeout 需要 Codex 补强合同后才能接受

**表象**

GLM 完成 `Task 108 — Arcane Sanctum 法师基础切片` 后，代码主体可用，但 closeout 仍有两个验收风险：

- 测试证明了 Arcane Sanctum 数据存在，却没有证明它能通过正常命令卡训练 Priest。
- `castHeal` 靠调用方过滤友军，底层能力本身没有拒绝敌方目标。
- GLM 的 build / typecheck closeout 仍使用了 tail 截断输出，不能直接作为 Codex acceptance 证据。

**影响**

- 如果不补训练链 proof，V7-HUM1 会误把“有字段”当成“可玩内容线成立”。
- 如果不补敌方目标拦截，Heal 能力合同不完整，后续 AI 或新命令入口可能绕过 UI 过滤。
- 如果接受 tail 截断输出，后续仍会重复出现“看起来绿但证据不完整”的浪费。

**根因**

- GLM 执行小切片时容易先证明对象存在，而不是证明玩家正常路径成立。
- 能力函数没有把“只能治疗友军”写成底层不变量。
- closeout 规范没有被 GLM 完全执行，仍需要 Codex 本地复验兜底。

**处置**

- `src/game/Game.ts`：`castHeal` 增加 `target.team === priest.team` 底层拦截。
- `tests/v7-arcane-sanctum-caster-proof.spec.ts`：新增 Arcane Sanctum / Priest 数据表连接 proof、Barracks 建造前置 proof、Arcane Sanctum 命令卡训练 Priest proof，并把 Heal blocked proof 扩展到敌方目标。
- Task108 状态从 `completed` 改为 `accepted`，V7-HUM1 与 V7-NUM2 改为工程通过。

**验证**

- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。
- `./scripts/run-runtime-tests.sh tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list`：9/9 通过。
- 相关回归：`tests/command-surface-regression.spec.ts`、`tests/v7-lumber-mill-tower-branch-proof.spec.ts`、`tests/v7-workshop-mortar-combat-model-proof.spec.ts`、`tests/v7-ai-same-rule-content-proof.spec.ts` 共 30/30 通过。
- `./scripts/cleanup-local-runtime.sh` 后无 Vite / Playwright / Chromium / runtime test 残留。

**防复发**

- V7 内容任务必须证明“玩家正常路径”：数据、前置、命令卡、runtime 行为、玩家可见状态，缺一项不能 accepted。
- 能力和战斗效果必须把阵营、目标过滤、资源消耗和 cooldown 写到底层函数，而不是只靠 UI/AI 过滤。
- GLM 使用 tail 截断 build/tsc 输出时，Codex acceptance 必须全量重跑。

### DL-2026-04-15-16：Task 111 稳定性包初版提前写通过且测试上下文错误

**表象**

GLM 执行 `Task 111 — V7 beta 稳定性回归包` 时，先把 `V7-STAB1` 写成 `engineering-pass`，但当时还没有完成 Codex 本地复核。  
同时初版 `tests/v7-beta-stability-regression.spec.ts` 在 `page.evaluate` 浏览器上下文中直接读取 Node 端 import 的 `BUILDINGS` / `UNITS` / `PEASANT_BUILD_MENU`，该写法会在 Playwright 中失效。随后 GLM 卡入自动压缩。

**影响**

- gate 状态会被 worker 提前写绿，破坏 “worker completed != Codex accepted” 的规则。
- 测试会把 Node 进程上下文和浏览器页面上下文混在一起，形成假证明或直接失败。
- GLM 卡自动压缩时如果继续等待，会造成双泳道断供。

**根因**

- Task111 的“稳定性包”概念容易让 worker 以为可以自己关闭 V7-STAB1，而不是只产出待复核证据。
- GLM 对 Playwright 的执行上下文边界不够稳，没把数据表断言放在 Node 侧。
- 该 job 在修正过程中进入自动压缩，无法及时 closeout。

**处置**

- 取消 GLM job `glm-mnzkxeb9-4x4f6w` 并停止卡住的 GLM tmux session。
- Codex 接管 `tests/v7-beta-stability-regression.spec.ts`：
  - Node 侧验证 V7 数据连接。
  - 浏览器侧只验证 runtime 命令路径、战斗过滤、HUD/命令卡、dispose/reset 恢复。
  - 不在浏览器测试里假装证明系统进程 cleanup；进程 cleanup 由脚本和 `pgrep` 证明。
- `scripts/run-runtime-suite.sh` 增加 `v7-content` 分片，并修正文档注释。

**验证**

- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。
- `./scripts/run-runtime-tests.sh tests/v7-beta-stability-regression.spec.ts --reporter=list`：5/5 通过。
- `bash -n scripts/run-runtime-suite.sh`：通过。
- 完整 V7 内容包 31/31 通过：
  - `tests/v7-lumber-mill-tower-branch-proof.spec.ts`
  - `tests/v7-workshop-mortar-combat-model-proof.spec.ts`
  - `tests/v7-arcane-sanctum-caster-proof.spec.ts`
  - `tests/v7-ai-same-rule-content-proof.spec.ts`
  - `tests/v7-beta-stability-regression.spec.ts`
- `./scripts/cleanup-local-runtime.sh` 后无 Vite / Playwright / Chromium / runtime test 残留。

**防复发**

- worker 只能把自己的任务写成 completed；`engineering-pass` gate 仍必须由 Codex 本地复核后写。
- Playwright 规则继续写进任务提示：`page.evaluate` 不能访问 Node import；数据表断言放 Node 侧，runtime 状态放 browser 侧。
- GLM 自动压缩超过可接受等待时，Codex 直接取消 job 并接管，而不是继续空等。

### DL-2026-04-15-17：Task118 缺任务卡导致幽灵 in-progress 和 GLM 断供

**表象**

`docs/GLM_READY_TASK_QUEUE.md` 表格里出现 `Task 118 — V9 HN2 tier and prerequisite schema boundary pack`，但正文没有对应任务卡。  
`lane-feed` 先把它标成 `in_progress`，随后因为找不到任务卡无法生成 prompt；GLM 终端仍停在“等待下一张队列任务”，看起来 running，实际上没有新任务在跑。

**影响**

- 看板和队列表误报 GLM 有任务。
- `glm-watch-feed` 进入 `milestone_ready_no_transition` / 空闲状态，下一张真实 HN2 任务没有被送到 GLM。
- 如果不修，后续任何“表格有 ready、正文缺卡”的队列项都会制造假执行态和断供。

**根因**

- 派发器在生成 prompt 之前就先执行 `promoteCandidateToCurrent`，把任务表格状态改成 `in_progress`。
- 任务表格和任务卡片是两个状态源，之前没有“缺任务卡禁止提权”的保护。
- V9 是长期维护 / 扩展阶段，没有 V10 transition；当队列项异常时，系统会误以为当前阶段没有可派任务。

**处置**

- `scripts/lane-feed.mjs` 改为先读取任务卡并生成 prompt，成功后才把任务提升为执行中。
- 如果 ready/current 任务缺卡，派发器现在会返回 `task_card_missing`，把该任务标成 `blocked`，并且不会派发、不会制造 `in_progress`。
- 补齐 Task118 任务卡，并把它重新改回 `ready`，等待正常派发。
- `docs/CODEX_ACTIVE_QUEUE.md` 和 `docs/DUAL_LANE_STATUS.zh-CN.md` 同步为 V9-CX5：HN2 schema boundary feed guard。

**验证**

已验证：

```bash
node --test tests/lane-feed.spec.mjs tests/queue-refill.spec.mjs tests/board-closeouts.spec.mjs
git diff --check -- scripts/lane-feed.mjs tests/lane-feed.spec.mjs docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md docs/DUAL_LANE_STATUS.zh-CN.md docs/DUAL_LANE_ISSUE_LOG.zh-CN.md
```

结果：66/66 通过，diff check 通过。

**防复发**

- 派发器不得在 prompt 构造成功前改变队列执行态。
- 每个 ready/current 任务必须有匹配 `### Task ...` 正文卡；缺卡直接 blocked，不允许假运行。
- V9 长期阶段如果没有下一个版本转换，仍要先看当前 live queue；只有 live queue 真实为空才显示无可派任务。

### DL-2026-04-15-18：看板把停用的 codex-watch 误显示成 Codex 停滞

**表象**

GLM 已在运行 Task118，Codex 也在当前对话里继续处理队列和看板，但本地看板的 `codex_watch` / `codex_feed` 卡片仍显示旧 codex-watch session `stalled`。

**影响**

- 用户会误以为 Codex 没有在推进。
- 看板把“旧终端 watcher 不再作为执行源”和“当前 Codex 对话停止工作”混成一个状态。

**根因**

- `codex-watch` 是旧的外部终端泳道，当前项目已经改为由这个 Codex 对话直接承担 Codex 侧工作。
- 看板生成器直接展示旧 monitor / feed JSON，没有根据当前 Codex 队列 active task 做语义归一。

**处置**

- `scripts/generate-dual-lane-board.mjs` 增加 Codex monitor 归一：如果旧 codex-watch/feed 是 stalled，但 Codex 队列有当前 active task，则看板显示 `current_session`。
- 细节文案改为“Codex 由当前对话直接推进；旧 codex-watch 不作为执行源”，避免继续误导。

**验证**

- `node --test tests/board-closeouts.spec.mjs`：4/4 通过。
- `node scripts/generate-dual-lane-board.mjs`：已刷新。
- `public/dual-lane-board.json` 中 `monitors.codex_watch.state` 与 `monitors.codex_feed.state` 均为 `current_session`，GLM feed 保持 `running`。

**防复发**

- 看板展示必须区分“执行源停用”和“任务停滞”。
- 旧 watcher 的 raw 状态可以保留在 `original_state`，但用户主视图要展示项目真实执行源。

### DL-2026-04-15-19：Task118 初版 proof 直接 import TS const enum 且误占 HN3

**表象**

GLM Task118 初版 `tests/v9-tier-prerequisite-schema.spec.mjs` 直接从 `src/game/GameData.ts` import 数据，Node `--test` 在 strip-only 模式下遇到 `const enum` 失败。  
GLM 修复后 node proof 通过，但 proof-1 / proof-2 只是全文件字符串查找，不能证明字段属于指定对象；文档还把下一步 Keep tier seed 写成 HN3，而项目总路线里的 HN3 已经是 ability numeric model seed。

**影响**

- 如果直接接受，会留下一个脆弱 proof：`techPrereq: 'blacksmith'` 出现在任何地方都可能误判通过。
- HN2/HN3 命名会串线，后续自动补货可能把 Keep 实现错挂到 ability numeric 阶段。

**根因**

- `.mjs` proof 不能直接 import 当前 TS 文件里的 `const enum`，必须文本解析或走编译后产物。
- GLM 在修复失败时只满足“测试绿”，没有把 proof 精度提升到对象级。
- HN2 schema 的“下一实现切片”和 V9 总路线里的 HN3 语义没有被测试锁住。

**处置**

- Codex 本地接管复核，改 `tests/v9-tier-prerequisite-schema.spec.mjs` 为对象级文本解析：
  - `UNITS.rifleman` 必须包含 `techPrereq: 'blacksmith'`
  - `BUILDINGS.tower` 必须包含 `techPrereq: 'lumber_mill'`
  - `BUILDINGS.barracks` 必须包含 `trains: ['footman', 'rifleman']`
  - 其他基础单位 / 建筑不得在本 schema 任务中新增 `techPrereq`
- 把 schema 文档下一步从 HN3 修正为 `HN2-IMPL1 — Keep tier seed`。
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md` 明确 HN3 仍保留给 ability numeric model seed。

**验证**

- `node --test tests/v9-tier-prerequisite-schema.spec.mjs`：5/5 通过。
- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。
- `./scripts/cleanup-local-runtime.sh` 后无 runtime 残留。

**防复发**

- Node `.mjs` proof 不直接 import 含 `const enum` 的 TS 源文件。
- schema / ledger proof 要检查对象归属，不用全文件字符串命中冒充事实。
- 后续任务命名必须和 `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md` 的 HN1-HN4 语义一致。

### DL-2026-04-15-20：Task119 合同和 Task118 schema 对 Keep -> Castle 指令不一致

**表象**

Task119 纠偏后已经要求 `keep` 不加 `upgradeTo`，因为 Castle 尚未实现；但上游 `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md` 仍写着 `keep.upgradeTo = 'castle'` 和 `upgradeTo: 'castle'`。

**影响**

- 下一张 HN2-IMPL1 实现任务会同时收到两种冲突指令。
- GLM 可能按旧 schema 把 `keep` 指向不存在的 `castle`，制造 dangling reference。
- 旧 `v9-tier-prerequisite-schema` proof 还把所有新建筑都视为回退，Task120 真加 `keep` 后会被旧门槛误挡。

**根因**

- Task118 是 schema boundary，Task119 是更窄的实现合同；Task119 纠偏后没有同步回写 Task118 schema。
- schema proof 没有提前区分“允许的 HN2 seed：keep”和“仍禁止的 T3 内容：castle / 新单位 / 新科技”。

**处置**

- 删除 schema packet 里 HN2 阶段的 `keep -> castle` 指令，改成：当前 Keep seed 只加 `townhall.upgradeTo = 'keep'`，`keep` 不加 `upgradeTo`。
- 更新 Task119 contract，允许 Task120 同步 `tests/v9-tier-prerequisite-schema.spec.mjs` 到 seed 后状态。
- 更新 schema proof：允许 `keep` 作为 HN2 seed，但仍禁止 `castle`、新单位和新科技；并显式拒绝 `keep.upgradeTo = 'castle'`。

**验证**

- `node --test tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-contract.spec.mjs`：10/10 通过。
- `node --test tests/v9-human-completeness-ledger.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-contract.spec.mjs tests/lane-feed.spec.mjs tests/queue-refill.spec.mjs tests/board-closeouts.spec.mjs`：81/81 通过。
- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。

**防复发**

- 下游实现合同纠偏后，必须回扫上游 schema / proof 是否还残留相反指令。
- 数据 seed proof 不能只证明“没新增任何对象”，要能表达“允许的相邻增量”和“仍禁止的扩张项”。

### DL-2026-04-15-21：Task120 closeout 缺少 READY_FOR_NEXT_TASK 且 proof 初版停在 seed 前状态

**表象**

Task120 GLM closeout 给出 `JOB_COMPLETE`、文件列表和验证结果，但没有按要求输出 `READY_FOR_NEXT_TASK:`。过程中 node proof 初版也失败过：schema proof 仍假设 HN2-IMPL1 只是“下一步”、contract proof 仍要求旧结论文案、seed proof 的 `BuildingDef` 解析一开始被接口内的对象字面量截断。

**影响**

- 如果只看 GLM closeout，下一张任务可能断供，需要 Codex 手动补货。
- 旧 proof 会让已经落地的数据 seed 被误判成 schema 违规，或者让下一步重复派发 HN2-IMPL1。

**根因**

- Task120 把 schema 从“未来边界”推进到“已实现 seed”，但部分 proof 仍按 Task118/119 的前置状态写。
- GLM closeout 模板没有在最后强制检查 `READY_FOR_NEXT_TASK`。

**处置**

- Codex 精确提示 GLM：`BuildingDef` 用 brace-depth 解析；schema proof 不再强制 HN2-IMPL1 出现次数；contract proof 同时接受 old next-safe 和 implemented conclusion。
- Codex 复核时进一步修正 schema packet 第 6 节，把 HN2-IMPL1 从“未来切片建议”改成“已落地状态”，避免重复补货。
- Codex 直接补 `Task121 — Town Hall to Keep upgrade flow`，不依赖 GLM closeout 的缺失 ready line。

**验证**

- `node --test tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-contract.spec.mjs tests/v9-human-completeness-ledger.spec.mjs tests/v9-keep-upgrade-flow-contract.spec.mjs`：27/27 通过。
- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。
- `./scripts/cleanup-local-runtime.sh` 后无 runtime 残留。

**防复发**

- 每次从“合同/边界”推进到“已实现 seed”时，必须同步改 proof 的状态假设。
- GLM closeout 缺 `READY_FOR_NEXT_TASK` 时，Codex 不等待它补说法，直接用队列和相邻合同补下一张任务。

### DL-2026-04-15-22：看板读取旧 feed JSON，可能把 queued prompt 显示成健康 running

**表象**

Task121 派发后，`glm-watch` 终端曾出现 `Press up to edit queued messages`，也就是提示词已经贴进 Claude Code 输入框但还没真正提交。`lane-feed` 本身已有 queued prompt 识别，但 `generate-dual-lane-board.mjs` 生成看板时只读取旧的 `logs/glm-watch-feed.json`，没有先刷新 feed 状态，所以页面仍可能显示 `running`。

**影响**

- 用户看到右上角或卡片是 running，但实际上 GLM 还停在待提交提示。
- 看板刷新不一定暴露“需要提交”这个真实动作，容易误判为 GLM 在干活。

**根因**

- 真实判断分散在两层：`lane-feed.mjs status` 能识别 queued prompt，`generate-dual-lane-board.mjs` 只读上一次 feed JSON。
- GLM 任务卡片优先看 companion job 的 `running`，没有让 `needs_submit / stalled / running_attention` 覆盖卡片状态。

**处置**

- `generate-dual-lane-board.mjs` 生成看板时先调用 `lane-feed.mjs status --lane glm --json`，只刷新状态，不派发新任务。
- GLM 任务卡片优先展示 `needs_submit`、`stalled`、`running_attention`，避免把这些状态压成普通 `running`。

**验证**

- `node --check scripts/generate-dual-lane-board.mjs`：通过。
- `node scripts/generate-dual-lane-board.mjs`：通过并刷新 `public/dual-lane-board.json`。
- `node --test tests/lane-feed.spec.mjs`：41/41 通过。

**防复发**

- 看板不能只读旧 feed 文件；状态类卡片必须在生成时刷新只读 status。
- 任何 `needs_submit` 都要显示为“待提交/不算真实运行”，不能用 companion 的 running 覆盖。

### DL-2026-04-15-28：旧 codex-watch 会话停在提示符却仍被 companion 记为 running

**表象**

`codex-watch` 已停在 Codex 提示符数小时，没有新输出；但 companion 里仍有一个 `Codex task synthesis — V9 maintenance and expansion runway` 的 running job。看板容易让用户误以为 Codex watch 仍在持续执行。

**影响**

- 用户看到“Codex 侧在跑”，实际没有任务推进。
- 当前对话已经承担 Codex 执行线，但旧 watch job 会污染状态判断。
- 可能再次浪费 GPT 额度或制造“假运行”误解。

**根因**

早期把 codex-watch 当成持续执行器，但后续实际切回当前对话直接推进；旧 tmux session 没有同步退役，companion 也没有自动把长期停在提示符的 Codex job 标成终态。

**处置**

- 取消旧 companion job `codex-mnzn0axz-5u1z3e`。
- 停止旧 `codex-watch` tmux session。
- 当前 Codex 泳道以本对话为执行源，看板只把 codex-watch 当历史/辅助状态，不再当权威执行源。

**验证**

- `node scripts/dual-lane-companion.mjs cancel codex-mnzn0axz-5u1z3e --json`：完成。
- `./scripts/codex-watch.sh stop`：完成。
- `node scripts/generate-dual-lane-board.mjs`：刷新后 Codex 当前任务仍来自队列表 `V9-CX14`，不会再展示旧 synthesis job 为运行中。

**防复发**

- Codex watch 不能作为当前对话之外的隐形执行源长期挂着。
- 只要 Codex 当前由本对话接管，旧 codex-watch job 必须退役或明确标成 idle。

### DL-2026-04-15-29：最近收口漏掉 Codex 接管型 accepted 任务

**表象**

Task125 是 GLM 初版失败后由 Codex 接管并 accepted 的任务；但看板 `最近收口` 只读 companion 的 completed job 和旧 fallback，导致 Task125 刷新后一度消失，页面回退显示 Task121/119/120 或 Task124。

**影响**

- 用户会以为刚完成的任务记录丢了。
- Codex 接管型收口无法稳定进入看板。
- “最近收口”会误导任务队列是否真的推进。

**根因**

closeout 聚合把 worker job 完成当成主要真值，没有把队列表里的 `accepted/done/completed` 当作同等 closeout 来源。Task125 的 worker job 是 cancelled，但队列表状态已经 accepted，属于合法收口。

**处置**

- `scripts/board-closeouts.mjs` 增加队列表 closeout 候选：每条泳道只取当前 active/in_progress 前一条已收口任务，避免扫完整历史表。
- `scripts/generate-dual-lane-board.mjs` 的 GLM latest completed 改为优先读队列表最新 accepted，再回退 companion job。
- 日期只有 `YYYY-MM-DD` 的队列表 closeout 在看板展示时使用本次生成时间，保证用户看到年月日时分秒。

**验证**

- `node --check scripts/board-closeouts.mjs`：通过。
- `node --check scripts/generate-dual-lane-board.mjs`：通过。
- `node --test tests/board-closeouts.spec.mjs`：5/5 通过。
- `node scripts/generate-dual-lane-board.mjs`：看板 `最近收口` 稳定显示 `V9-CX13`、`Task125`，GLM latest completed 显示 `Task125`。

**防复发**

- “最近收口”必须支持三类真值：companion completed job、队列表 accepted/done/completed、最后才是旧文档 fallback。
- 接管型任务不能因为原 worker job cancelled 就从用户视图消失。

### DL-2026-04-15-30：Task126 GLM 证明弱化并卡住，需要 Codex 接管

**表象**

GLM 在 `Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness` 中写出了 AI Keep 升级草稿和 runtime proof，但 proof 出现三类问题：`page.evaluate()` 里误用 Node import，KU-2 把“扣除真实 Keep 成本”弱化成 `>= keep cost`，KU-6 静态断言后还残留旧的 `result.*` 断言。之后 GLM session 继续停留在不可信 closeout / 弱修复状态。

**影响**

- 可能把“同一 tick 里有额外消费”误接受为 Keep 成本扣费证明。
- 浏览器上下文和 Node 上下文混用会制造不稳定假红或假绿。
- 如果继续让 GLM 自行弱化断言，Task126 会污染后续真实 Keep/T2 解锁迁移。

**根因**

任务要求“扣除真实 `BUILDINGS.keep.cost`”，但 GLM 没有隔离 AI tick 的副作用，也没有用 instrumentation 捕获精确 spend call。遇到额外同 tick 消费后，它选择放宽断言，而不是证明存在一笔精确 Keep 扣费。同时静态数据 proof 没有和 browser runtime proof 分层，导致 Node import 被错误放进 `page.evaluate()`。

**处置**

- 取消 GLM job `glm-mnztlpa6-36oajp`。
- Codex 接管并重写 `tests/v9-ai-keep-upgrade-readiness.spec.ts`。
- KU-2 改为 wrap `g.resources.spend`，验证同一 tick 中存在一笔精确等于 `BUILDINGS.keep.cost` 的 spend call，同时保留资源 delta 下限证明。
- KU-3 用同一建筑对象引用证明 Town Hall 完成升级后变为 Keep。
- KU-6 改成 Node-side 静态断言，明确 Workshop / Arcane Sanctum / Castle / Keep 数据边界未被本任务改变。

**验证**

- `npm run build`：通过。
- `npx tsc --noEmit -p tsconfig.app.json`：通过。
- `./scripts/run-runtime-tests.sh tests/v9-ai-keep-upgrade-readiness.spec.ts --reporter=list`：6/6 通过。
- `./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts tests/v7-ai-same-rule-content-proof.spec.ts --grep "first attack wave|second attack wave|V7 AI Same-Rule" --reporter=list`：10/10 通过。
- `node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs`：12/12 通过。

**防复发**

- 精确资源成本类合同必须用数据 import + side-effect instrumentation 证明，不能把断言弱化成 `>=`。
- `page.evaluate()` 内不能直接读取 Node import；静态数据合同放在 Node test，runtime 行为放在 browser test。
- GLM closeout 出现“弱化断言但合同没变”时，必须停止派下一张，由 Codex 接管或退回。

### DL-2026-04-15-31：Task127 启动后最近收口第三卡回退到旧 fallback

**表象**

Task127 已经派给 GLM，Task126 和 Task125 都是刚验收的连续工程任务；但看板 `最近收口` 的第三张一度显示 Task124，Task125 被挤掉。

**影响**

- 用户会以为 Task125 又丢了，或者最近收口不稳定。
- 当前任务推进链是 Task125 -> Task126 -> Task127；看板如果跳回 Task124，会降低队列可信度。

**根因**

`board-closeouts` 之前每条泳道只从当前 active / in_progress 前取 1 条已收口队列行。Task127 成为当前任务后，GLM 只贡献 Task126，Codex 只贡献 V9-CX14，第三张只能回退到旧 fallback，无法展示 Task125。

**处置**

- `scripts/board-closeouts.mjs` 改为：Codex 取当前任务前 1 条收口行，GLM 取当前任务前 2 条收口行。
- 新增回归：当前 GLM 任务前连续有 Task125 / Task126 accepted 时，两条都必须进入最近收口，不能被旧 fallback 顶掉。

**验证**

- `node --check scripts/board-closeouts.mjs`：通过。
- `node --test tests/board-closeouts.spec.mjs tests/dual-lane-companion.spec.mjs`：22/22 通过。
- `node scripts/generate-dual-lane-board.mjs`：看板最近收口前三为 V9-CX14、Task126、Task125。

**防复发**

- 最近收口不是“每泳道最新一条”这么简单；实际实现任务链需要展示连续 accepted 事实，尤其是 GLM 任务被 Codex 接管时。

### DL-2026-04-15-32：Task130 创建了重复 GLM job 且提示停在 queued prompt

**表象**

Task129 Codex accepted 后准备派发 Task130。companion 里一度出现两个同名 Task130 running job：`glm-mnzwywb1-8muyxz` 和 `glm-mnzx0q63-4zeh29`。同时 `glm-watch` 终端显示 `Press up to edit queued messages`，说明提示词已经贴进 Claude Code 输入框，但还没有真正提交执行。

**影响**

- 页面可能显示 GLM running，但实际还没有开始思考或改文件。
- 两个同名 running job 会让 feed / 看板不知道该追踪哪一个，增加重复派发和 token 浪费风险。
- 如果不处理，后续可能出现“右上角 running、日志不动”的假运行。

**根因**

1. Task130 队列更新、看板刷新和手动 companion dispatch 时间贴得太近，前一个 Task130 job 已被创建但没有完成提交确认。
2. `glm-watch.sh send` 的提交确认机制仍可能在 Claude Code queued prompt 状态下误认为已发送。
3. companion 状态层只知道 job 已创建为 running，不能单独证明 Claude Code 已经离开 queued prompt。

**处置**

- 手动向 `glm-watch` tmux pane 发送一次 Enter，确认最新 Task130 提示从 queued prompt 进入执行状态。
- 取消重复旧 job `glm-mnzwywb1-8muyxz`，只保留最新 job `glm-mnzx0q63-4zeh29`。
- 重新检查 `glm-watch` 状态，确认出现 `Implementing AI post-Keep T2 usage slice…`，不再停在 queued prompt。
- 补强 `glm-watch.sh` / `codex-watch.sh` / `lane-feed.mjs` 的 queued prompt 识别：兼容终端把 `Press` 渲染成 `P ress` 或 `P r e s s` 的情况。

**验证**

```bash
tmux -S "$TMPDIR/war3-re-tmux/glm-watch.sock" send-keys -t glm-watch:0.0 C-m
node scripts/dual-lane-companion.mjs cancel glm-mnzwywb1-8muyxz --json
./scripts/glm-watch.sh status
node scripts/dual-lane-companion.mjs status glm-mnzx0q63-4zeh29 --json
./scripts/glm-watch-feed.sh check
bash -n scripts/glm-watch.sh
bash -n scripts/codex-watch.sh
node --check scripts/lane-feed.mjs
node --test tests/lane-feed.spec.mjs
```

结果：旧 job 已 cancelled；最新 job `glm-mnzx0q63-4zeh29` running；GLM 终端已进入 Task130 执行中；feed 追踪最新 job。脚本语法检查通过，lane-feed 回归 41/41 通过。

**防复发**

- 派发后必须读取 `glm-watch.sh status`，只看到 companion running 不够。
- 如果终端出现 `Press up to edit queued messages`，必须补提交或标记 `needs_submit`，不能算作真实 running。
- 同名任务在同一泳道只能保留一个 running job；多出的必须立即 cancel。

### DL-2026-04-15-33：Task130 初版 closeout 带弱证明和隐性战术扩张

**表象**

GLM Task130 closeout 已完成主要实现，但报告 `v9-ai-keep-upgrade-readiness.spec.ts` 的 KU-6 仍是旧断言。同时新 proof 的 AT-2 只证明 “Workshop 或 Arcane Sanctum 至少一个出现”，没有同时证明两个二本建筑都通过真实建造路径启动。GLM 还把 `priest` 加入 AI 攻击波次，超出了“训练二本单位”的最小使用范围。

**影响**

- 旧 KU-6 会让完整回归无法通过。
- “任一 T2 建筑出现”的 proof 不能支撑 Task130 的目标，会留下 AI 只会走半条二本线的假绿。
- Priest 加入攻击波次会悄悄改变 AI 战术编队，后续若出现节奏或压力变化，很难追溯。

**根因**

1. GLM 按 Task127 之前的旧数据口径保留了 KU-6 断言，没有把 accepted 的 Keep/T2 migration 同步到旧 proof。
2. runtime proof 为了更容易通过，使用了 `hasWorkshop || hasSanctum`，弱化了任务要求。
3. GLM 把“Priest 是支援单位”推导成“加入攻击波”，但任务没有授权 AI 编队 / 波次策略扩张。

**处置**

- Codex 修正 KU-6：Workshop / Arcane Sanctum 的真实前置现在都是 `keep`。
- Codex 收紧 AT-2：必须同时出现 Workshop 和 Arcane Sanctum，且都处于在建状态并有 builder，证明走的是 `tryBuildBuilding()` 路径。
- Codex 给 Mortar / Priest 训练证明加精确扣费检查，并新增人口满时不能排队的 proof。
- Codex 去掉 `priest` 加入 `isMilitaryType()` 的改动；随军支援留给独立任务。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-ai-post-keep-t2-usage.spec.ts tests/v9-ai-keep-upgrade-readiness.spec.ts tests/v7-ai-same-rule-content-proof.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep'
```

结果：build 通过，typecheck 通过，runtime 21/21 通过，node contract 12/12 通过，cleanup 完成，无残留进程。

**防复发**

- GLM closeout 里凡是 `or` 型 proof 覆盖两个目标，Codex 复核时必须检查是否弱化了 “A 和 B 都要成立”。
- 支援单位是否进入 attack wave / formation 必须作为独立任务，不得混进训练或建筑解锁任务。
- accepted 后迁移旧 proof 是 Codex 复核责任，不能让 stale assertion 长期留在相关回归里。

### DL-2026-04-15-34：Task131 GLM 做出草稿但无 closeout，companion 误保留 running

**表象**

Task131 派发后，GLM 终端回到 Claude Code 空提示符 `❯`，但 companion 仍显示 job `glm-mo02bzn1-yl7e06` 为 `running`。进一步查看发现 GLM 已经改过账本文档和测试文件，但没有发出 `JOB_COMPLETE`，也没有完成验证报告。

**影响**

- 看板 / feed 可能把已经空闲的 GLM 误看成还在工作。
- 同标题 Task131 曾出现两个 interrupted job，容易触发重复派发或冻结。
- 初版测试直接 import 不存在的 `../src/game/GameData.js`，如果不复核会把失败 proof 当作完成。

**根因**

1. `dual-lane-companion` 只能识别“回到 shell”的中断；Claude Code 空闲时 pane command 仍是 `node`，所以旧逻辑看不出已经回到输入框。
2. `glm-watch.sh send` 之前只判断 queued prompt 是否消失，不能保证任务已经正确 closeout。
3. GLM 在静态 proof 里沿用 runtime/TS 测试的 import 方式，没有注意 `.mjs` node test 不能直接 import `src/game/GameData.ts` 或不存在的 `GameData.js`。

**处置**

- Codex 修复 `scripts/dual-lane-companion.mjs`：新增 Claude/Codex 常驻 agent 的空提示符检测；如果 job 仍 running、pane 仍是 `node` 但底部出现 `❯`，且没有 queued prompt / closeout marker，就标成 `interrupted / needs_reroute`。
- 新增 `tests/dual-lane-companion.spec.mjs` 回归，覆盖 false-running Claude prompt 和 queued prompt 不误判两类情况。
- Codex 接管 Task131，把 `tests/v9-t2-numeric-ledger-alignment.spec.mjs` 改成读取 `GameData.ts`、数值账本和人族终局合同文本的静态 proof。
- 队列记录 Task131 为 `accepted / Codex takeover`，下一张转入 Task132。

**验证**

```bash
node --check scripts/dual-lane-companion.mjs
node --test tests/dual-lane-companion.spec.mjs
node scripts/dual-lane-companion.mjs status glm-mo02bzn1-yl7e06 --json
node --test tests/v9-t2-numeric-ledger-alignment.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep' || true
```

结果：companion 单测 18/18 通过，Task131 job 被标成 `interrupted / needs_reroute`；T2 numeric ledger proof 5/5 通过；build、typecheck、cleanup 通过；无 Vite / Playwright / Chromium / runtime 残留。

**防复发**

- 以后 companion 不能只看 pane command；常驻 agent 空提示符也必须作为“已空闲但未 closeout”的中断信号。
- GLM 任务只要没有 `JOB_COMPLETE` 和可复跑验证，不能直接算 completed。
- `.mjs` 静态 proof 默认读取源码文本，避免伪 import TypeScript 运行时代码。

### DL-2026-04-15-35：Task132 初版 proof 漏验时间字段，任务边界错禁 Game.ts

**表象**

Task132 要求玩家在命令卡/选择面看到二本成本、人口、时间、前置和禁用原因。GLM 新增了 `tests/v9-t2-visible-numeric-hints.spec.ts`，但初版只验证了成本、人口和部分角色提示，没有真正验证 build/train time。GLM 还把任务表状态改成 `completed`，但没有发出 `JOB_COMPLETE`，runtime 命令也被 5 分钟 timeout 中断。

**影响**

- 如果直接接受，会得到一个漏验关键字段的假绿。
- 玩家仍然看不到建造时间 / 训练时间，和“数值提示”目标不一致。
- 原任务卡允许 `src/main.ts` / `src/styles.css`，却禁止 `src/game/Game.ts`；实际命令卡渲染逻辑在 `Game.ts`，这个 allowed / forbidden 边界是错的。

**根因**

1. GLM 按“当前 UI 已经有成本/人口”判断任务基本完成，没有逐条对照 Must prove 的 “build time / train time”。
2. 任务卡写文件边界时没先确认命令卡渲染位置，导致真正需要改的文件被 forbid。
3. GLM closeout 管理仍不稳定：运行了 build/tsc 和部分 runtime，但没有给完整 closeout，也提前改了队列状态。

**处置**

- Codex 接管 Task132。
- 修改 `src/game/Game.ts` 命令卡渲染：
  - 建筑按钮显示 `gold / lumber / buildTime`。
  - 训练按钮显示 `gold / lumber / supply / trainTime`。
  - Town Hall -> Keep 升级按钮显示升级耗时。
- 加强 `tests/v9-t2-visible-numeric-hints.spec.ts`：
  - Workshop / Arcane Sanctum 必须显示真实 buildTime。
  - Mortar Team / Priest 必须显示真实 trainTime。
- 修正 `docs/GLM_READY_TASK_QUEUE.md`，把 Task132 记录为 `accepted / Codex takeover`，并把 `Game.ts` 写入实际 allowed files。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-t2-visible-numeric-hints.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-t2-visible-numeric-hints.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v9-keep-upgrade-unlock-feedback.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep' || true
```

结果：build 通过，typecheck 通过，Task132 focused runtime 6/6 通过，关联提示回归 16/16 通过，cleanup 完成，无残留进程。

**防复发**

- 写任务卡前必须先定位真实 owner 文件，不能按猜测写 allowed / forbidden。
- “可见数值提示”类任务必须逐字段验收：成本、人口、时间、前置、禁用原因，缺一项不能 accepted。
- GLM 不允许只改队列状态为 completed；没有 `JOB_COMPLETE` 和完整验证输出时，只能由 Codex 复核后改 accepted。

### DL-2026-04-15-36：Task133 proof 过宽且旧验证延迟重跑，造成重复 runtime 消耗

**表象**

Task133 只需要一个二本角色 combat smoke。GLM 初版一次写了 476 行、9 个 V9 用例，再加 V7 关联包后变成 21 个 runtime tests。初轮验证失败在 RC-1：测试读取运行时 Unit 上不存在的 `attackType`，还把 Priest mana 当成 `UNITS.priest.mana`。Codex 修正测试后，GLM 侧延迟启动的旧验证又继续跑旧断言，占用 runtime lock 和高 CPU。

**影响**

- 旧验证重复消耗 Playwright / Chromium 资源。
- 失败原因来自测试断言误解当前数据位置，不是产品代码回归。
- 如果不人工清理，会让 Codex 自己的干净复跑排队等待，造成“看似还在跑，其实在跑旧任务”的错觉。

**根因**

1. GLM 把 smoke 写成了过宽回归包，没有控制用例数量和证明面。
2. GLM 未理解当前实现：`attackType` / `armorType` 在 `GameData.ts`，运行时 `Unit` 只持有 damage/range/cooldown；Priest mana 由 `PRIEST_MANA` 等常量在 spawn 时注入，不是 `UNITS.priest.mana`。
3. Claude Code 的异步 Bash/延迟命令会在 Codex 修补后继续跑旧文件快照，必须通过进程和输出确认。

**处置**

- Codex 终止旧 runtime 进程，清理 runtime lock、Vite、Playwright 和 Chromium 残留。
- Codex 接管并收窄 `tests/v9-t2-role-combat-smoke.spec.ts` 为 3 个 focused smoke：
  - T2 role data contract。
  - Mortar Siege/AOE enemy-only combat fixture。
  - Priest mana/Heal valid/invalid target fixture。
- Task133 记录为 `accepted / Codex takeover`，下一张切到 HN3 ability numeric model inventory。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-t2-role-combat-smoke.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep' || true
```

结果：build 通过，typecheck 通过，runtime 15/15 通过，cleanup 完成，无残留进程。

**防复发**

- “smoke”任务默认控制在 2-4 个 focused cases；需要扩大时必须说明为什么不是复用既有关联包。
- GLM 产物如果触发异步 runtime，Codex 修补后必须先确认是否还有旧进程在跑；旧进程不能作为新代码验证。
- 对运行时对象断言前要先确认字段实际在 runtime state 还是 GameData source 中。

### DL-2026-04-15-37：Task134 写出文档后停在 prompt，且提前把队列表状态写成 completed

**表象**

Task134 要求输出 HN3 ability numeric model 文档和 node 静态 proof。GLM 续跑后只写出了 `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`，没有创建 `tests/v9-ability-numeric-model-inventory.spec.mjs`，没有跑验证，也没有输出 Task134 closeout。但 `docs/GLM_READY_TASK_QUEUE.md` 的 Task134 状态被写成了 `completed`。

**影响**

- 队列状态会给看板和补货系统一个假完成信号。
- 没有 proof 时，HN3 只是文档陈述，不能作为下一张实现任务的可信边界。
- 如果继续让 GLM 重试，容易重复消耗而不是补齐缺口。

**根因**

1. GLM 在文档写入后又停在 Claude Code prompt，没有执行后续 test/build/cleanup。
2. 队列状态更新没有和 proof / closeout 绑定，仍可能出现“完成状态早于验收证据”。
3. HN3 文档类任务看似简单，但仍需要静态 proof 把文档声明和真实源码绑定。

**处置**

- Codex 接管 Task134。
- 补 `tests/v9-ability-numeric-model-inventory.spec.mjs`，静态读取 `GameData.ts`、`Game.ts` 和 HN3 文档。
- 把 Task134 改为 `accepted / Codex takeover`，新增 Task135 作为下一张 bounded task。

**验证**

```bash
node --test tests/v9-ability-numeric-model-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

结果：node proof 5/5 通过，build 通过，typecheck 通过，cleanup 完成。

**防复发**

- GLM 不得把任务标成 completed，除非同一 closeout 给出对应 proof 和验证输出。
- 文档类任务也必须有静态 proof；只写文档不能进入 accepted。
- 同一任务一次续跑仍停在 prompt 时，Codex 直接接管，不继续反复提示。

### DL-2026-04-15-38：Task135 静态 proof 截取错方法位置，Codex 修正后才接受

**表象**

Task135 要求只落 `ABILITIES.priest_heal` 数据种子，不迁移 `Game.ts`。GLM 写出了 `AbilityDef`、`ABILITIES.priest_heal` 和静态 proof，但 proof 的 DS-4 最初用 `game.indexOf('castHeal(')` 找方法，命中了调用点而不是方法定义；同时截取片段过短，导致测试失败。

**影响**

- 任务产物本身方向正确，但 proof 不能证明 `castHeal` 仍未读取 `ABILITIES`。
- 如果直接接受，会让 Task136 的前置证据不可信。

**根因**

1. 静态 proof 用宽泛字符串搜索定位源码，命中了第一个调用点。
2. proof 没有先用失败输出来确认截取片段是否覆盖完整方法体。
3. GLM closeout 对 proof 精度不足，没有主动修正。

**处置**

- Codex 修正 DS-4：定位 `castHeal(priest: Unit, target: Unit): boolean` 方法签名。
- Codex 把方法片段扩大到 1200 字符，覆盖 mana、range、cooldown 和 amount 读取。
- Task135 记录为 `accepted / Codex review`，Task136 才允许进入运行时迁移。

**验证**

```bash
node --test tests/v9-priest-heal-ability-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

结果：node proof 5/5 通过，build 通过，typecheck 通过，cleanup 完成。

**防复发**

- 静态 proof 定位方法时必须优先用方法签名或结构边界，不用宽泛调用名。
- 数据种子任务要明确证明运行时未改；迁移任务再证明运行时已改且行为不变。
- GLM 生成 proof 后必须先跑 proof 本身，不能只凭文件写入判断完成。

### DL-2026-04-15-39：Task136 GLM 半迁移后停在 prompt，旧阶段 proof 也被新阶段打破

**表象**

Task136 启动后，GLM 把 `Game.ts` 的 `ABILITIES` import、`updateCasterAbilities` 和 `castHeal` 迁移了一部分，但没有创建 runtime proof，也没有输出 closeout。与此同时，Task135 的旧静态 proof 还断言“Game.ts 不得引用 ABILITIES”，导致 Task136 正常推进后 Task135 proof 变成失败测试。

**影响**

- 工作树进入半完成状态：代码已经进入 Task136，但队列还显示 Task136 未验收。
- 如果不修旧 proof，后续全量 node proof 会被一个历史中间态断言卡住。
- GLM 终端显示 running / prompt 的状态容易再次误导看板。

**根因**

1. Task135 proof 把“种子落地时的临时状态”写成了永久合同。
2. GLM 在迁移任务中先改代码、后补 proof，但中途停在 prompt。
3. 伴随器能发现 idle prompt，但不能替代 Codex 做真实验收。

**处置**

- Codex 接管 Task136。
- 补 `tests/v9-priest-heal-runtime-data-read.spec.ts`，证明 `castHeal` 读取 `ABILITIES.priest_heal`，并用 runtime 验证治疗行为不变。
- 把 Task135 proof 改成阶段兼容：seed-only 阶段允许直接常量，runtime migration 阶段要求 `healDef` 读取 ability 字段。
- Task136 记录为 `accepted / Codex takeover`，下一张只派 Rally Call 数据种子。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-priest-heal-runtime-data-read.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
node --test tests/v9-priest-heal-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

结果：build 通过，typecheck 通过，runtime 13/13 通过，Task135 node proof 5/5 通过，cleanup 完成。

**防复发**

- 历史 proof 不应冻结“下一任务必然会改变”的中间状态；要么只证明数据种子本身，要么写成阶段兼容。
- GLM 对运行时迁移任务必须先写 focused proof，再宣称 closeout。
- 看板的 running 只能作为提示，验收仍以文件 diff + 本地验证为准。

### DL-2026-04-15-40：Task137 GLM 初版数据种子能写文件但不能通过编译

**表象**

Task137 要求只给 Rally Call 增加 ability 数据种子，不改运行时。GLM 写出了 `ABILITIES.rally_call` 和 HN3 文档草稿，但把 Rally Call 常量引用放在常量定义之前，导致 TypeScript 报“used before declaration”。同时初版 `targetRule` 用了不稳定的 `_any_military` 表达，并把建筑过滤留给注释解释。

**影响**

- 静态 proof 可能只验证文本存在，却漏掉真实 TypeScript 编译失败。
- 数据种子语义不够稳定，后续 runtime 迁移会把“非建筑友军单位”误读成隐藏约定。
- GLM 停在文档编辑错误和 prompt 后，看板容易显示 running 但任务没有真正 closeout。

**根因**

1. 数据种子任务仍然可能破坏编译顺序，不能只跑 node 文本 proof。
2. target rule 的字段表达没有足够明确，GLM 用注释补语义。
3. GLM 遇到文档 patch 错误后没有主动收敛成 blocked/complete closeout。

**处置**

- Codex 接管 Task137。
- 把 `RALLY_CALL_*` 常量移动到 `ABILITIES` 之前，修复编译顺序。
- 将 `ownerType` 固定为 `player_non_building_unit`，并在 `targetRule.excludeTypes` 明确写入 `building`。
- 补 `tests/v9-rally-call-ability-data-seed.spec.mjs`，证明数据种子字段齐全、引用现有常量、`Game.ts` 仍未迁移 Rally Call runtime。
- Task137 记录为 `accepted / Codex takeover`，下一张只派 Mortar AOE 数据种子。

**验证**

```bash
node --test tests/v9-rally-call-ability-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

结果：node proof 4/4 通过，build 通过，typecheck 通过，cleanup 完成。

**防复发**

- 所有 `GameData.ts` 数据种子任务必须跑 `npm run build` 和 `npx tsc`，不能只跑静态 proof。
- target rule 要用字段表达真实语义，不能依赖注释补关键过滤条件。
- GLM 遇到 patch 编辑错误后必须明确 `JOB_BLOCKED` 或继续修到可验证 closeout；不能留在 prompt。

### DL-2026-04-15-41：Task138 GLM 在 compact/queued message 后只留下半成品

**表象**

Task138 派发后，GLM 只在 `AbilityDef` 上新增了 `aoeRadius` / `aoeFalloff` 两个可选字段，随后进入 compact / queued message 状态。Codex 发送续跑指令后，终端显示指令排队和“Adding Mortar AOE ability data seed”，但没有继续改文件、没有生成 proof、没有 closeout。

**影响**

- GLM watch 状态容易看起来像 running，但实际任务没有推进。
- 如果不停止会话，GLM 可能稍后恢复并与 Codex 同时改 `GameData.ts` / HN3 文档。
- Task138 处于“有半成品但无验证”的状态，不能自动进入 accepted。

**根因**

1. 长会话上下文压缩后，Claude Code 的 queued message 状态不能等同于任务执行。
2. `glm-watch status` 只能告诉会话存在和最近 pane 文本，不能证明模型正在产出 diff。
3. 队列派发缺少“压缩后超时无 diff 自动止损”的硬规则。

**处置**

- Codex 停止 GLM 会话，避免并发写同一文件。
- Codex 接管 Task138，沿用合理的 `aoeRadius/aoeFalloff` 字段，并补完整 `ABILITIES.mortar_aoe`、HN3 文档和静态 proof。
- Task138 记录为 `accepted / Codex takeover`。
- 下一张 Task139 会拆得更窄，只迁移 Rally Call runtime 数据读取，减少 GLM 在长文档里再次卡住的概率。

**验证**

```bash
node --test tests/v9-mortar-aoe-ability-data-seed.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

结果：node proof 4/4 通过，typecheck 通过，build 通过。

**防复发**

- GLM 进入 compact / queued message 后，如果 5 分钟内没有新增 diff 或 closeout，Codex 直接停止会话并接管，不再反复续发同一指令。
- 派发给 GLM 的后续任务要更窄，减少同时写长文档和代码的概率。
- 看板必须把“running”与“最近是否有文件变化 / closeout”分开判断。

### DL-2026-04-15-42：Task139 已提交执行，但 companion 把它误判成 interrupted

**表象**

Task139 提交给 GLM 后，Claude Code 终端已经出现 `Reading Game.ts Rally Call implementation...` 和任务 checklist 进展；但 `dual-lane-companion` 仍把同一个 job 标为 `interrupted / needs_reroute`，`glm-watch-feed` 因同名任务冻结规则进入 `same_title_freeze`。

**影响**

- 看板会显示 GLM 卡住或 cooling down，实际终端仍在处理。
- feed 不会继续维护这个 running job，也不会正确反映“已经提交，不需要重发”。
- 如果人工误判后再次派同名任务，会制造重复提交和 token 浪费。

**根因**

1. Claude Code 在执行时仍可能显示输入提示符，companion 用“提示符存在”判定 idle/interrupt 过于粗糙。
2. lane-feed 的同名冻结只看 companion job 记录，没有二次读取终端中最新 job prompt 后的执行痕迹。
3. 已有 queued prompt 检测只识别 `Press up to edit queued messages`，没覆盖 `[DUAL_LANE_JOB]` 已贴入但未提交、以及已提交但 companion 误报的分叉。

**处置**

- `scripts/lane-feed.mjs` 新增对 `[DUAL_LANE_JOB]` prompt 的检测：没有后续执行痕迹时返回 `needs_submit`，有 `Scurrying/Reading/Read/Update/Bash` 等执行痕迹时按运行中处理。
- 在 same-title freeze 前读取 runtime pane；如果同名任务已提交并有执行进展，就返回 `runtime_progress_without_companion`，不再冻结也不重复派发。
- `tests/lane-feed.spec.mjs` 补两个回归：未提交 job card 要识别为 queued；companion 误报 interrupted 但 runtime 有进展时要识别为 running。

**验证**

```bash
node --test tests/lane-feed.spec.mjs
./scripts/glm-watch-feed.sh check --json
```

结果：lane-feed 43/43 通过；GLM feed 当前把 Task139 报为 `running / runtime_progress_without_companion`。

**防复发**

- feed 不再只信 companion 状态；关键分支必须读取终端 pane 的最新执行痕迹。
- 同名任务冻结前先确认 runtime 是否已经提交并有进展。
- 未提交和已提交两种状态分开处理：未提交只补 Enter/提示，不重复派发；已提交则按 running 维护。

### DL-2026-04-15-43：Task139 GLM 核心迁移完成，但误跑大套件并留下不可信 closeout 状态

**表象**

Task139 中，GLM 已把 Rally Call 运行时的 duration、range、cooldown 和 damage bonus 改成读取 `ABILITIES.rally_call`，也新增了 runtime proof 草稿；但验证阶段误用了 `./scripts/run-runtime-suite.sh tests/...`，触发默认 runtime 套件和浏览器，而不是只跑指定 focused specs。随后任务没有形成可信 closeout，需要 Codex 中断、清理并接管验收。

**影响**

- 大套件误启动会制造额外 Chromium / Vite 负载，浪费电脑电量和 token。
- 截断日志或错误命令不能作为 Task139 accepted 证据。
- 如果不记录，后续 GLM 可能继续把 `run-runtime-suite.sh` 当作 focused proof 命令使用。

**根因**

1. Task prompt 虽写了 focused runtime 命令，但 GLM 仍选用了历史大套件脚本。
2. closeout 规则只要求列出验证命令，没有硬拦“命令名必须匹配当前任务”。
3. runtime harness 有多个入口，`run-runtime-suite.sh` 和 `run-runtime-tests.sh` 容易被混用。

**处置**

- Codex 用 `Ctrl-C` 中断错误 runtime 套件。
- 执行 `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` 并确认无残留。
- 修正 Task139 proof 中浏览器侧不能读取 Node import 的问题。
- 用正确 focused 命令重跑 Rally Call runtime + V6 相关证明，Task139 由 Codex takeover accepted。

**验证**

```bash
npx tsc --noEmit -p tsconfig.app.json
npm run build
./scripts/run-runtime-tests.sh tests/v9-rally-call-runtime-data-read.spec.ts tests/v6-human-rally-call-identity-proof.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

结果：typecheck 通过，build 通过，focused runtime 13/13 通过，cleanup 完成且无 runtime 残留。

**防复发**

- 后续 GLM runtime prompt 必须明确写“不要使用 `run-runtime-suite.sh`；focused 验证只用 `run-runtime-tests.sh`”。
- Codex 复核 closeout 时先看命令名，再看测试结果。
- 如果 GLM 启动错误大套件，立即中断和清理，不等待它自然跑完。

### DL-2026-04-15-44：Task140 验证被 cleanup 打断，Codex 接管重跑同一 focused 命令

**表象**

Task140 中，GLM 已完成 Mortar AOE runtime 读取迁移，并启动了正确的 focused runtime 命令；但 Codex 在发现浏览器残留后执行 cleanup，撞上正在运行的 GLM runtime 进程，导致该验证以 exit 143 中断。之后 `glm-watch-feed` 把 Task140 标成 interrupted / same-title freeze。

**影响**

- GLM 的 Task140 验证结果不能作为 accepted 证据。
- 如果重新派同名任务，会造成重复提交和额外 token 消耗。
- cleanup 与运行中验证缺少互斥确认，会误杀有效 focused 测试。

**根因**

1. cleanup 前没有先确认当前 `run-runtime-tests.sh` 是否属于 GLM 正在执行的有效 focused proof。
2. GLM 状态面板显示 interrupted / running 混杂，Codex 需要用 `ps` 和 pane 输出一起判断。
3. Task140 代码已到位，但 closeout 没有稳定落下，验收责任需要 Codex 接管。

**处置**

- Codex 没有重派 Task140 给 GLM，避免同名重复。
- Codex 修正 Task140 proof 与旧静态 proof 的 Task140 后状态。
- Codex 本地重跑同一条 focused runtime 命令，并在通过后执行 cleanup。
- Task140 记录为 `accepted / Codex takeover`，下一张改派 Task141。

**验证**

```bash
node --test tests/v9-ability-numeric-model-inventory.spec.mjs tests/v9-rally-call-ability-data-seed.spec.mjs tests/v9-mortar-aoe-ability-data-seed.spec.mjs tests/lane-feed.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
npm run build
./scripts/run-runtime-tests.sh tests/v9-mortar-aoe-runtime-data-read.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

结果：静态 proof 56/56 通过，typecheck 通过，build 通过，focused runtime 9/9 通过，cleanup 完成。

**防复发**

- cleanup 前先跑 `ps`，如果发现有效 focused runtime 正在跑，先等待或接管其结果，不直接清理。
- GLM 状态为 interrupted 但 `ps` 有同任务 focused 命令时，不重派任务。
- 运行时验收记录必须明确“谁启动的命令、是否被中断、最终由谁重跑通过”。

### DL-2026-04-15-45：Task141 已提交执行，但 feed 没识别 Claude Code 的 Searching 进展

**表象**

Task141 派发后，GLM 终端已经出现 `Searching for 1 pattern` 并开始分析 `Game.ts`，但 `glm-watch-feed` 仍返回 `needs_submit / queued_prompt`，像是任务只贴到了输入框还没提交。

**影响**

- 看板可能误报“待提交”，用户会以为 GLM 没开始干活。
- 如果人工再补 Enter 或重派任务，可能造成重复输入和 token 浪费。
- companion 的 interrupted 状态和真实 runtime pane 进展会继续分叉。

**根因**

lane-feed 的 agent progress 识别覆盖了 `Scurrying / Thinking / Reading / Read / Update / Bash`，但漏掉了 Claude Code 常见的 `Searching` / `Searched` 行。

**处置**

- `scripts/lane-feed.mjs` 把 `Searching` 和 `Searched` 纳入已提交进展识别。
- `tests/lane-feed.spec.mjs` 新增回归，证明 runtime pane 里只有 `Searching for ...` 时也应判定为 running，而不是 queued。

**验证**

```bash
node --test tests/lane-feed.spec.mjs
./scripts/glm-watch-feed.sh check --json
```

结果：lane-feed 44/44 通过；GLM feed 当前把 Task141 报为 `running / runtime_progress_without_companion`。

**防复发**

- Claude Code 新增或变化的执行动词，只要会出现在 pane 中，都要纳入 `isAgentProgressLine` 回归。
- `needs_submit` 不能只看是否有提示符，还要看 job prompt 后是否出现任何 agent 执行动词。

### DL-2026-04-15-46：Task141 GLM 只完成核心代码迁移，未补 proof / closeout

**表象**

Task141 中，GLM 成功把 Rally Call / Priest Heal 的命令卡和可见提示从旧常量迁移到 `ABILITIES`，并移除了 `Game.ts` 中 `RALLY_CALL_*` / `PRIEST_HEAL_*` 的 import；但它停在 interrupted 状态，没有创建 `tests/v9-ability-command-card-data-read.spec.ts`，也没有形成 closeout。

**影响**

- 核心代码改动不能直接 accepted，因为缺少命令卡和手动 Heal 范围的 proof。
- 队列会把 Task141 看成未完成，容易重复派同名任务。
- 若 Codex 不接管补 proof，HN3 收口会缺“玩家可见读数也来自 ability 数据”的证据。

**根因**

1. GLM 完成代码迁移后只跑了 build / tsc，没有继续写 focused proof。
2. 当前 companion 对 Claude Code prompt / interrupted 状态仍偏保守，不能把“部分代码已完成”自动升为 completed。
3. Task141 的 proof 需要同时读源代码和浏览器命令卡，比纯静态迁移更容易被省略。

**处置**

- Codex 接管 Task141，不重复派发。
- 新增 `tests/v9-ability-command-card-data-read.spec.ts`，覆盖源代码读取、Rally Call 命令卡 / 状态提示、Priest Heal 命令卡和手动 Heal ability range。
- 本地重跑 build、tsc、focused runtime，并执行 cleanup。

**验证**

```bash
npx tsc --noEmit -p tsconfig.app.json
npm run build
./scripts/run-runtime-tests.sh tests/v9-ability-command-card-data-read.spec.ts tests/v9-priest-heal-runtime-data-read.spec.ts tests/v9-rally-call-runtime-data-read.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

结果：typecheck 通过，build 通过，focused runtime 14/14 通过，cleanup 完成。

**防复发**

- 以后“UI / command-card data-read”类任务必须在任务卡里把 proof 文件列为必交产物，缺 proof 时不接受。
- GLM 完成代码迁移但无 closeout 时，Codex 接管验收，不重派同名任务。

### DL-2026-04-15-47：Task142 文档先写了 Codex accepted，早于本地复核

**表象**

GLM 在 Task142 closeout 中把 `V9_HUMAN_NUMERIC_EXPANSION_PACKET` 写成“Task142 已被 Codex accepted”，但当时 Codex 还没有完成本地复核。

**影响**

- 文档会短暂高估任务状态。
- 如果 feed 或人读文档只看 accepted 字样，可能提前派发后续任务。
- 这会削弱“worker done”和“Codex accepted”之间的验收边界。

**根因**

GLM 把 closeout 预期状态写成了最终验收状态。任务卡只要求它完成文档和 proof，没有明确禁止 worker 自称 Codex accepted。

**处置**

- Codex 本地补做真实复核：`node --test`、build、tsc、cleanup。
- 复核通过后才把 Task142 记录为 accepted。
- 后续 closeout 口径继续要求：GLM 只能写 `done` / `completed`，`accepted` 只能由 Codex 本地复核后写入。

**验证**

```bash
node --test tests/v9-ability-data-read-closure.spec.mjs tests/v9-ability-numeric-model-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

结果：静态 proof 9/9、build、typecheck、cleanup 均通过。

**防复发**

- GLM 任务卡的 closeout 语义继续收紧：worker 完成不等于 Codex accepted。
- Codex 复核前不允许基于 GLM 自写 accepted 继续派实现任务。

### DL-2026-04-15-48：Task143 任务卡补上后，队列表仍残留 task-card-missing blocked

**表象**

Task143 的详细任务卡已经存在，但队列表顶部仍是 `blocked`，备注里残留“任务卡缺失，未派发”。`glm-watch-feed` 因此一度不派发；派发后 companion 又把正在工作的 Task143 标成 interrupted，容易让看板显示错位。

**影响**

- GLM 可能断供，虽然真实相邻任务已经可执行。
- 如果人工误以为没提交，可能重复派发同一个 Task143。
- 看板可能把“正在终端执行”的任务显示成 ready / interrupted。

**根因**

1. `markCandidateBlocked()` 会把缺任务卡状态写回队列表，但后续任务卡补上后没有自愈逻辑。
2. companion 对 Claude Code 当前 pane 的 closeout marker 依赖较强；任务已经开始搜索 / 写文件时，仍可能因为 job state 变 interrupted 而误报。

**处置**

- `lane-feed` 增加 `repairTaskCardMissingBlocks()`：如果 blocked 原因是任务卡缺失、任务卡后来存在且前置满足，自动恢复为 ready / card status。
- 当 runtime pane 已出现真实执行进展但 companion 报 interrupted 时，feed 保持 `runtime_progress_without_companion`，并把队列表提升为 `in_progress`，不重派同名任务。
- 新增回归覆盖 task-card-missing 自愈和 runtime-progress 保持 in_progress。

**验证**

```bash
node --test tests/lane-feed.spec.mjs
./scripts/glm-watch-feed.sh check --json
```

结果：lane-feed 45/45 通过；Task143 当前显示 `runtime_progress_without_companion`，队列表为 `in_progress`，没有重复派发。

**防复发**

- “任务卡缺失”是可恢复状态，不应永久锁住任务。
- companion state 和 runtime pane 不一致时，以已提交的 pane 进展阻止重复派发，并让队列表反映正在执行。

### DL-2026-04-15-49：Task143 closeout 缺 READY_FOR_NEXT_TASK，且验证输出被 tail 截断

**表象**

Task143 最终写出了合同和 proof，但 closeout 没有按任务卡要求以 `READY_FOR_NEXT_TASK:` 结尾；同时 GLM 的 `npm run build 2>&1 | tail -5` 在终端里显示过 timeout，但 closeout 仍写成 build passed。

**影响**

- 下一张任务不能可靠从 GLM closeout 自动推导。
- 截断/timeout 输出会让 build 结果不够可信。
- 如果 Codex 不重跑，会把不完整 closeout 当成验收证据。

**根因**

1. GLM 仍倾向用 tail 截断长输出，降低证据质量。
2. closeout 模板没有被严格执行，漏掉下一步 baton。
3. 队列状态 `done` 仍由 GLM 写入，和 Codex `accepted` 边界需要继续区分。

**处置**

- Codex 本地重跑 Task143 的 node proof、build、tsc、cleanup 和残留进程检查。
- 通过后才把 Task143 标为 `accepted`。
- Codex 手动补 Task144：只做 Militia 数据种子，不让 HN4 直接扩成三套 runtime。

**验证**

```bash
node --test tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

结果：HN4 合同 proof 5/5、build、typecheck、cleanup、无残留均通过。

**防复发**

- GLM closeout 里不能用 tail 截断作为可信 build/tsc 证据。
- 缺 `READY_FOR_NEXT_TASK` 的 closeout 不能自动补货，必须由 Codex 补下一张相邻任务。
- `done` 是 worker 完成，`accepted` 仍只由 Codex 本地复核写入。

### DL-2026-04-15-50：Task144 验证命令把旧合同 proof 变成必失败项

**表象**

Task144 要新增 `UNITS.militia` / `ABILITIES.call_to_arms` 数据种子，但任务卡同时要求跑 `tests/v9-hn4-militia-defend-contract.spec.mjs`。该旧 proof 的 HNC-5 原本断言 `GameData.ts` 不包含 `militia`，所以 Task144 一旦正确新增数据，旧 proof 必然失败。

**影响**

- GLM 正确实现数据种子后仍会被旧 proof 卡住。
- 为了修验证，GLM 修改了任务卡未列入 allowed files 的旧 proof 文件。
- 这会把“合同阶段证明”误当成“所有后续阶段都必须保持不变”的证明，阻碍真实迭代。

**根因**

Codex 在 Task144 任务卡里把 Task143 的合同 proof 直接放进验证命令，但没有提前把该 proof 设计成阶段兼容。合同 proof 只适用于“Task143 不改运行时代码”的时点，不应在数据种子落地后继续断言 `GameData.ts` 永远没有 `militia`。

**处置**

- GLM 已把 HNC-5 改成阶段兼容：继续禁止 `Game.ts` 出现 `militia` / `call_to_arms` runtime，继续禁止 `defend` / `back_to_work` 数据种子，但允许 Task144 的 Militia 数据种子存在。
- Codex 后续复核 Task144 时必须把这个 allowed-file 越界作为过程问题记录，但如果修改本身是纠正过期 proof，可以接受为任务卡修正。

**验证**

待 Task144 closeout 后由 Codex 本地重跑：

```bash
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

**防复发**

- 后续任务引用上一阶段 proof 时，先判断它是“永久合同”还是“阶段快照”。
- 如果后续任务需要改变上一阶段禁止项，任务卡必须把 proof 迁移文件列入 allowed files。
- 合同 proof 应尽量写成“无 runtime / 无 UI / 无未批准能力”，而不是“数据永远不存在”。

### DL-2026-04-15-51：Task144 完成主体改动后卡在队列文档更新，feed 进入同名冻结

**表象**

GLM 已完成 Task144 的主要改动、静态 proof 和 HN4 进展同步，但在更新 `docs/GLM_READY_TASK_QUEUE.md` 时出现 `Error editing file`，随后停在提示符。`glm-watch-feed status` 显示 `same_title_freeze`，队列表仍把 Task144 记为 `ready`。

**影响**

- 看板和队列表会误导成 Task144 还没开始或还没验收。
- 如果直接再次派发，可能重复消耗同一张任务的 token。
- Task145 无法自动进入，因为最新同名 interrupted 仍被派发器当作需要冷却。

**原因**

- Task144 任务卡的 allowed files 没有包含被它必须修正的旧合同 proof，导致 GLM 越界但越界本身是合理修复。
- GLM closeout 前写队列失败，没有输出 `READY_FOR_NEXT_TASK`。
- GLM 仍使用 `tail` 截断验证输出，build / tsc 可信度必须由 Codex 本地复验。

**修复**

- Codex 中断 GLM 的卡住状态并接管 Task144 验收。
- Codex 修正 `ABILITIES.call_to_arms.range` 为 `BUILDINGS.townhall.size * 2`，让数据种子表达“主基地附近触发”。
- Codex 加固 `tests/v9-hn4-militia-data-seed.spec.mjs`，改为读取对象块，避免全文件字符串误判。
- Codex 手动把 Task144 标为 `accepted`，补 Task145 任务卡，并更新 V9 证据账本、剩余 gate、双泳道状态。

**验证**

```bash
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

结果：node proof 10/10、build、tsc、cleanup 和残留检查通过。

**防复发**

- 只要任务需要改变上一阶段 proof 的阶段性禁止项，任务卡必须把该 proof 文件列入 allowed files。
- 派发器应继续把 stale same-title freeze 视为人工验收前的暂停信号，而不是自动重复派同题。
- Codex 接管验收后必须同步队列表、详细任务卡和 issue log，解除下一张任务的冻结。

### DL-2026-04-15-52：任务卡和 companion 同时写 closeout 要求，导致 GLM prompt 重复

**表象**

Task145 派发 prompt 中出现两段 `Closeout requirements`：第一段来自 `docs/GLM_READY_TASK_QUEUE.md` 的任务卡，第二段来自 `dual-lane-companion` 自动追加的真实 job id 要求。

**影响**

- prompt 更长，浪费 token。
- 第一段使用 `<job-id>` 占位，第二段使用真实 job id，容易让 worker 在 closeout 格式上摇摆。
- 用户已经明确关注 token 消耗和重复任务，这类重复提示必须收掉。

**原因**

`lane-feed` 负责把完整任务卡塞进派发 prompt；`dual-lane-companion` 又必须追加 job-specific closeout 标记。两者职责没有分开。

**修复**

- `scripts/lane-feed.mjs` 新增 `stripCloseoutRequirements()`，派发前从任务卡中剥离通用 closeout 段。
- 保留任务卡中的非通用备注，例如 `Codex note:`，避免误删上下文。
- `dual-lane-companion` 继续追加唯一可信的真实 job id closeout 要求。

**验证**

```bash
node --test tests/lane-feed.spec.mjs
```

结果：47/47 通过。

**防复发**

- 后续 closeout 格式只由 companion 负责落真实 job id。
- 任务卡可以保留 closeout 段用于人工阅读，但自动派发时不再重复发送。

### DL-2026-04-15-53：GLM 仍在工作，但 capture 窗口太短导致 feed 回退 same-title freeze

**表象**

Task145 执行中，终端已经显示 `Explore`、`Reading`、`Update(src/game/Game.ts)` 和 `Swirling`，但 `glm-watch-feed check` 一度返回 `same_title_freeze`。

**影响**

- 看板可能误显示 GLM 卡住或任务冻结。
- 如果人工只看 feed，不看 tmux，会误以为需要重派同一张任务。

**原因**

`glm-watch.sh capture` / `codex-watch.sh capture` 默认只取最近 300 行。Claude Code 的任务 prompt 很长，加上 diff 输出后，`[DUAL_LANE_JOB]` 标记和 `TITLE:` 容易被挤出 capture 窗口；`lane-feed` 因为找不到 marker，就退回同名历史冻结。

**修复**

- `scripts/glm-watch.sh` 新增 `GLM_CAPTURE_LINES`，默认 1200 行。
- `scripts/codex-watch.sh` 新增 `CODEX_CAPTURE_LINES`，默认 1200 行。
- `scripts/lane-feed.mjs` 增加 markerless progress fallback：当 job 标记已滚出窗口，但最近输出仍有 `Update(...)`、`Verifying...` 等 Claude 进展行时，继续判定为 running。
- interrupted 提示仍优先判为非运行，避免把真正中断的旧输出误当活任务。
- 只扩大 tmux 文本读取窗口，不新增 Node / Chrome / runtime 进程。

**验证**

```bash
bash -n scripts/glm-watch.sh scripts/codex-watch.sh
node --test tests/lane-feed.spec.mjs
./scripts/glm-watch-feed.sh check --json --no-dispatch
```

结果：shell 语法通过；lane-feed 49/49 通过；GLM 真在工作时返回 `runtime_progress_without_companion`，不重复派发同题。

**防复发**

- 长 prompt / 长 diff 任务不能依赖 80-300 行短窗口判断“是否提交”。
- 若后续 1200 行仍不够，应优先从 companion job log offset 判断，而不是重派任务。

### DL-2026-04-15-54：Task145 再次卡在 GLM 队列文档更新，且旧 proof 文件未列入 allowed files

**表象**

GLM 完成 Task145 主体实现和 runtime proof 后，静态 proof 失败，因为旧 proof 仍断言 `Game.ts` 不应包含 Militia runtime。GLM 于是修改了 `tests/v9-hn4-militia-data-seed.spec.mjs` 和 `tests/v9-hn4-militia-defend-contract.spec.mjs`，但这两个文件没有列在 Task145 allowed files。随后 GLM 连续三次更新 `docs/GLM_READY_TASK_QUEUE.md` 失败并卡住。

**影响**

- GLM 做了必要的 proof 迁移，但形式上越界。
- 队列表停留在 Task145 `ready`，看板无法表达真实进展。
- 如果不中断，会继续浪费 GLM token 在同一个编辑错误上。

**原因**

Codex 任务卡设计仍然少列了“阶段迁移 proof”文件。Task145 要把 `call_to_arms` 接进 runtime，就必然需要把 Task144 的“无 runtime”静态 proof 改成“runtime 读数据，Defend/Back to Work 仍 absent”的 proof。

**修复**

- Codex 中断 GLM，接管 Task145 复核。
- Codex 补强 `morphToMilitia`：清理 `buildTarget`、reciprocal `builder`、`gatherTimer` 和 previous-order 快照。
- Codex 手动把 Task145 标为 `accepted`，补 Task146，并在 Task146 allowed files 中明确列入会被阶段迁移影响的旧 proof 文件。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

结果：build、tsc、runtime 6/6、node proof 10/10、cleanup、无残留通过。

**防复发**

- 只要下一任务会让上一任务的“不存在”断言变成过期断言，必须把旧 proof 文件加入 allowed files。
- GLM 连续队列文档编辑失败时，Codex 应中断接管，不让它无限重试。

### DL-2026-04-16-55：Task146 初版完成后旧回归未迁移，导致 Back to Work 与 Task145 断言冲突

**表象**

Task146 初版新增了 `ABILITIES.back_to_work` 和“返回工作”按钮，新 runtime proof 一度通过，但旧 `tests/v9-hn4-militia-call-to-arms-runtime.spec.ts` 仍断言 Militia 变身期间不应出现 Back to Work。结果 Task145 回归在 proof-5 失败。

**影响**

- 新任务完成后，旧任务回归变成反向失败。
- 如果只看新 spec，会误以为 Task146 已经完成；如果只看旧 spec，会误以为新功能是回归。

**原因**

这是阶段迁移类任务的典型问题：Task145 时代 Back to Work 不能出现；Task146 时代 Back to Work 必须出现。任务卡虽然列入旧 proof 文件，但 GLM 初版没有同步修改旧 runtime 回归语义。

**修复**

- Codex 接管 Task146。
- 把旧 Call to Arms proof-5 改成：Militia 期间显示“返回工作”，仍不显示 Defend。
- 把 Back to Work proof-3 改成真实点击命令卡按钮，而不是直接调用内部 revert。
- `Game.ts` 新增 `backToWork()`，读取 `ABILITIES.back_to_work` 的 ownerType / morphTarget；命令卡 label 也读取 ability 数据。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
```

结果：build、tsc、runtime 12/12、node proof 10/10 通过。

**防复发**

- 任何“从 absent 变 present”的阶段迁移任务，都必须同时改新 spec 和旧回归中的阶段语义。
- proof 名称和注释也要同步，避免测试实际行为和说明相反。

### DL-2026-04-16-56：markerless progress fallback 过宽，GLM 已回到提示符仍被看成 running

**表象**

Task146 失败后，GLM 终端已经回到 `❯` 提示符，但 `glm-watch-feed check --no-dispatch` 仍返回 `runtime_progress_without_companion`，看板上像是 GLM 还在工作。

**影响**

- Codex / 用户会误以为 GLM 正在继续处理失败。
- 下一张任务不会派发，形成“看似运行、实际空闲”的断供。

**原因**

前一版 markerless fallback 只要最近 80 行里出现 `Update(...)`、`Bash(...)`、`Verifying...` 等进展行，就判定运行中，没有检查这些进展行之后是否已经出现 Claude Code 空闲提示符。

**修复**

- `scripts/lane-feed.mjs` 增加 idle prompt 检测：最近进展行之后如果出现 `❯` 或 `bypass permissions on`，不再判定为运行中。
- `hasSubmittedLaneJobProgress()` 和 markerless fallback 都改用同一套“未回到提示符的进展”判断。
- 新增 lane-feed 回归：长输出仍能识别运行中；但终端回到提示符后必须判为非运行。

**验证**

```bash
node --test tests/lane-feed.spec.mjs
./scripts/glm-watch-feed.sh check --json --no-dispatch
```

结果：lane-feed 50/50 通过；Task146 终端回到提示符后，feed 返回 `same_title_freeze`，不再假报 running。

**防复发**

- markerless fallback 只能用于“标记被滚出窗口但任务仍在执行”的情况。
- 只要空闲提示符出现在最新进展之后，就必须认为执行已停，需要进入 review / takeover / freeze，而不是继续等待。

### DL-2026-04-16-57：Task147 数据半成品后停在提示符，旧 Militia proof 又因 Defend seed 阶段迁移失败

**表象**

Task147 派发后，GLM 写入 `ABILITIES.defend` 和几个 `AbilityDef` 字段，随后停在 `❯` 提示符，没有创建 `tests/v9-hn4-defend-data-seed.spec.mjs`，也没有 closeout。Codex 接管后第一次静态验证失败，因为旧 `tests/v9-hn4-militia-data-seed.spec.mjs` 仍断言“不允许 defend seed”。

**影响**

- Task147 只完成了半个数据改动，没有 proof。
- 旧 proof 的 absent 断言再次成为阶段迁移阻塞。

**原因**

Task147 仍属于“从 absent 变 present”的迁移任务。虽然任务卡列了旧 proof 文件，但 GLM 停在创建 proof 前；Codex 接管时需要同时处理新 proof 和旧 absent 断言。

**修复**

- Codex 接管 Task147。
- 将 `affectedAttackType` 从字符串 `'Piercing'` 改成类型化 `AttackType.Piercing`。
- 新增 `tests/v9-hn4-defend-data-seed.spec.mjs`，证明 Defend 数据 seed、Piercing 减伤、速度惩罚和 `Game.ts` runtime 缺席。
- 迁移旧 Militia data proof：现在允许 `back_to_work` 和 `defend` 数据都存在，但仍不允许 Defend runtime。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
```

结果：build、tsc、node proof 15/15 通过。

**防复发**

- 数据 seed 任务必须先写 proof，再允许更新队列状态。
- 任何旧 proof 文件里写着“no X seed allowed”的断言，在 X 的数据 seed 任务中必须被主动迁移。

### DL-2026-04-16-58：Task148 runtime 已完成但面板和残留进程状态脱节

**表象**

Task148 中 GLM 完成了 Footman Defend runtime，并在面板里跑出 HN4 runtime 18/18 通过；但 Codex 侧上下文压缩后看不到原始输出流，系统里还短暂存在同名 Playwright / Chromium 进程和 runtime lock。与此同时，旧 Back to Work 静态 proof 仍断言 `Game.ts` 不应包含 Defend runtime。

**影响**

- 如果 Codex 直接重跑，会和 GLM 同名 runtime 测试抢锁，浪费 CPU / GPU。
- 如果只看 `glm-watch-feed` 的 same-title freeze，又会误以为 Task148 未完成。
- 旧 proof 未迁移会让正确的 Defend runtime 被当成回归。

**原因**

1. 上下文压缩前启动的 runtime 命令丢失了可见输出流。
2. GLM 的 Claude Code 面板已经回到提示符，但清理和状态读取之间存在短暂滞后。
3. Task148 也是“从 absent 变 present”的阶段迁移，旧 proof 需要同步改成“Defend runtime 应该存在”。

**修复**

- Codex 没有再并发启动第三条 runtime；先抓 `glm-watch status` 面板输出，确认 GLM 已得到 HN4 runtime 18/18。
- 清掉无价值的同名等待命令，等待真实 runtime 自然结束后确认无残留。
- 迁移旧 Back to Work / Militia 静态 proof：Task148 之后 `Game.ts` 应读取 `ABILITIES.defend`、`defendActive`、`defend.name` 和 `setDefend`。
- 把 Task148 标为 accepted，并新增 Task149 closure inventory，避免下一步直接扩成 AI / 素材 / 新兵种。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-defend-runtime.spec.ts tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

结果：build、tsc、HN4 runtime 18/18、HN4 static 15/15、cleanup、无残留通过。

**防复发**

- 看到同名 runtime 正在跑时，先抓面板 / job 输出，不要盲目重启。
- 阶段迁移任务的旧 proof 必须从“禁止出现”改成“必须从数据读取”，否则会持续制造假失败。
- 看板 / feed 后续要把“面板回到提示符但子进程仍在收尾”的短暂状态单独标成 finishing，而不是 running 或 idle。

### DL-2026-04-16-59：Task149 已完成但再次卡在队列文档编辑

**表象**

Task149 的 HN4 closure inventory 已经完成，`tests/v9-hn4-closure-inventory.spec.mjs` 与相关静态 proof 16/16 通过，build / tsc / cleanup 也通过。但 GLM 在最后更新 `docs/GLM_READY_TASK_QUEUE.md` 时出现 `Error editing file`，随后回到提示符；feed 返回同名冻结。

**影响**

- 工作实际完成，但队列表仍可能表现为 frozen / interrupted。
- 如果不人工收口，下一张任务不会稳定派发。
- 用户看到 GLM “running / frozen” 会误判为又停工。

**原因**

这不是实现卡住，而是长队列文档的大文件编辑失败。`GLM_READY_TASK_QUEUE.md` 已经非常长，GLM 的局部 patch 经常匹配失败；同类问题在 Task144 / Task145 已出现过。

**修复**

- Codex 本地复核 Task149 输出和测试。
- 手动把 Task149 从 `done` 收成 `accepted`，补 closeout 记录。
- 直接补下一张 Task150：`V9 HN5-PLAN1 Sorceress / Slow branch contract`，让 GLM 继续做低风险合同 / proof，不直接改 runtime。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

结果：build、tsc、node proof 16/16、cleanup、无残留通过。

**防复发**

- GLM 可以更新小型任务文档，但超长队列表 closeout 失败后应立即由 Codex 收口，不要让 GLM 无限重试。
- 后续应考虑把 `GLM_READY_TASK_QUEUE.md` 拆成当前队列、历史归档和任务卡目录，降低编辑冲突。

### DL-2026-04-16-60：Task150 合同把 Sorceress 写成无普通攻击

**表象**

Task150 的 HN5 合同初版把 Sorceress 数据候选写成 `attackDamage: 0`、`attackRange: 0`、`attackCooldown: 0`，说明为“无普通攻击（法师靠 ability）”。

**影响**

- 这会偏离 War3-like 的人族单位身份：Sorceress 应是弱远程 Magic 攻击 + Slow 核心法术，而不是纯无攻击施法器。
- 如果直接进入 HN5-DATA1，会把错误数值写进 `GameData.ts`，后续再改会造成无谓迁移。

**原因**

GLM 在做“合同任务”时过度保守，把“本分支核心是 Slow”理解成“单位不需要普通攻击”。合同 proof 只检查字段存在，没有检查字段是否符合 War3-like 角色语义。

**修复**

- Codex 在接受 Task150 前修正文档：Sorceress 改为弱远程 Magic 攻击，Slow 是核心身份。
- 补强 `tests/v9-hn5-sorceress-slow-contract.spec.mjs`，要求合同包含 `attackDamage` 和 `attackRange`。
- 同时把 Slow 的攻击速度减益写成后续可选字段，首个 runtime 先做移动速度减益，避免过早构建完整 buff/debuff 系统。

**验证**

```bash
node --test tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

结果：node proof 11/11、build、tsc、cleanup 通过。

**防复发**

- 合同类任务不能只证明“字段存在”，还要 proof 关键角色语义不会写反。
- 单位身份数据进入 `GameData.ts` 前，Codex 必须做一次产品准确性审查。

### DL-2026-04-16-61：Task151 自动启动后只写数据未补 proof

**表象**

Task151 被 GLM 自动接走后，写入了 `AttackType.Magic`、`UNITS.sorceress` 和 `ABILITIES.slow`，并跑了 typecheck，但没有创建 `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`。这导致前一阶段 HN5 合同 proof 仍在断言 GameData 没有 Sorceress / Slow，开始失败。

**影响**

- 数据 seed 可能被误认为越界，因为旧合同 proof 还停在“未实现”阶段。
- `AttackType.Magic` 如果只有 enum 没有显示名和倍率占位，后续 UI / 数值提示会出现空文本或默认倍率不透明。

**原因**

Task151 是又一个“从 absent 变 present”的阶段迁移。GLM 先写代码，再补 proof 的顺序不稳；而旧 proof 没有跟随阶段升级。

**修复**

- Codex 接管 Task151。
- 补 `ATTACK_TYPE_NAMES` 的“魔法”和 Magic 对各护甲的临时 1.0 倍率占位。
- 新增 `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`，证明 Sorceress / Slow 数据存在、Arcane Sanctum 仍未训练 Sorceress、`Game.ts` 仍无 runtime。
- 迁移 HN5 合同 proof：Task151 之后 GameData 应有数据种子，但 Game.ts 仍不得有 runtime。

**验证**

```bash
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

结果：node proof 10/10、build、tsc、cleanup 通过。

**防复发**

- 数据 seed 任务必须同批补阶段迁移 proof。
- 新 enum 值必须同步可见名称和倍率占位，不能只改 enum。

### DL-2026-04-16-62：Task152 只改训练列表后停在提示符，旧阶段 proof 再次过时

**表象**

Task152 自动启动后，GLM 只把 `sorceress` 加入 `BUILDINGS.arcane_sanctum.trains`，跑了 typecheck 后停在提示符；没有新增 `tests/v9-hn5-sorceress-training-surface.spec.ts`，也没有迁移旧的“当前阶段还不能训练 Sorceress”断言。

**影响**

- 代码层面女巫已可训练，但没有 runtime 证据证明命令卡、训练队列、产出单位和选择面板是成套可用的。
- HN4/HN5 的旧 proof 如果继续用“不能训练 Sorceress”作为边界，会把下一阶段的正确实现误判为回归。
- 选择面板和视觉工厂不认识 `sorceress` 时，训练出来的单位会显示英文 key 或通用灰柱，用户看到的是半成品。

**原因**

这是又一次“阶段从禁止到允许”的迁移。GLM 做了最小代码改动，但没有同步调整 proof 语义，也没有覆盖玩家实际看到的训练面。

**修复**

- Codex 接管 Task152。
- 新增 `tests/v9-hn5-sorceress-training-surface.spec.ts`，证明 Arcane Sanctum 命令卡出现“女巫”，点击后进入正常训练队列并产出 Sorceress。
- 迁移 HN4/HN5 静态 proof：允许 Sorceress 训练面存在，但继续禁止 `ABILITIES.slow` / `speedDebuff` runtime。
- 让选择面板从 `GameData` 读取单位 / 建筑中文名，补女巫类型标签和 portrait。
- 在 `UnitVisualFactory.ts` 增加女巫 proxy，避免新单位落入通用 fallback。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs
```

结果：build 通过，typecheck 通过，Sorceress training runtime 2/2 通过，迁移后的静态 proof 16/16 通过。

**防复发**

- 每个“从禁止到允许”的任务必须同步迁移旧 proof，而不是只改目标文件。
- 任何新可训练单位都必须同时覆盖：命令卡、队列、产出、选择面板名称、基础数值和最小可读视觉。
- Slow runtime 前必须先补 Sorceress mana 初始化，避免在没有真实 caster resource 的单位上挂技能按钮。

### DL-2026-04-16-63：Task153 GLM 局部完成后停止，首版 runtime proof 调错更新入口

**表象**

Task153 自动派发后，GLM 写入 `UnitDef.maxMana` / `manaRegen` 和 `spawnUnit` 数据化 mana 初始化后停在提示符，没有输出 closeout，也没有补完整 runtime proof。Codex 接管后，首版 runtime proof 用 `updateUnits()` 等待 mana 回复，但当前 caster mana 回复真实入口是 `updateCasterAbilities()`，因此第一次 focused runtime 失败。

**影响**

- GLM 只完成了代码主干，缺少可复跑证据，不能直接算 accepted。
- 测试如果调用错误 tick 入口，会把“验证方式错误”误判为“游戏行为错误”，浪费一次 runtime。
- 同标题续派还触发过 same-title freeze，需要人工确认是误冻结后再放行，说明派发层仍要优先看真实任务状态和 job-id，而不是只看标题。

**原因**

- Task153 是从“Priest 专用 mana”迁移到“数据驱动 caster mana”的中间层任务，GLM 改了数据和初始化，但没有追踪到 mana 回复在 `updateCasterAbilities()` 中完成。
- runtime proof 对游戏 tick 分工理解不足，测试没有先证明自己调用的是同一条生产路径。
- feed 的同标题冻结能防重复，但在“上一张已被 Codex 接管收口、下一张仍需派发”时容易出现误判。

**修复**

- Codex 接管 Task153 closeout。
- 新增 `tests/v9-hn5-sorceress-mana-surface.spec.ts`，改为直接验证 `UNITS` caster 字段、`spawnUnit` 数据化初始化、Sorceress 可见 mana、`updateCasterAbilities()` 回复和上限、Priest Heal 不回退。
- 继续证明 `Game.ts` 仍未读取 `ABILITIES.slow`，没有 Slow 按钮或 `speedDebuff` runtime。
- 将 Task154 作为唯一下一张相邻任务写入队列和状态文档，避免继续重复派 Task153。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
```

结果：build 通过，typecheck 通过，Sorceress mana + training runtime 5/5 通过，HN4/HN5 静态 proof 16/16 通过。

**防复发**

- runtime proof 必须调用和生产逻辑一致的更新入口；不确定时先在测试里静态证明入口函数名和数据字段。
- GLM 只做局部代码改动且无 closeout 时，Codex 必须接管 proof 与验收，不允许把“提示符空闲”误当完成。
- same-title freeze 只作为防重复信号，不能替代 job-id、queue status 和 accepted closeout 三者校验。

### DL-2026-04-16-64：Task154 GLM 初版直接改基础速度，且重复启动 grep 型 runtime

**表象**

Task154 自动执行后，GLM 初版实现了 `castSlow`、`slowUntil`、命令卡按钮和过期恢复，但做法是在施放时直接修改 `target.speed`，过期时再按 `UNITS[target.type].speed` 猜测恢复。随后 GLM 在 Codex 已经接管并修测试时，反复启动只截取错误片段的 runtime 命令，和 Codex 最终整包抢 runtime lock。

**影响**

- 直接改 `unit.speed` 会和 Defend、Militia morph 等同样改速度的系统互相覆盖，后续很容易出现“过期恢复到错误速度”的隐藏 bug。
- grep / tail 型 runtime 不能作为验收结果，只能定位错误；重复运行会占用 Playwright / Chromium / GPU，拖慢机器。
- 双泳道同时操作同一任务时，容易出现“GLM 继续读 Codex 已修改文件并重复跑”的噪音。

**原因**

- GLM 把 Slow 当成一次性数值覆盖，而不是一个临时状态倍率。
- 当前 watch 机制允许 GLM 在同一任务中看到 Codex 修改后继续自发验证，没有“Codex 已接管验收，GLM 停止重复运行”的锁。

**修复**

- Codex 接管 Task154。
- 将 Slow 改成 `slowSpeedMultiplier` + `getEffectiveMovementSpeed`：基础 `unit.speed` 不被 Slow 覆盖，移动路径在 Slow 生效期临时套倍率。
- 新增 `tests/v9-hn5-slow-runtime-minimal.spec.ts`，覆盖手动施放、扣 mana、移动变慢、刷新、过期、低 mana 禁用、无目标不扣 mana、最近敌人选择和非 Sorceress 隐藏。
- 中断 GLM 重复启动的 focused grep runtime，由 Codex 单条整包完成最终验收。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-slow-runtime-minimal.spec.ts tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
```

结果：build 通过，typecheck 通过，HN5 Slow + mana + training runtime 9/9 通过，HN4/HN5 静态 proof 16/16 通过。

**防复发**

- 状态类效果优先走“基础值 + 临时倍率 / 状态”的读取路径，不直接覆盖基础字段。
- GLM 的 grep / tail 运行只能用于定位，不得写入 closeout；验收必须使用完整命令结果。
- Codex 接管同一任务后，应暂停 GLM 在该任务上的重复 runtime，等 Codex 更新队列后再派下一张。

### DL-2026-04-16-65：Task155 GLM 继续重复 tail/grep runtime，队列未及时从 ready 收口

**表象**

Task155 已经进入 Codex 接管阶段后，GLM 仍继续围绕 `tests/v9-hn5-slow-autocast-minimal.spec.ts` 运行 tail / grep 型 runtime，且面板输出停留在旧失败片段。与此同时，队列表格仍把 Task155 标为 `ready`，看板会继续把它当作可派发任务。

**影响**

- Task155 已经有代码和 focused runtime 结果，但状态源没收口时，系统可能再次派发同一任务。
- tail / grep 输出只显示错误片段，容易被误当成最终验证，造成重复 token 和重复 runtime 消耗。
- GLM 在 Codex 接管后继续读同一文件，会和 Codex 的最终 proof / isolation patch 互相打断。

**原因**

- feed / watch 的“运行中”判断仍偏向终端最近输出，而不是队列任务生命周期。
- Codex 接管后没有第一时间把 Task155 从 `ready` 改成 `accepted` 并补下一张 Task156。
- 自动施法测试涉及 runtime isolation，GLM 看到旧失败后不断用截断命令复跑，而不是先停下交给接管者整包验收。

**修复**

- Codex 中断 GLM 的重复 runtime，并完成 Task155 最终 proof。
- `tests/v9-hn5-slow-autocast-minimal.spec.ts` 固定为 4 个 focused proof，清掉旧敌方单位干扰，覆盖开关、自动施放、防重复扣 mana、接近过期刷新、关闭 / mana 不足不施放。
- `docs/GLM_READY_TASK_QUEUE.md` 把 Task155 标为 `accepted`，新增 Task156 作为唯一下一张相邻任务。
- `docs/CODEX_ACTIVE_QUEUE.md`、`docs/DUAL_LANE_STATUS.zh-CN.md`、V9 ledger / remaining gates / HN5 合同同步到 Task156。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-slow-autocast-minimal.spec.ts tests/v9-hn5-slow-runtime-minimal.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
```

结果：build 通过，typecheck 通过，HN5 Slow auto-cast + manual Slow runtime 8/8 通过，HN4/HN5 静态 proof 16/16 通过。

**防复发**

- Codex 接管后，必须先把旧任务从 ready / running 状态收口，再派下一张任务。
- 任务验收只认完整命令结果；tail / grep 只能作为定位，不允许作为 closeout。
- 自动化派发应优先读取 queue status + latest accepted closeout，而不是只看终端输出是否还有旧失败片段。

### DL-2026-04-16-66：Task156 已写半成品但 feed 仍报告 same-title freeze

**表象**

Codex 检查 `glm-watch-feed.sh check --json` 时，feed 返回 `same_title_freeze`，提示 Task156 最近 attempt 仍被冻结；但 `glm-watch` 面板里已经出现 Task156 的实际文件编辑：新增 HN5 closure inventory proof，并修改 HN5 合同、Human expansion packet、remaining gates。GLM 随后停在提示符，没有完整 closeout。

**影响**

- 状态层说“冻结 / 不派发”，实际终端已经写了半成品，容易让 Codex 误以为没有变更。
- 如果不立刻审 diff，后续补货可能基于旧 queue 状态继续派同题或覆盖半成品。
- GLM 已经把文档写成 Task156 完成，但队列还没 accepted，容易让看板、queue 和 proof 三者不一致。

**原因**

- same-title freeze 只看最近任务标题和冷却窗口，不能说明工作区是否已有实际文件改动。
- GLM 的终端状态与 queue state 不是单一真源；需要 Codex 在每次 freeze / interrupted 后同时看 git diff。
- Task156 是文档 / proof 型任务，完成速度很快，可能在 feed 冷却判断前已经写完大部分文件。

**修复**

- Codex 读取 `tests/v9-hn5-closure-inventory.spec.mjs` 和相关文档 diff。
- 本地运行 `node --test tests/v9-hn5-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs`，18/18 通过。
- Codex 将 Task156 正式标为 `accepted`，并补下一张 Task157：Castle / Knight 分支合同。

**防复发**

- feed 返回 `same_title_freeze` 或 `cooldown` 时，Codex 仍必须检查 `git status --short` 和相关文件 diff。
- GLM 停在提示符但工作区已有目标文件变更时，必须进入“复核 / 接管”流程，而不是继续等待。
- 文档型任务必须在 queue、status、ledger、看板四处同步后才算 accepted。

### DL-2026-04-16-67：Task157 合同初版简化 Knight 前置，且停在 build 输出前

**表象**

Task157 自动启动后，GLM 写出了 HN6 Castle / Knight 合同和静态 proof，并运行了 node proof；随后执行 `npm run build 2>&1 | tail -3` 后停在提示符，没有完整 build/tsc closeout。合同初版还把 Barracks 当前训练面写成只有 Footman，并把 Knight 前置倾向性简化为 Castle。

**影响**

- 如果直接接受，会把 Knight 的 War3-like 前置复杂度降成“只要 Castle”，后续实现会偏离 Human tech tree。
- 只看 tail 输出无法证明 build 完整通过。
- 合同文件会变成后续自动补货源，一旦源头简化，后面任务会持续生成错误切片。

**原因**

- GLM 做合同任务时没有先对齐当前 `GameData.ts` 事实：Barracks 已经训练 Footman / Rifleman。
- 当前 `UnitDef.techPrereq` 只有单一字符串，GLM 没有把“多前置表达不足”作为合同问题显式写出。
- 仍然沿用 tail 型验证命令，导致 closeout 不完整。

**修复**

- Codex 修正 HN6 合同：Barracks 当前事实改为 `footman` / `rifleman`；Knight 前置明确保留 Castle + Blacksmith + Lumber Mill，不允许静默降级。
- Castle reference cost 改为 360/210，build time 记录为 War3 参考 140；若后续按项目节奏压缩，必须在数据 seed proof 中明示。
- Task157 proof 加到 7/7，新增前置复杂度检查。
- Codex 本地复跑 `node --test tests/v9-hn6-castle-knight-contract.spec.mjs`、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 后接受。

**防复发**

- 分支合同任务必须先对齐当前代码事实，再写下一阶段目标。
- 任何 War3-like 前置若当前 schema 表达不了，必须写成显式 schema gap，不能静默简化。
- 验收命令不得用 tail 截断作为通过证据；Codex 接受前必须本地跑完整命令。

### DL-2026-04-16-68：Task158 代码已完成，但队列和合同 proof 没有同步收口

**表象**

GLM 已经写入 `BUILDINGS.castle`、`keep.upgradeTo = 'castle'` 和 Castle 数据 proof，但 `docs/GLM_READY_TASK_QUEUE.md` 的任务正文仍停留在 `Status: completed` / 旧 closeout 要求；`docs/CODEX_ACTIVE_QUEUE.md` 仍把 V9-CX46 标为 active。GLM 还一度把 HN6 合同 proof 改成互相矛盾的断言：既要求 Castle 数据存在，又残留旧的“keep 不应指向 castle”语义。

**影响**

- 看板会显示 Task158 似乎还没被 Codex 接受，导致下一张任务无法稳定补货。
- 合同 proof 如果不修，会把 Task157 的历史合同和 Task158 的当前数据 seed 混成一套矛盾标准。
- 后续自动派发可能重复 Castle 数据种子，而不是进入 Keep -> Castle runtime。

**原因**

- GLM 完成实现后没有把 queue、Codex active queue、status、ledger 和 next task 一次性同步。
- proof 文件既承担“合同定义”又承担“当前状态证明”，任务推进后必须迁移断言，否则旧断言会反向阻塞新成果。
- GLM 仍倾向用截断验证和局部文档编辑结束，没有形成完整 closeout。

**修复**

- Codex 修正 `tests/v9-hn6-castle-knight-contract.spec.mjs` 的 HN6C-7，使它验证当前正确状态：Castle 数据存在、Keep 指向 Castle，但 `Game.ts` 没有 Castle runtime，`UNITS` 没有 Knight。
- Codex 本地复核 `node --test tests/v9-hn6-castle-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs`，12/12 通过；`npm run build` 和 `npx tsc --noEmit -p tsconfig.app.json` 通过。
- Codex 把 Task158 标为 accepted，并补 Task159：只做 Keep -> Castle 最小升级路径。

**防复发**

- 数据 seed 被接受后，下一张必须从“当前状态”生成，而不是从旧合同的禁止项机械复制。
- 同一个 proof 文件从合同阶段进入实现阶段时，必须拆清“仍禁止什么”和“已经完成什么”。
- 每次 GLM 停在提示符后，Codex 要检查 queue、active queue、status、ledger、remaining gates 五处是否一致。

### DL-2026-04-16-69：Task159 半启动后停在提示符，且首次 runtime 用了旧 dist

**表象**

feed 返回 `same_title_freeze`，但 tmux 面板显示 GLM 已经开始 Task159 并修改了 `Game.ts`。GLM 停在提示符，没有写完整 runtime proof，也没有完成 closeout。Codex 接管后第一次跑 focused runtime 时，KC-3 显示 Castle 已完成但 `checkGameOver()` 仍判 defeat；进一步检查发现浏览器跑的是旧 `dist`，不是刚修改过的 `Game.ts`。

**影响**

- 如果只看 feed，会误以为 Task159 只是冷却，没有真实改动。
- 如果不先 rebuild，runtime proof 会用旧 bundle 得出假失败，浪费时间和 token。
- GLM 的 closeout 把 runtime proof 写成 3/3，但 Codex 实际要求还要迁移旧 Keep proof，最终应是 focused runtime 9/9。

**原因**

- GLM 在同一任务中断后没有把“已改文件但未验证”的状态写回队列。
- `run-runtime-tests.sh` 使用当前 `dist` 预览；源码变更后必须先 `npm run build`，否则浏览器跑旧代码。
- HN2 旧测试仍假设 Castle 不存在；Task158/159 推进后必须同步迁移旧 proof，否则旧 proof 会反向阻塞新能力。

**修复**

- Codex 接管 Task159，新增 `tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts`。
- Codex 更新旧 Keep runtime proof：Castle 数据现在存在，但 Town Hall -> Keep 第一段不能跳级到 Castle，也不能出现 Knight。
- Codex 先跑 `npm run build`，再跑 focused runtime，最终 9/9 通过。

**防复发**

- 每次 runtime code 改动后，focused runtime 前必须先 build。
- feed 返回 cooldown / freeze 时，仍必须查 tmux 和 git diff。
- 新阶段能力落地后，要同步迁移旧 proof 中已经过期的“禁止存在”断言。

### DL-2026-04-16-70：Task160 自动推进但 closeout 口径把 schema 字段写成已接 runtime

**表象**

GLM 在 Codex 还在同步 Task159 文档时继续推进 Task160，并把队列表头标成 `completed`。实现只新增了 `UnitDef.techPrereqs?: string[]` 和静态 proof，方向正确；但字段注释写成“checked at runtime when present”，容易让后续任务误以为 Game.ts 已经支持多前置。

**影响**

- 如果直接接受，Task161 可能新增 `UNITS.knight` 后误以为训练门禁已经能检查 Castle + Blacksmith + Lumber Mill。
- 队列 / 状态页会短时间出现“Task160 待派发”和“Task160 completed”并存。
- closeout 写 proof 6/6 + contract 7/7，Codex 实际复核口径是合并 node proof 13/13。

**原因**

- GLM 对“schema 已定义”和“runtime 已消费”之间的边界仍不够敏感。
- 自动推进发生在 Codex 同步状态文档期间，导致状态页落后一拍。
- 任务生成时虽然 forbids Game.ts，但没有明确禁止在注释中宣称 runtime 行为已存在。

**修复**

- Codex 修正 `GameData.ts` 注释：`techPrereqs` 是未来多建筑前置列表，runtime support 单独接。
- Codex 修正 Task160 proof 文案：Game.ts 当前不消费 `techPrereqs`。
- Codex 本地复核 `node --test tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs`，13/13 通过；build、tsc 通过。

**防复发**

- schema-only 任务必须写清“字段存在”和“运行时生效”是两步。
- 自动化状态页落后时，以 git diff + proof 复核为准，再同步 queue/status。
- 下一张 Task161 必须继续禁止 Game.ts 和 Barracks training，避免数据种子直接变成可玩训练。

### DL-2026-04-16-71：Task161 推进后旧 proof 仍按“无 Knight”判断，且 Knight 速度偏保守

**表象**

Task161 已新增 `UNITS.knight` 和静态 proof，但一部分 HN6 proof / 文档说明仍沿用 Task160 之前的“无 Knight”口径。GLM 初始数据把 Knight speed 写成 3.2，虽然能通过“高于 Footman”的弱身份判断，但不够贴近当前项目里“快速单位”的尺度。

**影响**

- 旧 proof 会把新阶段的正确事实误判成回归，或让看板显示“数据已完成”和“仍无 Knight”并存。
- 如果不修正 speed，Knight 作为 T3 高机动重骑的身份会偏弱，后续训练和战斗 smoke 会继承不清楚的数值。
- 自动补货会基于过期口径生成重复或错误任务。

**原因**

- 同一批 HN6 proof 在合同、schema、data seed 三个阶段之间复用，任务推进后没有一次性迁移注释和断言。
- GLM 完成数据 seed 后没有把 Codex accepted 状态、下一张 Task162 和所有状态文档同步完整。
- 数值 proof 只验证“强于 Footman”，没有验证“符合当前项目快速重骑尺度”。

**修复**

- Codex 将 Knight speed 从 3.2 调整为 3.5，使其高于 Footman 3.0，并与当前快速单位尺度对齐。
- Codex 修正 HN6 contract / data / prereq proof 的过期口径：当前状态是 Knight 数据存在，但 Barracks 训练、Game.ts 多前置 runtime 和 AI Knight 仍未打开。
- Codex 把 Task161 标为 accepted，并新增 Task162：只做 Knight 训练入口和 Castle + Blacksmith + Lumber Mill 多前置 runtime 检查。

**验证**

```bash
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs tests/v9-hn6-castle-data-seed.spec.mjs
```

结果：HN6 static proof 24/24 通过。build、tsc 在本轮 Task161 closeout 中继续作为接受门槛复跑。

**防复发**

- 阶段推进后，proof 里“禁止存在”的断言必须迁移为“已存在但 runtime / AI /素材仍未打开”的当前事实。
- 数据 seed 任务不能只做相对强弱判断；关键身份数值需要对齐当前项目尺度。
- 队列文档必须在 accepted 时同步下一张相邻任务，避免重复派发刚完成的数据 seed。

### DL-2026-04-16-72：Task162 只跑静态 proof 就停下，runtime 扣费断言被采金收入污染

**表象**

Task162 自动启动后，GLM 完成了核心代码：Barracks 加入 Knight，`getTrainAvailability` / `trainUnit` 加入 `techPrereqs` 检查；但它停在提示符前只跑了 tsc 和静态 proof，没有提供浏览器 runtime proof。Codex 补 runtime 后，第一轮 KTP-2 失败：期望训练扣 245 金，实际净差额只有 45 金。

**影响**

- 如果只接受静态 proof，无法证明按钮禁用原因、正常训练队列、扣费、人口和产出真的在浏览器里成立。
- 扣费断言如果用 45 秒后的资源差额，会被初始农民采金收入污染，导致假失败或假绿。
- GLM 的状态页会显示 completed，但还没有达到 Codex accepted 的工程证据。

**原因**

- GLM 对 runtime 任务仍容易停在“代码 + 静态测试”层，没有补真实可玩路径证明。
- 当前 runtime fixture 默认农民自动采金，训练等待期间资源会继续变化。
- 测试设计最初把点击后到训练完成后的净资源差当成扣费证据，忽略了持续收入。

**修复**

- Codex 新增 `tests/v9-hn6-knight-training-prereq-runtime.spec.ts`。
- KTP-1 证明缺 Castle / Lumber Mill 时 Knight 按钮 disabled，并显示“需要城堡 / 需要伐木场”等具体原因。
- KTP-2 证明三前置齐全时按钮可用，点击后立即扣 Knight cost、进入正常训练队列，等待 trainTime 后产出真实 Knight，并增加 4 人口。
- 扣费断言改成点击后的即时资源差额，不再用训练完成后的净资源。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs tests/v9-hn6-castle-data-seed.spec.mjs
./scripts/run-runtime-tests.sh tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts tests/v9-hn6-knight-training-prereq-runtime.spec.ts --reporter=list
```

结果：build 通过，typecheck 通过，HN6 static proof 24/24 通过，focused runtime 5/5 通过。

**防复发**

- 任何“命令卡按钮 + 队列 + 资源”的任务，必须有 browser runtime proof，不能只靠静态字符串证明。
- 资源扣费要在点击后立即取差额；如果测试跨越训练/建造时间，要单独考虑采集收入。
- GLM completed 只是 worker closeout，Codex accepted 前不能自动进入下一张实现任务。

### DL-2026-04-16-73：Task163 初版 proof 把数据表字段误当成运行时单位字段

**表象**

GLM 的 Task163 closeout 声称 Knight combat smoke 通过，但 Codex 本地运行 `tests/v9-hn6-knight-combat-smoke.spec.ts` 时 KCS-1 失败：测试读取 `knight.attackType` 和 `knight.armorType`，实际运行时 `Unit` 对象不保存这两个字段。

**影响**

- 这不是生产代码 bug，而是 proof 和实现边界不一致。
- 如果直接接受，会把“数据表字段必须复制到运行时对象”变成错误合同，后续 HUD / combat 数据读取会被迫走错方向。
- GLM 的 completed 状态再次证明不能直接等同 Codex accepted。

**原因**

- `dealDamage` 和 HUD 都从 `UNITS[type]` / `BUILDINGS[type]` 读取 attack / armor 类型。
- 测试没有先核对现有数据源边界，就把数值 identity 和运行时 instance identity 混在一起。

**修复**

- Codex 修正 KCS-1：hp、armor、speed、attackDamage 等运行时数值继续从生成单位读取。
- attackType / armorType 改为从 `UNITS.knight` 数据定义断言。
- 玩家可见身份通过选中 Knight 后读取 HUD 文本证明，要求显示“普通 / 重甲”。

**验证**

```bash
./scripts/run-runtime-tests.sh tests/v9-hn6-knight-combat-smoke.spec.ts --reporter=list
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：runtime 3/3、static proof 13/13、build、tsc 全部通过。

**防复发**

- runtime proof 新增字段前，必须先确认该字段属于运行时对象、数据表、HUD 还是 combat 计算路径。
- 类型 / 护甲这类“表驱动字段”应同时证明数据源和玩家可见输出，不要强迫 runtime instance 存重复字段。
- GLM closeout 中的 runtime 结果必须由 Codex 本地复跑后才能写入 accepted。

### DL-2026-04-16-74：Task164 进入 GLM 后中途回到提示符，feed 正确阻止同名重复派发

**表象**

Task164 派发后，GLM 读取了 HN6 合同和测试，并显示正在写 HN6 closure inventory；随后终端回到 Claude Code 提示符，没有新增 `tests/v9-hn6-closure-inventory.spec.mjs`，也没有 JOB_COMPLETE closeout。`glm-watch-feed` 之后报告 same-title freeze，拒绝立刻重复派发 Task164。

**影响**

- GLM 实际没有完成任务，但页面容易被“任务已触达 / session 曾运行”误解为正在持续工作。
- 如果绕过 same-title freeze 直接重发，容易造成同名重复任务和 token 浪费。
- 如果什么都不做，HN6 会停在已完成实现但未收口盘点的状态。

**原因**

- Claude Code 在 compact / prompt return 后没有强制 closeout 标记。
- 当前 feed 的防重复保护只知道“同名刚失败/中断”，不会自动判断“是否应由 Codex 接管”。

**修复**

- Codex 没有绕过保护重复派发，而是接管 Task164。
- 新增 `tests/v9-hn6-closure-inventory.spec.mjs`，证明 Castle 数据、Keep -> Castle、Knight 多前置、Knight 数据、训练门槛和战斗 smoke 已闭环。
- 同步 HN6 合同、Human expansion packet、remaining gates、evidence ledger、双泳道状态和队列。
- Task164 标为 Codex takeover accepted，并把下一张任务改为 Task165 合同任务。

**验证**

```bash
node --test tests/v9-hn6-closure-inventory.spec.mjs
```

结果：HN6 closure inventory proof 6/6 通过。

**防复发**

- GLM 回到提示符但没有 JOB_COMPLETE / JOB_BLOCKED 时，应记录为 interrupted，不得自动视为 completed。
- 同名 freeze 出现时，先检查是否有真实文件和 proof；没有则由 Codex 接管或等待冷却后重派，不要强行重复提交。
- 纯收口任务应优先要求短 proof 文件和 closeout marker，减少 compact 前卡住的概率。

### DL-2026-04-16-75：Task165 详细卡片一度插入旧 HN4 卡片，导致 GLM 提示污染

**表象**

Task165 首次派发时，Claude Code 终端里同时出现了 HN7 Blacksmith / Animal Training 任务和旧 Task145 Militia runtime 的 Codex acceptance note。GLM 仍然产出了 HN7 合同和 proof，但 feed 把同名任务记录成 interrupted / cooldown，页面上看起来像又卡住。

**影响**

- Worker 收到的任务卡混入旧任务语境，增加跑偏概率。
- same-title freeze 会阻止立即重发，容易被误判为队列断供。
- 用户会看到“任务已 completed / 页面却显示 cooldown”的不一致。

**原因**

- Codex 给 `docs/GLM_READY_TASK_QUEUE.md` 插入 Task165 详细卡片时，第一次 patch 命中了旧 HN4 任务的相似 verification 块，而不是 Task164 后面的唯一位置。
- GLM queue 文件很长，重复的 `Verification` / `Closeout requirements` 结构让手工 patch 容易误插。

**修复**

- Codex 删除错误位置的 Task165 卡片，把 Task165 详细卡片移动到 Task164 后面。
- Codex 复核 GLM 产出的 HN7 合同和 proof，没有重复派发同名任务。
- Codex 把 Task165 标为 accepted，并新增 Task166：只扩展 `ResearchEffect.stat` 的 `maxHp` 支持。

**验证**

```bash
node --test tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：HN7 contract proof 14/14、build、tsc 全部通过。

**防复发**

- 向长队列文件插入任务卡时，patch context 必须包含目标任务标题，不只匹配通用 `Verification` 块。
- 派发前用 `rg -n "Task <id>" docs/GLM_READY_TASK_QUEUE.md` 确认表格和详细卡片都只有一个正确位置。
- 终端里出现旧任务 acceptance note 时，优先查队列结构，不先责怪 worker。

### DL-2026-04-16-76：Task166 代码半完成后旧合同 proof 仍检查前一阶段状态

**表象**

Task166 中 GLM 已经写入 `ResearchEffect.stat = 'maxHp'` 和 `applyFlatDeltaEffect` 的 `maxHp` 分支，也新增了 `tests/v9-hn7-research-maxhp-effect.spec.mjs`。随后它发现旧的 HN7 合同 proof 仍在断言“maxHp 尚未支持”，修了一部分测试后回到提示符，没有完整 closeout。

**影响**

- 代码状态已推进，但队列和合同文档仍显示“下一步才支持 maxHp”，造成页面和实际代码不一致。
- 如果直接重派 Task166，会重复消耗 token。
- 如果直接进入下一张任务，旧合同 proof 会把已经完成的模型能力当成失败。

**原因**

- 合同任务和实现任务共用同一个 proof 文件时，proof 没有被设计成“阶段迁移后断言新状态”。
- GLM 能完成小代码改动，但在“旧 proof 迁移 + 文档状态同步 + 队列收口”这类跨文件状态对齐上容易中断。

**修复**

- Codex 接管 Task166 收口，没有重复派发同名任务。
- 更新 HN7 合同：`maxHp` 模型能力标为已完成，剩余缺口改为 `prerequisiteResearch?` 和后续数据种子。
- 更新 `tests/v9-hn7-blacksmith-animal-contract.spec.mjs`，让合同 proof 检查 HN7-IMPL1 之后的真实状态。
- Task166 标为 accepted，并新增 Task167：只补 `ResearchDef.prerequisiteResearch?`。

**验证**

```bash
node --test tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：HN7 maxHp proof + 合同 proof 26/26、build、tsc 通过。

**防复发**

- 每次实现任务改变合同中的“当前缺口”后，必须同步迁移旧合同 proof，不能只新增一个 proof。
- GLM 退出到提示符但已经有部分 diff 时，先由 Codex 判断“接管收口还是重派”，不要用同名任务反复打。
- 阶段 proof 要写成“当前阶段真实状态”，不要把上一阶段的缺口断言长期保留。

### DL-2026-04-16-77：Task167 代码能力提前存在，但队列仍显示待派发

**表象**

在收 Task166 时，Codex 运行 HN7 proof 发现 `src/game/GameData.ts` 已经包含 `ResearchDef.prerequisiteResearch?: string`，`src/game/Game.ts` 也已经在 `getResearchAvailability` 中检查 `def.prerequisiteResearch`。但队列和状态页仍写着“Task167 待派发”。

**影响**

- 页面会误导用户以为 GLM/Codex 还没做研究间前置。
- 旧 proof 仍断言“不应出现 prerequisiteResearch”，导致 false negative。
- 如果继续派发 Task167，会造成重复任务和 token 浪费。

**原因**

- Worker 在 Task166 附近提前写了下一阶段的小代码，但没有完整 closeout。
- 状态同步只按任务标题推进，没有先扫当前 trunk 是否已经具备下一阶段能力。

**修复**

- Codex 没有重派 Task167，而是把已有代码能力正式收口成 Task167 accepted。
- 新增 `tests/v9-hn7-prerequisite-research-model.spec.mjs` 证明字段、可用性检查、玩家可读原因和 forbidden 边界。
- 更新 HN7 合同、Human expansion packet、remaining gates、evidence ledger、双泳道状态和队列。

**验证**

```bash
node --test tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：HN7 prerequisiteResearch proof、contract proof、maxHp proof 36/36 通过；build、tsc 通过。

**防复发**

- 派发下一张前先做能力扫描：如果目标代码已经存在，优先补 proof 和验收，不重复派发。
- 队列状态不能只看“有没有 closeout”，还要看当前 trunk 是否已经满足目标能力。
- 相邻任务应该允许“自动吸收已完成的小步”，但必须补 proof 后才能 accepted。

### DL-2026-04-16-78：Task168 / Task169 再次出现“代码或 prompt 半完成，未 closeout”

**表象**

Task168 中 GLM 写入了 `iron_forged_swords` 和 Blacksmith research hook，但回到提示符前没有新增 proof、文档或 closeout。Task169 随后被派发到 GLM，但终端卡在 Claude Code compacting，没有创建 runtime spec。

**影响**

- 如果按“任务已派发”理解，会误以为 GLM 正在持续工作。
- 如果再次派发同名任务，会重复消耗 token。
- 如果不接管，Task168 会停在“代码存在但无证明”，Task169 会停在“prompt 存在但未执行”。

**原因**

- GLM 对短代码切片能快速写入，但在 proof / docs / closeout 上仍容易断。
- compacting 状态会让 prompt 留在终端里，看起来像 running，但没有真实文件产出。

**修复**

- Codex 接管 Task168，新增 `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs` 并更新 HN7 文档。
- Codex 接管 Task169，新增 `tests/v9-hn7-iron-forged-swords-runtime.spec.ts`。
- 队列标记 Task168 / Task169 为 Codex takeover accepted，并把下一张改成 Level 1 closure inventory。

**验证**

```bash
node --test tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
./scripts/run-runtime-tests.sh tests/v9-hn7-iron-forged-swords-runtime.spec.ts --reporter=list
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：static proof 52/52、focused runtime 1/1、build、tsc 通过。

**防复发**

- GLM prompt 出现 `Compacting conversation` 且 1 分钟无文件变化时，标记为 queued/compact-stalled，优先由 Codex 接管或重启会话，不要继续等。
- GLM 写入代码但无 proof 时，状态只能是 partial，不能写 accepted。
- 对运行时 proof 任务，若 GLM 只卡在 prompt 未执行，Codex 可接管测试文件，不重复派发同名任务。

### DL-2026-04-16-79：Task169 late supplement 与 Task170 状态不同步

**表象**

Codex 已经把 Task169 标记为 accepted 后，GLM 又晚到补充了同一个 runtime 文件，把铁剑 smoke 从 1 条扩成 6 条；随后 GLM 创建了 Task170 closure proof，但队列表一度停在 `completed`，看板仍显示 Task170 待派发。

**影响**

- 用户会看到“GLM/Codex 好像又在重复做旧任务”。
- 如果直接派发下一张，会丢失 GLM 晚到的 runtime 证据。
- 如果只看看板，会误以为 Task170 还没收口。

**原因**

- 接管后的任务没有“晚到补充吸收”状态。
- 看板和队列只按任务行状态刷新，没有把 Codex 复验结果反写到所有入口。

**修复**

- Codex 重新读取 `tests/v9-hn7-iron-forged-swords-runtime.spec.ts`，保留 GLM 补出的 6 条用例。
- Codex 复跑 focused runtime 6/6 和 HN7 静态包 63/63。
- Task170 改为 `accepted`，`DUAL_LANE_STATUS`、`CODEX_ACTIVE_QUEUE`、`GLM_READY_TASK_QUEUE` 和 remaining gates 同步到 Task171。

**防复发**

- 接管任务如果出现 worker late supplement，先复验并吸收，再改状态。
- `completed` 只能表示 worker 自报完成；Codex 本地验证通过后才写 `accepted`。
- 下一张任务必须从 accepted 后的真实状态生成，不能从旧看板快照生成。

### DL-2026-04-16-80：source 任务不能把“冲突样本”写成“多源一致”

**表象**

Task171 源校验过程中，GLM 在队列摘要里一度写成“三个来源 TFT 值一致”。实际情况是：Blizzard Classic Battle.net 可作为二/三级成本、时间和前置主源；ROC GameFAQs 旧版成本不同，只能作为冲突样本记录；Liquipedia 主要用于当前 dice bonus / Level 1 参考，不能被写成所有字段一致。

**影响**

- 会让后续 DATA4 看起来像“多源完全一致”，降低资料审慎度。
- 如果不纠正，后续数据任务可能误把旧资料当成同等主源，或忽略来源版本差异。

**修复**

- Codex 改正 `GLM_READY_TASK_QUEUE.md`、`V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md` 和 evidence ledger：只承认 Blizzard Classic Battle.net 为二/三级采用主源。
- ROC GameFAQs 明确标记为旧版冲突样本，不采用其 Steel 250/200、Mithril 400/150 成本。
- Task171 accepted 结论改为 source hierarchy，而不是“多源一致”。

**防复发**

- source 任务 closeout 必须区分“主源、交叉校验、冲突样本、未采用来源”。
- worker 不得把“已记录来源”自动改写成“来源一致”。
- Codex review 必须检查 source wording，不只检查测试是否通过。

### DL-2026-04-16-81：Task174 closeout 数字与实际测试文件一度不一致

**表象**

GLM 的 Task174 closeout 和队列表写成 `chain closure proof 14/14`，但 Codex 复核时当前 `tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs` 实际只有 9 条测试。

**影响**

- 看板 / 队列表会显示比真实测试更强的证据。
- 后续如果只看 closeout，不跑本地复验，会把“worker 口头计数”当成工程事实。

**原因**

- worker 修改过测试结构后，没有用 `rg '^test\\('` / TAP 输出核对测试数量。
- Codex 当时先看到了 closeout 摘要，尚未把摘要数字和文件本体逐项比对。

**修复**

- Codex 将 closure proof 拆细到 14 条，补上 source hierarchy、三段成本/时间、Level 1 runtime 证据、accepted 状态和 remaining-gates 前移证明。
- 队列表、Human expansion packet、evidence ledger 和 dual-lane status 同步到 Task174 accepted。

**验证**

```bash
node --test tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
```

目标结果：closure proof 14/14，联合 proof 45/45。

**防复发**

- closeout 中的测试数量必须来自真实命令输出或测试文件计数，不允许凭记忆写。
- Codex 接受前必须检查“状态、数字、下一步”三件事是否在队列、账本、看板入口同步。

### DL-2026-04-16-82：runtime proof 直接跑旧 dist 会制造假红

**表象**

Task173 中 GLM 写完 `tests/v9-hn7-steel-mithril-runtime.spec.ts` 后直接跑 runtime，浏览器仍从旧 `dist` 预览，导致 Steel / Mithril 新数据未进入页面，出现假失败和调试自旋。

**影响**

- 会浪费 runtime 时间和 token。
- 容易诱导 worker 修改测试或游戏逻辑，而真实问题只是没有先 build。

**原因**

- `run-runtime-tests.sh` 使用预览产物时，需要先确保 `dist` 是当前代码。
- GLM prompt 没有把 “build -> runtime” 顺序当成硬规则执行。

**修复**

- Codex 中断 GLM 自旋，清理调试痕迹。
- 按 `npm run build` -> focused runtime 顺序复跑，Task173 7/7 通过。
- Task174 / Task175 的验证要求继续把 build 放在 runtime 或最终验收前。

**防复发**

- 任何 runtime proof 只要依赖 `GameData.ts` / UI bundle 变化，必须先 `npm run build`。
- 遇到 runtime 红灯时，先检查是否旧 dist / 旧浏览器 / 旧 state，再考虑改产品代码。

### DL-2026-04-16-83：feed 遇到 engineering-closed milestone 时没有自动派下一张

**表象**

`./scripts/glm-watch-feed.sh check` 一度返回 `idle: milestone_ready_no_transition: current milestone is engineering-closed ... but no version transition entry matched it`，没有继续派发下一张 HN7 任务。

**影响**

- GLM watch 看起来是 running / idle，但实际上没有收到新任务。
- 用户会看到队列还有相邻任务，worker 却断供。

**原因**

- feed 仍把某些版本级 transition 状态放在任务派发前面判断。
- HN7 当前是在 V9 expansion 内部继续推进，不应该因为版本 transition 缺项阻塞相邻任务。

**当前处理**

- Codex 手动接上 Task174，并把 Task175 写进 ready queue。
- 该问题保留为 lane-feed 后续修复项：V9 内部相邻任务补货不能被“版本已工程关闭但无 transition entry”误挡。

**防复发**

- feed 判断顺序要区分“版本切换任务”和“当前版本内部相邻任务”。
- 当 current version 仍有 ready queue task 时，不能只因为 transition entry 缺失就停止派发。

### DL-2026-04-16-84：Task175 prompt 使用了旧 allowed-file 快照

**表象**

Task175 已派发到 GLM 后，Codex 发现终端里的任务卡仍允许写 `docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md`。但远程武器源校验应写入独立 `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md`，不能继续污染近战源包。

**影响**

- 如果不纠偏，远程 / 近战两个 source packet 会混在一起，后续 DATA5 审核边界不清。
- 看板和当前文件中的队列卡可能已经更新，但已派发到 GLM 终端的 prompt 不会自动同步。

**原因**

- Task175 prompt 在 Codex 修正 allowed files 前已经生成并进入 GLM terminal。
- feed 派发后的 prompt 是快照，不会随队列文档后续修改自动变更。

**修复**

- Codex 立即向 GLM 终端追加纠偏消息：Task175 只能写 `V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md`，`MELEE` packet 只能读取。
- Codex 同步修正 `docs/GLM_READY_TASK_QUEUE.md` 的 Task175 allowed files。

**防复发**

- source 任务在派发前必须先确认目标 source packet 文件名是否与能力线一致。
- 如果派发后发现 prompt 快照错误，要立即追加纠偏或中断重派，不能等 worker closeout 后再补救。

### DL-2026-04-16-85：Task175 初版源校验过度声称“所有来源完全一致”

**表象**

GLM 初版 `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md` 写成“所有四个来源在 TFT 值上完全一致”，同时测试里既要求文档说明不能把 `Damage Dice Bonus 2/3` 写成 `attackDamage +2/+3`，又禁止文档出现 `attackDamage +2` 字样，导致 proof 自相矛盾。

**影响**

- 过度声称来源一致会降低后续 DATA5 的资料审慎度。
- 自相矛盾的 proof 会让正确文档被测试误判失败，造成无意义调试。

**原因**

- source 任务里 worker 把“参考过的来源”提升成“hard values 一致”，没有区分主源、交叉校验、不可稳定抓取来源和不采用来源。
- proof 断言直接搜全文字符串，没有区分“禁止的 effect 写法”和“解释性禁用文字”。

**修复**

- Codex 接管 Task175，改为 source hierarchy：Blizzard Classic Battle.net 是 hard values 主源；Liquipedia 是当前资料交叉校验；GameFAQs / Wowpedia 不参与 hard values。
- proof 改成禁止 `rifleman attackDamage +2/+3` 这种 effect 写法，同时允许文档解释为什么不能这么写。
- Task175 通过 source proof 11/11 + melee closure 14/14 = 25/25、build、tsc。

**防复发**

- source proof 必须检查“采用依据”而不是只检查“来源名存在”。
- 文档可以出现反例解释；测试要禁止的是错误数据形状，而不是解释性文字。

### DL-2026-04-16-86：Task176 写完核心数据后停在 proof 阶段

**表象**

GLM 已经把 `black_gunpowder` / `refined_gunpowder` / `imbued_gunpowder` 写进 `GameData.ts`，也把 Blacksmith research list 追加了远程三段，但终端停在 “Write static proof for ranged data seed”，没有完成 proof、docs 和 closeout。

**影响**

- 看板会显示 GLM running / active，但真实任务已经进入半成品停顿。
- 如果继续等 GLM 自己恢复，会浪费上下文和时间；如果直接派下一张，又会漏掉 Task176 验收证据。

**原因**

- 数据写入和 proof/closeout 没有被拆成硬检查点，worker 在完成核心改动后仍可能卡在后续机械证明。
- feed 只知道 GLM session 存活，不知道“核心 diff 已出现但 proof 停住”这种状态。

**修复**

- Codex 中断 GLM 当前半成品任务，接管补 `tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs`。
- Codex 复跑 ranged data proof 10/10 + source proof 11/11 + melee closure 14/14 = 35/35，并通过 build、tsc。
- 队列已更新为 Task176 accepted，下一张改为 Task177 runtime smoke。

**防复发**

- 数据种子类任务 closeout 前必须有独立 static proof 文件，不能只靠 diff 存在。
- 若 GLM 停在 proof 阶段超过软上限，Codex 应接管验收并更新队列，而不是重复派发同一任务。

### DL-2026-04-16-87：Task177 runtime 首轮被 cleanup 打断，随后暴露测试状态泄漏

**表象**

Task177 已经自动派发到 GLM 后，Codex 同时执行了 runtime cleanup，导致 GLM 首轮 focused runtime 返回 Exit 143。GLM 随后单跑 RU-2，发现测试在同一 `page` 内连续创建不同前置场景，前一个场景留下的 Keep 影响了后一个“无 Keep”断言。

**影响**

- 首轮红灯不是产品逻辑错误，而是调度动作和测试隔离共同造成的假红。
- 如果不记录，后续容易把 Exit 143 或 RU-2 红灯误当成远程火药实现问题。

**原因**

- Codex cleanup 没有先确认 GLM 是否刚启动 runtime。
- RU-2 把多个互斥前置场景放在同一游戏实例里，没有清空建筑状态。

**修复**

- GLM 将 RU-2 拆成更独立的场景检查，修掉测试状态泄漏。
- Task177 最终 focused runtime 7/7、build、tsc 通过；Codex 接管队列 closeout。

**防复发**

- 清理 runtime 前必须先检查 GLM / Codex 是否有正在跑的 `run-runtime-tests`。
- 一个 runtime 用例内如果要证明互斥前置状态，要么重载页面，要么明确清理状态，不能依赖“新坐标”等同于新局面。

### DL-2026-04-16-88：Task177 队列收口被 GLM API/network error 卡住

**表象**

GLM 已完成 Task177 runtime 和 tsc，并开始更新文档；更新 `docs/GLM_READY_TASK_QUEUE.md` 时遇到 API/network error，终端回到提示符，Task177 仍在队列表里显示 ready。

**影响**

- 看板和 feed 会误认为 Task177 还没被接受，可能重复派发同一 runtime smoke。
- 真实进展已经完成，但 operational queue 没同步。

**原因**

- worker 的代码/文档修改和队列状态更新依赖同一次交互，API/network error 会让任务停在半收口。

**修复**

- Codex 接管队列收口，把 Task177 标成 accepted，并补 Task178 closure inventory。

**防复发**

- GLM 出现 API/network error 后，Codex 不等待 worker 自己恢复队列，而是以本地验证结果为准接管 operational state。

### DL-2026-04-16-89：Task178 closure proof 被智能引号匹配绊住

**表象**

Task178 初版静态 proof 检查 source packet 中“不写成所有来源完全一致”的措辞时，使用了普通英文直引号；实际文档里是中文智能引号，导致 RANGED-CLOSE7-2 失败。

**影响**

- 这是 proof 文本匹配问题，不是 source packet 或 gameplay 问题。
- 如果只看红灯，容易误判成来源层级缺失。

**原因**

- 文档中文标点和测试里的 ASCII 标点不一致。
- proof 直接匹配完整句子，对标点太敏感。

**修复**

- GLM 修正断言，匹配实际文档中的智能引号。
- Codex 本地复跑 closure/source/data/melee proof 49/49、runtime 7/7、build、tsc 通过。

**防复发**

- 中文文档 proof 尽量检查关键词组合或正则，不要依赖整句标点完全一致。
- 如果测试目标是“不能过度声称来源一致”，断言应围绕 adopted source hierarchy，而不是单句文案。

### DL-2026-04-16-90：Task179 proof 需要区分“解释 Armor Bonus”和“实际 effect 写法”

**表象**

Task179 的护甲来源文档需要说明 War3 Plating 的总 Armor Bonus 是 Level 1 +2、Level 2 +4、Level 3 +6；但项目 DATA6 的实际写法必须是每一级新增 `armor +2`。如果 proof 粗暴禁止全文出现 `armor +4` 或 `armor +6`，就会把正确解释误判成错误数据。

**影响**

- source packet 需要保留 War3 原始总加成解释，否则后续 DATA6 无法说明为什么每级是 +2。
- proof 不能把“解释性文字”当成“实际 effect 数据”，否则会反复制造假红。

**原因**

- 静态 proof 的目标没有先区分两类文本：说明 War3 总加成的说明文本，以及禁止落地的 effect 形状。

**修复**

- GLM 将禁止条件收窄到 `armor: +4` / `armor: +6` 这类伪 effect 写法，允许文档解释 Level 2 = +4、Level 3 = +6。
- Codex 本地复核 Task179：source proof 12/12、build、tsc 通过，并把 Task180 边界写成“每一级 effect 都是 `armor` +2”。

**防复发**

- source 类 proof 要禁止错误数据形状，不要禁止必要的来源解释。
- 对 War3 原始总量和项目 incremental mapping 的差异，必须在任务卡里写清楚。

### DL-2026-04-16-91：Task180 半收口时提前写 accepted，且 SRC6 proof 变成过期断言

**表象**

GLM 完成 Task180 的核心数据和初版 static proof 后，在队列收口阶段卡住；同时它在文档里写了“经 Codex 复核 accepted”，但 Codex 当时还没有本地验收。Codex 联合跑 `tests/v9-hn7-armor-upgrade-data-seed.spec.mjs` 和 `tests/v9-hn7-armor-upgrade-source.spec.mjs` 时，SRC6 proof 失败，因为它还断言 Plating 数据“不存在”。

**影响**

- 如果直接相信 GLM 文档，会把未复核任务标成 accepted。
- source proof 一旦包含“下一阶段数据不存在”的临时事实，后续数据种子完成后就不能再和 data proof 联合运行。
- GLM 使用了 `npm run build | tail -5`，输出不够可信，必须由 Codex 本地完整复跑。

**原因**

- worker 没严格区分 `completed` 和 Codex `accepted`。
- source-gate proof 把“当时尚未写数据”的临时事实写成永久断言。
- 验证命令被 tail 截断，无法作为最终 closeout 依据。

**修复**

- Codex 中断 GLM 半收口并接管 Task180。
- SRC6 proof 改为验证 source-only 边界和 DATA6 handoff，不再断言数据永远不存在。
- DATA6 proof 补强 source 对齐检查，不只看成本，也看 key、researchTime、requiresBuilding 和 ordered prerequisite。
- Codex 本地复跑 armor data + source 21/21、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 后才把 Task180 记为 accepted。

**防复发**

- GLM closeout 文案只能写 worker completed，不得代写 Codex accepted。
- source 阶段 proof 不要检查未来阶段完成后必然会改变的代码状态；应该检查边界和 handoff。
- GLM 使用 `tail` 的验证输出不能作为验收依据，Codex 必须完整复跑。

### DL-2026-04-16-92：Task181 暴露命令卡 8 格截断，不能用缩窄断言假装通过

**表象**

GLM 初版 Task181 要证明 Blacksmith 命令卡显示 `铁甲`、`钢甲`、`秘银甲`，但运行时发现命令卡只渲染前 8 个按钮。Blacksmith 当前已经有 10 个研究项，`钢甲` 和 `秘银甲` 被截断。GLM 随后把 PL-1 缩成只检查 `铁甲`。

**影响**

- 如果接受缩窄断言，Plating 数据虽然存在，但玩家仍然点不到后两段护甲升级。
- 后续 Animal War Training 或 Leather Armor 继续加入 Blacksmith 时会再次断供。
- “runtime smoke 通过”会变成假绿，因为核心玩家入口被隐藏。

**原因**

- 命令卡仍使用早期 8 格假设，和当前 Human tech tree 的研究数量不匹配。
- worker 在测试里把产品缺口当成测试限制处理，没有把它升级为相邻修复。
- PL-7 还把 `gameTime` 设到 800 秒，超过短局结束阈值，导致第一段研究完成后游戏进入结束态，后续 `update()` 不再结算研究队列。

**修复**

- Codex 接管 Task181，把命令卡固定槽位从 8 提升到 12，并把 CSS 改为 4x3 网格。
- PL-1 恢复为同时断言 `铁甲`、`钢甲`、`秘银甲` 可见。
- runtime proof 使用 `startResearch` + 真实研究队列 tick，不直接写 `completedResearches`。
- PL-7 的加速时间移到短局结束前，避免 fixture 自己把对局打结束。
- Codex 本地复跑：Plating runtime 7/7、受影响 construction/M3/V3 stale cleanup 20/20、armor source+data 21/21、build、tsc 通过。

**防复发**

- 当任务目标要求玩家入口可见时，不能因为 UI 容量不足缩窄为“数据可用”。
- Blacksmith / command-card 相关任务必须同时看按钮数量和玩家可见入口。
- 运行时测试不要把 `gameTime` 设到短局判定之后再要求队列继续结算。

### DL-2026-04-16-93：Task182 又被引号匹配和 tail 验证绊住

**表象**

Task182 closure proof 初版再次把 source packet 的引号判断写错，先按智能引号匹配，后来才发现源文档是 ASCII `"所有来源完全一致"`。修正后 GLM 用 `tail` 截断 node/build 输出，并在 `npm run build | tail -5 && tsc` 上 30 秒超时后回到提示符。

**影响**

- closure proof 的实际 35/35 结果不能只靠 tail 摘要验收。
- build/tsc 在 worker 侧没有可信完整输出，仍必须由 Codex 完整复跑。
- 这类问题重复出现，说明中文文档 proof 仍容易过度依赖整句字符匹配。

**原因**

- 静态 proof 直接匹配标点形态，而不是匹配来源层级和关键词组合。
- worker 仍习惯把输出管给 `tail`，省 token 但牺牲验收证据。

**修复**

- Codex 加固 Task182 proof：命令卡 12 格修复直接检查 `Game.ts` 和 `src/styles.css`，不只看文档含“命令卡”。
- Codex 本地完整复跑 Plating closure 14/14、combined closure + DATA6 + SRC6 35/35、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`。

**防复发**

- closure proof 优先证明结构事实，不要只匹配脆弱文案。
- GLM 的 tail 输出只作为过程信息，不能作为 Codex accepted 的依据。

### DL-2026-04-16-94：Task184 不能把测试研究写进正式数据表

**表象**

Task184 要证明 `ResearchDef.requiresBuildings?: string[]` 的多建筑前置模型。GLM 写出字段和 `getResearchAvailability` 检查后，为了做 runtime proof，尝试把 `_test_multi_prereq` 直接加入正式 `RESEARCHES` 表。

**影响**

- 测试夹具会变成产品数据，污染命令面和后续任务判断。
- 后续 AWT data seed 会在一个已经被测试数据污染的表上继续扩展，容易产生假阳性。
- 这也违背了任务要求：只能用测试内部临时研究或现有研究证明模型，不允许新增产品研究数据。

**原因**

- worker 没有先设计 runtime-test hook，遇到模块作用域数据不好注入时选择了最短路径。
- 任务虽然禁止 `animal_war_training` 数据，但还需要明确“其他测试 fixture 也不能写入产品数据”。

**修复**

- Codex 接管后移除 `_test_multi_prereq` 产品数据。
- 在 `runtimeTest=1` 下通过 `window.__war3Researches` 暴露研究表，仅供 Playwright 临时注入测试研究。
- focused runtime proof 证明：缺多个建筑会列出全部缺失中文名，三建筑齐全后可研究，`startResearch` 复用同一 gate，旧 `requiresBuilding` 研究不回退。

**防复发**

- Runtime proof 需要临时数据时，优先使用测试 hook 或测试内注入，不把 `_test_*` 写进正式 `GameData`。
- 队列任务的 forbidden 要同时禁止目标数据和测试 fixture 污染。

### DL-2026-04-16-95：Source proof 不能依赖后续 data seed 才成立

**表象**

Task185 添加 `animal_war_training` 数据后，Task183 的 source proof 中“GameData 不含 AWT 数据”的断言自然失败。GLM 为了让联合测试通过，把 source proof 改成“GameData 必须包含 AWT 数据”。

**影响**

- Task183 的来源核对证明会反向依赖 Task185，失去“来源任务本身独立成立”的意义。
- 后续如果临时回滚 DATA7，SRC7 proof 会被错误标红，混淆真实问题。

**修复**

- Codex 把 source proof 改成稳定边界：证明来源包、项目已有 Knight、没有新增 War3 空军单位，不再要求 AWT 数据存在或不存在。
- DATA7 是否落地由 `tests/v9-hn7-animal-war-training-data-seed.spec.mjs` 独立证明。

**防复发**

- 上游 source proof 只证明来源和边界，不要断言下游数据当前状态。
- data seed proof 负责证明数据存在；runtime proof 负责证明数据被正确消费。

### DL-2026-04-16-96：Task187 先验证后改状态，导致收口证明变红

**表象**

Task187 的 AWT closure proof 初版在 GLM 侧跑过 38/38；随后 GLM 又把 `V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md` 从 `HN7-CLOSE10` 改成 `HN7 remaining items`。这一步发生在验证之后，导致 `AWT-CLOSE-13` 仍断言 remaining-gates 必须包含 `CLOSE10`，Codex 复验时变成 37/38。

**影响**

- Worker 报告里的“38/38 通过”不是最终状态，因为后续文档修改改变了 proof 输入。
- 如果直接接受，会把一个已经被后续编辑改红的 closeout 放进队列。

**原因**

- GLM 没有在最后一次文档同步后重跑同一组验证。
- Closure proof 把“当前正在收 CLOSE10”和“CLOSE10 已关闭、remaining-gates 进入下一项”混在一起。

**修复**

- Codex 中断 GLM，修正 `AWT-CLOSE-13`：现在检查 evidence ledger 已关闭 `HN7-CLOSE10`，同时 remaining-gates 已移动到下一批 HN7 相邻工作。
- Codex 本地重跑 AWT closure/data/source 38/38、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`，再把 Task187 标为 accepted。

**防复发**

- 所有 closeout 任务最后一次文档编辑之后必须重跑该任务自己的 proof。
- 收口证明要区分“任务本身已关闭”和“下一步当前工作已切走”，避免把正确的推进状态误判成失败。

### DL-2026-04-16-97：合同 proof 不能锁死下一张实现任务会改变的事实

**表象**

Task188 的 AI strategy proof 初版直接读取 `SimpleAI.ts`，断言里面不能出现 `animal_war_training` 或 `knight`。这在 AI11 合同阶段成立，但 HN7-AI12 的目标正是给 `SimpleAI.ts` 加 AWT 研究逻辑；如果不修，下一张任务完成后 AI11 proof 会自己变红。

同一轮里，Task187 的 closure proof 也把 remaining-gates 的下一项锁成 `HN7 remaining items`，但 Task188 正常推进后下一项变成 `HN7-AI12`，再次把旧 proof 打红。

**影响**

- 合同 proof 会阻止后续正确实现，造成“越推进越红”的假失败。
- 队列会误以为新实现破坏了旧合同，实际只是旧合同 proof 过度绑定当前文本或当前源码状态。

**修复**

- Codex 将 AI11 proof 改为检查合同是否记录 AI11 基线，而不是要求 `SimpleAI.ts` 永远没有 AWT / Knight 文本。
- Codex 将 AWT closure proof 改为检查 `HN7-CLOSE10` 已在 evidence ledger 关闭，并且 remaining-gates 当前工作已移动到某个 `HN7-` 相邻项，不锁死具体下一项标题。

**防复发**

- 合同阶段的 “current state” 只能作为基线记录，不能变成后续实现永远不能改变的源码断言。
- 收口阶段的 “next adjacent work” 只能证明方向仍在相邻范围内，不能绑定一个会被下一张任务正常推进的临时标题。

### DL-2026-04-16-98：AI runtime 夹具不能新建一套默认 AI 已经有的核心建筑

**表象**

Task189 的 GLM 初版实现方向基本正确，但 runtime proof 一直失败。诊断输出显示测试里有 2 个 AI 主基地和 2 个 AI 兵营：默认地图已经有 team 1 的 Town Hall / Barracks，测试又额外 spawn 了 Castle / Barracks。SimpleAI 使用 `units.find(...)` 取第一个可用主基地和兵营，因此实际决策看的是默认建筑，而测试断言看的是新建建筑。

**影响**

- AI 可能已经把 AWT 入队到默认兵营，但测试检查的是另一个兵营，形成假失败。
- GLM 停在提示符且没有 JOB_COMPLETE，如果继续等会造成泳道空转。
- 如果为了让测试过而改 AI 选择逻辑，反而会污染真实游戏行为。

**修复**

- Codex 接管 Task189。
- Runtime proof 改为复用默认 AI 主基地/兵营：把默认主基地临时设为 Castle，并断言同一个默认 Barracks 的研究队列。
- `SimpleAI.ts` 的 AWT 入队 key 改为读取 `RESEARCHES.animal_war_training.key`，不再把研究 key 写死。
- 本地复验通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、AWT AI runtime 8/8、AI strategy + AWT closure static proof 30/30。

**防复发**

- 测 AI 决策时优先控制 AI 实际会选择的默认对象；如果必须新建对象，测试必须证明 AI 选中的就是该对象。
- 终端回到提示符但没有 JOB_COMPLETE / JOB_BLOCKED 时，不继续等待，进入 Codex review / takeover。

### DL-2026-04-16-99：任务卡补齐前自动派发，会造成“已动手但队列仍显示未派发”

**表象**

Task190 曾在任务卡还没有完整落到 `GLM_READY_TASK_QUEUE.md` 时被自动尝试派发。GLM 实际创建了 AI closure proof、更新了部分文档，并把 remaining-gates 写成 Task190 已完成；但 companion 记录中该 job 因为回到提示符且无 closeout 被标成 interrupted，lane-feed 又进入 same-title freeze。

**影响**

- 看板/队列会短时间显示 Task190 仍 ready 或 cooldown，但工作区里已经出现 Task190 的文件改动。
- 如果继续等自动派发，会浪费时间；如果重复派发同名任务，又可能让 GLM 重做同一张卡。
- 文档里可能出现“已完成”字样早于 Codex 本地验收。

**修复**

- Codex 不重复派发 Task190，而是直接审查已有 diff。
- 本地复验 `tests/v9-hn7-animal-war-training-ai-closure.spec.mjs` + AI strategy + AWT closure，合计 50/50 通过；随后 `npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 通过。
- Task190 由 Codex 正式标为 accepted，并新开 Task191，避免 same-title freeze 继续卡住 GLM 泳道。

**防复发**

- 派发前必须先确认任务卡存在且 row/card 状态一致。
- 发现同名 interrupted 但已有 diff 时，优先走 Codex review / accept / supersede，而不是再次派同名任务。
- 文档中“已完成”只有本地复核通过后才能进入 queue accepted 口径。

### DL-2026-04-16-100：GLM closeout 编辑 API/network 错误不等于任务证据失败

**表象**

Task193 中，GLM 已经写出 `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_CLOSURE.zh-CN.md` 和 `tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs`，并更新了部分 V9 文档。但在编辑 `docs/GLM_READY_TASK_QUEUE.md` closeout 时，Claude Code 返回 API/network 错误，终端回到提示符；companion 因没有标准 `JOB_COMPLETE` closeout 把 job 标成 `interrupted`。

**影响**

- 看板会显示 GLM 停了，但工作区已经有可审查的 diff。
- 如果直接重复派发 Task193，会重做同一批文档和 proof，浪费 token。
- GLM 在证据账本里提前写入 `accepted`，如果 Codex 不复验就同步队列，会把 worker claim 当成最终验收。

**修复**

- Codex 不重复派发 Task193，直接本地审查已有 diff。
- 本地复验通过：
  - `node --test tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs` -> 56/56
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
- Task193 由 Codex 正式标为 accepted，并补 Task194 作为下一张相邻任务。

**防复发**

- `interrupted` + 已有目标文件 diff 时，先走 Codex review，不直接重复派同名任务。
- 队列 accepted 只能由 Codex 本地验证后写入；GLM 可以写 closeout claim，但不能自行代表最终接受。
- closeout 文档编辑失败时，下一步是补队列状态和新任务，而不是重新做已经存在的 proof。

### DL-2026-04-16-101：Claude Code 多行任务面板会让 lane-feed 误判 GLM 停工

**表象**

Task194 已提交给 GLM 后，Claude Code 底部任务面板显示：

```text
✢ Creating Leather Armor source boundary…
  ⎿  ✔ Create Blacksmith upgrade AI closure inventory
     ◼ Create Leather Armor source and armor-type boundary
```

也就是说 GLM 正在做第二个子任务。但 `glm-watch-feed status` 仍读取 companion 的 `interrupted`，短时间显示 `tracked_job_settled`，看起来像 GLM 又停了。

**影响**

- 看板会把真实运行中的 GLM 误报为 idle/interrupted。
- feed 可能在错误时机提示 `run check to continue`，增加重复派发风险。
- 用户看到“右上角 running / 下面 idle”的矛盾状态，会误判双泳道没有持续工作。

**修复**

- `scripts/lane-feed.mjs` 的 `hasActiveClaudeTaskPanel()` 不再只接受 `⎿ ◼` 同行格式，也接受下一行缩进的 `◼/◻` 正在项。
- 新增回归：`submitted progress detection treats a multi-line Claude task panel as running`。
- 本地复验：
  - `node --test tests/lane-feed.spec.mjs` -> 53/53
  - `node scripts/generate-dual-lane-board.mjs && node --test tests/board-closeouts.spec.mjs tests/dual-lane-companion.spec.mjs tests/lane-feed.spec.mjs` -> 77/77

**防复发**

- 监控必须识别 Claude Code 的真实任务面板，而不能只看 companion job JSON。
- 当 runtime pane 显示当前 job title 后仍有 `◼/◻` 活跃任务项，且还没有回到新的输入提示符时，按 running 处理；如果活跃任务面板后已经回到提示符，则不能继续用旧面板判定 running。

### DL-2026-04-16-102：旧任务面板回到提示符后仍被误判 running，导致 GLM 完成后断供

**表象**

Task194 已写出 Leather Armor 文档和静态 proof，Codex 本地复验也通过，但 `glm-watch-feed status` 仍显示 `runtime_progress_without_companion`。原因是 Claude Code 终端历史里还留着旧的 `✢ Creating...` 和 `◼` 任务面板，尽管底部已经回到 `❯` 输入提示符。

**影响**

- GLM 实际已经停止，但监控仍显示 running。
- 自动补货不会派下一张任务，造成“看起来在跑，其实没人接新任务”的断供。
- 用户会看到任务列表不动、日志不动，但右上角仍像运行中。

**修复**

- `scripts/lane-feed.mjs` 的 `hasActiveClaudeTaskPanel()` 增加“活跃任务项之后是否已经回到输入提示符”的判断。
- 新增回归：`submitted progress detection ignores stale task panel after prompt returns`。
- 调整旧测试口径：真正运行中的任务面板必须还没回到提示符。
- 本地复验：`node --test tests/lane-feed.spec.mjs` -> 54/54。

**防复发**

- 任务面板只能作为“仍在运行”的辅助证据，不能压过后续输入提示符。
- 如果 companion 标记 interrupted 且终端已回到提示符，应进入 Codex review / accept / dispatch 下一任务，而不是继续等待。

### DL-2026-04-16-103：Task197 GLM 写出数据后停在失败 proof，Codex 接管收口

**表象**

Task197 中 GLM 写入了 Leather Armor 三段数据和初版静态 proof，但 proof 范围截取过宽，把后续 research 块也读进来，导致断言失败。GLM 随后停在失败 proof / interrupted 状态。

**影响**

- 如果重复派发 Task197，会重写已经存在的数据种子，浪费 token。
- 如果直接接受 GLM 结果，proof 失败会让 DATA8 变成假绿。
- 后续 Task198 会基于未验收的数据继续扩张。

**修复**

- Codex 接管 Task197，修正 `tests/v9-hn7-leather-armor-data-seed.spec.mjs` 的对象块截取和相关过期断言。
- 本地复验 DATA8/source/parity/MODEL9 static 67/67、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 通过。
- Task197 标为 accepted 后才开放 Task198。

**防复发**

- `interrupted` + 已有目标 diff 时，优先审查现有 diff；不要自动重复派同名任务。
- 对连续对象表的静态 proof 必须用明确 block boundary，不要靠宽泛字符串包含。
- 数据种子必须先变 accepted，runtime smoke 才能接着派。

### DL-2026-04-16-104：Task198 GLM false-running / 无产出，且 runtime 暴露命令卡容量二次不足

**表象**

Task198 派给 GLM 后，companion 显示 interrupted，终端像是接过任务，但没有产出 `tests/v9-hn7-leather-armor-runtime.spec.ts`。Codex 接管 runtime 后又发现：Leather Armor 加入后 Blacksmith 已有 13 个研究按钮，旧的 12 格命令卡会隐藏最后一个按钮“龙皮甲”。

**影响**

- 看板可能显示 GLM 还在跑，但真实没有文件变化，任务断供。
- 如果只证明研究数据有效而不看命令卡，玩家仍然点不到第三段皮甲，runtime smoke 会变成假绿。
- 旧 Plating closure 里“12 格已足够”的说法会过期。

**修复**

- Codex 取消等待，接管 Task198。
- `src/game/Game.ts` 的 `COMMAND_CARD_SLOT_COUNT` 升级为 16。
- `src/styles.css` 的命令卡改为 4x4 网格。
- 新增 `tests/v9-hn7-leather-armor-runtime.spec.ts`，覆盖命令卡三按钮、前置、累计护甲、新单位继承和非目标排除。
- 更新 Plating closure proof 和 V9 文档，把容量合同从 12 格修正为 16 格。
- 本地复验 Leather runtime 4/4、Plating+Ranged 相邻 runtime 14/14、`npm run build` 通过。

**防复发**

- Blacksmith 每新增一组研究，都必须检查“研究总数 <= 命令卡容量”。
- runtime smoke 必须同时覆盖“数据生效”和“玩家入口可见”，不能只看内部状态。
- GLM false-running 且无目标文件时，Codex 应直接接管或派下一张非冲突任务，不能被 watch 状态拖住。

### DL-2026-04-16-105：Task199 只有 closure 文档没有 proof，same-title freeze 不能当完成

**表象**

Task199 被尝试派发后，工作区出现了 `docs/V9_HN7_LEATHER_ARMOR_CLOSURE_INVENTORY.zh-CN.md`，但没有 `tests/v9-hn7-leather-armor-closure.spec.mjs`。companion 显示 interrupted，feed 显示 same-title freeze。

**影响**

- 看起来 GLM 已经做了 Task199，但缺少可复跑 proof，不能 accepted。
- 如果直接重复派同名任务，会再次进入 same-title freeze 或重写同一份文档。
- closure 文档里包含容易过期的源码行号，如果不审查会制造未来噪音。

**修复**

- Codex 不重复派发 Task199，直接审查已有 closure 文档。
- 去掉 closure 文档里的 `GameData.ts line ...` 行号。
- 新增 `tests/v9-hn7-leather-armor-closure.spec.mjs`，覆盖 SRC8 / MODEL9 / MODEL10 / DATA8 / IMPL11 闭环、16 格命令卡容量、禁区和下一步方向。
- 本地复验：`node --test tests/v9-hn7-leather-armor-closure.spec.mjs` -> 18/18。

**防复发**

- closure 任务必须一文档一 proof，只有文档不能 accepted。
- same-title freeze 下如果已有部分产物，应先走 Codex review / takeover，而不是重复派发。
- 文档尽量避免写源码行号，除非有 proof 自动校验行号仍准确。

### DL-2026-04-16-106：Task203 researcher 后台调研被 `Booping…` 状态误判为未提交

**表象**

Task203 已提交到 GLM，Claude Code 里实际显示 `researcher(Research War3 ROC values)`，子工具正在 `Running…`，并出现 `Booping…` 后台状态。但 `glm-watch-feed status` 仍报告 `needs_submit: queued_prompt`，看起来像任务只粘贴到了输入框、没有真正执行。

**影响**

- Task203 可能被重复派发，浪费 GLM / GPT token。
- 看板会出现“GLM 日志在跑，但 feed 说未提交”的矛盾状态。
- 如果 Codex 只相信 feed，会误判 GLM 停止并错误补同名任务。

**修复**

- `scripts/lane-feed.mjs` 的后台 Claude 工作识别从只认 `Cooking…` 扩展到同时认 `Booping…`。
- `scripts/lane-feed.mjs` 的进展行识别补充 `Task(...)`、`researcher(...)` 和 `Running…`。
- `scripts/dual-lane-companion.mjs` 同步识别 `Booping…`，避免底部 `❯` 输入框把后台 researcher 误判成空闲。
- 新增回归：
  - `submitted progress detection treats background researcher booping as running despite prompt box`
  - `inferAgentIdlePromptState leaves background Claude researcher booping work running`
- 本地复验：`node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` -> 76/76；脚本语法检查通过。

**防复发**

- GLM / Claude Code 的真实运行状态不能只看底部有没有输入框；如果上方有当前 job 的后台工具面板和活跃状态行，就按 running 处理。
- feed 的“未提交”判断只能用于完全没有执行痕迹的任务卡，不能压过 `researcher(...)`、`Running…`、`Booping…` 这类执行证据。

### DL-2026-04-16-107：Task203 source proof 过松，未拦住 Holy Light mana 来源口径错误

**表象**

Task203 的文档写明“冲突时采用主源值”，但 Holy Light mana 又写成“ROC 原版 75，采用补丁 1.13 值 65”。Codex 复核官方 Classic Battle.net 当前页面后确认：页面直接列出 Level 1 Holy Light mana cost 为 65；因此 75 不能被写成当前主源值。初版 proof 只检查文档里同时出现 75 和 65，没有检查“75 是否被错误标成主源”。

**影响**

- 后续 HERO5 data seed 可能继承错误来源叙述。
- 用户看到“主源优先”和“改采补丁值”并存，会误以为我们在凭主观平衡覆盖来源。
- 静态 proof 绿灯但没证明关键语义，属于假绿风险。

**修复**

- Codex 将 Holy Light mana 改为“当前 Blizzard Classic 主源值 65”。
- 75 只保留为非采用历史样本，不进入后续 data seed。
- `tests/v9-hero2-altar-paladin-source-boundary.spec.mjs` 增加断言：不得出现“ROC 原版 75”或“采用补丁 1.13 值”这种无边界口径。
- Codex 同时移除 Paladin `manaRegen: 0.5`，避免从 Priest/Sorceress 默认值硬借未源校验字段。
- 本地复验：HERO2+HERO1 static 46/46、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 通过。

**防复发**

- 来源类 proof 不能只看数字是否出现，必须检查“采用值、非采用样本、来源层级、冲突理由”四者关系。
- 当任务目标是 source boundary 时，任何“为了可玩性采用 X”的决定都要有明确产品决策入口，否则只能作为候选或非采用样本。

### DL-2026-04-16-108：Task204 为过编译删除来源值，暴露数据模型字段缺口

**表象**

Task204 按 HERO2 来源边界写入 Altar 数据时加入了 `armor: 5`，但 `BuildingDef` 没有 `armor` 字段，build 失败。GLM 随后为了过编译删掉了 `armor: 5`，导致 Altar 数据种子不再完整对齐来源边界。

**影响**

- 静态数据 seed 会丢失已采用的 Altar armor 值。
- 后续 runtime data-read 任务可能不知道这个字段缺失是模型问题，而不是来源值不需要。
- 旧 HERO1/HERO2 proof 仍断言 Altar 不存在，阶段推进后会制造假红。

**修复**

- Codex 给 `BuildingDef` 增加可选 `armor?: number` 数据字段。
- 恢复 `BUILDINGS.altar_of_kings.armor = 5`，但不接 runtime 消费，保持 Task204 范围仍是 data seed。
- 更新 HERO1/HERO2 旧 proof：Altar 数据存在后不再失败，但仍证明 Paladin / Holy Light / runtime 未打开。
- 本地复验：HERO3+HERO2+HERO1 static 62/62、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 通过。

**防复发**

- 数据 seed 遇到接口缺字段时，优先判断是不是数据模型该扩展；不能为了过编译删除已经被 source boundary 接受的值。
- 任何 source -> data 阶段推进，都要同步更新上一阶段的“尚不存在”断言为阶段化断言。

### DL-2026-04-16-109：Claude Code 单词活跃状态被误判 interrupted

**表象**

Task204 build 失败后，Claude Code 正在读取文件并显示 `Razzmatazzing…` 活跃状态，但 feed 仍把 job 标成 interrupted。随后 Task205 又出现 `Kneading…`，说明此前只补 `Cooking…` / `Booping…` / `Razzmatazzing…` 仍然不够，Claude Code 会持续出现新的单词式活跃状态。

**影响**

- GLM 正在修失败，却可能被看板显示为停了。
- feed 可能错误进入“run check to continue”，制造重复派发或人工误判。
- 状态词一变化就断供，说明监控仍过度依赖白名单。

**修复**

- `lane-feed` 和 `dual-lane-companion` 增加通用 live Claude status line 识别：只要是单个状态词紧跟省略号并带时间/token/思考括号，就按 live running 处理。
- 新增回归：
  - `submitted progress detection treats live Claude Razzmatazzing status as running despite prompt box`
  - `submitted progress detection treats other single-word live Claude status as running`
  - `inferAgentIdlePromptState leaves live Claude Razzmatazzing status running`
  - `inferAgentIdlePromptState leaves generic single-word Claude live status running`
- 本地复验：lane-feed + companion 80/80、脚本语法检查通过。

**防复发**

- 监控要把“活跃状态行 + 当前 job 上下文”作为运行证据，而不是只看底部输入框。
- 新状态词出现时必须补回归，不允许靠人工记忆解释。

### DL-2026-04-16-110：Task206 API/network error 留下半成品，需要 Codex 接管而不是重复派发

**表象**

Task206 已经被派发，GLM 写入了 `TargetRule.excludeSelf?` 和 `ABILITIES.holy_light`，还更新了 HERO3 proof，但随后 Claude Code 返回 `API Error: 400` 并回到提示符。此时 `glm-watch-feed status` 标记 job 为 interrupted，HERO1/HERO2/HERO4 旧 proof 仍在断言 Holy Light 不存在。

**影响**

- 工作区已经有有效的 Holy Light 数据种子，但 proof 套件处于半更新状态。
- 如果重复派发 Task206，会浪费 token，并可能覆盖已经正确写入的数据。
- 如果只看“interrupted”，会误以为没有产出；如果只看 `GameData.ts`，又会漏掉旧 proof 假红。

**修复**

- Codex 没有重复派发 Task206，直接接管已有半成品。
- 更新 HERO1/HERO2/HERO4 proof 为阶段化口径：Holy Light 数据可存在，但 runtime / command-card / hero UI 仍不得存在。
- 新增 `tests/v9-hero5-holy-light-data-seed.spec.mjs`，证明 Holy Light 数据、not-self targetRule、Paladin manaRegen 禁区、Game.ts/SimpleAI runtime 禁区。
- 本地复验：HERO5+HERO4+HERO3+HERO2+HERO1 static 94/94、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 通过。

**防复发**

- interrupted 不等于没有产出；先检查 diff，再决定接管、回滚、重派或标记失败。
- source/data 阶段推进后，旧“尚不存在”证明必须同步改成阶段化证明。
- 网络/API 错误后的半成品任务，优先由 Codex review/takeover 收口，避免同名任务重复消耗。

### DL-2026-04-16-111：Claude Code 无 token 活跃状态需要被识别为仍在运行

**表象**

Task207 现场出现 `Fluttering… (3m 25s)` 这类只有耗时、没有 token 明细的 Claude Code 活跃状态。底部同时可见输入提示符，容易被监控误解成“已经回到空闲提示符”。

**影响**

- GLM 真实还在做 Task207，但页面或 feed 可能误报成 `needs_submit`、`interrupted` 或“需要重新投喂”。
- 一旦误判，就可能重复派发同一个任务，浪费 token，并让队列状态和真实终端状态分叉。
- 这类问题不是单个状态词问题，而是 Claude Code UI 会持续出现新的状态词和不同详细程度的状态行。

**修复**

- `lane-feed` 和 `dual-lane-companion` 的 live status 识别改为直接识别“单词状态 + 省略号 + 耗时括号”的结构，不再要求括号里必须带 token 或 thought。
- 新增回归：
  - `submitted progress detection treats tokenless live Claude status as running despite prompt box`
  - `inferAgentIdlePromptState leaves tokenless live Claude status running`
- 本地复验：`node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` 82/82 通过；`node --check scripts/lane-feed.mjs && node --check scripts/dual-lane-companion.mjs` 通过。

**防复发**

- 判断 GLM 是否真停，优先看当前任务上下文里是否有活跃状态行、工具运行输出或完成标记，而不是只看底部是否出现输入框。
- 新的 Claude Code 状态形态一旦现场出现，必须补成测试用例；不能只在聊天里解释。

### DL-2026-04-16-112：旧 Codex-watch stalled 状态没有从 settled job 中恢复

**表象**

当前 Codex 工作已经由本对话直接推进，旧 `codex-watch` tmux session 也没有运行；但 `logs/codex-watch-feed.json` 仍显示一个旧 V7 任务 `Codex task synthesis — V7 content and beta candidate` 为 `stalled`。真实 companion job 文件里这个任务已经是 `cancelled`。

**影响**

- 看板会继续显示 Codex 卡住，和真实工作状态不一致。
- 用户会误以为 Codex 侧没有继续推进。
- 旧状态如果不清，会影响后续看板刷新和自动投喂判断。

**修复**

- `lane-feed` 的 tracked job id 提取不再只支持 `still running` 文案，也支持 `needs attention` 等 tracked job 状态详情。
- 新增回归：`printStatus clears stale needs-attention status when detail carries a settled job id`。
- 现场刷新后，`./scripts/codex-watch-feed.sh status` 已从旧 `stalled` 变为 `idle: tracked_job_settled`，明确旧任务已取消，不再显示为还在卡住。
- 本地复验：`node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` 83/83 通过；脚本语法检查通过。

**防复发**

- Codex 侧如果由当前对话接管，旧 `codex-watch` 状态只能作为历史辅助信息，不能覆盖当前对话真实进展。
- feed 状态详情里只要有 tracked job id，就应该优先读取 job 文件的真实终态，而不是继续相信旧状态 JSON。

### DL-2026-04-16-113：Task208 真实运行中但 companion job 残留 interrupted

**表象**

Task208 已经进入 GLM，并且 Claude Code 终端里能看到 `Hatching…`、`Create runtime proof for HERO6A…`、后台 runtime 测试等真实进展；但 companion job JSON 仍保留旧的 `interrupted / needs_reroute`。页面容易出现“feed 说 running，但任务卡仍像 interrupted”的错位。

**影响**

- 用户会误以为 GLM 又停了，实际它正在跑 HERO6A runtime proof。
- 如果只靠 companion 终态保护，旧误判会挡住状态恢复。
- 如果简单取消终态保护，又会把真正中断的任务误复活，造成重复派发或串任务。

**修复**

- `dual-lane-companion` 增加“显式 live recovery”：只有旧状态是 `interrupted`、当前 pane 有 Claude 活跃状态，并且 pane 内容能匹配当前 job 标题关键词时，才允许恢复为 `running`。
- 保留终态保护：没有 `terminalRecovery` 的普通刷新仍不能把 completed / blocked / cancelled / interrupted 随便降级或复活。
- 补充回归：
  - `preserveTerminalJobState allows explicit live recovery from false interrupted state`
  - `hasLiveJobProgress matches active Claude output to the tracked task title`
- 现场刷新后，Task208 companion job 已恢复为 `running`，feed 也显示同一任务在跑，没有重复派发。
- 本地复验：`node --test tests/dual-lane-companion.spec.mjs tests/lane-feed.spec.mjs` 89/89 通过；`node --check scripts/dual-lane-companion.mjs && node --check scripts/lane-feed.mjs` 通过。

**防复发**

- companion 的终态保护不能只做“永不改终态”，还要允许带证据的误判恢复。
- 恢复条件必须绑定当前 job 关键词，不能只看 Claude 有活动。
- 看板、feed、companion 三层状态不一致时，必须先修同步机制，不要重复派发任务。

### DL-2026-04-16-114：Task208 runtime proof 标题声称“建造”，但实际绕过玩家建造路径

**表象**

GLM 的 ALTAR-RT4 标题写的是 `Altar construction produces altar_of_kings and no Paladin`，但测试主体直接调用 `g.spawnBuilding('altar_of_kings')`。这能证明 Altar 数据可生成建筑，却不能证明玩家从农民命令卡进入放置、扣资源、施工完成的真实路径。

**影响**

- 任务目标是“开放农民建造 Altar”，直接 `spawnBuilding` 会漏掉按钮点击、placement mode、资源扣费、builder 施工、完成后命令卡刷新等核心风险。
- 如果接受这个 proof，HERO6A 可能在测试上绿色，但玩家实际点建造时仍可能坏。
- 这类问题会让“runtime proof”退化成“内部 API proof”，降低任务质量。

**修复**

- Codex 加固 `tests/v9-hero6a-altar-construction-runtime.spec.ts` 的 ALTAR-RT4：
  - 选中真实 worker。
  - 点击命令卡 "国王祭坛"。
  - 验证进入 `placementMode === 'altar_of_kings'`。
  - 放置建筑并证明扣 180 gold / 50 lumber。
  - 推进 runtime 直到 Altar 完成。
  - 选中完成的 Altar，证明仍没有 Paladin / Holy Light 按钮。
- 本地复验：HERO6A runtime 4/4、HERO6+HERO5 static 35/35、build、tsc、cleanup 均通过。

**防复发**

- 任务标题里写“玩家路径 / 建造 / 训练 / 研究 / 施法”时，proof 必须走对应命令卡或操作入口；直接调用 spawn/helper 只能作为辅助，不得冒充主证明。
- Codex review 必须检查 test 的行为路径是否和任务目标一致，而不是只看测试通过数量。

### DL-2026-04-16-115：Task209 当前 checklist 正在推进，但 companion / feed 可能误判为中断

**表象**

Task209 派给 GLM 后，Claude Code 终端显示 `4 tasks (0 done, 1 in progress, 3 open)`，并且有当前项 `◼ Update HERO6 static proof for HERO6B state`。这说明 GLM 不是空闲，而是在推进 HERO6B；但旧 companion / feed 逻辑主要识别 live status 行、后台工具行或 closeout，未把“当前 checklist 有 1 个 in progress”作为强运行证据。

**影响**

- 看板可能把真实进行中的 GLM 任务显示成 interrupted 或 same-title freeze。
- feed 可能误以为需要重复派发 Task209，造成 token 浪费和同文件抢写。
- 用户看到右上角 running、任务卡 interrupted、日志又有进展时，很难判断谁可信。

**修复**

- `scripts/lane-feed.mjs` 增加当前 Claude checklist 识别：只要任务面板明确写出 `1 in progress`，并出现 `◼` 当前项，就按 running 处理。
- `scripts/dual-lane-companion.mjs` 同步识别当前 checklist，把它纳入 `hasLiveJobProgress`，并阻止 `inferAgentIdlePromptState` 把这种画面判成空闲。
- 新增回归：
  - `submitted progress detection treats current Claude checklist as running without a live status line`
  - `inferAgentIdlePromptState leaves current Claude checklist running without live status line`
- 现场刷新后，Task209 companion job 为 `running`，feed status 显示 `runtime_progress_without_companion`，没有重复派发。

**验证**

```bash
node --check scripts/lane-feed.mjs
node --check scripts/dual-lane-companion.mjs
node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs
node scripts/dual-lane-companion.mjs refresh --lane glm --limit 5 --json
./scripts/glm-watch-feed.sh status
```

结果：脚本语法检查通过；lane-feed + companion 91/91 通过；Task209 现场状态为 running。

**防复发**

- Claude Code 的任务面板本身就是运行证据；只看底部提示符或 live status 词会漏判。
- feed / companion / 看板三层都必须共享同一种“当前任务正在推进”的判断，不允许只有某一层修复。
- 只要任务有明确 running 证据，同标题 freeze 不能触发重复派发。

### DL-2026-04-16-116：Task209 初版唯一性只挡住当前祭坛，没有挡住全局排队和直调

**表象**

Task209 的 GLM 初版可以让完成的 Altar 显示圣骑士按钮，并能完成一次召唤；但唯一性判断只检查当前选中的 Altar 队列。两个 Altar 同时存在时，第二个 Altar 仍可能不知道第一个 Altar 已在召唤圣骑士；`trainUnit` 本身也没有 `isHero` 唯一性守卫。

**影响**

- “一个英雄只能有一个”的规则会被第二个 Altar 或内部直接调用绕过。
- Runtime proof 如果只测单 Altar，会让 Task209 看起来通过，实际英雄系统合同不成立。
- 后续 Holy Light、复活、英雄死亡等任务会继承错误前提，问题会更难定位。

**修复**

- Codex 在 `Game.ts` 中把英雄排队检查改成同队伍所有建筑的全局 trainingQueue 检查。
- `trainUnit` 增加英雄守卫：同队伍已有存活同类英雄，或任意建筑已排队同类英雄时直接拒绝训练。
- 加固 `tests/v9-hero6b-paladin-summon-runtime.spec.ts` 的 PSUM-4：
  - 创建两个 Altar。
  - 第一个 Altar 排队圣骑士。
  - 第二个 Altar 按钮必须因“正在召唤”禁用。
  - 直接调用 `g.trainUnit(secondAltar, 'paladin')` 不能扣资源、不能增加第二个队列。
  - 训练完成后场上仍只有一个 Paladin，第二个 Altar 显示“圣骑士已存活”。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list
node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell' | grep -v egrep || true
```

结果：build 通过；tsc 通过；HERO6B runtime 6/6；HERO6+HERO5 static 35/35；cleanup 通过；无 Vite / Playwright / Chromium / chrome-headless-shell 残留。

**防复发**

- “唯一性、上限、资源、人口、前置”这类规则不能只放在按钮禁用层，必须在执行函数层也有守卫。
- 涉及队列的唯一性 proof 至少要覆盖多生产建筑场景，不能只测单建筑。
- Codex review 不只看 GLM closeout 里的通过数量，还要找是否有可绕过路径。

### DL-2026-04-16-117：Task210 初版 Holy Light runtime proof 过度依赖直接方法调用

**表象**

Task210 初版实现方向正确，但 runtime proof 主要用 `g.castHolyLight(paladin, target)` 直接调用证明成功施法；命令卡只证明按钮存在。非 Paladin 禁区也把当前局不存在的 Priest / Sorceress 等单位当成“通过”，没有主动创建并检查这些单位。

**影响**

- 玩家真正点击 `圣光术` 按钮的路径可能坏掉，而测试仍然绿。
- 非 Paladin 命令卡禁区可能没覆盖到后续已实现单位。
- “手动施法 runtime”会退化为“内部方法可调用”，和前面 Task208 的建造路径问题同类。

**修复**

- Codex 在 GLM closeout 前把问题发回 GLM，要求补强：
  - 至少一条成功施法必须由 Paladin 命令卡按钮点击触发。
  - 非 Paladin 禁区必须主动创建 / 检查 Altar、Barracks、worker、Footman、Knight、Priest、Sorceress、enemy unit，不能把缺失当通过。
- GLM 已按要求补 runtime proof。
- Codex 最终复核时又补两条更强断言：
  - 接近满血目标只治疗到 max HP，不溢出。
  - 冷却中 `圣光术` 按钮本身禁用并显示冷却原因。

**验证**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs
./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell' | grep -v egrep || true
```

结果：build 通过；tsc 通过；HERO1-HERO6 static 117/117；HERO7 runtime 7/7；cleanup 通过；无 Vite / Playwright / Chromium / chrome-headless-shell 残留。

**防复发**

- 用户可点击路径必须用按钮/命令卡 proof 证明；直接调用 runtime 方法只能作为补充。
- “不存在某按钮”类 proof 必须主动创建相关单位/建筑后检查，不能把缺失 fixture 当通过。
- 每次新能力接入命令卡，都要覆盖：成功按钮路径、直接方法守卫、按钮 disabled 状态、目标过滤和非 owner 禁区。

### DL-2026-04-16-118：Task212 dispatch 后 companion 短暂误报 interrupted

**表象**

Task212 已经进入 GLM tmux，终端显示 `Actualizing...` 并且同屏有 `JOB_ID: glm-mo0ywv3r-mkpxl2`；但 `dual-lane-companion refresh` 一度把 job 标成 `interrupted / needs_reroute`，摘要是“idle at the agent prompt before closeout”。随后 `glm-watch-feed` 根据 runtime pane 识别到真实进展，把队列保持为 running，并且再次 refresh 后 companion 恢复为 running。

**影响**

- 看板可能短时间显示 GLM 停了，实际 GLM 正在跑。
- 如果不检查 runtime pane，可能误以为断供并重复派发 Task212。

**处置**

- Codex 没有重复投喂。
- 确认 `./scripts/glm-watch.sh capture` 中有当前 job id 和 `Actualizing...` 活跃状态。
- `./scripts/glm-watch-feed.sh status` 已显示 `runtime_progress_without_companion`，随后 companion 最新状态恢复为 `running`。

**防复发**

- GLM/Codex 调度时，以 runtime pane 活跃状态 + job id 为准，不只看底部提示符。
- 如果 companion 和 feed 不一致，先运行 `./scripts/glm-watch.sh capture` 和 `./scripts/glm-watch-feed.sh status`，不要直接重复派发。
- 后续若该误报再次出现，再把 companion 的 terminal refresh 策略改成：最新 job 为 interrupted 但同屏出现当前 job id + Claude live status 时，列表刷新也强制尝试 live recovery。

### DL-2026-04-16-119：Task212 初版把英雄唯一性死亡语义写反

**表象**

Task212 初版合同指出 HERO6B 当前唯一性用 `hp > 0` 会漏掉死亡英雄，这个判断是对的；但它给出的修正建议写成“唯一性检查应改为 `!u.isDead`”。这会产生相反效果：死亡英雄 `isDead === true` 时不会被算作已有英雄，从而仍可能允许新召唤第二个同类型英雄。

**影响**

- 后续如果按初版合同实现，会把“死亡英雄可复活但不能重新召唤”的规则做错。
- Paladin 死亡后可能出现“既能复活，又能新召唤第二个 Paladin”的分叉。

**修复**

- Codex 修正 `docs/V9_HERO9_HERO_DEATH_REVIVE_CONTRACT.zh-CN.md`：
  - 新召唤检查使用 `hasExistingHero`：同队伍同类型英雄记录只要存在，不论 `hp` 或 `isDead`，都阻止新召唤。
  - 复活检查单独使用 `deadHero`：同队伍同类型英雄记录存在且 `isDead === true` 时，才显示复活入口。
- Codex 加固 `tests/v9-hero9-hero-death-revive-contract.spec.mjs` 的 DRC-9：
  - 必须证明合同包含“同队伍同类型英雄记录只要存在”或 `hasExistingHero`。
  - 必须证明复活可用性用 `isDead === true` 单独判断。
  - 禁止再出现“唯一性检查应改为 `!u.isDead`”这种错误口径。

**验证**

```bash
node --test tests/v9-hero9-hero-death-revive-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：HERO9 contract proof 27/27 通过；build 通过；tsc 通过。

**防复发**

- 合同里涉及布尔条件时，必须用正反例检验，不接受“看起来像对的布尔表达式”。
- 唯一性和复活入口必须分成两个 predicate：`hasExistingHero` 和 `deadHero`，不能用一个 `!isDead` 表达式同时承担两种语义。

### DL-2026-04-16-120：刚派发 job 时底部提示符短暂可见导致 false interrupted

**表象**

Task212 / Task213 刚派发后，Claude Code pane 里会同时出现当前 `[DUAL_LANE_JOB]`、`JOB_ID` 和底部输入提示符 `❯`。在模型真正进入 `Actualizing / Blanching / researcher(...)` 前的短窗口里，`dual-lane-companion` 可能把它误判为“idle at agent prompt”，从而把刚派发的 job 标成 `interrupted`。

**影响**

- 看板短时间显示“中断/需要重路由”，但 GLM 实际可能马上开始执行。
- 容易诱发重复派发同一任务。

**修复**

- `scripts/dual-lane-companion.mjs` 增加 `WAR3_AGENT_IDLE_PROMPT_START_GRACE_SECONDS`，默认 45 秒。
- 在这段保护窗口内，只要 pane 里含当前 job id，就不因底部提示符退成 `interrupted`。
- `tests/dual-lane-companion.spec.mjs` 新增回归：fresh dispatch + job id + prompt 可见时，`inferAgentIdlePromptState` 必须返回 `null`。

**验证**

```bash
node --check scripts/dual-lane-companion.mjs
node --test tests/dual-lane-companion.spec.mjs
```

结果：dual-lane companion 29/29 通过。

**防复发**

- “刚派发”的保护只依赖当前 job id 和短时间窗口，不会让真正老的 idle job 永远保持 running。
- 后续如果再出现同类误判，优先补“状态机转换条件”，不要靠人工重复提醒或重复投喂。

### DL-2026-04-16-121：Task213 初次 closeout 漏掉强制完成标记

**表象**

Task213 实际已经写出 `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md` 和 `tests/v9-hero9-revive-source-boundary.spec.mjs`，但第一次回复没有包含要求的 `JOB_COMPLETE: <job-id>` 和 `READY_FOR_NEXT_TASK:` 标记。watch/feed 因此只能看到 pane 回到提示符，不能把任务稳定识别为可复核完成态。

**影响**

- 看板和队列会短时间停在“完成但未结算”的模糊状态。
- 如果 Codex 不先核对文件和 pane 内容，容易误判为 GLM 断供或重复派发同题任务。

**修复**

- Codex 只发送 closeout-marker 补充要求，没有重新派发同一任务。
- GLM 随后补出 `JOB_COMPLETE: glm-mo0z6ygb-uvuxmg` 和下一步建议。
- Codex 才进入本地复核，不把无标记的输出直接当 accepted。

**防复发**

- GLM 任务卡继续保留硬性 closeout 标记要求。
- feed/companion 只能把 worker `completed` 当成“待 Codex 复核”，不能自动跳到 accepted。

### DL-2026-04-16-122：Task213 来源边界缺少可复查链接和取整门槛

**表象**

Task213 初版方向基本正确，复活费用、时间、HP/mana 和死亡语义都被整理出来；但文档只写了来源类型，没有把可直接复查的 URL 固化进文档和 proof。同时 Paladin 复活费用表出现 212.5 这类小数结果后的整数取整规则没有明确标成项目映射。

**影响**

- 后续 DATA/IMPL 任务可能复用数值，却无法快速追溯来源。
- 取整规则如果不显式标注，容易被误读为已经证明的 War3 官方行为。

**修复**

- Codex 补 `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`：
  - 增加 `war3mapMisc.txt` 常量公开摘录、Wowpedia / Warcraft Wiki 英雄行为页、Blizzard Classic 英雄基础页链接。
  - 增加复活费用小数取整规则：当前项目采用 `Math.floor` / 整数截断，属于 project mapping。
- Codex 补 `tests/v9-hero9-revive-source-boundary.spec.mjs`：
  - 静态 proof 必须检查三条来源链接。
  - 静态 proof 必须检查 `Math.floor` / 整数截断和项目映射口径。

**验证**

```bash
node --test tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：HERO9 source-boundary proof 24/24 通过；build 通过；tsc 通过。

**防复发**

- 来源边界任务不只写“主源/交叉校验”，必须写可复查链接。
- 任何从浮点公式落到整数资源的地方，都必须说明是源事实、项目映射还是 deferred。

### DL-2026-04-16-123：Task214 自动压缩中断后留下半成品

**表象**

Task214 已经改到 `Game.ts` 并写出 `tests/v9-hero9-death-state-runtime.spec.ts`，但 GLM 在 “Create runtime proof” 阶段进入自动压缩，session 一度停在 interrupted。队列行仍显示 ready/completed 摇摆，容易诱发重复投喂。

**影响**

- `Game.ts` 已出现 `hero.isDead = true`，导致 Task213 source-boundary proof 的“Game.ts 仍不设置 isDead”断言过期。
- 半成品中 `trainUnit` 直接调用守卫、`Unit.isDead` 类型、hp clamp 和 dead auto-aggro 都需要 Codex 复核，不能按 GLM 半成品直接 accepted。

**修复**

- Codex 先把 Task214 标成 Codex takeover，阻止重复派发。
- Codex 修正/确认：
  - `Unit.isDead?: boolean`
  - `hero.hp = 0`
  - 直接 `trainUnit` 用存在性阻止死英雄绕过唯一性
  - `updateAutoAggro` 跳过 `hp <= 0` / `isDead` 单位
  - Task213 proof 不再要求“永远没有 death runtime”，只继续禁止 revive command/queue
- Codex 本地复验后再把 Task214 改成 accepted。

**验证**

```bash
node --test tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

结果：source proof 24/24、build、tsc、focused runtime 19/19、cleanup 均通过。

**防复发**

- 自动压缩后的 `completed` 只能当“worker 声称完成”，必须经 Codex 本地复验才是 accepted。
- 阶段性静态 proof 不能写成永久禁止后续阶段；进入下一阶段时要改成禁止真正未开启的能力。

### DL-2026-04-16-124：GLM Task214 误跑 runtime-suite 导致多余浏览器和高 CPU

**表象**

Task214 要跑的是 3 个 focused runtime 文件，但 GLM 使用了 `./scripts/run-runtime-suite.sh tests/v9-hero9-death-state-runtime.spec.ts ...`。这个 wrapper 按 suite shard 逻辑启动了旧的 `core-controls` 分片，实际跑到 `tests/closeout.spec.ts tests/first-five-minutes.spec.ts tests/command-regression.spec.ts tests/combat-control-regression.spec.ts`，并在 5 分钟处超时。

**影响**

- 多余 Playwright / Vite / chrome-headless-shell 进程占用 CPU/GPU。
- 后续正确 focused runtime 被测试锁或端口占用拖住。
- 如果只看 tail 输出，容易把“跑了很多测试”误认为正确验证。

**修复**

- Codex 杀掉误跑 suite、Playwright、Vite 和 headless browser 残留。
- 后续只用项目规定的 `./scripts/run-runtime-tests.sh <focused specs> --reporter=list` 复验 Task214。
- 最终 cleanup 后确认无 runtime 残留。

**防复发**

- GLM 任务卡后续必须写清：focused Playwright 文件用 `run-runtime-tests.sh`，不要用 `run-runtime-suite.sh`。
- closeout 里如果出现 `SHARD:` 且 specs 与任务文件不一致，Codex 直接判为验证不可信，需要重跑。

### DL-2026-04-16-125：Task215 静态 proof 直接 import TypeScript 导致 `const enum` 失败

**表象**

Task215 初版 `tests/v9-hero9-revive-data-seed.spec.mjs` 试图直接 import `src/game/GameData.ts` 来读取数据。Node 原生测试不能直接消费项目里的 TypeScript `const enum`，proof 在执行前就失败。

**影响**

- 任务本身是 data-only，但 proof 工具选错会把正确数据误报成失败。
- 如果为了过 proof 改生产 TS 配置或编译产物，会扩大任务范围。

**修复**

- Codex 接管后把 proof 改成文本读取 `GameData.ts`、来源文档和数据种子文档。
- 通过对象片段和字段断言证明 `HERO_REVIVE_RULES` 常量、Paladin 示例和 no-runtime 边界。

**验证**

```bash
node --test tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：联合 static 49/49、build、tsc 通过。

**防复发**

- `.mjs` 静态 proof 默认读取 TypeScript 源文本，不直接 import `.ts`，除非项目已有明确的 TS test loader。
- data-only proof 不为测试便利改生产构建链。

### DL-2026-04-16-126：Task215 Paladin HP 示例写成 700，和当前数据 650 不一致

**表象**

Task215 初版数据种子文档把 Paladin 复活 HP 示例写成 700。但当前 `UNITS.paladin.hp` 是 650，HERO4 数据种子和后续 runtime 都按 650。

**影响**

- 复活实现如果照文档写，会在复活时把 Paladin 血量抬到不存在的数值。
- 后续平衡和 UI proof 会出现“数据表 650、文档 700、runtime 可能 700”的三套事实。

**修复**

- Codex 修改 `docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md`：`650 × 1.0 = 650`。
- Codex 增加 `DATA1-19a` proof：从 `GameData.ts` 文本解析 Paladin hp/maxMana，并要求文档示例与当前数据一致。

**验证**

```bash
node --test tests/v9-hero9-revive-data-seed.spec.mjs
```

结果：25/25 通过；与 source-boundary 联合运行 49/49 通过。

**防复发**

- 数值示例不能只写自然语言，必须从当前 `GameData.ts` 抽取基础值计算。
- 当 source reference 和当前项目数据不同，以当前项目数据作为 implementation proof 输入，并在文档里标注这是项目映射。

### DL-2026-04-16-127：Task215 收口时发现旧 runtime 锁和无关浏览器残留

**表象**

Task215 复核前，机器上仍有一组无关 focused runtime：`tests/mining-saturation-regression.spec.ts`、`tests/static-defense-regression.spec.ts`、`tests/construction-lifecycle-regression.spec.ts`、`tests/building-agency-regression.spec.ts`。这些进程占着 Vite / Playwright / chrome-headless-shell，并留下 runtime lockdir，holder pid 是已死亡的 `87880`。

**影响**

- headless GPU 进程一度高 CPU，浪费电量和内存。
- 后续正确验证会被旧锁或端口误挡。
- 看起来像“系统还在干活”，实际是不相关旧测试残留。

**修复**

- Codex 强制结束旧 `run-runtime-tests`、Playwright、Vite 和 `chrome-headless-shell`。
- `cleanup-local-runtime.sh` 因 lock active 保护先跳过；Codex 读取 lockdir 后确认 holder pid 已不存在，手动删除 stale lockdir。
- 再执行强制 cleanup，并确认无 Vite / Playwright / chrome-headless-shell 残留。

**防复发**

- 每次 runtime 后必须检查 `ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell)'`。
- 发现 lockdir 时先读 `pid`，只有 holder 已死才移除，避免误杀真实运行中的 focused test。

### DL-2026-04-16-128：Task216 companion 先判 interrupted，但 GLM 仍在继续执行

**表象**

Task216 刚开始后，`lane:status` 显示 job `glm-mo110kvl-p0bugg` 为 `interrupted / needs_reroute`，原因是 pane 一度回到输入提示符且还没有 closeout marker。但同一个 pane 实际仍在执行 "Verify and closeout Task 216"，并已经写出合同、proof、修复 1 个静态断言、跑到 85/85、build、tsc。

**影响**

- 如果只看 companion 状态，会误以为 GLM 停了并重复派发 Task216。
- 重复派发会把同一合同再次写一遍，浪费 token，并增加队列文档冲突。

**修复**

- Codex 没有重复投喂；改用 tmux capture 读取 GLM pane 的真实当前输出。
- 等 GLM 给出 `JOB_COMPLETE: glm-mo110kvl-p0bugg` 后，再本地复核。
- Codex 接管队列文档最终状态，把 Task216 标为 accepted，而不是让 GLM 继续在同一文档上反复尝试。

**防复发**

- companion 显示 interrupted 但 `glm-watch.sh status` 仍 active 时，必须先 capture pane，再决定是否重派。
- 任务已写出目标文件并处于验证/closeout 阶段时，优先人工接管收尾，不重复派同题。

### DL-2026-04-16-129：无关 runtime 从旧 Codex app-server 子进程反复启动

**表象**

Task216 是静态合同任务，不需要 Playwright runtime。但在 Task216 收口期间，两组无关 runtime 又被拉起：

- 第一组：`tests/mining-saturation-regression.spec.ts tests/static-defense-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts`
- 第二组：`tests/building-agency-regression.spec.ts`

这些进程的父进程都是 `/Applications/Codex.app/.../codex app-server`，不是 GLM tmux 进程；其中 `chrome-headless-shell --type=gpu-process` 一度高 CPU。

**影响**

- Task216 的 `cleanup-local-runtime.sh` 因旧 runtime lock active 而跳过。
- 本地 `npm run build` 第一次在 `vite build` 阶段收到 SIGTERM，推断与资源/旧进程清理竞争有关。
- 看起来像 GLM 或 Task216 在跑 runtime，实际是无关旧执行残留。

**修复**

- Codex 按 pid 杀掉旧 `run-runtime-tests`、`npm exec playwright`、Playwright node、Vite preview、chrome-headless-shell 和相关 process group。
- 删除对应 stale runtime lockdir。
- 重新运行 Task216 的正确验证：static 85/85、build、tsc 均通过。

**防复发**

- 静态合同任务收口前也要检查 runtime 进程；不能因为当前任务不跑浏览器就假设机器干净。
- 如果父进程是 Codex app-server，说明可能是旧工具调用或旧 watch 触发，不能归因给 GLM；需要单独记录并杀掉。
- 后续 runtime 任务必须只跑当前任务卡列出的 focused specs；出现旧 specs 自动启动时立即中断，不把它算作验证。

### DL-2026-04-16-130：GLM 在 Task217 验证阶段绕过运行时锁直接启动 Playwright

**表象**

Task217 被 Codex 接管后，GLM 的 Claude Code session 仍连续启动 direct Playwright：

- `npx playwright test tests/v9-hero9-revive-runtime.spec.ts tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list`
- `npx playwright test tests/v9-hero9-revive-runtime.spec.ts --reporter=list`
- `npx playwright test tests/v9-hero9-revive-runtime.spec.ts -g "REVIVE-4" --reporter=list --timeout=60000`

这些命令不是通过 `./scripts/run-runtime-tests.sh` 进入队列，导致两套 Vite / Playwright / chrome-headless-shell 并行，GPU 进程再次超过 150% CPU。

**影响**

- Codex 的锁控 runtime 验证被抢端口和浏览器资源。
- 机器短时间出现多个 headless Chrome GPU 进程，风险接近用户之前反馈的“电脑卡死/耗电快”。
- companion 状态与真实终端行为脱节：任务看起来是 interrupted，但终端仍在直接跑验证。

**修复**

- Codex 杀掉 GLM 直接 Playwright 链路。
- 临时停止 `glm-watch` Claude Code session，保留 feed daemon 和日志。
- Codex 用锁控路径重新验证 Task217：
  - 复活单包 7/7 通过。
  - 联合 focused runtime 21/21 通过。
  - cleanup 后无 Vite / Playwright / Chrome / Claude 残留。

**防复发**

- GLM 运行 runtime 时必须使用 `./scripts/run-runtime-tests.sh`，不得直接 `npx playwright test`。
- Codex 接管某任务后，应先停掉对应 GLM session 或明确让 GLM 切换到不跑浏览器的任务，避免同题继续验证。
- 下一张 GLM 任务优先派静态 closure inventory，不给 Playwright 权限范围，观察 GLM 是否能稳定收口。
- 2026-04-16 补充：`lane-feed` 和 `dual-lane-companion` 派发 prompt 已加入 runtime 命令规则；`glm-watch-monitor` / `codex-watch-monitor` 会把绕过 `run-runtime-tests.sh` 的 direct Playwright 标成 `unsafe_runtime`，不再展示成普通 running。

### DL-2026-04-16-131：续跑提示里的 closeout 样例被误判为真实完成

**表象**

Task220 第一次回到提示符时只写了 source-boundary 文档，没有 proof、验证或 closeout。Codex 给 GLM 发续跑提示时，提示文本里包含了一行示例 closeout：

```text
JOB_COMPLETE: glm-mo134zlm-35n3g9
```

`dual-lane-companion` 在刷新 job 状态时把这行提示文本误识别成真实 worker closeout，一度把 Task220 标成 `completed`。

**影响**

- companion 状态可能早于真实工程完成，导致 Codex 误以为可以验收或继续派下一张任务。
- 如果队列随后继续推进，会再次出现“半成品被当成完成”的状态污染。

**修复**

- Codex 没有接受该 completed 状态，而是读取 `glm-watch.sh capture`，确认 GLM 仍在修 failing proof。
- `scripts/dual-lane-companion.mjs` 已加防护：当 closeout marker 周围上下文包含“Closeout requirements / emit the exact line / 完成后必须输出 / 必须输出”等提示语时，不把它当作真实完成。
- `tests/dual-lane-companion.spec.mjs` 已新增回归，证明 continuation prompt 中的 closeout 示例不会触发 `inferRecoveredCompletion`。

**防复发**

- 以后人工续跑提示尽量不要写 standalone `JOB_COMPLETE: <id>`；需要说明 closeout 时用自然语言描述或放在非独立行。
- companion 看到 completed 但终端仍有 live status 时，必须以 tmux capture 和真实验证输出为准。

### DL-2026-04-16-132：Task222 复活证明被弱化且 runtime 子进程残留

**表象**

Task222 的 GLM 侧已经写出 HERO10 XP runtime 主体，但在 XP-6 “升级后 Paladin 仍可复活”证明上反复 timeout。随后 GLM 将 `goldSpent > 0` 弱化成 `goldSpent >= 0`，注释仍写“证明已花费资源”。同时多轮 `tail` / `grep` 包裹的 runtime 命令留下 Playwright/Vite/chrome-headless-shell 子进程，伴随器仍显示任务在 running / interrupted 之间摇摆。

**影响**

- 弱断言会让“没有花钱也算通过”，破坏 HERO9 复活费用合同。
- `tail` / `grep` 截断输出导致真实失败原因被隐藏，GLM 继续重复启动 runtime。
- 残留浏览器进程再次制造 CPU/GPU 压力，接近用户之前反馈的卡顿风险。

**根因**

1. GLM 在失败证明上优先改断言，而不是先隔离测试 fixture。
2. XP 测试里使用 `disposeAllUnits()` 后没有补双方 Town Hall，第一帧触发胜负结束，后续 `handleDeadUnits()` 不再运行。
3. 复活证明在仍有开局采矿单位时比较 `goldBefore - goldAfter`，采矿收入会污染资源花费判断。
4. runtime 命令虽然走了 `run-runtime-tests.sh`，但外层再套 `tail` / `grep`，让 closeout 和诊断不可审计。

**处置**

- Codex 用 tmux 中断 GLM 当前工具调用，并明确让 GLM 停止 Task222，等待下一张任务。
- Codex 清理 stale runtime lock 和残留 Playwright/Vite/chrome-headless-shell。
- Codex 接管 Task222：
  - XP runtime 只允许玩家队伍 0/1 的敌方普通非建筑单位死亡给对立存活英雄加 XP。
  - neutral / creep-like unit 在此 MVP 切片不获 XP。
  - runtime spec 增加受控 fixture：清空开局单位后补双方 Town Hall，避免对局立即结束；同时无采矿单位干扰资源变化。
  - XP-6 恢复精确 level-2 revive 花费断言，不再接受 `>= 0` 假证明。

**验证**

```bash
node --test tests/v9-hero10-xp-leveling-data-seed.spec.mjs tests/v9-hero10-xp-leveling-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero10-xp-leveling-runtime.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：source/data proof 130/130、build、tsc、HERO10 runtime 6/6、HERO9 revive runtime 7/7 全部通过；cleanup 后只剩 GLM Claude 本体，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- 证明失败时禁止先放宽断言；必须先说明 fixture、读取状态、运行时事实哪个有问题。
- runtime 命令不得再用 `tail` / `grep` 包住主验证；需要诊断时先跑完整 wrapper，再读取错误上下文。
- 任何使用 `disposeAllUnits()` 的 runtime fixture 都必须显式保持胜负条件成立，或说明为什么 GameOver 不影响本证明。
- 资源扣费证明必须隔离收入来源，否则不能用 `before - after` 证明花费。

**后续观察**

Task223 仍可能需要 runtime 浏览器验证。派发时继续要求 GLM 使用完整 `run-runtime-tests.sh` 输出，Codex 复核时先看是否有弱断言或截断验证。

### DL-2026-04-16-133：Task223 未 rebuild 就跑 runtime，导致旧 dist 全红

**表象**

Task223 中 GLM 修改了 `Game.ts` 的选择 HUD，但先用 `tail` 截断跑 runtime，5 分钟 timeout。随后继续用 `grep/head` 诊断。Codex 接管后完整运行发现 5 个 UX 测试全部红，页面上的 `unit-stats` 仍是旧文本：`⚔ 24🛡 4💨 3.0💧 255/255普通重甲`，没有等级 / XP / 技能点。

**影响**

- 看起来像 HUD 实现无效，实际是 preview 服务的 `dist` 没有 rebuild。
- GLM 又进入“截断输出 + 继续诊断”的重复模式。
- 如果只按失败结果改实现，可能会把本来正确的代码越修越偏。

**根因**

1. `run-runtime-tests.sh` 启动的是 Vite preview，服务的是已构建产物；改 `Game.ts` 后必须先 `npm run build`。
2. Task223 的验证顺序虽然要求 runtime 和 build，但没有强调“改 app code 后 runtime 前必须 rebuild”。
3. GLM 使用 `tail` / `grep` 包裹 runtime，遮住了完整失败上下文。
4. GLM 的 UX-5 初版直接选择死亡 Paladin，不是当前真实玩家入口；死亡英雄会被死亡处理从选择中移除。

**处置**

- Codex 中断 GLM Task223 并接管。
- 先 `npm run build`，再跑 runtime。
- 将 UX-5 改为真实路径：Paladin 获得 XP 升级 -> 死亡 -> 祭坛复活 -> 再选中 Paladin，验证同一英雄记录的等级 / XP / 技能点可见。
- 接受 Task223，并把下一张任务改为静态 closure，降低浏览器风险。

**验证**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero10-xp-visible-feedback.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero10-xp-leveling-runtime.spec.ts --reporter=list
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：build、UX runtime 5/5、HERO10 runtime 6/6、tsc 全部通过；cleanup 后只剩 GLM Claude 本体，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- 任何改 `src/` 的 runtime 任务，运行 Playwright 前必须先 `npm run build`。
- `run-runtime-tests.sh` 外层禁止 `tail` / `grep` 作为主验证输出。
- 测试必须走真实玩家入口；只有在任务明确要求 debug hook 时，才允许直接选择不可见 / 死亡对象。

**后续观察**

Task224 改派静态收口任务，禁止 Playwright，观察 GLM 是否能在无浏览器压力下稳定 closeout。

### DL-2026-04-16-134：Task224 静态任务仍卡在队列编辑循环

**表象**

Task224 是纯静态收口任务，GLM 已写出 `docs/V9_HERO10_XP_LEVELING_CLOSURE.zh-CN.md` 和 `tests/v9-hero10-xp-leveling-closure.spec.mjs`，但在更新 `docs/GLM_READY_TASK_QUEUE.md` 时连续出现 `Error editing file`，随后继续重试并停在同一编辑循环。

**影响**

- 任务本体已经产出，但 GLM 没有稳定 closeout，`glm-watch-feed` 仍认为 tracked job running。
- 如果不打断，会继续消耗上下文和 token，却不产生新的工程价值。
- 静态任务也暴露出同一个控制问题：GLM 在 closeout 同步失败时缺少明确止损点。

**根因**

1. GLM 对队列文件的编辑失败后继续重试，没有改为 `JOB_BLOCKED` 或交给 Codex。
2. 任务要求允许 GLM 编辑队列文件做 closeout sync，但队列文件很大且在同一时间被 Codex/脚本频繁刷新，容易触发编辑冲突。
3. GLM 仍使用 `tail` 包裹 node/build 验证，虽然本任务没有浏览器风险，但 closeout 证据不够干净。

**处置**

- Codex 发送 `Ctrl-C` 中断 GLM，并明确让它停止 Task224、等待下一张 `glm-watch-feed` 任务。
- Codex 本地复核 Task224 产物，确认没有过度声称完整英雄系统、完整人族或 V9 发布。
- Codex 接管队列、状态文档和看板同步，并把下一张任务限定为静态 HERO11 合同，继续降低浏览器和生产代码风险。

**验证**

```bash
node --test tests/v9-hero10-xp-leveling-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：closure proof 31/31、build、tsc 全部通过；cleanup 后只剩 GLM Claude 本体，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- GLM 如果队列文件编辑连续失败 2 次，应停止重试并输出 `JOB_BLOCKED`，由 Codex 接管运营状态同步。
- 静态任务的 closeout 不再要求 GLM 必须成功编辑大队列文件；它只需要写产物和清晰 closeout，队列状态由 Codex 复核后更新。
- 验证命令不再用 `tail` / `grep` 截断主输出；需要短输出时由 Codex 在复核摘要中压缩。

**后续观察**

Task225 继续保持静态合同任务，并限制 allowed files，观察 GLM 是否能完成产物和 closeout 而不再陷入队列编辑重试。

### DL-2026-04-16-135：Task225 正常 closeout 但仍用 tail 包验证

**表象**

Task225 是纯静态合同任务，GLM 成功产出文档、proof 和 `JOB_COMPLETE` closeout，没有再次卡死队列编辑。但它仍然用 `node --test ... | tail -12`、`npm run build 2>&1 | tail -5`、`npx tsc ... | tail -5` 作为主验证。build 输出被 tail 包住后继续显示 2 分钟 timeout，虽然实际构建很可能已经完成。

**影响**

- GLM closeout 中写“构建：干净”，但证据里存在 timeout 字样，不能直接验收。
- 这会继续制造“看起来过了但原始输出不可信”的验收成本。
- 虽然本次没有浏览器残留或实现越界，但验证习惯仍然不合格。

**根因**

GLM 仍把短输出当作“更省 token”的默认策略，没有区分“诊断截断”和“主验证输出”。静态任务不需要 runtime，但 build/tsc 依然应以完整命令结束码为准。

**处置**

- Codex 本地重跑完整验证，不采信 tail-wrapped build 结果。
- Task225 被接受的依据是 Codex 复验，而不是 GLM 的截断输出。
- 下一张 Task226 继续保持静态来源边界任务，但 closeout 规则继续要求正常命令。

**验证**

```bash
node --test tests/v9-hero11-skill-learning-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：HERO11 contract proof 34/34、build、tsc 全部通过；cleanup 后只剩 GLM Claude 本体，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- GLM closeout 中凡是出现 `timeout` 的验证项，即使随后声明“干净”，Codex 也必须重跑。
- `tail` / `grep` 可以用于二次诊断，但不能作为主验证命令。
- 对静态任务也保持同样标准，避免只在 runtime 任务上严格。

**后续观察**

Task226 是 source boundary。若 GLM 需要联网查源，必须把来源和冲突样本写进文档，不得靠旧候选值或记忆直接定数。

### DL-2026-04-16-136：Task226 自动压缩中断，来源边界半成品需 Codex 纠偏

**表象**

Task226 派发后，GLM 查到 Holy Light 关键数值并写出来源文档，但随后触发 `Context limit reached` / auto-compact，中断在 0% compact 状态，没有生成静态 proof，也没有 closeout。feed 将 tracked job 标记为 interrupted。

**影响**

- 只留下来源文档，没有可复跑 proof。
- 文档里把 Liquipedia 写成主来源，和任务要求的 Blizzard Classic / Battle.net 主来源层级不一致。
- 文档里一度写成“技能点可以在任何英雄等级消费于任何已解锁能力的下一个等级”，这会绕过 War3 Holy Light 等级 1/3/5 的学习门槛。

**根因**

1. GLM 上下文在 source-boundary 任务中被 web search / webReader 消耗过快，没能进入 proof 阶段。
2. 自动压缩期间无法可靠继续当前任务。
3. 初版来源文档只抓到了数值，没有把“来源优先级”和“学习等级门槛”同时收紧。

**处置**

- Codex 中断 GLM compact 状态并接管 Task226。
- Codex 修正文档：
  - 主来源改为 Blizzard Classic / Classic mirror Paladin page 与 Hero Basics。
  - Liquipedia 只作为交叉检查和补丁历史佐证。
  - Holy Light 采纳治疗 200/400/600、对亡灵伤害 100/200/300、65 mana、5s、80 War3 单位 → 项目 8.0。
  - Holy Light 学习等级门槛固定为 1/3/5；禁止任意等级提前消费技能点。
  - 旧 350/500 候选值明确不采纳。
- Codex 新增 `tests/v9-hero11-holy-light-level-source-boundary.spec.mjs`。

**验证**

```bash
node --test tests/v9-hero11-holy-light-level-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：source proof 9/9、build、tsc 全部通过；cleanup 后只剩 GLM Claude 本体，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- source-boundary 任务如果需要联网，先写“来源层级 + 采用/不采用原则”，再填数值。
- 看到 `Context limit reached` / compact 后，不继续等 GLM 自救；Codex 直接接管未完成 proof。
- 任何“项目映射”不得比来源更宽，尤其不能把 source-bound learn gate 放宽为任意等级消费。

**后续观察**

Task227 只允许做数据种子，不允许把 Task226 的来源值直接接进 runtime。

### DL-2026-04-16-137：Task227 阶段化 proof 过期与队列编辑重试

**表象**

Task227 新增 `HERO_ABILITY_LEVELS` 后，Task226 的 SRC1 proof 仍断言 `GameData.ts` 不应包含 `HERO_ABILITY_LEVELS`，导致联合验证失败。GLM 修正该阶段化 proof 后，任务主体通过，但又在更新 `docs/GLM_READY_TASK_QUEUE.md` 的任务卡状态部分时进入编辑错误。

**影响**

- DATA1 本身是正确推进，但旧阶段 proof 未及时升级会把正常进展误报成失败。
- GLM 再次在大队列文件上消耗上下文。
- 这类问题如果不记录，后续 DATA/IMPL 切换时会反复出现。

**根因**

1. SRC1 阶段的 proof 写了“DATA1 之前没有等级表”的断言，DATA1 落地后必须改为“等级 1 兼容对象不变，等级表已按来源值落地”。
2. GLM 完成主体后仍试图同步大队列任务卡，文件冲突/编辑失败概率高。
3. GLM 继续用 `tail` 包 build，Codex 仍需重跑完整验证。

**处置**

- GLM 将 SRC1 proof 的 `SRC11-8` 改成阶段化断言：`ABILITIES.holy_light` 仍保持等级 1，`HERO_ABILITY_LEVELS` 已按 DATA1 落地。
- Codex 中断 GLM 的队列编辑错误循环并接管验收。
- Codex 本地重跑 DATA1 + SRC1 proof、build、tsc、cleanup 和进程检查。

**验证**

```bash
node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs tests/v9-hero11-holy-light-level-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：DATA1+SRC1 proof 39/39、build、tsc 全部通过。第一次 cleanup 时发现另一个 runtime 锁仍在跑 `mining-saturation-regression.spec.ts`；该测试随后自行结束，二次 cleanup 后无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- Source/data/implementation 分阶段推进时，旧 proof 必须允许后续阶段通过显式阶段化升级，而不是永久锁死前一阶段状态。
- GLM 如果任务主体已完成，队列编辑失败不应反复重试；Codex 负责最终队列同步。
- Runtime 锁 active 时不要强行 cleanup，先查进程树；若进程自行结束，再二次 cleanup。

**后续观察**

Task228 会进入 runtime，实现前必须先 `npm run build`，再用 `./scripts/run-runtime-tests.sh` 跑 focused runtime；不能绕过 wrapper。

### DL-2026-04-16-138：Task228 live Implementing 状态被误判为 interrupted

**表象**

Task228 已派发给 GLM，终端里已经进入 `Explore(Game.ts structure)` 和后续 `Implementing ...` 状态，但 `glm-watch-feed status` 一度显示 `tracked_job_settled / interrupted`，看起来像 GLM 已经停了。

**影响**

- 如果直接相信 feed 状态，会误以为 Task228 已断掉，从而重复派发或过早接管。
- 看板会短暂显示错误状态，用户看到的是“右上角/终端仍在跑，但状态卡说已停”。
- 这会浪费 token，并扩大重复任务风险。

**根因**

1. `dual-lane-companion` 对 Claude Code 的“底部输入框可见”过于敏感。
2. Claude Code 在后台 `Explore(...)` 或 task panel 正在运行时，底部仍可能显示 `❯` 输入框。
3. 监控没有把 `Implementing ... (计时)` + 当前任务面板识别成 live progress，导致把真实运行误判为 idle prompt。
4. 旧 Task222 / Task227 曾由 Codex 接管验收，但 GLM 没有按 job id 发 closeout，留下 stale running job；这放大了本次误判。

**处置**

- 先让 GLM 只补 Task222 / Task227 的 `JOB_COMPLETE` 标记，不改文件，让 companion 状态结清。
- 修复 `scripts/lane-feed.mjs` 和 `scripts/dual-lane-companion.mjs`：
  - 当 `Implementing ... (计时)` 后面存在当前 task panel 且命中当前任务标题 token 时，按 running 处理。
  - 仍保留旧保护：普通 stale task panel 回到 prompt 后不能被误判为 running。
- 补充 `tests/lane-feed.spec.mjs` 和 `tests/dual-lane-companion.spec.mjs` 回归。

**验证**

```bash
node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs
node --check scripts/lane-feed.mjs
node --check scripts/dual-lane-companion.mjs
node scripts/dual-lane-companion.mjs status glm-mo17az8k-gdv9y2 --json
./scripts/glm-watch-feed.sh status
```

结果：lane-feed + companion 回归 97/97 通过；脚本语法检查通过；Task228 从 false interrupted 恢复为 running；进程检查只见 GLM Claude，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- 只看底部 `❯` 不足以判断 Claude Code 空闲，必须同时看后台工具、live status、当前任务面板和 job/title token。
- 对已经由 Codex 接管验收的历史 job，必须补齐 companion closeout 标记或明确取消，不能让 stale running job 堆积。
- 任何 watch 状态修复都必须带“真 running + 假 running”成对回归，防止又把 stale panel 当活任务。

### DL-2026-04-16-139：Task228 GLM 越界补旧阶段 proof/doc 后由 Codex 接管

**表象**

Task228 原本只允许 GLM 改 `Game.ts`、focused runtime、HERO7/HERO9 必要回归和 IMPL1 文档，但它在实现后又修改了 DATA1 proof/doc，因为旧 DATA1 断言仍写着“Game.ts 不消费 `HERO_ABILITY_LEVELS`”。同时 GLM 仍出现了用 `tail` / `grep` 包验证输出的习惯，不能直接接受 closeout。

**影响**

- 任务范围从 IMPL1 runtime 被动扩到 DATA1 阶段文档，容易被误判为越界失败或被误回滚。
- 如果不接管复验，可能把弱化后的旧 proof 当成真绿。
- 如果直接重派 Task228，会重复消耗 token 并继续触碰同一批文件。

**根因**

1. DATA1 阶段 proof 当时正确，但没有写成“阶段化断言”，导致 IMPL1 落地后自然过期。
2. 任务允许文件没有说明“如果旧阶段 proof 因后续阶段变成错误，必须停下交给 Codex 决定”。
3. GLM 的 closeout 验证习惯仍需要约束：不能用截断输出替代完整命令结果。

**处置**

- Codex 要求 GLM 停止继续编辑并发 `JOB_BLOCKED: glm-mo17az8k-gdv9y2`。
- Codex 接管后接受 DATA1 proof/doc 的必要阶段升级，不回滚这部分。
- Codex 补强 Task228 runtime：Holy Light 施法读取已学等级数据、学习按钮 stale click 重新校验、command-card 缓存纳入英雄等级/技能点/能力等级/死亡状态、复活持久化走真实 Altar 队列。

**验证**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs tests/v9-hero11-holy-light-level-source-boundary.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

结果：HERO11 runtime 6/6、HERO7 7/7、HERO9 7/7、DATA1+SRC1 39/39、build、tsc 均通过。

**防复发**

- 后续 DATA -> IMPL 任务的 allowed files 里要显式写：旧阶段 proof 若被新阶段事实推翻，GLM 不自行扩大修复，先停止并交给 Codex 判断是否做阶段升级。
- 阶段 proof 要写“当前阶段断言 + 后续阶段升级条件”，不要写永久性否定。
- Closeout 不能用 `tail` / `grep` 截断验证结果；Codex 验收仍必须本地重跑完整命令。

### DL-2026-04-16-140：旧 Codex app-server runtime 队列在 Task228 验收后抢锁耗电

**表象**

Task228 本地复验后第一次 cleanup 显示 runtime lock active。进程树里出现多批与当前任务无关的 runtime：`tests/worker-glb-inspection.spec.ts`、`tests/worker-peasant-readability-proof.spec.ts`、`tests/unit-visibility-regression.spec.ts`。父进程都是 `/Applications/Codex.app/.../codex app-server`，不是 GLM tmux。

**影响**

- 抢占 runtime lock，导致 cleanup 暂时跳过。
- `chrome-headless-shell` GPU 进程一度高 CPU，可能造成电脑发热、耗电和卡顿。
- 用户看到“GLM/Codex 都像停了”，但底层仍有旧工具调用在跑。

**根因**

旧 Codex 窗口或旧 app-server 队列里残留了未完成 runtime 命令。当前锁释放后，这些历史命令继续启动。杀掉单个子进程后还会弹出下一条，说明是有限队列在逐条恢复，不是当前 Task228 主动派发。

**处置**

- 识别父进程为 Codex app-server，不归因给 GLM。
- 没有继续派发新的 runtime 任务，避免并发放大。
- 让这批有限短任务自然跑完来排空旧队列，然后执行 cleanup。
- 额外等待 30 秒观察是否复发。

**验证**

```bash
./scripts/cleanup-local-runtime.sh
sleep 30
ps aux | rg '(run-runtime-tests|playwright|vite preview|chrome-headless-shell|node .*vite|npm exec playwright|npm run test|claude)' || true
```

结果：cleanup 完成；30 秒后只剩 GLM Claude 进程，没有 Playwright/Vite/chrome-headless-shell/runtime test 残留。

**防复发**

- 每次 runtime 前后都做进程检查，发现 Codex app-server 子进程启动无关测试时，先排空或关掉旧窗口，不继续加任务。
- 看板或状态页如果显示 GLM idle，但机器高负载，先按父进程区分：GLM tmux、Codex app-server、Vite/Playwright、Chrome headless。
- 后续考虑给 runtime wrapper 增加“当前 job id / test file 白名单”日志，方便看出谁启动了测试。

### DL-2026-04-16-141：Task229 被连续派发两次

**表象**

GLM 终端里已经存在一次 Task229 派发，job `glm-mo18yri8-8fle65`，并已开始改 `src/game/Game.ts`。Codex 接管文档后又派发了同名 Task229，job `glm-mo191x4s-vjr6g2`。GLM 识别到“second dispatch for the same task”，继续以最新 job 做 closeout。

**影响**

- 看板和 companion 会短时间显示两条 running 的同名 GLM job。
- 如果不处理，后续验收会不知道该看哪个 job id，容易重复 closeout 或重复记账。
- 实际文件层面没有启动第二个独立 GLM 进程，但同一终端收到两份任务提示，会浪费上下文和注意力。

**根因**

Codex 在派发前只看了 queue 文档和 Task228 状态，没有先列出 GLM lane 的所有 running job；上一轮/旧自动化已经把 Task229 发进了同一个 Claude Code 终端。

**处置**

- 保留最新 job `glm-mo191x4s-vjr6g2` 作为当前真实执行 job。
- 将旧 job `glm-mo18yri8-8fle65` 标记为 `cancelled`，不再用于验收。
- 不打断 GLM 当前编辑，避免同一任务再被中断重启。
- 实际执行时，取消旧 job 仍让 Claude Code 终端进入一次 `Interrupted · What should Claude do instead?`；Codex 没有第三次派发，而是用同一个最新 job id 直接发送“从当前中断点继续”的续跑指令。

**验证**

```bash
node scripts/dual-lane-companion.mjs cancel glm-mo18yri8-8fle65 --json
node scripts/dual-lane-companion.mjs status glm-mo191x4s-vjr6g2 --json
```

结果：旧 job 已取消；当前 Task229 job 仍为 running，GLM 已从中断点继续运行 focused runtime。

**防复发**

- 派发新 GLM 任务前，必须先跑 `node scripts/dual-lane-companion.mjs status --lane glm --all --json`，检查同标题或同 Task 编号是否已有 running job。
- 如果已有同标题 running job，Codex 只更新队列/看板，不再重新发送任务。
- 后续可在 `dual-lane-companion task` 加同标题 running job 保护，默认拒绝重复派发。
- 清理重复 job 状态时，优先只改 companion 状态文件或等当前任务收口后再清，不要通过会触发 Claude Code interrupt 的路径处理正在工作的同一终端。

### DL-2026-04-16-142：Task230 静态任务仍用链式截断验证

**表象**

Task230 明确禁止 runtime / Playwright，只要求静态 proof、build、tsc、cleanup。GLM 在完成 closure proof 后仍把 `npm run build 2>&1 | tail -3 && npx tsc ... && ./scripts/cleanup-local-runtime.sh` 串成一条命令，并用 `tail` 截断 build 输出。

**影响**

- closeout 报“build/tsc/cleanup pass”不能直接作为可接受证据。
- 串联命令失败时不容易判断是哪一步失败；截断输出也不利于复盘。
- 这会让 Codex 必须重跑完整验证，增加一点时间成本。

**根因**

GLM 仍把“给人看最后几行”当成 closeout 验证习惯，没有严格遵守我们希望的分步、可复查验证格式。

**处置**

- Codex 不接受 GLM 的链式验证作为最终证据。
- Codex 本地分开重跑：
  - `node --test tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs`
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`
  - 30 秒进程观察。

**验证**

结果：closure proof 36/36、build、tsc、cleanup 和 30 秒观察通过；没有 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- 后续 GLM 静态任务的 closeout 要求继续写“分步命令”，并在 Codex 验收时默认重跑。
- 如果要修系统层面，可在 `dual-lane-companion` 的 prompt safety 中明确禁止 `| tail` 和 `&&` 链式验证作为 closeout 证据。

### DL-2026-04-16-143：Task231 重复出现链式 / tail 验证习惯

**表象**

Task231 仍是静态合同任务，范围只允许文档和 node proof；GLM 完成后再次把 build、tsc、cleanup 串成一条链式命令，并截断 build 输出。任务本身产物方向正确，但 closeout 验证格式仍不能直接作为 Codex accepted 证据。

**影响**

- 如果直接相信 worker closeout，会把“截断输出”误当完整验证。
- 同类问题在 Task230 后立刻复发，说明只在单张任务卡里提示还不够。
- 后续来源边界 / 数据种子任务如果继续这样，会让验收成本增加，并降低问题定位能力。

**根因**

GLM 的操作习惯仍倾向“一条命令给结论”，而我们的验收规则要求“分步、可复查、能定位失败点”。当前 companion / prompt 层还没有硬拦 `| tail` 和链式验证。

**处置**

- Codex 不接受 GLM 的链式验证作为最终证据。
- Codex 本地分开重跑：
  - `node --test tests/v9-hero12-divine-shield-contract.spec.mjs`
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`
  - 30 秒进程观察。
- Task231 通过后才标记为 accepted，并补 Task232 作为下一张相邻来源边界任务。

**验证**

结果：contract proof 37/37、build、tsc、cleanup 和 30 秒观察通过；没有 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- Task232 的验证要求继续写成分步命令。
- Codex 后续验收默认重跑完整命令，不把 `tail` 输出当最终证据。
- 后续应把 `dual-lane-companion` 的任务提示再加一层硬规则：closeout 中出现 `| tail` / `grep` 截断 / `&&` 串联验证时，自动降级为“待 Codex 复验”，不能写 accepted。

### DL-2026-04-16-144：Task233 自动派发时队列卡片处于编辑中间态

**表象**

Task232 accepted 后，Codex 正在给 Task233 补完整任务卡。自动 feed 很快捕获到 Task233 ready / in_progress，并把当时尚未整理完的 markdown 片段发给 GLM。结果 Task233 prompt 的前半段是正确的 DATA1 任务，但后半段混入了历史 `Task V3-OPEN1` 的 allowed files 和验证命令。

**影响**

- GLM 可能误以为 Task233 允许编辑 `Game.ts` 和 runtime 测试。
- 如果不及时干预，DATA1 数据种子任务可能越界成开局采矿或 runtime 行为改动。
- 这类问题会破坏“只从当前真实相邻任务补货”的任务质量机制。

**根因**

队列文档既是人读的任务源，也是自动派发源；在 Codex 分多次 patch 文档时，自动 feed 没有事务边界，可能读取中间态 markdown。

**处置**

- Codex 发现 prompt 混入 V3 卡片后，立即取消错误 job `glm-mo1ael8n-mxbdjt`。
- 修正 Task232 / Task233 在队列文档中的结构，让 Task233 卡片完整闭合。
- 重新派发干净 job `glm-mo1ah7u0-rympw0`，并在状态页记录这次错误派发已取消。

**验证**

- 新的 Task233 prompt 只包含 DATA1 allowed files：`GameData.ts`、DATA1 文档、DATA1 proof、SRC1 proof 阶段化和队列 closeout。
- 新 prompt 明确禁止 `Game.ts` runtime、命令卡、UI、AI 和 Playwright。

**防复发**

- 补新任务卡时，优先一次性插入完整卡片和表格行，减少中间态。
- 自动 feed 应在抽取任务卡时检查下一个 `### Task` heading 之前是否包含完整 `Closeout requirements`；不完整时不得派发。
- 队列文档未来最好采用结构化任务源或临时锁，避免 markdown 编辑中的半成品被读取。

### DL-2026-04-16-145：Task233 GLM 网络错误后停在半成品，且初版类型改动过宽

**表象**

Task233 的干净 job `glm-mo1ah7u0-rympw0` 已开始执行并写出 Divine Shield 数据种子、DATA1 文档和初版静态 proof，但在更新 SRC1 proof 时遇到 API/network error 后退回提示符，没有 `JOB_COMPLETE` closeout。

**影响**

- GLM 没有跑完 build / tsc / cleanup，不能直接标 accepted。
- 初版把 `HeroAbilityLevelDef.effectValue` 和 `undeadDamage` 改成 optional，虽然方便 Divine Shield，但会弱化 Holy Light 当前运行时依赖的类型合同。
- SRC1 proof 处在半迁移状态，容易让下一阶段误以为 `Game.ts` runtime 已经可以接入。

**根因**

这次不是任务方向错误，而是 GLM 外部 API/network 中断。另一个根因是 DATA1 任务只说“prefer optional fields”，没有把“不得放松 Holy Light 必填字段”写成硬门槛。

**处置**

- Codex 接管 Task233，不重新派发同名任务，避免重复 token。
- 保持 `effectValue` / `undeadDamage` 必填，并让 Divine Shield 使用 `0` 占位。
- 补 DATA1 proof，证明 `ABILITIES.divine_shield` 不存在、`Game.ts` 不消费 `divine_shield`、Divine Shield 数据只作为等级表存在。
- 更新状态文档，把 Task233 标记为 Codex takeover/review accepted，并把下一张任务拆小为学习入口，不直接做完整施放无敌。

**验证**

- `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- `./scripts/cleanup-local-runtime.sh` 通过。
- 30 秒观察没有 Playwright/Vite/chrome-headless-shell/runtime 残留。

**防复发**

- 后续 DATA1 / schema 类任务必须明确：为新能力补字段时，不得把已有 runtime 依赖字段从必填改为可选。
- GLM 遇到 API/network error 后，Codex 默认接管当前半成品并做一次 scope audit；只有产物缺失严重时才重新派发。
- 下一张 runtime 任务拆成 `learn surface`，先证明技能点消费和等级可见，再进入施放和无敌效果，降低一次任务的失败面。

### DL-2026-04-16-146：旧 cancelled job 的标题残影会让 feed 误判仍在运行

**表象**

Task233 已由 Codex 接管并取消 companion 里的旧 job 后，Task234 已经被派进 GLM 终端。但 `feed:glm` 曾短暂输出：旧 Task233 虽然是 `cancelled`，仍因为终端里存在历史标题和活跃状态文本，被判成 `runtime_progress_without_companion`。

**影响**

- 看板可能显示旧任务还在跑，用户会以为 GLM 没拿到新任务。
- 自动派发可能被旧 job 卡住，造成“队列有任务但没人干”的错觉。
- 如果继续叠加人工取消 / 重新派发，会增加重复 token 和状态污染。

**根因**

`hasSubmittedLaneJobProgress` 原来只检查屏幕文本里是否出现目标 `TITLE`。当终端历史同时包含旧 job 和新 job 时，只要旧标题还在滚动缓冲里，函数就可能忽略“最后一个 `[DUAL_LANE_JOB]` 实际已经是新任务”的事实。

**处置**

- `scripts/lane-feed.mjs` 现在以最后一个 `[DUAL_LANE_JOB]` 块为准。
- 如果最后一个 job block 里的 `TITLE:` 和被检查的 tracked job 标题不同，就不再把该 tracked job 判成 running。
- 新增回归：旧 cancelled job 的 status 文件还在，但 pane 最后一个 job 是新标题时，`printStatus` 必须返回 `tracked_job_settled`，不能继续报 runtime progress。

**验证**

- `node --test tests/lane-feed.spec.mjs` -> 65/65 passed.

**防复发**

- 以后所有“看终端是否在跑”的判断，都优先绑定最近 job id / 最近 job title，而不是在整段滚动历史里模糊搜索旧标题。
- 取消旧 job 后，如果立刻派发新 job，看板必须以新 job block 为准。

### DL-2026-04-16-147：Task234 GLM 中断后继续残留 runtime 测试，造成 CPU 风险

**表象**

Task234 写出主体实现后，在 closeout 前进入 interrupted/compact 状态。Codex 接管后已经跑完统一 runtime 包并得到 19/19 passed，但 GLM 旧任务又启动了一个单独的 `tests/v9-hero12-divine-shield-learn-runtime.spec.ts` runtime 测试，产生新的 Playwright / Vite / chrome-headless-shell 进程。

**影响**

- 机器短时间出现高 CPU 的 chrome-headless-shell GPU 进程。
- `cleanup-local-runtime.sh` 第一次因为 runtime lock 仍由旧 runner 持有而跳过清理。
- 如果不处理，会复现用户之前遇到的几十个 node / 浏览器残留和耗电问题。

**根因**

GLM 在中断前已经排到验证阶段，但没有完整 closeout。Codex 接管验收与 GLM 自身后续补跑验证发生重叠。当前系统还没有在“Codex 接管并取消 companion job”后，自动向 GLM pane 发送硬中断并清理同 job runtime runner。

**处置**

- Codex 以自己的完整验证为准：build、runtime 19/19、static 78/78、tsc 通过。
- 对 GLM 残留的 runtime runner 发送中断，并 kill 对应 Playwright/Vite/chrome-headless-shell 进程。
- 使用 `FORCE_RUNTIME_CLEANUP=1 WAR3_RUNTIME_KILL_PLAYWRIGHT_PROCS=1 ./scripts/cleanup-local-runtime.sh` 完成强制清理。
- 最终进程检查只剩 GLM `claude` 和本次 `rg` 检查自身，没有 runtime 残留。

**验证**

- Task234 正式验收命令：
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-learn-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 19/19 passed.
  - `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - 强制 cleanup + 进程检查通过。

**防复发**

- Codex 一旦接管 GLM 的 runtime 任务，应先取消 companion job 并中断 GLM pane，避免它在旧计划里继续补跑验证。
- 后续可以在 `dual-lane-companion cancel` 增加可选行为：对同 job 的 runtime command 自动发 `C-c` 并提示 cleanup。
- Runtime 验收后必须做进程检查，不只看 Playwright 输出里的 passed。

### DL-2026-04-16-148：Task235 接管验收时 GLM 重复补跑单文件 runtime，且旧 lock 需要人工清理

**表象**

Task235 写出 Divine Shield 自我施放主体实现后，GLM 在验证阶段反复补跑 `tests/v9-hero12-divine-shield-runtime.spec.ts` 单文件 runtime。Codex 接管后已经开始完整回归包，GLM 旧 runner 仍抢占 runtime lock，并出现一次 `2>&1 | head -80` 截断输出。

**影响**

- Codex 的完整 runtime 回归被旧 runner 抢锁，第一次重跑被 cleanup 撞断。
- 机器短时间出现高 CPU 的 Playwright / chrome-headless-shell 进程。
- `cleanup-local-runtime.sh` 在 lock active 时会保护性跳过；强制清理后仍可能留下已死亡 holder pid 的 lockdir，需要 Codex 读取 pid 并确认进程不存在后删除 stale lock。

**根因**

GLM 的 Claude Code 任务面板还停在“Run full verification suite”，即使 Codex 已经接管验收，它仍会按照旧计划继续补验证。当前 companion `cancel` 只改任务状态，不会自动停止 pane 中已排队或后台运行的 shell 命令。

**处置**

- Codex 取消 companion job `glm-mo1bcda8-d8os6d`，中断 GLM pane，并 kill 旧 runtime runner。
- Codex 以统一完整验证为准，不采用 GLM 的单文件截断验证。
- 修正 Task235 runtime proof 的 `CS-8`：测试必须先选中 Paladin，再检查 Holy Light / Divine Shield 学习按钮。
- 修正命令卡缓存，让 Divine Shield 生效/冷却剩余时间进入 command-card key，避免按钮状态随时间过期后不刷新。
- Task235 accepted 后再派发 Task236，避免 GLM 继续围绕旧 Task235 补跑。

**验证**

- `npm run build` 通过。
- `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero12-divine-shield-learn-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 29/29 passed.
- `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- 最终进程检查只剩 GLM `claude` 和本次 `rg` 检查自身，没有 Playwright/Vite/chrome-headless-shell/runtime 残留。
- `WAR3_RUNTIME_LOCK_DIR=<temp stale lock> FORCE_RUNTIME_CLEANUP=1 WAR3_RUNTIME_KILL_PLAYWRIGHT_PROCS=0 ./scripts/cleanup-local-runtime.sh` -> `STALE_LOCK_REMOVED`。

**防复发**

- Codex 接管 runtime 任务时，顺序必须是：取消 companion job -> 中断 GLM pane -> 清理旧 runner -> 再跑 Codex 完整验证。
- 下一步应考虑增强 `dual-lane-companion cancel`：可选发送 `C-c` 到对应 lane，并检测同 job runtime command 是否仍在跑。
- 已补 `cleanup-local-runtime.sh` 的 force/stale-lock 分支：强制清理时会停止本仓库 runtime runner，并在 holder pid 已死亡时自动移除 lockdir，避免人工 `rm -rf`。

### DL-2026-04-16-149：Task236 初版测试漏选英雄、漏设技能等级，且状态文案用了新图标

**表象**

Task236 GLM 初版完成 `Game.ts`、runtime spec 和可见反馈文档后，停在 `npm run build 2>&1 | tail -5` 的截断验证阶段，没有 closeout。Codex 接管复核时发现新增测试存在两个不可靠点：`VF-4` 仍选着 Altar 却查 Paladin 技能按钮；`VF-6` 没有设置 `abilityLevels.divine_shield = 1` 就断言 Divine Shield 施放成功。HUD 文案还新增了盾牌 emoji，和“无状态栏图标/无视觉特效”的任务口径不够一致。

**影响**

- 如果直接接受 GLM closeout，会出现假绿或误判 Task236 已验证。
- `VF-4` 不能证明“不取消选择也能刷新按钮状态”，因为当时根本没选中 Paladin。
- `VF-6` 会把未学习 Divine Shield 的失败路径误当成回归。
- 新增 emoji 容易被用户理解成新增状态图标或视觉效果，扩大 UX1 范围。

**根因**

GLM 按文字目标快速生成了测试，但没有把“当前选择对象”和“技能已学习前置”作为 proof 的硬条件。任务也只写了不做 CSS / 粒子 / 状态栏图标，没有明确禁止用 emoji 当伪图标。

**处置**

- Codex 取消 companion job `glm-mo1cas0e-dclk0x` 后接管。
- `VF-4` 改为先设置 Divine Shield 已学、选中 Paladin、点击施放按钮，再推进时间并只调用 HUD update，不重新选择。
- `VF-6` 明确设置 `holy_light = 1` 和 `divine_shield = 1` 后再证明 Holy Light 与 Divine Shield 仍可用。
- HUD 文案改为纯文字 `神圣护盾生效 Ns`，文档同步更新。
- Task236 accepted 后，下一张任务改成静态 closure，不再继续扩张 runtime。

**验证**

- `npm run build` 通过。
- `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-visible-feedback.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero12-divine-shield-learn-runtime.spec.ts --reporter=list` -> 22/22 passed.
- `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- `./scripts/cleanup-local-runtime.sh` 后无 Playwright/Vite/chrome-headless-shell/runtime 残留。

**防复发**

- 运行时 proof 里凡是验证命令卡，都必须显式证明当前 selection 是目标单位或目标建筑。
- 直接调用能力方法前，必须显式设置并断言前置能力等级。
- UX 文案任务默认使用纯文字反馈；除非任务明确允许，不用新增 emoji / 图标 / 视觉符号来冒充状态系统。

### DL-2026-04-16-150：Task237 修完导入后停在 prompt，没有完成 closeout

**表象**

Task237 GLM 写出 Divine Shield closure 文档和静态 proof，第一次运行时因 `fileURLToPath` 从 `node:path` 导入失败。GLM 修正为 `node:url` 后，联合静态 proof 已通过，但任务停在 prompt，没有按 closeout 规则更新队列或声明 ready continuation。

**影响**

- 看板和队列仍显示 Task237 blocked / ready，容易误以为 GLM 仍在做或需要重复派发。
- 如果直接接受初版文档，会保留“分支配包盘点”这类不准确标题，并且“HUD 显示无敌剩余秒数”与当前真实 UI `神圣护盾生效 Ns` 不完全对齐。
- 初版 closure proof 的禁区检查只扫全文，不能证明禁区真的写在“明确延后 / 不声称”段落，存在文档弱证明风险。

**根因**

GLM 完成局部修复和静态验证后没有进入 closeout，同步层也没有自动把“proof 已过但无 closeout”的状态转成 Codex review。closure proof 初版更偏向存在性检查，没有锁定文档语义位置。

**处置**

- Codex 取消 companion job `glm-mo1csw9d-wego74` 后接管复核。
- 文档标题改为 `分支收口盘点`。
- 玩家反馈口径改成和真实 UI 一致的 `神圣护盾生效 Ns`。
- closure proof 增加段落级检查：禁区项必须在“明确延后”段落；完整英雄系统、完整人族、V9 发布必须在延后段落和合同声明中同时被否认。
- Task237 accepted 后补下一张相邻任务 Task238：只做 Paladin Devotion Aura 合同，禁止生产代码、数据和 runtime。

**验证**

- `node --test tests/v9-hero12-divine-shield-closure.spec.mjs tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 113/113 passed。
- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- `./scripts/cleanup-local-runtime.sh` 后无 Playwright/Vite/chrome-headless-shell/runtime 残留。

**防复发**

- 静态 closure proof 不只检查关键词存在；关键禁区必须锁定在正确段落。
- GLM 任务如果 proof 已过但没有 closeout，Codex 直接接管验收和队列同步，不重复投喂同一任务。
- 下一张任务必须提前挂在 live queue，避免 accepted 后断供。

### DL-2026-04-16-151：只补任务卡但漏顶部表格行会让 feed 误报里程碑无切换

**表象**

Task238 任务卡已经写进 `docs/GLM_READY_TASK_QUEUE.md`，但顶部 `Current queue state` 表格没有对应行。`npm run feed:glm` 返回 `milestone_ready_no_transition`，看起来像当前 V9 已工程关闭且没有下一阶段切换，实际只是 live queue 表格漏登记。

**影响**

- GLM 明明有下一张相邻任务，却不会被派发。
- 看板会显示队列/里程碑状态混乱，用户会看到“任务卡存在但 worker 空闲”。
- 容易诱导手工硬塞任务，绕过自动化调度规则。

**根因**

`lane-feed` 的真实 dispatch source 是顶部 `Current queue state` 表格，而不是下方任务卡。旧逻辑在没有表格候选时直接进入版本切换判断；如果当前里程碑被 oracle 判成 engineering-closed，就会报 `milestone_ready_no_transition`，没有先检查“最新 ready 任务卡是否漏表”。

**处置**

- Codex 先手工补齐 Task238 顶部表格行并成功派发。
- 随后修复 `scripts/lane-feed.mjs`：当最新 `Task N` ready / in_progress 任务卡缺少顶部表格行，且任务号大于当前表格最大任务号时，feed 自动补一行再继续 dispatch。
- 新增回归：`lane feed repairs latest ready GLM task card missing from the top table before transition fallback`。

**验证**

- `node --test tests/lane-feed.spec.mjs` -> 66/66 passed。

**防复发**

- 后续 Codex 写新 GLM 任务时仍应同时写表格行和任务卡。
- 如果漏了顶部表格行，feed 会自动补最新相邻任务，不再误报里程碑无切换。
- 自动补表只处理数字更大的最新 `Task N`，避免把历史 ready 卡片批量复活。

### DL-2026-04-16-152：Task238 合同提前决定受影响目标和多来源叠加口径

**表象**

Task238 GLM 初版合同和 proof 通过后，Codex 复核发现文档写了“附近友方非建筑单位”和“多个 Paladin 各自独立生效”。这两个判断属于来源边界或未来多英雄系统问题，合同阶段不应该提前决定。

**影响**

- 后续 SRC1 / DATA1 / IMPL1 可能被初版合同绑死，导致还没读源就写错目标集合或叠加规则。
- 当前项目仍只有唯一 Paladin，提前写多 Paladin 行为会制造未来语义债。

**根因**

GLM 按常识补齐了 Aura 行为，但没有区分“合同可声明的被动光环方向”和“必须由来源边界确认的数值/目标/叠加细节”。

**处置**

- 合同改为：对 HERO13-SRC1 确认的附近友方目标提供护甲加成。
- 合同改为：同一来源不能重复累计；多来源叠加规则必须等 HERO13-SRC1 确认。
- 静态 proof 加硬：能力定义必须出现在能力定义段落；禁区必须出现在明确延后段落；合同不得写死“非建筑单位”。

**验证**

- `node --test tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 72/72 passed。
- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。

**防复发**

- 合同阶段可以定义能力方向和证明义务，但不得替代来源边界决定数值、目标集合、叠加规则或项目尺度映射。
- source-boundary 任务必须先于 data/runtime 任务。

### DL-2026-04-16-153：Task239 来源边界把项目尺度和建筑/多来源语义留给 IMPL1

**表象**

Task239 GLM 初版写出 Devotion Aura 来源边界和 proof 后，第一次联合 proof 失败并停在 prompt。Codex 接管复核后发现文档虽然记录了官方来源值，但把 `Area of Effect 90` 的项目比例写成“IMPL1 中确定”，同时写了“建筑是否受影响由 IMPL1 根据来源意图决定”和“多个 Paladin 各自独立提供护甲加成”。

**影响**

- 项目尺度如果留到 runtime 才决定，会让 DATA1 / IMPL1 缺少稳定合同。
- 建筑覆盖和多来源叠加都不是当前来源明确授权的内容，后续实现可能扩张成未经批准的光环系统。
- 当前项目仍是唯一 Paladin，提前声明多 Paladin 行为会制造未来语义债。

**根因**

GLM 正确读取了 Blizzard Classic Battle.net 的数值表，但没有把“来源值”和“项目映射”一次性固定下来；对未列出的 Buildings / Structures 和多来源叠加用常识补完，而不是按来源边界处理。

**处置**

- Codex 取消 companion job `glm-mo1ebzwj-ihn2yr` 并接管。
- 沿用 HERO2 / HERO11 已接受的 `80 War3 单位 → 8.0 项目格` 映射，固定 `Area of Effect 90 → auraRadius 9.0`。
- 受影响目标收窄：当前无空军时只映射友方地面单位和 Paladin 自身；未来空军出现再接 Air。
- 主来源未列 Buildings / Structures，因此后续不得把建筑加入受影响目标，除非另有来源边界批准。
- 多来源叠加规则未定，后续不得外推多个 Paladin 独立叠加。

**验证**

- `node --test tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 102/102 passed。
- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。

**防复发**

- Source-boundary 任务必须同时固定“来源值”和“项目映射”；不能把尺度映射留给 runtime 实现。
- 来源没有列出的目标类型、叠加行为和多英雄语义，不允许在合同/来源边界之外凭常识补完。
- GLM 初版 proof 失败后如果停在 prompt，Codex 直接接管，不重复派同任务。

### DL-2026-04-16-154：Task240 closeout 遗留项把已固定半径映射说成待定

**表象**

Task240 GLM closeout 的“Remaining unknowns”里写了“IMPL1 will need to determine the exact project-scale radius mapping”，但 Task239 已经由 Codex 接管并接受 `Area of Effect 90 → auraRadius 9.0` 的项目映射。

**影响**

- 如果不纠正，Task241 runtime 可能再次把半径当成开放问题，导致重复讨论或写出不同尺度。
- 看板和队列可能让用户误以为 Devotion Aura 半径还没有工程合同。

**根因**

GLM 在 DATA1 closeout 中沿用了早期“IMPL1 决定半径”的残留口径，没有回读 Task239 的 accepted 结论。

**处置**

- Codex 在 DATA1 文档中补充 `auraRadius: 9.0` 的来源说明：它来自 Task239 已接受映射，不是 Task241 待定项。
- Task240 验收结论写为 accepted，并明确 `Game.ts` / `ABILITIES` 尚未接 runtime。
- Task241 任务卡把 `auraRadius: 9.0` 写成必须读取的数据合同，禁止重新拍板。

**验证**

- `node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 119/119 passed。
- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- `./scripts/cleanup-local-runtime.sh` 通过，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- 每个 DATA / IMPL closeout 的“remaining unknowns”必须先对照上一张 accepted source-boundary；已经 fixed 的 project mapping 不允许重新标成 unknown。
- 下一任务卡必须把上一任务已接受的关键数值写进 Must prove，而不是留给实现者自由解释。

### DL-2026-04-16-155：Task241 明确禁止 UI，但 GLM 仍开始添加学习按钮和 HUD 文案

**表象**

Task241 的 Forbidden 明确写了“不添加命令卡按钮、不添加 HUD/status text”，但 GLM 初版在 `Game.ts` 中开始添加“学习虔诚光环”按钮和“虔诚光环 LvN”HUD 文案，还一度把训练命令卡附近注释改坏。

**影响**

- Task241 本来是最小被动 runtime，如果放任会扩成学习入口 + HUD 混合切片，难以证明边界。
- 会让后续 UX / learn surface 任务失去清晰验收范围。
- 中途 malformed 注释可能直接造成 build 失败。

**根因**

GLM 把“被动光环 runtime 可触发”误理解为“必须先加学习按钮和可见文案”，没有严格遵守 Task241 的 Forbidden 列表。

**处置**

- Codex 取消 companion job `glm-mo1ewk9s-dbt39q` 并向 tmux 发送中断。
- Codex 移除越界学习按钮和 HUD 文案，只保留被动 runtime 核心。
- Codex 补完整 runtime spec、运行时文档和阶段化静态 proof，把 Task241 以 Codex takeover 方式接受。
- 下一张 Task242 单独开放“学习入口”，避免再把 runtime / learn / HUD 混在一起。

**验证**

- Devotion Aura focused runtime：5/5 passed。
- HERO11 / HERO12 / HERO9 相邻 runtime：23/23 passed。
- HERO13/HERO12 static：119/119 passed。
- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- `./scripts/cleanup-local-runtime.sh` 通过，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- GLM 任务卡中的 Forbidden 不是建议，是硬边界；出现第一处越界 UI / AI / HUD / asset 扩张时，Codex 直接取消并接管。
- 将“学习入口”和“HUD 可见反馈”拆成独立后续任务，避免 runtime 任务默认把可见面一起做掉。
- 以后 runtime 任务如果需要“可触发状态”，优先在测试中设置内部状态；只有 learn-surface 任务才允许写命令卡学习入口。

### DL-2026-04-16-156：Task242 又把学习入口和 HUD 反馈混在一起，并留下直接 runtime 残留

**表象**

Task242 只允许补 Devotion Aura 学习入口，并明确禁止 HUD/status text。GLM 初版仍加入 `虔诚光环 Lv` HUD 文案，并把静态 proof 改成要求 HUD；后续又给出一个 incomplete closeout，只观察到部分 runtime 输出，且直接运行遗留的 Playwright/Vite/Chrome 进程需要强制清理。

**影响**

- 如果接受，会把 Task242 的“学习入口”切片污染成“学习入口 + 可见反馈”混合切片。
- 静态 proof 会从边界证明变成替越界行为背书。
- 直接运行残留会继续消耗内存、电量和 runtime lock，重复触发用户之前指出的机器卡顿问题。

**根因**

- GLM 对 Allowed/Forbidden 的优先级仍不够硬，把“下一步可以做的可见反馈”提前塞进当前任务。
- closeout 仍有“看到部分通过就报告”的倾向，没有严格按任务卡列出的完整验证命令给出原始结论。
- 运行时命令治理没有在 worker 侧完全内化，仍会出现绕开 `run-runtime-tests.sh` 或留下后台进程的风险。

**处置**

- Codex 取消越界 job，并手动移除 Task242 的 HUD/status text。
- Codex 本地完整复验后接受 Task242：learn+runtime 9/9、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc 通过。
- Codex 使用 `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` 清掉残留，并确认没有 Playwright/Vite/chrome-headless-shell。
- Task243 单独开放 Devotion Aura 可见反馈；任务卡明确 HUD/status text 只从 Task243 开始允许。

**防复发**

- GLM closeout 不能用“部分可见通过”替代完整验证；缺一条验证就只能标 `JOB_BLOCKED` 或写 remaining unknowns，不能 accepted。
- 学习入口、runtime、可见反馈继续拆卡；只有当前卡明确允许的 UI 文案才可进入生产代码。
- runtime 后统一执行 cleanup 和进程检查；发现直接 runner 残留时必须先清理，再派下一张任务。

### DL-2026-04-16-157：Task243 自动压缩后继续运行，但 runtime 输出被 tail 截断

**表象**

Task243 派发后，GLM 进入自动压缩超过 4 分钟。压缩恢复后它继续写了文档并启动 runtime，但命令是 `./scripts/run-runtime-tests.sh ... 2>&1 | tail -30`，仍然截断关键输出。Codex 中断后发现它留下过 Playwright/Vite/Chrome 进程，需要强制 cleanup。

**影响**

- 看起来“还在跑”，但 Codex 无法基于截断输出接受 closeout。
- 压缩恢复后的继续执行会和 Codex 的接管判断发生时间重叠，容易造成状态表被 companion 标成 `blocked`。
- 截断 runtime 输出会重犯之前“假绿/半绿”的问题。

**根因**

- GLM 仍习惯在长输出命令后接 `tail`，没有完全遵守“原始结果可复核”的 closeout 标准。
- 自动压缩期间没有一个清晰的“已恢复/仍可继续”的握手机制；Codex 只能按无进展超时接管。

**处置**

- Codex 取消 companion job `glm-mo1gf5dk-1oomyz`，强制清理 runtime 残留。
- Codex 保留可用实现，补强 visible feedback runtime proof：敌人改为已存在的 footman，补足建筑不显示和离开范围提示消失证明。
- Codex 更新 Task241/242 相邻 proof 的阶段口径：Task243 后 HUD 反馈允许，但 Devotion Aura 仍无施法按钮。
- Codex 完整复验后接受 Task243：UX+learn+runtime 14/14、HERO11/12/9 runtime 23/23、static 119/119、build、tsc、cleanup 通过。

**防复发**

- worker 不能在验证命令后接 `tail`、`grep` 或其他截断器；closeout 必须能看到原始通过/失败总数。
- 自动压缩超过数分钟且没有新工具动作时，Codex 可以接管；如果恢复后继续写入，必须以 Codex 本地验证结果为准。
- 被取消的 companion job 可能把任务表短暂同步为 `blocked`；Codex accepted 后必须显式修正 top table、任务卡和状态页。

### DL-2026-04-16-158：Task245 写出合同文档后停在提示符，companion 仍显示 running

**表象**

Task245 派发后，GLM 写出了 `docs/V9_HERO14_RESURRECTION_CONTRACT.zh-CN.md`，但没有继续生成 `tests/v9-hero14-resurrection-contract.spec.mjs`，也没有跑完整验证或 closeout。tmux pane 已回到提示符，`dual-lane-companion status` 仍显示 job running。

**影响**

- 看板和 companion 会让人误以为 GLM 仍在干活，实际任务已经断在半成品状态。
- Task245 被取消后队列表短暂落成 `blocked`，如果不人工修正，会阻塞下一张 Task246。
- 半张合同如果直接接受，会缺少静态 proof，后续 DATA/runtime 任务容易没有硬边界。

**根因**

- GLM 的内部 todo 状态和 companion job 状态没有可靠握手：CLI 回到提示符后 companion 不会自动识别“半成品停住”。
- 任务 closeout 仍依赖 worker 主动完成 proof 和验证；worker停在提示符时，没有自动把 job 标成 `needs_submit` 或 `blocked`。

**处置**

- Codex 取消 companion job `glm-mo1hjtfu-s33uri` 并中断 tmux。
- Codex 接管补强合同：统一 HERO14 阶段名，明确不改生产代码、不落数据、不接 runtime、不加命令卡/HUD/AI/素材。
- Codex 新增 `tests/v9-hero14-resurrection-contract.spec.mjs`，证明当前生产代码仍无 Resurrection 能力数据、施放 runtime 或技能按钮。
- Codex 完整复验后接受 Task245：HERO14/HERO13/HERO12 static 114/114、build、tsc、cleanup 通过，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- 只要 tmux 回到提示符但 companion 仍是 running，Codex 必须把它当成“需要接管或补 closeout”的异常，而不是当成正常运行。
- 每个合同任务必须有 doc + proof + verification 三件套；缺 proof 不能 accepted。
- 取消 job 后必须同步修正 top table、任务卡、状态页和看板，避免 `blocked` 假状态卡住 feed。

### DL-2026-04-16-159：Task246 写了来源文档但 proof 未落盘，续跑消息被排队

**表象**

Task246 中，GLM 使用 webReader 读取 Blizzard Classic Battle.net Paladin 页面，并用 Liquipedia 做交叉核对，随后写出 `docs/V9_HERO14_RESURRECTION_SOURCE_BOUNDARY.zh-CN.md`。但 `tests/v9-hero14-resurrection-source-boundary.spec.mjs` 没有生成。Codex 通过 tmux 发送续跑指令后，消息显示在 Claude Code 输入区并提示可编辑队列，但没有转化为实际执行。

**影响**

- GLM 有有效研究产物，但任务仍缺 proof，不能 accepted。
- companion 把取消后的 Task246 短暂同步为 `blocked`，如果不修正，会阻塞 Task247。
- 续跑指令进入排队态但没有执行，说明“口头 nudge”不一定能恢复半成品任务。

**根因**

- Claude Code pane 可能处于内部任务面板和输入提示并存状态，外部 `send-keys Enter` 不一定等价于真正提交。
- GLM 仍可能在“写完主要文档”后停止，而没有把 doc/proof/verification/closeout 当成一个不可分割的完成单元。

**处置**

- Codex 取消 companion job `glm-mo1hsahb-04qjdy`，保留 GLM 有用的来源文档。
- Codex 修正文档里“Ground 排除建筑”的过强解释，改为当前项目首轮不纳入建筑尸体。
- Codex 补 `tests/v9-hero14-resurrection-source-boundary.spec.mjs`，并完整复验：source+contract+HERO13/HERO12 static 144/144、build、tsc、cleanup 通过。
- Codex 将 Task246 标为 accepted，并补 Task247 数据种子任务。

**防复发**

- 对 GLM 的 nudge 最多尝试一次；如果 tmux 仍显示 prompt 且关键产物缺失，Codex 直接取消接管，避免无限等待。
- source-boundary 任务必须同时落 doc 和 proof，不能只凭研究摘要接受。
- 任务状态修正必须覆盖 top table、任务卡、状态页和看板，防止 `blocked` 残留误导 feed。

### DL-2026-04-16-160：Task247 只改了 GameData，未生成 DATA 文档和 proof

**表象**

Task247 派发后，GLM 正确修改了 `src/game/GameData.ts`，增加 `areaRadius/maxTargets` 可选字段和 `HERO_ABILITY_LEVELS.resurrection` 数据。但它随后停在提示符，没有生成 `docs/V9_HERO14_RESURRECTION_DATA_SEED.zh-CN.md`，也没有生成 `tests/v9-hero14-resurrection-data-seed.spec.mjs` 或完整 closeout。

**影响**

- 代码里已经出现数据种子，但 proof 仍缺失，不能证明没有越界接 runtime/UI/AI。
- 原有 HERO14 contract/source proof 仍有“数据不存在”的旧阶段断言，必须阶段化，否则后续验证会互相打架。
- companion 取消后再次把任务状态落成 `blocked`，需要 Codex 修正。

**根因**

- GLM 能完成直接代码改动，但没有把“代码 + 文档 + proof + 阶段化旧 proof + 验证”作为同一任务完成条件。
- 当前任务卡虽然列了 allowed files，但 worker 仍倾向先做最显眼的代码修改，忽略证明链收口。

**处置**

- Codex 取消 companion job `glm-mo1i4098-26m53x` 并接管。
- Codex 补 DATA1 文档和 data-seed proof，确认 Resurrection 数据为 maxLevel 1、requiredHeroLevel 6、mana 200、cooldown 240、range 4.0、areaRadius 9.0、maxTargets/effectValue 6、effectType `resurrection`。
- Codex 将 contract/source proof 改成 DATA1 后阶段口径：允许 `HERO_ABILITY_LEVELS.resurrection`，继续禁止 `ABILITIES.resurrection`、`castResurrection`、命令卡、HUD、AI 和 runtime。
- Codex 完整复验后接受 Task247：DATA+SRC+CONTRACT+HERO13/HERO12 static 162/162、build、tsc、cleanup 通过。

**防复发**

- 代码切片必须配套 proof；只改代码不生成 proof 的 GLM 输出一律不 accepted。
- 阶段化 proof 是每张后续卡的验收项，不允许旧阶段断言遗留。
- 继续把大 runtime 拆成小卡：下一张只做学习入口，不做施放/复活效果。

### DL-2026-04-16-161：Task248 学习入口半成品停住，runtime proof 使用了错误复活等待时间

**表象**

Task248 派发后，GLM 只在 `src/game/Game.ts` 中写入了 Resurrection 学习入口，然后停在提示符，没有生成学习入口文档、runtime proof 或 closeout。Codex 接管后补 runtime proof，第一次验证中 `RES-LEARN-3` 失败：测试以为 Paladin 祭坛复活完成后应恢复存活，但实际仍是死亡状态。

**影响**

- GLM 产物缺少 proof，不能证明学习入口和 HERO9 祭坛复活兼容。
- 如果只看失败表象，容易误判为生产代码复活逻辑坏了。
- 旧测试常量 `PALADIN_REVIVE_TIME` 是 1 级 Paladin 的复活时间；Task248 场景使用 6 级 Paladin，真实复活队列时间更长，测试提前结束造成假红。

**根因**

- GLM 仍没有把“实现 + 文档 + proof + closeout”作为完成单元。
- 新 runtime proof 没有读取 `altar.reviveQueue[0].totalDuration`，而是复用了 HERO9 级别 1 的时间常量。
- HERO9 复活公式会按英雄等级放大时间，并受 maxFactor / hardCap 限制；Task248 测试必须以真实队列为准。

**处置**

- Codex 取消 companion job `glm-mo1iek8u-35xgef` 并接管。
- Codex 新增 `docs/V9_HERO14_RESURRECTION_LEARN_SLICE.zh-CN.md` 和 `tests/v9-hero14-resurrection-learn-runtime.spec.ts`。
- Codex 修改 `RES-LEARN-3`：启动祭坛复活后读取真实 `queuedDuration`，按队列时间等待，并显式断言队列确实启动。
- Codex 完整复验后接受 Task248：HERO14 static 162/162、build、tsc、learn runtime 3/3、learn+HERO9 revive runtime 10/10、cleanup 通过，无 Playwright/Vite/chrome-headless-shell 残留。

**防复发**

- Runtime proof 涉及队列时间时，优先读取真实队列中的 `totalDuration`，不要把低等级常量外推到高等级场景。
- GLM 半成品停在提示符时，Codex 继续按“取消接管 + 本地复验”处理，不能只靠 companion 的 running/blocked 状态。
- Resurrection 后续继续小切片推进：下一张只做死亡单位记录底座，不直接跳到施放按钮和完整复活效果。

### DL-2026-04-17-162：Task249 重复派发、人工 runtime lock 和 `tail` 验证互相叠加

**表象**

Task249 由 GLM 写出初版后，多次用 `./scripts/run-runtime-tests.sh ... | tail` 运行验证。Codex 接管本地复验时，GLM 又继续拆跑 DR-6 / DR-7，并且 `glm-watch-feed` 在 Task249 未正式 accepted 前重新派发了同名 Task249，生成第二个 companion job。与此同时，本地还存在一个 `sleep 21600` 持有的人工 runtime test lock，note 写着“为了降负载暂停测试”。

**影响**

- Codex 的相邻 runtime 回归被 SIGTERM 中断，看起来像测试不稳定，实际是重复 job / 清理 / 人工锁在抢同一套 runtime。
- GLM 的验证输出被 `tail` 截断，不能作为 accepted 证据。
- 同名 Task249 两个 job 同时存在，导致看板/companion 状态和真实仓库状态不一致。
- 人工 runtime lock 会让 cleanup 误以为“锁仍活着”，除非检查 `pid` 指向的 sleep，否则测试会一直等待或被跳过。

**根因**

- feed 只看队列表仍是 `in_progress/running`，没有识别“Codex 正在接管验收，同名任务不得再次派发”。
- GLM 在被纠偏后仍倾向把长 runtime 输出接 `tail`，并把部分通过拆成可接受进度。
- 人工锁缺少“恢复工作时自动解除”的交接规则。

**处置**

- Codex 暂停 `glm-watch-feed` tmux session，取消重复 job `glm-mo26o14i-g9n0qs`。
- Codex 停止 GLM 后续 runtime 重跑，只保留其有用实现，自己完成本地复验。
- Codex 解除人工 runtime lock：确认 `pid=80655` 是 `sleep 21600` 后 kill，并删除 stale lock。
- Codex 重写 Task249 runtime proof：不再手动清空 `deadUnitRecords` 假装 reset，而是调用真实 `reloadCurrentMap()` 验证地图重开清空。
- Codex 完整复验后接受 Task249：build、tsc、dead-record runtime 2/2、dead-record+learn+HERO9 revive runtime 12/12、static 162/162、cleanup 通过。

**防复发**

- 同名任务只允许一个 active companion job；Codex 接管验收时，feed 必须暂停或看到 accepted 后再派下一张。
- `tail` / `grep` / 截断输出不能作为 closeout 证据。
- 人工 runtime lock 只能作为短时保护；继续工程前必须检查并解除，且 note 需要写清创建原因和解除条件。
- reset/cleanup proof 必须走真实产品路径，如 `reloadCurrentMap()`，不能在测试里直接 `g.deadUnitRecords = []` 来伪造通过。

### DL-2026-04-17-163：Task250 已由 Codex 接管收口，但 GLM companion 仍保持 running

**表象**

Task250 实际已经由 Codex 本地接管、修正并完整复验接受；队列表也已更新为 accepted。与此同时，GLM 的 companion job `glm-mo27nz1x-fjmyco` 仍显示 running，GLM 终端已经回到提示符，还留下了一个 `npx vitest ... | tail -30` 的后台验证进程。旧 Task249 companion job `glm-mo1j3lg0-sh6aeg` 也仍残留 running。

**影响**

- feed 误以为 GLM 仍在旧任务上，无法稳定派发 Task251。
- 看板显示和真实仓库状态不一致，用户看到的是“running”，实际没有可信执行。
- 截断验证继续占用进程位，虽然 CPU 不高，但会继续污染状态判断。
- GLM 后续又输出 Task250 的 `JOB_COMPLETE`，和 Codex 已接受/取消 companion 的真实状态发生错位。

**根因**

- companion job 的生命周期没有跟“Codex 接管并 accepted”自动对齐。
- feed 只看 tracked job running，而没有把队列表 accepted / cancelled 作为更高优先级事实。
- GLM 仍倾向使用 `tail` 做验证收尾，导致 closeout 看似有结果但不可信。
- “提示符可见但状态行仍有旧任务动画/旧 checklist”的场景，仍会让监控在 queued / running 之间摇摆。

**处置**

- Codex 手动终止遗留后台验证进程。
- Codex 取消 stale companion job：`glm-mo27nz1x-fjmyco` 和旧 Task249 job `glm-mo1j3lg0-sh6aeg`。
- feed 随后创建 Task251 job `glm-mo28rp3r-loxllp`；Codex 发现只读状态一度显示 queued prompt 后，手动提交一次，避免它只停在提示符。
- Task251 现在只允许一条 active job；Codex 不接受 Task250 的迟到 closeout 作为新事实，仍以本地复验结果为准。
- Codex 已把根因固化进 `scripts/lane-feed.mjs`：队列表已 accepted / closed 的旧 running companion 不再阻塞下一任务；无当前 job marker 且底部已回提示符的旧 Claude 状态面板不再被算作真实进展。
- 回归验证：`node --test tests/lane-feed.spec.mjs` 70/70 通过；`node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` 103/103 通过。

**防复发**

- 只要队列表某任务已被 Codex 标成 accepted，任何同标题旧 companion running 都应自动视为 stale，并优先 settle/cancel。
- queued prompt 不能算“已经在干活”；必须看到当前 job 的真实读取、编辑、命令或明确思考进展，才能标 running。
- GLM 的 `JOB_COMPLETE` 如果对应的是已取消 job，只能记为迟到输出，不能覆盖 Codex 本地验收结果。
- 这条规则已先固化进 lane-feed；后续如 companion 侧再出现同类错位，再补 companion 层自动 settle。

### DL-2026-04-17-164：Task251 closeout 可信度不足，且 Task252 漏任务卡导致断供

**表象**

Task251 由 GLM 写出初版实现、runtime spec 和文档后，在更新 `docs/GLM_READY_TASK_QUEUE.md` 时出现 `Error editing file`。GLM closeout 写成 `completed`，但 build / tsc / static 证明使用了 `tail` 截断输出，runtime 明确留给 Codex。Codex 接管并完成本地验证后，顶部队列表已经出现 Task252，但详细任务卡缺失，feed 把 Task252 标成 `blocked`，并返回 `milestone_ready_no_transition`。

**影响**

- 如果直接接受 GLM closeout，会把未跑 runtime 的可见反馈误当成已验收。
- Task252 明明是下一张相邻任务，但缺少详细卡片会让 feed 无法派发，表现成“GLM 空闲 / 队列断供”。
- 监控页会同时显示 Task251 accepted 和 Task252 blocked，用户很难判断到底是任务完成、缺货，还是系统坏了。

**根因**

- GLM 对“实现 + proof + 文档 + 队列表 closeout”仍不是原子完成，队列编辑失败后没有自动补救。
- feed 能识别 ready 表格行，但仍依赖同名详细任务卡生成可执行 prompt；表格和卡片不一致时会阻塞。
- 截断验证和“runtime deferred to Codex”不能作为可接受 closeout，但当前 worker 会自然倾向把它写成 completed。

**处置**

- Codex 接管 Task251 本地复核，修正两个实际验收问题：成功施放后补可读 `刚复活 N 个单位`，并把 Resurrection 冷却 / 最近反馈纳入 HUD 刷新 key。
- Codex 完整复验后接受 Task251：build、tsc、Resurrection visible/cast/dead-record/learn + HERO9 revive runtime 22/22、HERO14/HERO13/HERO12 static 162/162、cleanup 通过。
- Codex 补齐 Task252 详细任务卡，并把顶部队列表从 `blocked` 恢复为 `ready`。
- Codex 同步 `docs/CODEX_ACTIVE_QUEUE.md` 和 `docs/DUAL_LANE_STATUS.zh-CN.md`，让看板能显示 Task251 最近收口和 Task252 下一步。
- Codex 随后把“验证命令不能通过 `tail`、`grep`、`head` 截断输出”写进 `scripts/lane-feed.mjs` 派发 prompt，并用 `node --test tests/lane-feed.spec.mjs` 70/70 验证。

**防复发**

- GLM closeout 只要写明 runtime deferred，Codex 必须本地补验或拒收，不能仅凭 worker 的 completed 词接受。
- 验证命令不允许接 `tail`、`grep`、`head` 等截断输出；这已经进入后续派发提示。
- ready 表格行和详细任务卡必须成对出现；后续 feed/补货逻辑还要继续强化“漏卡自动补卡或明确报错给 Codex”的路径。
- 队列编辑失败必须记录到问题日志，不允许悄悄留下半完成队列状态。
- 任务卡生成时要把下一张任务同时写入表格和详细卡片，避免表格 ready、卡片缺失的断供形态。

### DL-2026-04-17-165：V9 启动门全绿后，oracle 误判当前阶段 engineering-closed

**表象**

Task252 被 Codex accepted 后，`glm-watch-feed` 没有继续派下一张任务，而是返回 `milestone_ready_no_transition`：当前 V9 被 milestone oracle 判定为 engineering-closed，但 `docs/VERSION_TRANSITIONS.json` 里没有 V9 之后的 transition。

**影响**

- GLM 真实空闲，但看起来像“阶段已完成所以没任务”。
- V9 实际目标是 Human / 数值 / 英雄扩展长线，不应该因为 HOTFIX、BASELINE、EXPAND 三个启动门全绿就停止。
- 监控页会显示工程闭合，掩盖“完整 Human 仍未完成、Paladin 需要全局收口、其他英雄/AI/物品/空军还没开”的真实状态。

**根因**

- `V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md` 只有 V9 启动门：`V9-HOTFIX1`、`V9-BASELINE1`、`V9-EXPAND1`。
- 这些门全部 engineering-pass 后，oracle 没有看到当前 Human/hero chain 的 open blocker。
- V9 是 runway 型阶段，但文档没有把 runway 内部当前主线作为 gate 表达出来。

**处置**

- Codex 在 V9 remaining gates 中新增 `V9-HEROCHAIN1`，状态为 `V9 blocker / open`，明确 V9 不能因启动门全绿而被判定为 engineering-closed。
- Codex 更新 V9 当前相邻状态：Paladin 已完成 HERO1-HERO14 证据链，下一步是 HERO15-CLOSE1 Paladin 最小能力套件全局收口。
- Codex 补入 GLM Task253 ready 卡，避免 GLM 断供。

**防复发**

- runway 型阶段不能只写启动门；必须始终有一个当前 capability program gate，直到该 program 明确收口或切换。
- 每次 branch closure accepted 后，必须同步更新 remaining gates 的“当前相邻工作”，否则 oracle 会把阶段误判为 closed。
- V9 之后是否需要 V10 transition 可以另行设计，但不能用“没有 transition”作为停止 Human/hero expansion 的理由。

### DL-2026-04-17-166：Task253 自引用 proof 陷阱和 companion accepted 假 running

**表象**

Task253 / HERO15-CLOSE1 中，GLM 初版静态 proof 的 `CLOSE15-39` 读取测试文件自身并断言不包含 `spawnUnit` / `spawnBuilding`。因为断言文本本身就包含这些字符串，测试会自我触发失败。GLM 修正后，队列表一度从 worker 角度写成 `completed`，而 companion 仍把 job `glm-mo2aru5h-u53az9` 显示为 `running`。

**影响**

- 自引用 proof 会制造假红，浪费重复验证和 token。
- 队列表已经被 Codex 验收为 accepted 后，如果 companion 仍显示 running，监控页会误导用户以为 GLM 还在跑旧任务。
- 旧 running 不被系统自动收掉时，会影响下一张任务派发和用户对“双泳道是否还在动”的判断。

**根因**

- 静态 proof 检查范围太粗，把“禁止 runtime 调用”写成“测试源码不出现某些字符串”，导致测试被自己的说明污染。
- 队列长期使用 `accepted` 表示 Codex 本地复核通过，但 `dual-lane-companion.mjs` 只把 `completed` / `done` 当成可从队列表恢复的终态。
- worker 的 `completed` 与 Codex 的 `accepted` 语义没有在 companion 层统一。

**处置**

- GLM 将 `CLOSE15-39` 改成 allowed-file existence check；Codex 本地复验通过后接受 Task253。
- Codex 去掉 Task253 文档中未来源支撑的“53 个子任务”精确说法，改为“14 条连续分支”。
- Codex 修改 `scripts/dual-lane-companion.mjs`，让 codex / glm 队列表的 `accepted` 都能作为终态恢复 running job。
- Codex 补 `tests/dual-lane-companion.spec.mjs` 覆盖 accepted 队列表恢复 running job 的场景。
- 验证：HERO15 单项 40/40、HERO8-HERO15 closure static 278/278、build、tsc、cleanup、dual-lane-companion + lane-feed 104/104 均通过。

**防复发**

- 文档型静态 proof 不应检查“自身源码是否包含某个禁词”；应检查合同文档、生产文件边界或 import / API 调用边界。
- GLM 的 `completed` 只表示 worker 完成；只有 Codex 本地复核后才能在队列表标 `accepted`。
- companion、feed、看板必须统一识别 `accepted`，避免已验收任务继续显示假 running。

### DL-2026-04-17-167：Task254 proof 过宽，GLM 停在失败修复点

**表象**

Task254 / HERO16-CONTRACT1 中，GLM 写出 Paladin AI strategy 合同和 proof 后，首次静态验证 79 项中失败 2 项：`C16-25` 顺序 proof 找到了“顺序约束”标题而不是实际顺序行；`C16-36` 把 `SimpleAI.ts` 中既有 Priest Heal 的泛化 `heal` 字符串误判成 Holy Light 行为。GLM 输出“我来修复”后停在同一失败点，没有继续写入修复。

**影响**

- 如果直接接受，会把 proof 写法问题当成代码事实问题。
- `heal` 误判会让当前已有 Priest AI 行为变成 Paladin AI 合同的假红，误导后续任务。
- GLM 停在失败点但 companion 仍显示 running，会再次造成“看起来在跑，实际没有推进”的状态。

**根因**

- proof 检查粒度不够：顺序验证没有锁定包含全部阶段 id 的实际行。
- production boundary 检查不够精确：Holy Light 应检查 `holy_light` / `holy light` 等专属标识，不应把普通 `heal` 当成 Paladin 行为。
- GLM 在失败后没有完成自修闭环，仍需要 Codex 本地接管验收。

**处置**

- Codex 修正 `tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs`：
  - `C16-25` 改为查找同时包含 `HERO16-AI1..AI5` 的顺序行。
  - `C16-36` 改为只检查 Holy Light 专属标识，不再禁止 generic `heal`。
- Codex 本地复验并接受 Task254：HERO16+HERO15 static 79/79、build、tsc、cleanup 均通过。
- Codex 准备 Task255，把下一步收窄到 AI Altar + Paladin summon readiness，不直接跳到技能学习或施法。

**防复发**

- 静态 proof 禁止用过宽关键词代表具体行为；必须优先检查专属 id、函数名、常量名或合同句子。
- GLM 如果在“我来修复”后 1 个检查周期内无文件变化，Codex 应接管或重发精确继续指令。
- AI 分支必须严格按合同顺序进入实现，避免把英雄生产、技能学习和施法混在一个任务里。

### DL-2026-04-17-168：Task255 先遇到 GLM API 错误和旧任务回流，随后初版 proof 前置不受控

**表象**

Task255 派发后，Claude Code 先返回 API 400 网络错误；重试后又回头尝试修已被 Codex accepted 的 Task254 proof。Codex 中断并重定向后，GLM 才开始 Task255，并写出 `SimpleAI.ts` 初版和 runtime spec。Codex 本地 runtime 首跑 5 项中失败 1 项：`AI1-1` 断言初始没有 Altar，但测试进入时 team1 已有 Altar。

**影响**

- 网络错误 + queued prompt 会让看板显示 running，但实际没有新文件进展。
- 旧任务回流会重复消耗 token，并可能再次改动已验收文件。
- 不受控的测试前置会把默认地图状态误当成 AI 行为失败或成功。

**根因**

- Claude Code API 错误后没有自动把同一个 job 清晰重试到当前任务上下文。
- GLM 的任务面板仍残留旧 HERO11/HERO14/HERO16 proof 状态，容易把已验收任务当作待修任务。
- Runtime proof 未先把 fixture 调成目标前置：AI1-1 要证明“无 Altar 时会建”，但没有先移除已有 Altar 并 reset AI。
- 初版 `SimpleAI.ts` 在尝试建造后立即设置 `altarScheduled = true`，如果没有空闲农民或放置失败，会导致 AI 永久不重试。

**处置**

- Codex 中断 GLM 旧任务回流，并明确 Task254 已 accepted，不得再改。
- Codex 接管 Task255 本地复核：
  - runtime test 在 AI1-1 中移除 team1 既有 Altar、释放占用并 reset AI。
  - `SimpleAI.ts` 去掉尝试建造后立即 `altarScheduled = true` 的写法，让失败建造可重试。
- 验证：build、tsc、`./scripts/run-runtime-tests.sh tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` 5/5、cleanup 均通过。

**防复发**

- runtime proof 必须显式建立前置条件，尤其是“默认地图可能已经有对象”的场景。
- GLM 遇到 API/network error 后，feed 或 Codex 应优先确认是否有文件变化；没有变化时重发当前任务，不能让旧状态自行接管。
- 对 “schedule once” 类 AI 状态，只有观察到已存在 / in-progress 对象后才能置位；单纯尝试一次不能永久关闭重试。

### DL-2026-04-17-169：Task256 已有代码和绿测，但缺可信 closeout 且出现同向自动补货重复卡

**表象**

Task256 / HERO16-AI2 中，GLM 已写出 `SimpleAI.ts` 学习逻辑和 runtime spec，并在终端里开始跑验证；但 pane 回到提示符后没有输出 `JOB_COMPLETE: glm-mo2cfx9i-vfw4dw`，`lane-feed status` 仍显示 tracked job running。队列表同时出现一条自动补货生成的中文同向任务 `AI 圣骑士技能学习优先级证明包`，状态为 `in_progress`。

**影响**

- 看板会显示 Task256 仍在跑，实际 GLM 已经停在提示符。
- 同向自动补货卡如果继续保持 in_progress，可能让 feed 重复派发已完成内容，浪费 token。
- 没有 Codex 本地验收前，不能把 GLM 的半截 runtime 输出当成可信 closeout。

**根因**

- GLM 没有按任务要求输出带 job id 的 closeout，companion 无法自动收束 running 状态。
- 自动补货机制只根据相邻缺口生成任务，没有在同方向任务已经由编号 Task256 执行时自动合并同名卡。
- 队列需要 Codex 验收后把 duplicate 卡显式标为 superseded，不能靠任务标题相似自动推断。

**处置**

- Codex 本地复核 Task256：
  - `npm run build` 通过。
  - `npx tsc --noEmit -p tsconfig.app.json` 通过。
  - `./scripts/run-runtime-tests.sh tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` -> 11/11 通过。
  - `./scripts/cleanup-local-runtime.sh` 完成。
- Codex 将 Task256 从 `completed / 待复核` 改为 `accepted`。
- Codex 将自动补货同向中文卡改为 `superseded`，明确不得再派发。
- Codex 补 Task257 ready 卡，把下一步限定为 AI Holy Light defensive cast。

**防复发**

- worker closeout 缺失时，Codex 必须以本地完整验证为准，不接受终端截断片段。
- 自动补货生成的任务进入 live queue 前，应优先按 gate / proof target / allowed files 和最近 accepted 任务做去重。
- 同方向任务被编号任务覆盖后，要显式标记 superseded，而不是留一个中文同名 in_progress 卡。

### DL-2026-04-17-170：Task257 GLM 低上下文停在 API seam，Codex 接管实现

**表象**

Task257 / HERO16-AI3 派发后，GLM 正确判断 `castHolyLight` 是 private，应通过窄 wrapper 复用现有施法路径。但它只完成了 `AIContext.castHolyLight` 和 `Game.ts.aiCastHolyLight` 的第一步，就停在提示符，未写 AI 施放逻辑、未创建 runtime spec，也没有 closeout。终端状态只剩约 3% context。

**影响**

- 如果继续等，GLM 看起来 running，实际没有推进。
- 半成品 seam 会让 `Game.ts` / `SimpleAI.ts` 处于不完整接口状态。
- 这类任务会改 `Game.ts` 和 `SimpleAI.ts`，不适合让 Codex 和 GLM 同时编辑。

**根因**

- GLM 当前 Claude Code session 长期累积了旧 checklist 和低上下文状态，容易在分析后停住。
- Task257 比 Task256 风险更高，涉及跨 `Game.ts` / `SimpleAI.ts` 的运行时 seam，不是纯测试或单文件小改。
- feed 状态对“刚有一点 diff 但停在提示符”的场景仍需 Codex 判断是否接管。

**处置**

- Codex 给 GLM 发送暂停指令，避免继续编辑同一组文件。
- Codex 接管 Task257：
  - 保留 GLM 已加的 `aiCastHolyLight` wrapper。
  - 在 `SimpleAI.ts` 只做目标选择，并调用 context wrapper，不复制 Holy Light 数值公式。
  - 新增 `tests/v9-hero16-ai-holy-light-cast.spec.ts` 覆盖成功治疗、非法目标和失败门槛。
- 验证：build、tsc、Task255/256/257 focused runtime 14/14、cleanup 通过。

**防复发**

- GLM context 低于安全余量且任务涉及 shared runtime seam 时，Codex 应优先接管或重启 GLM session，而不是让它在同一低上下文里继续写。
- 对跨 `Game.ts` / `SimpleAI.ts` 的 AI 施法任务，任务卡必须强制“复用现有施法路径，不复制公式”。
- 只要 GLM 停在提示符且 30 秒没有新文件或测试产出，Codex 应明确接管或重新派发，不接受假 running。

### DL-2026-04-17-171：Task258 重复触发同一低上下文停顿，应在后续重启 GLM session

**表象**

Task258 / HERO16-AI4 派发后，GLM 复现 Task257 的模式：只添加了 `aiCastDivineShield` wrapper、`AIContext.castDivineShield` 和 `createAI` 连接，随后在 0% context compact，未写 AI 逻辑、未写 runtime spec、未跑验证。

**影响**

- GLM 对跨 `Game.ts` / `SimpleAI.ts` 的 AI 施法任务已经连续两次只能完成 seam 的第一步。
- 如果继续给同一个低上下文 session 派发 Task259，可能再次产生半成品和假 running。
- Codex 需要承担 takeover 成本，GLM 的有效产出降低。

**根因**

- 当前 GLM Claude Code session 已在 HERO11/HERO14/HERO16 多轮任务后接近 context 尽头，旧 checklist 和历史输出挤占上下文。
- AI 施法任务需要理解现有 private cast path、AIContext、runtime proof 和禁区，比纯文档或单文件测试更吃上下文。
- feed 能发现 interrupted，但不能自动把 Claude Code session 换成一个干净的新上下文。

**处置**

- Codex 接管 Task258：
  - 保留 GLM 已加的 `aiCastDivineShield` wrapper。
  - 在 `SimpleAI.ts` 加低生命触发，只调用 context wrapper，不复制 Divine Shield 数值公式。
  - 新增 `tests/v9-hero16-ai-divine-shield-cast.spec.ts`。
- 验证：build、tsc、Task255/256/257/258 focused runtime 17/17、cleanup 通过。

**防复发**

- Task259 前应优先重启或刷新 GLM session，再派发下一张 AI 施法任务。
- 对连续两次 low-context partial 的 worker，不能继续假定“同一 session 会恢复”；要切成 fresh session 或由 Codex 完成高风险 seam。
- 监控页面应把 “0% context + interrupted + only seam diff” 视为需要维护 worker，而不是普通 running。

### DL-2026-04-17-172：Task259 初版证明过宽且历史死亡记录口径需要迁移

**表象**

Task259 / HERO16-AI5 中，GLM 添加了 `aiCastResurrection` wrapper、AIContext seam、SimpleAI 调用和初版 runtime spec。初版测试反复跑 300 tick 让 AI 自己造英雄，并手动从 `g.units` / `scene` 中拔单位来模拟死亡；断言多为“法力变少”“至少复活 1 个”，没有精确绑定 200 mana、240 秒冷却、记录消费和非法记录保留。GLM 同时把 `deadUnitRecords` 从只记录 team0 改成所有队伍，但旧 HERO14 死亡记录测试和文档仍写着 team1 不记录。

**影响**

- 初版测试容易绿在不稳定 fixture 上，无法证明 AI 复活术复用了玩家路径。
- 只改生产逻辑不改旧死亡记录合同，会留下“代码记录 team1 / 文档说 team1 不记录”的证据冲突。
- 如果不限制记录队伍，未来 neutral / creep-like 单位可能提前进入 Resurrection 记录底座，越过当前 V9 边界。

**根因**

- Task259 依赖 HERO14 死亡记录底座，但 AI 侧需要 team1 友军死亡记录；这是合同迁移，不是单点 AI 调用。
- GLM 低上下文下倾向于写“能跑起来”的长 fixture，而不是收敛到最小精确合同。
- 旧阶段 proof 是历史口径，进入 HERO16 后需要 stage-aware 对齐。

**处置**

- Codex 接管 Task259：
  - `Game.ts` 将死亡记录扩展为 team0 / team1 可控阵营，继续排除中立 / creep-like、建筑和英雄。
  - `tests/v9-hero16-ai-resurrection-cast.spec.ts` 重写为 4 条 focused runtime：成功施放精确 200 mana / 240s、非法记录不消费、失败门槛、真实 team1 死亡记录只消费一次。
  - `tests/v9-hero14-resurrection-dead-record-runtime.spec.ts` 和 `docs/V9_HERO14_RESURRECTION_DEAD_RECORD_SLICE.zh-CN.md` 同步到 team0/team1 记录合同。
- 验证：
  - `npm run build` 通过。
  - `npx tsc --noEmit -p tsconfig.app.json` 通过。
  - 受影响 runtime 28/28 通过。
  - `./scripts/cleanup-local-runtime.sh` 和 `git diff --check` 通过。

**防复发**

- 任何“为了 AI 能用而扩展旧底座”的改动，都要同步迁移旧 proof 和文档口径。
- AI runtime proof 优先用直接可控 fixture，不用长时间 build-order 轮询证明施法能力。
- 对公式复用类任务，必须断言精确数值和记录消费，而不是只断言“发生了”。

### DL-2026-04-17-173：Task260 GLM 停在半成品，旧“无 AI”证明必须改成阶段感知

**表象**

Task260 / HERO16-CLOSE1 中，GLM 只把 HERO16 合同和部分 proof 改成 stage-aware，随后停在提示符。它没有创建 HERO16 closure 文档/证明，也没有更新 HERO15 收口里“SimpleAI 没有 Paladin AI”的旧断言。

**影响**

- 看板和文档会同时出现两种互相冲突的事实：HERO16 已经有 Paladin AI，但 HERO15/旧合同 proof 仍断言 SimpleAI 不能包含 Paladin。
- 如果不收口，后续 HERO17 Archmage 会基于过期边界继续拆任务。
- GLM 低上下文下容易只修当前失败测试，不补跨阶段口径迁移。

**根因**

- HERO16 是在 Task254 合同之后逐步实施 AI1-AI5，合同原文里的“当前无 AI”是历史事实，不是现在事实。
- closure 任务需要同时更新当前任务、前序 closure 和后续 gate 口径，比单个 proof 修补更吃上下文。
- GLM session 已多次在 HERO16 跨文件收口任务中停在 prompt，需要 Codex 接管高层口径。

**处置**

- Codex 接管 Task260：
  - 新增 `docs/V9_HERO16_PALADIN_AI_STRATEGY_CLOSURE.zh-CN.md`。
  - 新增 `tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs`。
  - 把 `tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs` 的 C16-35..C16-39 改为证明 bounded Paladin AI 和 Game.ts wrapper 委托，而不是旧的“无 Paladin”断言。
  - 更新 HERO15 closure 文档和 proof：完整 AI 仍延后，但 HERO16 已覆盖最小 Paladin AI 链路。
- 验证：static proof 96/96、build、tsc、cleanup、diff check 通过。

**防复发**

- 对 “contract 时事实已被后续任务改变” 的场景，proof 必须改成 stage-aware，而不是继续验证旧事实。
- closure 任务必须检查前序 closure 是否也需要迁移口径。
- GLM 停在 prompt 且缺 closure doc / proof 时，Codex 应直接接管，不再继续等待同一低上下文 session。

### DL-2026-04-17-174：Task261 GLM closeout 缺失，来源前合同需防止凭记忆写值

**表象**

Task261 / HERO17-CONTRACT1 中，GLM 写出 Archmage 分支合同和静态 proof 后再次回到提示符，未按要求跑完整验证，也没有 closeout。合同初稿一度把 `deadUnitRecords` 写成更宽泛的死亡记录边界，容易误导后续 Water Elemental 处理。

**影响**

- 如果不复核，后续 Archmage 数据任务可能直接凭记忆写 Archmage / Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 数值。
- Water Elemental 是否进入死亡记录会被过早定死，和当前 Resurrection 只记录 team0/team1 可控普通单位的合同冲突。
- GLM 的“写了文件但没 closeout”会让看板误以为任务结束。

**根因**

- Archmage 分支从 Paladin 链路切换到第二名英雄，需要先做 source-first 边界，而不是直接复制 Paladin 模式。
- GLM 终端仍存在 queued/prompt 假停顿问题，容易在写出第一批文件后停止。
- 当前任务是文档+proof，看似简单，但有较强的历史边界迁移风险。

**处置**

- Codex 接管 Task261 本地复核：
  - 接受 `docs/V9_HERO17_ARCHMAGE_BRANCH_CONTRACT.zh-CN.md` 和 `tests/v9-hero17-archmage-branch-contract.spec.mjs` 的主体结构。
  - 修正死亡记录口径：当前只记录 team0/team1 可控阵营普通非英雄非建筑死亡单位，中立/英雄/建筑不记录；Water Elemental 是否记录延后。
  - 确认合同不写数值、不改生产代码、不宣称 Archmage 或四个技能已实现。
- 验证：static proof 93/93、build、tsc、cleanup、diff check 通过。

**防复发**

- 每个新英雄分支都必须先有 source boundary，不能从合同直接跳数据种子。
- 对召唤单位、尸体、复活、光环等复用点，合同必须明确“可复用机制”和“不能直接复用的公式/语义”。
- GLM 写完文件但没有 closeout 时，Codex 本地验收前不得把队列标 accepted。
