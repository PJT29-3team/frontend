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
  it("파킹 버킷 + 중간 상품은 만기갭을 이자로 역산, 마지막은 나머지 전액", () => {
    // F = 5000만. 파킹 600(이자 없음) / 적금 600÷1.015 / ETF 2400÷1.04 / 채권 나머지
    const { segments } = allocate(products, M, 50_000_000);
    expect(segments[0]).toMatchObject({ cssType: "park", invest: 6_000_000 });
    expect(segments[1]).toMatchObject({ name: "적금", invest: 5_911_331 });
    expect(segments[2]).toMatchObject({ name: "만기매칭ETF", invest: 23_076_924 });
    expect(segments[3]).toMatchObject({ name: "만기매칭채권", invest: 15_011_745 });
  });

  it("역산한 투자금의 만기 수령액이 담당 구간 생활비 이상이다", () => {
    const { segments } = allocate(products, M, 50_000_000);
    // 마지막 상품은 잔액 전액이라 역산 대상이 아님 → 중간 상품만 검증
    for (const [i, gapMonths] of [[1, 6], [2, 24]]) {
      const p = segments[i];
      const atMaturity = p.invest * (1 + (p.rate * p.maturity) / 12);
      expect(atMaturity).toBeGreaterThanOrEqual(M * gapMonths);
      expect(atMaturity).toBeLessThan(M * gapMonths + M); // 한 달치 넘게 과투자하지 않음
    }
  });

  it("총액을 다 배분한다 (leftover 0)", () => {
    const { segments, leftover } = allocate(products, M, 50_000_000);
    const sum = segments.reduce((s, x) => s + x.invest, 0);
    expect(sum).toBe(50_000_000);
    expect(leftover).toBe(0);
  });

  it("F가 부족하면 이른 구간부터 채우고 뒤는 0", () => {
    // F = 1000만: 파킹 600 다 채우고, 적금에 400만 남음(필요액 미만) → ETF/채권 0
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
    const { funded } = buildTimeline(segments, M);
    // 파킹6 + 적금6 + ETF24 + 채권17(이자 반영) = 53개월
    expect(funded).toBe(53);
  });

  it("파킹 버킷이 [0~첫만기]를 채운다", () => {
    const { segments } = allocate(products, M, 50_000_000);
    const { segs } = buildTimeline(segments, M);
    expect(segs[0]).toMatchObject({ type: "park", from: 1, to: 6 });
  });

  it("중간 상품은 자기 만기부터 다음 만기까지 정확히 이어진다", () => {
    const { segments } = allocate(products, M, 50_000_000);
    const { segs } = buildTimeline(segments, M);
    expect(segs.find((s) => s.name === "적금")).toMatchObject({ from: 7, to: 12 });
    expect(segs.find((s) => s.name === "만기매칭ETF")).toMatchObject({ from: 13, to: 36 });
  });

  it("세그먼트가 산정 근거(투자금·금리·잔액배정 여부)를 그대로 싣는다", () => {
    const { segments } = allocate(products, M, 50_000_000);
    const { segs, interest } = buildTimeline(segments, M);

    // 중간 상품: 담당 개월수 × 월 생활비 = 만기 수령액
    const etf = segs.find((s) => s.name === "만기매칭ETF");
    expect(etf).toMatchObject({ invest: 23_076_924, rate: 0.04, last: false, months: 24 });
    expect(etf.amount).toBeGreaterThanOrEqual(etf.months * M);

    // 마지막 상품만 잔액 전액 배정
    expect(segs.filter((s) => s.last)).toHaveLength(1);
    expect(segs.find((s) => s.last).name).toBe("만기매칭채권");

    // 이자 총액 = 만기 수령액 합 − 총 투자금
    const atMaturity = segs.reduce((a, s) => a + s.amount, 0);
    expect(interest).toBeCloseTo(atMaturity - 50_000_000, 0);
  });

  it("변동금리 상품은 이자 없이 원금만 쓴다", () => {
    const floating = [{ name: "변동", maturity: 12, rate: 0.04, fixed: false, invest: 12_000_000 }];
    const { funded } = buildTimeline(floating, M);
    expect(funded).toBe(12);
  });
});
