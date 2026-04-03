import Phaser from 'phaser';
import { loadSvgIcons } from '../utils/svgIconLoader';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 로딩 바
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height / 2, 400, 30, 0x333355);
    const fill = this.add.rectangle(width / 2 - 198, height / 2, 4, 26, 0xf0c040);

    this.load.on('progress', (value: number) => {
      fill.width = 396 * value;
      fill.x = width / 2 - 198 + fill.width / 2;
    });

    this.add.text(width / 2, height / 2 - 50, '🏛️ 역사 전략 시뮬레이터', {
      fontSize: '28px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, '로딩 중...', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // TODO: 에셋 로드 (지도 타일셋, 초상화 등)
  }

  create() {
    // SVG 아이콘을 Canvas API로 렌더링하여 Phaser 텍스처에 등록
    const basePath = import.meta.env.BASE_URL ?? '/';
    loadSvgIcons(this.textures, basePath).then(() => {
      this.scene.start('TitleScene');
    });
  }
}
