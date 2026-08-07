import { periodOf } from "./portfolioAllocation";

/**
 * 만기 시 원리금 배수(단리). 변동금리·파킹 버킷은 1(원금 그대로).
 * allocate는 이 값으로 나눠 투자금을 역산하고, buildTimeline은 곱해 되돌린다.
 */
function growth(p) {
  return p.fixed ? 1 + (p.rate * p.maturity) / 12 : 1;
}

/**
 * 만기 사다리 배분 (총액 고정).
 * 관심 만기상품 + 월 필요금액 M + 총 투자금 F를 받아, 각 상품에 얼마씩 넣을지 역산한다.
 *   - [0 ~ 첫 만기] 구간은 파킹/CMA 버킷이 담당 (M × 첫만기)
 *   - 중간 상품 i = M × (다음 만기 − 내 만기) ÷ 만기배수
 *     → 이자를 반영해, 만기 시점에 딱 그 구간 생활비가 나오도록 현재 투자금을 역산
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
      : Math.min(
          remaining,
          // 원 단위 올림 — 만기 수령액이 목표 생활비에 모자라지 않도록(부동소수점 방어)
          Math.ceil((monthlyNeed * (sorted[i + 1].maturity - p.maturity)) / growth(p)),
        );
    remaining -= need;
    // last: 역산이 아니라 잔액 전액을 받은 상품 (화면에서 "남은 돈 전액"으로 구분 표기)
    segments.push({ ...p, invest: need, last: isLast });
  });

  return { segments, leftover: remaining };
}

/**
 * 배분된 상품들(invest 보유)을 만기 순서로 이어 붙여 타임라인을 만든다.
 * 확정금리 상품은 만기까지의 단리 이자를 반영한 원리금 기준으로 계산한다.
 *
 * @param {Array} products [{ name, invest, maturity, rate, fixed, cssType? }]
 * @param {number} monthlyNeed 월 필요금액(원)
 */
export function buildTimeline(products, monthlyNeed) {
  const sorted = [...products].sort((a, b) => a.maturity - b.maturity);
  let cursor = 0;
  const segs = [];
  let funded = 0;
  let interest = 0;

  for (const p of sorted) {
    const principal = p.invest * growth(p);
    const months = Math.floor(principal / monthlyNeed);
    cursor = Math.max(cursor, p.maturity);
    interest += principal - p.invest;

    if (months > 0) {
      // invest·rate·maturity·favoriteId·last를 그대로 실어 화면이 산정 근거를 조인 없이 읽게 한다
      segs.push({
        ...p,
        type: p.cssType || periodOf(p.maturity).css,
        from: cursor + 1,
        to: cursor + months,
        months,
        amount: principal,
      });
      funded += months;
      cursor += months;
    }
  }

  return { segs, funded, span: cursor, interest };
}

/** 개월 수 → "N년 M개월" 표기 (horizon/summary 공용) */
export function dur(m) {
  if (m >= 600) return "50년 이상";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo}개월`;
  if (mo === 0) return `${y}년`;
  return `${y}년 ${mo}개월`;
}
