import Phaser from 'phaser';
import type { Territory, GameState, GameEvent } from '../game/types';

export class UIScene extends Phaser.Scene {
  private gameState!: GameState;
  private mapScene!: Phaser.Scene;
  private panel!: Phaser.GameObjects.Container;
  private eventPanel!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameState: GameState; mapScene: Phaser.Scene }) {
    this.gameState = data.gameState;
    this.mapScene = data.mapScene;
  }

  create() {
    // 우측 사이드 패널 배경
    this.panel = this.add.container(1050, 60);
    const panelBg = this.add.rectangle(0, 0, 220, 580, 0x16213e, 0.9)
      .setStrokeStyle(1, 0x334466)
      .setOrigin(0);
    this.panel.add(panelBg);
    this.panel.setVisible(false);

    // 이벤트 패널 (중앙 모달)
    this.eventPanel = this.add.container(640, 360);
    this.eventPanel.setVisible(false);

    // "턴 종료" 버튼
    this.createButton(1180, 690, '⏭️ 턴 종료', () => {
      (this.mapScene as any).nextTurn();
      this.updateResourcePanel();
    });

    // 자원 패널 (상단 좌측)
    this.updateResourcePanel();

    // MapScene 이벤트 리스닝
    const mapScene = this.scene.get('MapScene');
    mapScene.events.on('territory-selected', (territory: Territory) => {
      this.showTerritoryPanel(territory);
    });

    mapScene.events.on('game-event', (event: GameEvent) => {
      this.showEventModal(event);
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void) {
    const btn = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 140, 36, 0x2a4a7f, 0.9)
      .setStrokeStyle(1, 0x5588bb)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(0, 0, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x3a5a9f));
    bg.on('pointerout', () => bg.setFillStyle(0x2a4a7f));
    bg.on('pointerdown', callback);

    btn.add([bg, label]);
    return btn;
  }

  private updateResourcePanel() {
    const existing = this.children.getByName('resourcePanel');
    if (existing) existing.destroy();

    const playerFaction = this.gameState.factions.find(f => f.isPlayer);
    if (!playerFaction) return;

    const r = playerFaction.resources;
    const text = this.add.text(20, 55, [
      `👑 ${playerFaction.name}`,
      `🌾 식량: ${r.food}  💰 재화: ${r.gold}`,
      `🎭 문화: ${r.culture}  ⚔️ 군사: ${r.military}  🔬 기술: ${r.technology}`,
    ].join('\n'), {
      fontSize: '13px',
      color: '#dddddd',
      fontFamily: 'monospace',
      backgroundColor: '#16213e',
      padding: { x: 8, y: 5 },
      lineSpacing: 4,
    }).setName('resourcePanel');

    return text;
  }

  private showTerritoryPanel(territory: Territory) {
    this.panel.setVisible(true);

    // 기존 패널 내용 제거 (배경 제외)
    while (this.panel.list.length > 1) {
      const child = this.panel.list[this.panel.list.length - 1];
      this.panel.remove(child, true);
    }

    const faction = this.gameState.factions.find(f => f.id === territory.owner);
    const isOwn = faction?.isPlayer ?? false;

    let y = 15;
    const addText = (text: string, color = '#ffffff', size = '13px') => {
      const t = this.add.text(15, y, text, {
        fontSize: size,
        color,
        fontFamily: 'sans-serif',
        wordWrap: { width: 190 },
      });
      this.panel.add(t);
      y += t.height + 6;
    };

    addText(`📍 ${territory.name}`, '#f0c040', '18px');
    addText(`소유: ${faction?.name || '무소속'}`, '#aaaaaa');
    addText(`인구: ${territory.population.toLocaleString()}명`);
    addText(`──────────────`, '#334466');
    addText(`🌾 농업: ${territory.development.agriculture}/100`);
    addText(`💰 상업: ${territory.development.commerce}/100`);
    addText(`🛡️ 방어: ${territory.development.defense}/100`);
    addText(`⚔️ 병력: ${territory.garrison.toLocaleString()}명`);

    if (isOwn) {
      addText(`──────────────`, '#334466');
      y += 5;

      // 내정 버튼들
      this.createPanelButton(15, y, '🌾 농업 개발 (-10💰)', () => {
        if (faction && faction.resources.gold >= 10) {
          faction.resources.gold -= 10;
          territory.development.agriculture = Math.min(100, territory.development.agriculture + 10);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      this.createPanelButton(15, y, '💰 상업 개발 (-10🌾)', () => {
        if (faction && faction.resources.food >= 10) {
          faction.resources.food -= 10;
          territory.development.commerce = Math.min(100, territory.development.commerce + 10);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      this.createPanelButton(15, y, '⚔️ 병력 징집 (-15🌾)', () => {
        if (faction && faction.resources.food >= 15) {
          faction.resources.food -= 15;
          territory.garrison += 1000;
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      this.createPanelButton(15, y, '🛡️ 방어 강화 (-10💰)', () => {
        if (faction && faction.resources.gold >= 10) {
          faction.resources.gold -= 10;
          territory.development.defense = Math.min(100, territory.development.defense + 10);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
    }
  }

  private createPanelButton(x: number, y: number, text: string, callback: () => void) {
    const bg = this.add.rectangle(x + 95, y + 14, 190, 32, 0x2a4a7f, 0.8)
      .setStrokeStyle(1, 0x4477aa)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x + 95, y + 14, text, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x3a6abf));
    bg.on('pointerout', () => bg.setFillStyle(0x2a4a7f));
    bg.on('pointerdown', callback);

    this.panel.add([bg, label]);
  }

  /** 교과서 이벤트 모달 */
  private showEventModal(event: GameEvent) {
    this.eventPanel.removeAll(true);
    this.eventPanel.setVisible(true);

    // 배경 오버레이
    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.eventPanel.add(overlay);

    // 모달 박스
    const modal = this.add.rectangle(0, 0, 500, 380, 0x16213e, 0.95)
      .setStrokeStyle(2, 0xf0c040);
    this.eventPanel.add(modal);

    // 제목
    const title = this.add.text(0, -160, event.title, {
      fontSize: '22px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.eventPanel.add(title);

    // 설명
    const desc = this.add.text(0, -80, event.description, {
      fontSize: '14px',
      color: '#dddddd',
      fontFamily: 'sans-serif',
      wordWrap: { width: 440 },
      lineSpacing: 4,
    }).setOrigin(0.5, 0);
    this.eventPanel.add(desc);

    // 교과서 참조
    const ref = this.add.text(0, 60, `📖 ${event.textbookRef}`, {
      fontSize: '12px',
      color: '#88aacc',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.eventPanel.add(ref);

    // 선택지 버튼
    if (event.choices) {
      event.choices.forEach((choice, i) => {
        const btnY = 100 + i * 50;
        const btnBg = this.add.rectangle(0, btnY, 420, 38, 0x2a4a7f, 0.9)
          .setStrokeStyle(1, 0x5588bb)
          .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, btnY, choice.text, {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x3a6abf));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x2a4a7f));
        btnBg.on('pointerdown', () => {
          // 효과 적용
          const player = this.gameState.factions.find(f => f.isPlayer);
          if (player && choice.effect) {
            for (const [key, value] of Object.entries(choice.effect)) {
              (player.resources as any)[key] += value;
            }
          }
          this.updateResourcePanel();
          this.eventPanel.setVisible(false);
          this.gameState.log.push(`[이벤트] ${event.title}: ${choice.resultText}`);
        });

        this.eventPanel.add([btnBg, btnText]);
      });
    }
  }
}
