// 기간 구간 단일 소스.
// 코드·경계값은 백엔드 RecommendationService.PERIOD_META 및
// FinancialProductAccountMapper.xml / FinancialProductStockMapper.xml과 일치시킬 것.
export const PERIOD_OPTIONS = [
  { code: "UNDER_12M", label: "1~11개월", desc: "1년 미만 단기자금", short: "단기", css: "short", maxMonths: 11 },
  { code: "Y1_TO_2", label: "12~23개월", desc: "1년 이상 2년 미만", short: "중기", css: "mid", maxMonths: 23 },
  { code: "Y2_TO_3", label: "24~35개월", desc: "2년 이상 3년 미만", short: "중장기", css: "mid2", maxMonths: 35 },
  { code: "OVER_36M", label: "36개월 이상", desc: "3년 이상 장기자금", short: "장기", css: "long", maxMonths: Infinity },
];

/** 만기 개월 수 → 해당 기간 구간 옵션. 라벨(short)·색(css)·코드(code)를 여기서 꺼내 쓴다. */
export function periodOf(months) {
  const m = months || 0;
  return PERIOD_OPTIONS.find((o) => m <= o.maxMonths) ?? PERIOD_OPTIONS[PERIOD_OPTIONS.length - 1];
}
