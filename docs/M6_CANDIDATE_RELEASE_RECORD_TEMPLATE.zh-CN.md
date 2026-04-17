# M6 Candidate Release Record Template：候选版本证据记录

> 用途：每一个 `M6` 候选 build 都复制一份本模板填写。没有填完证据前，不应声称该候选版可私测或公开分享。

## 1. 候选版本标识

```text
候选记录 ID：
记录日期：
记录人：
候选分支：
候选 commit：
部署 / 试玩链接：
构建产物或 Pages workflow 链接：
目标判断：private playtest / public share / hold
用户授权状态：未授权 / 已授权少量私测 / 已授权公开分享
本记录覆盖范围：
```

备注：

```text

```

## 2. Build / Typecheck 结果

| 项目 | 命令或证据 | 结果 | 时间 | 日志 / 链接 | 备注 |
| --- | --- | --- | --- | --- | --- |
| Build | `npm run build` | pass / fail / not run |  |  |  |
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json` | pass / fail / not run |  |  |  |
| CI / Pages | 目标 workflow 或部署记录 | pass / fail / not checked |  |  |  |

失败或未运行的处理：

```text
阻断级别：阻断任何外部分享 / 阻断公开 / 仅影响信心
默认 owner：
下一步：
```

## 3. Live Smoke 结果

Smoke 目标：证明这个链接能被正常打开、理解和操作；不替代完整 runtime regression。

| Smoke 步骤 | 通过标准 | 结果 | 证据 / 截图 / 备注 |
| --- | --- | --- | --- |
| 打开版本 | 页面能打开；无白屏；无启动崩溃；初始 HUD 出现 | pass / fail / not run |  |
| 读懂开局 | 默认镜头能看见 Town Hall、worker、金矿；能分辨基地核心 / 矿区 / 树线 | pass / fail / not run |  |
| 最小操作闭环 | worker 可选中；右键金矿采集；右键地面移动；Town Hall / Barracks 命令卡可读 | pass / fail / not run |  |
| 最小生产闭环 | 能训练 worker 或 footman；资源正确扣除；新单位正常出生 | pass / fail / not run |  |
| AI 不是静止样机 | AI 能采集、出兵或维持经济；不是玩家独自在空地图操作 | pass / fail / not run |  |
| 无灾难性反馈污染 | 无不可恢复卡死、持续刷错、严重性能问题、HUD/点击/镜头明显误导 | pass / fail / not run |  |

Smoke 总结：

```text
Smoke 总结果：pass / fail / not complete
失败分类：启动失败 / 可读性失败 / 核心交互失败 / 生产闭环失败 / AI 存活性失败 / 反馈污染风险过高 / 无
是否触发 release red line：是 / 否 / 不确定
下一步：
```

## 4. Runtime 证明链接 / 备注

只记录和当前候选判断有关的 proof。历史通过可以作为参考，但不能替代候选版重验。

| Claim | 证明来源 | 当前候选状态 | 缺失影响 | 备注 |
| --- | --- | --- | --- | --- |
| 玩家能完成最小经济闭环 | live smoke / focused runtime proof / 相关 spec | pass / fail / not proven | 阻止公开，通常也阻止私测 |  |
| 玩家能完成最小生产闭环 | live smoke / focused runtime proof / 相关 spec | pass / fail / not proven | 阻止公开，通常也阻止私测 |  |
| AI 不是静止样机 | AI economy / recovery / smoke 证据 | pass / fail / not proven | 至少阻止公开 |  |
| 没有严重 runtime 错误 | smoke console / runtime pack / CI logs | pass / fail / not proven | 视严重程度阻断 |  |
| 已知 red line 已关闭 | red line 复核记录 | pass / fail / not proven | 一级红线阻止任何外部分享 |  |

运行过的 runtime 命令或证明链接：

```text
1.
2.
3.
```

缺失 proof：

```text
缺失项：
默认 owner：
影响：阻止私测 / 阻止公开 / 仅影响 polish 信心
```

## 5. Docs Sync

| 文档 / 入口 | 当前候选版是否已同步 | 证据 / 链接 | 备注 |
| --- | --- | --- | --- |
| Known Issues 已刷新到当前候选版 | yes / no / not checked |  |  |
| README / 分享入口能独立解释 alpha 范围 | yes / no / not checked |  |  |
| 私测邀请或反馈边界已准备 | yes / no / not checked |  |  |
| 公开分享 checklist 已复核 | yes / no / not applicable |  |  |
| Release red lines 已复核 | yes / no / not checked |  |  |
| 反馈路径或反馈模板已提供 | yes / no / not checked |  |  |
| 分享边界已写清：不可转发 / 私测 / 公开 | yes / no / not checked |  |  |

Docs 同步结论：

```text
docs sync: pass / fail / incomplete
会不会导致 tester 误解当前范围：会 / 不会 / 不确定
需要补的文案：
```

## 6. Final Disposition

只选一个：

```text
final disposition: private playtest / public share / hold
```

### 可判 `private playtest` 的最低条件

- build 和 typecheck 通过。
- live 页面可打开。
- 最小 smoke 路径通过，或缺口不会污染受控私测反馈。
- Known Issues 已同步。
- 没有一级 release red line。
- tester 范围受控，且用户已允许少量私测。

### 可判 `public share` 的最低条件

- `private playtest` 条件全部满足。
- 公开分享 checklist 可判 `YES`。
- README / 分享页能让陌生 tester 不读聊天记录也理解范围、操作、已知问题和反馈边界。
- 二级红线已关闭，或用户明确接受其公开风险。
- 用户明确批准公开分享。

### 应判 `hold` 的情况

- build / typecheck / live smoke 任一关键证据失败或缺失。
- 存在一级 release red line。
- docs 未同步，tester 会误解当前范围。
- 用户尚未批准任何外部分享。
- 公开分享条件不足，但文案或计划试图按公开 demo 传播。

最终理由：

```text
结论：
主要依据：
阻断项：
下一步：
Owner：
```

## 7. 记录规则

- 本记录只描述一个候选版本，不要把历史绿灯直接套到新候选版。
- 证据字段留空时，默认按 `not proven` 处理。
- `private playtest` 不是 `public share` 的前置批准，只是更小范围的候选结论。
- 没有用户授权时，最终 disposition 不能高于 `hold`。
