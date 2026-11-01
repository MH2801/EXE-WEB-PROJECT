import Phaser from 'phaser';
import { TUNING } from './content/tuning';
import { Boot } from './scenes/Boot';
import { Home } from './scenes/Home';
import { Memory } from './scenes/Memory';
import { Mission } from './scenes/Mission';
import { Parent } from './scenes/Parent';
import { Title } from './scenes/Title';
import { Trip } from './scenes/Trip';
import { WordBook } from './scenes/WordBook';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: TUNING.gameW,
  height: TUNING.gameH,
  backgroundColor: '#FFF4DC',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Home, Title, Mission, Memory, Parent, WordBook, Trip],
});

if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;

if (import.meta.env.VITE_E2E === '1') {
  // Test hook for tests/e2e: phase and on-screen click points. Not in normal builds.
  type Pt = { x: number; y: number };
  type MissionView = { state?: { phase: string }; stalls?: { center(f: string): Pt }; recallObjs?: (Pt & { texture?: { key: string } })[] };
  type TripView = { state?: { phase: string }; rooms: { center(n: string): Pt | null }; cards: { center(w: string): Pt | null } };
  const trip = () => game.scene.getScene('Trip') as unknown as TripView;
  const mission = () => game.scene.getScene('Mission') as unknown as MissionView;
  const screen = (g: Pt): Pt => {
    const r = game.canvas.getBoundingClientRect();
    return { x: r.left + (g.x * r.width) / TUNING.gameW, y: r.top + (g.y * r.height) / TUNING.gameH };
  };
  (window as unknown as { __dtd: unknown }).__dtd = {
    // Mission phase once begun (Memory scene = mission done: core stays at memory_reveal after goMemory); before that, the scene key.
    phase: () => game.scene.isActive('Trip') ? (trip().state?.phase ?? 'Trip') : (game.scene.isActive('Memory') ? 'done' : mission().state?.phase) ?? game.scene.getScenes(true)[0]?.scene.key ?? 'none',
    point(name: string): Pt | null {
      if (name === 'go') return screen(TUNING.home.go);
      if (game.scene.isActive('Trip')) {
        const p = name.startsWith('card_') ? trip().cards.center(name.slice(5)) : trip().rooms.center(name);
        return p ? screen(p) : null;
      }
      if (name === 'start') return screen(TUNING.titleHits.start);
      if (name === 'yes') return screen(TUNING.yes);
      if (name === 'no') return screen(TUNING.no);
      if (name.startsWith('stall_')) return screen(mission().stalls!.center(name.slice(6)));
      if (name === 'recall_apple') {
        const o = mission().recallObjs?.find((x) => x.texture?.key === 'fruit_apple');
        return o ? screen(o) : null;
      }
      return null;
    },
  };
}

export default game;
