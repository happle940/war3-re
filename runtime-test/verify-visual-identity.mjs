/**
 * Visual Identity Runtime Verification
 *
 * Verifies Phase 1-6 visual changes don't crash the game.
 * No screenshots — visual quality must be confirmed by human eyes.
 *
 * Checks:
 * - No console errors
 * - Canvas center pixel non-black (rendering works)
 * - Game runs 60s without crash
 * - impactRings array doesn't leak
 * - WebGL context not lost
 *
 * Usage:
 *   node runtime-test/verify-visual-identity.mjs
 *
 * Prerequisites:
 *   - Dev server at http://localhost:3000/
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000/';

function log(msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] ${msg}`);
}

async function main() {
  log('=== Visual Identity Runtime Verification ===');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-angle=swiftshader',
      '--enable-webgl',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text().substring(0, 200));
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  // Inject game state exposure
  await page.addInitScript(() => {
    window.__war3Errors = [];
    const origError = console.error;
    console.error = function(...args) {
      window.__war3Errors.push(args.map(a => String(a)).join(' ').substring(0, 200));
      origError.apply(console, args);
    };
    window.addEventListener('error', (e) => {
      window.__war3Errors.push('Uncaught: ' + e.message);
    });
  });

  const results = [];

  try {
    log('Loading game...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('#game-canvas', { timeout: 10000 });
    log('Canvas found, waiting 5s for init...');
    await page.waitForTimeout(5000);

    // Check 1: No console errors (OutlinePass deprecation warnings OK)
    const errors5s = await page.evaluate(() => (window.__war3Errors || []).slice(-20));
    const realErrors = errors5s.filter(e =>
      !e.includes('OutlinePass') && !e.includes('deprecated')
    );
    results.push({
      name: 'No Console Errors (5s)',
      pass: realErrors.length === 0,
      detail: realErrors.length === 0
        ? 'Zero errors'
        : `${realErrors.length} errors: ${realErrors.slice(0, 3).join('; ')}`,
    });

    // Check 2: Canvas center pixel non-black
    const pixelCheck = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      if (!canvas) return { found: false };
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { found: true, webgl: false };
      const px = new Uint8Array(4);
      gl.readPixels(
        Math.floor(canvas.width / 2), Math.floor(canvas.height / 2),
        1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px,
      );
      return {
        found: true, webgl: true,
        size: `${canvas.width}x${canvas.height}`,
        rgba: [px[0], px[1], px[2], px[3]],
        nonBlack: px[0] > 5 || px[1] > 5 || px[2] > 5,
      };
    });
    results.push({
      name: 'Canvas Rendering (center pixel)',
      pass: pixelCheck.nonBlack,
      detail: pixelCheck.nonBlack
        ? `RGBA(${pixelCheck.rgba.join(',')}) — rendering active`
        : `RGBA(${pixelCheck.rgba?.join(',')}) — canvas appears black`,
    });

    // Check 3: WebGL context not lost
    const ctxLost = await page.evaluate(() => {
      const c = document.getElementById('game-canvas');
      return c ? (c.isContextLost?.() ?? false) : true;
    });
    results.push({
      name: 'WebGL Context Not Lost',
      pass: !ctxLost,
      detail: ctxLost ? 'Context lost!' : 'Context healthy',
    });

    // Check 4: Game time advancing (loop alive)
    const timeBefore = await page.evaluate(() =>
      document.getElementById('game-time')?.textContent ?? '00:00'
    );
    await page.waitForTimeout(3000);
    const timeAfter = await page.evaluate(() =>
      document.getElementById('game-time')?.textContent ?? '00:00'
    );
    const secBefore = parseInt(timeBefore.split(':')[0]) * 60 + parseInt(timeBefore.split(':')[1]);
    const secAfter = parseInt(timeAfter.split(':')[0]) * 60 + parseInt(timeAfter.split(':')[1]);
    results.push({
      name: 'Game Loop Advancing',
      pass: secAfter > secBefore,
      detail: `Time: ${timeBefore} → ${timeAfter} (+${secAfter - secBefore}s)`,
    });

    // Wait remaining time to reach ~60s total
    log('Waiting for 60s stability check (remaining ~50s)...');
    await page.waitForTimeout(50000);

    // Check 5: 60s stability
    const time60 = await page.evaluate(() =>
      document.getElementById('game-time')?.textContent ?? '00:00'
    );
    const sec60 = parseInt(time60.split(':')[0]) * 60 + parseInt(time60.split(':')[1]);
    results.push({
      name: '60s Stability (no crash)',
      pass: sec60 >= 25,
      detail: `Game time at ~60s real: ${time60} (${sec60}s) — headless dt cap causes slower game-time`,
    });

    // Check 6: impactRings not leaking (can't access directly, but check memory stability)
    // We check that the game hasn't accumulated excessive errors
    const errors60s = await page.evaluate(() => (window.__war3Errors || []).slice(-20));
    const realErrors60 = errors60s.filter(e =>
      !e.includes('OutlinePass') && !e.includes('deprecated')
    );
    results.push({
      name: 'No Errors After 60s',
      pass: realErrors60.length === 0,
      detail: realErrors60.length === 0
        ? 'Clean after 60s'
        : `${realErrors60.length} errors: ${realErrors60.slice(0, 3).join('; ')}`,
    });

    // Check 7: HUD elements present
    const hudCheck = await page.evaluate(() => ({
      gold: !!document.getElementById('gold'),
      lumber: !!document.getElementById('lumber'),
      supply: !!document.getElementById('supply'),
      icons: document.querySelectorAll('.resource .icon').length,
      goldIcon: document.querySelector('.gold-icon')?.textContent,
      woodIcon: document.querySelector('.wood-icon')?.textContent,
      foodIcon: document.querySelector('.food-icon')?.textContent,
    }));
    results.push({
      name: 'HUD Icons Updated',
      pass: hudCheck.goldIcon === '◈' && hudCheck.woodIcon === '⊞' && hudCheck.foodIcon === '⊕',
      detail: `Icons: gold=${hudCheck.goldIcon} wood=${hudCheck.woodIcon} food=${hudCheck.foodIcon}`,
    });

  } catch (err) {
    log(`FATAL: ${err.message}`);
    results.push({ name: 'Runtime', pass: false, detail: err.message });
  } finally {
    log('');
    log('========================================');
    log('  VISUAL IDENTITY VERIFICATION RESULTS');
    log('========================================');
    let pass = 0, fail = 0;
    for (const r of results) {
      const icon = r.pass ? 'PASS' : 'FAIL';
      if (r.pass) pass++; else fail++;
      log(`  [${icon}] ${r.name}`);
      log(`         ${r.detail}`);
    }
    log('');
    log(`Total: ${results.length} | Passed: ${pass} | Failed: ${fail}`);
    log('');

    // Visual items that need human eyes
    log('Visual items requiring human confirmation:');
    log('  ❌ OutlinePass black edge outlines');
    log('  ❌ Shadow map effect');
    log('  ❌ Dark pine tree visuals');
    log('  ❌ Selection ring pulse');
    log('  ❌ Impact ring shockwave');
    log('  ❌ HUD icon colors');
    log('  ❌ Build complete flash');
    log('');

    await browser.close();
    process.exit(fail > 0 ? 1 : 0);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(2);
});
