import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.ROOM_BASE || 'http://localhost:3000';
const out = base.startsWith('https:')
  ? 'outputs/room-dock/production'
  : 'outputs/room-dock/local';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader'],
});
const errors = [],
  results = [];
try {
  for (const size of [
    { name: 'desktop', width: 1440, height: 1000, lang: 'en' },
    { name: 'portrait', width: 390, height: 844, lang: 'zh' },
    { name: 'landscape', width: 844, height: 390, lang: 'en' },
  ]) {
    const touch = size.name !== 'desktop',
      zh = size.lang === 'zh';
    const ctx = await browser.newContext({
      viewport: size,
      isMobile: touch,
      hasTouch: touch,
      reducedMotion: size.name === 'landscape' ? 'reduce' : 'no-preference',
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + (zh ? '/zh/' : '/'));
    await page.waitForTimeout(8500);
    await page
      .locator('.home-experience > .room-loading')
      .waitFor({ state: 'hidden', timeout: 90000 });
    await page
      .getByRole('button', {
        name: zh ? '进来坐坐，抬头看看' : 'Step into my room',
        exact: true,
      })
      .click();
    const tip = page.locator('.room-invitation'),
      dock = page.locator('.room-toolbar'),
      toggle = page.locator('.room-dock-toggle'),
      manual = page.locator('.room-manual-button'),
      canvas = page.locator('.room-canvas canvas');
    await tip.waitFor();
    await page.waitForTimeout(200);
    assert.equal(
      await page.getByRole('dialog').count(),
      0,
      'entry is non-modal',
    );
    assert.equal(await toggle.getAttribute('aria-expanded'), String(!touch));
    const collapsed = await dock.boundingBox();
    if (touch)
      assert.ok(
        collapsed.height < 70 && collapsed.width < 140,
        'compact mobile dock',
      );
    const tb = await tip.boundingBox(),
      mb = await manual.boundingBox();
    const arrow = await tip.evaluate((e) =>
      parseFloat(getComputedStyle(e).getPropertyValue('--guide-arrow-x')),
    );
    assert.ok(
      Math.abs(tb.x + arrow - (mb.x + mb.width / 2)) < 2,
      'arrow points at manual icon',
    );
    assert.ok(
      tb.x >= 0 &&
        tb.x + tb.width <= size.width &&
        tb.y + tb.height < size.height,
      'invitation fits viewport',
    );
    const welcome = await page.locator('.intro-type').boundingBox();
    assert.ok(welcome.y >= tb.y + tb.height + 8, 'welcome below invitation');
    await page.screenshot({ path: `${out}/${size.name}-invitation.png` });
    await page.waitForTimeout(3200);
    assert.equal(
      await page.getByRole('dialog').count(),
      0,
      'no delayed automatic popup',
    );
    await canvas.focus();
    const still = await canvas.getAttribute('data-pose');
    await page.keyboard.down('KeyW'); await page.waitForTimeout(180); await page.keyboard.up('KeyW'); await page.waitForTimeout(300);
    const before = await canvas.getAttribute('data-pose');
    if (still && before) { const a=JSON.parse(still),b=JSON.parse(before); assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>.05,'invitation does not block walking'); }

    await page.evaluate(() => document.exitPointerLock());
    await manual.click();
    await page.getByRole('dialog', { name: 'README', exact: true }).waitFor();
    if (before) {
      const a = JSON.parse(before),
        b = JSON.parse(await canvas.getAttribute('data-pose'));
      assert.equal(b.view, null);
      assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<0.01, 'manual keeps the current position');
    }
    await page.screenshot({ path: `${out}/${size.name}-manual.png` });
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await tip.count(), 0);
    if ((await toggle.getAttribute('aria-expanded')) === 'false')
      await toggle.click();
    await page
      .getByRole('button', { name: zh ? '拖动' : 'Drag', exact: true })
      .click();
    await page.screenshot({ path: `${out}/${size.name}-expanded.png` });
    await page
      .getByRole('button', { name: zh ? '世界地图' : 'World map', exact: true })
      .click();
    await page.waitForTimeout(1200);
    await page
      .getByRole('button', {
        name: zh ? '回到房间' : 'Back to the room',
        exact: true,
      })
      .click();
    await page.waitForTimeout(1200);
    assert.equal(
      await toggle.getAttribute('aria-expanded'),
      'true',
      'dock state survives object view',
    );
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.ok(await manual.isVisible());
    await manual.click();
    await page.getByRole('dialog', { name: 'README', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    await page.screenshot({ path: `${out}/${size.name}-collapsed.png` });
    if (!touch) {
      await page.mouse.move(300, 550);
      await page.mouse.down();
      await page.mouse.move(850, 550, { steps: 16 });
      await page.mouse.up();
      await page.getByRole('button', { name: /Open door to Web/ }).click();
    } else if (zh) {
      await canvas.focus();
      await page.keyboard.press('Enter');
    } else
      await page
        .getByRole('button', {
          name: zh ? '进入 Web' : 'Enter Web',
          exact: true,
        })
        .click();
    await page.waitForURL(zh ? /\/blog\/zh\/?$/ : /\/blog\/?$/);
    results.push(
      `${size.name}: non-modal introduction, aligned arrow, manual, collapsible dock, map return and Web entry to Writing`,
    );
    console.log(results.at(-1));
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + '/results.json',
    JSON.stringify({ base, results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
