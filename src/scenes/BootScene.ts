import Phaser from 'phaser';

/**
 * İlk açılan sahne: asset yükleme ve kayıt okuma burada yapılacak (Sprint 1).
 * Faz 0'da dış asset yok; placeholder dokuları kodla üretip menüye geçer.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.createBlockTexture('block-grass', 0x5cb85c, 0x3e8e41);
    this.createBlockTexture('block-dirt', 0x9b7653, 0x7a5c3f);
    this.createBlockTexture('block-stone', 0x9e9e9e, 0x757575);
    this.scene.start('Menu');
  }

  /** Minecraft esintili, üst yüzü açık renkli basit 2D blok dokusu üretir. */
  private createBlockTexture(key: string, top: number, side: number): void {
    const size = 96;
    const g = this.add.graphics();
    g.fillStyle(side, 1);
    g.fillRect(0, 0, size, size);
    g.fillStyle(top, 1);
    g.fillRect(0, 0, size, size * 0.28);
    // Piksel hissi için kenar çizgisi
    g.lineStyle(4, 0x000000, 0.25);
    g.strokeRect(2, 2, size - 4, size - 4);
    g.generateTexture(key, size, size);
    g.destroy();
  }
}
