import { termGroupOf } from "./portfolioAllocation";

const TERM_CSS = { UNDER_1Y: "short", Y1_TO_3: "mid", OVER_3Y: "long" };

/**
 * 만기 사다리 배분 (총액 고정).
 * 관심 만기상품 + 월 필요금액 M + 총 투자금 F를 받아, 각 상품에 얼마씩 넣을지 역산한다.
 *   - [0 ~ 첫 만기] 구간은 파킹/CMA 버킷이 담당 (M × 첫만기)
 *   - 중간 상품 i = M × (다음 만기 − 내 만기)  (자기 만기부터 다음 만기까지 커버)
 *   - 마지막(가장 긴 만기) 상품 = 남은 전액
 *   - F가 부족하면 이른 구간부터 채우고(greedy) 뒤는 0 → buildTimeline이 gap으로 표시
 *
 * @param {Array} products [{ name, maturity(개월), rate, fixed, ... }] (금액 없음)
 * @param {number} monthlyNeed 월 필요금액(원)
 * @param {number} totalFund 총 투자금(원)
 * @returns {{ segments: Array, leftover: number }}
 *   segments: 파킹 버킷을 맨 앞에 포함한 [{ ...product, invest }] — buildTimeline 입력
 */
export function allocate(products, monthlyNeed, totalFund) {
  const sorted = [...products].sort((a, b) => a.maturity - b.maturity);
  const n = sorted.length;
  if (n === 0 || monthlyNeed <= 0) return { segments: [], leftover: totalFund };

  let remaining = totalFund;

  // 1) 첫 만기 전 구간 → 파킹/CMA 버킷
  const firstMaturity = sorted[0].maturity;
  const parkingAmount = Math.min(remaining, monthlyNeed * firstMaturity);
  remaining -= parkingAmount;

  const segments = [];
  if (parkingAmount > 0) {
    segments.push({
      name: "파킹통장·CMA",
      cssType: "park",
      maturity: 0,
      fixed: false,
      rate: 0,
      invest: parkingAmount,
    });
  }

  // 2) 만기상품: 중간은 다음 만기까지 갭, 마지막은 나머지 전액
  sorted.forEach((p, i) => {
    const isLast = i === n - 1;
    const need = isLast
      ? remaining
      : Math.min(remaining, monthlyNeed * (sorted[i + 1].maturity - p.maturity));
    remaining -= need;
    segments.push({ ...p, invest: need });
  });

  return { segments, leftover: remaining };
}

/**
 * 배분된 상품들(invest 보유)을 만기 순서로 이어 붙여 타임라인을 만든다.
 *
 * @param {Array} products [{ name, invest, maturity, rate, fixed, cssType? }]
 * @param {number} monthlyNeed 월 필요금액(원)
 * @param {boolean} optimistic true면 고정금리 상품에 이자 반영
 */
export function buildTimeline(products, monthlyNeed, optimistic = false) {
  const sorted = [...products].sort((a, b) => a.maturity - b.maturity);
  let cursor = 0;
  const segs = [];
  let funded = 0;

  for (const p of sorted) {
    const principal =
      optimistic && p.fixed
        ? p.invest * (1 + (p.rate * p.maturity) / 12)
        : p.invest;
    const months = Math.floor(principal / monthlyNeed);
    cursor = Math.max(cursor, p.maturity);

    if (months > 0) {
      segs.push({
        type: p.cssType || TERM_CSS[termGroupOf(p.maturity)] || "long",
        name: p.name,
        from: cursor + 1,
        to: cursor + months,
        months,
        amount: principal,
      });
      funded += months;
      cursor += months;
    }
  }

  return { segs, funded, span: cursor };
}
