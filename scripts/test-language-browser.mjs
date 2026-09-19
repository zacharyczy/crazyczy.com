import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.ROOM_BASE || 'http://localhost:3000',
  out =
    'outputs/language-switch/' +
    (base.startsWith('https:') ? 'production' : 'local');
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
    { name: 'small', width: 320, height: 740 },
    { name: 'portrait', width: 390, height: 844 },
    { name: 'landscape', width: 844, height: 390 },
  ].filter(() => process.env.LANGUAGE_PART !== 'pages')) {
    const ctx = await browser.newContext({
      viewport: size,
      isMobile: size.name !== 'desktop',
      hasTouch: size.name !== 'desktop',
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(35000);
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/?visit=language#room');
    await page.waitForTimeout(8500);
    await page
      .locator('.home-experience > .room-loading')
      .waitFor({ state: 'hidden', timeout: 90000 });
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    await page.locator('.room-invitation').waitFor();
    await page.evaluate(() => document.exitPointerLock());
    await page.evaluate(() => {
      window.originalCanvas = document.querySelector('.room-canvas canvas');
      window.languageToken = 'preserved';
    });
    const checkTip = async (text) => {
      assert.equal(await page.locator('.room-invitation p').innerText(), text);
      const g = await page.locator('.room-invitation p').evaluate((e) => {
        const r = document.createRange();
        r.selectNodeContents(e);
        return {
          lines: r.getClientRects().length,
          width: e.scrollWidth,
          client: e.clientWidth,
          edge: e.getBoundingClientRect().right,
        };
      });
      assert.equal(g.lines, 1);
      assert.ok(g.width <= g.client + 1 && g.edge < size.width);
    };
    await checkTip('explore freely, or refer to the manual');
    await page.screenshot({ path: `${out}/${size.name}-en.png` });
    await page.locator('.room-language').click();
    await page.waitForURL(/\/zh\/\?visit=language#room/);
    await checkTip('自由探索, 或查阅手册');
    assert.ok(
      await page.evaluate(
        () =>
          window.originalCanvas ===
            document.querySelector('.room-canvas canvas') &&
          window.languageToken === 'preserved',
      ),
    );
    await page.screenshot({ path: `${out}/${size.name}-zh.png` });
    await page.locator('.room-manual-button').click();
    const dialog = page.getByRole('dialog', { name: 'README', exact: true });
    await dialog.waitFor();
    await dialog.evaluate(
      (e) => (e.scrollTop = (e.scrollHeight - e.clientHeight) * 0.65),
    );
    const ratio = await dialog.evaluate((e) =>
      e.scrollHeight > e.clientHeight
        ? e.scrollTop / (e.scrollHeight - e.clientHeight)
        : 0,
    );
    // Sticky language controls remain clickable at the current reading position.
    await dialog.getByRole('button', { name: 'EN', exact: true }).click();
    await page.waitForURL(/\/\?visit=language#room/);
    await page.waitForTimeout(150);
    assert.ok(await dialog.isVisible());
    const next = await dialog.evaluate((e) =>
      e.scrollHeight > e.clientHeight
        ? e.scrollTop / (e.scrollHeight - e.clientHeight)
        : 0,
    );
    assert.ok(Math.abs(next - ratio) < 0.06, 'manual scroll progress');
    assert.ok(
      await page.evaluate(
        () =>
          window.originalCanvas ===
          document.querySelector('.room-canvas canvas'),
      ),
    );
    await page.screenshot({ path: `${out}/${size.name}-manual.png` });
    await page.keyboard.press('Escape');
    const toggle = page.locator('.room-dock-toggle');
    if ((await toggle.getAttribute('aria-expanded')) === 'false')
      await toggle.click();
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    if (size.name === 'desktop') {
      await page
        .getByRole('button', { name: 'Open computer', exact: true })
        .click();
      await page.locator('.computer-taskbar').waitFor();
      await page
        .locator('.computer-taskbar')
        .getByRole('button', { name: /Terminal/ })
        .click();
      const input = page.locator('.room-terminal-holder input');
      await input.fill('help');
      await input.press('Enter');
      await input.fill('keep this draft');
      await page
        .locator('.study-titlebar')
        .getByRole('button', { name: '中文', exact: true })
        .click();
      await page.waitForTimeout(200);
      assert.equal(await input.inputValue(), 'keep this draft');
      assert.match(
        await page.locator('.room-terminal-holder').innerText(),
        /whoami/,
      );
      await page
        .locator('.study-titlebar')
        .getByRole('button', { name: 'EN', exact: true })
        .click();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(350);
    }
    await ctx.close();
    results.push(
      size.name +
        ': single line, no reload, same room canvas, manual stays open and keeps scroll',
    );
    console.log(results.at(-1));
  }
  const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', (e) => errors.push(e.message));
  for (const path of [
    'blog',
    'projects',
    'about',
    'tags',
    'games',
    'terminal',
    'blog/no-pink-elephant',
    'games/snake',
    'games/starflight',
  ]) {
    await page.goto(base + '/' + path + '/?probe=1#same');
    await page.waitForTimeout(1500);
    await page.locator('.language-toggle').waitFor();
    await page.evaluate(() => {
      window.languageToken = 'still-here';
      window.savedCanvas = document.querySelector('.canvas-wrap canvas');
    });
    if (path === 'terminal') {
      const input = page.locator('input');
      await input.fill('help');
      await input.press('Enter');
      await input.fill('draft language');
    }
    if (path.startsWith('games/')) {
      await page
        .getByRole('button', {
          name: path.endsWith('snake') ? 'Start' : 'Launch',
          exact: true,
        })
        .click();
      await page.waitForTimeout(180);
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      await page.evaluate(
        () =>
          (window.gameBefore = document
            .querySelector('.canvas-wrap canvas')
            .toDataURL()),
      );
    }
    await page.locator('.language-toggle').click();
    await page.waitForURL(new RegExp('/' + path + '/zh/\\?probe=1#same'));
    await page.waitForTimeout(120);
    assert.equal(
      await page.evaluate(() => window.languageToken),
      'still-here',
      path + ' no document reload',
    );
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
    assert.match(
      await page.locator('link[rel=canonical]').getAttribute('href'),
      new RegExp('/' + path + '/zh/$'),
    );
    if (path === 'terminal') {
      assert.equal(await page.locator('input').inputValue(), 'draft language');
      assert.match(await page.locator('main').innerText(), /whoami/);
      await page.locator('input').fill('lang');
      await page.locator('input').press('Enter');
      await page.waitForURL(new RegExp('/terminal/\\?probe=1#same'));
    } else {
      await page.locator('.language-toggle').click();
      await page.waitForURL(new RegExp('/' + path + '/\\?probe=1#same'));
    }
    if (path.startsWith('games/')) {
      assert.ok(
        await page.evaluate(
          () =>
            window.savedCanvas ===
            document.querySelector('.canvas-wrap canvas'),
        ),
      );
      assert.equal(
        await page.locator('.game-stage').getAttribute('data-running'),
        'false',
      );
      assert.equal(
        await page
          .locator('.canvas-wrap canvas')
          .evaluate((e) => e.toDataURL()),
        await page.evaluate(() => window.gameBefore),
      );
    }
    if (path === 'blog/no-pink-elephant') {
      await page.getByRole('link', { name: /阅读中文版/ }).click();
      await page.waitForURL(/no-pink-elephant\/zh/);
      assert.match(await page.locator('article').innerText(), /负向要求/);
      assert.match(await page.title(), /no-pink-elephant/);
    }
    results.push(path + ': language URL, metadata and stable client state');
    console.log(results.at(-1));
  }
  await page.goto(base + '/projects/');
  await page.waitForTimeout(1500);
  let writes = 0;
  await page.route('**/api/suggestions', (route) => {
    if (route.request().method() !== 'GET') writes++;
    return route.fulfill({ json: [] });
  });
  await page.locator('.suggestions-trigger').first().click();
  const sheet = page.getByRole('dialog');
  await sheet.waitFor();
  await sheet.locator('textarea').fill('draft stays unsubmitted');
  await sheet.getByRole('button', { name: '中文', exact: true }).click();
  assert.equal(
    await sheet.locator('textarea').inputValue(),
    'draft stays unsubmitted',
  );
  assert.equal(writes, 0);
  await page.keyboard.press('Escape');
  await page.goto(base + '/blog/');
  await page.waitForTimeout(1500);
  await page.goto(base + '/projects/');
  await page.waitForTimeout(1500);
  await page.locator('.language-toggle').click();
  await page.waitForURL(/projects\/zh\/$/);
  await page.goBack();
  await page.waitForURL(/blog\/$/);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await page.goto(base + '/blog/no-pink-elephant/zh/');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
  assert.match(await page.locator('article').innerText(), /负向要求/);
  results.push(
    'Suggestions draft/no writes, history replacement, direct translated load and refresh',
  );
  await ctx.close();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + '/results.json',
    JSON.stringify({ results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
