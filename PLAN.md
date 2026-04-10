# War3 RE - 动态总控规划

> 最后更新：2026-04-10
> 当前状态：线上可玩原型已建立，控制/命令/AI 主干开始成型，但“第一局真正像 War3”仍未成立。
> 线上地址：[https://happle940.github.io/war3-re/](https://happle940.github.io/war3-re/)
> 文档定位：这是项目的总控判断文档，不是功能愿望清单。它优先回答：
> 1. 我们现在真实处在哪
> 2. 我们离目标还差哪一整层
> 3. 下一步最值得做什么，什么现在不该做

---

## 1. 北极星目标

在浏览器里做出一个让 War3 老玩家愿意认真打一局、并且在前 5 分钟内就感到“这东西真的有 War3 味”的单机 1v1 RTS。

这个目标必须同时满足 4 个条件：

1. 运行时真相成立
- 采集、建造、训练、命令、战斗、资源、AI 这些不是拼出来的表演，而是真正一致的游戏语义。

2. 玩家控制权成立
- 玩家必须能稳定地选、拉、撤、补位、集火、编组。
- 不能出现“系统在和玩家抢单位”的情况。

3. 对战观感成立
- 画面不要求一开始就豪华，但必须让人一眼看出：这是 War3 风格的战场，而不是网页测试板。

4. 浏览器里真的能玩
- 不是“能运行”，而是“能打一局”。
- 必须有可持续的验证链路：build、runtime smoke、线上试玩、GitHub 归档。

---

## 2. 当前最准确的项目判断

这个项目现在已经不是“空白原型”，也不是“接近完成的 alpha”。

当前最准确的判断是：

> 一个已经具备明显 RTS 运行时骨架、并且开始拥有 War3 控制语言雏形的浏览器原型；
> 但它还没有跨过“真正可玩的一局”和“第一眼像 War3 对战”的门槛。

更直接一点说：

- `系统层`：已经有实质进展
- `控制层`：开始站住，但还没完全收口
- `AI 开局循环`：开始有样子，但还没通过真实 runtime 门禁
- `视觉/战场观感`：仍处于 blockout / prototype 阶段
- `产品阶段`：还没到“可向 War3 玩家自信展示”的点

---

## 3. 已经真实拥有的东西

截至 2026-04-10，项目已经具备这些真实基础：

### 3.1 运行时主干
- 地图加载与地形渲染
- 基础资源系统（金 / 木 / supply）
- 建造、训练、采集、返回交付
- blocker / 占用 / 路径查询主干
- `GameCommand` 命令入口
- 基础 AI 主干
- GitHub 仓库与 GitHub Pages 在线试玩链路

### 3.2 控制语言雏形
- Selection model
- Shift+click add/remove
- 双击同类
- Control groups
- Tab subgroup alpha
- Queue foundation（已开始）
- move / attack / gather / build / train / rally / attackMove 基础语义

### 3.3 协作和验证基础设施
- `PLAN.md` 动态总控
- overnight 执行文档体系
- smoke checklist / gameplay regression checklist
- GitHub Pages 线上试玩入口
- `glm` 可按阶段 commit / push

这些意味着：

> 项目最难的“从 0 到有骨架”阶段已经过去了。

我们现在的问题已经不是“有没有系统”，而是“这些系统有没有统一成真正的 War3 体验”。

---

## 4. 我们和真正 War3 的差距，顶层看是什么

这不是“差几个功能”的问题，而是差了一整层 `产品统一性`。

### 4.1 不是缺一个 feature，而是缺一层统一
当前版本已经能做很多事，但玩家感知到的仍然更像：

> 一个能跑的 RTS 原型

而不是：

> 一个会让 War3 老玩家自然进入对战思维的战场

### 4.2 当前最主要的 4 个差距

#### A. Control Truth 还没完全闭合
典型例子：
- 玩家 `move` / `stop` 还会被 auto-aggro 抢回
- 某些覆盖 / 排队 / 恢复语义仍有边界缺口
- 玩家还不能完全相信“我的命令一定优先”

这会直接破坏你最在意的：
> 每个单位都在我手里

#### B. AI 的前 3-5 分钟还没被 runtime 证明
现在 AI 有了不少代码，但这不等于：
- 稳定采金
- 稳定伐木
- 正确建 farm / barracks
- 正常训练 / 集结 / 第一波进攻

如果 AI 开局循环没站住，就不存在“第一局真正成立”。

#### C. 对战观感仍然停在 blockout
我们刚对比过真实 War3 画面和当前 demo，最大结论是：

- 空间语法还弱
- 单位/建筑剪影还弱
- 画面信息密度还低
- 战场重量感和读图能力还没建立

也就是说，视觉层不是“差一点 polish”，而是还差一整层 `战场可读性`。

#### D. 缺少 runtime-first 的门禁文化
最近几轮最明显的问题不是代码写不出来，而是：

- build 很快就绿
- phase 很快就完成
- 但 runtime truth 其实还没过

所以后续任务不能再只按“功能实现”来组织，而要按：

> fail-until-pass 的运行时门禁

来组织。

---

## 5. 当前阶段重定义

当前最准确的阶段不是“Vertical Slice 已完成”，也不是“Human Gameplay Alpha 已完成”。

当前阶段应该定义为：

# 当前阶段：Agency Prototype / Gameplay Truth Not Closed / Visual Slice Blockout

拆开讲就是：

1. `Agency Prototype`
- 选择、编组、队列、部分命令语言已经开始成立。

2. `Gameplay Truth Not Closed`
- 玩家命令优先级、AI 开局循环、前 5 分钟可玩性还没有完全收口。

3. `Visual Slice Blockout`
- 视觉和空间层还只是在占位，不足以证明“这就是 War3 对战切片”。

这一定义很重要，因为它决定了后面的优先级：

- 现在**不应该**继续盲目扩系统
- 也**不应该**在无人值守时继续做大视觉迭代
- 现在最值得做的是：
  - 先把 gameplay truth 收口到“前 5 分钟能打一局”
  - 再进入有人在场的人眼驱动视觉切片打磨

---

## 6. 后续任务选择原则（非常重要）

这是这次重构 `PLAN.md` 最关键的新部分。

### 6.1 夜间 / 无人值守任务，只做这类
适合 `glm` 长时间自己跑的任务：

- 命令系统
- order / queue / interrupt / restore 语义
- AI 经济与出兵节奏
- 资源 / supply / 建造真相
- regression hardening
- 拆分过大的逻辑文件（前提是边界清楚）
- checklist / runtime harness / 自动验证链路

这些任务的共同点是：
- 可以用 build、types、运行时逻辑、明确 smoke 来验证
- 不依赖“人眼看上去像不像”
- 适合长时间连续推进

### 6.2 白天 / 你在线时，才做这类
需要你当“眼睛”和“试玩者”的任务：

- 镜头 / FOV / AoA / framing
- 地图空间语法
- 单位 / 建筑 / 树林 / 矿区比例
- HUD 氛围与布局
- 战场密度与可读性
- 反馈层（受击、选中、移动指示器、命中感）

这些任务的共同点是：
- build 通过不等于效果对
- 必须反复看、反复试、反复调
- 不能靠无人值守完成

### 6.3 一句原则

> 夜间做“对不对”，白天做“像不像”。

这条规则以后应长期成立。

---

## 7. 新的阶段路线图

### Stage 0：Runtime Skeleton
定义：资源、建造、训练、采集、战斗、路径这些主干存在。
状态：**基本已过**。

### Stage 1：Unit Agency Truth
定义：玩家能可信地选、控、拉、撤、排队，不被系统抢单位。
状态：**进行中，未过门禁**。

必须门禁：
- `move` 真能拉走交战单位
- `stop` 不会下一帧被 auto-aggro 抢回
- `hold` / `attackMove` 语义不退化
- 编组 / 队列 / subgroup 不破坏命令优先级

### Stage 2：First 5 Minutes Playable
定义：玩家和 AI 在前 3-5 分钟内都能跑出可信循环。
状态：**未过门禁**。

必须门禁：
- AI 稳定采金 + 伐木
- AI 稳定建 farm / barracks / 出 footman
- supply 与资源链不乱
- 玩家能正常采集、建造、出兵、控兵
- 第一波进攻真实发生

### Stage 3：Readable Battle Slice
定义：虽然还是代理模型，但战场已经“能读”。
状态：**尚未真正开始**。

必须门禁：
- 一屏里能一眼读出：基地、矿区、树林、交战空间
- 单位 / 建筑剪影可区分
- 血条 / 选中 / 命令反馈统一
- 交战状态能被看懂

### Stage 4：War3 Feel Vertical Slice
定义：一个短时长、可反复试玩的“像 War3 的切片”。
状态：**远未达成**。

必须门禁：
- 真实玩家能直觉操作
- 第一反应不是“网页原型”
- 能打出一段你愿意给人看的 30-60 秒

### Stage 5：Human vs AI Alpha
定义：第一次能认真打一局。
状态：**未来阶段**。

---

## 8. 现在最不该做的事

在 Stage 1 和 Stage 2 没过之前，这些都不该进入主线：

- 英雄系统
- 迷雾
- 物品 / 商店
- 第二种族
- 完整技能系统
- 8 方向寻路 / 单位碰撞大工程
- ECS / EventBus 大重构
- 复杂视觉特效堆砌
- 大而全资产接入

原因很简单：

> 现在最大的风险不是“内容不够多”，而是“前 5 分钟不成立，单位不够在手里，画面还像 blockout”。

---

## 9. 当前主线优先级

### Priority 1：Runtime Hardening
要回答的问题：
- 玩家单位到底是不是在我手里
- AI 开局到底能不能正常运转

### Priority 2：First 5 Minutes Playable
要回答的问题：
- 我能不能正常打一段开局
- AI 会不会按最小 War3 节奏陪我打一段

### Priority 3：Readable Battle Slice
要回答的问题：
- 当 runtime truth 过门禁后，战场能不能被读懂

这个顺序不能反。

---

## 10. 给 `glm` 的协作协议（从现在开始）

### 10.1 每轮任务必须属于下面二选一

#### 类型 A：无人值守深逻辑任务
必须具备：
- build / tsc 门禁
- runtime truth 门禁
- 真实 regression checklist
- phase 完成即 commit / push

#### 类型 B：有人在线的人眼驱动任务
必须具备：
- 截图或线上链接
- 明确需要人工观察与反馈
- 不允许宣称“像 War3 了”除非经过人眼确认

### 10.2 不再接受的完成方式
以下完成方式以后不算完成：
- “代码路径看起来没问题”
- “build 通过所以 runtime 应该也行”
- “调了参数所以视觉应该更像了”

### 10.3 每轮汇报必须明确区分
- 哪些是命令验证
- 哪些是 runtime 验证
- 哪些只是代码结构检查
- 哪些还没真正验证

### 10.4 Git 规则
每个通过门禁的 phase，必须：
- `git add -A`
- `git commit -m "<phase summary>"`
- `git push origin main`

只有 `npm run build` 和 `npx tsc --noEmit -p tsconfig.app.json` 都通过后才允许 push。

---

## 11. 立刻可执行的下一步

### Next Theme
# Runtime Hardening 01 — Manual Command Supremacy + AI Opening Truth

目标：
先把“玩家真的能拉走单位、真的能 stop 脱战、AI 前 3 分钟真的能跑起来”收口干净。

这是现在最值得做的事，因为：
- 它直接决定 Stage 1 和 Stage 2 能不能过门禁
- 它适合 `glm` 长时间无人值守推进
- 它比继续盲做视觉更接近你要的 War3 核心

### 必须包含的三类工作
1. 玩家命令优先级 hardening
- `move`
- `stop`
- `hold`
- `attackMove`
- auto-aggro 抑制与恢复

2. AI 开局经济 hardening
- gold / lumber 平衡
- farm / supply 真相
- barracks / footman 节奏
- rally / first wave truth

3. 前 5 分钟 runtime 验证
- 本地 dev
- checklist
- 线上试玩链接
- 不能只靠代码阅读

---

## 12. 一句话总纲

这个项目现在最缺的，不是再多一个系统，也不是再多一点视觉参数。

它最缺的是：

> 把已经有的运行时骨架、控制语言和 AI 开局，收口成一个“前 5 分钟真的能打、玩家真的能控”的真实 War3 雏形。

只要这一步没过，后面的英雄、迷雾、第二种族、宏大视觉，全都还太早。
