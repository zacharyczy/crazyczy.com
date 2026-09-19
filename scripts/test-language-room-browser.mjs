import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { dismissRoomGuide } from './room-browser-guide.mjs';
const base = process.env.ROOM_BASE || 'http://localhost:3000',
  out =
    'outputs/language-room/' +
    (base.startsWith('https:') ? 'production' : 'local');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader'],
});
const errors = [];
try {
  for (const size of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'portrait', width: 390, height: 844 },
  ]) {
    const ctx = await browser.newContext({
        viewport: size,
        hasTouch: size.name !== 'desktop',
        isMobile: size.name !== 'desktop',
        reducedMotion: 'reduce',
      }),
      page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/');
    await page.waitForTimeout(8500);
    await page
      .locator('.home-experience > .room-loading')
      .waitFor({ state: 'hidden', timeout: 90000 });
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    await dismissRoomGuide(page);
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    const canvas = page.locator('.room-canvas canvas');
    await page.evaluate(
      () => (window.roomCanvas = document.querySelector('.room-canvas canvas')),
    );
    await page
      .getByRole('button', { name: 'On the wall', exact: true })
      .click();
    await page.waitForTimeout(250);
    const oldPose = await canvas.getAttribute('data-pose');
    await page.locator('.room-language').click();
    await page.waitForURL(/\/zh\/$/);
    if (oldPose) {
      const a = JSON.parse(oldPose),
        b = JSON.parse(await canvas.getAttribute('data-pose'));
      assert.equal(a.view, b.view);
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.01);
    }
    await page.getByRole('button', { name: '回到房间', exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '阅读文稿', exact: true }).click();
    const dialog = page.locator('.study-surface:visible');
    await dialog.waitFor();
    await dialog.locator('.writing-row').first().click();
    const article = await dialog.locator('article:visible').innerText();
    assert.match(article, /no-pink-elephant/);
    await dialog
      .locator('.study-scroll:visible')
      .evaluate((e) => (e.scrollTop = (e.scrollHeight - e.clientHeight) * 0.6));
    const ratio = await dialog
      .locator('.study-scroll:visible')
      .evaluate(
        (e) => e.scrollTop / Math.max(1, e.scrollHeight - e.clientHeight),
      );
    await dialog.getByRole('button', { name: 'EN', exact: true }).click();
    await page.waitForTimeout(180);
    assert.match(
      await dialog.locator('article:visible').innerText(),
      /negative requirements/,
    );
    const nextRatio = await dialog
      .locator('.study-scroll:visible')
      .evaluate(
        (e) => e.scrollTop / Math.max(1, e.scrollHeight - e.clientHeight),
      );
    assert.ok(Math.abs(ratio - nextRatio) < 0.06);
    await page.screenshot({ path: out + '/' + size.name + '-reader.png' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Watch TV', exact: true }).click();
    const tv = page.locator('.tv-screen-ui');
    await tv.waitFor();
    await tv.getByRole('button', { name: /Snake/ }).click();
    await tv.getByRole('button', { name: 'Start', exact: true }).click();
    await page.waitForTimeout(180);
    await tv.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.waitForTimeout(80);
    const game = tv.locator('canvas');
    await game.evaluate((e) => {
      window.tvCanvas = e;
      window.tvPixels = e.toDataURL();
    });
    await tv
      .locator('header')
      .getByRole('button', { name: '中文', exact: true })
      .click();
    await page.waitForURL(/\/zh\/$/);
    await tv.getByRole('button', {name:'开始',exact:true}).waitFor();
    await page.waitForTimeout(180);
    assert.equal(
      await tv.locator('.game-stage').getAttribute('data-running'),
      'false',
    );
    assert.ok(
      await game.evaluate(
        (e) => e === window.tvCanvas && e.toDataURL() === window.tvPixels,
      ),
    );
    await page.screenshot({ path: out + '/' + size.name + '-tv.png' });
    await page.keyboard.press('Escape');
    await tv.locator('.tv-menu').waitFor();
    await tv.getByRole('button', {name:'关机',exact:true}).click();
    await tv.waitFor({state:'hidden'});
    await page.waitForTimeout(300);
    assert.ok(
      await page.evaluate(
        () =>
          window.roomCanvas === document.querySelector('.room-canvas canvas'),
      ),
    );
    if (size.name === 'desktop' && (await canvas.getAttribute('data-pose'))) {
      await canvas.focus();
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(1700);
      await page.keyboard.up('KeyW');
      await page.waitForTimeout(600);
      const pose = JSON.parse(await canvas.getAttribute('data-pose'));
      assert.ok(
        Math.hypot(pose.x - 3.8, pose.z - 6.56) > 2.4,
        'walked outside old reach',
      );
      assert.ok(Math.hypot(pose.x-3.8,pose.z-6.56)<6, 'standing at table edge within new reach');
      let delta =
        (Math.atan2(-(3.8 - pose.x), -(6.56 - pose.z)) - pose.yaw) / 0.0025;
      while (Math.abs(delta) > 1) {
        const step = Math.max(-500, Math.min(500, delta)),
          x = step > 0 ? 400 : 1000;
        await page.mouse.move(x, 500);
        await page.mouse.down();
        await page.mouse.move(x + step, 500, { steps: 12 });
        await page.mouse.up();
        delta -= step;
      }
      await page.getByRole('button', { name: /开门进入 Web/ }).waitFor();
      await page.screenshot({ path: out + '/desk-door.png' });
      await page.getByRole('button', { name: /开门进入 Web/ }).click();
      await page.waitForURL(/\/blog\/zh\/$/);
    }
    console.log(
      size.name +
        ': photo view, translated article/scroll, same television game/canvas and room return passed',
    );
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + '/results.json',
    JSON.stringify({ errors, passed: true }, null, 2),
  );
} finally {
  await browser.close();
}
