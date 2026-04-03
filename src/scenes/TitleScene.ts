import Phaser from 'phaser';
import { SCENARIO_CIVILIZATIONS } from '../data/scenario_civilizations';
import type { Faction } from '../game/types';

interface FactionCardMeta {
  subtitle: string;
  trait: string;
}

export class TitleScene extends Phaser.Scene {
  private selectedFactionId: string = SCENARIO_CIVILIZATIONS.factions[0].id;
  private startButton!: Phaser.GameObjects.Container;
  private factionCards: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0d1b2a');

    this.drawBackground(width, height);
    this.drawHeader(width);
    this.drawScenarioSelector(width);
    this.drawFactionSelection();
    this.drawStartButton(width, height);
  }

  private drawBackground(width: number, height: number) {
    const graphics = this.add.graphics();

    // 다크 테마 위에 금빛 기류를 겹쳐 시작 화면의 분위기를 강화한다.
    graphics.fillGradientStyle(0x08111d, 0x0d1b2a, 0x13243c, 0x09111c, 1, 1, 1, 1);
    graphics.fillRect(0, 0, width, height);

    graphics.fillStyle(0xf0c040, 0.08);
    graphics.fillEllipse(width * 0.22, height * 0.28, 320, 220);
    graphics.fillEllipse(width * 0.77, height * 0.72, 360, 260);

    graphics.lineStyle(1, 0xf0c040, 0.12);
    for (let x = 110; x < width; x += 180) {
      graphics.strokeLineShape(new Phaser.Geom.Line(x, 90, x - 90, height - 60));
    }
  }

  private drawHeader(width: number) {
    this.add.text(width / 2, 72, '🏛️ 역사 전략 시뮬레이터', {
      fontSize: '42px',
      color: '#f0c040',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 116, '강 유역 문명을 골라 고대 세계의 주도권을 쥐십시오', {
      fontSize: '16px',
      color: '#b8c4d4',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
  }

  private drawScenarioSelector(width: number) {
    this.add.text(130, 166, '시나리오 선택', {
      fontSize: '18px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });

    const button = this.add.container(width / 2, 216);
    const bg = this.add.rectangle(0, 0, 1040, 76, 0x16213e, 0.95)
      .setStrokeStyle(2, 0xf0c040, 0.8)
      .setInteractive({ useHandCursor: true });
    const title = this.add.text(-490, -14, '4대 문명의 경쟁', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
    });
    const subtitle = this.add.text(-490, 15, SCENARIO_CIVILIZATIONS.subtitle, {
      fontSize: '13px',
      color: '#9eb0c8',
      fontFamily: 'sans-serif',
    });
    const unit = this.add.text(470, 0, SCENARIO_CIVILIZATIONS.textbookUnit, {
      fontSize: '12px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(1, 0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x1d2d52, 0.98));
    bg.on('pointerout', () => bg.setFillStyle(0x16213e, 0.95));

    button.add([bg, title, subtitle, unit]);
  }

  private drawFactionSelection() {
    this.add.text(130, 290, '세력 선택', {
      fontSize: '18px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });

    const metaByFactionId: Record<string, FactionCardMeta> = {
      mesopotamia: { subtitle: '도시 국가 연맹', trait: '문자와 법, 비옥한 초승달 지대' },
      egypt: { subtitle: '나일의 왕국', trait: '안정적 농업, 거대 건축, 신권 정치' },
      indus: { subtitle: '계획 도시 문명', trait: '정교한 도시 설계, 위생, 교역' },
      yellow_river: { subtitle: '황허 유역 국가', trait: '청동 문화, 제사, 군사 동원' },
    };

    const startX = 185;
    const gap = 230;
    const y = 470;

    SCENARIO_CIVILIZATIONS.factions.forEach((faction, index) => {
      const meta = metaByFactionId[faction.id];
      const card = this.createFactionCard(startX + gap * index, y, faction, meta);
      this.factionCards.set(faction.id, card);
    });

    this.refreshFactionCards();
  }

  private createFactionCard(
    x: number,
    y: number,
    faction: Faction,
    meta: FactionCardMeta,
  ) {
    const card = this.add.container(x, y);
    const accent = Phaser.Display.Color.IntegerToColor(faction.color).brighten(25).color;
    const bg = this.add.rectangle(0, 0, 210, 250, 0x10203a, 0.95)
      .setStrokeStyle(2, 0x38506e, 1)
      .setInteractive({ useHandCursor: true });
    const banner = this.add.rectangle(0, -92, 182, 42, accent, 0.92)
      .setStrokeStyle(1, 0xf7deb1, 0.45);
    const emblem = this.add.circle(0, -28, 26, accent, 0.22)
      .setStrokeStyle(2, accent, 0.95);
    const name = this.add.text(0, -93, faction.name, {
      fontSize: '20px',
      color: '#08111d',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, -53, meta.subtitle, {
      fontSize: '12px',
      color: '#b9c5d5',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    const leader = this.add.text(0, 6, `리더  ${faction.leaders[0]?.name ?? '미상'}`, {
      fontSize: '14px',
      color: '#f8f1dc',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    const trait = this.add.text(0, 56, `특성  ${meta.trait}`, {
      fontSize: '13px',
      color: '#8ea5c1',
      fontFamily: 'sans-serif',
      align: 'center',
      wordWrap: { width: 170 },
      lineSpacing: 4,
    }).setOrigin(0.5);
    const resources = this.add.text(0, 104, [
      `식량 ${faction.resources.food}  재화 ${faction.resources.gold}`,
      `문화 ${faction.resources.culture}  군사 ${faction.resources.military}`,
      `기술 ${faction.resources.technology}`,
    ].join('\n'), {
      fontSize: '12px',
      color: '#d3dbe8',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 5,
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      if (this.selectedFactionId !== faction.id) {
        bg.setFillStyle(0x183056, 0.98);
      }
      card.setScale(1.02);
    });

    bg.on('pointerout', () => {
      this.refreshFactionCards();
      card.setScale(this.selectedFactionId === faction.id ? 1.02 : 1);
    });

    bg.on('pointerdown', () => {
      this.selectedFactionId = faction.id;
      this.refreshFactionCards();
    });

    card.add([bg, banner, emblem, name, subtitle, leader, trait, resources]);
    return card;
  }

  private refreshFactionCards() {
    for (const faction of SCENARIO_CIVILIZATIONS.factions) {
      const card = this.factionCards.get(faction.id);
      if (!card) continue;

      const bg = card.list[0] as Phaser.GameObjects.Rectangle;
      const accent = Phaser.Display.Color.IntegerToColor(faction.color).brighten(25).color;
      const isSelected = this.selectedFactionId === faction.id;

      bg.setFillStyle(isSelected ? 0x1c355f : 0x10203a, isSelected ? 1 : 0.95);
      bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? accent : 0x38506e, 1);
      card.setScale(isSelected ? 1.02 : 1);
    }

    const buttonBg = this.startButton?.list[0] as Phaser.GameObjects.Rectangle | undefined;
    const buttonLabel = this.startButton?.list[1] as Phaser.GameObjects.Text | undefined;
    const selectedFaction = SCENARIO_CIVILIZATIONS.factions.find((f) => f.id === this.selectedFactionId);

    if (buttonBg && buttonLabel && selectedFaction) {
      buttonBg.setFillStyle(selectedFaction.color, 0.92);
      buttonLabel.setText(`${selectedFaction.name}으로 시작`);
    }
  }

  private drawStartButton(width: number, height: number) {
    const button = this.add.container(width / 2, height - 56);
    const bg = this.add.rectangle(0, 0, 260, 50, 0xf0c040, 0.92)
      .setStrokeStyle(2, 0xf8e4a3, 1)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(0, 0, '게임 시작', {
      fontSize: '18px',
      color: '#08111d',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setScale(1.03);
      button.y = height - 58;
    });
    bg.on('pointerout', () => {
      bg.setScale(1);
      button.y = height - 56;
    });
    bg.on('pointerdown', () => {
      this.scene.start('MapScene', {
        selectedFactionId: this.selectedFactionId,
      });
    });

    button.add([bg, label]);
    this.startButton = button;
    this.refreshFactionCards();
  }
}
