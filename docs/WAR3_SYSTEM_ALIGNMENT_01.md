# War3 System Alignment 01

Purpose: convert the M1 playtest feedback into reusable Warcraft-like system contracts instead of one-off bug fixes.

M1 result:

- User verdict: `pass with visual debt`.
- Meaning: the prototype can be played for 5-10 minutes, controls are broadly obedient, AI applies pressure, and the base is basically playable.
- Constraint: do not jump straight to visual polish. The user's follow-up issues show that several Warcraft-like core systems are still missing.

## Core Diagnosis

The remaining gap is not a single bug. The project still lacks a complete RTS rules layer.

Current implementation has working verbs:

- select
- move
- gather
- build
- train
- attack

Warcraft III-like play requires those verbs to live inside reusable systems:

- order lifecycle
- ability command cards
- construction lifecycle
- combat weapons and target filters
- unit collision and local avoidance
- prerequisite and disabled-reason UI
- cancellation/refund rules

Until these exist, new features will keep looking like isolated patches.

## User Feedback Mapped To Systems

| User issue | Higher-level missing system | Required direction |
|---|---|---|
| Barracks construction stops halfway and cannot resume | Construction lifecycle | Under-construction buildings must support builder assignment, interruption, resume, completion, and cleanup. |
| Arrow tower has no attack power | Combat weapon system | Static defenses need weapon stats, range acquisition, target filtering, attack cadence, and visible damage feedback. |
| Units have no collision volume | Unit physical presence | Units need selection footprint, movement separation, blocker respect, and anti-stacking behavior. |
| Supply is capped but population buildings cannot be clicked clearly | Ability/prerequisite UI | Command buttons need enabled/disabled state, cost/supply requirement checks, and readable failure reasons. |
| No construction cancel | Order and construction cancellation | Under-construction buildings need cancel command, resource refund rule, builder release, footprint release, and UI state update. |
| Need to align with Warcraft III, not just fix bugs | System benchmark layer | Every future feature should state the Warcraft-like rule it approximates and how it is tested. |

## M2 Scope: War3 Core Systems Alignment

M2 is not primarily a visual milestone. It is the system-alignment milestone that makes the prototype obey Warcraft-like RTS rules.

M2 goal:

> The same player action should produce the kind of consequence a Warcraft III player expects, even if the art is still proxy.

M2 entry starts from M1 pass-with-visual-debt and focuses on objective system behavior.

### M2.1 Construction Lifecycle

Required contracts:

- A building under construction has a clear `builder` relationship when actively being built.
- If the builder is interrupted, stopped, killed, or retasked, construction does not become unrecoverable.
- A valid worker can resume construction by right-clicking or issuing an explicit build/repair-style order.
- Under-construction building cancel removes the entity, releases footprint, releases builder state, and refunds a defined amount.
- Completion transitions the building into normal command-card state.

Default refund rule for now:

- Use simple 75% refund of remaining invested cost unless a better Warcraft-specific rule is later adopted.
- The exact percentage is less important than having a deterministic rule and tests.

### M2.2 Static Defense Combat

Required contracts:

- Arrow tower has weapon stats: damage, range, cooldown, target filters.
- Tower auto-acquires enemies in range.
- Tower attacks without needing player micro.
- Damage is visible through health reduction and existing feedback.
- Dead targets are cleaned and tower reacquires or idles.

### M2.3 Unit Collision And Local Avoidance

Required contracts:

- Units cannot visually occupy the exact same point indefinitely.
- Moving groups maintain basic separation.
- Workers and footmen have small but meaningful collision radius.
- Buildings remain hard blockers.
- Collision must not break existing pathing tests.

This can begin as local separation, not a full physics engine.

### M2.4 Ability And Prerequisite UI

Required contracts:

- Command buttons can be enabled, disabled, or hidden by explicit rules.
- Disabled buttons show a reason in the HUD or tooltip text.
- Supply-blocked training communicates the reason instead of silently doing nothing.
- Insufficient resource state communicates the reason.
- Build commands and train commands use one shared command-card state model.

### M2.5 Cancellation And Refund Rules

Required contracts:

- Under-construction buildings expose a cancel command.
- Cancel releases occupancy.
- Cancel updates resources.
- Cancel releases builder state.
- Cancel clears selection if the canceled building was selected.
- Cancel cannot duplicate resources.

### M2.6 Combat-Control Contract

Required contracts:

- A unit currently attacking must obey a normal right-click ground move.
- A manual move must clear or ignore the current attack target and suppress immediate auto-aggro briefly.
- Attack-move must not use the same suppression rule; it should still engage enemies along the path.
- Stop must be visibly honored and must clear queued movement and stale previous-order state.
- Hold position must use local acquisition and must not chase outside hold range.
- Explicit player commands must break stale `previousState` restoration chains.

## Recommended Execution Order

1. Construction Lifecycle Contract Pack.
2. Static Defense Combat Pack.
3. Command Card Disabled Reasons Pack.
4. Unit Collision / Local Avoidance Pack.
5. Combat Control Contract Pack.
6. M2 user gate after objective tests are green.

Reasoning:

- Construction/cancel fixes two direct user issues and forces order lifecycle discipline.
- Tower combat turns existing buildings into real gameplay objects.
- Disabled reasons remove silent failure, especially around supply.
- Collision is important but riskier and should happen after command/construction semantics are stable.
- Combat-control gets an explicit final pack because Warcraft-like control requires the player to pull a fighting unit away without auto-aggro immediately stealing the order back.

## Division Of Labor

Codex owns:

- M2 system architecture and acceptance criteria.
- Review of GLM implementation.
- Any broad refactor decision affecting `Game.ts`, order state, or command-card architecture.
- Final judgment on whether M2 is ready for user gate.

GLM owns:

- One bounded system pack at a time.
- Runtime tests with deterministic assertions.
- Minimal implementation inside allowed files.
- Documentation/checklist sync.

## Non-Goals For M2

- Heroes.
- Upgrades.
- Second race.
- Full Warcraft III data parity.
- Full physics engine.
- Final visual identity.
- Legal asset sourcing.

## Acceptance Standard

M2 can pass only when the prototype stops feeling like isolated commands and starts feeling like a small RTS ruleset:

- player orders can be interrupted, resumed, or canceled according to clear rules
- combat buildings actually participate in combat
- command-card failures explain themselves
- units have physical presence
- fighting units still obey manual player commands
- all accepted behavior has runtime proof
