import type { Scenario } from '../game/types';

/**
 * 시나리오: 4대 문명의 경쟁
 * 교과서: 역사① Ⅱ단원 "문명의 발생과 고대 세계의 형성"
 * 교사가이드 E01~E03 기반 15턴 완결 구성
 */
export const SCENARIO_CIVILIZATIONS: Scenario = {
  id: 'four-civilizations',
  title: '4대 문명의 경쟁',
  subtitle: '강 유역에서 시작된 인류 최초의 문명들',
  textbookUnit: 'Ⅱ. 문명의 발생과 고대 세계의 형성',
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
    // 메소포타미아 (중앙 좌측, x: 380~520)
    { id: 'ur', name: '우르', x: 440, y: 400, owner: 'mesopotamia', population: 30000,
      development: { agriculture: 70, commerce: 50, defense: 40 }, garrison: 2000,
      adjacentTo: ['babylon', 'memphis'] },
    { id: 'babylon', name: '바빌론', x: 410, y: 280, owner: 'mesopotamia', population: 40000,
      development: { agriculture: 80, commerce: 60, defense: 50 }, garrison: 3000,
      adjacentTo: ['ur', 'nineveh'] },
    { id: 'nineveh', name: '니네베', x: 480, y: 170, owner: 'mesopotamia', population: 25000,
      development: { agriculture: 60, commerce: 40, defense: 60 }, garrison: 2500,
      adjacentTo: ['babylon', 'harappa'] },

    // 이집트 (좌측, x: 100~280)
    { id: 'memphis', name: '멤피스', x: 180, y: 250, owner: 'egypt', population: 35000,
      development: { agriculture: 85, commerce: 45, defense: 35 }, garrison: 2000,
      adjacentTo: ['thebes', 'alexandria', 'ur'] },
    { id: 'thebes', name: '테베', x: 150, y: 380, owner: 'egypt', population: 30000,
      development: { agriculture: 75, commerce: 55, defense: 30 }, garrison: 1500,
      adjacentTo: ['memphis', 'alexandria'] },
    { id: 'alexandria', name: '알렉산드리아', x: 240, y: 160, owner: 'egypt', population: 20000,
      development: { agriculture: 50, commerce: 70, defense: 40 }, garrison: 1000,
      adjacentTo: ['memphis', 'thebes'] },

    // 인더스 (중앙 우측, x: 620~760)
    { id: 'harappa', name: '하라파', x: 670, y: 220, owner: 'indus', population: 25000,
      development: { agriculture: 65, commerce: 60, defense: 25 }, garrison: 1000,
      adjacentTo: ['mohenjo-daro', 'nineveh'] },
    { id: 'mohenjo-daro', name: '모헨조다로', x: 700, y: 380, owner: 'indus', population: 30000,
      development: { agriculture: 70, commerce: 65, defense: 30 }, garrison: 1200,
      adjacentTo: ['harappa', 'xian'] },

    // 황허 (우측, x: 840~1000)
    { id: 'anyang', name: '안양(殷墟)', x: 890, y: 180, owner: 'yellow_river', population: 28000,
      development: { agriculture: 60, commerce: 35, defense: 50 }, garrison: 2500,
      adjacentTo: ['luoyang', 'xian'] },
    { id: 'luoyang', name: '뤄양', x: 920, y: 320, owner: 'yellow_river', population: 32000,
      development: { agriculture: 70, commerce: 40, defense: 45 }, garrison: 2000,
      adjacentTo: ['anyang', 'xian'] },
    { id: 'xian', name: '시안(호경)', x: 850, y: 440, owner: 'yellow_river', population: 22000,
      development: { agriculture: 55, commerce: 30, defense: 55 }, garrison: 1800,
      adjacentTo: ['anyang', 'luoyang', 'mohenjo-daro'] },
  ],

  events: [
    // ── 턴 1~3: 도입 — 문명 발생 조건 (인과사슬 1단계) ──
    {
      id: 'river_gift',
      triggerTurn: 1,
      title: '🌊 강의 선물',
      description: '매년 홍수가 찾아옵니다. 물이 빠진 뒤 비옥한 토양이 남습니다.\n\n교과서: "큰 강 유역에서는 홍수가 빠진 뒤 비옥한 토양이 남아 농업이 가능해졌다."',
      textbookRef: '역사① Ⅱ단원 1차시',
      choices: [
        { text: '관개 수로를 건설한다', effect: { food: 20, technology: 10, gold: -10 }, resultText: '관개 수로를 통해 물을 다스려 대규모 농업이 가능해졌습니다!' },
        { text: '자연에 맡기고 채집을 병행한다', effect: { food: 10 }, resultText: '자연 범람에 의존하여 소규모 농업을 시작했습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'agricultural_revolution',
      triggerTurn: 2,
      title: '🌾 농업 혁명',
      description: '정착 생활이 시작되었습니다. 잉여 생산물이 쌓이고 있습니다.\n\n교과서: "농업 혁명으로 잉여 생산물이 생기면서 사회가 변화하기 시작했다."',
      textbookRef: '역사① Ⅱ단원 1차시',
      choices: [
        { text: '농업 기술을 개발한다', effect: { food: 30, technology: 10 }, resultText: '새로운 농업 기술로 식량 생산이 비약적으로 증가했습니다!' },
        { text: '목축을 강화한다', effect: { food: 15, military: 10 }, resultText: '가축 사육이 발달하여 식량과 군사력이 함께 성장했습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'division_of_labor',
      triggerTurn: 3,
      title: '👥 분업의 시작',
      description: '잉여 식량 덕분에 모든 사람이 농사짓지 않아도 됩니다. 상인, 군인, 제사장 등 새로운 직업이 생겨납니다.\n\n교과서: "잉여 생산물이 생기자 분업이 이루어지고, 지배자와 피지배자로 나뉘는 계급이 나타났다."',
      textbookRef: '역사① Ⅱ단원 1차시',
      choices: [
        { text: '장인·사제를 양성한다', effect: { culture: 20, technology: 10 }, resultText: '전문 장인과 사제가 등장하여 문화와 기술이 발전했습니다!' },
        { text: '군사 계급을 강화한다', effect: { military: 20 }, resultText: '전문 군인 계급이 형성되어 군사력이 크게 성장했습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 4~6: 핵심 — 문명의 3요소 (인과사슬 2단계) ──
    {
      id: 'birth_of_city',
      triggerTurn: 4,
      title: '🏙️ 도시의 탄생',
      description: '사람들이 모여 살기 시작합니다. 도시가 형성됩니다.\n\n교과서: "문명의 3요소 — 도시, 문자, 국가. 많은 사람이 모여 도시를 이루었다."',
      textbookRef: '역사① Ⅱ단원 1차시',
      choices: [
        { text: '성벽을 건설하여 도시를 보호한다', effect: { food: -5, gold: -5, military: 10 }, resultText: '견고한 성벽으로 도시가 안전해졌습니다!' },
        { text: '시장을 개설하여 교역을 촉진한다', effect: { gold: 20, technology: 5 }, resultText: '시장이 열려 상업이 활성화되었습니다!' },
      ],
      triggered: false,
    },
    {
      id: 'invention_of_writing',
      triggerTurn: 5,
      title: '📜 문자의 발명',
      description: '기록의 필요성이 커집니다. 각 문명에서 고유한 문자가 탄생합니다.\n\n' +
        '메소포타미아: 젖은 점토에 갈대를 찍어 쐐기문자를 만들었습니다.\n' +
        '이집트: 파피루스 위에 상형문자를 기록했습니다.\n' +
        '인더스: 아직 해독되지 않은 독자적 문자를 사용했습니다.\n' +
        '황허: 거북 등껍질과 소뼈에 갑골문자를 새겼습니다.',
      textbookRef: '역사① Ⅱ단원 1차시',
      choices: [
        { text: '문자 체계를 정비하고 교육한다', effect: { culture: 20, technology: 15 }, resultText: '문자가 체계화되어 법률, 종교, 과학이 기록되기 시작했습니다!' },
        { text: '구전 전통을 유지한다', effect: { culture: 10 }, resultText: '구전 전통이 이어져 풍부한 이야기가 전해졌습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'formation_of_state',
      triggerTurn: 6,
      title: '⚖️ 국가의 형성',
      description: '권력이 집중되고 법이 만들어집니다. 왕이 등장하여 국가를 다스립니다.\n\n교과서: "관개 농업을 위해 수백 명이 협력해야 했고, 그 협력을 지휘할 지도자가 필요했다. 이것이 왕의 시작이다."',
      textbookRef: '역사① Ⅱ단원 1차시',
      choices: [
        { text: '법전을 편찬하여 질서를 세운다', effect: { culture: 20, gold: 10 }, resultText: '성문법이 만들어져 사회 질서가 확립되었습니다!' },
        { text: '군사 정복을 확대한다', effect: { military: 20 }, resultText: '강력한 군사력으로 영토를 넓혔습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 7~9: 비교 — 4대 문명 특징 ──
    {
      id: 'flower_of_civilization',
      triggerTurn: 7,
      title: '🏛️ 문명의 꽃',
      description: '각 문명의 대표적 업적이 나타납니다.\n\n' +
        '메소포타미아: 함무라비 법전 — "눈에는 눈, 이에는 이" 원칙. 단, 신분에 따라 처벌이 달랐습니다.\n' +
        '이집트: 피라미드 — 파라오의 강력한 왕권과 내세 신앙의 상징.\n' +
        '인더스: 모헨조다로 계획도시 — 바둑판 도로와 상하수도 시설.\n' +
        '황허: 갑골문자와 청동 제기 — 신권 정치의 증거.',
      textbookRef: '역사① Ⅱ단원 2~3차시',
      choices: [
        { text: '문화 업적에 투자한다', effect: { culture: 25, technology: 10, gold: -10 }, resultText: '후세에 길이 남을 위대한 업적이 탄생했습니다!' },
        { text: '실용적 발전에 집중한다', effect: { food: 15, gold: 15 }, resultText: '실용적 발전으로 경제가 안정되었습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'trade_routes',
      triggerTurn: 8,
      title: '⛵ 교역로의 개척',
      description: '다른 문명과의 교류가 시작됩니다. 메소포타미아와 인더스 사이 해상 교역이 활발합니다.\n\n교과서: "고대 문명들은 교역을 통해 서로 영향을 주고받으며 발전하였다."',
      textbookRef: '역사① Ⅱ단원 2차시',
      choices: [
        { text: '적극적으로 교역한다', effect: { gold: 20, culture: 10 }, resultText: '교역을 통해 부와 문화가 함께 성장했습니다!' },
        { text: '폐쇄 정책을 유지한다', effect: { military: 10 }, resultText: '외부 위협으로부터 문명을 지켰습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'religion_and_thought',
      triggerTurn: 9,
      title: '🙏 종교와 사상',
      description: '신앙 체계가 형성됩니다.\n\n' +
        '메소포타미아: 다신교, 현세적 종교관. 지구라트(계단식 신전) 건설.\n' +
        '이집트: 파라오=살아있는 신(신권 정치), 내세적 종교관. 미라와 사자의 서.\n' +
        '인더스: 아리아인 이주 후 카스트제 형성. 브라만교 발달.\n' +
        '황허: 갑골 점술로 신의 뜻을 묻는 신권 정치. 조상 숭배.',
      textbookRef: '역사① Ⅱ단원 2~3차시',
      choices: [
        { text: '종교를 체계화하여 사회를 통합한다', effect: { culture: 25, military: 5, gold: -5 }, resultText: '종교가 사회 통합의 핵심 수단이 되었습니다!' },
        { text: '다양한 신앙을 허용한다', effect: { culture: 15, gold: 15 }, resultText: '종교적 관용으로 교류가 활발해졌습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 10~12: 활동 — 전투/외교/교역 자유 턴 (이벤트 없음, 퀴즈는 계속) ──
    // 턴 10~12는 이벤트 없이 자유 플레이 + 퀴즈

    // ── 턴 13~15: 정리 — 문명 성적표 + 엔딩 ──
    {
      id: 'crisis_of_civilization',
      triggerTurn: 13,
      title: '⚔️ 문명의 위기',
      description: '외부 세력의 침입 또는 내부 분열로 문명이 위기에 처합니다.\n\n' +
        '메소포타미아: 히타이트의 철제 무기 앞에 무너질 위험.\n' +
        '이집트: 외부 침입으로 파라오의 권위가 흔들립니다.\n' +
        '인더스: 기후 변화와 외부 세력으로 도시가 쇠퇴합니다.\n' +
        '황허: 주(周)나라의 봉건제가 흔들리고 춘추전국 시대가 다가옵니다.',
      textbookRef: '역사① Ⅱ단원 2~3차시',
      choices: [
        { text: '방어를 강화하여 문명을 지킨다', effect: { military: 20, gold: -10 }, resultText: '외부 위협에 맞서 문명을 수호했습니다!' },
        { text: '외교로 해결한다', effect: { culture: 15, gold: 10 }, resultText: '외교적 수완으로 위기를 넘겼습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'legacy_of_civilization',
      triggerTurn: 14,
      title: '📚 유산의 정리',
      description: '우리 문명이 후대에 남긴 것은 무엇일까요?\n\n' +
        '메소포타미아: 쐐기문자, 함무라비 법전, 60진법(시계), 태음력\n' +
        '이집트: 상형문자, 피라미드, 미라, 태양력(365일), 기하학\n' +
        '인더스: 계획도시, 도량형 통일, 미해독 문자\n' +
        '황허: 갑골문자(한자의 기원), 청동기 문화, 봉건제, 천명 사상',
      textbookRef: '역사① Ⅱ단원 1~3차시',
      choices: [
        { text: '문화유산을 보존하고 기록한다', effect: { culture: 20, technology: 10 }, resultText: '문명의 유산이 후대에 길이 전해졌습니다!' },
        { text: '새로운 발전 방향을 모색한다', effect: { technology: 20, gold: 10 }, resultText: '기존 유산을 바탕으로 새로운 도약을 준비했습니다.' },
      ],
      triggered: false,
    },
    // 턴 15: 게임 종료 — MapScene에서 자동 처리
  ],

  victoryConditions: [
    { type: 'culture', description: '문화력 200 이상 달성', check: 'culture >= 200' },
    { type: 'conquest', description: '전체 영토의 60% 이상 지배', check: 'territories >= 60%' },
    { type: 'technology', description: '기술력 150 이상 달성', check: 'technology >= 150' },
  ],
};
