const { test, expect } = require('@playwright/test');
const { resetServer, login, CODE, waitForSave } = require('./helpers');

test('all graphic symbols exist and student-written emoji remain unchanged', async ({ page, request }) => {
  await resetServer(request, ['3E1']);
  await login(page, '3E1', 8);
  await page.click('#briefing button');
  const map = await page.evaluate(() => window.APP_CONFIG.UI_ICONS);
  const asset = await request.get('/' + map.file);
  expect(asset.ok()).toBe(true);
  const svg = await asset.text();
  for (const id of new Set(Object.values(map.symbols))) expect(svg).toContain(`id="${id}"`);
  await expect(page.locator('#howLink svg[data-icon="clipboard"]')).toBeVisible();
  await expect(page.locator('.status-pill.locked svg[data-icon="lock"]').first()).toBeVisible();

  await page.goto('/#level1');
  const answer = 'The staff smiled 😊 and explained the price <carefully>.';
  const box = page.locator('textarea[data-answer="s1.q1"]');
  await box.fill(answer);
  await page.locator('textarea[data-answer="s1.q2"]').fill('They did not listen.');
  await page.locator('textarea[data-answer="s1.q3"]').fill('Good service meets the customer needs.');
  await Promise.all([waitForSave(page), page.click('#submitL1')]);
  await page.click('#homeBtn');
  await page.goto('/#level1');
  await expect(box).toHaveValue(answer);
  await page.goto('/#teacher');
  await page.locator('#teacherCode').fill(CODE());
  await page.locator('#teacherEnter').click();
  await page.locator('.tab[data-tab="results"]').click();
  await page.locator('#resultsClass').selectOption('3E1');
  // A page-hide save is asynchronous; wait for the student row to be available.
  await expect(page.locator('.students-table tbody tr')).toHaveCount(1);
  await page.locator('.student-row').click();
  await expect(page.locator('.qa-a').first()).toHaveText(answer);
  await expect(page.locator('.qa-a').first().locator('svg')).toHaveCount(0);
});
