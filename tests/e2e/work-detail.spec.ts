import { expect, test } from '@playwright/test';

const works = [
  {
    slug: 'the-valley-of-almost-true-things',
    world: 'valley',
    title: 'The Valley of Almost True Things',
  },
  {
    slug: 'battle-for-christmas',
    world: 'christmas',
    title: 'The Battle for Christmas: Reign of the Nutcrackers',
  },
  {
    slug: 'escape-from-browns-island',
    world: 'island',
    title: 'Escape from Browns Island',
  },
  {
    slug: 'mitch-and-the-sand-bridge',
    world: 'sandbridge',
    title: 'The Wild Adventure of Mitch and the Sand Bridge',
  },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('announcement-shown', 'true'));
});

for (const work of works) {
  test(`${work.world} world keeps its complete story-page contract`, async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));
    await page.goto(`/works/${work.slug}`);

    const detail = page.locator('[data-work-page]');
    await expect(detail).toHaveAttribute('data-world', work.world);
    await expect(detail).toHaveAttribute('data-work-id', work.slug);
    await expect(page.getByRole('heading', { level: 1, name: work.title })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /About the Book/ })).toBeVisible();
    await expect(page.getByText('What Inspired This Story')).toBeVisible();
    await expect(page.getByRole('link', { name: /Buy Now on Amazon/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ready to Start Your Adventure?' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← Back to All Works' })).toBeVisible();

    const bookJsonLd = await page.locator('script[type="application/ld+json"]').evaluateAll(
      (scripts) => scripts
        .map((script) => JSON.parse(script.textContent || '{}'))
        .flatMap((value) => value['@graph'] ?? [])
        .find((entry) => entry['@type'] === 'Book'),
    );
    expect(bookJsonLd).toMatchObject({
      '@type': 'Book',
      name: work.title,
      inLanguage: 'en-US',
      author: { '@type': 'Organization', name: 'Siblings Write' },
    });

    await expect.poll(() => errors).toEqual([]);
  });

  test(`${work.world} world is still and usable with reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/works/${work.slug}`);
    const detail = page.locator('[data-work-page]');
    await detail.dispatchEvent('pointermove', {
      pointerType: 'mouse',
      clientX: 500,
      clientY: 300,
    });
    await page.waitForTimeout(40);

    const parallax = await detail.evaluate((element) => [
      element.style.getPropertyValue('--work-parallax-x'),
      element.style.getPropertyValue('--work-parallax-y'),
    ]);
    expect(parallax).toEqual(['', '']);
    await expect(page.getByRole('heading', { level: 1, name: work.title })).toBeVisible();
  });
}

test('Christmas exposes trailer and quiz capabilities only after activation', async ({ page }) => {
  await page.goto('/works/battle-for-christmas');
  const play = page.getByRole('button', {
    name: 'Play trailer for The Battle for Christmas: Reign of the Nutcrackers',
  });
  await expect(play).toHaveAttribute('data-trailer-id', 'QNtP_LRRNTM');
  await expect(page.locator('[data-trailer-player] iframe')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Take the Quiz/ })).toHaveAttribute(
    'href',
    '/works/battle-for-christmas/which-character-are-you',
  );

  await play.click();
  const trailer = page.locator('[data-trailer-player] iframe');
  await expect(trailer).toHaveAttribute('src', /controls=1/);
  await expect(trailer).toHaveAttribute('title', /trailer/i);
});

test('non-Christmas worlds do not expose the Christmas quiz', async ({ page }) => {
  for (const work of works.filter(({ world }) => world !== 'christmas')) {
    await page.goto(`/works/${work.slug}`);
    await expect(page.getByRole('link', { name: /Take the Quiz/ })).toHaveCount(0);
  }
});

test('immersive progress marker is scoped to work detail pages', async ({ page }) => {
  await page.goto('/works/escape-from-browns-island');
  await expect(page.locator('body')).toHaveAttribute('data-immersive-work', 'true');
  await expect(page.locator('.progress-sparkle')).toHaveText('◆');

  await page.goto('/blog');
  await expect(page.locator('body')).not.toHaveAttribute('data-immersive-work');
  await expect(page.locator('.progress-sparkle')).toHaveText('✨');
});
