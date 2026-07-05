import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

/**
 * Başlık ekranı. Faz 0 "bitti tanımı": dokunmaya tepki veren sahne —
 * bloklara dokununca kırılma efekti oynar, yenisi düşer.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 180, 'BlockWords', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#5cb85c',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 250, 'İngilizce Bloklu Serüven', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '24px',
        color: '#e0e0e0',
      })
      .setOrigin(0.5);

    // Dokunulabilir blok ızgarası — Faz 0 etkileşim testi
    const keys = ['block-grass', 'block-dirt', 'block-stone'];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = cx - 168 + col * 112;
        const y = 420 + row * 112;
        this.spawnBlock(x, y, keys[row]);
      }
    }

    this.add
      .text(cx, 800, 'Bloklara dokun!', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '28px',
        color: '#ffd54f',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT - 40, 'v0.1.0 — Faz 0 iskeleti', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '16px',
        color: '#666680',
      })
      .setOrigin(0.5);
  }

  private spawnBlock(x: number, y: number, textureKey: string): void {
    const block = this.add
      .image(x, y, textureKey)
      .setInteractive({ useHandCursor: true });

    block.once('pointerdown', () => {
      // Kırılma: küçülüp kaybol + parçacıklar
      this.tweens.add({
        targets: block,
        scale: 0,
        angle: Phaser.Math.Between(-45, 45),
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          block.destroy();
          // Yeni blok yukarıdan düşer — dünya hiç boş kalmasın
          this.time.delayedCall(400, () => this.dropNewBlock(x, y, textureKey));
        },
      });
      this.emitCrumbs(x, y, textureKey);
    });
  }

  private dropNewBlock(x: number, y: number, textureKey: string): void {
    const block = this.add
      .image(x, y - 300, textureKey)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });
    this.tweens.add({
      targets: block,
      y,
      alpha: 1,
      duration: 350,
      ease: 'Bounce.easeOut',
    });
    block.once('pointerdown', () => {
      this.tweens.add({
        targets: block,
        scale: 0,
        angle: Phaser.Math.Between(-45, 45),
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          block.destroy();
          this.time.delayedCall(400, () => this.dropNewBlock(x, y, textureKey));
        },
      });
      this.emitCrumbs(x, y, textureKey);
    });
  }

  private emitCrumbs(x: number, y: number, textureKey: string): void {
    const emitter = this.add.particles(x, y, textureKey, {
      speed: { min: 120, max: 260 },
      scale: { start: 0.15, end: 0 },
      lifespan: 500,
      quantity: 8,
      gravityY: 600,
    });
    this.time.delayedCall(600, () => emitter.destroy());
  }
}
