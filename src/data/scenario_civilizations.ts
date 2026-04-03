import type { Scenario } from '../game/types';

/**
 * 시나리오: 4대 문명의 경쟁
 * 교과서: 역사① Ⅰ단원 "문명의 발생과 고대 세계의 형성"
 */
export const SCENARIO_CIVILIZATIONS: Scenario = {
  id: 'four-civilizations',
  title: '4대 문명의 경쟁',
  subtitle: '강 유역에서 시작된 인류 최초의 문명들',
  textbookUnit: 'Ⅰ. 문명의 발생과 고대 세계의 형성',
  startYear: -3500,
  endYear: -500,
  turnYears: 100,  // 1턴 = 100년

  factions: [
    {
      id: 'mesopotamia',
      name: '메소포타미아',
      color: 0xd4a574,
      isPlayer: false,
      resources: { food: 60, gold: 40, culture: 50, military: 30, technology: 50 },
      territories: ['ur', 'babylon', 'nineveh'],
      leaders: [
        {
          id: 'hammurabi',
          name: '함무라비',
          stats: { leadership: 85, military: 60, diplomacy: 70, culture: 80, intelligence: 90 },
          role: 'ruler',
        },
      ],
    },
    {
      id: 'egypt',
      name: '이집트',
      color: 0xf0c040,
      isPlayer: false,
      resources: { food: 70, gold: 50, culture: 60, military: 40, technology: 40 },
      territories: ['memphis', 'thebes', 'alexandria'],
      leaders: [
        {
          id: 'pharaoh',
          name: '파라오 (쿠푸)',
          stats: { leadership: 80, military: 50, diplomacy: 60, culture: 90, intelligence: 70 },
          role: 'ruler',
        },
      ],
    },
    {
      id: 'indus',
      name: '인더스',
      color: 0x60b060,
      isPlayer: false,
      resources: { food: 50, gold: 60, culture: 40, military: 20, technology: 60 },
      territories: ['harappa', 'mohenjo-daro'],
      leaders: [
        {
          id: 'indus_leader',
          name: '도시 장로',
          stats: { leadership: 60, military: 30, diplomacy: 80, culture: 70, intelligence: 75 },
          role: 'ruler',
        },
      ],
    },
    {
      id: 'yellow_river',
      name: '황허 문명',
      color: 0xe05050,
      isPlayer: false,
      resources: { food: 65, gold: 35, culture: 45, military: 50, technology: 45 },
      territories: ['anyang', 'luoyang', 'xian'],
      leaders: [
        {
          id: 'shang_king',
          name: '상(商)왕',
          stats: { leadership: 75, military: 70, diplomacy: 50, culture: 60, intelligence: 65 },
          role: 'ruler',
        },
      ],
    },
  ],

  territories: [
    // 메소포타미아
    { id: 'ur', name: '우르', x: 580, y: 340, owner: 'mesopotamia', population: 30000,
      development: { agriculture: 70, commerce: 50, defense: 40 }, garrison: 2000,
      adjacentTo: ['babylon', 'memphis'] },
    { id: 'babylon', name: '바빌론', x: 560, y: 300, owner: 'mesopotamia', population: 40000,
      development: { agriculture: 80, commerce: 60, defense: 50 }, garrison: 3000,
      adjacentTo: ['ur', 'nineveh'] },
    { id: 'nineveh', name: '니네베', x: 550, y: 260, owner: 'mesopotamia', population: 25000,
      development: { agriculture: 60, commerce: 40, defense: 60 }, garrison: 2500,
      adjacentTo: ['babylon'] },

    // 이집트
    { id: 'memphis', name: '멤피스', x: 440, y: 340, owner: 'egypt', population: 35000,
      development: { agriculture: 85, commerce: 45, defense: 35 }, garrison: 2000,
      adjacentTo: ['thebes', 'ur'] },
    { id: 'thebes', name: '테베', x: 450, y: 400, owner: 'egypt', population: 30000,
      development: { agriculture: 75, commerce: 55, defense: 30 }, garrison: 1500,
      adjacentTo: ['memphis', 'alexandria'] },
    { id: 'alexandria', name: '알렉산드리아', x: 420, y: 310, owner: 'egypt', population: 20000,
      development: { agriculture: 50, commerce: 70, defense: 40 }, garrison: 1000,
      adjacentTo: ['thebes', 'memphis'] },

    // 인더스
    { id: 'harappa', name: '하라파', x: 720, y: 300, owner: 'indus', population: 25000,
      development: { agriculture: 65, commerce: 60, defense: 25 }, garrison: 1000,
      adjacentTo: ['mohenjo-daro'] },
    { id: 'mohenjo-daro', name: '모헨조다로', x: 710, y: 360, owner: 'indus', population: 30000,
      development: { agriculture: 70, commerce: 65, defense: 30 }, garrison: 1200,
      adjacentTo: ['harappa'] },

    // 황허
    { id: 'anyang', name: '안양(殷墟)', x: 920, y: 280, owner: 'yellow_river', population: 28000,
      development: { agriculture: 60, commerce: 35, defense: 50 }, garrison: 2500,
      adjacentTo: ['luoyang', 'xian'] },
    { id: 'luoyang', name: '뤄양', x: 900, y: 310, owner: 'yellow_river', population: 32000,
      development: { agriculture: 70, commerce: 40, defense: 45 }, garrison: 2000,
      adjacentTo: ['anyang', 'xian'] },
    { id: 'xian', name: '시안(호경)', x: 870, y: 300, owner: 'yellow_river', population: 22000,
      development: { agriculture: 55, commerce: 30, defense: 55 }, garrison: 1800,
      adjacentTo: ['anyang', 'luoyang'] },
  ],

  events: [
    {
      id: 'writing_invention',
      triggerTurn: 2,
      title: '📜 문자의 발명',
      description: '메소포타미아에서 쐐기 문자가, 이집트에서 상형 문자가 만들어졌습니다.\n\n교과서: "문자의 발명으로 기록이 가능해지면서 법률, 종교, 과학 등이 발달하였다."',
      textbookRef: 'Ⅰ-1. 문명의 발생',
      choices: [
        { text: '문자 교육에 투자한다', effect: { culture: 20, technology: 15 }, resultText: '문화력과 기술력이 크게 상승했습니다!' },
        { text: '군사 기록에 활용한다', effect: { military: 15, technology: 10 }, resultText: '군사 전략이 체계화되었습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'hammurabi_code',
      triggerTurn: 5,
      title: '⚖️ 함무라비 법전',
      description: '바빌로니아의 함무라비 왕이 282조의 법전을 만들었습니다.\n\n교과서: "함무라비 법전은 현존하는 가장 오래된 성문법 중 하나로, 사회 질서를 유지하기 위해 만들어졌다."',
      textbookRef: 'Ⅰ-1. 메소포타미아 문명',
      choices: [
        { text: '법을 엄격하게 적용한다', effect: { gold: 10, military: 10, culture: -5 }, resultText: '질서가 잡혔지만 백성들의 불만도 생겼습니다.' },
        { text: '법을 통해 교역을 촉진한다', effect: { gold: 20, culture: 10 }, resultText: '상업이 크게 발달했습니다!' },
      ],
      triggered: false,
    },
    {
      id: 'pyramid_building',
      triggerTurn: 3,
      title: '🏛️ 피라미드 건설',
      description: '이집트에서 거대한 피라미드 건설이 시작되었습니다.\n\n교과서: "피라미드는 파라오의 강력한 왕권을 보여 주며, 높은 수준의 건축 기술과 수학적 지식을 반영한다."',
      textbookRef: 'Ⅰ-1. 이집트 문명',
      choices: [
        { text: '대규모 피라미드를 건설한다', effect: { culture: 30, food: -15, gold: -10 }, resultText: '후세에 길이 남을 위대한 건축물이 완성되었습니다!' },
        { text: '규모를 줄이고 관개 시설에 투자한다', effect: { food: 20, culture: 10 }, resultText: '농업 생산량이 크게 증가했습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'indus_urban_planning',
      triggerTurn: 4,
      title: '🏙️ 계획 도시 건설',
      description: '인더스 문명에서 놀라울 정도로 정교한 도시 계획이 이루어졌습니다.\n\n교과서: "모헨조다로는 바둑판 모양의 도로, 상하수도 시설 등 뛰어난 도시 계획을 보여 준다."',
      textbookRef: 'Ⅰ-1. 인더스 문명',
      choices: [
        { text: '하수도 시스템을 더 확장한다', effect: { technology: 20, culture: 10 }, resultText: '위생 환경이 개선되어 인구가 증가했습니다!' },
        { text: '교역 항구를 건설한다', effect: { gold: 25, technology: 5 }, resultText: '해상 교역이 활성화되었습니다.' },
      ],
      triggered: false,
    },
  ],

  victoryConditions: [
    { type: 'culture', description: '문화력 200 이상 달성', check: 'culture >= 200' },
    { type: 'conquest', description: '전체 영토의 60% 이상 지배', check: 'territories >= 60%' },
    { type: 'technology', description: '기술력 150 이상 달성', check: 'technology >= 150' },
  ],
};
