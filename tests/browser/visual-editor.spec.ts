import { expect, test } from '@playwright/test';

test('visual editor supports selection, keyboard escape, and zoom', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=visual-editor-visualeditor--default&viewMode=story',
  );

  const canvas = page.locator('.visual-editor-canvas');
  const question = page.locator('.visual-layout-question');
  await expect(canvas).toBeVisible();
  await question.click();
  await expect(question).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.visual-editor-toolbar')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(question).toHaveAttribute('aria-pressed', 'false');

  const transform = await canvas.evaluate((element) => element.style.transform);
  await page.locator('.visual-editor-workspace').hover();
  await page.mouse.wheel(0, -100);
  await expect
    .poll(() => canvas.evaluate((element) => element.style.transform))
    .not.toBe(transform);
});
