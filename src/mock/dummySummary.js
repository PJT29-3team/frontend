/**
 * TODO: 목업 데이터 — 실제 API 연동 후 이 파일 전체 삭제
 */
export const dummySummary = {
  userName: '홍길동',

  /* ── 카드1: 매물 정리 결과 ── */
  propertyResult: {
    currentHome: {
      name: '분당구 정자동 아파트',
      pyeong: 34,
      estimatedSalePrice: 7_5000_0000, // 7억 5,000만원
    },
    newHome: {
      name: '야탑동 탑마을(선경)',
      pyeong: 24,
      fitScore: 87,
      purchasePrice: 3_8000_0000, // 3억 8,000만원
    },
    costs: [
      { label: '양도소득세', amount: 1200_0000 },
      { label: '취득세', amount: 1520_0000 },
      { label: '중개수수료', amount: 630_0000 },
    ],
    netFund: 15_650_0000, // 순 여유자금 = 매도가 - 매수가 - 세금/비용
  },

  /* ── 카드2: 자금 운용 계획 ── */
  financePlan: {
    netFund: 15_650_0000,          // 카드1에서 넘어온 순 여유자금
    immediateExpenses: [
      { label: '대출 잔액 상환', amount: 2000_0000 },
      { label: '이사 비용', amount: 300_0000 },
      { label: '병원비 (예정)', amount: 500_0000 },
    ],
    immediateTotal: 2800_0000,
    investable: 12_850_0000,       // 순 여유자금 - 즉시지출
    monthlyNeed: 100_0000,         // 매달 더 필요한 돈
    // fundedMonths는 SummaryView가 실제 배분으로 계산해 PdfReport에 넘긴다(목업 제거)
    items: [
      {
        name: '파킹통장·CMA',
        tag: '즉시 인출',
        description: '첫 만기 전 생활비 커버',
        maturityMonths: 0,
        invest: 600_0000,
        percent: 5,
      },
      {
        name: 'KB 든든 자유적금',
        tag: '단기 · 매우 낮은 위험',
        description: '1년 · 기본금리 연 3.2% · 최고 연 3.8%',
        maturityMonths: 6,
        invest: 600_0000,
        percent: 5,
      },
      {
        name: 'KOSEF 중단기채권 ETF',
        tag: '중기 · 낮은 위험',
        description: '최근 3년 연환산 수익률 3.6%',
        maturityMonths: 12,
        invest: 3650_0000,
        percent: 28,
      },
      {
        name: 'KB MMF형 CMA',
        tag: '장기 · 매우 낮은 위험',
        description: '수시입출금 · 기준금리 연 3.0%',
        maturityMonths: 24,
        invest: 8000_0000,
        percent: 62,
      },
    ],
  },

  /* ── 완료 단계 ── */
  completedSteps: [
    { key: 'survey', label: '설문 조사' },
    { key: 'recommend', label: '금융상품 추천' },
    { key: 'recommend-property', label: '추천 매물 확인' },
    { key: 'favorite', label: '관심 금융상품' },
    { key: 'compare', label: '매물 비교' },
    { key: 'result', label: '최종 선택' },
  ],
}
