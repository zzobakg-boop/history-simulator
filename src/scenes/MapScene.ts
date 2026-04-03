import Phaser from 'phaser';
import { SCENARIO_CIVILIZATIONS } from '../data/scenario_civilizations';
import type { GameState, Territory, Faction } from '../game/types';

export class MapScene extends Phaser.Scene {
  private gameState: GameState | null = null;
  private territorySprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private connectionLines: Phaser.GameObjects.Line[] = [];
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MapScene' });
  }

  create() {
    const scenario = SCENARIO_CIVILIZATIONS;

    // 게임 상태 초기화
    // 첫 번째 세력을 플레이어로 설정 (나중에 선택 화면 추가)
    const factions = scenario.factions.map((f, i) => ({
      ...f,
      isPlayer: i === 0,
    }));

    this.gameState = {
      turn: 1,
      year: scenario.startYear,
      phase: 'development',
      currentFaction: factions[0].id,
      factions,
      territories: [...scenario.territories],
      events: [...scenario.events],
      log: [`기원전 ${Math.abs(scenario.startYear)}년, ${scenario.title} 시나리오가 시작됩니다.`],
    };

    // 배경
    this.cameras.main.setBackgroundColor('#0d1b2a');

    // 제목
    this.add.text(640, 25, `🏛️ ${scenario.title}`, {
      fontSize: '24px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // 영토 간 연결선 그리기
    this.drawConnections();

    // 영토(도시) 그리기
    this.drawTerritories();

    // 정보 패널
    this.infoText = this.add.text(20, 660, '', {
      fontSize: '14px',
      color: '#cccccc',
      fontFamily: 'monospace',
      backgroundColor: '#1a1a2e',
      padding: { x: 10, y: 5 },
    });

    // 턴 정보
    this.updateTurnInfo();

    // UI 씬 시작
    this.scene.launch('UIScene', { gameState: this.gameState, mapScene: this });
  }

  private drawConnections() {
    const territories = this.gameState.territories;
    const drawn = new Set<string>();

    for (const t of territories) {
      for (const adjId of t.adjacentTo) {
        const key = [t.id, adjId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const adj = territories.find(tt => tt.id === adjId);
        if (!adj) continue;

        const line = this.add.line(0, 0, t.x, t.y, adj.x, adj.y, 0x334455, 0.4)
          .setOrigin(0);
        this.connectionLines.push(line);
      }
    }
  }

  private drawTerritories() {
    for (const territory of this.gameState.territories) {
      const faction = this.gameState.factions.find(f => f.id === territory.owner);
      const color = faction ? faction.color : 0x666666;

      const container = this.add.container(territory.x, territory.y);

      // 도시 원
      const circle = this.add.circle(0, 0, 18, color, 0.8)
        .setStrokeStyle(2, 0xffffff, 0.5);

      // 도시 이름
      const nameText = this.add.text(0, -30, territory.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      // 병력 표시
      const garrisonText = this.add.text(0, 24, `⚔️${(territory.garrison / 1000).toFixed(1)}k`, {
        fontSize: '10px',
        color: '#ffaaaa',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      container.add([circle, nameText, garrisonText]);
      container.setSize(40, 40);
      container.setInteractive();

      // 클릭 이벤트
      container.on('pointerdown', () => {
        this.onTerritoryClick(territory);
      });

      // 호버 이펙트
      container.on('pointerover', () => {
        circle.setScale(1.2);
        this.showTerritoryInfo(territory, faction);
      });

      container.on('pointerout', () => {
        circle.setScale(1.0);
        this.infoText.setText('');
      });

      this.territorySprites.set(territory.id, container);
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
    // UIScene에 이벤트 전달
    this.events.emit('territory-selected', territory);
  }

  private updateTurnInfo() {
    const yearStr = this.gameState.year < 0
      ? `기원전 ${Math.abs(this.gameState.year)}년`
      : `${this.gameState.year}년`;

    const faction = this.gameState.factions.find(f => f.id === this.gameState.currentFaction);
    const turnText = `턴 ${this.gameState.turn} | ${yearStr} | ${faction?.name || ''} 차례 | [${this.gameState.phase}]`;

    // 상단 우측에 턴 정보 표시
    const existing = this.children.getByName('turnInfo');
    if (existing) existing.destroy();

    this.add.text(1260, 25, turnText, {
      fontSize: '14px',
      color: '#aaddff',
      fontFamily: 'monospace',
    }).setOrigin(1, 0.5).setName('turnInfo');
  }

  /** 턴 진행 */
  public nextTurn() {
    const scenario = SCENARIO_CIVILIZATIONS;
    const factionIdx = this.gameState.factions.findIndex(f => f.id === this.gameState.currentFaction);
    const nextIdx = (factionIdx + 1) % this.gameState.factions.length;

    // 모든 세력이 한 바퀴 돌면 턴 증가
    if (nextIdx === 0) {
      this.gameState.turn++;
      this.gameState.year += scenario.turnYears;

      // 자원 수입 (간단 계산)
      for (const faction of this.gameState.factions) {
        const ownedTerritories = this.gameState.territories.filter(t => t.owner === faction.id);
        for (const t of ownedTerritories) {
          faction.resources.food += Math.floor(t.development.agriculture / 10);
          faction.resources.gold += Math.floor(t.development.commerce / 10);
        }
        faction.resources.culture += 2;
        faction.resources.technology += 1;
      }

      // 이벤트 체크
      this.checkEvents();
    }

    this.gameState.currentFaction = this.gameState.factions[nextIdx].id;
    this.updateTurnInfo();

    // AI 턴이면 자동 진행
    const nextFaction = this.gameState.factions[nextIdx];
    if (!nextFaction.isPlayer) {
      this.time.delayedCall(500, () => {
        this.doAITurn(nextFaction);
        this.nextTurn();
      });
    }
  }

  /** AI 턴 (간단 버전) */
  private doAITurn(faction: Faction) {
    // 가장 농업이 낮은 영토 개발
    const territories = this.gameState.territories.filter(t => t.owner === faction.id);
    if (territories.length > 0) {
      const weakest = territories.reduce((a, b) =>
        a.development.agriculture < b.development.agriculture ? a : b
      );
      weakest.development.agriculture = Math.min(100, weakest.development.agriculture + 5);
      weakest.garrison += 200;
    }

    this.gameState.log.push(`${faction.name}이(가) 영토를 개발했습니다.`);
  }

  /** 이벤트 체크 */
  private checkEvents() {
    for (const event of this.gameState.events) {
      if (!event.triggered && event.triggerTurn <= this.gameState.turn) {
        event.triggered = true;
        this.events.emit('game-event', event);
      }
    }
  }

  public getGameState(): GameState | null {
    return this.gameState;
  }
}
