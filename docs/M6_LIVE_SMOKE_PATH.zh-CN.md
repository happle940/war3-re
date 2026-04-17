# M6 Live Smoke Path

> 用途：在私测 / 对外试玩前，用最小但可重复的路径确认“这个版本至少能被正常打开、理解和操作”。
> 范围：这是 release 前 smoke，不替代完整 runtime regression。

---

## 入口条件

开始 smoke 前，至少满足：

- `npm run build` 通过
- `npx tsc --noEmit -p tsconfig.app.json` 通过
- 当前分支没有未解释的实验性改动
- [docs/KNOWN_ISSUES.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/KNOWN_ISSUES.zh-CN.md) 已更新

---

## Smoke 路径

### 1. 打开版本

- 能正常打开目标版本页面
- 无白屏
- 无明显启动崩溃
- 初始 HUD 出现

### 2. 读懂开局

- 默认镜头下能看见 Town Hall、至少一个 worker、金矿
- 玩家能一眼分辨“基地核心 / 矿区 / 树线”
- 不需要读源码或聊天记录才能明白自己该做什么

### 3. 做出最小操作闭环

- 选中一个 worker
- 右键金矿，看到采金闭环开始
- 右键地面，看到移动反馈成立
- 选中 Town Hall 或 Barracks，命令卡可读

### 4. 做出最小生产闭环

- Town Hall 训练 worker 或 Barracks 训练 footman
- 资源正确扣除
- 新单位正常出生
- 若设置了金矿 rally，新 worker 自动进入采集

### 5. 验证 AI 不是静止样机

- AI 在开局能采集
- AI 会继续出兵或维持经济
- 对局不是“玩家一个人在空地图里操作”

### 6. 没有立即误导试玩者的灾难性问题

- 没有明显不可恢复的卡死
- 没有持续刷错的 HUD / 终端异常
- 没有一眼就破坏反馈质量的严重错觉，例如：
  - 点不中核心对象
  - HUD 把主视图关键对象压住
  - 开局就无法理解如何执行基本 RTS 操作

---

## 通过标准

满足下面全部条件，才算通过 smoke：

- 页面能打开且可操作
- 开局核心对象可见且可理解
- 最小经济闭环成立
- 最小生产闭环成立
- AI 不是静态摆设
- 没有会明显污染外部反馈的灾难性问题

---

## 不通过时的处理

如果 smoke 失败，不直接说“不能发”，而是先归类失败原因：

- `启动失败`
- `可读性失败`
- `核心交互失败`
- `生产闭环失败`
- `AI 存活性失败`
- `反馈污染风险过高`

然后把失败归因写回：

- [docs/KNOWN_ISSUES.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/KNOWN_ISSUES.zh-CN.md)
- 对应 gate packet
- 必要时补成新的 runtime contract 或 Codex/GLM task

---

## 备注

- 这条 smoke path 的目标不是证明“游戏已经完整”，而是证明“把链接发给别人后，对方能在正确语境下给出有效反馈”。
