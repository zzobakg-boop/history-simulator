// ===== 역사 전략 시뮬레이터 핵심 타입 =====

/** 세력(국가/문명) */
export interface Faction {
  id: string;
  name: string;
  color: number;        // 0xRRGGBB
  isPlayer: boolean;
  resources: Resources;
  territories: string[];  // territory IDs
  leaders: Leader[];
}

/** 자원 */
export interface Resources {
  food: number;       // 식량
  gold: number;       // 금/재화
  culture: number;    // 문화력
  military: number;   // 군사력
  technology: number; // 기술력
}

/** 인물 (삼국지의 무장) */
export interface Leader {
  id: string;
  name: string;
  portrait?: string;  // 이미지 경로
  stats: {
    leadership: number;  // 통솔 (1-100)
    military: number;    // 무력 (1-100)
    diplomacy: number;   // 외교 (1-100)
    culture: number;     // 문화 (1-100)
    intelligence: number; // 지력 (1-100)
  };
  role: 'ruler' | 'general' | 'advisor' | 'governor';
}

/** 영토 (삼국지의 도시) */
export interface Territory {
  id: string;
  name: string;
  x: number;
  y: number;
  owner: string | null;  // faction ID
  population: number;
  development: {
    agriculture: number;  // 농업 (0-100)
    commerce: number;     // 상업 (0-100)
    defense: number;      // 방어 (0-100)
  };
  garrison: number;       // 주둔 병력
  adjacentTo: string[];   // 인접 영토 IDs
}

/** 게임 상태 */
export interface GameState {
  turn: number;
  year: number;           // 시나리오 내 연도
  phase: 'development' | 'diplomacy' | 'military' | 'event';
  currentFaction: string; // 현재 턴의 세력 ID
  factions: Faction[];
  territories: Territory[];
  events: GameEvent[];
  log: string[];          // 게임 로그
}

/** 이벤트 (교과서 핵심 사건) */
export interface GameEvent {
  id: string;
  triggerTurn: number;
  title: string;
  description: string;    // 교과서 설명
  textbookRef: string;    // 교과서 페이지/단원 참조
  choices?: EventChoice[];
  triggered: boolean;
}

export interface EventChoice {
  text: string;
  effect: Partial<Resources>;
  resultText: string;
}

/** 시나리오 정의 */
export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  textbookUnit: string;   // "Ⅰ. 문명의 발생"
  startYear: number;
  endYear: number;
  turnYears: number;      // 1턴 = N년
  factions: Faction[];
  territories: Territory[];
  events: GameEvent[];
  victoryConditions: VictoryCondition[];
}

export interface VictoryCondition {
  type: 'conquest' | 'culture' | 'technology' | 'survival';
  description: string;
  check: string;  // 조건 표현식 (런타임에 eval 또는 함수로)
}
