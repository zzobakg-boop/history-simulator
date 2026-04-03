import Phaser from 'phaser';
import type { Quiz } from '../data/quizzes';
import type { Territory, GameState, GameEvent, Faction, BattleResult } from '../game/types';
import { getAttackableTargets, calculateBattle } from '../game/combat';
import { getRelation, proposeTrade, proposeAlliance } from '../game/diplomacy';

export class UIScene extends Phaser.Scene {
  private gameState!: GameState;
  private mapScene!: Phaser.Scene;
  private panel!: Phaser.GameObjects.Container;
  private eventPanel!: Phaser.GameObjects.Container;
  private quizPanel!: Phaser.GameObjects.Container;
  private battleModal!: Phaser.GameObjects.Container;
  private diplomacyPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private quizCloseTimer?: Phaser.Time.TimerEvent;
  // 상단 메뉴바/리더 패널은 생성만 하면 되므로 별도 필드에 보관하지 않는다.

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameState: GameState; mapScene: Phaser.Scene }) {
    this.gameState = data.gameState;
    this.mapScene = data.mapScene;
  }

  create() {
    // 상단 삼국지3 스타일 메뉴바
    this.createMenuBar();

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

    // 퀴즈 모달
    this.quizPanel = this.add.container(640, 360);
    this.quizPanel.setVisible(false);

    // 전투 결과 모달
    this.battleModal = this.add.container(640, 360);
    this.battleModal.setVisible(false);

    // 외교 패널 (중앙 모달)
    this.diplomacyPanel = this.add.container(640, 360);
    this.diplomacyPanel.setVisible(false);

    // 하단 로그 패널
    this.createLogPanel();

    // "턴 종료" 버튼
    this.createButton(1180, 690, '⏭️ 턴 종료', () => {
      (this.mapScene as any).nextTurn();
      this.updateResourcePanel();
    });

    // "외교" 버튼
    this.createButton(1030, 690, '🤝 외교', () => {
      this.showDiplomacyPanel();
    });

    // 자원 패널 (상단 좌측) + 연대/턴 정보 패널
    this.updateResourcePanel();
    this.updateTurnPanel();

    // 플레이어 세력 리더 패널 (하단 우측)
    this.createLeaderPanel();

    // MapScene 이벤트 리스닝
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
      this.updateTurnPanel();
    });

    // 상단 메뉴바와 숫자 키 입력 연동
    mapScene.events.on('menu-command', (digit: number) => {
      this.handleMenuCommand(digit);
    });

    this.refreshLogPanel(false);
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

  private createLogPanel() {
    this.logPanel = this.add.container(20, 596);

    const bg = this.add.rectangle(0, 0, 820, 104, 0x0f1a2d, 0.92)
      .setStrokeStyle(1, 0xf0c040, 0.45)
      .setOrigin(0);
    const title = this.add.text(14, 10, '연대기', {
      fontSize: '13px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });

    this.logPanel.add([bg, title]);

    for (let i = 0; i < 3; i++) {
      const text = this.add.text(16, 34 + i * 22, '', {
        fontSize: '13px',
        color: '#d8e0ec',
        fontFamily: 'sans-serif',
        wordWrap: { width: 786 },
      });
      this.logTexts.push(text);
      this.logPanel.add(text);
    }
  }

  private refreshLogPanel(animate: boolean) {
    const recentLogs = this.gameState.log.slice(-3);

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

    addText(`📍 ${territory.name}`, '#f0c040', '18px');
    addText(`소유: ${faction?.name || '무소속'}`, '#aaaaaa');
    addText(`인구: ${territory.population.toLocaleString()}명`);
    addText(`──────────────`, '#334466');

    // 개발도/병력을 삼국지 스타일의 가로 바 그래프로 시각화한다.
    const agText = addText(`🌾 농업: ${territory.development.agriculture}/100`);
    this.createStatBar(territory.development.agriculture, 100, agText.y + agText.height + 2);
    y += 10;

    const comText = addText(`💰 상업: ${territory.development.commerce}/100`);
    this.createStatBar(territory.development.commerce, 100, comText.y + comText.height + 2, 0x7cb5ff);
    y += 10;

    const defText = addText(`🛡️ 방어: ${territory.development.defense}/100`);
    this.createStatBar(territory.development.defense, 100, defText.y + defText.height + 2, 0xffd27c);
    y += 10;

    const garText = addText(`⚔️ 병력: ${territory.garrison.toLocaleString()}명`);
    // 병력은 최대치가 없으므로 대략적인 전력감을 주는 상대적 바를 사용한다.
    const garrisonScale = Math.min(territory.garrison / 5000, 1); // 5,000명을 기준으로 100%로 환산
    this.createStatBar(garrisonScale * 100, 100, garText.y + garText.height + 2, 0xff9da3);
    y += 10;

    if (isOwn) {
      addText(`──────────────`, '#334466');
      y += 5;

      // 내정 버튼들
      this.createPanelButton(15, y, '🌾 농업 개발 (-10💰)', () => {
        if (faction && faction.resources.gold >= 10) {
          faction.resources.gold -= 10;
          territory.development.agriculture = Math.min(100, territory.development.agriculture + 10);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}의 농업이 정비되었습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      this.createPanelButton(15, y, '💰 상업 개발 (-10🌾)', () => {
        if (faction && faction.resources.food >= 10) {
          faction.resources.food -= 10;
          territory.development.commerce = Math.min(100, territory.development.commerce + 10);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}의 상업 기반이 확장되었습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      this.createPanelButton(15, y, '⚔️ 병력 징집 (-15🌾)', () => {
        if (faction && faction.resources.food >= 15) {
          faction.resources.food -= 15;
          territory.garrison += 1000;
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}에서 병력 1,000명을 징집했습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      this.createPanelButton(15, y, '🛡️ 방어 강화 (-10💰)', () => {
        if (faction && faction.resources.gold >= 10) {
          faction.resources.gold -= 10;
          territory.development.defense = Math.min(100, territory.development.defense + 10);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${territory.name}의 방어 시설이 강화되었습니다.`);
          this.showTerritoryPanel(territory);
          this.updateResourcePanel();
        }
      });
      y += 42;

      // 공격 가능한 인접 적 영토 표시
      const targets = getAttackableTargets(faction!, this.gameState);
      // 현재 영토에서 인접한 적 영토만 필터
      const localTargets = targets.filter(t => territory.adjacentTo.includes(t.id));

      if (localTargets.length > 0) {
        addText(`──────────────`, '#334466');
        addText(`⚔️ 공격 가능`, '#ff6b6b', '14px');
        y += 2;

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
          y += 36;
        }
      }
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

  /** 전투 결과 모달 */
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

    const modal = this.add.rectangle(0, 0, 460, 340, 0x16213e, 0.95)
      .setStrokeStyle(2, 0xf0c040);
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

    // 확인 버튼
    const btnBg = this.add.rectangle(0, 130, 140, 38, 0x2a4a7f, 0.9)
      .setStrokeStyle(1, 0x5588bb)
      .setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(0, 130, '확인', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x3a6abf));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x2a4a7f));
    btnBg.on('pointerdown', () => {
      this.battleModal.setVisible(false);
      // 패널 갱신
      const selectedTerritory = this.gameState.territories.find(t => t.id === territory.id);
      if (selectedTerritory) this.showTerritoryPanel(selectedTerritory);
    });

    this.battleModal.add([btnBg, btnLabel]);
  }

  /** 관계 수치 → 상태 텍스트 */
  private getRelationLabel(value: number): { text: string; color: string } {
    if (value >= 60) return { text: '동맹', color: '#66ff66' };
    if (value >= 30) return { text: '우호', color: '#88ddff' };
    if (value >= -10) return { text: '중립', color: '#cccccc' };
    if (value >= -40) return { text: '경계', color: '#ffaa44' };
    return { text: '적대', color: '#ff4444' };
  }

  /** 외교 패널 */
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
    const modal = this.add.rectangle(0, 0, 520, modalHeight, 0x16213e, 0.95)
      .setStrokeStyle(2, 0xf0c040);
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

      // 세력 이름 + 관계
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

      // 교역 제안 버튼
      const tradeBg = this.add.rectangle(80, y + 14, 130, 32, 0x2a4a7f, 0.9)
        .setStrokeStyle(1, 0x4477aa)
        .setInteractive({ useHandCursor: true });
      const tradeLabel = this.add.text(80, y + 14, '💰 교역 제안', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      tradeBg.on('pointerover', () => tradeBg.setFillStyle(0x3a6abf));
      tradeBg.on('pointerout', () => tradeBg.setFillStyle(0x2a4a7f));
      tradeBg.on('pointerdown', () => {
        const result = proposeTrade({
          from: player.id,
          to: faction.id,
          offer: { food: 20 },
          demand: { gold: 20 },
        }, this.gameState.factions);
        (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${faction.name}에 교역 제안 → ${result.reason}`);
        this.updateResourcePanel();
        this.showDiplomacyPanel(); // 갱신
      });

      this.diplomacyPanel.add([tradeBg, tradeLabel]);

      // 동맹 제안 버튼 (관계 30 이상)
      const canAlly = relation >= 30;
      const allyColor = canAlly ? 0x2a4a7f : 0x1a2a3f;
      const allyBg = this.add.rectangle(210, y + 14, 130, 32, allyColor, 0.9)
        .setStrokeStyle(1, canAlly ? 0x4477aa : 0x333333);
      if (canAlly) allyBg.setInteractive({ useHandCursor: true });

      const allyLabel = this.add.text(210, y + 14, '🤝 동맹 제안', {
        fontSize: '12px',
        color: canAlly ? '#ffffff' : '#666666',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      if (canAlly) {
        allyBg.on('pointerover', () => allyBg.setFillStyle(0x3a6abf));
        allyBg.on('pointerout', () => allyBg.setFillStyle(0x2a4a7f));
        allyBg.on('pointerdown', () => {
          const result = proposeAlliance(player, faction);
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${faction.name}에 동맹 제안 → ${result.reason}`);
          this.showDiplomacyPanel(); // 갱신
        });
      }

      this.diplomacyPanel.add([allyBg, allyLabel]);

      // 영토 수 표시
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

    // 닫기 버튼
    const closeBg = this.add.rectangle(0, modalHeight / 2 - 35, 120, 34, 0x2a4a7f, 0.9)
      .setStrokeStyle(1, 0x5588bb)
      .setInteractive({ useHandCursor: true });
    const closeLabel = this.add.text(0, modalHeight / 2 - 35, '닫기', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    closeBg.on('pointerover', () => closeBg.setFillStyle(0x3a6abf));
    closeBg.on('pointerout', () => closeBg.setFillStyle(0x2a4a7f));
    closeBg.on('pointerdown', () => {
      this.diplomacyPanel.setVisible(false);
    });

    this.diplomacyPanel.add([closeBg, closeLabel]);
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
          (this.mapScene as any).addLog(`턴 ${this.gameState.turn}: ${event.title} - ${choice.resultText}`);
        });

        this.eventPanel.add([btnBg, btnText]);
      });
    }
  }

  /** 교과서 퀴즈 모달 */
  private showQuizModal(quiz: Quiz) {
    this.quizCloseTimer?.remove(false);
    this.quizPanel.removeAll(true);
    this.quizPanel.setVisible(true);

    let answered = false;

    // 배경 오버레이
    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6)
      .setInteractive();
    this.quizPanel.add(overlay);

    // 모달 박스
    const modal = this.add.rectangle(0, 0, 520, 420, 0x16213e, 0.95)
      .setStrokeStyle(2, 0xf0c040);
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
      const closeBg = this.add.rectangle(0, 205, 140, 36, 0x2a4a7f, 0.9)
        .setStrokeStyle(1, 0x5588bb)
        .setInteractive({ useHandCursor: true });
      const closeText = this.add.text(0, 205, '확인', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      closeBg.on('pointerover', () => closeBg.setFillStyle(0x3a6abf));
      closeBg.on('pointerout', () => closeBg.setFillStyle(0x2a4a7f));
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
      const buttonBg = this.add.rectangle(0, buttonY, 430, 40, 0x2a4a7f, 0.9)
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
        if (!answered) buttonBg.setFillStyle(0x3a6abf);
      });
      buttonBg.on('pointerout', () => {
        if (!answered) buttonBg.setFillStyle(0x2a4a7f);
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

  /** 자원 보상 문구를 사용자 친화적인 형식으로 변환한다. */
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

  /** 상단 삼국지3 스타일 메뉴바를 생성한다. */
  private createMenuBar() {
    const container = this.add.container(0, 0);

    const menuDefs: { digit: number; label: string }[] = [
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

    const startX = 40;
    const baseY = 18;
    const gapX = 118;

    menuDefs.forEach((menu, index) => {
      const row = index < 5 ? 0 : 1;
      const col = index % 5;
      const x = startX + col * gapX;
      const y = baseY + row * 26;

      const bg = this.add.rectangle(x, y, 112, 20, 0x16213e, 0.92)
        .setStrokeStyle(1, 0x3a4a6a, 0.8)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, `${menu.digit}. ${menu.label}`, {
        fontSize: '12px',
        color: '#f0f4ff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setFillStyle(0x203555));
      bg.on('pointerout', () => bg.setFillStyle(0x16213e));
      bg.on('pointerdown', () => {
        this.handleMenuCommand(menu.digit);
      });

      container.add([bg, label]);
    });

    return container;
  }

  /** 숫자 키 또는 메뉴 클릭으로 들어온 명령을 처리한다. */
  private handleMenuCommand(digit: number) {
    const mapScene = this.scene.get('MapScene') as any;

    switch (digit) {
      case 3: // 외교
        this.showDiplomacyPanel();
        break;
      default:
        mapScene?.addLog?.(`턴 ${this.gameState.turn}: [메뉴 ${digit}] 명령을 준비 중입니다.`);
        break;
    }
  }

  /** 개발도/병력을 나타내는 가로 바 그래프를 그린다. */
  private createStatBar(value: number, max: number, y: number, color: number = 0x7cffbf) {
    const clamped = Phaser.Math.Clamp(value, 0, max);
    const ratio = max > 0 ? clamped / max : 0;
    const width = 180 * ratio;

    const bg = this.add.rectangle(15 + 90, y + 4, 180, 6, 0x0b1524, 0.9)
      .setStrokeStyle(1, 0x233552, 0.8)
      .setOrigin(0.5, 0.5);
    const fill = this.add.rectangle(15 + 90 - (180 - width) / 2, y + 4, width, 4, color, 0.95)
      .setOrigin(0.5, 0.5);

    this.panel.add([bg, fill]);
  }

  /** 연대/턴 정보를 좌측 상단 패널로 표시한다. */
  private updateTurnPanel() {
    const existing = this.children.getByName('turnPanel');
    if (existing) existing.destroy();

    const yearStr = this.gameState.year < 0
      ? `기원전 ${Math.abs(this.gameState.year)}년`
      : `${this.gameState.year}년`;
    const currentFaction = this.gameState.factions.find(f => f.id === this.gameState.currentFaction);
    const text = `턴 ${this.gameState.turn} | ${yearStr} | ${currentFaction?.name ?? ''}`;

    const panel = this.add.text(20, 20, text, {
      fontSize: '13px',
      color: '#b4d6f6',
      fontFamily: 'monospace',
      backgroundColor: '#10203a',
      padding: { x: 8, y: 4 },
    }).setName('turnPanel');

    // 다른 UI보다 뒤로 깔리지 않도록 맨 위로 올린다.
    this.children.bringToTop(panel);
  }

  /** 플레이어 세력 리더 정보를 하단 우측에 표시한다. */
  private createLeaderPanel() {
    const container = this.add.container(880, 596);
    const playerFaction = this.gameState.factions.find(f => f.isPlayer);
    if (!playerFaction) return container;

    const bg = this.add.rectangle(0, 0, 360, 104, 0x0f1a2d, 0.9)
      .setStrokeStyle(1, 0x446688, 0.6)
      .setOrigin(0, 0);

    const title = this.add.text(12, 10, '👑 세력 정보', {
      fontSize: '13px',
      color: '#f0c040',
      fontFamily: 'sans-serif',
    });

    const nameText = this.add.text(18, 36, `${playerFaction.name}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    });

    const territories = this.gameState.territories.filter(t => t.owner === playerFaction.id);
    const totalGarrison = territories.reduce((sum, t) => sum + t.garrison, 0);

    const infoText = this.add.text(18, 64, `영토 ${territories.length}개 | 병력 ${totalGarrison.toLocaleString()}명`, {
      fontSize: '12px',
      color: '#a8b4cc',
      fontFamily: 'sans-serif',
    });

    const emblem = this.add.text(320, 36, '👑', {
      fontSize: '32px',
      color: '#ffd27c',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5, 0.5);

    container.add([bg, title, nameText, infoText, emblem]);
    return container;
  }
}
