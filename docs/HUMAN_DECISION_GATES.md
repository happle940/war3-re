# Human Decision Gates

Purpose: the user should intervene at project-level milestones, not during every implementation detail or tactical test gate. Codex and GLM must complete most objective work before each milestone, then present a compact decision packet for human judgment.

## Core Rule

Do not ask the user to confirm things that tools can prove.

Ask the user only when the decision requires human perception, product taste, scope tradeoff, legal/account action, or release judgment.

Tactical checks such as worker visibility, pathing assertions, resource correctness, CI status, or command semantics are not user milestones by themselves. They are entry criteria inside larger milestones.

Before every user milestone, Codex must prepare:

- Live URL or exact local run instruction.
- What changed since the last milestone.
- Automated verification summary.
- Known remaining risks.
- A 10-20 minute test script or decision checklist.
- Clear choices if a product decision is needed.

## Project Milestone Summary

| Milestone | Status | User needed? | Entry criteria | User decision |
|---|---|---:|---|---|
| M0 — Project Operating Foundation | done | no | repo, deploy, CI runtime gate, Codex queue, GLM queue | none |
| M1 — First Playable RTS Slice | next | yes | readable base, command ownership, gather/build/train/combat, first AI pressure all runtime-proven | Is this playable enough to continue expanding instead of repairing basics? |
| M2 — Warcraft-Like Feel Vertical Slice | planned | yes | M1 passed; scale, camera, terrain grammar, visual direction prepared | Does it feel close enough to the intended Warcraft-like direction? |
| M3 — Human vs AI Alpha Match | planned | yes | one complete 10-15 minute match loop with win/loss and AI recovery | Is the core game loop worth balancing/content expansion? |
| M4 — Content And Identity Direction | planned | yes | technical gameplay alpha stable; legal art/style options prepared | Which content/art direction should become the product identity? |
| M5 — Public Demo Candidate | planned | yes | stable live build, release checklist green, known issues documented | Is this ready to share for external feedback? |
| M6 — Architecture Hardening Release | planned | no by default | major behavior contracts covered; refactor plan ready | proceed unless scope/product direction changes |

## M0 — Project Operating Foundation

Status: `done`.

What it means:

The project has a working engineering operating system. This is not a gameplay milestone.

Completed evidence:

- GitHub repository and Pages deployment exist.
- GitHub Actions runs build, app typecheck, runtime tests, build, and deploy.
- `docs/CODEX_ACTIVE_QUEUE.md` exists.
- `docs/GLM_READY_TASK_QUEUE.md` exists.
- Runtime test lock exists via `scripts/run-runtime-tests.sh`.
- Local cleanup discipline exists via `scripts/cleanup-local-runtime.sh`.

User intervention: none.

## M1 — First Playable RTS Slice

Status: `next`.

Why this milestone exists:

The project should first become a small RTS that can be played without feeling broken. This is larger than “can I see the worker” or “does one command test pass”. It is the first moment where the user should sit down and play the live build as a game.

M1 user question:

> Can I play the first 5-10 minutes without fighting the controls, losing units visually, or seeing obviously broken economy/combat behavior?

Before asking the user, Codex and GLM must complete these objective bundles:

### M1.1 Readability baseline

- Worker body remains visible after initial load and asset refresh.
- Worker vs footman can be distinguished at default camera distance by silhouette/size/color.
- Town Hall, goldmine, barracks, and tower are identifiable as gameplay objects.
- Health bars/select rings align with actual bodies.

Likely tasks:

- Codex C03 — Worker Visibility Truth.
- GLM Task 02 — Unit Visibility Contract Pack.
- GLM Task 07 — Asset Pipeline Contract Pack if refresh remains suspicious.

### M1.2 Command ownership baseline

- Box select commits on mouseup.
- Right click / move / stop / attackMove do not get stolen by automation.
- Selected worker owns build command.
- Shift queue semantics are not obviously broken.

Likely tasks:

- Existing command regression pack.
- GLM Task 04 — Selection/Input Contract Pack.
- Codex review of test quality.

### M1.3 Economy and production baseline

- Workers gather and return resources.
- Build/train costs are paid once.
- Supply cap blocks correctly.
- Multi-building training cannot overspend.
- AI does not break supply/resource rules.

Likely tasks:

- GLM Task 01 — Resource/Supply Regression Pack and follow-up.
- Codex C02 — Review GLM Resource/Supply Pack.

### M1.4 First pressure baseline

- AI gathers, builds, trains, and sends first attack pressure.
- Player can respond with selection, movement, production, and combat.
- No obvious blocker prevents a 5-10 minute session.

Likely tasks:

- GLM Task 06 — AI First Five Minutes Deepening.
- Pathing/footprint regression if units/buildings overlap blockers.

Automated entry criteria:

- `npm run build` passes.
- `npx tsc --noEmit -p tsconfig.app.json` passes.
- `npm run test:runtime` passes.
- Resource/supply regression accepted by Codex.
- Command regression accepted by Codex.
- Unit visibility contract accepted by Codex.
- No local runtime/browser leftovers.

M1 user decision packet:

1. Play the live build for 5-10 minutes.
2. Can you see and command workers without hunting for health bars?
3. Can you gather, build, train, and fight without obvious command betrayal?
4. Does the AI create enough pressure to make the loop testable?
5. Choose one: `pass`, `pass with visual debt`, `fail controls`, `fail visibility`, `fail economy`, `fail AI`, `fail scale/layout`.

Allowed M1 outcomes:

- `pass`: move to M2.
- `pass with visual debt`: move to M2 and track debt.
- `fail`: convert failure into Codex/GLM tasks and repeat only the failed slice, not the whole milestone.

### M1 decision packet draft

This packet is what Codex should present when M1 entry criteria are green. Do not ask the user to run it until current GLM work is accepted, CI is green for the target commit, and local runtime leftovers are cleaned.

Live URL:

- https://happle940.github.io/war3-re/

Local fallback:

```bash
npm install
npm run dev
```

Basic controls to test:

- Left click selects one unit or building.
- Left drag box-selects units.
- Shift + left click or Shift + box-select appends to the current selection.
- Right click ground moves selected units.
- Right click goldmine sends workers to gather gold.
- Right click trees sends workers to gather lumber.
- Select worker, click a build button, then left click ground to place a building.
- `A` then left click ground performs attack-move.
- `S` stops selected units.
- `H` holds selected units.
- `Ctrl+1..9` saves a control group; `1..9` recalls it.
- `Tab` cycles subgroup selection.
- Select a completed production building, then `Y` sets rally point mode.
- Right click or `Esc` cancels placement, rally, or attack-move mode.

Objective entry criteria before user playtest:

- `npm run build` passes on the final target commit.
- `npx tsc --noEmit -p tsconfig.app.json` passes on the final target commit.
- `npm run test:runtime` passes on the final target commit.
- GitHub Actions deploy workflow is green for the same commit that Pages serves.
- GLM's active placement-controller extraction is either accepted and verified or explicitly deferred with no dirty code.
- No Vite, Playwright, Chromium, or `chrome-headless-shell` process is left running locally.

Automated proof already expected in M1:

- `tests/command-regression.spec.ts`: move, stop, hold, attack-move, queue, and override contracts.
- `tests/resource-supply-regression.spec.ts`: resource spending, supply cap, training, and AI spending contracts.
- `tests/unit-visibility-regression.spec.ts`: worker visibility and post-refresh scale/readability measurements.
- `tests/selection-input-regression.spec.ts`: box select, Shift append, Tab subgroup, and control group selection rings.
- `tests/pathing-footprint-regression.spec.ts`: blocked starts, building footprints, and pathing semantics.
- `tests/ai-economy-regression.spec.ts`: AI opening economy and production behavior.
- `tests/asset-pipeline-regression.spec.ts`: asset refresh, material isolation, and scale preservation.
- `tests/building-agency-regression.spec.ts`: selected worker owns building placement and fallback builder rules.
- `tests/death-cleanup-regression.spec.ts`: dead unit/building references, footprints, builders, and targets are cleaned.

Human playtest script, 10-20 minutes:

1. Open the live URL in a normal browser tab, not while local Playwright/Vite tests are running.
2. At default camera, confirm whether worker bodies are visible without relying on health bars.
3. Select one worker, order gold, order lumber, then interrupt with a move command. Judge whether control feels immediate.
4. Select a specific worker, place one building, and verify that same worker goes to build it.
5. Box-select workers, append with Shift, save a control group, recall it, and cycle with Tab.
6. Train units, attack-move toward the enemy side, then manually pull a fighting unit back with right click.
7. Let the AI run until the first pressure wave or until it obviously stalls.

Only ask the user these M1 questions:

1. Can you see workers and identify core buildings at default camera distance?
2. Do selection, movement, stop, attack-move, and build placement feel obedient?
3. Can you gather, build, train, and fight for 5-10 minutes without a blocking bug?
4. Does the AI create enough pressure to test the loop?
5. Does the base layout feel basically playable, even if not yet beautiful?
6. Choose one outcome: `pass`, `pass with visual debt`, `fail controls`, `fail visibility`, `fail economy`, `fail AI`, `fail scale/layout`.

Failure routing:

- `fail controls`: Codex owns command/input diagnosis; GLM gets one bounded regression/fix task after contract definition.
- `fail visibility`: Codex owns visual/readability fix because human perception is the source of truth.
- `fail economy`: GLM can own resource/supply/AI deterministic fixes with runtime tests.
- `fail AI`: GLM can own AI opening/wave repair if the expected behavior is specific.
- `fail scale/layout`: Codex owns benchmark and acceptance criteria; GLM can implement bounded footprint/layout changes.

## M2 — Warcraft-Like Feel Vertical Slice

Status: `planned`.

Why this milestone exists:

After the game is basically playable, the next question is whether it is moving toward the intended Warcraft-like experience. This is not about one model or one tree. It is the combined feeling of camera, scale, terrain grammar, silhouettes, HUD, and feedback.

M2 user question:

> Does the live build now read as an intentional Warcraft-like RTS battlefield rather than a web prototype with objects on a plane?

Before asking the user, Codex and GLM must complete:

### M2.1 Scale benchmark

- Unit/building size table.
- Camera distance/FOV/AoA table.
- Town Hall to mine spacing.
- Building footprint hierarchy.
- Comparison notes against Warcraft III references.

### M2.2 Terrain/base grammar

- Base zone, mine zone, tree line, exit path, and combat approach are visually distinct.
- Pathing tests prove the layout is usable.
- Terrain does not read as a random flat board.

### M2.3 Visual direction pass

- Proxy silhouettes or legal assets are consistent enough for a vertical slice.
- Selection, health bars, damage feedback, and command indicators are readable.
- HUD does not hide the playfield.

Likely tasks:

- Codex scale/benchmark pass.
- GLM Task 05 — Pathing/Footprint Contract Pack.
- GLM Task 07 — Asset Pipeline Contract Pack.
- New GLM task if needed: Scale Measurement Pack.

M2 user decision packet:

1. Does the battlefield immediately read as an RTS space?
2. Does base/mine/tree/path layout feel intentional?
3. Are unit/building proportions acceptable for the intended direction?
4. Does the camera framing feel RTS-like enough to continue?
5. Choose one: `pass`, `pass but art debt`, `fail scale`, `fail terrain`, `fail camera`, `fail visual identity`.

## M3 — Human vs AI Alpha Match

Status: `planned`.

Why this milestone exists:

A real RTS prototype needs a complete match loop, not just opening mechanics. M3 is the first “can I play a match?” milestone.

M3 user question:

> Can I play one complete human-vs-AI match and understand why I won, lost, or stalled?

Before asking the user, Codex and GLM must complete:

- Win/loss condition.
- AI can recover from partial worker/unit loss.
- AI attack waves do not permanently stall.
- Player can defend, rebuild, and counterattack.
- Basic balance is rough but not absurd.
- Runtime tests cover the main state transitions.

M3 user decision packet:

1. Play one 10-15 minute match.
2. Did the match have a beginning, pressure phase, and resolution?
3. Did any control issue make the match feel unfair?
4. Did AI behavior fail in a way that breaks the match?
5. Choose one: `alpha pass`, `fail control`, `fail AI`, `fail pacing`, `fail win/loss clarity`.

## M4 — Content And Identity Direction

Status: `planned`.

Why this milestone exists:

Only after the game loop is worth playing should the project commit to broader content and visual identity. This avoids wasting effort on assets before the game contracts are stable.

M4 user question:

> What should this become visually and content-wise?

Before asking the user, Codex and GLM must complete:

- Legal asset options documented.
- Proxy-first vs asset-pack-first vs hybrid tradeoff documented.
- One-race vs multi-race scope options documented.
- Map/content expansion options documented.
- Cost and risk for each direction stated.

M4 default recommendation unless overridden:

- Hybrid: readable proxy gameplay silhouettes now, legal asset pipeline preserved for later replacement.

M4 user decision packet:

1. Choose visual direction: `proxy-first`, `asset-pack-first`, or `hybrid`.
2. Choose content scope: `one polished Human slice`, `Human vs Orc`, or `systems-first sandbox`.
3. Choose next product target: `better game feel`, `more content`, or `public demo`.

## M5 — Public Demo Candidate

Status: `planned`.

Why this milestone exists:

This is the first “show other people” checkpoint. It is larger than passing tests; it requires a stable, explainable experience.

M5 user question:

> Is this ready to send to other people for feedback?

Before asking the user, Codex and GLM must complete:

- Live GitHub Pages build is stable.
- CI is green.
- README explains controls and current scope.
- Known issues are documented.
- No local-only dependency or hidden setup is required.
- Smoke checklist is current.

M5 user decision packet:

1. Share publicly now?
2. Share privately to a few testers?
3. Hold until one more milestone?

## M6 — Architecture Hardening Release

Status: `planned`.

Why this milestone exists:

After product direction is validated, reduce long-term engineering risk. This should not block early product discovery unless `Game.ts` complexity starts preventing progress.

M6 user intervention:

Not required by default. Codex decides and reports unless refactor changes scope or visible behavior.

Before M6:

- Command, selection, resources, pathing, AI, asset refresh, and first-match contracts have tests.
- `docs/GAME_TS_RISK_MAP.md` exists.
- Refactor is split into reversible slices.

## Current Next User Intervention

Current next user milestone: `M1 — First Playable RTS Slice`.

Status: `ready for user gate`.

Target code commit: `14bd7ba` (`refactor: extract placement controller slice`).

Objective gate status:

- Local build passed.
- Local app typecheck passed.
- Local affected runtime packs passed: 17/17.
- GitHub Actions for target code commit passed.
- Local Vite, Playwright, Chromium, and `chrome-headless-shell` processes were cleaned.

Do not ask the user to validate tactical items like “worker visibility” alone unless it blocks M1 and cannot be decided by measurement. Codex and GLM should now use the M1 decision packet above when asking for user playtest judgment.
