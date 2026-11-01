import Phaser from 'phaser';

class EmptyScene extends Phaser.Scene {
  constructor() {
    super('Empty');
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1672,
  height: 941,
  backgroundColor: '#FFF4DC',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [EmptyScene],
});

export default game;
