import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import * as THREE from 'three';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out = 'outputs/room-map-writing';
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
  ]) {
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
      console.log('ERROR', e.message);
    });
    await page.goto('http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(8500);
    assert.equal(
      await page.locator('main').count(),
      0,
      'welcome route has no duplicate Home content',
    );
    const start = Date.now();
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    await page.waitForTimeout(300);
    const canvas = page.locator('.room-canvas canvas'),
      pose = async () => JSON.parse(await canvas.getAttribute('data-pose')),
      home = await pose();
    assert.equal(home.z, 6.05);
    assert.ok(home.yaw < 0.57 && home.yaw > 0.4, 'slightly right-facing');
    await page.screenshot({ path: `${out}/${size.name}-entry.png` });
    await page.waitForTimeout(Math.max(0, 2200 - (Date.now() - start)));
    if (Date.now() - start < 2850)
      assert.equal(
        await page.locator('.room-onboarding').count(),
        0,
        'guide no longer opens after two seconds',
      );
    await page.getByRole('dialog', { name: 'README', exact: true }).waitFor();
    assert.ok(Date.now() - start >= 2900);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    // Aim at the physical map and activate it with mouse / touch.
    const cam = new THREE.PerspectiveCamera(
      home.fov,
      size.width / size.height,
      0.05,
      150,
    );
    cam.position.set(home.x, home.y, home.z);
    cam.rotation.set(home.pitch, home.yaw, 0, 'YXZ');
    cam.updateMatrixWorld();
    const p = new THREE.Vector3(-6.23, 3.78, -3.1).project(cam);
    const x = ((p.x + 1) * size.width) / 2,
      y = ((1 - p.y) * size.height) / 2;
    if (x > 0 && x < size.width && y > 0 && y < size.height) {
      if (touch) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
    } else
      await page
        .getByRole('button', { name: 'World map', exact: true })
        .click();
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('.room-canvas canvas').dataset.pose)
          .view === 'map',
    );
    const focused = await pose();
    assert.ok(focused.x < home.x && Math.abs(focused.y - 3.78) < 1e-6);
    assert.equal(await page.locator('.intro-type').isVisible(), false);
    await page.getByText('World map · Mainland China marker').waitFor();
    await page.screenshot({ path: `${out}/${size.name}-map.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    for (const k of ['x', 'y', 'z', 'yaw', 'pitch'])
      assert.ok(Math.abs((await pose())[k] - home[k]) < 1e-6);
    // Oblique magnet movement must slide, not freeze at first contact.
    await page
      .getByRole('button', { name: 'Tactics board', exact: true })
      .click();
    await page.waitForTimeout(200);
    const view = await pose();
    cam.position.set(view.x, view.y, view.z);
    cam.rotation.set(view.pitch, view.yaw, 0, 'YXZ');
    cam.fov = view.fov;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    const project = (x, z, h = 0.24) => {
      const v = new THREE.Vector3(
        2.43 + x * 0.52,
        1.3195 + h * 0.52,
        0.5 + z * 0.52,
      ).project(cam);
      return {
        x: ((v.x + 1) * size.width) / 2,
        y: ((1 - v.y) * size.height) / 2,
      };
    };
    const a = project(-1.83, 0, 0.2),
      b = project(-0.4, 0.2);
    if (touch) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [a],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [b],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    } else {
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      await page.mouse.move(b.x, b.y);
      await page.mouse.up();
    }
    await page.waitForTimeout(100);
    const tokens = JSON.parse(await canvas.getAttribute('data-tokens'));
    assert.ok(tokens[0].x > -1.1 && tokens[0].z < .06, 'drag slides past first contact and deflects between neighbouring tokens');
    for (let i = 1; i < 22; i++)
      assert.ok(
        Math.hypot(tokens[0].x - tokens[i].x, tokens[0].z - tokens[i].z) >
          0.22 - 1e-6,
      );
    await page.screenshot({ path: `${out}/${size.name}-slide.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await canvas.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(url=>/^\/en\/blog\/?$/.test(url.pathname));
    await page.waitForTimeout(2200);
    assert.equal(await page.locator('.home-return').count(), 0);
    await page.locator('main .writing-showcase').waitFor();
    await page.screenshot({ path: `${out}/${size.name}-writing.png` });
    const nav = page.getByRole('navigation', {
      name: touch ? 'Mobile navigation' : 'Primary',
      exact: true,
    });
    await nav.getByRole('link', { name: 'Home', exact: true }).click();
    await page.waitForURL('http://localhost:3000/');
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .waitFor();
    await page.goto('http://localhost:3000/en/about', {
      waitUntil: 'domcontentloaded',
    });
    await page.getByText('China · UTC+8', { exact: true }).waitFor();
    assert.equal(
      await page.getByText('Shanghai · UTC+8', { exact: true }).count(),
      0,
    );
    results.push(
      `${size.name}: rearward/rightward view, three-second README, map focus and restoration, tangent magnet slide, Enter to Writing, Home to welcome, China profile`,
    );
    console.log(results.at(-1));
    await ctx.close();
  }
  const zh=await browser.newPage({viewport:{width:1200,height:850},reducedMotion:'reduce'});
  await zh.goto('http://localhost:3000/zh',{waitUntil:'domcontentloaded'});await zh.waitForTimeout(8500);
  await zh.keyboard.press('Enter');await zh.waitForURL(url=>/^\/zh\/blog\/?$/.test(url.pathname));
  await zh.locator('main .writing-showcase').waitFor();results.push('Chinese welcome Enter opens Chinese Writing directly');await zh.close();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
