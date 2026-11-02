import { expect, test, type Page } from '@playwright/test';
import { TUNING } from '../../src/content/tuning';
import type { TripSave } from '../../src/core/tripSave';

const WORDS = ['apple', 'banana', 'orange', 'lemon', 'grape', 'red', 'yellow', 'green'];
const WAIT = 30_000; // the game clock runs late on a loaded machine: real-time limits are generous
const dtd = (page: Page, fn: string, arg?: string) => page.evaluate(([f, a]) => (window as any).__dtd[f!](a), [fn, arg]);
const phase = (page: Page): Promise<string> => dtd(page, 'phase');
const click = async (page: Page, name: string) => {
  const p = await dtd(page, 'point', name);
  if (p) await page.mouse.click(p.x, p.y);
  return !!p;
};
const idle = (page: Page) => page.waitForFunction(() => !(window as any).__game.scene.getScene('Trip').busy, null, { timeout: 20_000 }).catch(() => {});
const homeHands = (page: Page) =>
  page.evaluate(() => (window as any).__game.scene.getScene('Home').children.list.filter((o: any) => o.texture?.key === 'v2_hand').length);
const homeStars = (page: Page, depth: number) =>
  page.evaluate((d) => (window as any).__game.scene.getScene('Home').children.list.filter((o: any) => o.type === 'Star' && o.depth === d).length, depth);

/** A save: `trips` finished, `seen` taps counted. null = a fresh child (no save at all). */
const save = (trips: number, seen: TripSave['seen']): TripSave =>
  ({ brain: Object.fromEntries(WORDS.map((w) => [w, { state: w === 'apple' ? 'remembered' : 'unknown', notThis: [], learnedFrom: null, lastTrip: 0 }])), gears: 0, trips, helped: 0, viSubtitles: false, seen }) as unknown as TripSave;

/** Opens the landing, taps Play, waits for Home. The save is written once, so a reload keeps what the game wrote. */
async function toHome(page: Page, s: TripSave | null) {
  if (s) await page.addInitScript((v) => { if (!localStorage.getItem('dtd.keep')) { localStorage.setItem('dtd.save.v2', JSON.stringify(v)); localStorage.setItem('dtd.keep', '1'); } }, s);
  await page.goto('/?seed=7', { waitUntil: 'domcontentloaded' });
  await page.locator('#play').click();
  await page.waitForFunction(() => (window as any).__dtd.phase() === 'Home', null, { timeout: WAIT });
}

async function toFork(page: Page, s: TripSave | null) {
  await toHome(page, s);
  await page.waitForTimeout(500);
  await click(page, 'go');
  await expect.poll(() => phase(page), { timeout: WAIT }).toBe('fork');
  await idle(page);
}

test.describe('onboarding', () => {
  test.setTimeout(120_000);

  test('trip 1: only the "?" door is open; the safe door does nothing', async ({ page }) => {
    await toFork(page, null);
    await click(page, 'door_safe');
    await page.waitForTimeout(1000);
    expect(await phase(page)).toBe('fork');
    await click(page, 'door_mystery');
    await expect.poll(() => phase(page), { timeout: WAIT }).toBe('teach');
  });

  test('a returning child has both doors', async ({ page }) => {
    await toFork(page, save(1, {}));
    await click(page, 'door_safe');
    await expect.poll(() => phase(page), { timeout: WAIT }).not.toBe('fork');
  });

  test('idle on Go shows the hand; after learnAfter taps on Go it stays away', async ({ page, browser }) => {
    await toHome(page, null);
    const t0 = Date.now();
    await expect.poll(() => homeHands(page), { timeout: WAIT, intervals: [300] }).toBeGreaterThan(0);
    const took = Date.now() - t0;

    // Same wait on a child who already tapped Go learnAfter times: by the game clock, the hand timer would have fired by now.
    const other = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await toHome(other, save(1, { go: TUNING.onboarding.learnAfter }));
    const start = await other.evaluate(() => (window as any).__game.scene.getScene('Home').time.now);
    await other.waitForFunction(([from, ms]) => (window as any).__game.scene.getScene('Home').time.now - from > 2 * ms, [start, TUNING.onboarding.nudgeHandMs], { timeout: WAIT * 2 });
    await other.waitForTimeout(Math.max(took, 1000));
    expect(await homeHands(other)).toBe(0);
    await other.close();
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('Home shows a still star on Go, never the hand', async ({ page }) => {
      await toHome(page, null);
      await expect.poll(() => homeStars(page, TUNING.onboarding.hand.depth), { timeout: WAIT, intervals: [300] }).toBeGreaterThan(0);
      expect(await homeHands(page)).toBe(0);
      // the star is not animated
      expect(await page.evaluate((d) => (window as any).__game.scene.getScene('Home').tweens.getTweens().some((t: any) => t.targets.some((o: any) => o.depth === d)), TUNING.onboarding.hand.depth)).toBe(false);
    });
  });
});
