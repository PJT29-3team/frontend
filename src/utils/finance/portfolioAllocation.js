export const TERM_GROUPS = { UNDER_1Y: 12, Y1_TO_3: 36, OVER_3Y: Infinity };

export function termGroupOf(months) {
  if (months <= TERM_GROUPS.UNDER_1Y) return "UNDER_1Y";
  if (months <= TERM_GROUPS.Y1_TO_3) return "Y1_TO_3";
  return "OVER_3Y";
}
