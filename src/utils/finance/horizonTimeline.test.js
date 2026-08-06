import { describe, expect, it } from "vitest";
import { allocate, buildTimeline } from "./horizonTimeline";

const M = 1_000_000; // 월 100만원

// 만기 6/12/36개월 상품 (금액 없음 — allocate가 역산)
const products = [
  { name: "적금", maturity: 6, rate: 0.03, fixed: true },
  { name: "만기매칭ETF", maturity: 12, rate: 0.04, fixed: true },
  { name: "만기매칭채권", maturity: 36, rate: 0.05, fixed: true },
];

describe("allocate (만기 사다리, 총액 고정)", () => {
  it("파킹 버킷 + 중간 상품은 만기갭, 마지막은 나머지 전액", () => {
    // F = 5000만. 파킹 600(0~6) / 적금 600(6~12) / ETF 2400(12~36) / 펀드 나머지 1400
    const { segments } = allocate(products, M, 50_000_000);
    expect(segments[0]).toMatchObject({ cssType: "park", invest: 6_000_000 });
    expect(segments[1]).toMatchObject({ name: "적금", invest: 6_000_000 });
    expect(segments[2]).toMatchObject({ name: "만기매칭ETF", invest: 24_000_000 });
    expect(segments[3]).toMatchObject({ name: "만기매칭채권", invest: 14_000_000 });
  });

  it("총액을 다 배분한다 (leftover 0)", () => {
    const { segments, leftover } = allocate(products, M, 50_000_000);
    const sum = segments.reduce((s, x) => s + x.invest, 0);
    expect(sum).toBe(50_000_000);
    expect(leftover).toBe(0);
  });

  it("F가 부족하면 이른 구간부터 채우고 뒤는 0", () => {
    // F = 1000만: 파킹 600 다 채우고, 적금 400만 남음(<600 필요) → ETF/펀드 0
    const { segments } = allocate(products, M, 10_000_000);
    expect(segments[0].invest).toBe(6_000_000); // 파킹
    expect(segments[1].invest).toBe(4_000_000); // 적금(부족)
    expect(segments[2].invest).toBe(0);
    expect(segments[3].invest).toBe(0);
  });
});

describe("allocate + buildTimeline", () => {
  it("충분한 총액이면 끊기지 않고 이어진다", () => {
    const { segments } = allocate(products, M, 50_000_000);
    const { funded } = buildTimeline(segments, M, false);
    // 파킹6 + 적금6 + ETF24 + 펀드14 = 50개월
    expect(funded).toBe(50);
  });

  it("파킹 버킷이 [0~첫만기]를 채운다", () => {
    const { segments } = allocate(products, M, 50_000_000);
    const { segs } = buildTimeline(segments, M, false);
    expect(segs[0]).toMatchObject({ type: "park", from: 1, to: 6 });
  });

  it("낙관 모드에서 모든 상품(예적금+만기매칭ETF) 이자 반영", () => {
    const { segments } = allocate(products, M, 50_000_000);
    const base = buildTimeline(segments, M, false).segs;
    const opt = buildTimeline(segments, M, true).segs;
    for (const name of ["적금", "만기매칭ETF"]) {
      const b = base.find((s) => s.name === name);
      const o = opt.find((s) => s.name === name);
      expect(o.amount).toBeGreaterThan(b.amount);
    }
  });
});
