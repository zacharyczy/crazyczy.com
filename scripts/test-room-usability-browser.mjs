import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import * as THREE from 'three';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out = 'outputs/room-usability';
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
    (s) => !process.env.USABILITY_SIZE || s.name === process.env.USABILITY_SIZE,
  )) {
    const touch = size.name !== 'desktop',
      ctx = await browser.newContext({
        viewport: size,
        reducedMotion: 'reduce',
        hasTouch: touch,
        isMobile: touch,
      }),
      page = await ctx.newPage();
    page.on('pageerror', (e) => {
      errors.push(e.message);
      console.log('PAGEERROR', e.message);
    });
    await page.goto('http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(8500);
    const welcome = page.locator('.intro-type'),
      canvas = page.locator('.room-canvas canvas');
    const initial = await welcome.boundingBox(),
      font = await welcome
        .locator('h1')
        .evaluate((e) => getComputedStyle(e).fontSize);
    assert.ok(initial.y < 260 && initial.x < 35);
    await page.screenshot({ path: `${out}/${size.name}-welcome.png` });
    const entered = Date.now();
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    await page.waitForTimeout(250);
    const pose = async () => JSON.parse(await canvas.getAttribute('data-pose')),
      home = await pose();
    assert.equal(home.x, 5.35);
    assert.equal(home.z, 6.05);
    assert.equal(home.y, 2.7);
    const inside = await welcome.boundingBox();
    assert.equal(inside.x, initial.x);
    assert.equal(inside.y, initial.y);
    const toolbar = await page.getByRole('toolbar').boundingBox();
    assert.ok(
      inside.y >= toolbar.y + toolbar.height + 8,
      'welcome below toolbar',
    );
    assert.equal(
      await welcome.locator('h1').evaluate((e) => getComputedStyle(e).fontSize),
      font,
    );
    await page.screenshot({ path: `${out}/${size.name}-room.png` });
    await page.locator('.room-onboarding').waitFor();
    const elapsed = Date.now() - entered;
    assert.ok(
      elapsed >= 2900 && elapsed < 4500,
      `onboarding after three seconds: ${elapsed}`,
    );
    await page.getByRole('dialog').waitFor();
    assert.equal((await pose()).x, home.x);
    assert.equal((await pose()).z, home.z);
    assert.equal((await pose()).yaw, home.yaw);
    assert.equal(
      (await pose()).view,
      null,
      'README never moves camera to wall',
    );
    await page.getByText(/You can read this guide again anytime/).waitFor();
    assert.equal(await welcome.isVisible(), false);
    assert.equal(
      await page.evaluate(() => !!document.pointerLockElement),
      false,
    );
    await page.screenshot({ path: `${out}/${size.name}-readme.png` });
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.waitForTimeout(200);
    assert.equal((await pose()).x, home.x);
    assert.equal((await pose()).z, home.z);
    assert.ok(await welcome.isVisible());
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    await page.waitForTimeout(2200);
    assert.equal(
      await page.getByRole('dialog').count(),
      0,
      'guide opens only once automatically',
    );
    await page
      .getByRole('button', { name: 'Room controls', exact: true })
      .click();
    await page
      .getByRole('heading', { name: /README/ })
      .waitFor({ timeout: 12000 })
      .catch(async (e) => {
        await page.screenshot({
          path: `${out}/${size.name}-guide-failure.png`,
        });
        console.log(
          'GUIDE',
          await page.evaluate(() =>
            Array.from(
              document.querySelectorAll(
                '.study-surface,.mobile-study-backdrop,.study-pending',
              ),
            ).map((e) => ({
              html: e.outerHTML.slice(0, 500),
              rect: e.getBoundingClientRect().toJSON(),
              ancestors: Array.from(
                (function* (n) {
                  while (n) {
                    yield n;
                    n = n.parentElement;
                  }
                })(e),
              )
                .slice(0, 6)
                .map((n) => ({
                  tag: n.tagName,
                  display: getComputedStyle(n).display,
                  visibility: getComputedStyle(n).visibility,
                  style: n.getAttribute('style'),
                })),
            })),
          ),
          await pose(),
        );
        throw e;
      });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    for (const [name, kind] of [
      ['Open computer', 'dialog'],
      ['Read writing', 'dialog'],
      ['Watch TV', 'region'],
    ]) {
      await page.getByRole('button', { name, exact: true }).click();
      const surface =
        kind === 'dialog'
          ? page.getByRole('dialog')
          : page.getByRole('region', { name: 'Television arcade' });
      await surface.waitFor();
      assert.equal(await welcome.isVisible(), false);
      await page.keyboard.press('Escape');
      await surface.waitFor({ state: 'hidden' });
      await page.waitForTimeout(180);
    }
    await page
      .getByRole('button', { name: 'Tactics board', exact: true })
      .click();
    await page.waitForTimeout(200);
    const view = await pose(),
      camera = new THREE.PerspectiveCamera(
        view.fov,
        size.width / size.height,
        0.05,
        150,
      );
    camera.position.set(view.x, view.y, view.z);
    camera.rotation.set(view.pitch, view.yaw, 0, 'YXZ');
    camera.updateMatrixWorld();
    const project = (x, z, y = 0.2) => {
      const p = new THREE.Vector3(
        2.43 + x * 0.52,
        1.3195 + y * 0.52,
        0.5 + z * 0.52,
      ).project(camera);
      return {
        x: ((p.x + 1) * size.width) / 2,
        y: ((1 - p.y) * size.height) / 2,
      };
    };
    const start = project(-1.83, 0),
      end = project(0.7, 0, 0.24),
      before = JSON.parse(await canvas.getAttribute('data-tokens'));
    if (touch) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [start],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [end],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    } else {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y);
      await page.mouse.up();
    }
    await page.waitForTimeout(100);
    const tokens = JSON.parse(await canvas.getAttribute('data-tokens'));
    assert.ok(tokens[0].x > before[0].x + 0.05, 'drag moves until obstruction');
    assert.ok(
      tokens[0].x < -0.9,
      'cannot cross obstructing magnet even at high speed',
    );
    for (let i = 0; i < 22; i++)
      for (let j = i + 1; j < 22; j++)
        assert.ok(
          Math.hypot(tokens[i].x - tokens[j].x, tokens[i].z - tokens[j].z) >=
            0.22,
        );
    await page.screenshot({ path: `${out}/${size.name}-magnets.png` });
    const ball = async () => JSON.parse(await canvas.getAttribute('data-ball'));
    let held = false;
    const cdp = touch ? await ctx.newCDPSession(page) : null;
    for (let attempt = 0; attempt < 5 && !held; attempt++) {
      await page.waitForFunction(
        () =>
          !JSON.parse(
            document.querySelector('.room-canvas canvas').dataset.ball,
          ).goal,
      );
      const b = await ball(),
        p = project(b.x, b.z, b.y);
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
      held = (await ball()).dragging;
      if (!held) {
        if (touch)
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: [],
          });
        else await page.mouse.up();
      }
    }
    assert.ok(held, 'ball picked for scoring');
    const goal = project(2.23, 0.28, 0.184);
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [goal],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    } else {
      await page.mouse.move(goal.x, goal.y);
      await page.mouse.up();
    }
    await page.getByText('GOAL!', { exact: false }).waitFor();
    assert.equal((await ball()).goal, 1);
    await page.screenshot({ path: `${out}/${size.name}-goal.png` });
    await page.waitForFunction(() => {
      const b = JSON.parse(
        document.querySelector('.room-canvas canvas').dataset.ball,
      );
      return b.goals > 0 && !b.goal;
    });
    const reset = await ball();
    assert.ok(
      Math.abs(reset.x) < 0.15 && Math.abs(reset.z) < 0.15,
      'goal resets ball to centre',
    );
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    if (!touch) {
      const p = await pose(),
        target = new THREE.Vector3(-5.94, 2.55, 2.6).sub(
          new THREE.Vector3(p.x, p.y, p.z),
        );
      const yaw = Math.atan2(-target.x, -target.z),
        pitch = Math.atan2(target.y, Math.hypot(target.x, target.z));
      await page.mouse.move(500, 400);
      await page.mouse.down();
      await page.mouse.move(
        500 + (yaw - p.yaw) / 0.0025,
        400 + (pitch - p.pitch) / 0.0025,
        { steps: 20 },
      );
      await page.mouse.up();
      await page.waitForTimeout(100);
      await page.screenshot({ path: `${out}/bookshelf.png` });
    }
    results.push(
      `${size.name}: welcome below toolbar, rear-right standing position, stationary README after ${elapsed}ms and wall-guide access, hidden welcome during content, restored view, swept magnet blocking, GOAL reward and centre reset`,
    );
    console.log(results.at(-1));
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
