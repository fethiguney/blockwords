import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';

// Dikey (portre) oyun alanı — telefon öncelikli tasarım.
// FIT modu: her ekranda oranı koruyarak sığdırır.
export const GAME_WIDTH = 540;
export const GAME_HEIGHT = 960;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [BootScene, MenuScene],
});

// Tarayıcı konsolundan/testlerden erişim için (production'da zararsız)
declare global {
  interface Window {
    game: Phaser.Game;
  }
}
window.game = game;
