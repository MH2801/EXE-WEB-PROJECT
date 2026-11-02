import type Phaser from 'phaser';
import { TUNING } from '../content/tuning';

const M = TUNING.music;
type WebSound = Phaser.Sound.WebAudioSound;

let game: Phaser.Game | null = null;
let wanted = false; // a tap asked for music
let loaded = false; // the file is decoded into the audio cache
let sound: WebSound | null = null; // the one copy, kept for the whole session
let ducks = 0; // lines being spoken now
let hushed = false;

/** Where the music should sit right now: silent beats quiet beats full. */
export const musicLevel = (lines: number, hush: boolean): number => (hush ? 0 : lines > 0 ? M.duckVolume : M.volume);

function apply(): void {
  if (!sound) return;
  const gain = sound.volumeNode.gain;
  const t = sound.volumeNode.context.currentTime; // the audio clock: it stops with a hidden tab, no timers
  gain.cancelScheduledValues(t);
  gain.setValueAtTime(gain.value, t);
  gain.linearRampToValueAtTime(musicLevel(ducks, hushed), t + M.fadeMs / 1000);
}

function play(): void {
  if (!game || !wanted || !loaded || sound) return;
  sound = game.sound.add('music', { loop: true, volume: 0 }) as WebSound;
  sound.play();
  apply();
}

/** Start the download (once, after the art has loaded). A slow or failed file only means no music. */
export function loadMusic(g: Phaser.Game): void {
  if (game || !('decodeAudio' in g.sound)) return; // shortcut: WebAudio only, no HTML5 fallback; upgrade if a target browser lacks it
  game = g;
  g.sound.once('decoded', () => {
    loaded = true;
    play(); // a tap came first
  });
  fetch(import.meta.env.BASE_URL + 'audio/music.mp3')
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`music ${r.status}`))))
    .then((buf) => (g.sound as Phaser.Sound.WebAudioSoundManager).decodeAudio('music', buf))
    .catch((e) => console.warn(e));
}

/** The first tap: the user gesture browsers need. Safe to call again. */
export function startMusic(g: Phaser.Game): void {
  const ctx = (g.sound as Phaser.Sound.WebAudioSoundManager).context;
  wanted = true;
  game ??= g;
  Promise.resolve(ctx?.resume()).catch(() => {}).then(play);
}

export function hushMusic(on: boolean): void {
  hushed = on;
  apply();
}

/** Lower the music until the line's promise ends (it always ends: spoken, skipped or at its deadline). */
export function duckWhile(line: Promise<void>): Promise<void> {
  ducks++;
  apply();
  return line.finally(() => {
    ducks--;
    apply();
  });
}
