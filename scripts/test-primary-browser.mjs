import { dismissRoomGuide } from './room-browser-guide.mjs';
import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out = 'outputs/primary-site';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader'],
});
const base = 'http://localhost:3000',
  results = [],
  errors = [];
try {
  const api = await browser.newContext();
  for (const path of [
    'blog',
    'projects',
    'about',
    'terminal',
    'tags',
    'games',
    'games/snake',
    'games/starflight',
    'blog/ppt-to-chinese',
    'blog/gentzen',
  ]) {
    for (const lang of ['en', 'zh']) {
      const canonical = `/${path}${lang === 'zh' ? '/zh' : ''}/`;
      const response = await api.request.get(base + canonical);
      assert.equal(response.status(), 200, canonical);
      const html = await response.text();
      assert.ok(
        html.includes(`https://crazyczy.com${canonical}`),
        'canonical ' + canonical,
      );
      assert.ok(
        html.includes(`lang="${lang === 'zh' ? 'zh-CN' : 'en'}"`),
        'html language ' + canonical,
      );
      let address = `${base}/${lang}/${path}/?ref=test`;
      let hops = 0;
      for (; hops < 4; hops++) {
        const legacy = await api.request.get(address, { maxRedirects: 0 });
        if (legacy.status() === 200) break;
        assert.equal(legacy.status(), 308, 'legacy ' + address);
        const to = new URL(legacy.headers().location, base);
        assert.equal(to.search, '?ref=test');
        address = to.href;
      }
      assert.ok(hops > 0 && hops < 4, 'finite permanent redirect chain');
      assert.equal(
        new URL(address).pathname.replace(/\/$/, ''),
        canonical.replace(/\/$/, ''),
      );
    }
  }
  const loc = await api.request.get(base + '/api/visitor-location');
  assert.equal((await loc.json()).location, null);
  assert.match(loc.headers()['cache-control'], /no-store/);
  const rss = await (await api.request.get(base + '/rss.xml')).text();
  assert.ok(rss.includes('/blog/ppt-to-chinese/'));
  assert.ok(!rss.includes('/en/'));
  assert.ok(!rss.includes('<language>zh</language>'));
  const sitemap = await (await api.request.get(base + '/sitemap.xml')).text();
  assert.ok(sitemap.includes('/blog/ppt-to-chinese/zh/'));
  assert.ok(!sitemap.includes('/en/'));
  await api.close();
  results.push(
    'Canonical routes, query-preserving redirects, HTML language, RSS, sitemap and location fallback passed',
  );
  for (const size of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'portrait', width: 390, height: 844 },
    { name: 'landscape', width: 844, height: 390 },
  ]) {
    const context = await browser.newContext({
      viewport: size,
      hasTouch: size.name !== 'desktop',
      isMobile: size.name !== 'desktop',
      reducedMotion: size.name === 'desktop' ? 'no-preference' : 'reduce',
    });
    await context.route('**/api/visitor-location', (route) =>
      route.fulfill({
        json: {
          location: {
            latitude: -33.9,
            longitude: 151.2,
            city: 'Sydney',
            country: 'AU',
          },
        },
      }),
    );
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror', (e) => {
      errors.push(e.message);
      console.log('PAGE ERROR', e.message);
    });
    await page.goto(base + '/');
    await page.waitForTimeout(8500);
    await page
      .locator('.home-experience > .room-loading')
      .waitFor({ state: 'hidden', timeout: 60000 });
    await page
      .getByRole('button', { name: 'Step into my room', exact: true })
      .click();
    await dismissRoomGuide(page);
    await page.getByRole('button', { name: 'Drag', exact: true }).click();
    await page.getByRole('button', { name: 'World map', exact: true }).click();
    await page.waitForTimeout(1200);
    assert.match(
      await page.locator('.map-location-caption').innerText(),
      /Sydney/,
    );
    await page.screenshot({ path: `${out}/${size.name}-map.png` });
    await page
      .getByRole('button', { name: 'Back to the room', exact: true })
      .click();
    await page.waitForTimeout(1300);
    // Turn from the initial view toward the door using actual drag gestures.
    const canvas = page.locator('.room-canvas canvas');
    const pose = () => canvas.getAttribute('data-pose').then(JSON.parse);
    const current = await pose();
    const target = Math.atan2(current.x - 3.8, current.z - 6.56);
    let dx = (target - current.yaw) / 0.0025;
    while (Math.abs(dx) > 0.01) {
      const step = Math.sign(dx) * Math.min(Math.abs(dx), size.width * 0.55);
      const start = step > 0 ? size.width * 0.2 : size.width * 0.8;
      await page.mouse.move(start, size.height * 0.55);
      await page.mouse.down();
      await page.mouse.move(start + step, size.height * 0.55, { steps: 10 });
      await page.mouse.up();
      dx -= step;
    }
    await page.waitForTimeout(600);
    await page
      .getByRole('button', { name: /Open door to Web/ })
      .waitFor({ timeout: 10000 });
    await page.screenshot({ path: `${out}/${size.name}-door.png` });
    await page.getByRole('button', { name: /Open door to Web/ }).click();
    if (size.name === 'desktop') {
      await page.waitForFunction(
        () =>
          JSON.parse(document.querySelector('.room-canvas canvas').dataset.door)
            .opening,
      );
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/desktop-opening.png` });
      assert.ok(
        new URL(page.url()).pathname === '/',
        'door visibly opens before navigation',
      );
    }

    await page.waitForURL(/\/blog\/?$/, { timeout: 15000 });
    await page
      .getByRole('heading', { name: /All writing/ })
      .first()
      .waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page.screenshot({ path: `${out}/${size.name}-writing.png` });
    await page.locator('a[href="/blog/ppt-to-chinese/"]').first().click();
    await page.waitForURL(/ppt-to-chinese/);
    assert.match(await page.locator('article').innerText(), /MarkItDown/);
    await page.locator('.language-toggle').click();
    await page.waitForURL(/ppt-to-chinese\/zh\/?$/);
    assert.match(await page.locator('article').innerText(), /先提取/);
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
    results.push(
      size.name +
        ': visitor map, near-door prompt, opening transition, English Writing, new article and Chinese translation passed',
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(results.join('\n'));
} finally {
  await browser.close();
}
