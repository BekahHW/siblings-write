import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('announcement-shown', 'true');
  });
  await page.goto('/works');
});

test('renders the library and a single open story', async ({ page }) => {
  await expect(page.locator('.library')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(page.locator('.spread:not([hidden])')).toHaveCount(1);
});

test('passes every work world into the shelf and initial room state', async ({ page }) => {
  await expect(page.locator('.library')).toHaveAttribute('data-world', 'valley');
  await expect(page.getByRole('tab')).toHaveCount(4);
  await expect(page.getByRole('tab').nth(0)).toHaveAttribute('data-world', 'valley');
  await expect(page.getByRole('tab').nth(1)).toHaveAttribute('data-world', 'christmas');
  await expect(page.getByRole('tab').nth(2)).toHaveAttribute('data-world', 'island');
  await expect(page.getByRole('tab').nth(3)).toHaveAttribute('data-world', 'sandbridge');
});

test('delays hover and focus previews on fine pointers', async ({ page }) => {
  test.skip(
    !(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)),
    'Fine pointer behavior',
  );

  const room = page.locator('.library');
  const tabs = page.getByRole('tab');
  const worldImmediatelyAfterEntry = await tabs.nth(1).evaluate((element) => {
    element.dispatchEvent(new PointerEvent('pointerenter', {
      bubbles: false,
      pointerType: 'mouse',
    }));
    return document.querySelector<HTMLElement>('.library')?.dataset.world;
  });
  expect(worldImmediatelyAfterEntry).toBe('valley');
  await expect(room).toHaveAttribute('data-world', 'christmas');
  await expect(room).toHaveAttribute('data-library-state', 'preview');

  await tabs.nth(1).evaluate((element) => {
    element.dispatchEvent(new PointerEvent('pointerleave', {
      bubbles: false,
      pointerType: 'mouse',
    }));
  });
  await expect(room).toHaveAttribute('data-world', 'valley');

  await tabs.nth(2).focus();
  await expect(room).toHaveAttribute('data-world', 'island');
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
});

test('touch pointer entry does not preview a world', async ({ page }) => {
  const room = page.locator('.library');
  await page.getByRole('tab').nth(1).evaluate((element) => {
    element.dispatchEvent(new PointerEvent('pointerenter', {
      bubbles: false,
      pointerType: 'touch',
    }));
  });
  await page.waitForTimeout(260);
  await expect(room).toHaveAttribute('data-world', 'valley');
  await expect(room).toHaveAttribute('data-library-state', 'committed');
});

test('supports keyboard shelf navigation', async ({ page }) => {
  const tabs = page.getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');

  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  const panelId = await tabs.nth(1).getAttribute('aria-controls');
  await expect(page.locator(`#${panelId}`)).toBeVisible();
  await expect(page.locator('.spread:not([hidden])')).toHaveCount(1);
});

test('settles rapid book switching on the last selection', async ({ page }) => {
  const tabs = page.getByRole('tab');
  const room = page.locator('.library');
  await tabs.nth(1).click();
  await tabs.nth(2).click();
  await tabs.nth(3).click();

  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
  await expect(room).not.toHaveAttribute('data-world', '');
  await expect(room).toHaveAttribute('data-world', 'sandbridge');
  await expect(room).toHaveAttribute('data-committed-world', 'sandbridge');
  await expect(room).toHaveAttribute('data-library-state', 'committed');
  const panelId = await tabs.nth(3).getAttribute('aria-controls');
  await expect(page.locator(`#${panelId}`)).toBeVisible();
  await expect(page.locator('.spread:not([hidden])')).toHaveCount(1);
});

test('uses the non-animated path with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const tabs = page.getByRole('tab');
  await tabs.nth(1).click();
  await expect(page.locator('[data-reader]')).not.toHaveClass(/is-turning/);
  await expect(page.locator('.spread:not([hidden])')).toHaveCount(1);
});

test('does not apply visitor parallax with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const room = page.locator('.library');

  await room.dispatchEvent('pointermove', {
    pointerType: 'mouse',
    clientX: 600,
    clientY: 300,
  });
  await page.waitForTimeout(40);

  const values = await room.evaluate((element) => [
    element.style.getPropertyValue('--visitor-x'),
    element.style.getPropertyValue('--visitor-y'),
  ]);
  expect(values).toEqual(['', '']);
});

test('does not raise page errors', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.reload();
  await page.getByRole('tab').nth(1).click();
  await page.waitForTimeout(650);
  expect(errors).toEqual([]);
});
