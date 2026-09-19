export async function dismissRoomGuide(page) {
  // The invitation is non-modal; open the manual explicitly for regression checks.
  await page
    .locator('.room-invitation')
    .waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => document.exitPointerLock());
  await page.locator('.room-manual-button').click();
  await page.getByRole('dialog', { name: 'README', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page
    .getByRole('dialog', { name: 'README', exact: true })
    .waitFor({ state: 'hidden' });
  const toggle = page.locator('.room-dock-toggle');
  if ((await toggle.getAttribute('aria-expanded')) === 'false')
    await toggle.click();
  await page.waitForTimeout(300);
}
