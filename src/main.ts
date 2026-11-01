import Phaser from 'phaser';
import { TUNING } from './content/tuning';

class EmptyScene extends Phaser.Scene {
  constructor() {
    super('Empty');
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: TUNING.gameW,
  height: TUNING.gameH,
  backgroundColor: '#FFF4DC',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [EmptyScene],
});

export default game;
