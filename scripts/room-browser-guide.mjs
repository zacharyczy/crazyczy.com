export async function dismissRoomGuide(page) {
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByRole('heading', { name: /README/ }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.waitForTimeout(1000);
}
