import Phaser from 'phaser';
import type { Quiz } from '../data/quizzes';
import type { Territory, GameState, GameEvent, Faction, BattleResult } from '../game/types';
import { getAttackableTargets, calculateBattle } from '../game/combat';
import { getRelation, proposeTrade, proposeAlliance } from '../game/diplomacy';
import { RESOURCE_ICON_MAP } from '../utils/svgIconLoader';

// 삼국지3 색상 팔레트
const COLORS = {
  darkest: 0x0a1628,
  panel: 0x16213e,
  button: 0x2a4a7f,
  buttonHover: 0x3a6abf,
  gold: 0xf0c040,
  lightText: 0xf4edd8,
  barBg: 0x1a2a3f,
  agriculture: 0x4CAF50,
  commerce: 0xFFC107,
  defense: 0x2196F3,
  military: 0xF44336,
};

export class UIScene extends Phaser.Scene {
  private gameState!: GameState;
  private mapScene!: Phaser.Scene;
  private panel!: Phaser.GameObjects.Container;
  private eventPanel!: Phaser.GameObjects.Container;
  private quizPanel!: Phaser.GameObjects.Container;
  private battleModal!: Phaser.GameObjects.Container;
  private diplomacyPanel!: Phaser.GameObjects.Container;
  private tutorialPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private quizCloseTimer?: Phaser.Time.TimerEvent;
  private menuButtons: { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = [];
  private activeMenuIndex: number = -1;
  private turnInfoText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameState: GameState; mapScene: Phaser.Scene }) {
    this.gameState = data.gameState;
    this.mapScene = data.mapScene;
  }

  create() {
    // ── 상단 메뉴바 (y: 0~45) ──
    this.createMenuBar();

    // ── 자원 패널 (좌측 상단, y: 50~120) ──
    this.updateResourcePanel();

    // ── 우측 사이드 패널 (x: 1050~1270, y: 50~640) ──
    this.panel = this.add.container(1050, 50);
    const panelBg = this.add.rectangle(0, 0, 220, 590, COLORS.panel, 0.92)
      .setStrokeStyle(1, 0x334466)
      .setOrigin(0);
    this.panel.add(panelBg);
    this.panel.setVisible(false);

    // ── 모달 컨테이너들 (중앙) ──
    this.eventPanel = this.add.container(640, 360).setVisible(false);
    this.quizPanel = this.add.container(640, 360).setVisible(false);
    this.battleModal = this.add.container(640, 360).setVisible(false);
    this.diplomacyPanel = this.add.container(640, 360).setVisible(false);
    this.tutorialPanel = this.add.container(640, 360).setVisible(false);

    // ── 하단 바 (y: 596~700) ──
    this.createLogPanel();

    // ── 하단 버튼들 ──
    this.createButton(760, 668, '⏭️ 턴 종료', () => {
      (this.mapScene as any).nextTurn();
      this.updateResourcePanel();
      this.updateLeaderPanel();
    });

    this.createButton(620, 668, '🤝 외교', () => {
      this.showDiplomacyPanel();
    });

    // ── 세력 리더 패널 (우하단, x: 860~1020, y: 596~700) ──
    this.createLeaderPanel();

    // ── MapScene 이벤트 리스닝 ──
    const mapScene = this.scene.get('MapScene');
    mapScene.events.on('territory-selected', (territory: Territory) => {
      this.showTerritoryPanel(territory);
    });
    mapScene.events.on('game-event', (event: GameEvent) => {
      this.showEventModal(event);
    });
    mapScene.events.on('quiz-trigger', (quiz: Quiz) => {
      this.showQuizModal(quiz);
    });
    mapScene.events.on('log-updated', () => {
      this.refreshLogPanel(true);
      this.updateTurnInfo();
      this.updateLeaderPanel();
    });
    mapScene.events.on('menu-command', (digit: number) => {
      this.handleMenuCommand(digit);
    });

    this.refreshLogPanel(false);

    // ── 첫 턴 튜토리얼 ──
    if (this.gameState.turn === 1) {
      this.showTutorialModal();
    }
  }

  // ═══════════════════════════════════════
  // 상단 메뉴바 (1줄, 10개 버튼 + 턴 정보)
  // ═══════════════════════════════════════
  private createMenuBar() {
    // 메뉴바 배경 (전체 폭)
    this.add.rectangle(640, 22, 1280, 44, COLORS.darkest, 0.95)
      .setStrokeStyle(1, COLORS.gold, 0.4);

    const menuDefs = [
      { digit: 0, label: '휴양' },
      { digit: 1, label: '군사' },
      { digit: 2, label: '인사' },
      { digit: 3, label: '외교' },
      { digit: 4, label: '정보' },
      { digit: 5, label: '개발' },
      { digit: 6, label: '계략' },
      { digit: 7, label: '상인' },
      { digit: 8, label: '특별' },
      { digit: 9, label: '기능' },
    ];

    // 10개 버튼: 총 폭 ~960px, 우측에 턴 정보 공간 확보
    const btnW = 92;
    const btnH = 32;
    const startX = 8;
    this.menuButtons = [];

    menuDefs.forEach((menu, index) => {
      const x = startX + index * (btnW + 4) + btnW / 2;
      const y = 22;

      const bg = this.add.rectangle(x, y, btnW, btnH, COLORS.panel, 0.92)
        .setStrokeStyle(1, COLORS.gold, 0.5)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, `${menu.digit}. ${menu.label}`, {
        fontSize: '12px',
        color: '#f0f4ff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      bg.on('pointerover', () => {
        if (this.activeMenuIndex !== index) bg.setFillStyle(0x203555);
      });
      bg.on('pointerout', () => {
        if (this.activeMenuIndex !== index) bg.setFillStyle(COLORS.panel);
      });
      bg.on('pointerdown', () => {
        this.setActiveMenu(index);
        this.handleMenuCommand(menu.digit);
      });

      this.menuButtons.push({ bg, label });
    });

    // 우측 끝: 턴/연대 정보
    const yearStr = this.gameState.year < 0
      ? `기원전 ${Math.abs(this.gameState.year)}년`
      : `${this.gameState.year}년`;
    this.turnInfoText = this.add.text(1270, 22, `턴 ${this.gameState.turn} | ${yearStr}`, {
      fontSize: '13px',
      color: '#f0c040',
      fontFamily: 'monospace',
    }).setOrigin(1, 0.5);
  }

  private setActiveMenu(index: number) {
    // 이전 활성 메뉴 해제
    if (this.activeMenuIndex >= 0 && this.activeMenuIndex < this.menuButtons.length) {
      const prev = this.menuButtons[this.activeMenuIndex];
      prev.bg.setFillStyle(COLORS.panel);
      prev.bg.setStrokeStyle(1, COLORS.gold, 0.5);
      prev.label.setColor('#f0f4ff');
    }
    this.activeMenuIndex = index;
    if (index >= 0 && index < this.menuButtons.length) {
      const curr = this.menuButtons[index];
      curr.bg.setFillStyle(0x3a5a2f);
      curr.bg.setStrokeStyle(2, COLORS.gold, 0.9);
      curr.label.setColor('#f0c040');
    }
  }

  private updateTurnInfo() {
    const yearStr = this.gameState.year < 0
      ? `기원전 ${Math.abs(this.gameState.year)}년`
      : `${this.gameState.year}년`;
    this.turnInfoText.setText(`턴 ${this.gameState.turn} | ${yearStr}`);
  }

  // ═══════════════════════════════════════
  // 자원 패널 (좌측 상단, 아이콘+숫자+미니바)
  // ═══════════════════════════════════════
  private updateResourcePanel() {
    const existing = this.children.getByName('resourceContainer');
    if (existing) existing.destroy();

    const playerFaction = this.gameState.factions.find(f => f.isPlayer);
    if (!playerFaction) return;

    const container = this.add.container(10, 50).setName('resourceContainer');
    const r = playerFaction.resources;

    // 반투명 다크 패널 배경
    const bg = this.add.rectangle(0, 0, 290, 70, COLORS.darkest, 0.85)
      .setStrokeStyle(1, 0x334466, 0.6)
      .setOrigin(0);
    container.add(bg);

    // 세력명
    const nameText = this.add.text(10, 6, `👑 ${playerFaction.name}`, {
      fontSize: '13px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });
    container.add(nameText);

    // 자원 아이콘+숫자+미니바 (한 줄 레이아웃)
    const resources = [
      { key: 'food', fallback: '🌾', val: r.food, max: 200, color: 0x4CAF50 },
      { key: 'gold', fallback: '💰', val: r.gold, max: 200, color: 0xFFC107 },
      { key: 'culture', fallback: '🎭', val: r.culture, max: 200, color: 0x9C27B0 },
      { key: 'military', fallback: '⚔️', val: r.military, max: 200, color: 0xF44336 },
      { key: 'technology', fallback: '🔬', val: r.technology, max: 200, color: 0x2196F3 },
    ];

    const barMaxW = 40;
    resources.forEach((res, i) => {
      const x = 10 + i * 56;

      // SVG 아이콘 텍스처가 있으면 이미지로, 없으면 이모지 텍스트로 표시
      const iconKey = RESOURCE_ICON_MAP[res.key];
      if (iconKey && this.textures.exists(iconKey)) {
        const icon = this.add.image(x + 10, 30, iconKey).setDisplaySize(20, 20).setOrigin(0.5);
        container.add(icon);
        const text = this.add.text(x + 22, 24, `${res.val}`, {
          fontSize: '12px',
          color: '#f4edd8',
          fontFamily: 'monospace',
        });
        container.add(text);
      } else {
        const text = this.add.text(x, 26, `${res.fallback}${res.val}`, {
          fontSize: '12px',
          color: '#f4edd8',
          fontFamily: 'monospace',
        });
        container.add(text);
      }

      // 미니 바 (높이 4px)
      const ratio = Math.min(res.val / res.max, 1);
      const barW = barMaxW * ratio;

      const barBg = this.add.rectangle(x, 46, barMaxW, 4, COLORS.barBg, 0.8)
        .setOrigin(0);
      const barFill = this.add.rectangle(x, 46, Math.max(barW, 1), 4, res.color, 0.9)
        .setOrigin(0);
      container.add([barBg, barFill]);
    });
  }

  // ═══════════════════════════════════════
  // 하단 연대기 로그 (4줄, 턴 숫자 태그)
  // ═══════════════════════════════════════
  private createLogPanel() {
    this.logPanel = this.add.container(20, 596);

    const bg = this.add.rectangle(0, 0, 580, 104, 0x0f1a2d, 0.92)
      .setStrokeStyle(1, COLORS.gold, 0.45)
      .setOrigin(0);
    const title = this.add.text(14, 6, '📜 연대기', {
      fontSize: '12px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });

    this.logPanel.add([bg, title]);
    this.logTexts = [];

    for (let i = 0; i < 4; i++) {
      const text = this.add.text(16, 24 + i * 20, '', {
        fontSize: '11px',
        color: '#d8e0ec',
        fontFamily: 'sans-serif',
        wordWrap: { width: 550 },
      });
      this.logTexts.push(text);
      this.logPanel.add(text);
    }
  }

  private refreshLogPanel(animate: boolean) {
    const recentLogs = this.gameState.log.slice(-4);

    this.logTexts.forEach((text, index) => {
      const value = recentLogs[index] ?? '';
      text.setText(value);

      if (!animate || !value) {
        text.setAlpha(1);
        return;
      }

      text.setAlpha(0);
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 260,
        delay: index * 40,
        ease: 'Sine.Out',
      });
    });
  }

  // ═══════════════════════════════════════
  // 세력 리더 패널 (우하단, x: 860~1020)
  // ═══════════════════════════════════════
  private createLeaderPanel() {
    const existing = this.children.getByName('leaderContainer');
    if (existing) existing.destroy();

    const container = this.add.container(860, 596).setName('leaderContainer');
    const playerFaction = this.gameState.factions.find(f => f.isPlayer);
    if (!playerFaction) return container;

    // 세력 색상 그라데이션 배경
    const bg = this.add.rectangle(0, 0, 200, 104, COLORS.darkest, 0.92)
      .setStrokeStyle(1, 0x446688, 0.6)
      .setOrigin(0);
    container.add(bg);

    // 은은한 세력 색상 오버레이
    const overlay = this.add.rectangle(0, 0, 200, 104, playerFaction.color, 0.08)
      .setOrigin(0);
    container.add(overlay);

    // 문명별 대표 이모지
    const factionEmoji: Record<string, string> = {
      mesopotamia: '🏛️',
      egypt: '🔺',
      indus: '🏗️',
      yellow_river: '🏯',
    };
    const icon = this.add.text(16, 12, factionEmoji[playerFaction.id] ?? '👑', {
      fontSize: '32px',
    });
    container.add(icon);

    const nameText = this.add.text(60, 10, playerFaction.name, {
      fontSize: '16px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });
    container.add(nameText);

    const territories = this.gameState.territories.filter(t => t.owner === playerFaction.id);
    const totalGarrison = territories.reduce((sum, t) => sum + t.garrison, 0);

    const infoText = this.add.text(60, 34, `영토 ${territories.length}개`, {
      fontSize: '12px',
      color: '#a8b4cc',
      fontFamily: 'sans-serif',
    });
    container.add(infoText);

    const troopText = this.add.text(60, 52, `병력 ${totalGarrison.toLocaleString()}명`, {
      fontSize: '12px',
      color: '#a8b4cc',
      fontFamily: 'sans-serif',
    });
    container.add(troopText);

    // 리더 이름 (있으면)
    const ruler = playerFaction.leaders.find(l => l.role === 'ruler');
    if (ruler) {
      const rulerText = this.add.text(60, 74, `군주: ${ruler.name}`, {
        fontSize: '11px',
        color: '#88aacc',
        fontFamily: 'sans-serif',
      });
      container.add(rulerText);
    }

    return container;
  }

  private updateLeaderPanel() {
    this.createLeaderPanel();
  }

  // ═══════════════════════════════════════
  // 버튼 생성
  // ═══════════════════════════════════════
  private createButton(x: number, y: number, text: string, callback: () => void) {
    const btn = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 130, 32, COLORS.button, 0.9)
      .setStrokeStyle(1, 0x5588bb)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(0, 0, text, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.buttonHover));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.button));
    bg.on('pointerdown', callback);

    btn.add([bg, label]);
    return btn;
  }

  // ═══════════════════════════════════════
  // 도시 패널 (우측 사이드, 바 그래프 개선)
  // ═══════════════════════════════════════
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
      return t;
    };

    // 도시명
    addText(`📍 ${territory.name}`, '#f0c040', '17px');
    addText(`소유: ${faction?.name || '무소속'}`, '#aaaaaa', '12px');
    addText(`인구: ${territory.population.toLocaleString()}명`, '#cccccc', '12px');

    // 구분선
    const divider = this.add.rectangle(110, y, 190, 1, 0x334466, 0.8);
    this.panel.add(divider);
    y += 10;

    // 스탯 바 그래프 (농업/상업/방어/병력)
    const stats = [
      { label: '🌾 농업', value: territory.development.agriculture, max: 100, color: COLORS.agriculture },
      { label: '💰 상업', value: territory.development.commerce, max: 100, color: COLORS.commerce },
      { label: '🛡️ 방어', value: territory.development.defense, max: 100, color: COLORS.defense },
      { label: '⚔️ 병력', value: Math.min(territory.garrison / 50, 100), max: 100, color: COLORS.military },
    ];

    for (const stat of stats) {
      // 라벨
      const labelText = this.add.text(15, y, stat.label, {
        fontSize: '11px',
        color: '#a8b4cc',
        fontFamily: 'sans-serif',
      });
      this.panel.add(labelText);

      // 바 그래프 (폭 140px, 높이 12px, 둥근 모서리)
      const barX = 15;
      const barY = y + 18;
      const barW = 140;
      const barH = 12;
      const ratio = Phaser.Math.Clamp(stat.value, 0, stat.max) / stat.max;
      const fillW = Math.max(barW * ratio, 1);

      // 바 배경
      const barBg = this.add.graphics();
      barBg.fillStyle(COLORS.barBg, 1);
      barBg.fillRoundedRect(barX, barY, barW, barH, 3);
      this.panel.add(barBg);

      // 바 채움
      if (fillW > 2) {
        const barFill = this.add.graphics();
        barFill.fillStyle(stat.color, 1);
        barFill.fillRoundedRect(barX, barY, fillW, barH, 3);
        this.panel.add(barFill);
      }

      // 숫자 (바 옆)
      const numVal = stat.label.includes('병력')
        ? territory.garrison.toLocaleString()
        : `${Math.round(stat.value)}`;
      const numText = this.add.text(barX + barW + 6, barY - 1, numVal, {
        fontSize: '11px',
        color: '#f4edd8',
        fontFamily: 'monospace',
      });
      this.panel.add(numText);

      y += 36;
    }

    // 내정 버튼들 (자기 영토일 때)
    if (isOwn) {
      const divider2 = this.add.rectangle(110, y, 190, 1, 0x334466, 0.8);
      this.panel.add(divider2);
      y += 8;

      this.createPanelButton(15, y, '🌾 농업 개발 (-10💰)', () => {
        if (faction && faction.resources.gold >= 10) {
          faction.resources.gold -= 10;
          territory.development.agriculture = Math.min(100, territory.development.agriculture + 10);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}의 농업이 정비되었습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 38;

      this.createPanelButton(15, y, '💰 상업 개발 (-10🌾)', () => {
        if (faction && faction.resources.food >= 10) {
          faction.resources.food -= 10;
          territory.development.commerce = Math.min(100, territory.development.commerce + 10);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}의 상업 기반이 확장되었습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 38;

      this.createPanelButton(15, y, '⚔️ 병력 징집 (-15🌾)', () => {
        if (faction && faction.resources.food >= 15) {
          faction.resources.food -= 15;
          territory.garrison += 1000;
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}에서 병력 1,000명을 징집했습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 38;

      this.createPanelButton(15, y, '🛡️ 방어 강화 (-10💰)', () => {
        if (faction && faction.resources.gold >= 10) {
          faction.resources.gold -= 10;
          territory.development.defense = Math.min(100, territory.development.defense + 10);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}의 방어 시설이 강화되었습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 38;

      // 공격 가능한 인접 적 영토
      const targets = getAttackableTargets(faction!, this.gameState);
      const localTargets = targets.filter(t => territory.adjacentTo.includes(t.id));

      if (localTargets.length > 0) {
        const divider3 = this.add.rectangle(110, y, 190, 1, 0x334466, 0.8);
        this.panel.add(divider3);
        y += 6;
        addText(`⚔️ 공격 가능`, '#ff6b6b', '13px');

        for (const target of localTargets) {
          const defFaction = this.gameState.factions.find(f => f.id === target.owner);
          this.createPanelButton(15, y, `⚔️ ${target.name} (${defFaction?.name})`, () => {
            if (!faction || !defFaction) return;
            const result = calculateBattle(faction, defFaction, target, this.gameState);
            (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${result.log}`);
            (this.mapScene as any).refreshTerritoryVisuals?.();
            this.showBattleResultModal(result, faction, defFaction, target);
            this.updateResourcePanel();
          });
          y += 34;
        }
      }
    }
  }

  private createPanelButton(x: number, y: number, text: string, callback: () => void) {
    const bg = this.add.rectangle(x + 95, y + 14, 190, 30, COLORS.button, 0.8)
      .setStrokeStyle(1, 0x4477aa)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x + 95, y + 14, text, {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.buttonHover));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.button));
    bg.on('pointerdown', callback);

    this.panel.add([bg, label]);
  }

  // ═══════════════════════════════════════
  // 전투 결과 모달
  // ═══════════════════════════════════════
  private showBattleResultModal(
    result: BattleResult,
    attacker: Faction,
    defender: Faction,
    territory: Territory,
  ) {
    this.battleModal.removeAll(true);
    this.battleModal.setVisible(true);

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.battleModal.add(overlay);

    const modal = this.add.rectangle(0, 0, 460, 340, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.gold);
    this.battleModal.add(modal);

    const title = this.add.text(0, -140, '⚔️ 전투 결과', {
      fontSize: '22px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.battleModal.add(title);

    const resultColor = result.victor === 'attacker' ? '#66ff66' : '#ff6666';
    const resultText = result.victor === 'attacker' ? '🏆 승리 — 영토 점령!' : '💀 패배 — 공격 실패';

    const lines = [
      `${attacker.name} → ${territory.name} (${defender.name})`,
      ``,
      `공격측 손실: ${result.attackerLosses.toLocaleString()}명`,
      `방어측 손실: ${result.defenderLosses.toLocaleString()}명`,
      ``,
      result.territoryConquered
        ? `${territory.name}이(가) ${attacker.name}에 점령되었습니다.`
        : `${defender.name}이(가) ${territory.name}을(를) 사수했습니다.`,
    ];

    const desc = this.add.text(0, -60, lines.join('\n'), {
      fontSize: '14px',
      color: '#dddddd',
      fontFamily: 'sans-serif',
      lineSpacing: 5,
      align: 'center',
    }).setOrigin(0.5, 0);
    this.battleModal.add(desc);

    const verdict = this.add.text(0, 80, resultText, {
      fontSize: '18px',
      color: resultColor,
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.battleModal.add(verdict);

    const btnBg = this.add.rectangle(0, 130, 140, 38, COLORS.button, 0.9)
      .setStrokeStyle(1, 0x5588bb)
      .setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(0, 130, '확인', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(COLORS.buttonHover));
    btnBg.on('pointerout', () => btnBg.setFillStyle(COLORS.button));
    btnBg.on('pointerdown', () => {
      this.battleModal.setVisible(false);
      const selectedTerritory = this.gameState.territories.find(t => t.id === territory.id);
      if (selectedTerritory) this.showTerritoryPanel(selectedTerritory);
    });

    this.battleModal.add([btnBg, btnLabel]);
  }

  // ═══════════════════════════════════════
  // 외교 패널
  // ═══════════════════════════════════════
  private getRelationLabel(value: number): { text: string; color: string } {
    if (value >= 60) return { text: '동맹', color: '#66ff66' };
    if (value >= 30) return { text: '우호', color: '#88ddff' };
    if (value >= -10) return { text: '중립', color: '#cccccc' };
    if (value >= -40) return { text: '경계', color: '#ffaa44' };
    return { text: '적대', color: '#ff4444' };
  }

  private showDiplomacyPanel() {
    this.diplomacyPanel.removeAll(true);
    this.diplomacyPanel.setVisible(true);

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.diplomacyPanel.add(overlay);

    const player = this.gameState.factions.find(f => f.isPlayer);
    if (!player) return;

    const otherFactions = this.gameState.factions.filter(f => !f.isPlayer);
    const modalHeight = 120 + otherFactions.length * 100;
    const modal = this.add.rectangle(0, 0, 520, modalHeight, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.gold);
    this.diplomacyPanel.add(modal);

    const title = this.add.text(0, -modalHeight / 2 + 25, '🤝 외교', {
      fontSize: '22px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.diplomacyPanel.add(title);

    let y = -modalHeight / 2 + 60;

    for (const faction of otherFactions) {
      const relation = getRelation(player.id, faction.id);
      const label = this.getRelationLabel(relation);

      const nameText = this.add.text(-230, y, `${faction.name}`, {
        fontSize: '15px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      });
      this.diplomacyPanel.add(nameText);

      const relText = this.add.text(-230, y + 22, `관계: ${relation} (${label.text})`, {
        fontSize: '12px',
        color: label.color,
        fontFamily: 'sans-serif',
      });
      this.diplomacyPanel.add(relText);

      const tradeBg = this.add.rectangle(80, y + 14, 130, 32, COLORS.button, 0.9)
        .setStrokeStyle(1, 0x4477aa)
        .setInteractive({ useHandCursor: true });
      const tradeLabel = this.add.text(80, y + 14, '💰 교역 제안', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      tradeBg.on('pointerover', () => tradeBg.setFillStyle(COLORS.buttonHover));
      tradeBg.on('pointerout', () => tradeBg.setFillStyle(COLORS.button));
      tradeBg.on('pointerdown', () => {
        const result = proposeTrade({
          from: player.id,
          to: faction.id,
          offer: { food: 20 },
          demand: { gold: 20 },
        }, this.gameState.factions);
        (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${faction.name}에 교역 제안 → ${result.reason}`);
        this.updateResourcePanel();
        this.showDiplomacyPanel();
      });

      this.diplomacyPanel.add([tradeBg, tradeLabel]);

      const canAlly = relation >= 30;
      const allyColor = canAlly ? COLORS.button : 0x1a2a3f;
      const allyBg = this.add.rectangle(210, y + 14, 130, 32, allyColor, 0.9)
        .setStrokeStyle(1, canAlly ? 0x4477aa : 0x333333);
      if (canAlly) allyBg.setInteractive({ useHandCursor: true });

      const allyLabel = this.add.text(210, y + 14, '🤝 동맹 제안', {
        fontSize: '12px',
        color: canAlly ? '#ffffff' : '#666666',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      if (canAlly) {
        allyBg.on('pointerover', () => allyBg.setFillStyle(COLORS.buttonHover));
        allyBg.on('pointerout', () => allyBg.setFillStyle(COLORS.button));
        allyBg.on('pointerdown', () => {
          const result = proposeAlliance(player, faction);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${faction.name}에 동맹 제안 → ${result.reason}`);
          this.showDiplomacyPanel();
        });
      }

      this.diplomacyPanel.add([allyBg, allyLabel]);

      const terrCount = this.gameState.territories.filter(t => t.owner === faction.id).length;
      const infoText = this.add.text(-230, y + 42, `영토 ${terrCount}개 | 병력 ${faction.territories.length > 0
        ? this.gameState.territories
            .filter(t => t.owner === faction.id)
            .reduce((s, t) => s + t.garrison, 0)
            .toLocaleString()
        : '0'}명`, {
        fontSize: '11px',
        color: '#888888',
        fontFamily: 'sans-serif',
      });
      this.diplomacyPanel.add(infoText);

      y += 90;
    }

    const closeBg = this.add.rectangle(0, modalHeight / 2 - 35, 120, 34, COLORS.button, 0.9)
      .setStrokeStyle(1, 0x5588bb)
      .setInteractive({ useHandCursor: true });
    const closeLabel = this.add.text(0, modalHeight / 2 - 35, '닫기', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    closeBg.on('pointerover', () => closeBg.setFillStyle(COLORS.buttonHover));
    closeBg.on('pointerout', () => closeBg.setFillStyle(COLORS.button));
    closeBg.on('pointerdown', () => {
      this.diplomacyPanel.setVisible(false);
    });

    this.diplomacyPanel.add([closeBg, closeLabel]);
  }

  // ═══════════════════════════════════════
  // 교과서 이벤트 모달
  // ═══════════════════════════════════════
  private showEventModal(event: GameEvent) {
    this.eventPanel.removeAll(true);
    this.eventPanel.setVisible(true);

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.eventPanel.add(overlay);

    const modal = this.add.rectangle(0, 0, 500, 380, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.gold);
    this.eventPanel.add(modal);

    const title = this.add.text(0, -160, event.title, {
      fontSize: '22px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.eventPanel.add(title);

    const desc = this.add.text(0, -80, event.description, {
      fontSize: '14px',
      color: '#dddddd',
      fontFamily: 'sans-serif',
      wordWrap: { width: 440 },
      lineSpacing: 4,
    }).setOrigin(0.5, 0);
    this.eventPanel.add(desc);

    const ref = this.add.text(0, 60, `📖 ${event.textbookRef}`, {
      fontSize: '12px',
      color: '#88aacc',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.eventPanel.add(ref);

    if (event.choices) {
      event.choices.forEach((choice, i) => {
        const btnY = 100 + i * 50;
        const btnBg = this.add.rectangle(0, btnY, 420, 38, COLORS.button, 0.9)
          .setStrokeStyle(1, 0x5588bb)
          .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, btnY, choice.text, {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => btnBg.setFillStyle(COLORS.buttonHover));
        btnBg.on('pointerout', () => btnBg.setFillStyle(COLORS.button));
        btnBg.on('pointerdown', () => {
          const player = this.gameState.factions.find(f => f.isPlayer);
          if (player && choice.effect) {
            for (const [key, value] of Object.entries(choice.effect)) {
              (player.resources as any)[key] += value;
            }
          }
          this.updateResourcePanel();
          this.eventPanel.setVisible(false);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${event.title} - ${choice.resultText}`);
        });

        this.eventPanel.add([btnBg, btnText]);
      });
    }
  }

  // ═══════════════════════════════════════
  // 교과서 퀴즈 모달
  // ═══════════════════════════════════════
  private showQuizModal(quiz: Quiz) {
    this.quizCloseTimer?.remove(false);
    this.quizPanel.removeAll(true);
    this.quizPanel.setVisible(true);

    let answered = false;

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.quizPanel.add(overlay);

    const modal = this.add.rectangle(0, 0, 520, 420, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.gold);
    this.quizPanel.add(modal);

    const title = this.add.text(0, -170, '📝 교과서 퀴즈', {
      fontSize: '22px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.quizPanel.add(title);

    const question = this.add.text(0, -120, quiz.question, {
      fontSize: '18px',
      color: '#f4f0e6',
      fontFamily: 'sans-serif',
      wordWrap: { width: 440 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);
    this.quizPanel.add(question);

    const textbookRef = this.add.text(0, -52, `📖 ${quiz.textbookRef}`, {
      fontSize: '12px',
      color: '#88aacc',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.quizPanel.add(textbookRef);

    const resultText = this.add.text(0, 120, '', {
      fontSize: '18px',
      color: '#dddddd',
      fontFamily: 'sans-serif',
      wordWrap: { width: 430 },
      align: 'center',
      lineSpacing: 5,
    }).setOrigin(0.5);
    this.quizPanel.add(resultText);

    const answerRefText = this.add.text(0, 165, '', {
      fontSize: '13px',
      color: '#88aacc',
      fontFamily: 'sans-serif',
      wordWrap: { width: 430 },
      align: 'center',
    }).setOrigin(0.5);
    this.quizPanel.add(answerRefText);

    const answerButtons: Phaser.GameObjects.Rectangle[] = [];
    const answerLabels: Phaser.GameObjects.Text[] = [];
    const choiceTexts = quiz.type === 'ox' ? ['O', 'X'] : quiz.options ?? [];
    const startY = quiz.type === 'ox' ? -10 : -25;

    const lockAnswers = () => {
      answerButtons.forEach((button) => button.disableInteractive());
    };

    const showCloseButton = () => {
      const closeBg = this.add.rectangle(0, 205, 140, 36, COLORS.button, 0.9)
        .setStrokeStyle(1, 0x5588bb)
        .setInteractive({ useHandCursor: true });
      const closeText = this.add.text(0, 205, '확인', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      closeBg.on('pointerover', () => closeBg.setFillStyle(COLORS.buttonHover));
      closeBg.on('pointerout', () => closeBg.setFillStyle(COLORS.button));
      closeBg.on('pointerdown', () => this.closeQuizModal());

      this.quizPanel.add([closeBg, closeText]);
    };

    const submitAnswer = (selectedAnswer: string) => {
      if (answered) return;
      answered = true;
      lockAnswers();

      const isCorrect = selectedAnswer === quiz.answer;
      const playerFaction = this.gameState.factions.find((f) => f.isPlayer);

      if (isCorrect && playerFaction) {
        for (const [key, value] of Object.entries(quiz.reward)) {
          playerFaction.resources[key as keyof Faction['resources']] += value ?? 0;
        }
        this.updateResourcePanel();
      }

      const rewardText = this.formatRewardText(quiz.reward);

      if (isCorrect) {
        resultText.setColor('#7CFFB2');
        resultText.setText(`✅ 정답! ${rewardText}`);
        answerRefText.setText('');
        (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: 퀴즈 정답 - ${rewardText}`);
      } else {
        resultText.setColor('#FF8A8A');
        resultText.setText(`❌ 오답! 정답은 ${quiz.answer}`);
        answerRefText.setText(`교과서 참조: ${quiz.textbookRef}`);
        (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: 퀴즈 오답 - 정답 ${quiz.answer}`);
      }

      showCloseButton();
      this.quizCloseTimer = this.time.delayedCall(2000, () => {
        this.closeQuizModal();
      });
    };

    choiceTexts.forEach((choice, index) => {
      const buttonY = startY + index * 52;
      const buttonBg = this.add.rectangle(0, buttonY, 430, 40, COLORS.button, 0.9)
        .setStrokeStyle(1, 0x5588bb)
        .setInteractive({ useHandCursor: true });
      const buttonText = this.add.text(0, buttonY, choice, {
        fontSize: '15px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        wordWrap: { width: 390 },
        align: 'center',
      }).setOrigin(0.5);

      buttonBg.on('pointerover', () => {
        if (!answered) buttonBg.setFillStyle(COLORS.buttonHover);
      });
      buttonBg.on('pointerout', () => {
        if (!answered) buttonBg.setFillStyle(COLORS.button);
      });
      buttonBg.on('pointerdown', () => submitAnswer(choice));

      answerButtons.push(buttonBg);
      answerLabels.push(buttonText);
      this.quizPanel.add([buttonBg, buttonText]);
    });
  }

  private closeQuizModal() {
    this.quizCloseTimer?.remove(false);
    this.quizCloseTimer = undefined;
    this.quizPanel.setVisible(false);
    this.quizPanel.removeAll(true);
  }

  private formatRewardText(reward: Quiz['reward']) {
    const rewardLabels: Record<keyof Quiz['reward'], string> = {
      food: '식량',
      gold: '재화',
      culture: '문화',
      military: '군사',
      technology: '기술',
    };

    return Object.entries(reward)
      .map(([key, value]) => `${rewardLabels[key as keyof Quiz['reward']]} +${value}`)
      .join(', ');
  }

  // ═══════════════════════════════════════
  // 메뉴 명령 처리
  // ═══════════════════════════════════════
  private handleMenuCommand(digit: number) {
    this.setActiveMenu(digit);
    const mapScene = this.scene.get('MapScene') as any;

    switch (digit) {
      case 3:
        this.showDiplomacyPanel();
        break;
      default:
        mapScene?.addLog?.(`턴 ${this.gameState.turn}: [메뉴 ${digit}] 명령을 준비 중입니다.`);
        break;
    }
  }

  // ═══════════════════════════════════════
  // 첫 턴 튜토리얼 모달
  // ═══════════════════════════════════════
  private showTutorialModal() {
    this.tutorialPanel.removeAll(true);
    this.tutorialPanel.setVisible(true);

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.tutorialPanel.add(overlay);

    const modal = this.add.rectangle(0, 0, 500, 340, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.gold);
    this.tutorialPanel.add(modal);

    const title = this.add.text(0, -140, '🏛️ 역사 전략 시뮬레이터', {
      fontSize: '22px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.tutorialPanel.add(title);

    const welcomeText = [
      '역사 전략 시뮬레이터에 오신 걸 환영합니다!',
      '',
      '1. 도시를 클릭하여 내정을 관리하세요',
      '2. 턴 종료로 다음 턴으로',
      '3. 교과서 퀴즈에 정답하면 보상!',
      '',
      '방향키로 도시 이동, 숫자키로 메뉴',
    ].join('\n');

    const desc = this.add.text(0, -40, welcomeText, {
      fontSize: '14px',
      color: '#dddddd',
      fontFamily: 'sans-serif',
      lineSpacing: 6,
      align: 'center',
      wordWrap: { width: 420 },
    }).setOrigin(0.5, 0);
    this.tutorialPanel.add(desc);

    const btnBg = this.add.rectangle(0, 130, 180, 40, COLORS.button, 0.9)
      .setStrokeStyle(1, COLORS.gold, 0.7)
      .setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(0, 130, '🎮 게임 시작!', {
      fontSize: '16px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(COLORS.buttonHover));
    btnBg.on('pointerout', () => btnBg.setFillStyle(COLORS.button));
    btnBg.on('pointerdown', () => {
      this.tutorialPanel.setVisible(false);
    });

    this.tutorialPanel.add([btnBg, btnLabel]);
  }
}
