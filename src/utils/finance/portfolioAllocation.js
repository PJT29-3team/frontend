// 백엔드 FinancialProductStockMapper.xml 기간 분류와 동일한 경계값
// (SHORT < 12, 12 <= MEDIUM <= 35, LONG >= 36)
export function termGroupOf(months) {
  if (months < 12) return "UNDER_1Y";
  if (months < 36) return "Y1_TO_3";
  return "OVER_3Y";
}
