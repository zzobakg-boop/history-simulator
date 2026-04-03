/**
 * 턴 종료 퀴즈 데이터
 * 교과서: 비상교육 역사① Ⅰ단원 "문명의 발생과 고대 세계의 형성"
 */

export interface Quiz {
  id: string;
  question: string;
  type: 'ox' | 'multiple';
  options?: string[];
  answer: string;
  reward: { food?: number; gold?: number; culture?: number; military?: number; technology?: number };
  textbookRef: string;
}

export const QUIZZES: Quiz[] = [
  // ── OX 퀴즈 (10문항) ──
  {
    id: 'q01',
    question: '함무라비 법전은 현존하는 가장 오래된 성문법 중 하나이다.',
    type: 'ox',
    answer: 'O',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 메소포타미아 문명',
  },
  {
    id: 'q02',
    question: '이집트 문명은 황허강 유역에서 발생하였다.',
    type: 'ox',
    answer: 'X',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },
  {
    id: 'q03',
    question: '인더스 문명의 모헨조다로에는 바둑판 모양의 도로와 상하수도 시설이 있었다.',
    type: 'ox',
    answer: 'O',
    reward: { technology: 5 },
    textbookRef: 'Ⅰ-1. 인더스 문명',
  },
  {
    id: 'q04',
    question: '갑골 문자는 이집트 문명에서 사용된 문자이다.',
    type: 'ox',
    answer: 'X',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 황허 문명',
  },
  {
    id: 'q05',
    question: '페니키아 알파벳은 오늘날 로마자(라틴 문자)의 기원이 되었다.',
    type: 'ox',
    answer: 'O',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 지중해 문명',
  },
  {
    id: 'q06',
    question: '청동기의 사용은 평등한 사회를 만드는 데 기여하였다.',
    type: 'ox',
    answer: 'X',
    reward: { food: 5 },
    textbookRef: 'Ⅰ-1. 문명의 발생',
  },
  {
    id: 'q07',
    question: '이집트인들은 나일강 범람 시기를 예측하기 위해 천문학을 발달시켰다.',
    type: 'ox',
    answer: 'O',
    reward: { technology: 5 },
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },
  {
    id: 'q08',
    question: '주(周)나라는 봉건제를 실시하여 왕족과 공신에게 토지를 나누어 다스리게 하였다.',
    type: 'ox',
    answer: 'O',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 황허 문명',
  },
  {
    id: 'q09',
    question: '지구라트는 이집트 문명의 대표적인 건축물이다.',
    type: 'ox',
    answer: 'X',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 메소포타미아 문명',
  },
  {
    id: 'q10',
    question: '철기의 보급은 대제국이 등장하는 배경이 되었다.',
    type: 'ox',
    answer: 'O',
    reward: { military: 5 },
    textbookRef: 'Ⅰ-1. 고대 세계의 변화',
  },

  // ── 4지선다 퀴즈 (10문항) ──
  {
    id: 'q11',
    question: '피라미드는 어느 문명의 대표적인 건축물인가?',
    type: 'multiple',
    options: ['메소포타미아', '이집트', '인더스', '황허'],
    answer: '이집트',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },
  {
    id: 'q12',
    question: '쐐기 문자를 사용한 문명은?',
    type: 'multiple',
    options: ['이집트', '인더스', '메소포타미아', '황허'],
    answer: '메소포타미아',
    reward: { technology: 5 },
    textbookRef: 'Ⅰ-1. 메소포타미아 문명',
  },
  {
    id: 'q13',
    question: '카스트 제도에서 사제 계급에 해당하는 것은?',
    type: 'multiple',
    options: ['크샤트리아', '바이샤', '브라만', '수드라'],
    answer: '브라만',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 인도의 고대 문명',
  },
  {
    id: 'q14',
    question: '상(은)나라에서 점을 칠 때 사용한 것은?',
    type: 'multiple',
    options: ['파피루스', '점토판', '갑골(거북 등껍질과 소의 뼈)', '대나무'],
    answer: '갑골(거북 등껍질과 소의 뼈)',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 황허 문명',
  },
  {
    id: 'q15',
    question: '큰 강 유역에서 문명이 발생한 가장 중요한 이유는?',
    type: 'multiple',
    options: ['군사적 방어가 쉬워서', '관개 농업으로 잉여 생산물이 생겨서', '교통이 편리해서', '기후가 서늘해서'],
    answer: '관개 농업으로 잉여 생산물이 생겨서',
    reward: { food: 5 },
    textbookRef: 'Ⅰ-1. 문명의 발생',
  },
  {
    id: 'q16',
    question: '이집트에서 파라오의 시신을 보존하기 위해 만든 것은?',
    type: 'multiple',
    options: ['지구라트', '미라', '갑골', '점토판'],
    answer: '미라',
    reward: { culture: 5 },
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },
  {
    id: 'q17',
    question: '인더스 문명의 대표적인 도시가 아닌 것은?',
    type: 'multiple',
    options: ['하라파', '모헨조다로', '바빌론', '로탈'],
    answer: '바빌론',
    reward: { technology: 5 },
    textbookRef: 'Ⅰ-1. 인더스 문명',
  },
  {
    id: 'q18',
    question: '알파벳을 만들어 지중해 교역에 활용한 민족은?',
    type: 'multiple',
    options: ['히타이트', '아시리아', '페니키아', '히브리'],
    answer: '페니키아',
    reward: { gold: 5 },
    textbookRef: 'Ⅰ-1. 지중해 문명',
  },
  {
    id: 'q19',
    question: '히타이트가 한때 독점했던 기술은?',
    type: 'multiple',
    options: ['종이 제조', '철기 제조', '화약 제조', '유리 제조'],
    answer: '철기 제조',
    reward: { military: 5 },
    textbookRef: 'Ⅰ-1. 고대 세계의 변화',
  },
  {
    id: 'q20',
    question: '이집트인들이 나일강 범람 예측을 위해 만든 달력은?',
    type: 'multiple',
    options: ['음력', '태양력', '태음태양력', '율리우스력'],
    answer: '태양력',
    reward: { technology: 5 },
    textbookRef: 'Ⅰ-1. 이집트 문명',
  },
];
