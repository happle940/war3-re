# V3 Codex Transition Runway

> 用途：这是 `V3.1 battlefield + product-shell clarity` 的 Codex 首批接棒跑道。  
> 它只定义 V3 切换后的第一批结构化任务，不直接改 live queue。

## Runway Intent

Codex 在 V3 的职责不是再补 V2 小洞，而是：

- 固定 V3 的 gate truth
- 写清 battlefield clarity 与 product-shell clarity 的边界
- 把 user gate 与 engineering gate 分开
- 让 GLM 的 proof pack 有明确验收面

## Task Order

| Order | Task | Purpose |
| --- | --- | --- |
| 1 | `C84 — V3 Transition Gate Sync` | 把 V3 gate、ledger、bootstrap packet 对齐 |
| 2 | `C85 — V3 Human Opening Grammar Acceptance Matrix` | 定义人眼如何审 opening grammar |
| 3 | `C86 — V3 Product-Shell Clarity Routing Brief` | 把 return/re-entry、briefing、menu hierarchy 路由清楚 |
| 4 | `C87 — V3 First-Look Approval Packet` | 给未来 V3 user gate 准备统一 review 包 |

### Task C84: V3 Transition Gate Sync

**Files:**
- Modify: `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- Modify: `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- Modify: `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`

**Goal:** 让 V3 gate、ledger 和 bootstrap packet 的 blocker / residual / seed queue 口径完全一致。

**Must define:**

1. 哪些 gate 真是 V3 blocker
2. 哪些 V2 residual 导入到哪个 V3 gate
3. 切到 V3 后的首批 Codex / GLM 任务为什么是这几条

### Task C85: V3 Human Opening Grammar Acceptance Matrix

**Files:**
- Create: `docs/V3_HUMAN_OPENING_GRAMMAR_ACCEPTANCE.zh-CN.md`
- Modify: `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- Modify: `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`

**Goal:** 把“基地像不像一个 War3-like opening”从主观吐槽变成可重复审查的问题矩阵。

**Must define:**

1. TH / 矿 / 树线 / 出口 / 生产区 / 防御区分别看什么
2. 哪些失败属于 V3 engineering blocker
3. 哪些只属于 user-open verdict

### Task C86: V3 Product-Shell Clarity Routing Brief

**Files:**
- Create: `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- Modify: `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- Modify: `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`

**Goal:** 把 V3 product-shell clarity 的边界写清楚，避免 GLM 被模糊 shell 任务拖进大改。

**Must define:**

1. 哪些属于 front-door hierarchy/source truth
2. 哪些属于 return-to-menu / re-entry
3. 哪些属于 briefing/loading explanation
4. 哪些属于 menu quality / user gate

### Task C87: V3 First-Look Approval Packet

**Files:**
- Create: `docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md`
- Modify: `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- Modify: `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`

**Goal:** 给 V3 的人眼 gate 准备统一 review 包，不再靠聊天碎片裁决。

**Must include:**

1. battlefield first-look 该看什么
2. product-shell clarity 该看什么
3. 允许的 verdict 和后续路由
