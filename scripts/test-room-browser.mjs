// Start the local preview, then run: node scripts/test-room-browser.mjs
// One-time setup: npm install --prefix work/browser-tools playwright
import fs from 'node:fs';
const { chromium } = await import('../work/browser-tools/node_modules/playwright/index.mjs');
fs.mkdirSync('outputs/room-acceptance', { recursive: true });
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader']});
const errors=[];const results=[];
const sizes=[{name:'desktop',width:1440,height:1000},{name:'portrait',width:390,height:844},{name:'landscape',width:844,height:390}];
try {
for(const size of sizes){
 const context=await browser.newContext({viewport:size,hasTouch:size.name!=='desktop',isMobile:size.name!=='desktop',reducedMotion:'reduce'});
 await context.addInitScript(()=>{Math.random=()=>208.1/397;});
 const page=await context.newPage(); const cdp=await context.newCDPSession(page);page.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message);});
 await page.goto('http://localhost:3000/zh',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(8000);await page.getByRole('button',{name:'进来坐坐，抬头看看'}).click();
 const tvButton=page.getByRole('button',{name:'打开电视',exact:true});await tvButton.waitFor();
 await page.screenshot({path:`outputs/room-acceptance/${size.name}-overall.png`});
 await page.getByRole('button',{name:'沙发坐姿',exact:true}).click();await page.waitForTimeout(500);
 await page.screenshot({path:`outputs/room-acceptance/${size.name}-seated.png`});
 await tvButton.click();
 const region=page.getByRole('region',{name:'电视游戏机'});
 await region.locator('button').first().waitFor();await page.waitForTimeout(800);
 await page.screenshot({path:`outputs/room-acceptance/${size.name}-tv-menu.png`});
 const rect=await region.boundingBox();assert.ok(rect.x>=-1&&rect.y>=-1&&rect.x+rect.width<=size.width+1&&rect.y+rect.height<=size.height+1,'TV screen fits viewport');assert.ok(Math.abs(rect.width/rect.height-4/3)<.01,'TV 4:3 ratio');
 for(const game of ['snake','starflight']){
  console.log(size.name,game,'select'); await region.getByRole('button',{name:game==='snake'?/贪吃蛇/:/星际飞行/}).click();
  const stage=region.locator('.tv-game');await stage.waitFor();await page.waitForTimeout(400);
  const canvas=stage.locator('canvas');const box=await canvas.boundingBox();const ratio=game==='snake'?1:360/520;
  assert.ok(Math.abs(box.width/box.height-ratio)<.01,'native game aspect ratio');
  const actions=stage.locator('.game-actions button');
  await actions.first().click();await page.waitForTimeout(game==='snake'?210:800);
  await page.waitForFunction(()=>document.querySelector('.tv-game')?.dataset.running==='true');
  await actions.first().click();assert.equal(await stage.getAttribute('data-running'),'false','pause');
  const score=Number(await stage.locator('.game-status b').first().innerText());assert.ok(score>0,'earned real score');
  await page.screenshot({path:`outputs/room-acceptance/${size.name}-${game}.png`});
  await canvas.click();await page.keyboard.press('Enter');assert.ok(!(await page.locator('.home-experience').getAttribute('class')).includes('entered'),'Enter does not leave welcome');
  await page.mouse.wheel(0,600);await page.keyboard.press('w');await page.waitForTimeout(100);
  const locked=await region.boundingBox();assert.ok(Math.abs(locked.width-rect.width)<.1&&Math.abs(locked.x-rect.x)<.1,'room zoom/move locked');
  await page.keyboard.press('Escape');await region.getByRole('button',{name:/贪吃蛇/}).waitFor();
  assert.ok(Number(await page.evaluate(key=>localStorage.getItem(key),`crazyczy-${game}-best`))>=score,'exit stores highest score');
  await region.getByRole('button',{name:game==='snake'?/贪吃蛇/:/星际飞行/}).click();await stage.waitFor();
  await page.waitForFunction(value=>Number(document.querySelectorAll('.tv-game .game-status b')[1]?.textContent)>=value,score);
  await actions.first().click();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(150);assert.equal(await stage.getAttribute('data-running'),'false','blur pauses');
  if(game==='snake'){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2-45}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(80);assert.equal(await stage.getAttribute('data-running'),'true','swipe starts snake');
  } else {
    const left=await stage.getByRole('button',{name:'Left',exact:true}).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:left.x+left.width/2,y:left.y+left.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  }
  await canvas.dispatchEvent('pointercancel',{pointerId:7,pointerType:'touch'});await page.waitForTimeout(80);assert.equal(await stage.getAttribute('data-running'),'false','touch cancel pauses');
  console.log(size.name,game,'restart'); await actions.nth(1).click();assert.equal(await stage.locator('.game-status b').first().innerText(),'0','restart clears score');
  await region.getByRole('button',{name:/菜单/}).click();
 }
 await page.keyboard.press('Escape');await region.waitFor({state:'hidden'});await page.getByRole('button',{name:'起身 · 返回原视角'}).waitFor();
 await page.getByRole('button',{name:'起身 · 返回原视角'}).click();assert.equal(await page.getByRole('button',{name:'沙发坐姿',exact:true}).getAttribute('aria-pressed'),'false');
 results.push(`${size.name}: screen fit, game ratios, start/pause/restart, real scores/best storage, input isolation, blur/cancel, seat return passed`);console.log(results.at(-1));
 await context.close();
}
assert.deepEqual(errors,[]); fs.writeFileSync('outputs/room-acceptance/browser-results.json',JSON.stringify({date:new Date().toISOString(),sizes,results,errors},null,2)); console.log('ALL BROWSER CHECKS PASSED');
} finally {await browser.close();}
