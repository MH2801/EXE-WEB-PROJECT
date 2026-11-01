import Phaser from 'phaser';
import { TUNING } from './content/tuning';
import { Boot } from './scenes/Boot';
import { Memory } from './scenes/Memory';
import { Mission } from './scenes/Mission';
import { Parent } from './scenes/Parent';
import { Title } from './scenes/Title';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: TUNING.gameW,
  height: TUNING.gameH,
  backgroundColor: '#FFF4DC',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Title, Mission, Memory, Parent],
});

if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;

export default game;
