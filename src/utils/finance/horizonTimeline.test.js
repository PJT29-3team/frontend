import { describe, expect, it } from "vitest";
import { buildTimeline } from "./horizonTimeline";

const products = [
  { name: "CMA", invest: 1200, maturity: 0, rate: 0.03, fixed: true },
  { name: "적금", invest: 500, maturity: 12, rate: 0.10, fixed: true },
  { name: "채권ETF", invest: 700, maturity: 36, rate: 0.04, fixed: false },
];

describe("buildTimeline", () => {
  it("만기 순서로 이어 붙이고 gap을 감지한다", () => {
    const { segs, funded, gap } = buildTimeline(products, 100, false);
    expect(funded).toBe(24);
    expect(gap).toBe(19);
    expect(segs.filter((s) => s.type === "gap")).toHaveLength(1);
    expect(segs[2]).toMatchObject({ type: "gap", months: 19 });
  });

  it("앞 상품이 만기 전에 소진되면 gap이 생긴다", () => {
    const short = [
      { name: "CMA", invest: 500, maturity: 0, rate: 0, fixed: true },
      { name: "적금", invest: 600, maturity: 12, rate: 0, fixed: true },
    ];
    const { segs, gap } = buildTimeline(short, 100, false);
    expect(gap).toBe(7);
    expect(segs[0]).toMatchObject({ type: "short", months: 5 });
    expect(segs[1]).toMatchObject({ type: "gap", months: 7 });
    expect(segs[2]).toMatchObject({ type: "short", months: 6 });
  });

  it("낙관 모드에서 고정금리 상품만 이자 반영한다", () => {
    const { segs: base } = buildTimeline(products, 100, false);
    const { segs: opt } = buildTimeline(products, 100, true);

    const baseMid = base.find((s) => s.name === "적금");
    const optMid = opt.find((s) => s.name === "적금");
    expect(optMid.amount).toBeGreaterThan(baseMid.amount);

    const baseEtf = base.find((s) => s.name === "채권ETF");
    const optEtf = opt.find((s) => s.name === "채권ETF");
    expect(optEtf.amount).toBe(baseEtf.amount);
  });

  it("상품이 정렬되어 있지 않아도 만기 순으로 처리한다", () => {
    const reversed = [...products].reverse();
    const { funded, gap } = buildTimeline(reversed, 100, false);
    const { funded: f2, gap: g2 } = buildTimeline(products, 100, false);
    expect(funded).toBe(f2);
    expect(gap).toBe(g2);
  });
});
