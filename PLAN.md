# War3 RE - Current Control Plan

Last updated: 2026-04-26

The project is now run as a Codex-only browser RTS project. The previous dual-lane board, watch workers, automatic queue refill, GLM dispatch, and version-transition automation have been retired.

## Product Goal

Build a legal browser-based War3-like RTS alpha that is actually playable: readable opening base, reliable RTS commands, working economy/build/train/combat loop, Human content depth, AI pressure, and a complete short-match experience.

This is not a Warcraft III clone, not a public release, and not complete Human parity yet.

## Current Priority

Fix the playable core before adding more surface area:

1. Worker mining/lumber reliability, collision, resource amount, and map scale.
2. Human core content and numeric model.
3. Battlefield readability and asset replacement.
4. 10-15 minute AI match arc.
5. Product shell: menu, briefing, results, rematch, settings, help.

## Operating Model

- One active Codex-owned task at a time.
- No GLM dispatch.
- No board/watch background workers.
- No long live queue documents.
- Runtime behavior changes require build/typecheck plus focused runtime tests.
- Docs are added only for product direction, system contracts, or real acceptance records.

## Read First

- `docs/PROJECT_COMMAND_CENTER.zh-CN.md`
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/KNOWN_ISSUES.zh-CN.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
