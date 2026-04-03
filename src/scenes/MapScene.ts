import Phaser from 'phaser';
import { SCENARIO_CIVILIZATIONS } from '../data/scenario_civilizations';
import type { GameState, Territory, Faction } from '../game/types';

interface MapSceneInitData {
  selectedFactionId?: string;
}

interface TerritoryVisual {
  container: Phaser.GameObjects.Container;
  base: Phaser.GameObjects.Polygon;
  glow: Phaser.GameObjects.Polygon;
  banner: Phaser.GameObjects.Rectangle;
}

export class MapScene extends Phaser.Scene {
  private gameState: GameState | null = null;
  private territorySprites: Map<string, TerritoryVisual> = new Map();
  private connectionLines: Phaser.GameObjects.Line[] = [];
  private infoText!: Phaser.GameObjects.Text;
  private selectedFactionId: string = SCENARIO_CIVILIZATIONS.factions[0].id;

  constructor() {
    super({ key: 'MapScene' });
  }

  init(data: MapSceneInitData) {
    this.selectedFactionId = data.selectedFactionId ?? SCENARIO_CIVILIZATIONS.factions[0].id;
  }

  create() {
    const scenario = SCENARIO_CIVILIZATIONS;

    // 시작 화면에서 선택한 세력을 플레이어 세력으로 반영한다.
    const factions = scenario.factions.map((f) => ({
      ...f,
      isPlayer: f.id === this.selectedFactionId,
    }));
    const playerFaction = factions.find((f) => f.isPlayer) ?? factions[0];

    this.gameState = {
      turn: 1,
      year: scenario.startYear,
      phase: 'development',
      currentFaction: playerFaction.id,
      factions,
      territories: [...scenario.territories],
      events: [...scenario.events],
      log: [`턴 1: ${playerFaction.name}이(가) ${scenario.title} 시나리오에 참전했습니다.`],
    };

    this.cameras.main.setBackgroundColor('#0d1b2a');

    this.drawBackdrop();
    this.drawConnections();
    this.drawTerritoryInfluence();
    this.drawTerritories();

    this.add.text(640, 25, `🏛️ ${scenario.title}`, {
      fontSize: '24px',
      color: '#f0c040',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    this.infoText = this.add.text(20, 648, '', {
      fontSize: '14px',
      color: '#d8e0ec',
      fontFamily: 'monospace',
      backgroundColor: '#101c31',
      padding: { x: 12, y: 7 },
    });

    this.updateTurnInfo();
    this.scene.stop('UIScene');
    this.scene.launch('UIScene', { gameState: this.gameState, mapScene: this });
  }

  private drawBackdrop() {
    const graphics = this.add.graphics();

    // 맵 전체에 얕은 조명층을 깔아 도시와 세력권이 더 잘 드러나게 한다.
    graphics.fillGradientStyle(0x0b1623, 0x102034, 0x14233d, 0x09121e, 1, 1, 1, 1);
    graphics.fillRect(0, 0, 1280, 720);

    graphics.fillStyle(0x17314d, 0.22);
    graphics.fillEllipse(640, 360, 980, 520);

    graphics.lineStyle(2, 0x254260, 0.28);
    graphics.strokeEllipse(640, 360, 1020, 560);
  }

  private drawConnections() {
    const territories = this.gameState.territories;
    const drawn = new Set<string>();

    for (const t of territories) {
      for (const adjId of t.adjacentTo) {
        const key = [t.id, adjId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const adj = territories.find((tt) => tt.id === adjId);
        if (!adj) continue;

        const line = this.add.line(0, 0, t.x, t.y, adj.x, adj.y, 0x47617b, 0.52)
          .setOrigin(0)
          .setLineWidth(2, 2);
        this.connectionLines.push(line);
      }
    }
  }

  private drawTerritoryInfluence() {
    const graphics = this.add.graphics();
    const factionGroups = new Map<string, Territory[]>();

    for (const territory of this.gameState.territories) {
      if (!territory.owner) continue;
      const list = factionGroups.get(territory.owner) ?? [];
      list.push(territory);
      factionGroups.set(territory.owner, list);
    }

    // 엄밀한 영토 폴리곤 대신 세력별 권역을 은은한 타원층으로 표현한다.
    for (const faction of this.gameState.factions) {
      const territories = factionGroups.get(faction.id);
      if (!territories || territories.length === 0) continue;

      const xs = territories.map((t) => t.x);
      const ys = territories.map((t) => t.y);
      const centerX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
      const centerY = ys.reduce((sum, y) => sum + y, 0) / ys.length;
      const width = Math.max(...xs) - Math.min(...xs) + 160;
      const height = Math.max(...ys) - Math.min(...ys) + 140;
      const accent = Phaser.Display.Color.IntegerToColor(faction.color).brighten(35).color;

      graphics.fillStyle(accent, 0.1);
      graphics.fillEllipse(centerX, centerY, width, height);
      graphics.lineStyle(1, accent, 0.2);
      graphics.strokeEllipse(centerX, centerY, width, height);
    }
  }

  private drawTerritories() {
    for (const territory of this.gameState.territories) {
      const faction = this.gameState.factions.find((f) => f.id === territory.owner);
      const color = faction
        ? Phaser.Display.Color.IntegerToColor(faction.color).brighten(30).color
        : 0x7a8594;

      const points = [-28, -6, -16, -22, 16, -22, 28, -6, 28, 12, 0, 26, -28, 12];
      const container = this.add.container(territory.x, territory.y);
      const glow = this.add.polygon(0, 0, points, color, 0.18)
        .setStrokeStyle(3, 0xf7e2a0, 0)
        .setScale(1.3)
        .setVisible(false);
      const base = this.add.polygon(0, 0, points, color, 0.9)
        .setStrokeStyle(2, 0xf4edd8, 0.65);
      const banner = this.add.rectangle(0, -5, 26, 10, 0xf0c040, 0.95)
        .setStrokeStyle(1, 0x34290a, 0.55);
      const keep = this.add.rectangle(0, 2, 14, 18, 0x203248, 0.92)
        .setStrokeStyle(1, 0xffffff, 0.25);
      const gate = this.add.rectangle(0, 8, 6, 10, 0x08111d, 0.95);

      const nameText = this.add.text(0, -40, territory.name, {
        fontSize: '13px',
        color: '#f7f3e7',
        fontFamily: 'sans-serif',
        stroke: '#08111d',
        strokeThickness: 3,
      }).setOrigin(0.5);

      const garrisonText = this.add.text(0, 34, `⚔️ ${(territory.garrison / 1000).toFixed(1)}k`, {
        fontSize: '11px',
        color: '#ffccaf',
        fontFamily: 'monospace',
        stroke: '#08111d',
        strokeThickness: 2,
      }).setOrigin(0.5);

      container.add([glow, base, banner, keep, gate, nameText, garrisonText]);
      container.setSize(74, 74);
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 34), Phaser.Geom.Circle.Contains);

      container.on('pointerdown', () => {
        this.onTerritoryClick(territory);
      });

      container.on('pointerover', () => {
        glow.setVisible(true);
        glow.setStrokeStyle(3, 0xf7e2a0, 0.85);
        this.tweens.add({
          targets: glow,
          scale: 1.45,
          alpha: 0.35,
          duration: 220,
          ease: 'Sine.Out',
        });
        base.setScale(1.08);
        banner.setScale(1.08);
        this.showTerritoryInfo(territory, faction);
      });

      container.on('pointerout', () => {
        this.tweens.killTweensOf(glow);
        glow.setVisible(false);
        glow.setScale(1.3);
        glow.setAlpha(0.18);
        glow.setStrokeStyle(3, 0xf7e2a0, 0);
        base.setScale(1);
        banner.setScale(1);
        this.infoText.setText('');
      });

      this.territorySprites.set(territory.id, { container, base, glow, banner });
    }
  }

  private showTerritoryInfo(territory: Territory, faction: Faction | undefined) {
    const owner = faction ? faction.name : '무소속';
    this.infoText.setText(
      `${territory.name} | 소유: ${owner} | 인구: ${territory.population.toLocaleString()} | ` +
      `농업: ${territory.development.agriculture} | 상업: ${territory.development.commerce} | ` +
      `방어: ${territory.development.defense} | 병력: ${territory.garrison.toLocaleString()}`
    );
  }

  private onTerritoryClick(territory: Territory) {
    this.events.emit('territory-selected', territory);
  }

  private updateTurnInfo() {
    const yearStr = this.gameState.year < 0
      ? `기원전 ${Math.abs(this.gameState.year)}년`
      : `${this.gameState.year}년`;

    const faction = this.gameState.factions.find((f) => f.id === this.gameState.currentFaction);
    const turnText = `턴 ${this.gameState.turn} | ${yearStr} | ${faction?.name || ''} 차례 | [${this.gameState.phase}]`;

    const existing = this.children.getByName('turnInfo');
    if (existing) existing.destroy();

    this.add.text(1260, 25, turnText, {
      fontSize: '14px',
      color: '#b4d6f6',
      fontFamily: 'monospace',
      backgroundColor: '#10203a',
      padding: { x: 8, y: 4 },
    }).setOrigin(1, 0.5).setName('turnInfo');
  }

  public nextTurn() {
    const scenario = SCENARIO_CIVILIZATIONS;
    const factionIdx = this.gameState.factions.findIndex((f) => f.id === this.gameState.currentFaction);
    const nextIdx = (factionIdx + 1) % this.gameState.factions.length;

    if (nextIdx === 0) {
      this.gameState.turn++;
      this.gameState.year += scenario.turnYears;

      for (const faction of this.gameState.factions) {
        const ownedTerritories = this.gameState.territories.filter((t) => t.owner === faction.id);
        for (const t of ownedTerritories) {
          faction.resources.food += Math.floor(t.development.agriculture / 10);
          faction.resources.gold += Math.floor(t.development.commerce / 10);
        }
        faction.resources.culture += 2;
        faction.resources.technology += 1;
      }

      this.addLog(`턴 ${this.gameState.turn}: 새로운 세기가 시작되었습니다.`);
      this.checkEvents();
    }

    this.gameState.currentFaction = this.gameState.factions[nextIdx].id;
    this.updateTurnInfo();

    const nextFaction = this.gameState.factions[nextIdx];
    if (!nextFaction.isPlayer) {
      this.time.delayedCall(500, () => {
        this.doAITurn(nextFaction);
        this.nextTurn();
      });
    }
  }

  private doAITurn(faction: Faction) {
    const territories = this.gameState.territories.filter((t) => t.owner === faction.id);
    if (territories.length > 0) {
      const weakest = territories.reduce((a, b) =>
        a.development.agriculture < b.development.agriculture ? a : b
      );
      weakest.development.agriculture = Math.min(100, weakest.development.agriculture + 5);
      weakest.garrison += 200;
      this.addLog(`턴 ${this.gameState.turn}: ${faction.name}가 ${weakest.name}의 농업을 개발했습니다.`);
    } else {
      this.addLog(`턴 ${this.gameState.turn}: ${faction.name}가 세력을 재정비했습니다.`);
    }
  }

  private checkEvents() {
    for (const event of this.gameState.events) {
      if (!event.triggered && event.triggerTurn <= this.gameState.turn) {
        event.triggered = true;
        this.events.emit('game-event', event);
      }
    }
  }

  public addLog(message: string) {
    this.gameState.log.push(message);
    this.events.emit('log-updated', this.gameState.log);
  }

  public getGameState(): GameState | null {
    return this.gameState;
  }
}
