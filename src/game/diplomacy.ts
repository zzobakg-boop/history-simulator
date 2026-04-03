// ===== 외교 시스템 =====
import type {
  DiplomaticRelation,
  TradeProposal,
  TradeResult,
  AllianceResult,
  Faction,
  Resources,
} from './types';

/**
 * 외교 관계 저장소
 * 키: "factionA::factionB" (알파벳 순 정렬)
 */
const relations: Map<string, DiplomaticRelation> = new Map();

/** 관계 키 생성 (항상 알파벳 순으로 정렬) */
function makeKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

/**
 * 두 세력 간 관계 수치 조회 (-100 ~ 100)
 * 관계가 없으면 0(중립)으로 초기화
 */
export function getRelation(factionA: string, factionB: string): number {
  if (factionA === factionB) return 100;
  const key = makeKey(factionA, factionB);
  const rel = relations.get(key);
  return rel ? rel.value : 0;
}

/**
 * 두 세력 간 관계 수치 설정
 */
export function setRelation(factionA: string, factionB: string, value: number): void {
  if (factionA === factionB) return;
  const key = makeKey(factionA, factionB);
  const clamped = Math.max(-100, Math.min(100, value));
  relations.set(key, {
    factionA: factionA < factionB ? factionA : factionB,
    factionB: factionA < factionB ? factionB : factionA,
    value: clamped,
  });
}

/**
 * 관계 수치 변동 (현재 값에 delta 추가)
 */
export function changeRelation(factionA: string, factionB: string, delta: number): number {
  const current = getRelation(factionA, factionB);
  const newValue = Math.max(-100, Math.min(100, current + delta));
  setRelation(factionA, factionB, newValue);
  return newValue;
}

/**
 * 턴 종료 시 모든 관계 자연 감소 (-2)
 */
export function decayAllRelations(): void {
  for (const [key, rel] of relations) {
    // 중립(0) 방향으로 감소
    if (rel.value > 0) {
      rel.value = Math.max(0, rel.value - 2);
    } else if (rel.value < 0) {
      rel.value = Math.min(0, rel.value + 2);
    }
    relations.set(key, rel);
  }
}

/**
 * 교역 제안
 * - 관계가 적대(-30 이하)면 자동 거절
 * - 제안의 가치 균형과 관계 수치로 수락 여부 결정
 */
export function proposeTrade(
  proposal: TradeProposal,
  factions: Faction[],
): TradeResult {
  const relation = getRelation(proposal.from, proposal.to);
  const receiver = factions.find(f => f.id === proposal.to);

  if (!receiver) {
    return { accepted: false, reason: '대상 세력을 찾을 수 없습니다.' };
  }

  // 적대 관계면 거절
  if (relation <= -30) {
    return { accepted: false, reason: '적대 관계로 교역이 거부되었습니다.' };
  }

  // 자원 가치 평가 (단순 합산)
  const offerValue = sumResources(proposal.offer);
  const demandValue = sumResources(proposal.demand);

  // 수신측이 요구 자원을 보유하고 있는지 확인
  if (!hasEnoughResources(receiver.resources, proposal.demand)) {
    return { accepted: false, reason: '대상 세력의 자원이 부족합니다.' };
  }

  // 관계가 좋을수록 불리한 거래도 수락 (관계 보너스)
  const relationBonus = relation * 0.3;
  const acceptThreshold = demandValue - offerValue - relationBonus;

  if (acceptThreshold > 20) {
    return { accepted: false, reason: '제안 조건이 불리하여 거절되었습니다.' };
  }

  // 교역 실행
  const sender = factions.find(f => f.id === proposal.from);
  if (!sender) {
    return { accepted: false, reason: '제안 세력을 찾을 수 없습니다.' };
  }

  applyResourceTransfer(sender.resources, proposal.offer, proposal.demand);
  applyResourceTransfer(receiver.resources, proposal.demand, proposal.offer);

  // 관계 개선
  changeRelation(proposal.from, proposal.to, 5);

  return { accepted: true, reason: '교역이 성사되었습니다!' };
}

/**
 * 동맹 제안
 * - 관계 50 이상이면 수락
 * - 관계 20~50이면 외교력 스탯에 따라 확률적 수락
 * - 관계 20 미만이면 거절
 */
export function proposeAlliance(
  fromFaction: Faction,
  toFaction: Faction,
): AllianceResult {
  const relation = getRelation(fromFaction.id, toFaction.id);

  if (relation >= 80) {
    return { accepted: true, newRelationValue: relation, reason: '이미 우호적 관계입니다.' };
  }

  if (relation < 20) {
    return {
      accepted: false,
      newRelationValue: relation,
      reason: '관계가 너무 나빠 동맹을 거절했습니다.',
    };
  }

  // 제안측의 외교 능력 반영
  const diplomat = fromFaction.leaders.reduce<number>(
    (best, l) => Math.max(best, l.stats.diplomacy),
    0,
  );
  const acceptChance = (relation - 20) / 30 + diplomat / 200; // 0~1 + 보너스

  if (Math.random() < acceptChance) {
    const newValue = changeRelation(fromFaction.id, toFaction.id, 30);
    return {
      accepted: true,
      newRelationValue: newValue,
      reason: `${toFaction.name}이(가) 동맹을 수락했습니다!`,
    };
  }

  return {
    accepted: false,
    newRelationValue: relation,
    reason: `${toFaction.name}이(가) 동맹 제안을 거절했습니다.`,
  };
}

/**
 * 동맹 파기: 관계 대폭 하락
 */
export function breakAlliance(factionA: string, factionB: string): number {
  return changeRelation(factionA, factionB, -50);
}

/**
 * 전쟁 선포: 관계를 적대로 설정
 */
export function declareWar(factionA: string, factionB: string): void {
  setRelation(factionA, factionB, -80);
}

/**
 * 모든 관계 초기화 (새 게임 시작 시)
 */
export function resetAllRelations(): void {
  relations.clear();
}

// ===== 유틸리티 =====

function sumResources(res: Partial<Resources>): number {
  return (res.food ?? 0) + (res.gold ?? 0) + (res.culture ?? 0)
    + (res.military ?? 0) + (res.technology ?? 0);
}

function hasEnoughResources(
  current: Resources,
  required: Partial<Resources>,
): boolean {
  for (const key of Object.keys(required) as (keyof Resources)[]) {
    if ((required[key] ?? 0) > current[key]) return false;
  }
  return true;
}

function applyResourceTransfer(
  resources: Resources,
  give: Partial<Resources>,
  receive: Partial<Resources>,
): void {
  for (const key of Object.keys(give) as (keyof Resources)[]) {
    resources[key] -= give[key] ?? 0;
  }
  for (const key of Object.keys(receive) as (keyof Resources)[]) {
    resources[key] += receive[key] ?? 0;
  }
}
