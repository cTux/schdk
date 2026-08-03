import { expect, test, type Page } from '@playwright/test';

async function clearStoryEvents(page: Page) {
  await page.evaluate(() => {
    (
      window as typeof window & { __SCHDK_STORY_EVENTS__?: unknown[] }
    ).__SCHDK_STORY_EVENTS__ = [];
  });
}

async function storyEventCount(page: Page, prop: string) {
  return page.evaluate(
    (eventProp) =>
      (
        window as typeof window & {
          __SCHDK_STORY_EVENTS__?: { prop: string }[];
        }
      ).__SCHDK_STORY_EVENTS__?.filter(({ prop }) => prop === eventProp)
        .length ?? 0,
    prop,
  );
}

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

test('visual editor persists each pointer and keyboard gesture once', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=visual-editor-visualeditor--default&viewMode=story',
  );

  const question = page.locator('.visual-layout-question');
  const questionBounds = await question.boundingBox();
  expect(questionBounds).not.toBeNull();

  await clearStoryEvents(page);
  await page.mouse.move(
    questionBounds!.x + questionBounds!.width / 2,
    questionBounds!.y + questionBounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    questionBounds!.x + questionBounds!.width / 2 + 20,
    questionBounds!.y + questionBounds!.height / 2 + 10,
  );
  await page.mouse.up();
  await expect.poll(() => storyEventCount(page, 'onChange')).toBe(1);

  await question.click();
  const resizeHandle = question.locator(
    '.visual-layout-resize-edge.is-bottom-right',
  );
  const resizeBounds = await resizeHandle.boundingBox();
  expect(resizeBounds).not.toBeNull();
  await clearStoryEvents(page);
  await page.mouse.move(
    resizeBounds!.x + resizeBounds!.width / 2,
    resizeBounds!.y + resizeBounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(resizeBounds!.x + 20, resizeBounds!.y + 20);
  await page.mouse.up();
  await expect.poll(() => storyEventCount(page, 'onChange')).toBe(1);

  await clearStoryEvents(page);
  await question.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => storyEventCount(page, 'onChange')).toBe(1);
});

test('visual editor exposes history, template, image, and narrow-layout contracts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(
    '/iframe.html?id=visual-editor-visualeditor--default&viewMode=story',
  );

  const editor = page.locator('.visual-editor').last();
  await expect(editor).toBeVisible();
  await expect
    .poll(async () => (await editor.boundingBox())?.width ?? Infinity)
    .toBeLessThanOrEqual(320);

  await clearStoryEvents(page);
  await page.getByRole('button', { name: 'Скасувати останню зміну' }).click();
  await page.getByRole('button', { name: 'Повторити скасовану зміну' }).click();
  await page
    .getByRole('button', { name: 'Експортувати шаблон оформлення' })
    .click();
  await page.locator('input[accept^=".schdk-template"]').setInputFiles({
    name: 'layout.schdk-template',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  });
  await expect.poll(() => storyEventCount(page, 'onUndo')).toBe(1);
  await expect.poll(() => storyEventCount(page, 'onRedo')).toBe(1);
  await expect.poll(() => storyEventCount(page, 'onExportTemplate')).toBe(1);
  await expect.poll(() => storyEventCount(page, 'onImportTemplate')).toBe(1);

  await page.locator('.visual-editor-canvas').press('Escape');
  await page.getByRole('button', { name: 'Застосувати зображення' }).click();
  await page.locator('input[accept="image/*"]').setInputFiles({
    name: 'not-an-image.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });
  await expect(page.getByRole('alert')).toContainText(
    'Оберіть файл зображення',
  );
});
