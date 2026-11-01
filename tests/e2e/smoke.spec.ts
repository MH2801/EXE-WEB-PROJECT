import { expect, test, type Page } from '@playwright/test';

type Pt = { x: number; y: number } | null;
const dtd = (page: Page, fn: string, arg?: string) =>
  page.evaluate(([f, a]) => (window as any).__dtd[f!](a), [fn, arg]);
const phase = (page: Page): Promise<string> => dtd(page, 'phase');
const point = (page: Page, name: string): Promise<Pt> => dtd(page, 'point', name);

async function waitFor(what: () => Promise<boolean>, tap?: () => Promise<void>) {
  await expect(async () => {
    if (await what()) return;
    await tap?.();
    throw new Error('not yet');
  }).toPass({ timeout: 60_000, intervals: [250] });
}
const click = async (page: Page, name: string) => {
  const p = await point(page, name);
  expect(p, name).not.toBeNull();
  await page.mouse.click(p!.x, p!.y);
};
const skip = (page: Page) => page.mouse.click(8, 8); // corner: skips a line, hits nothing

async function open(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/?day1=1');
  await waitFor(async () => (await phase(page)) === 'Title');
  await page.waitForTimeout(500);
  return errors;
}

/** Plays the correct route and returns at phase 'done'. `yes` is how Yes is tapped. */
async function playToDone(page: Page, shot?: (n: string) => Promise<unknown>, yes: 'click' | 'dblclick' = 'click') {
  await shot?.('1-title');
  await click(page, 'start');
  await waitFor(async () => (await phase(page)) === 'choosing', () => skip(page));
  await shot?.('2-market');
  await click(page, 'stall_apple');
  await waitFor(async () => (await phase(page)) === 'asking', () => skip(page));
  await shot?.('3-asking');
  await waitFor(async () => (await phase(page)) !== 'asking', async () => {
    const p = (await point(page, 'yes'))!;
    await (yes === 'click' ? page.mouse.click(p.x, p.y) : page.mouse.dblclick(p.x, p.y));
    await page.waitForTimeout(300);
  });
  await waitFor(async () => !!(await point(page, 'recall_apple')) && (await phase(page)) === 'recall', () => skip(page));
  await shot?.('4-recall');
  await page.waitForTimeout(400);
  await click(page, 'recall_apple');
  await waitFor(async () => (await phase(page)) === 'done', () => skip(page));
  await page.waitForTimeout(1500);
  await shot?.('5-memory');
}

test('happy path reaches memory', async ({ page }) => {
  const errors = await open(page);
  await playToDone(page, (n) => page.screenshot({ path: `build/shots/${n}.png` }));
  expect(await phase(page)).toBe('done');
  expect(errors).toEqual([]);
});

test('missing image still reaches title', async ({ page }) => {
  await page.route('**/mimi_happy.webp', (r) => r.abort());
  await open(page); // reaches Title despite the missing file
  await click(page, 'start');
  await waitFor(async () => (await phase(page)) !== 'Title'); // Start was clickable
});

test('missing or broken svg still reaches title', async ({ page }) => {
  await page.route('**/v2/mimi_idle.svg', (r) => r.abort());
  await page.route('**/v2/door.svg', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: 'not an svg' }));
  await open(page);
  const has = await page.evaluate(() => ['v2_mimi_idle', 'v2_door', 'v2_gate'].map((k) => (window as any).__game.textures.exists(k)));
  expect(has).toEqual([true, true, true]);
});

test('fonts that never arrive do not block entry', async ({ page }) => {
  await page.route('**/*.woff2', () => {}); // never answered
  await open(page);
});

test('fonts load before the first scene', async ({ page }) => {
  await open(page);
  const ok = await page.evaluate(() => [document.fonts.check("800 40px 'Baloo 2'", 'Aạ'), document.fonts.check("700 40px 'Nunito'", 'Aạ')]);
  expect(ok).toEqual([true, true]);
});

test('no external requests', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://localhost:5199') && !u.startsWith('data:') && !u.startsWith('blob:')) foreign.push(u);
  });
  await open(page);
  await playToDone(page);
  expect(foreign).toEqual([]);
});

test('portrait shows the rotate graphic and no text', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 });
  await open(page);
  const shown = await page.evaluate(() => {
    const g = (window as any).__game; // dev server only
    const list = g.scene.getScene('Title').children.list as { depth: number; visible: boolean; type: string }[];
    return { icon: list.some((o) => o.depth === 1000 && o.visible), text: list.some((o) => o.type === 'Text' && o.visible && o.depth >= 999) };
  });
  expect(shown).toEqual({ icon: true, text: false });
  expect(await page.evaluate(() => document.body.innerText.trim())).toBe('');
  await page.screenshot({ path: 'build/shots/portrait.png' });
});

test('reduced motion still plays through', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const errors = await open(page);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await playToDone(page);
  expect(await phase(page)).toBe('done');
  expect(errors).toEqual([]);
  await ctx.close();
});

test('double-click Yes counts once', async ({ browser }) => {
  const saves: string[] = [];
  for (const yes of ['click', 'dblclick'] as const) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    await open(page);
    await playToDone(page, undefined, yes);
    saves.push((await page.evaluate(() => localStorage.getItem('dtd.save.v1'))) ?? 'null');
    await ctx.close();
  }
  expect(saves[0]).not.toBe('null');
  expect(JSON.parse(saves[1]!)).toEqual(JSON.parse(saves[0]!));
});

for (const fruit of ['lemon', 'banana', 'grape', 'orange']) {
  for (const motion of ['no-preference', 'reduce'] as const) {
    test(`wrong fruit ${fruit} (${motion}) plays the joke and returns to choosing`, async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: motion, viewport: { width: 1280, height: 720 } });
      const page = await ctx.newPage();
      const errors = await open(page);
      await click(page, 'start');
      await waitFor(async () => (await phase(page)) === 'choosing', () => skip(page));
      await click(page, `stall_${fruit}`);
      await waitFor(async () => (await phase(page)) === 'asking', () => skip(page));
      await waitFor(async () => (await phase(page)) !== 'asking', async () => {
        const p = (await point(page, 'yes'))!;
        await page.mouse.click(p.x, p.y);
        await page.waitForTimeout(300);
      });
      await waitFor(async () => (await phase(page)) === 'choosing', () => skip(page));
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }
}
