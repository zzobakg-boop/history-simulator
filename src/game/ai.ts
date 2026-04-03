// ===== AI 시스템 =====
import type { Faction, GameState, Territory, AIPersonality, AIAction } from './types';
import { getAttackableTargets, calculateBattle } from './combat';

/** 세력별 AI 성향 매핑 */
const AI_PERSONALITIES: Record<string, AIPersonality> = {
  mesopotamia: 'balanced',
  egypt: 'defensive',
  indus: 'defensive',
  yellow_river: 'aggressive',
};

/** AI 성향별 공격 병력 임계치 (총 병력 대비 적 병력 비율) */
const ATTACK_THRESHOLD: Record<AIPersonality, number> = {
  aggressive: 0.8,   // 적보다 80%만 되어도 공격
  balanced: 1.2,     // 적보다 20% 우세해야 공격
  defensive: 1.8,    // 적보다 80% 우세해야 공격
};

/**
 * AI 세력의 턴 자동 진행
 * 우선순위:
 *   1. 자원(식량) 부족 → 내정(농업 개발)
 *   2. 병력 충분 → 인접 약한 영토 공격
 *   3. 그 외 → 개발(상업/방어)
 */
export function executeAITurn(faction: Faction, gameState: GameState): AIAction[] {
  const actions: AIAction[] = [];
  const personality = AI_PERSONALITIES[faction.id] ?? 'balanced';
  const ownTerritories = gameState.territories.filter(t => t.owner === faction.id);

  if (ownTerritories.length === 0) return actions;

  // 1단계: 자원 부족 체크 → 내정
  if (faction.resources.food < 30) {
    const action = developTerritory(ownTerritories, 'agriculture');
    if (action) actions.push(action);
    return actions; // 자원 부족 시 내정에 집중
  }

  // 2단계: 병력이 충분하면 공격 시도
  const totalGarrison = ownTerritories.reduce((sum, t) => sum + t.garrison, 0);
  const targets = getAttackableTargets(faction, gameState);

  if (targets.length > 0) {
    // 가장 약한 영토 선택
    const weakest = targets.reduce((a, b) => a.garrison < b.garrison ? a : b);
    const threshold = ATTACK_THRESHOLD[personality];

    if (totalGarrison > weakest.garrison * threshold) {
      const defender = gameState.factions.find(f => f.id === weakest.owner);
      if (defender) {
        const result = calculateBattle(faction, defender, weakest, gameState);
        actions.push({
          type: 'attack',
          description: result.log,
          targetTerritory: weakest.id,
        });
        return actions;
      }
    }
  }

  // 3단계: 개발 (상업 또는 방어 중 낮은 것)
  const devAction = developBestTerritory(ownTerritories, personality);
  if (devAction) actions.push(devAction);

  // 병력 충원
  const recruitAction = recruitTroops(ownTerritories, faction);
  if (recruitAction) actions.push(recruitAction);

  return actions;
}

/**
 * 특정 분야의 개발이 가장 낮은 영토를 개발
 */
function developTerritory(
  territories: Territory[],
  field: 'agriculture' | 'commerce' | 'defense',
): AIAction | null {
  if (territories.length === 0) return null;

  const target = territories.reduce((a, b) =>
    a.development[field] < b.development[field] ? a : b,
  );

  const increase = 5 + Math.floor(Math.random() * 6); // 5~10 증가
  target.development[field] = Math.min(100, target.development[field] + increase);

  const fieldNames: Record<string, string> = {
    agriculture: '농업',
    commerce: '상업',
    defense: '방어',
  };

  return {
    type: 'develop',
    description: `${target.name}의 ${fieldNames[field]}을(를) ${increase}만큼 개발했습니다. (→${target.development[field]})`,
    targetTerritory: target.id,
    value: increase,
  };
}

/**
 * AI 성향에 따라 최적 개발 분야 결정
 */
function developBestTerritory(
  territories: Territory[],
  personality: AIPersonality,
): AIAction | null {
  switch (personality) {
    case 'aggressive':
      // 공격적: 상업 우선 (자금 확보)
      return developTerritory(territories, 'commerce');
    case 'defensive':
      // 방어적: 방어 우선
      return developTerritory(territories, 'defense');
    case 'balanced':
    default:
      // 균형: 가장 낮은 분야 개발
      {
        const avgAg = avg(territories.map(t => t.development.agriculture));
        const avgCo = avg(territories.map(t => t.development.commerce));
        const avgDe = avg(territories.map(t => t.development.defense));
        const min = Math.min(avgAg, avgCo, avgDe);
        if (min === avgAg) return developTerritory(territories, 'agriculture');
        if (min === avgCo) return developTerritory(territories, 'commerce');
        return developTerritory(territories, 'defense');
      }
  }
}

/**
 * 병력 충원: 식량을 소비하여 병력 추가
 */
function recruitTroops(territories: Territory[], faction: Faction): AIAction | null {
  if (faction.resources.food < 10) return null;

  // 가장 병력이 적은 영토에 충원
  const target = territories.reduce((a, b) => a.garrison < b.garrison ? a : b);
  const recruits = 200 + Math.floor(Math.random() * 300); // 200~500명

  target.garrison += recruits;
  faction.resources.food -= 5; // 식량 소비

  return {
    type: 'recruit',
    description: `${target.name}에 ${recruits}명을 충원했습니다. (총 ${target.garrison}명)`,
    targetTerritory: target.id,
    value: recruits,
  };
}

/** 배열 평균 */
function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
