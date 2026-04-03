// ===== 전투 시스템 =====
import type { Faction, Territory, GameState, BattleResult, Leader } from './types';

/**
 * 공격 세력의 최고 무력 리더를 반환
 */
function getBestMilitaryLeader(faction: Faction): Leader | undefined {
  return faction.leaders.reduce<Leader | undefined>(
    (best, l) => (!best || l.stats.military > best.stats.military ? l : best),
    undefined,
  );
}

/**
 * ±20% 랜덤 배율 생성 (0.8 ~ 1.2)
 */
function randomModifier(): number {
  return 0.8 + Math.random() * 0.4;
}

/**
 * 전투 계산
 * - 공격력 = 공격 병력 × (리더 무력 / 50) × 랜덤(±20%)
 * - 방어력 = 방어 병력 × (영토 방어도 / 50) × 랜덤(±20%)
 * - 승리 시 영토 점령, 패배 시 공격 병력 손실
 */
export function calculateBattle(
  attacker: Faction,
  defender: Faction,
  territory: Territory,
  gameState: GameState,
): BattleResult {
  const attackLeader = getBestMilitaryLeader(attacker);
  const militaryStat = attackLeader ? attackLeader.stats.military : 50;

  // 공격 병력: 공격 세력의 총 주둔 병력 중 절반을 투입
  const attackerTerritories = gameState.territories.filter(t => t.owner === attacker.id);
  const totalGarrison = attackerTerritories.reduce((sum, t) => sum + t.garrison, 0);
  const attackTroops = Math.floor(totalGarrison * 0.5);

  const defenseTroops = territory.garrison;
  const defenseRating = territory.development.defense;

  // 전투력 계산
  const attackPower = attackTroops * (militaryStat / 50) * randomModifier();
  const defensePower = defenseTroops * (defenseRating / 50) * randomModifier();

  const attackerWins = attackPower > defensePower;

  // 손실 계산: 패배 측은 50~70%, 승리 측은 20~40% 손실
  const loserLossRate = 0.5 + Math.random() * 0.2;
  const winnerLossRate = 0.2 + Math.random() * 0.2;

  let attackerLosses: number;
  let defenderLosses: number;

  if (attackerWins) {
    attackerLosses = Math.floor(attackTroops * winnerLossRate);
    defenderLosses = Math.floor(defenseTroops * loserLossRate);
  } else {
    attackerLosses = Math.floor(attackTroops * loserLossRate);
    defenderLosses = Math.floor(defenseTroops * winnerLossRate);
  }

  // 결과 적용
  if (attackerWins) {
    // 영토 점령
    territory.owner = attacker.id;
    territory.garrison = Math.max(100, attackTroops - attackerLosses);

    // 세력 영토 목록 업데이트
    attacker.territories.push(territory.id);
    defender.territories = defender.territories.filter(id => id !== territory.id);
  } else {
    // 방어 성공: 방어 병력 손실만 반영
    territory.garrison = Math.max(100, defenseTroops - defenderLosses);
  }

  // 공격측 기존 영토 병력 감소 (투입 병력에서 손실분 차감)
  distributeLosses(attackerTerritories, attackerLosses);

  const leaderName = attackLeader ? attackLeader.name : '무명 장수';
  const log = attackerWins
    ? `⚔️ ${attacker.name}의 ${leaderName}이(가) ${territory.name}을(를) 점령! (아군 -${attackerLosses}, 적군 -${defenderLosses})`
    : `🛡️ ${defender.name}이(가) ${territory.name} 방어 성공! (공격측 -${attackerLosses}, 방어측 -${defenderLosses})`;

  return {
    victor: attackerWins ? 'attacker' : 'defender',
    attackerLosses,
    defenderLosses,
    territoryConquered: attackerWins,
    log,
  };
}

/**
 * 손실 병력을 보유 영토에 분산 적용
 */
function distributeLosses(territories: Territory[], totalLoss: number): void {
  let remaining = totalLoss;
  for (const t of territories) {
    if (remaining <= 0) break;
    const loss = Math.min(t.garrison - 100, remaining); // 최소 100명 유지
    if (loss > 0) {
      t.garrison -= loss;
      remaining -= loss;
    }
  }
}

/**
 * 공격 가능한 인접 적 영토 목록 반환
 */
export function getAttackableTargets(faction: Faction, gameState: GameState): Territory[] {
  const ownTerritoryIds = new Set(faction.territories);
  const adjacentEnemies: Territory[] = [];
  const seen = new Set<string>();

  for (const tid of ownTerritoryIds) {
    const t = gameState.territories.find(tt => tt.id === tid);
    if (!t) continue;
    for (const adjId of t.adjacentTo) {
      if (ownTerritoryIds.has(adjId) || seen.has(adjId)) continue;
      seen.add(adjId);
      const adj = gameState.territories.find(tt => tt.id === adjId);
      if (adj && adj.owner !== null && adj.owner !== faction.id) {
        adjacentEnemies.push(adj);
      }
    }
  }
  return adjacentEnemies;
}
