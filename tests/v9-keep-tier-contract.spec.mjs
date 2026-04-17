/**
 * V9 HN2-IMPL1 Keep Tier Implementation Contract Proof
 *
 * Proves the implementation contract for HN2-IMPL1 — Keep tier seed
 * is correctly scoped: only techTier + upgradeTo + keep definition,
 * no Castle/Knight/Sorceress/Spell Breaker/heroes/items/assets.
 *
 * Uses text parsing to avoid const enum import issues in Node strip-only mode.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTRACT_PATH = path.join(__dirname, '..', 'docs', 'V9_KEEP_TIER_IMPLEMENTATION_CONTRACT.zh-CN.md')
const SCHEMA_PACKET_PATH = path.join(__dirname, '..', 'docs', 'V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md')

const contractText = fs.readFileSync(CONTRACT_PATH, 'utf8')
const schemaPacketText = fs.readFileSync(SCHEMA_PACKET_PATH, 'utf8')

// ==================== proof-1: contract names HN2-IMPL1 ====================

test('proof-1: contract names HN2-IMPL1 as the implementation slice', () => {
  assert.ok(contractText.includes('HN2-IMPL1'),
    'contract must name the slice HN2-IMPL1')
  assert.ok(contractText.includes('Keep tier seed'),
    'contract must describe Keep tier seed')

  // Must have explicit sections for scope and exclusions
  assert.ok(contractText.includes('只做什么') || contractText.includes('只做'),
    'contract must define what to do')
  assert.ok(contractText.includes('不做什么'),
    'contract must define what not to do')
})

// ==================== proof-2: contract specifies allowed files ====================

test('proof-2: contract specifies allowed implementation files', () => {
  // Must specify GameData.ts as the primary data file
  assert.ok(contractText.includes('src/game/GameData.ts'),
    'contract must allow GameData.ts')

  // Must specify a focused proof
  assert.ok(contractText.includes('proof') || contractText.includes('spec'),
    'contract must require a focused proof')
  assert.ok(contractText.includes('tests/v9-tier-prerequisite-schema.spec.mjs'),
    'contract must allow syncing the existing schema proof to the post-keep state')

  // Must mention documentation sync
  assert.ok(contractText.includes('docs/'),
    'contract must allow documentation sync')

  // Must explicitly say Game.ts is not touched by default
  assert.ok(contractText.includes('Game.ts') && contractText.includes('不碰'),
    'contract must explicitly state Game.ts is not touched by default')
})

// ==================== proof-3: contract defines minimal fields ====================

test('proof-3: contract defines minimal fields (techTier, upgradeTo) and reserves others', () => {
  // techTier and upgradeTo are the only fields in scope
  assert.ok(contractText.includes('techTier'),
    'contract must define techTier as in-scope')
  assert.ok(contractText.includes('upgradeTo'),
    'contract must define upgradeTo as in-scope')

  // researchLevel, unitUnlock, buildingUnlock are reserved for later
  assert.ok(contractText.includes('researchLevel'),
    'contract must mention researchLevel')
  assert.ok(contractText.includes('unitUnlock'),
    'contract must mention unitUnlock')
  assert.ok(contractText.includes('buildingUnlock'),
    'contract must mention buildingUnlock')

  // These reserved fields must be marked as NOT in HN2-IMPL1 scope
  const reserveSection = contractText.substring(
    contractText.indexOf('后续字段保留'),
  )
  assert.ok(reserveSection.includes('researchLevel') &&
            reserveSection.includes('unitUnlock') &&
            reserveSection.includes('buildingUnlock') &&
            reserveSection.includes('不在 HN2-IMPL1'),
    'contract must explicitly mark researchLevel, unitUnlock, buildingUnlock as not in HN2-IMPL1 scope')

  // keep must NOT have upgradeTo (Castle is not implemented)
  assert.ok(/keep[^]*?不加.*?upgradeTo/.test(contractText),
    'contract must state keep does not get upgradeTo because Castle is not implemented')
  assert.ok(!contractText.includes("keep.upgradeTo = 'castle'") &&
            !contractText.includes("upgradeTo: 'castle'"),
    'contract must not encode keep -> castle before Castle exists')
})

// ==================== proof-4: contract excludes full expansion ====================

test('proof-4: contract does not require Castle/Knight/Sorceress/Spell Breaker/heroes/items/assets', () => {
  // These must appear in the "不做什么" exclusion section
  const exclusionSection = contractText.substring(
    contractText.indexOf('不做什么'),
    contractText.indexOf('验收标准'),
  )

  const forbidden = [
    'Castle',
    'Knight',
    'Sorceress',
    'Spell Breaker',
  ]
  for (const item of forbidden) {
    assert.ok(exclusionSection.includes(item),
      `contract must explicitly exclude ${item}`)
  }

  // Must also exclude heroes, items, assets, full tech tree
  assert.ok(exclusionSection.includes('英雄') || exclusionSection.includes('heroes'),
    'contract must exclude heroes')
  assert.ok(exclusionSection.includes('物品') || exclusionSection.includes('items'),
    'contract must exclude items')
  assert.ok(exclusionSection.includes('素材') || exclusionSection.includes('assets'),
    'contract must exclude assets')
  assert.ok(exclusionSection.includes('完整科技树') || exclusionSection.includes('full tech tree'),
    'contract must exclude full tech tree')
})

// ==================== proof-5: schema packet still points to HN2-IMPL1 ====================

test('proof-5: Task118 schema packet still points to HN2-IMPL1, not HN3 for Keep', () => {
  // Schema packet must reference HN2-IMPL1
  assert.ok(schemaPacketText.includes('HN2-IMPL1'),
    'schema packet must reference HN2-IMPL1')

  // Schema packet must NOT reassign Keep to HN3
  assert.ok(!schemaPacketText.includes('HN3 — Keep') &&
            !schemaPacketText.includes('HN3: Keep'),
    'schema packet must not reassign Keep to HN3')

  // Schema packet conclusion must reference HN2-IMPL1 (either "next safe step" or "implemented")
  assert.ok(
    schemaPacketText.includes('HN2-IMPL1: Keep tier seed') ||
    schemaPacketText.includes('HN2-IMPL1 Keep tier seed is implemented'),
    'schema packet conclusion must reference HN2-IMPL1 Keep tier seed')
})
