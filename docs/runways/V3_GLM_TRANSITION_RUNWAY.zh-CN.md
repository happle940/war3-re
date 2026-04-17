# V3 GLM Transition Runway

> 用途：这是 `V3.1 battlefield + product-shell clarity` 的 GLM 首批接棒跑道。  
> 每条任务都要保持 bounded scope、focused proof、Codex review。

## Task 94 — V3 Human Opening Grammar Proof Pack

Goal:

把 TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的开局空间关系变成客观可复跑的 proof pack。

Write scope:

- src/game/Game.ts
- tests/v3-opening-grammar-regression.spec.ts
- tests/v3-base-layout-anchor-contract.spec.ts

Must prove:

1. TH / 矿 / 树线 / 出口关系不再像随手摆件
2. 生产区和防御区能形成可解释布局
3. proof 只回答 V3 opening grammar，不扩写成短局或最终地图设计

## Task 95 — V3 Default Camera Readability Pack

Goal:

证明默认镜头下 worker、footman、核心建筑和资源点是一眼可读的，而不是只是“存在”。

Write scope:

- src/game/Game.ts
- tests/v3-default-camera-readability.spec.ts
- tests/v3-role-readability-screenshot-contract.spec.ts

Must prove:

1. worker / footman / Town Hall / Barracks / Farm / Tower / Goldmine 都可读
2. 读图不是靠缩放到不真实的镜头作弊实现
3. proof 不等于最终美术完成或 user verdict

## Task 96 — V3 Camera HUD Footprint Harmony Pack

Goal:

把默认镜头、HUD 遮挡、selection ring、footprint 与 choke/gap 感知之间的关系收成一个 focused pack。

Write scope:

- src/main.ts
- src/game/Game.ts
- tests/v3-camera-hud-footprint-harmony.spec.ts

Must prove:

1. 默认镜头 framing 服务开局读图
2. HUD 不遮挡核心对象
3. selection / footprint / gap 感知不会互相打架

## Task 97 — V3 Return/Re-entry Product-Shell Pack

Goal:

把 V2 residual 的 return-to-menu / re-entry 推进成 V3 product-shell clarity 的真实路径。

Write scope:

- src/main.ts
- src/game/Game.ts
- tests/session-return-to-menu-contract.spec.ts
- tests/front-door-reentry-start-loop.spec.ts
- tests/v3-briefing-return-consistency.spec.ts

Must prove:

1. 从 results 或 pause 返回 menu 后 source truth 仍成立
2. 再次开始不会带 stale shell / stale gameplay state
3. 这条路径是产品路径，不是假按钮
