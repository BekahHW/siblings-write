import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('Read more remains a functional normal link without JavaScript', async ({ page }) => {
  await page.goto('/works');

  const spread = page.locator('.spread:not([hidden])');
  const link = spread.getByRole('link', { name: /Read more/ });
  await expect(link).toHaveAttribute('href', '/works/the-valley-of-almost-true-things');
  await link.click();

  await expect(page).toHaveURL(/\/works\/the-valley-of-almost-true-things$/);
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'The Valley of Almost True Things',
  })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /About the Book/ })).toBeVisible();
});
