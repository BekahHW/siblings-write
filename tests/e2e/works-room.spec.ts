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

test('keeps book semantics and presents metadata as a library record', async ({ page }) => {
  const spread = page.locator('.spread:not([hidden])');
  await expect(spread).toHaveAttribute('itemtype', 'https://schema.org/Book');
  await expect(spread.getByLabel('Library record 001')).toBeVisible();
  await expect(spread.getByText('001', { exact: true })).toBeVisible();
  await expect(spread.getByText('Accession', { exact: true })).toHaveCount(0);
  await expect(spread.getByText('The Ohio River Valley')).toBeVisible();
  await expect(spread.getByLabel("Librarian's note")).toBeVisible();
  await expect(spread.getByRole('link', { name: /Read more/ })).toBeVisible();
  await expect(spread.getByRole('link', { name: /Buy on Amazon/ })).toBeVisible();
});

test('uses the canonical works URL and marks works navigation current', async ({ page }) => {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.siblingswrite.com/works',
  );
  await expect(page.locator('.nav-links a[href="/works"]')).toHaveClass(/selected/);
});

test('remembers a visited work with a welcome and physical ribbon', async ({ page }) => {
  await page.goto('/works/escape-from-browns-island');
  await expect(page.locator('[data-work-id="escape-from-browns-island"]')).toBeVisible();
  await page.goto('/works');

  await expect(page.getByText('Welcome back. The library kept your place.')).toBeVisible();
  const visitedBook = page.locator('[data-book="escape-from-browns-island"]');
  await expect(visitedBook).toHaveAttribute('data-visited', 'true');
  await expect(visitedBook.locator('.visited-ribbon')).toBeVisible();
  await expect(page.locator('[data-book="battle-for-christmas"]')).not.toHaveAttribute('data-visited');
});

test('opens the concealed archive with Enter and Escape returns focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open the concealed tree archive' });
  const archive = page.locator('#tree-archive');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(archive).toBeVisible();
  await expect(archive.getByRole('heading')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(archive).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('closes the archive by button and remembers its discovery', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open the concealed tree archive' });
  await trigger.click();
  await page.getByRole('button', { name: 'Close the concealed archive' }).click();
  await expect(trigger).toBeFocused();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.tree-wrap')).toHaveAttribute('data-secret-discovered', 'true');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
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

test('navigates through the normal Read more anchor and restores shelf behavior on back', async ({ page }) => {
  const link = page.locator('.spread:not([hidden])').getByRole('link', { name: /Read more/ });
  await expect(link).toHaveAttribute('href', '/works/the-valley-of-almost-true-things');
  await link.click();
  await expect(page).toHaveURL(/\/works\/the-valley-of-almost-true-things$/);
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'The Valley of Almost True Things',
  })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/works$/);
  const tabs = page.getByRole('tab');
  await tabs.nth(2).click();
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#spread-escape-from-browns-island')).toBeVisible();
});

test('keeps touch targets comfortably operable', async ({ page }) => {
  const readMore = page.locator('.spread:not([hidden])').getByRole('link', { name: /Read more/ });
  const tab = page.getByRole('tab').first();
  const [linkBox, tabBox] = await Promise.all([readMore.boundingBox(), tab.boundingBox()]);
  expect(linkBox?.height).toBeGreaterThanOrEqual(44);
  expect(tabBox?.width).toBeGreaterThanOrEqual(44);
  expect(tabBox?.height).toBeGreaterThanOrEqual(44);
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
  await page.reload({ waitUntil: 'domcontentloaded' });

  const tabs = page.getByRole('tab');
  await tabs.nth(1).click();
  await expect(page.locator('[data-reader]')).not.toHaveClass(/is-turning/);
  await expect(page.locator('.spread:not([hidden])')).toHaveCount(1);
});

test('navigates immediately with reduced motion without departure effects', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const room = page.locator('.library');
  await page.locator('.spread:not([hidden])').getByRole('link', { name: /Read more/ }).click();
  await expect(page).toHaveURL(/\/works\/the-valley-of-almost-true-things$/);
  await expect(room).toHaveCount(0);
});

test('does not apply visitor parallax with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
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

test('does not raise page or console errors', async ({ page }) => {
  const errors: Error[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => errors.push(error));
  page.on('console', (message) => {
    if (
      message.type() === 'error'
      && message.text() !== 'requestStorageAccess: Permission denied.'
    ) consoleErrors.push(message.text());
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('tab').nth(1).click();
  await page.waitForTimeout(650);
  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
