import { expect, test, type Page } from '@playwright/test';
import { TUNING } from '../../src/content/tuning';

const dtd = (page: Page, fn: string) => page.evaluate((f) => (window as any).__dtd[f](), fn);
const phase = (page: Page): Promise<string> => dtd(page, 'phase');
const SKY = 'rgb(191, 230, 255)';

test.describe('landing', () => {
  test('paints first on sky, buttons appear when loading ends, no external requests', async ({ page }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await page.route('**/assets/bg_title.webp', async (route) => { // slow, so the loading state can be seen
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#landing')).toBeVisible();
    await expect(page.locator('#bar')).toBeVisible();
    await expect(page.locator('#play')).toBeHidden(); // a child never sees a disabled button
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(SKY);
    expect(await page.evaluate(() => (window as any).__game.config.backgroundColor.color)).toBe(0xbfe6ff); // no brown between scenes
    await expect(page.locator('#play')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#words')).toBeVisible();
    await expect(page.locator('#lock')).toBeVisible();
    expect(urls.filter((u) => !u.startsWith('http://localhost:5199/') && !u.startsWith('data:') && !u.startsWith('blob:'))).toEqual([]);
  });

  for (const [id, scene] of [['#play', 'Home'], ['#words', 'WordBook'], ['#lock', 'Parent']] as const) {
    test(`${id} reaches ${scene} once; a second tap on Go's corner does nothing`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => { (window as any).starts = 0; (window as any).__game.scene.getScene('Home').events.on('create', () => (window as any).starts++); });
      const go = await page.evaluate(() => (window as any).__dtd.point('go')); // before the tap: a slow machine must not stretch the child's 150 ms
      await page.locator(id).click();
      await page.waitForTimeout(150); // a child's second tap, aimed at where Go will be
      await page.mouse.click(go.x, go.y);
      await page.waitForTimeout(TUNING.landing.settleMs + 600);
      expect(await page.evaluate(() => (window as any).__game.scene.getScenes(true).map((s: any) => s.scene.key))).toEqual([scene]);
      if (scene === 'Home') expect(await page.evaluate(() => (window as any).starts)).toBe(1);
      await expect(page.locator('#landing')).toHaveCount(0);
    });
  }

  test('Parents opened from the landing goes back to Home', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lock').click();
    await expect.poll(() => page.evaluate(() => (window as any).__game.scene.isActive('Parent'))).toBe(true);
    expect(await page.evaluate(() => (window as any).__game.scene.getScene('Parent').from)).toBe('Home');
  });

  test('a hung asset and blocked fonts: buttons still appear by maxWaitMs', async ({ page }) => {
    await page.route('**/fonts/**', (route) => route.abort());
    await page.route('**/assets/mom.webp', () => {}); // never answered
    await page.goto('/');
    const t0 = Date.now();
    await expect(page.locator('#play')).toBeHidden();
    await expect(page.locator('#play')).toBeVisible({ timeout: TUNING.landing.maxWaitMs + 4000 });
    expect(Date.now() - t0).toBeLessThan(TUNING.landing.maxWaitMs + 3000);
    await page.locator('#play').click();
    await expect.poll(() => phase(page), { timeout: 15_000 }).toBe('Home');
  });

  test('every asset request hangs: Play still reaches Home in bounded time', async ({ page }) => {
    await page.route('**/assets/**', () => {});
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#play')).toBeVisible({ timeout: TUNING.landing.maxWaitMs + 4000 });
    await page.locator('#play').click();
    await expect.poll(() => phase(page), { timeout: TUNING.fontWaitMs + 8000 }).toBe('Home');
  });

  test('a tapped button shows its pressed state at once', async ({ page }) => {
    await page.goto('/');
    const b = await page.locator('#play').boundingBox();
    await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2);
    await page.mouse.down();
    await expect(page.locator('#play')).toHaveClass(/pressed/, { timeout: 500 });
    await expect(page.locator('#words')).not.toHaveClass(/pressed/);
    await page.mouse.up();
  });

  test('Mimi bobs again after her wave', async ({ page }) => {
    await page.goto('/');
    await page.locator('#mimi').click({ force: true }); // it bobs, so it is never "stable"
    await expect(page.locator('#mimi')).not.toHaveClass(/wave/, { timeout: 3000 });
  });

  test('music starts on Play as one looping sound, and a repeat tap adds no second copy', async ({ page }) => {
    await page.goto('/');
    await page.locator('#play').click();
    const music = () => page.evaluate(() => (window as any).__game.sound.getAll('music').map((m: any) => m.isPlaying && m.loop));
    await expect.poll(music, { timeout: 15_000 }).toEqual([true]);
    await page.waitForTimeout(500);
    expect(await music()).toEqual([true]);
  });

  test('a missing music file changes nothing but the music', async ({ page }) => {
    await page.route('**/audio/music.mp3', (route) => route.abort());
    await page.goto('/');
    await page.locator('#play').click();
    await expect.poll(() => phase(page), { timeout: 15_000 }).toBe('Home');
    expect(await page.evaluate(() => (window as any).__game.sound.getAll('music').length)).toBe(0);
  });

  test('?day1=1 has no landing and starts Title', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/?day1=1');
    await expect(page.locator('#landing')).toHaveCount(0);
    await expect.poll(() => phase(page), { timeout: 30_000 }).toBe('Title');
    expect(requests.filter((u) => u.includes('music.mp3'))).toEqual([]);
    expect(await page.evaluate(() => (window as any).__game.sound.getAll('music').length)).toBe(0);
  });
});
