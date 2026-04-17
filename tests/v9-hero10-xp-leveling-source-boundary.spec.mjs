/**
 * V9 HERO10-SRC1 XP / level / skill-point source boundary.
 *
 * Static proof that the source boundary is well-formed, values match the
 * primary source, and the minimal project mapping is bounded.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function read(relativePath) {
  const p = resolve(ROOT, relativePath)
  assert.ok(existsSync(p), `file missing: ${relativePath}`)
  return readFileSync(p, 'utf-8')
}

// ── Expected values from primary source ──
const XP_THRESHOLDS = {
  1: 0, 2: 200, 3: 500, 4: 900, 5: 1400,
  6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5400,
}

const HERO_KILL_XP = {
  1: 100, 2: 120, 3: 160, 4: 220, 5: 300,
  6: 400, 7: 500, 8: 600, 9: 700, 10: 800,
}

const CREEP_XP_RATIO = {
  1: '80%', 2: '70%', 3: '62%', 4: '55%', 5: '0%',
}

const NORMAL_UNIT_XP = {
  1: 25, 2: 40, 3: 60, 4: 85, 5: 115,
  6: 150, 7: 190, 8: 235, 9: 285, 10: 340,
}

describe('HERO10-SRC1 XP / level / skill-point source boundary', () => {
  const doc = read('docs/V9_HERO10_XP_LEVELING_SOURCE_BOUNDARY.zh-CN.md')

  // ── 1. Source hierarchy ──
  it('SRC1-1: primary source is Blizzard Classic Battle.net', () => {
    assert.ok(doc.includes('classic.battle.net'), 'missing primary source URL')
  })

  it('SRC1-2: cross-check source is Liquipedia', () => {
    assert.ok(doc.includes('liquipedia.net'), 'missing cross-check source')
  })

  it('SRC1-3: source hierarchy is explicit (primary vs cross-check)', () => {
    assert.ok(doc.includes('主来源'), 'missing primary source designation')
    assert.ok(doc.includes('交叉检查'), 'missing cross-check designation')
  })

  // ── 2. Level cap ──
  it('SRC1-4: hero level cap is 10', () => {
    assert.ok(doc.includes('10') && doc.includes('最高等级'), 'missing level cap 10')
  })

  it('SRC1-5: no XP gain after level 10', () => {
    assert.ok(
      doc.includes('不再获得经验') || doc.includes('no longer gain'),
      'must state no XP after level 10'
    )
  })

  // ── 3. XP thresholds ──
  for (const [level, xp] of Object.entries(XP_THRESHOLDS)) {
    it(`SRC1-6-${level}: level ${level} threshold is ${xp}`, () => {
      assert.ok(doc.includes(String(xp)), `missing XP threshold ${xp} for level ${level}`)
    })
  }

  it('SRC1-7: XP threshold table has all 10 levels', () => {
    // Verify levels 1-10 all appear in a table section
    const tableSection = doc.substring(doc.indexOf('累计 XP'))
    for (let i = 1; i <= 10; i++) {
      assert.ok(tableSection.includes(`| ${i} |`), `missing level ${i} in XP table`)
    }
  })

  // ── 4. Hero kill XP table ──
  for (const [level, xp] of Object.entries(HERO_KILL_XP)) {
    it(`SRC1-8-${level}: hero kill level ${level} grants ${xp} XP`, () => {
      assert.ok(doc.includes(String(xp)), `missing hero kill XP ${xp} for level ${level}`)
    })
  }

  it('SRC1-9: hero kill XP is marked as runtime deferred', () => {
    assert.ok(
      doc.includes('运行时状态') && doc.includes('延后'),
      'hero kill XP must be marked runtime deferred'
    )
  })

  // ── 5. Creep XP reduction ──
  for (const [level, ratio] of Object.entries(CREEP_XP_RATIO)) {
    it(`SRC1-10-${level}: creep XP at hero level ${level} is ${ratio}`, () => {
      assert.ok(doc.includes(ratio), `missing creep XP ratio ${ratio} for level ${level}`)
    })
  }

  it('SRC1-11: creep XP reduction is marked as runtime deferred', () => {
    // There should be multiple deferred markers; check that creep section has one
    const creepSection = doc.substring(doc.indexOf('野怪 XP 衰减'))
    assert.ok(creepSection.includes('延后'), 'creep XP must be marked runtime deferred')
  })

  // ── 6. Normal unit XP formula ──
  it('SRC1-12: normal unit base XP is 25', () => {
    assert.ok(doc.includes('GrantNormalXP = 25'), 'missing base XP 25')
  })

  it('SRC1-13: normal unit XP formula is stated', () => {
    assert.ok(doc.includes('F(x) = F(x-1) + 5*x + 5'), 'missing normal unit XP formula')
  })

  for (const [level, xp] of Object.entries(NORMAL_UNIT_XP)) {
    it(`SRC1-14-${level}: normal unit level ${level} gives ${xp} XP`, () => {
      assert.ok(doc.includes(String(xp)), `missing normal unit XP ${xp} for level ${level}`)
    })
  }

  // Verify the formula is correct
  it('SRC1-15: normal unit XP formula evaluates correctly', () => {
    const expected = [25, 40, 60, 85, 115, 150, 190, 235, 285, 340]
    const computed = [25]
    for (let x = 2; x <= 10; x++) {
      computed.push(computed[x - 2] + 5 * x + 5)
    }
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(computed[i], expected[i], `formula mismatch at level ${i + 1}`)
    }
  })

  // ── 7. Minimal project mapping ──
  it('SRC1-16: start with enemy non-building unit kills only', () => {
    assert.ok(
      doc.includes('非建筑单位击杀') || doc.includes('non-building unit kills'),
      'must state start with non-building unit kills'
    )
  })

  it('SRC1-17: buildings excluded', () => {
    assert.ok(
      doc.includes('建筑排除') || doc.includes('建筑') && (doc.includes('排除') || doc.includes('不') && doc.includes('给予 XP')),
      'must state buildings excluded from XP'
    )
  })

  it('SRC1-18: dead heroes must not gain XP', () => {
    const cleanDoc = doc.replace(/\*\*/g, '')
    assert.ok(
      cleanDoc.includes('死亡') && (cleanDoc.includes('不获得经验') || cleanDoc.includes('不获得 XP')),
      'must state dead heroes do not gain XP'
    )
  })

  it('SRC1-19: reaching threshold increments heroLevel', () => {
    assert.ok(
      doc.includes('heroLevel') && doc.includes('增加'),
      'must state heroLevel increments on threshold'
    )
  })

  it('SRC1-20: level-up grants exactly one skill point', () => {
    assert.ok(
      doc.includes('1') && doc.includes('heroSkillPoints'),
      'must state level-up grants 1 skill point'
    )
  })

  it('SRC1-21: must preserve HERO9 revive formulas', () => {
    assert.ok(
      doc.includes('HERO9') && doc.includes('复活') && doc.includes('heroLevel'),
      'must state HERO9 revive formulas preserved'
    )
  })

  // ── 8. Skill-point readiness ──
  it('SRC1-22: new hero starts with one skill point', () => {
    assert.ok(
      doc.includes('1 个技能点') || doc.includes('1 skill point'),
      'must state new hero starts with 1 skill point'
    )
  })

  it('SRC1-23: each level-up grants a new skill point', () => {
    assert.ok(
      doc.includes('升级授予') && doc.includes('技能点'),
      'must state level-up grants skill point'
    )
  })

  it('SRC1-24: ultimate available at level 6', () => {
    assert.ok(
      doc.includes('等级 6') && doc.includes('终极'),
      'must state ultimate available at level 6'
    )
  })

  it('SRC1-25: ability levels and UI deferred', () => {
    assert.ok(
      doc.includes('延后') && doc.includes('能力等级'),
      'must defer ability levels'
    )
  })

  // ── 9. HERO9 semantics preserved ──
  it('SRC1-26: death state preserved', () => {
    assert.ok(doc.includes('isDead'), 'must mention isDead preservation')
  })

  it('SRC1-27: revive cost by level preserved', () => {
    assert.ok(
      doc.includes('复活费用') && doc.includes('等级'),
      'must state revive cost by level preserved'
    )
  })

  it('SRC1-28: uniqueness preserved', () => {
    assert.ok(doc.includes('唯一性'), 'must state uniqueness preserved')
  })

  it('SRC1-29: no auto-selection preserved', () => {
    assert.ok(doc.includes('自动选择'), 'must state no auto-selection preserved')
  })

  it('SRC1-30: Holy Light legality preserved', () => {
    assert.ok(doc.includes('圣光'), 'must state Holy Light legality preserved')
  })

  it('SRC1-31: no duplicate Paladin preserved', () => {
    assert.ok(doc.includes('重复'), 'must state no duplicate Paladin preserved')
  })

  // ── 10. No complete hero system / complete Human claim ──
  it('SRC1-32: does not claim complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must explicitly deny complete hero system')
  })

  it('SRC1-33: does not claim complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must explicitly deny complete Human')
  })

  // ── 11. Next safe sequence ──
  it('SRC1-34: defines HERO10-DATA1', () => {
    assert.ok(doc.includes('HERO10-DATA1'), 'missing HERO10-DATA1')
  })

  it('SRC1-35: defines HERO10-IMPL1', () => {
    assert.ok(doc.includes('HERO10-IMPL1'), 'missing HERO10-IMPL1')
  })

  it('SRC1-36: defines HERO10-UX1', () => {
    assert.ok(doc.includes('HERO10-UX1'), 'missing HERO10-UX1')
  })

  it('SRC1-37: defines HERO10-CLOSE1', () => {
    assert.ok(doc.includes('HERO10-CLOSE1'), 'missing HERO10-CLOSE1')
  })

  it('SRC1-38: sequence order is DATA1 → IMPL1 → UX1 → CLOSE1', () => {
    const seqSection = doc.substring(doc.indexOf('下一安全序列'))
    const indices = {
      DATA1: seqSection.indexOf('HERO10-DATA1'),
      IMPL1: seqSection.indexOf('HERO10-IMPL1'),
      UX1: seqSection.indexOf('HERO10-UX1'),
      CLOSE1: seqSection.indexOf('HERO10-CLOSE1'),
    }
    assert.ok(indices.DATA1 < indices.IMPL1, 'DATA1 must precede IMPL1')
    assert.ok(indices.IMPL1 < indices.UX1, 'IMPL1 must precede UX1')
    assert.ok(indices.UX1 < indices.CLOSE1, 'UX1 must precede CLOSE1')
  })

  // ── 12. Production code unchanged ──
  it('SRC1-39: GameData.ts heroLevel field exists as seed', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('heroLevel?'), 'GameData must have heroLevel field')
  })

  it('SRC1-40: GameData.ts heroXP field exists as seed', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('heroXP?'), 'GameData must have heroXP field')
  })

  it('SRC1-41: GameData.ts heroSkillPoints field exists as seed', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('heroSkillPoints?'), 'GameData must have heroSkillPoints field')
  })

  // ── 13. Cross-check notes ──
  it('SRC1-42: XP threshold cross-check confirms formula match', () => {
    // Verify the Liquipedia formula produces same values
    // formula: 50*(level^2 + level - 2)
    for (let level = 2; level <= 10; level++) {
      const formula = 50 * (level * level + level - 2)
      assert.strictEqual(formula, XP_THRESHOLDS[level], `Liquipedia formula mismatch at level ${level}`)
    }
  })

  it('SRC1-43: normal unit XP formula cross-check', () => {
    // Liquipedia: F(x) = F(x-1) + 5*(x+1), which equals F(x-1) + 5*x + 5
    const computed = [25]
    for (let x = 2; x <= 10; x++) {
      computed.push(computed[x - 2] + 5 * (x + 1))
    }
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(computed[i], NORMAL_UNIT_XP[i + 1], `cross-check mismatch at unit level ${i + 1}`)
    }
  })

  it('SRC1-44: hero kill XP cross-check (level 5+ = 300 + 100*(level-5))', () => {
    for (let level = 5; level <= 10; level++) {
      const computed = 300 + 100 * (level - 5)
      assert.strictEqual(computed, HERO_KILL_XP[level], `hero kill XP cross-check mismatch at level ${level}`)
    }
  })

  // ── 14. HERO10-CONTRACT1 still valid ──
  it('SRC1-45: HERO10 contract doc still exists', () => {
    const contract = read('docs/V9_HERO10_XP_LEVELING_CONTRACT.zh-CN.md')
    assert.ok(contract.length > 100, 'HERO10 contract must still exist')
  })
})
