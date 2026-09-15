import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out = 'outputs/avatar-acceptance';
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
    const touch = size.name !== 'desktop';
    const ctx = await browser.newContext({
      viewport: size,
      hasTouch: touch,
      isMobile: touch,
      reducedMotion: 'no-preference',
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(8500);
    await page
      .locator('.home-experience > .room-loading')
      .waitFor({ state: 'hidden' });
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    await page.getByRole('dialog', { name: 'README', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    const canvas = page.locator('.room-canvas canvas');
    const pose = () => canvas.getAttribute('data-pose').then(JSON.parse);
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('.room-canvas canvas').dataset.pose)
          .avatar.visible,
    );
    await page.screenshot({ path: `${out}/${size.name}-hands.png` });
    if (touch) {
      const a = await page.locator('.room-jump-touch').boundingBox(), b = await page.locator('.enter-reading').boundingBox();
      assert.ok(a.y + a.height < b.y || b.y + b.height < a.y, 'jump and Writing buttons do not overlap');
    }
    await canvas.focus();
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(450);
    await page.keyboard.up('KeyW');
    assert.ok((await pose()).avatar.phase > 0);
    await page.waitForTimeout(650);
    if (touch)
      await page.getByRole('button', { name: 'Jump', exact: true }).tap();
    else {
      await canvas.focus();
      await page.keyboard.press('Space');
    }
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('.room-canvas canvas').dataset.pose)
          .avatar.jump > 0.2,
    );
    await page.screenshot({ path: `${out}/${size.name}-jump.png` });
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('.room-canvas canvas').dataset.pose)
          .avatar.jump === 0,
    );
    await page.waitForTimeout(300);
    assert.ok(
      Math.abs((await pose()).y - 2.7) < 0.015,
      'land at standing height',
    );
    // Look down by dragging upwards in the room's inverse drag mode.
    let remaining = -590;
    while (remaining < 0) {
      const step = Math.max(remaining, -size.height * 0.36);
      const y = size.height * 0.69;
      await page.mouse.move(size.width * 0.6, y);
      await page.mouse.down();
      await page.mouse.move(size.width * 0.6, y + step, { steps: 12 });
      await page.mouse.up();
      remaining -= step;
    }
    await page.waitForTimeout(450);
    assert.equal(
      (await pose()).avatar.swing,
      0,
      'dragging does not swing hand',
    );
    await page.screenshot({ path: `${out}/${size.name}-feet.png` });
    await page.mouse.click(size.width * 0.55, size.height * 0.56);
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('.room-canvas canvas').dataset.pose)
          .avatar.swing > 0,
    );
    await page.screenshot({ path: `${out}/${size.name}-swing.png` });
    await page.waitForTimeout(400);
    await page
      .getByRole('button', { name: 'Stand / crouch', exact: true })
      .click();
    await page.waitForTimeout(750);
    assert.ok(Math.abs((await pose()).y - 1.92) < 0.01);
    await page.getByRole('button', { name: 'World map', exact: true }).click();
    await page.waitForTimeout(1200);
    assert.equal((await pose()).avatar.visible, false);
    const focused = await pose();
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    assert.equal((await pose()).avatar.jump, 0);
    assert.equal((await pose()).y, focused.y);
    await page
      .getByRole('button', { name: 'Back to the room', exact: true })
      .click();
    await page.waitForTimeout(1200);
    assert.ok(Math.abs((await pose()).y - 1.92) < 0.01);
    assert.equal((await pose()).avatar.visible, true);
    if (!touch) {
      await canvas.focus();
      await page.keyboard.press('Space');
      await page.waitForFunction(
        () =>
          JSON.parse(document.querySelector('.room-canvas canvas').dataset.pose)
            .avatar.jump > 0.2,
      );
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await page.waitForTimeout(150);
      assert.equal((await pose()).avatar.jump, 0);
    }
    await page.goto('http://localhost:3000/projects/');
    await page.locator('a[href="/blog/no-pink-elephant/"]').click();
    await page.waitForURL(/no-pink-elephant/);
    assert.match(
      await page.locator('article').innerText(),
      /negative requirements/,
    );
    await page.locator('.language-toggle').click();
    await page.waitForURL(/no-pink-elephant\/zh/);
    assert.match(await page.locator('article').innerText(), /负向要求/);
    results.push(
      `${size.name}: avatar, gait, jump/landing, tap swing vs drag, crouch, focus isolation and new project passed`,
    );
    console.log(results.at(-1));
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + '/results.json',
    JSON.stringify({ results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
