/**
 * 승리 조건별 엔딩 텍스트
 * 교과서: 비상교육 역사① Ⅰ단원 "문명의 발생과 고대 세계의 형성"
 *
 * 각 세력별 2개 엔딩:
 *   - orthodox: 교과서 역사대로 진행한 "정사 엔딩" (보너스 문화력)
 *   - alternate: 가상 역사 엔딩 (재미있는 IF 역사)
 */

export interface Ending {
  id: string;
  factionId: string;
  type: 'orthodox' | 'alternate';
  title: string;
  description: string;
  cultureBonus: number;
  textbookRef: string;
}

export const ENDINGS: Ending[] = [
  // ══════════ 메소포타미아 ══════════
  {
    id: 'mesopotamia_orthodox',
    factionId: 'mesopotamia',
    type: 'orthodox',
    title: '📜 법과 문자의 요람 — 정사 엔딩',
    description:
      '메소포타미아는 교과서 역사 그대로 흘러갔습니다.\n\n' +
      '쐐기 문자와 함무라비 법전, 지구라트로 대표되는 이 문명은 이후 아시리아와 페르시아로 이어지며 ' +
      '고대 오리엔트 세계의 중심이 되었습니다.\n\n' +
      '교과서: "메소포타미아 문명은 법률, 문자, 천문학 등 다양한 분야에서 인류 문명의 토대를 놓았다."\n\n' +
      '🎓 정사 보너스: 문화력 +30',
    cultureBonus: 30,
    textbookRef: 'Ⅰ-1. 메소포타미아 문명',
  },
  {
    id: 'mesopotamia_alternate',
    factionId: 'mesopotamia',
    type: 'alternate',
    title: '🌍 바빌론 대제국 — 가상 역사 엔딩',
    description:
      '역사는 전혀 다른 길을 걸었습니다!\n\n' +
      '바빌론은 페르시아의 등장 전에 이미 지중해에서 인더스강까지 아우르는 거대 제국을 건설했습니다. ' +
      '함무라비 법전은 세계 공용법이 되었고, 쐐기 문자는 국제 공용 문자가 되었습니다.\n\n' +
      '"만약 바빌론이 분열되지 않았다면?" — 고대 세계의 통일은 수천 년 앞당겨졌을지 모릅니다.',
    cultureBonus: 0,
    textbookRef: 'Ⅰ-1. 메소포타미아 문명',
  },

  // ══════════ 이집트 ══════════
  {
    id: 'egypt_orthodox',
    factionId: 'egypt',
    type: 'orthodox',
    title: '🏛️ 나일의 선물 — 정사 엔딩',
    description:
      '이집트는 교과서 역사 그대로 전개되었습니다.\n\n' +
      '파라오의 강력한 왕권 아래 피라미드와 스핑크스가 세워졌고, 태양력과 천문학이 발달했습니다. ' +
      '3000년간 이어진 이집트 문명은 고대 세계에서 가장 오래 지속된 문명 중 하나입니다.\n\n' +
      '교과서: "이집트인들은 영혼 불멸을 믿어 미라를 만들고, 내세를 위한 \'사자의 서\'를 남겼다."\n\n' +
      '🎓 정사 보너스: 문화력 +30',
    cultureBonus: 30,
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },
  {
    id: 'egypt_alternate',
    factionId: 'egypt',
    type: 'alternate',
    title: '☀️ 태양신의 제국 — 가상 역사 엔딩',
    description:
      '파라오의 야망이 나일강을 넘었습니다!\n\n' +
      '이집트는 해군을 건설하여 지중해를 장악하고, 메소포타미아까지 정복했습니다. ' +
      '피라미드 건설 기술로 각지에 거대 신전을 세웠고, 상형 문자가 국제 문자로 채택되었습니다.\n\n' +
      '"만약 이집트가 바다로 눈을 돌렸다면?" — 지중해 문명의 역사는 완전히 달라졌을 것입니다.',
    cultureBonus: 0,
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },

  // ══════════ 인더스 ══════════
  {
    id: 'indus_orthodox',
    factionId: 'indus',
    type: 'orthodox',
    title: '🏙️ 잃어버린 문명 — 정사 엔딩',
    description:
      '인더스 문명은 교과서 역사 그대로 흘러갔습니다.\n\n' +
      '정교한 도시 계획과 상하수도를 자랑하던 하라파와 모헨조다로는 기원전 1500년경 급격히 쇠퇴했습니다. ' +
      '이후 아리아인이 이주해 오면서 카스트 제도와 브라만교가 형성되었습니다.\n\n' +
      '교과서: "인더스 문명의 쇠퇴 원인은 기후 변화, 홍수, 외부 세력의 침입 등으로 추정된다."\n\n' +
      '🎓 정사 보너스: 문화력 +30',
    cultureBonus: 30,
    textbookRef: 'Ⅰ-1. 인더스 문명',
  },
  {
    id: 'indus_alternate',
    factionId: 'indus',
    type: 'alternate',
    title: '🚢 해양 무역 제국 — 가상 역사 엔딩',
    description:
      '인더스 문명은 쇠퇴하지 않았습니다!\n\n' +
      '도시 계획의 천재성을 해양 기술에 적용한 인더스인들은 인도양 전역을 잇는 교역 네트워크를 구축했습니다. ' +
      '모헨조다로의 하수도 기술은 각지의 항구 도시로 퍼져나가 고대 세계의 위생 혁명을 이끌었습니다.\n\n' +
      '"만약 인더스 문명이 살아남았다면?" — 고대 인도양은 세계 최대의 교역권이 되었을 것입니다.',
    cultureBonus: 0,
    textbookRef: 'Ⅰ-1. 인더스 문명',
  },

  // ══════════ 황허 문명 ══════════
  {
    id: 'yellow_river_orthodox',
    factionId: 'yellow_river',
    type: 'orthodox',
    title: '🐉 동방의 용 — 정사 엔딩',
    description:
      '황허 문명은 교과서 역사 그대로 전개되었습니다.\n\n' +
      '갑골 문자의 상(은)나라를 이어 주(周)나라가 봉건제를 실시하며 중원을 다스렸습니다. ' +
      '이후 춘추 전국 시대를 거치며 제자백가 사상이 꽃피었습니다.\n\n' +
      '교과서: "주(周)는 봉건제를 실시하였으며, 이후 춘추 전국 시대에는 유가, 도가, 법가 등 다양한 사상이 등장하였다."\n\n' +
      '🎓 정사 보너스: 문화력 +30',
    cultureBonus: 30,
    textbookRef: 'Ⅰ-1. 황허 문명',
  },
  {
    id: 'yellow_river_alternate',
    factionId: 'yellow_river',
    type: 'alternate',
    title: '🌏 실크로드의 선구자 — 가상 역사 엔딩',
    description:
      '상(은)나라는 멸망하지 않았습니다!\n\n' +
      '갑골 문자를 발전시킨 상나라는 강력한 군사력과 청동기 기술로 서쪽의 초원 지대까지 진출했습니다. ' +
      '기원전 1000년, 이미 메소포타미아와 직접 교역하는 "초기 실크로드"가 열렸습니다.\n\n' +
      '"만약 상나라가 서쪽으로 눈을 돌렸다면?" — 동서양의 만남은 수천 년 앞당겨졌을 것입니다.',
    cultureBonus: 0,
    textbookRef: 'Ⅰ-1. 황허 문명',
  },
];
