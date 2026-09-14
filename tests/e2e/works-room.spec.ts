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
  await tabs.nth(1).click();
  await tabs.nth(2).click();
  await tabs.nth(3).click();

  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
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

test('does not raise page errors', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.reload();
  await page.getByRole('tab').nth(1).click();
  await page.waitForTimeout(650);
  expect(errors).toEqual([]);
});
