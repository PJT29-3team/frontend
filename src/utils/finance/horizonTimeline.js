import { termGroupOf } from "./portfolioAllocation";

const TERM_CSS = { UNDER_1Y: "short", Y1_TO_3: "mid", OVER_3Y: "long" };

export function buildTimeline(products, monthlyNeed, optimistic = false) {
  const sorted = [...products].sort((a, b) => a.maturity - b.maturity);
  let cursor = 0;
  const segs = [];
  let funded = 0;
  let gap = 0;

  for (const p of sorted) {
    const principal =
      optimistic && p.fixed
        ? p.invest * (1 + (p.rate * p.maturity) / 12)
        : p.invest;
    const months = Math.floor(principal / monthlyNeed);
    const availableFrom = Math.max(cursor, p.maturity);

    if (availableFrom > cursor) {
      const g = availableFrom - cursor;
      segs.push({ type: "gap", from: cursor + 1, to: availableFrom, months: g });
      gap += g;
      cursor = availableFrom;
    }
    if (months > 0) {
      segs.push({
        type: TERM_CSS[termGroupOf(p.maturity)] || "long",
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

  return { segs, funded, gap, span: cursor };
}
