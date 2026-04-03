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
    // ── 턴 1~5: 문명 초기 ──
    {
      id: 'irrigation_development',
      triggerTurn: 1,
      title: '🌾 관개 기술의 발전',
      description: '강 유역의 문명들이 물을 다스리는 기술을 발전시켰습니다.\n\n교과서: "큰 강 유역에서는 관개 농업이 발달하면서 잉여 생산물이 생겨났고, 이를 바탕으로 도시가 형성되었다."',
      textbookRef: 'Ⅰ-1. 문명의 발생',
      choices: [
        { text: '대규모 관개 수로를 건설한다', effect: { food: 25, technology: 10, gold: -5 }, resultText: '농업 생산량이 비약적으로 증가하여 인구가 늘어났습니다!' },
        { text: '기존 수로를 효율적으로 정비한다', effect: { food: 15, gold: 10 }, resultText: '안정적인 식량 공급이 이루어졌습니다.' },
      ],
      triggered: false,
    },
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

    // ── 턴 6~10: 문명 발전기 ──
    {
      id: 'ziggurat_construction',
      triggerTurn: 7,
      title: '🛕 지구라트 건설',
      description: '메소포타미아의 도시들에 거대한 신전 탑 지구라트가 세워졌습니다.\n\n교과서: "메소포타미아 사람들은 다신교를 믿었으며, 도시마다 수호신을 모시는 신전인 지구라트를 세웠다."',
      textbookRef: 'Ⅰ-1. 메소포타미아 문명',
      choices: [
        { text: '도시마다 거대한 지구라트를 세운다', effect: { culture: 25, gold: -10, food: -5 }, resultText: '신관 계급이 강화되고 종교 문화가 번성했습니다!' },
        { text: '작은 규모로 짓고 남은 자원을 비축한다', effect: { culture: 10, gold: 10 }, resultText: '실용적인 판단으로 도시 재정이 안정되었습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'bronze_age',
      triggerTurn: 8,
      title: '⚒️ 청동기의 보급',
      description: '청동 도구와 무기가 널리 보급되면서 사회에 큰 변화가 일어났습니다.\n\n교과서: "청동기의 사용으로 농업 생산력이 높아지고, 강력한 무기를 가진 지배 계급이 등장하여 계급 사회가 형성되었다."',
      textbookRef: 'Ⅰ-1. 문명의 발생',
      choices: [
        { text: '청동 무기 생산에 집중한다', effect: { military: 25, technology: 10 }, resultText: '강력한 군대를 갖추어 주변 세력을 압도했습니다!' },
        { text: '청동 농기구 보급에 집중한다', effect: { food: 20, technology: 10 }, resultText: '농업 생산력이 크게 향상되었습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'nile_flood_astronomy',
      triggerTurn: 9,
      title: '🌊 나일강 범람과 천문학',
      description: '이집트인들이 나일강의 주기적 범람을 예측하기 위해 천문학을 발전시켰습니다.\n\n교과서: "이집트인들은 나일강의 범람 시기를 알기 위해 천문학을 발달시켰고, 태양력을 만들었다."',
      textbookRef: 'Ⅰ-1. 이집트 문명',
      choices: [
        { text: '태양력 체계를 확립하고 보급한다', effect: { technology: 20, culture: 15 }, resultText: '정확한 달력으로 농사 시기를 예측할 수 있게 되었습니다!' },
        { text: '범람 시기에 맞춘 대규모 경작지를 개발한다', effect: { food: 25, gold: 5 }, resultText: '비옥한 토양을 최대한 활용하여 풍요를 누렸습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'oracle_bone_script',
      triggerTurn: 10,
      title: '🦴 갑골 문자와 점술',
      description: '황허 문명의 상(殷)나라에서 거북의 등껍질과 소의 뼈에 글자를 새겨 점을 쳤습니다.\n\n교과서: "상(은)은 갑골에 문자를 새겨 점을 치는 신권 정치를 하였다."',
      textbookRef: 'Ⅰ-1. 황허 문명',
      choices: [
        { text: '점술을 국가 의사 결정에 적극 활용한다', effect: { culture: 20, military: 10 }, resultText: '신권 정치가 강화되어 왕의 권위가 높아졌습니다!' },
        { text: '갑골 문자를 기록 체계로 발전시킨다', effect: { technology: 20, culture: 10 }, resultText: '문자 체계가 정교해져 행정이 효율화되었습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 11~15: 중기 ──
    {
      id: 'maritime_trade_network',
      triggerTurn: 12,
      title: '⛵ 해상 교역망 형성',
      description: '메소포타미아와 인더스 문명 사이에 활발한 해상 교역로가 열렸습니다.\n\n교과서: "메소포타미아와 인더스 문명은 해상 교역을 통해 서로 영향을 주고받았다."',
      textbookRef: 'Ⅰ-1. 문명 간 교류',
      choices: [
        { text: '대규모 무역 선단을 조직한다', effect: { gold: 30, technology: 10, military: -5 }, resultText: '원거리 교역으로 막대한 부를 축적했습니다!' },
        { text: '교역품의 품질을 높여 수출한다', effect: { gold: 15, culture: 15 }, resultText: '문명의 명성이 교역로를 따라 퍼져나갔습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'polytheism_to_monotheism',
      triggerTurn: 14,
      title: '🙏 종교의 발전',
      description: '각 문명에서 다양한 종교가 발달하고 있습니다. 자연 현상에 대한 경외심에서 시작된 다신교가 체계화되었습니다.\n\n교과서: "고대 문명에서는 자연 현상을 신격화한 다신교가 일반적이었으며, 이후 일신교의 흐름도 나타났다."',
      textbookRef: 'Ⅰ-1. 고대 세계의 종교',
      choices: [
        { text: '신관 계급을 강화하여 종교를 체계화한다', effect: { culture: 25, military: 5, gold: -5 }, resultText: '종교가 사회 통합의 핵심 수단이 되었습니다!' },
        { text: '다양한 신앙을 허용하여 교류를 촉진한다', effect: { culture: 15, gold: 15 }, resultText: '종교적 관용으로 다른 문명과의 교류가 활발해졌습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'caste_system',
      triggerTurn: 15,
      title: '🔺 카스트 제도의 형성',
      description: '인더스 문명이 쇠퇴한 뒤, 아리아인이 들어오면서 엄격한 신분 제도가 만들어졌습니다.\n\n교과서: "아리아인은 카스트라는 엄격한 신분 제도를 만들어 브라만(사제), 크샤트리아(무사), 바이샤(평민), 수드라(노예) 등으로 나누었다."',
      textbookRef: 'Ⅰ-1. 인도의 고대 문명',
      choices: [
        { text: '카스트 제도를 도입하여 사회를 안정시킨다', effect: { military: 15, culture: 10, food: -5 }, resultText: '사회 질서가 확립되었지만 하층민의 불만이 쌓였습니다.' },
        { text: '기존 인더스 전통을 유지하며 신분을 유연하게 한다', effect: { culture: 15, gold: 10 }, resultText: '다양한 계층의 교류로 상업이 발달했습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 16~20: 변혁기 ──
    {
      id: 'indus_decline',
      triggerTurn: 17,
      title: '💨 인더스 문명의 쇠퇴',
      description: '한때 번성했던 인더스 문명이 급격히 쇠퇴하기 시작합니다.\n\n교과서: "인더스 문명은 기원전 1500년경 급격히 쇠퇴하였는데, 기후 변화, 홍수, 외부 세력의 침입 등이 원인으로 추정된다."',
      textbookRef: 'Ⅰ-1. 인더스 문명',
      choices: [
        { text: '새로운 정착지를 찾아 이주한다', effect: { food: 10, technology: 5, military: -10 }, resultText: '갠지스강 유역으로 이주하여 새로운 터전을 마련했습니다.' },
        { text: '도시를 재건하고 방어를 강화한다', effect: { military: 15, gold: -10 }, resultText: '도시를 지키기 위해 자원을 집중했습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'shang_to_zhou',
      triggerTurn: 19,
      title: '⚔️ 은(殷) 멸망과 주(周) 건국',
      description: '주(周)나라 무왕이 은(상)나라를 무너뜨리고 새 왕조를 세웠습니다.\n\n교과서: "주(周)는 봉건제를 실시하여 왕족과 공신에게 토지를 나누어 다스리게 하였다."',
      textbookRef: 'Ⅰ-1. 황허 문명',
      choices: [
        { text: '봉건제를 도입하여 영토를 나눠 다스린다', effect: { gold: 15, culture: 15, military: -5 }, resultText: '봉건제로 광대한 영토를 효과적으로 통치했습니다!' },
        { text: '중앙집권을 강화하여 왕권을 높인다', effect: { military: 20, culture: 5, gold: -5 }, resultText: '강력한 왕권으로 신속한 의사 결정이 가능해졌습니다.' },
      ],
      triggered: false,
    },
    {
      id: 'phoenician_alphabet',
      triggerTurn: 20,
      title: '🔤 페니키아 알파벳의 전파',
      description: '지중해 동쪽 해안의 페니키아 상인들이 간편한 표음 문자 알파벳을 만들어 퍼뜨렸습니다.\n\n교과서: "페니키아인들은 알파벳을 만들었는데, 이것이 그리스를 거쳐 오늘날 로마자(라틴 문자)의 기원이 되었다."',
      textbookRef: 'Ⅰ-1. 지중해 문명',
      choices: [
        { text: '알파벳을 도입하여 행정 효율을 높인다', effect: { technology: 20, culture: 10 }, resultText: '간편한 문자 체계로 문서 행정이 혁신되었습니다!' },
        { text: '기존 문자 전통을 고수한다', effect: { culture: 15, military: 5 }, resultText: '전통 문자의 깊이가 더해져 문화적 정체성이 강화되었습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 21~25: 후기 ──
    {
      id: 'iron_age',
      triggerTurn: 22,
      title: '🗡️ 철기 시대의 도래',
      description: '히타이트가 독점하던 철기 제조 기술이 각지로 퍼져나갔습니다.\n\n교과서: "철기의 보급으로 농업 생산력이 더욱 높아졌고, 강력한 무기를 갖춘 대제국이 등장하는 배경이 되었다."',
      textbookRef: 'Ⅰ-1. 고대 세계의 변화',
      choices: [
        { text: '철제 무기 대량 생산에 착수한다', effect: { military: 30, technology: 15, gold: -10 }, resultText: '철기 군대로 주변 세력을 압도했습니다!' },
        { text: '철제 농기구를 보급한다', effect: { food: 25, technology: 10 }, resultText: '농업 혁명으로 인구가 급증했습니다.' },
      ],
      triggered: false,
    },

    // ── 턴 26~30: 말기 ──
    {
      id: 'grand_trade_route',
      triggerTurn: 26,
      title: '🐫 대규모 교역로 완성',
      description: '4대 문명을 잇는 교역로가 체계화되어 물자와 문화가 활발히 오갔습니다.\n\n교과서: "고대 문명들은 교역을 통해 서로 영향을 주고받으며 발전하였다."',
      textbookRef: 'Ⅰ-1. 문명 간 교류',
      choices: [
        { text: '교역 거점 도시를 대대적으로 육성한다', effect: { gold: 30, culture: 10 }, resultText: '교역 중심지로 성장하여 엄청난 부를 축적했습니다!' },
        { text: '교역로 경비를 강화하여 안전을 확보한다', effect: { military: 15, gold: 15 }, resultText: '안전한 교역로로 상인들이 몰려들었습니다.' },
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
