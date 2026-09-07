import { chromium } from '../work/browser-tools/node_modules/playwright/index.mjs';
import * as THREE from 'three';
import fs from 'node:fs';
import { dismissRoomGuide } from './room-browser-guide.mjs';
import assert from 'node:assert/strict';
const out = 'outputs/study-acceptance';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader'],
});
const results = [],
  errors = [];
const sizes = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'portrait', width: 390, height: 844 },
  { name: 'landscape', width: 844, height: 390 },
];
try {
  for (const size of sizes.filter(
    (s) => !process.env.STUDY_SIZE || s.name === process.env.STUDY_SIZE,
  )) {
    const context = await browser.newContext({
        viewport: size,
        reducedMotion: 'reduce',
        hasTouch: size.name !== 'desktop',
        isMobile: size.name !== 'desktop',
      }),
      page = await context.newPage();
    page.on('pageerror', (e) => {
      errors.push(e.message);
      console.log('PAGEERROR', e.message);
    });
    const notes = [];
    let offline = false;
    await page.route('**/api/suggestions', (route) => {
      if (offline) return route.abort();
      const req = route.request();
      if (req.method() === 'GET') return route.fulfill({ json: notes });
      const body = req.postDataJSON();
      if (body.kind === 'comment') {
        if (notes.length === 2)
          return route.fulfill({ status: 429, json: { error: 'limit' } });
        const note = {
          id: String(notes.length),
          name: 'Guest',
          text: body.text,
          score: 0,
          createdAt: Date.now(),
        };
        notes.unshift(note);
        return route.fulfill({ json: note });
      }
      const note = notes.find((n) => n.id === body.id);
      note.score += body.value;
      return route.fulfill({ json: note });
    });
    await page.goto('http://localhost:3000/zh', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(8500);
    await page.getByRole('button', { name: '进来坐坐，抬头看看' }).click();
    await dismissRoomGuide(page);
    if (size.name === 'desktop')
      await page
        .locator('.room-canvas canvas')
        .click({ position: { x: 700, y: 500 } });
    const canvas = page.locator('.room-canvas canvas'),
      pose = async () => JSON.parse(await canvas.getAttribute('data-pose'));
    if (size.name === 'desktop') {
      assert.equal(
        await page.evaluate(() => !!document.pointerLockElement),
        true,
        'real browser pointer lock acquired',
      );
      const before = await pose();
      await page.mouse.move(500, 400);
      await page.mouse.move(550, 410);
      await page.waitForTimeout(150);
      assert.notEqual(
        (await pose()).yaw,
        before.yaw,
        'locked mouse rotates without press',
      );
      const aimed = await pose();
      const target = new THREE.Vector3(
        0,
        1.3375 + 0.46 * Math.cos(0.18) + 0.024 * Math.sin(0.18),
        0.06 - 0.46 * Math.sin(0.18) + 0.024 * Math.cos(0.18),
      ).sub(new THREE.Vector3(aimed.x, aimed.y, aimed.z));
      const yaw = Math.atan2(-target.x, -target.z),
        pitch = Math.atan2(target.y, Math.hypot(target.x, target.z));
      await page.mouse.move(
        550 - (yaw - aimed.yaw) / 0.0025,
        410 - (pitch - aimed.pitch) / 0.0025,
      );
      await page.waitForTimeout(200);
      await page.keyboard.press('e');
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      assert.equal(
        await page.evaluate(() => !!document.pointerLockElement),
        false,
        'opening a physical object releases mouse',
      );
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      console.log(
        'pointer lock: acquired, moved, physical computer activated with E, returned',
      );
    }
    await page.getByRole('button', { name: '拖动', exact: true }).click();
    await page
      .getByRole('button', { name: '回到初始视角', exact: true })
      .click();
    if (size.name !== 'desktop') {
      const cdp = await context.newCDPSession(page);
      const stick = await page
        .getByRole('group', { name: '移动摇杆' })
        .boundingBox();
      const initial = await pose();
      const tx = stick.x + stick.width / 2,
        ty = stick.y + 12;
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: tx, y: ty }],
      });
      await page.waitForTimeout(280);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchCancel',
        touchPoints: [],
      });
      const walked = await pose();
      assert.ok(
        Math.hypot(walked.x - initial.x, walked.z - initial.z) > 0.03,
        'touch joystick walks',
      );
      await page.waitForTimeout(150);
      const stopped = await pose();
      assert.ok(
        Math.hypot(stopped.x - walked.x, stopped.z - walked.z) < 0.03,
        'touch cancellation stops movement',
      );
      await page
        .getByRole('button', { name: '回到初始视角', exact: true })
        .click();
    }
    await canvas.focus();
    await page.waitForTimeout(100);
    const home = await pose();
    await page.keyboard.press('c');
    await page.waitForTimeout(100);
    assert.equal((await pose()).y, 1.92);
    await page.keyboard.press('c');
    await page.waitForTimeout(100);
    assert.equal((await pose()).y, 2.7);
    await page.mouse.move(size.width * 0.7, size.height * 0.4);
    await page.mouse.down();
    await page.mouse.move(size.width * 0.7 + 60, size.height * 0.4 + 35, {
      steps: 8,
    });
    await page.mouse.up();
    await page.waitForTimeout(100);
    const turned = await pose();
    assert.ok(
      turned.yaw > home.yaw && turned.pitch > home.pitch,
      'right/down drag looks left/up',
    );
    assert.equal(turned.y, 2.7);
    await page.keyboard.down('w');
    await page.waitForTimeout(1500);
    await page.keyboard.up('w');
    assert.equal(
      (await pose()).y,
      2.7,
      'walking while looking up stays grounded',
    );
    await page.getByRole('button', { name: '回到初始视角' }).click();
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${out}/${size.name}-overall.png` });
    // Look toward the bookshelf using the same drag control used by visitors.
    if (size.name === 'desktop') {
      await page.mouse.move(550, 430);
      await page.mouse.down();
      await page.mouse.move(910, 430, { steps: 20 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/bookcase-wall.png` });
      await page.getByRole('button', { name: '回到初始视角' }).click();
    }
    const open = async (name) => {
      await page.getByRole('button', { name, exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });
      await page.waitForTimeout(180);
      const b = await dialog.boundingBox();
      assert.ok(
        b.x >= -1 &&
          b.y >= -1 &&
          b.x + b.width <= size.width + 1 &&
          b.y + b.height <= size.height + 1,
        `${name} fits ${size.name}: ${JSON.stringify(b)}`,
      );
      return dialog;
    };
    let dialog = await open('打开电脑');
    for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
    assert.equal(
      await page.evaluate(() => !!document.activeElement?.closest('dialog')),
      true,
      'focus stays in content',
    );
    const input = dialog.getByRole('textbox', { name: '输入命令' });
    await dialog.getByRole('button', { name: /Terminal/ }).click();
    await input.fill('whoami');
    await input.press('Enter');
    await dialog.getByText('Zachary Cheng / 程致远', { exact: true }).waitFor();
    await input.fill('draft-in-progress');
    await dialog.getByRole('button', { name: '— 最小化' }).click();
    await dialog.getByRole('button', { name: /Terminal/ }).click();
    assert.equal(await input.inputValue(), 'draft-in-progress');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    dialog = await open('打开电脑');
    assert.equal(await input.inputValue(), 'draft-in-progress');
    await input.fill('projects');
    await input.press('Enter');
    await dialog
      .getByRole('button', { name: '阅读项目文章 →' })
      .first()
      .click();
    await dialog.getByRole('button', { name: '← 返回目录' }).waitFor();
    await page.screenshot({ path: `${out}/${size.name}-computer-writing.png` });
    await dialog.getByRole('button', { name: /Terminal/ }).click();
    await input.fill('games');
    await input.press('Enter');
    await page.getByRole('region', { name: '电视游戏机' }).waitFor();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'visible' });
    await input.fill('about');
    await input.press('Enter');
    await dialog.getByText('Shanghai · UTC+8').waitFor();
    await dialog.getByRole('button', { name: /Terminal/ }).click();
    await input.fill('lang');
    await input.press('Enter');
    await dialog.getByRole('textbox', { name: 'Enter command' }).fill('help');
    await dialog.getByRole('textbox', { name: 'Enter command' }).press('Enter');
    assert.ok((await dialog.innerText()).includes('whoami'));
    await page.screenshot({ path: `${out}/${size.name}-terminal.png` });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    dialog = await open('阅读文稿');
    await dialog.getByRole('button', { name: '中文', exact: true }).click();
    await dialog.locator('.writing-row').first().click();
    await dialog.getByRole('button', { name: '← 返回目录' }).waitFor();
    await page.screenshot({ path: `${out}/${size.name}-paper.png` });
    await dialog.getByRole('button', { name: '← 返回目录' }).click();
    await dialog.getByRole('tab', { name: /随笔/ }).click();
    await dialog.getByRole('tab', { name: /诗歌/ }).click();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    dialog = await open('建议访客簿');
    const text = dialog.getByRole('textbox', { name: '写下一条建议…' });
    await text.fill('Local test only');
    await dialog.getByRole('button', { name: '留下', exact: true }).click();
    await dialog.getByText('Local test only', { exact: true }).waitFor();
    await dialog.getByRole('button', { name: 'Like', exact: true }).click();
    assert.equal(
      await dialog.locator('.visitor-notes strong').first().innerText(),
      '1',
    );
    await text.fill('Second local test');
    await dialog.getByRole('button', { name: '留下', exact: true }).click();
    await dialog.getByText('Second local test', { exact: true }).waitFor();
    await text.fill('Third');
    await dialog.getByRole('button', { name: '留下', exact: true }).click();
    await dialog
      .getByText('今天已经留下两条，明天再来吧。', { exact: true })
      .waitFor();
    offline = true;
    await text.fill('Retain after network error');
    await dialog.getByRole('button', { name: '留下', exact: true }).click();
    await dialog.getByText('建议暂时无法加载。', { exact: true }).waitFor();
    assert.equal(await text.inputValue(), 'Retain after network error');
    await page.screenshot({ path: `${out}/${size.name}-suggestions.png` });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: '足球战术板', exact: true }).click();
    await page.waitForTimeout(300);
    const camPose = await pose();
    const camera = new THREE.PerspectiveCamera(
      camPose.fov,
      size.width / size.height,
      0.05,
      150,
    );
    camera.position.set(camPose.x, camPose.y, camPose.z);
    camera.rotation.set(camPose.pitch, camPose.yaw, 0, 'YXZ');
    camera.updateMatrixWorld();
    const point = new THREE.Vector3(
      2.43 - 1.83 * 0.52,
      1.3195 + 0.159 * 0.52,
      0.5,
    ).project(camera);
    const x = ((point.x + 1) * size.width) / 2,
      y = ((1 - point.y) * size.height) / 2;
    const before = JSON.parse(await canvas.getAttribute('data-tokens'));
    if (size.name === 'desktop') {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 35, y + 20, { steps: 12 });
      await page.mouse.up();
    } else {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + 35, y: y + 20 }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    }
    await page.waitForTimeout(100);
    const after = JSON.parse(await canvas.getAttribute('data-tokens'));
    assert.ok(
      Math.abs(before[0].x - after[0].x) > 0.01 ||
        Math.abs(before[0].z - after[0].z) > 0.01,
      'magnet moves',
    );
    const afterPose = await pose();
    assert.ok(
      ['x', 'y', 'z', 'yaw', 'pitch', 'fov'].every(
        (k) => Math.abs(afterPose[k] - camPose[k]) < 1e-6,
      ),
      'magnet drag does not move camera',
    );
    await page.screenshot({ path: `${out}/${size.name}-tactics.png` });
    await page.getByRole('button', { name: '复位阵型' }).click();
    await page.waitForTimeout(100);
    assert.deepEqual(
      JSON.parse(await canvas.getAttribute('data-tokens')),
      before,
    );
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: '沙发坐姿' }).click();
    await page.waitForTimeout(200);
    assert.equal((await pose()).y, 1.92);
    await page.getByRole('button', { name: '打开电视', exact: true }).click();
    await page.getByRole('region', { name: '电视游戏机' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '起身 · 返回原视角' }).waitFor();
    await page.getByRole('button', { name: '起身 · 返回原视角' }).click();
    await page.waitForTimeout(200);
    const restored = await pose();
    assert.ok(
      Math.abs(restored.x - home.x) < 0.01 &&
        Math.abs(restored.z - home.z) < 0.01,
      'original room position restored',
    );
    assert.equal(new URL(page.url()).pathname, '/zh');
    results.push(
      size.name +
        ' passed: input, reading, computer/terminal state, nested TV, local suggestions, magnets, seat restore',
    );
    console.log(results.at(-1));
    await context.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + '/browser-results.json',
    JSON.stringify(
      { results, errors, date: new Date().toISOString() },
      null,
      2,
    ),
  );
  console.log('ALL STUDY BROWSER CHECKS PASSED');
} finally {
  await browser.close();
}
