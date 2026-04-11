# War3 Benchmark Research 01

> Date: 2026-04-11
> Purpose: establish a concrete Warcraft III benchmark so future implementation work stops guessing and starts comparing against a stable reference.
> Scope: first-30-seconds gameplay truth, Human opening grammar, command semantics, and scale / readability.

---

## 1. Executive Summary

The core problem is not that the project lacks features.
The core problem is that it still lacks a stable Warcraft III reference layer.

Right now the codebase can already:
- select units
- issue commands
- gather resources
- build structures
- train units
- run a basic AI loop
- load legal replacement assets

But the user-facing experience is still inconsistent because the project keeps solving local problems without a fixed benchmark for:
- what Warcraft III selection/command truth actually feels like
- how Human base layout is spatially organized
- how building pathing grammar works
- how readable workers / military units / structures must be at normal RTS zoom

This research concludes that the next work should not be “more arbitrary tuning.”
It should be:

1. agency truth closeout
2. builder trust closeout
3. Human base-space grammar closeout
4. readable scale closeout

---

## 2. Sources Used

### Primary / high-signal references

1. Official Human unit stats
- [Warcraft III Human Unit Stats](https://classic.battle.net/war3/human/unitstats.shtml)

2. Official building basics
- [Warcraft III Building Basics](https://classic.battle.net/war3/basics/buildings.shtml)

3. Official beginner control framing
- [Blizzard News: Warcraft III beginner RTS controls](https://news.blizzard.com/en-gb/article/23229495/samuser-rapidement-les-jeux-de-strategie-en-temps-reel-pour-les-debutants)

4. WC3 Gym Human base building guide
- [WC3 Gym Human Base Building Guide](https://warcraft-gym.com/human-base-building-guide/)

### Why these matter

- Blizzard sources are the best reference for command semantics and strategic intent.
- WC3 Gym is the best practical reference here for actual Human walling, pathing buffers, and opening base grammar.

---

## 3. Warcraft III Benchmark: What Must Be True

### 3.1 Selection and command truth

Warcraft III’s baseline mouse language is simple and consistent:
- left click selects
- left drag box-selects
- right click issues the smart command

Blizzard’s own beginner guidance says you select with left click, issue movement orders with right click, and select multiple units by dragging a rectangle over them.
That means box selection is not a “secondary” interaction that waits for an extra confirmation click.
It commits on release.

#### Implication for this project

If a drag-select action visually completes but the user still feels they need another click, the system is failing the Warcraft III benchmark even if some internal selection state technically changed.

#### Benchmark rule

- mouseup after a valid left-drag box must already produce the final selection
- no extra click required
- right click remains command-only, not selection-confirm

---

### 3.2 Builder trust and command ownership

Official building basics describe construction as:
1. select a worker
2. choose the building
3. left click the location

That interaction implies a basic command-trust rule:

> if the player selected a specific worker to build, that worker is the builder.

Warcraft III players rely heavily on unit-specific intent.
The game should not silently reinterpret “this worker builds” into “some other idle worker somewhere builds” unless the player explicitly delegated that behavior.

#### Implication for this project

The current behavior where the selected worker enters build mode but another worker actually builds is not a minor quality issue.
It breaks the player’s trust in the command model.

#### Benchmark rule

- selected worker should build
- if multiple selected workers exist, the chosen/primary worker should be preferred
- fallback to some unrelated worker only when no valid selected builder exists

---

### 3.3 Human base grammar is not random decoration

Blizzard’s building basics explicitly states:
- Humans should place Town Halls as close to the Gold Mine as possible, otherwise more peasants are needed for the same gold income.

WC3 Gym then adds the practical high-level grammar:
- Human bases are laid out to generate value through space
- production buildings and Altar are often used to wall
- Farms are small, tight wall pieces
- Town Hall / Altar / Barracks have pathing buffers
- rally side and open side matter
- tower placement often protects gold peasants first

This means the Human opening base is not “a few buildings near each other.”
It is a deliberate pathing and defense grammar.

#### Benchmark rule

A default Human starting base should read as:
- Town Hall anchor
- gold mine placed for short worker trip distance
- open area for movement / rally
- production building positioned meaningfully, not randomly
- farms used as small edge pieces, not treated like generic medium buildings
- towers near peasant protection if present

---

### 3.4 Pathing buffer truth matters more than visual size alone

WC3 Gym’s guide gives the clearest practical explanation:
- Barracks: 6x6 building with a 1-unit pathing buffer around it
- Farm: 2x2 building with no pathing buffer
- Altar, Town Hall, and Barracks have pathing buffers
- when two buffered buildings touch, their buffers combine and create wider gaps
- small units such as workers and footmen can pass through 1-gap openings
- 2-gap openings admit even large units / heroes

This is extremely important because it means Warcraft III base feel is not only about visible mesh scale.
It is about the relationship between:
- footprint
- gap size
- unit collision class
- rally/spawn paths
- walling intention

#### Benchmark rule

Farms should behave like tight blockers.
Barracks / Town Hall should feel roomier and more buffered.
If every building is normalized to similar board-space and similar gaps, the base feels wrong even if the meshes look prettier.

---

### 3.5 Readability beats realism

From the official unit stats and decades of actual play, Human unit readability is built on role separation, not realism.

Official stats indicate:
- Peasant: cheap worker, 1 food, 220 HP, melee, slower and weaker
- Footman: core military unit, 2 food, 420 HP, armored, faster, much more combat weight

At normal RTS zoom, players must be able to tell at a glance:
- worker
- footman
- main base
- production building
- food building
- resource node

The benchmark is not “true-to-life size.”
The benchmark is:

> can I read the role instantly from a standard gameplay camera?

#### Benchmark rule

- worker must be visible immediately
- footman must read heavier and more martial than worker
- Town Hall must anchor the base visually
- Barracks must feel like a production building, not a prop
- Gold mine must be an obvious resource landmark

---

## 4. Current Project vs Benchmark

### 4.1 Selection / command benchmark

#### Current code truth
In `setupInput()`:
- left mouse starts drag logic
- left mouseup resolves click or box-select
- right click issues commands

Relevant files:
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`

#### Current user-reported truth
User reports drag selection feels like it needs another click.
Whether the root cause is timing, HUD update, selection-ring update, or a click/drag threshold issue, the player experience is currently below Warcraft III baseline.

#### Gap
- intended semantics resemble WC3
- perceived semantics do not yet feel WC3-clean

This is a runtime feel bug, not a documentation problem.

---

### 4.2 Builder trust benchmark

#### Current code truth
`placeBuilding()` currently spawns the structure and then calls:
- `findNearestIdlePeasant(pos)`

That means the system is still built around “nearest idle worker in the base” rather than “the worker the player chose.”

Relevant anchors:
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:1340`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:1366`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:2831`

#### Gap
This is directly opposite to Warcraft III’s command-trust expectation.

This is one of the highest-value fixes in the project, because it repairs the player’s belief that selected units actually obey selected-unit intent.

---

### 4.3 Base-space grammar benchmark

#### Current code truth
Default Human base spawn is approximately:
- Town Hall at `(10, 12)`
- Gold Mine at `(14, 9)`
- Barracks at `(6, 16)`
- 5 workers in a simple line near the base

Relevant anchors:
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:2683`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:2687`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:2690`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts:2694`

#### Current data truth
Building sizes are currently simplified to:
- Town Hall `size: 3`
- Barracks `size: 2`
- Farm `size: 2`
- Tower `size: 1`
- Gold Mine `size: 3`

Relevant file:
- `/Users/zhaocong/Documents/war3-re/src/game/GameData.ts`

#### Gap
This flattening loses Warcraft III’s most important spatial distinction:
- Farms are small/tight blockers
- Barracks/Town Hall are larger and path-buffered
- Gold Mine is a dominant resource landmark

Right now the world grammar is too normalized.
It reads more like “objects on a board” than “Human main base simcity.”

---

### 4.4 Scale benchmark

#### Current code truth
Real assets are now loading for:
- worker
- townhall

But user playtest still says workers feel effectively invisible or silly in the live scene.

Relevant file:
- `/Users/zhaocong/Documents/war3-re/src/game/AssetCatalog.ts`

#### Gap
Even if asset integration is technically correct, the benchmark is not met until the worker is readable at the default gameplay camera.

That means this is not just a material/loader problem.
It is a scale + camera + base-space relationship problem.

---

## 5. Prioritized Gap List

### Tier 1 — Must fix immediately

1. Builder agency
- selected worker must build

2. Box-select commit feel
- drag release must feel immediately final

3. Worker readability
- visible at default camera without hunting for it

These three together determine whether the first 30 seconds feel intelligent or stupid.

### Tier 2 — Must fix soon

4. Human base-space grammar
- Town Hall / gold mine / Barracks / Farms need a more WC3-like relationship

5. Footprint and pathing grammar
- buildings should not all behave like generic blobs
- Farms especially should be tighter than Barracks / Town Hall

### Tier 3 — After the above

6. Military readability
- footman / barracks / tower / goldmine replacement and proportion alignment

7. Larger visual identity pass
- only after runtime/control truth is closed

---

## 6. Recommendations For The Next 1–2 Rounds

### Recommendation A
Close builder trust first.

Why:
- it is a direct command-trust violation
- it is easy for a player to notice
- it undermines every other improvement

### Recommendation B
Close box-select feel second.

Why:
- selection is the root verb in Warcraft III
- even tiny friction here makes the game feel “webby” and fake

### Recommendation C
Do a bounded Human base grammar correction pass.

Not a giant visual pass.
A grammar pass.

That pass should:
- reposition starting Town Hall / gold mine / Barracks / worker line
- revise building footprint semantics where obviously too flat
- preserve runtime pathing sanity

### Recommendation D
Treat asset scale as part of space grammar, not isolated cosmetics.

Do not tune worker, townhall, footman, and barracks independently forever.
Tune them as a relationship.

---

## 7. Concrete Implications For `war3-re`

### 7.1 Interaction rules to enforce
- left drag selects and commits on mouseup
- right click is command-only
- no extra click required after a valid box-select
- selected builder is the builder

### 7.2 Data rules to revisit
Current simplified `size` data likely under-represents Warcraft III’s differences.
At minimum review:
- `townhall`
- `barracks`
- `farm`
- `goldmine`

Not necessarily to replicate editor numbers exactly, but to recover the correct relationships:
- Farm << Barracks < Town Hall / Gold Mine as spatial anchors
- buffered buildings vs tight blockers

### 7.3 Base layout rules to enforce
- Town Hall as close to gold mine as practical
- worker route short and obvious
- rally/open side preserved
- Barracks placed intentionally, not as random decoration
- if towers exist early, they should protect peasants or key approach lanes

---

## 8. Final Judgment

The project should stop treating Warcraft III as a loose aesthetic inspiration.
It now needs to treat Warcraft III as a benchmarked system.

That means future implementation should answer:
- what is Warcraft III actually doing here?
- what are we doing instead?
- is the difference intentional or accidental?

Right now too many differences are accidental.
That is why the project can feel silly even when individual features appear “done.”

The correct next mindset is:

> benchmark first, then implement.

Not:

> implement first, then guess whether it feels right.

---

## 9. Reference Links

1. [Warcraft III Human Unit Stats](https://classic.battle.net/war3/human/unitstats.shtml)
2. [Warcraft III Building Basics](https://classic.battle.net/war3/basics/buildings.shtml)
3. [Blizzard Beginner Controls Article](https://news.blizzard.com/en-gb/article/23229495/samuser-rapidement-les-jeux-de-strategie-en-temps-reel-pour-les-debutants)
4. [WC3 Gym Human Base Building Guide](https://warcraft-gym.com/human-base-building-guide/)
