import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import * as THREE from 'three';
import fs from 'node:fs';
import { dismissRoomGuide } from './room-browser-guide.mjs';
import assert from 'node:assert/strict';
const out = 'outputs/room-refinements';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader'],
});
const results = [],
  errors = [];
try {
  for (const size of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'portrait', width: 390, height: 844 },
    { name: 'landscape', width: 844, height: 390 },
  ].filter(
    (s) => !process.env.REFINE_SIZE || s.name === process.env.REFINE_SIZE,
  )) {
    const touch = size.name !== 'desktop';
    const ctx = await browser.newContext({
      viewport: size,
      colorScheme: 'dark',
      reducedMotion: touch ? 'reduce' : 'no-preference',
      hasTouch: touch,
      isMobile: touch,
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    if (!touch)
      await page.addInitScript(() => {
        window.typeEvents = [];
        let done = false;
        new MutationObserver(() => {
          const el = document.querySelector('.intro-type');
          if (!el) return;
          const next = el.classList.contains('is-done');
          if (next !== done) {
            window.typeEvents.push({ done: next, time: performance.now() });
            done = next;
          }
        }).observe(document, {
          subtree: true,
          attributes: true,
          attributeFilter: ['class'],
        });
      });
    await page.goto('http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(8500);
    assert.equal(new URL(page.url()).pathname, '/');
    assert.equal(
      await page.locator('html').evaluate((e) => e.classList.contains('dark')),
      false,
      'fresh visit defaults to light even with dark OS',
    );
    assert.equal(
      new URL(await page.locator('link[rel=canonical]').getAttribute('href'))
        .href,
      'https://crazyczy.com/',
    );
    const title = page.locator('.intro-type');

    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    const canvas = page.locator('.room-canvas canvas');
    if (!touch) {
      await page.waitForTimeout(160);
      const a = JSON.parse(await canvas.getAttribute('data-transition'));
      await page.waitForTimeout(300);
      const b = JSON.parse(await canvas.getAttribute('data-transition'));
      assert.ok(a.intro && a.progress > 0 && a.progress < 1);
      assert.ok(b.progress > a.progress && b.progress < 1);
      assert.ok(a.y > b.y && b.y > 2.7);
      results.push('Entry camera progresses smoothly over multiple frames');
    }
    await dismissRoomGuide(page);
    await page.evaluate(() => document.exitPointerLock());
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    assert.equal(
      await title.evaluate((e) => getComputedStyle(e).visibility),
      'visible',
    );
    assert.equal(await title.evaluate((e) => getComputedStyle(e).opacity), '1');
    await page.screenshot({ path: `${out}/${size.name}-room.png` });
    await page
      .getByRole('button', { name: 'Open computer', exact: true })
      .click();
    await page.getByRole('dialog').waitFor();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${size.name}-laptop.png` });
    const box = await page.getByRole('dialog').boundingBox();
    assert.ok(
      box.width < size.width && box.height < size.height,
      'computer fits',
    );
    assert.equal(await title.isVisible(), false, 'welcome hides for reading');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.waitForTimeout(1000);
    await page
      .getByRole('button', { name: 'Tactics board', exact: true })
      .click();
    await page.waitForTimeout(1200);
    const ball = async () => JSON.parse(await canvas.getAttribute('data-ball'));
    const first = await ball();
    await page.waitForTimeout(250);
    const second = await ball();
    assert.ok(
      Math.hypot(first.x - second.x, first.z - second.z) > 0.03,
      'ball rolls',
    );
    const pose = JSON.parse(await canvas.getAttribute('data-pose'));
    const camera = new THREE.PerspectiveCamera(
      pose.fov,
      size.width / size.height,
      0.05,
      150,
    );
    camera.position.set(pose.x, pose.y, pose.z);
    camera.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');
    camera.updateMatrixWorld();
    const project = (b) => {
      const p = new THREE.Vector3(
        2.43 + b.x * 0.52,
        1.3195 + b.y * 0.52,
        0.5 + b.z * 0.52,
      ).project(camera);
      return {
        x: ((p.x + 1) * size.width) / 2,
        y: ((1 - p.y) * size.height) / 2,
      };
    };
    const cdp = touch ? await ctx.newCDPSession(page) : null;
    let captured = false;
    for (let retry = 0; retry < 4 && !captured; retry++) {
      const b = await ball(),
        p = project(b);
      if (touch)
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [p],
        });
      else {
        await page.mouse.move(p.x, p.y);
        await page.mouse.down();
      }
      await page.waitForTimeout(30);
      captured = (await ball()).dragging;
      if (!captured) {
        if (touch)
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: [],
          });
        else await page.mouse.up();
      }
    }
    if (!captured) {
      console.log('GRAB FAILED', size.name, await ball(), pose);
      await page.screenshot({ path: `${out}/${size.name}-grab-failed.png` });
    }
    assert.ok(captured, 'ball can be grabbed');
    const held = await ball();
    await page.waitForTimeout(100);
    assert.equal((await ball()).x, held.x, 'held ball pauses');
    const target = project({ x: 1.4, z: 0.9, y: held.y });
    if (touch)
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [target],
      });
    else await page.mouse.move(target.x, target.y, { steps: 8 });
    await page.waitForTimeout(70);
    const moved = await ball();
    assert.ok(
      Math.hypot(moved.x - held.x, moved.z - held.z) > 0.05,
      'ball drags',
    );
    if (touch)
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    else await page.mouse.up();
    await page.waitForTimeout(300);
    const resumed = await ball();
    assert.equal(resumed.dragging, false);
    assert.ok(
      Math.hypot(moved.x - resumed.x, moved.z - resumed.z) > 0.025,
      'release resumes rolling',
    );
    assert.deepEqual(
      JSON.parse(await canvas.getAttribute('data-pose')).view,
      pose.view,
    );
    await page.screenshot({ path: `${out}/${size.name}-football.png` });
    if (!touch) {
      await page.waitForFunction(
        () =>
          window.typeEvents.some(
            (e, i, a) => !e.done && i > 0 && a[i - 1].done,
          ),
        {},
        { timeout: 25000 },
      );
      const events = await page.evaluate(() => window.typeEvents);
      const index = events.findIndex(
        (e, i) => !e.done && i > 0 && events[i - 1].done,
      );
      const hold = events[index].time - events[index - 1].time;
      assert.ok(hold > 9800 && hold < 10500, `10s text hold: ${hold}`);
      await page.waitForTimeout(1300);
      assert.ok((await title.textContent()).length > 0, 'typing repeats');
      results.push(`Welcome typing loops after ${Math.round(hold)}ms`);
    }
    results.push(
      `${size.name}: light English root, compact laptop, moving/draggable ball, release, welcome hides during object viewing`,
    );
    console.log(results.at(-1));
    await ctx.close();
  }
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/en', {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(new URL(page.url()).pathname, '/');
  await page.goto('http://localhost:3000/zh', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(3000);
  assert.ok(
    await page.getByRole('button', { name: '进来坐坐，抬头看看' }).count(),
  );
  assert.equal(await page.locator('.room-language').getAttribute('href'), '/');
  results.push(
    '/en redirects to English root; /zh keeps Chinese and links back to root',
  );
  await ctx.close();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log('ALL REFINEMENT CHECKS PASSED');
} finally {
  await browser.close();
}
