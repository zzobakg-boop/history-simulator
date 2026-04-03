import Phaser from 'phaser';
import { QUIZZES } from '../data/quizzes';
import type { Quiz } from '../data/quizzes';
import { SCENARIO_CIVILIZATIONS } from '../data/scenario_civilizations';
import type { GameState, Territory, Faction } from '../game/types';
import { executeAITurn } from '../game/ai';
import { decayAllRelations } from '../game/diplomacy';

interface MapSceneInitData {
  selectedFactionId?: string;
}

interface TerritoryVisual {
  container: Phaser.GameObjects.Container;
  base: Phaser.GameObjects.Polygon;
  glow: Phaser.GameObjects.Polygon;
  banner: Phaser.GameObjects.Rectangle;
}

type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export class MapScene extends Phaser.Scene {
  private gameState: GameState | null = null;
  private territorySprites: Map<string, TerritoryVisual> = new Map();

  private infoText!: Phaser.GameObjects.Text;
  private selectedFactionId: string = SCENARIO_CIVILIZATIONS.factions[0].id;
  private selectedTerritoryId: string | null = null;
  private shownQuizIds: Set<string> = new Set();

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
      fontSize: '28px',
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
    this.setupKeyboardControls();
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
    const graphics = this.add.graphics();

    for (const t of territories) {
      for (const adjId of t.adjacentTo) {
        const key = [t.id, adjId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const adj = territories.find((tt) => tt.id === adjId);
        if (!adj) continue;

        // 점선 스타일 연결선
        this.drawDashedLine(graphics, t.x, t.y, adj.x, adj.y, 6, 4, 0x47617b, 0.52);
      }
    }
  }

  /** 점선을 그리는 헬퍼 */
  private drawDashedLine(
    graphics: Phaser.GameObjects.Graphics,
    x1: number, y1: number, x2: number, y2: number,
    dashSize: number, gapSize: number,
    color: number, alpha: number,
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const stepSize = dashSize + gapSize;
    const steps = Math.floor(dist / stepSize);
    const ux = dx / dist;
    const uy = dy / dist;

    graphics.lineStyle(2, color, alpha);
    for (let i = 0; i < steps; i++) {
      const sx = x1 + ux * i * stepSize;
      const sy = y1 + uy * i * stepSize;
      const ex = sx + ux * dashSize;
      const ey = sy + uy * dashSize;
      graphics.beginPath();
      graphics.moveTo(sx, sy);
      graphics.lineTo(ex, ey);
      graphics.strokePath();
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

      graphics.fillStyle(accent, 0.22);
      graphics.fillEllipse(centerX, centerY, width, height);
      graphics.lineStyle(1, accent, 0.35);
      graphics.strokeEllipse(centerX, centerY, width, height);
    }
  }

  /** 문명별 특색 있는 도시 아이콘을 그린다 */
  private drawCityIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, factionId: string | null) {
    if (factionId === 'mesopotamia') {
      // 지구라트: 3단 계단 피라미드
      graphics.fillStyle(0xc4956a, 1);
      graphics.fillRect(x - 20, y + 2, 40, 12);       // 하단
      graphics.fillStyle(0x9e7548, 1);
      graphics.fillRect(x - 14, y - 6, 28, 10);       // 중단
      graphics.fillStyle(0xf0c040, 1);
      graphics.fillRect(x - 8, y - 14, 16, 8);         // 상단
      // 꼭대기 깃발
      graphics.lineStyle(2, 0xf0c040, 0.9);
      graphics.beginPath();
      graphics.moveTo(x, y - 14);
      graphics.lineTo(x, y - 24);
      graphics.strokePath();
      graphics.fillStyle(0xf0c040, 1);
      graphics.fillTriangle(x, y - 24, x + 8, y - 20, x, y - 16);
    } else if (factionId === 'egypt') {
      // 피라미드 + 오벨리스크
      graphics.fillStyle(0xd4a574, 1);
      graphics.fillTriangle(x - 20, y + 10, x, y - 18, x + 20, y + 10);
      // 오벨리스크
      graphics.fillStyle(0xc0c0c0, 1);
      graphics.fillRect(x + 22, y - 10, 4, 20);
      graphics.fillTriangle(x + 22, y - 10, x + 24, y - 16, x + 26, y - 10);
      // 나일강 표현
      graphics.lineStyle(2, 0x4488cc, 0.6);
      graphics.beginPath();
      graphics.moveTo(x - 24, y + 12);
      graphics.lineTo(x + 28, y + 12);
      graphics.strokePath();
    } else if (factionId === 'indus') {
      // 정돈된 도시 격자 (외벽 + 건물 + 대욕장)
      graphics.fillStyle(0xc45c3d, 1);
      graphics.fillRect(x - 18, y - 14, 36, 28);       // 외벽
      graphics.fillStyle(0xd47a5a, 1);
      graphics.fillRect(x - 14, y - 10, 10, 8);         // 건물 1
      graphics.fillRect(x + 4, y - 10, 10, 8);          // 건물 2
      graphics.fillRect(x - 6, y + 2, 12, 8);           // 건물 3
      // 대욕장
      graphics.fillStyle(0x4488cc, 1);
      graphics.fillRect(x + 6, y + 4, 8, 6);
    } else if (factionId === 'yellow_river') {
      // 중국식 궁전 지붕
      graphics.fillStyle(0xe03030, 1);
      graphics.fillTriangle(x - 22, y - 2, x, y - 16, x + 22, y - 2);
      // 처마 끝 올림 (좌우 곡선 흉내)
      graphics.lineStyle(3, 0xe03030, 1);
      graphics.beginPath();
      graphics.moveTo(x - 22, y - 2);
      graphics.lineTo(x - 26, y - 6);
      graphics.strokePath();
      graphics.beginPath();
      graphics.moveTo(x + 22, y - 2);
      graphics.lineTo(x + 26, y - 6);
      graphics.strokePath();
      // 건물 본체
      graphics.fillStyle(0xb02020, 1);
      graphics.fillRect(x - 15, y - 2, 30, 15);
      // 기둥 2개
      graphics.fillStyle(0xf0c040, 0.8);
      graphics.fillRect(x - 10, y - 2, 3, 15);
      graphics.fillRect(x + 7, y - 2, 3, 15);
    } else {
      // 무소속: 기존 육각형 유지 (회색)
      graphics.fillStyle(0x7a8594, 0.8);
      const pts = [-20, -5, -12, -16, 12, -16, 20, -5, 20, 9, 0, 18, -20, 9];
      graphics.beginPath();
      graphics.moveTo(x + pts[0], y + pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        graphics.lineTo(x + pts[i], y + pts[i + 1]);
      }
      graphics.closePath();
      graphics.fillPath();
    }
  }

  private drawTerritories() {
    // 문명별 도시 아이콘 그래픽 레이어
    const cityGraphics = this.add.graphics();

    for (const territory of this.gameState.territories) {
      const faction = this.gameState.factions.find((f) => f.id === territory.owner);
      const color = faction
        ? Phaser.Display.Color.IntegerToColor(faction.color).brighten(30).color
        : 0x7a8594;

      // glow 효과용 육각형 (선택/호버 시 빛남)
      const points = [-32, -7, -18, -25, 18, -25, 32, -7, 32, 14, 0, 30, -32, 14];
      const container = this.add.container(territory.x, territory.y);
      const glow = this.add.polygon(0, 0, points, color, 0.18)
        .setStrokeStyle(3, 0xf7e2a0, 0)
        .setScale(1.3)
        .setVisible(false);
      // 투명 base (히트 영역 + glow 색상 참조용)
      const base = this.add.polygon(0, 0, points, color, 0)
        .setStrokeStyle(0, 0x000000, 0);
      const banner = this.add.rectangle(0, 0, 0, 0, 0x000000, 0); // 빈 더미 (인터페이스 호환)

      // 문명별 아이콘 그리기
      this.drawCityIcon(cityGraphics, territory.x, territory.y, territory.owner);

      const nameText = this.add.text(0, -50, territory.name, {
        fontSize: '13px',
        color: '#f7f3e7',
        fontFamily: 'sans-serif',
        stroke: '#08111d',
        strokeThickness: 3,
      }).setOrigin(0.5);

      const garrisonText = this.add.text(0, 45, `⚔️ ${(territory.garrison / 1000).toFixed(1)}k`, {
        fontSize: '11px',
        color: '#ffccaf',
        fontFamily: 'monospace',
        stroke: '#08111d',
        strokeThickness: 2,
      }).setOrigin(0.5);

      container.add([glow, base, banner, nameText, garrisonText]);
      container.setSize(84, 84);
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 40), Phaser.Geom.Circle.Contains);

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
        if (this.selectedTerritoryId === territory.id) {
          this.applySelectedVisual(territory.id);
        } else {
          glow.setVisible(false);
          glow.setScale(1.3);
          glow.setAlpha(0.18);
          glow.setStrokeStyle(3, 0xf7e2a0, 0);
        }
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
    this.selectTerritory(territory);
    this.events.emit('territory-selected', territory);
  }

  private setupKeyboardControls() {
    this.input.keyboard?.on('keydown', this.handleKeyboardInput, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardInput, this);
    });
  }

  private handleKeyboardInput(event: KeyboardEvent) {
    const directionByCode: Partial<Record<string, NavigationDirection>> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    const direction = directionByCode[event.code];
    if (direction) {
      this.moveSelection(direction);
      return;
    }

    const digit = this.getMenuDigitFromKeyEvent(event);
    if (digit !== null) {
      const uiScene = this.scene.get('UIScene');
      uiScene.events.emit('menu-command', digit);
    }
  }

  private getMenuDigitFromKeyEvent(event: KeyboardEvent): number | null {
    if (/^Digit[0-9]$/.test(event.code) || /^Numpad[0-9]$/.test(event.code)) {
      return Number(event.code.slice(-1));
    }

    if (/^[0-9]$/.test(event.key)) {
      return Number(event.key);
    }

    return null;
  }

  private moveSelection(direction: NavigationDirection) {
    if (!this.gameState || !this.selectedTerritoryId) return;

    const current = this.gameState.territories.find((territory) => territory.id === this.selectedTerritoryId);
    if (!current) return;

    const nextTerritory = this.findAdjacentTerritoryByDirection(current, direction);
    if (!nextTerritory) return;

    this.selectTerritory(nextTerritory);
    this.events.emit('territory-selected', nextTerritory);
  }

  private findAdjacentTerritoryByDirection(
    current: Territory,
    direction: NavigationDirection
  ): Territory | null {
    if (!this.gameState) return null;

    const adjacentTerritories = current.adjacentTo
      .map((adjacentId) => this.gameState!.territories.find((territory) => territory.id === adjacentId))
      .filter((territory): territory is Territory => territory !== undefined);

    if (adjacentTerritories.length === 0) return null;

    const directionalCandidates = adjacentTerritories
      .map((territory) => {
        const dx = territory.x - current.x;
        const dy = territory.y - current.y;
        const axisDistance = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
        const crossDistance = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);

        return {
          territory,
          dx,
          dy,
          axisDistance,
          crossDistance,
        };
      })
      .filter(({ dx, dy }) => {
        if (direction === 'up') return dy < 0;
        if (direction === 'down') return dy > 0;
        if (direction === 'left') return dx < 0;
        return dx > 0;
      })
      .sort((a, b) => {
        if (a.crossDistance !== b.crossDistance) {
          return a.crossDistance - b.crossDistance;
        }
        return a.axisDistance - b.axisDistance;
      });

    return directionalCandidates[0]?.territory ?? null;
  }

  private selectTerritory(territory: Territory) {
    if (this.selectedTerritoryId === territory.id) {
      this.applySelectedVisual(territory.id);
      return;
    }

    const previousId = this.selectedTerritoryId;
    this.selectedTerritoryId = territory.id;

    if (previousId) {
      this.clearSelectedVisual(previousId);
    }

    this.applySelectedVisual(territory.id);
  }

  private applySelectedVisual(territoryId: string) {
    const visual = this.territorySprites.get(territoryId);
    if (!visual) return;

    this.tweens.killTweensOf(visual.glow);
    visual.glow.setVisible(true);
    visual.glow.setScale(1.38);
    visual.glow.setAlpha(0.4);
    visual.glow.setStrokeStyle(4, 0xfff2b3, 0.95);

    // 현재 선택된 도시는 hover와 구분되도록 지속적으로 빛나게 한다.
    this.tweens.add({
      targets: visual.glow,
      scale: 1.52,
      alpha: 0.65,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  private clearSelectedVisual(territoryId: string) {
    const visual = this.territorySprites.get(territoryId);
    if (!visual) return;

    this.tweens.killTweensOf(visual.glow);
    visual.glow.setVisible(false);
    visual.glow.setScale(1.3);
    visual.glow.setAlpha(0.18);
    visual.glow.setStrokeStyle(3, 0xf7e2a0, 0);
  }

  private calculateYear(turn: number) {
    return SCENARIO_CIVILIZATIONS.startYear + Math.floor(turn / 12);
  }

  /** 턴 정보 갱신 (UIScene이 'log-updated' 이벤트로 갱신하므로 빈 구현) */
  private updateTurnInfo() {
    // 턴/연대 정보는 UIScene 상단 메뉴바에 통합 표시
  }

  public nextTurn() {
    const factionIdx = this.gameState.factions.findIndex((f) => f.id === this.gameState.currentFaction);
    const nextIdx = (factionIdx + 1) % this.gameState.factions.length;

    if (nextIdx === 0) {
      this.gameState.turn++;
      const previousYear = this.gameState.year;
      this.gameState.year = this.calculateYear(this.gameState.turn);

      for (const faction of this.gameState.factions) {
        const ownedTerritories = this.gameState.territories.filter((t) => t.owner === faction.id);
        for (const t of ownedTerritories) {
          faction.resources.food += Math.floor(t.development.agriculture / 10);
          faction.resources.gold += Math.floor(t.development.commerce / 10);
        }
        faction.resources.culture += 2;
        faction.resources.technology += 1;
      }

      // 라운드 종료 시 외교 관계 자연 감소
      decayAllRelations();

      if (this.gameState.year !== previousYear) {
        this.addLog(`턴 ${this.gameState.turn}: 새로운 해가 시작되었습니다.`);
      }
      this.checkEvents();

      if (this.gameState.turn % 3 === 0) {
        const quiz = this.getNextQuiz();
        this.events.emit('quiz-trigger', quiz);
      }
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
    const actions = executeAITurn(faction, this.gameState!);
    if (actions.length === 0) {
      this.addLog(`턴 ${this.gameState!.turn}: ${faction.name}이(가) 세력을 재정비했습니다.`);
      return;
    }
    for (const action of actions) {
      this.addLog(`턴 ${this.gameState!.turn}: ${faction.name} — ${action.description}`);
    }
    // 전투가 있었으면 맵 갱신
    if (actions.some(a => a.type === 'attack')) {
      this.refreshTerritoryVisuals();
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

  /** 아직 출제되지 않은 퀴즈를 무작위로 1개 선택한다. */
  private getNextQuiz(): Quiz {
    let availableQuizzes = QUIZZES.filter((quiz) => !this.shownQuizIds.has(quiz.id));

    // 모든 문항을 소진하면 출제 기록을 초기화한다.
    if (availableQuizzes.length === 0) {
      this.shownQuizIds.clear();
      availableQuizzes = [...QUIZZES];
    }

    const quiz = Phaser.Utils.Array.GetRandom(availableQuizzes);
    this.shownQuizIds.add(quiz.id);
    return quiz;
  }

  /** 영토 색상·병력 텍스트를 현재 상태에 맞게 갱신 */
  public refreshTerritoryVisuals() {
    for (const territory of this.gameState!.territories) {
      const visual = this.territorySprites.get(territory.id);
      if (!visual) continue;

      const faction = this.gameState!.factions.find(f => f.id === territory.owner);
      const color = faction
        ? Phaser.Display.Color.IntegerToColor(faction.color).brighten(30).color
        : 0x7a8594;

      visual.base.setFillStyle(color, 0.9);
      visual.glow.setFillStyle(color, 0.18);

      // 병력 텍스트 갱신 (컨테이너의 마지막 텍스트)
      const children = visual.container.list;
      const garrisonText = children[children.length - 1] as Phaser.GameObjects.Text;
      if (garrisonText?.setText) {
        garrisonText.setText(`⚔️ ${(territory.garrison / 1000).toFixed(1)}k`);
      }
    }
  }

  public getGameState(): GameState | null {
    return this.gameState;
  }
}
