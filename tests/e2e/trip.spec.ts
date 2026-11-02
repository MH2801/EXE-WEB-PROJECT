import { expect, test, type Page } from '@playwright/test';
import { TUNING } from '../../src/content/tuning';
import { PARENT } from '../../src/content/lines';
import { buildTripReport } from '../../src/core/report';
import type { TripSave } from '../../src/core/tripSave';

const WORDS = ['apple', 'banana', 'orange', 'lemon', 'grape', 'red', 'yellow', 'green'];
const ANSWER: Record<string, string> = { apple: 'apple', banana: 'banana', orange: 'orange', lemon: 'lemon', grape: 'grape', red: 'apple', yellow: 'banana', green: 'grape' };
const SEED = 7; // with this seed every pattern below reaches the rooms its test names
const FIVE = ['apple', 'banana', 'orange', 'lemon', 'grape'];
const TRIP_MS = 240_000;

type Pt = { x: number; y: number } | null;
type S = { phase: string; room: { word: string }; teach: { word: string; stalls: string[]; marked: string[] } | null; hand: string[]; battery: number; brain: Record<string, { state: string }>; pattern: string; summary: { outcome: string } | null };
type Hooks = Partial<Record<string, () => Promise<void>>>;

const dtd = (page: Page, fn: string, arg?: string) => page.evaluate(([f, a]) => (window as any).__dtd[f!](a), [fn, arg]);
const phase = (page: Page): Promise<string> => dtd(page, 'phase');
const point = (page: Page, name: string): Promise<Pt> => dtd(page, 'point', name);
const click = async (page: Page, name: string) => {
  const p = await point(page, name);
  if (p) await page.mouse.click(p.x, p.y);
  return !!p;
};
const st = (page: Page): Promise<S | null> =>
  page.evaluate(() => {
    const s = (window as any).__game.scene.getScene('Trip').state;
    return s ? { phase: s.phase, room: s.trip.rooms[s.room], teach: s.teach, hand: s.hand, battery: s.battery, brain: s.brain, pattern: s.trip.pattern, summary: s.summary } : null;
  });
const idle = (page: Page) => page.waitForFunction(() => !(window as any).__game.scene.getScene('Trip').busy, null, { timeout: 20_000 }).catch(() => {});
const readSave = (page: Page): Promise<TripSave> => page.evaluate(() => JSON.parse(localStorage.getItem('dtd.save.v2')!));
const states = (save: TripSave): Record<string, string> => Object.fromEntries(Object.entries(save.brain).map(([w, r]) => [w, r.state]));

const mkSave = (known: string[], over: Partial<TripSave> = {}): TripSave =>
  ({
    brain: Object.fromEntries(WORDS.map((w) => [w, { state: known.includes(w) ? 'remembered' : 'unknown', notThis: [], learnedFrom: null, lastTrip: 0 }])),
    gears: 0, trips: 1, helped: 0, viSubtitles: false, ...over,
  }) as TripSave;

async function waitFor(what: () => Promise<boolean>, ms = 30_000) {
  await expect(async () => expect(await what()).toBe(true)).toPass({ timeout: ms, intervals: [200] });
}

/** Opens Home (not Day 1). `save` is written once, so a reload keeps whatever the game wrote since. */
async function open(page: Page, save: TripSave | null, query = `seed=${SEED}`) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  if (save) {
    await page.addInitScript((s) => {
      if (!localStorage.getItem('dtd.keep')) {
        localStorage.setItem('dtd.save.v2', JSON.stringify(s));
        localStorage.setItem('dtd.keep', '1');
      }
    }, save);
  }
  await page.goto(`/?${query}`);
  await waitFor(async () => (await phase(page)) === 'Home');
  await page.waitForTimeout(500);
  return errors;
}

async function goTrip(page: Page) {
  await click(page, 'go');
  await page.waitForFunction(() => (window as any).__dtd.phase() !== 'Home', null, { timeout: 15_000 });
}

type Drive = { door?: 'safe' | 'mystery'; teach?: 'right' | 'wrong'; wrong?: number; until?: string; first?: Hooks };

/** Starts a trip from Home and plays it. Returns the phases seen, in order. `first` hooks run once, when a phase is first seen (the room entry is still running). */
async function drive(page: Page, o: Drive = {}): Promise<string[]> {
  const seen: string[] = [];
  const hooks = { ...o.first };
  let wrong = 0;
  let teachWrong = o.teach === 'wrong';
  await goTrip(page);
  for (const t0 = Date.now(); Date.now() - t0 < TRIP_MS - 20_000; ) {
    const p = await phase(page);
    if (seen.at(-1) !== p) seen.push(p);
    if (p === o.until || p === 'Home') break;
    const s = p === 'Boot' || p === 'none' ? null : await st(page);
    if (!s) { await page.waitForTimeout(200); continue; }
    const hook = hooks[p];
    if (hook) { delete hooks[p]; await hook(); }
    if (p === 'fork') { await idle(page); await click(page, `door_${o.door ?? 'mystery'}`); }
    else if (p === 'chest') { await idle(page); await click(page, 'chest'); }
    else if (p === 'asking') { await idle(page); await click(page, 'yes'); }
    else if (p === 'teach') {
      await idle(page);
      const t = (await st(page))?.teach;
      if (!t) continue;
      const live = t.stalls.filter((f) => !t.marked.includes(f));
      const bad = live.find((f) => f !== ANSWER[t.word]);
      const useBad = teachWrong && !!bad;
      teachWrong = false;
      await click(page, `stall_${useBad ? bad : ANSWER[t.word]}`);
    } else if (p === 'gate' || p === 'robot') {
      await idle(page);
      const c = await st(page);
      if (c?.phase === p && c.hand.length) {
        const bad = c.hand.find((w) => w !== c.room.word);
        const useBad = !!bad && wrong < (o.wrong ?? 0);
        if (useBad) wrong++;
        await click(page, `card_${useBad ? bad : c.room.word}`);
      }
    } else if (!['travel', 'stall', 'believed', 'cashier', 'asleep', 'end'].includes(p)) await page.mouse.click(8, 8); // intro lines: skip
    await page.waitForTimeout(150);
  }
  return seen;
}

/** Window i is lit when its second graphic is opaque. */
const lit = (page: Page): Promise<boolean[]> =>
  page.evaluate((ws) => {
    const sc = (window as any).__game.scene.getScene('Home');
    return ws.map((w) => sc.children.list.find((o: any) => o.type === 'Container' && o.x === w.x && o.y === w.y)?.list[1].alpha === 1);
  }, TUNING.home.windows);
const remembered = (save: TripSave) => WORDS.map((w) => ['remembered', 'strong'].includes(states(save)[w]!));

/** The windows follow the save. A new word lights after the first-light delay, so this polls. */
async function expectWindowsMatchSave(page: Page) {
  const save = await readSave(page);
  await expect.poll(() => lit(page), { timeout: 15_000 }).toEqual(remembered(save));
}

test.describe('trips', () => {
  test.setTimeout(TRIP_MS);

  test('home to trip to home', async ({ page }) => {
    const errors = await open(page, mkSave(['apple']));
    const seen = await drive(page);
    expect(seen).toContain('cashier');
    expect(await phase(page)).toBe('Home');
    const save = await readSave(page);
    expect(save.trips).toBe(2);
    expect(Object.values(states(save)).filter((s) => s === 'remembered')).toHaveLength(2); // apple plus the new word
    await expectWindowsMatchSave(page);
    expect(errors).toEqual([]);
  });

  test('empty battery', async ({ page }) => {
    const errors = await open(page, mkSave(FIVE));
    let end: S | null = null;
    const seen = await drive(page, { wrong: 9, first: { asleep: async () => void (end = await st(page)) } });
    expect(seen).toContain('asleep');
    expect(end).toMatchObject({ battery: 0, summary: { outcome: 'asleep' } });
    expect(await phase(page)).toBe('Home');
    const save = await readSave(page);
    for (const w of FIVE) expect(states(save)[w]).toBe('remembered'); // sleep costs no word
    await expectWindowsMatchSave(page);
    expect(errors).toEqual([]);
  });

  test('reload mid trip', async ({ page }) => {
    const errors = await open(page, mkSave(['apple']));
    const seen = await drive(page, { until: 'believed' });
    expect(seen.at(-1)).toBe('believed');
    expect(Object.values((await st(page))!.brain).some((r) => r.state === 'believed')).toBe(true);
    await page.reload();
    await waitFor(async () => (await phase(page)) === 'Home');
    const save = await readSave(page);
    expect(save.trips).toBe(1); // nothing was written
    expect(Object.values(states(save))).not.toContain('believed');
    await page.waitForTimeout(500);
    await goTrip(page);
    await waitFor(async () => !!(await st(page)));
    expect(Object.values((await st(page))!.brain).map((r) => r.state)).not.toContain('believed');
    expect(errors).toEqual([]);
  });

  test('tap storm', async ({ page }) => {
    const errors = await open(page, mkSave(FIVE));
    const storm: Hooks = {
      fork: async () => {
        // Hammer the door until the room moves on: it opens once and lands on the teach room, no stall touched.
        for (let i = 0; i < 40 && (await phase(page)) === 'fork'; i++) await click(page, 'door_mystery');
        await idle(page);
        expect(await st(page)).toMatchObject({ phase: 'teach', teach: { marked: [] } });
      },
      asking: async () => {
        await idle(page);
        for (let i = 0; i < 10; i++) await click(page, 'yes');
        await idle(page);
        expect((await st(page))!.phase).not.toBe('asking');
      },
      robot: async () => {
        // R22: taps during the robot's opening line hold one tap; one bar and one card go, not more.
        const s0 = (await st(page))!;
        const bad = s0.hand.find((w) => w !== s0.room.word)!;
        // The card slides in from below the screen: wait until it stands still and is on screen, or the clicks land off the canvas.
        const last: { p: Pt } = { p: null };
        await expect.poll(async () => {
          const q = await point(page, `card_${bad}`);
          const same = !!q && !!last.p && q.x === last.p.x && q.y === last.p.y && q.y < page.viewportSize()!.height;
          last.p = q;
          return same;
        }, { intervals: [120] }).toBe(true);
        for (let i = 0; i < 15; i++) await page.mouse.click(last.p!.x, last.p!.y);
        await idle(page);
        const s1 = (await st(page))!;
        expect(s1.battery).toBe(s0.battery - 1);
        expect(s1.hand).toEqual(s0.hand.filter((w) => w !== bad));
      },
    };
    await drive(page, { first: storm });
    expect(await phase(page)).toBe('Home');
    const save = await readSave(page);
    expect(save.trips).toBe(2); // the trip counts once
    expect(save.helped).toBe(0);
    expect(errors).toEqual([]);
  });

  test('no voice', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }));
    const errors = await open(page, mkSave(['apple']));
    expect(await page.evaluate(() => typeof speechSynthesis)).toBe('undefined');
    const seen = await drive(page);
    expect(seen).toContain('cashier');
    expect((await readSave(page)).trips).toBe(2);
    expect(errors).toEqual([]);
  });

  test('no external requests', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith('http://localhost:5199') && !u.startsWith('data:') && !u.startsWith('blob:')) foreign.push(u);
    });
    await open(page, mkSave(['apple']));
    await drive(page);
    expect(foreign).toEqual([]);
  });

  test('reduced motion plays teach, gate and robot', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    const errors = await open(page, mkSave(['apple', 'banana', 'orange']));
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    const seen = await drive(page, { wrong: 1 });
    for (const p of ['teach', 'gate', 'robot']) expect(seen).toContain(p);
    expect(await phase(page)).toBe('Home');
    expect((await readSave(page)).trips).toBe(2);
    expect(errors).toEqual([]);
    await ctx.close();
  });

  test('blocked localStorage: the trip finishes and the window lights', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError'); } }));
    const errors = await open(page, null);
    const seen = await drive(page);
    expect(seen).toContain('cashier');
    expect(await phase(page)).toBe('Home');
    await expect.poll(async () => (await lit(page)).filter(Boolean).length, { timeout: 15_000 }).toBe(2); // apple plus the new word, kept in memory
    expect(errors).toEqual([]);
  });
});

test.describe('parent area and subtitles', () => {
  test('lock, gate, report rows, subtitle switch, Vietnamese in a trip', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = await open(page, mkSave(['apple', 'banana']));
    const gameClick = async (x: number, y: number) => {
      const r = await page.evaluate(() => { const b = (window as any).__game.canvas.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; });
      await page.mouse.click(r.l + (x * r.w) / TUNING.gameW, r.t + (y * r.h) / TUNING.gameH);
    };
    const texts = (scene: string): Promise<{ text: string; x: number; y: number }[]> =>
      page.evaluate((key) => {
        const out: any[] = [];
        const walk = (l: any[]) => l.forEach((o) => { if (o.type === 'Text') out.push({ text: o.text, x: o.x, y: o.y }); else if (o.list) walk(o.list); });
        walk((window as any).__game.scene.getScene(key).children.list);
        return out;
      }, scene);

    await click(page, 'lock');
    await waitFor(async () => (await phase(page)) === 'Parent');
    const answers = async () => {
      const t = await texts('Parent');
      const [a, b] = t.find((x) => x.text.includes('×'))!.text.match(/\d+/g)!.map(Number);
      const row = t.filter((x) => x.y === TUNING.parent.gateY);
      return { right: row.find((x) => x.text === String(a! * b!))!, wrong: row.find((x) => x.text !== String(a! * b!))! };
    };
    const w = (await answers()).wrong; // a wrong answer is silent: a new question, still locked
    await gameClick(w.x, w.y);
    await page.waitForTimeout(300);
    expect((await texts('Parent')).some((x) => x.text === PARENT.title)).toBe(false);
    const r = (await answers()).right;
    await gameClick(r.x, r.y);
    await waitFor(async () => (await texts('Parent')).some((x) => x.text === PARENT.title));
    const shown = (await texts('Parent')).map((x) => x.text);
    for (const row of buildTripReport(mkSave(['apple', 'banana']))) {
      expect(shown).toContain(row.label);
      expect(shown).toContain(row.value);
    }
    expect(shown).toContain(PARENT.subOff);

    await gameClick(TUNING.parent.toggle.x, TUNING.parent.toggle.y);
    await waitFor(async () => (await readSave(page)).viSubtitles === true);
    expect(states(await readSave(page))).toEqual(states(mkSave(['apple', 'banana']))); // the switch touches nothing else
    await gameClick(TUNING.parent.back.x, TUNING.parent.back.y);
    await waitFor(async () => (await phase(page)) === 'Home');
    await page.waitForTimeout(500);
    await goTrip(page);
    const vi = /[ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i;
    await expect.poll(async () => (await texts('Trip')).some((x) => vi.test(x.text)), { timeout: 30_000 }).toBe(true);
    expect(errors).toEqual([]);
  });
});

test.describe('loading and layout', () => {
  test('portrait shows the rotate graphic and no text', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    await open(page, mkSave(['apple']));
    const shown = await page.evaluate(() => {
      const list = (window as any).__game.scene.getScene('Home').children.list as { depth: number; visible: boolean; type: string }[];
      return { icon: list.some((o) => o.depth === 1000 && o.visible), text: list.some((o) => o.type === 'Text' && o.visible && o.depth >= 999) };
    });
    expect(shown).toEqual({ icon: true, text: false });
    expect(await page.evaluate(() => document.body.innerText.trim())).toBe('');
  });

  test('missing svg: Home still loads', async ({ page }) => {
    await page.route('**/v2/home.svg', (r) => r.abort());
    await page.route('**/v2/door.svg', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: 'not an svg' }));
    await open(page, mkSave(['apple']));
    expect(await page.evaluate(() => ['v2_home', 'v2_door'].map((k) => (window as any).__game.textures.exists(k)))).toEqual([true, true]);
    await goTrip(page); // the trip scene starts too
  });

  test('font timeout: Home still loads', async ({ page }) => {
    await page.route('**/*.woff2', () => {}); // never answered
    await open(page, mkSave(['apple']));
  });
});
