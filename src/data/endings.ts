/**
 * 15턴 완결 엔딩 — 총점 기반 4단계 등급
 * 교과서: 비상교육 역사① Ⅱ단원 "문명의 발생과 고대 세계의 형성"
 *
 * 총점 = (퀴즈 정답 수 × 10) + (영토 수 × 5) + (문화 / 10) + (기술 / 10)
 */

export interface EndingGrade {
  grade: 'S' | 'A' | 'B' | 'C';
  minScore: number;
  title: string;
  description: string;
  textbookRef: string;
}

/** 퀴즈 통계 */
export interface QuizStats {
  correct: number;
  total: number;
  /** 맞춘 퀴즈의 textbookRef 목록 (중복 제거) */
  learnedConcepts: string[];
}

/** 엔딩 화면에 표시할 최종 결과 */
export interface EndingResult {
  grade: EndingGrade;
  totalScore: number;
  quizStats: QuizStats;
  territoryCount: number;
  culture: number;
  technology: number;
}

export const ENDING_GRADES: EndingGrade[] = [
  {
    grade: 'S',
    minScore: 80,
    title: '위대한 문명의 건설자',
    description: '당신의 문명은 후대에 길이 남을 업적을 이루었습니다.\n\n'
      + '강의 선물을 지혜롭게 활용하여 도시, 문자, 국가를 갖춘 찬란한 문명을 건설했습니다.\n'
      + '문명의 인과 사슬 — 강 → 농업 → 잉여 → 분업 → 도시 → 문자 → 국가 — 을 완벽히 이해했습니다!',
    textbookRef: '역사① Ⅱ단원 1~3차시',
  },
  {
    grade: 'A',
    minScore: 60,
    title: '번영하는 문명',
    description: '안정적인 국가를 건설하여 문명의 기초를 다졌습니다.\n\n'
      + '문명 발생의 핵심 원리를 잘 이해하고 있습니다. 4대 문명의 특징을 좀 더 비교해 보세요!',
    textbookRef: '역사① Ⅱ단원 1~3차시',
  },
  {
    grade: 'B',
    minScore: 40,
    title: '발전하는 문명',
    description: '아직 갈 길이 멀지만 가능성이 있습니다.\n\n'
      + '문명의 발생 조건과 3요소(도시, 문자, 국가)를 다시 복습해 보세요.',
    textbookRef: '역사① Ⅱ단원 1차시',
  },
  {
    grade: 'C',
    minScore: 0,
    title: '사라진 문명',
    description: '역사 속으로 사라졌습니다. 다시 도전하세요!\n\n'
      + '"강 → 농업 → 잉여 → 분업 → 문명" 인과 사슬을 기억하고 다시 도전해 보세요.',
    textbookRef: '역사① Ⅱ단원 1차시',
  },
];

/** 4대 문명 비교표 (엔딩 화면 '단원 요약 보기'에서 사용) */
export const CIVILIZATION_SUMMARY = [
  { name: '메소포타미아', river: '티그리스·유프라테스', region: '이라크', features: '쐐기문자, 함무라비 법전, 지구라트, 60진법, 태음력' },
  { name: '이집트', river: '나일', region: '이집트', features: '상형문자, 피라미드, 미라, 파라오, 태양력, 기하학' },
  { name: '인더스', river: '인더스', region: '파키스탄·인도', features: '계획도시(모헨조다로), 미해독 문자, 도량형 통일' },
  { name: '황허', river: '황허(황하)', region: '중국', features: '갑골문자, 상→주 왕조, 봉건제, 천명 사상, 청동기' },
];

/** 총점으로 등급을 결정한다 */
export function getEndingGrade(totalScore: number): EndingGrade {
  for (const grade of ENDING_GRADES) {
    if (totalScore >= grade.minScore) {
      return grade;
    }
  }
  return ENDING_GRADES[ENDING_GRADES.length - 1];
}

/** 총점 계산 */
export function calculateTotalScore(
  quizCorrect: number,
  territoryCount: number,
  culture: number,
  technology: number,
): number {
  return (quizCorrect * 10)
    + (territoryCount * 5)
    + Math.floor(culture / 10)
    + Math.floor(technology / 10);
}
