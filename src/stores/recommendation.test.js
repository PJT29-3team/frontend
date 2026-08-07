import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRecommendationStore, afterTaxRate, PERIOD_OPTIONS } from '@/stores/recommendation';

// 머니 로직: 투자금액 = 여유자금 − 즉시지출, 남길현금 = 여유자금 − 투자금액.
describe('recommendation store 금액 계산', () => {
  let rec;
  beforeEach(() => {
    setActivePinia(createPinia());
    rec = useRecommendationStore();
    rec.setFundingAmount(100_000_000);
  });

  it('즉시지출을 빼면 투자금액, 남길현금은 즉시지출과 같다', () => {
    rec.setImmediateExpense(20_000_000);
    expect(rec.investAmount).toBe(80_000_000);
    expect(rec.remainingCash).toBe(20_000_000);
  });

  it('즉시지출은 여유자금을 넘을 수 없고 투자금액은 음수가 되지 않는다', () => {
    rec.setImmediateExpense(150_000_000);
    expect(rec.immediateExpense).toBe(100_000_000);
    expect(rec.investAmount).toBe(0);
    expect(rec.remainingCash).toBe(100_000_000);
  });

  it('음수 입력은 0으로 방어된다', () => {
    rec.setImmediateExpense(-5);
    rec.setMonthlyNeed(-5);
    expect(rec.immediateExpense).toBe(0);
    expect(rec.monthlyNeed).toBe(0);
  });

  it('상품 예치기간으로 담기 가능 여부를 판단한다 (같은 구간이어도 개별)', () => {
    rec.setImmediateExpense(0); // 투자금액 1억
    rec.setMonthlyNeed(5_000_000); // 커버 20개월
    expect(rec.coveredMonths).toBe(20);
    // 같은 중기(1~3년) 구간이라도 예치기간 따라 갈림
    expect(rec.productActive(13)).toBe(true); // 13 ≤ 20 담기 가능
    expect(rec.productActive(20)).toBe(true); // 경계 포함
    expect(rec.productActive(24)).toBe(false); // 24 > 20 잠금

    rec.setMonthlyNeed(0); // 미입력이면 제한 없음
    expect(rec.productActive(36)).toBe(true);
  });

  it('찜은 기간별 1개 슬롯 — 교체/해제/최대 3개', () => {
    const a = { productType: 'A', termMonths: 6 };
    const b = { productType: 'B', termMonths: 6 };
    rec.toggleFavorite('UNDER_12M', a);
    expect(rec.isFavorited('UNDER_12M', 'A')).toBe(true);
    rec.toggleFavorite('UNDER_12M', b); // 같은 구간 → 교체
    expect(rec.isFavorited('UNDER_12M', 'A')).toBe(false);
    expect(rec.isFavorited('UNDER_12M', 'B')).toBe(true);
    rec.toggleFavorite('UNDER_12M', b); // 같은 상품 다시 → 해제
    expect(rec.isFavorited('UNDER_12M', 'B')).toBe(false);

    rec.toggleFavorite('UNDER_12M', a);
    rec.toggleFavorite('Y1_TO_2', b);
    rec.toggleFavorite('OVER_36M', { productType: 'C', termMonths: 36 });
    expect(rec.favoriteCount).toBe(3);
    expect(rec.favoriteList.map((p) => p.productType)).toEqual(['A', 'B', 'C']);
  });

  // 4구간 단일 소스: 슬롯 키가 PERIOD_OPTIONS와 일치하고, 빈 구간은 선택에서 빠진다.
  it('빈 구간을 빼고 전부 담으면 완료, 전 구간이 비면 완료가 아니다', () => {
    expect(Object.keys(rec.favorites)).toEqual(PERIOD_OPTIONS.map((o) => o.code));

    rec.setEmptyPeriods(['Y2_TO_3', 'OVER_36M']);
    expect(rec.selectablePeriodCount).toBe(2);
    rec.toggleFavorite('UNDER_12M', { productType: 'A', termMonths: 6, rate: 3 });
    expect(rec.isAllSelected).toBe(false);
    rec.toggleFavorite('Y1_TO_2', { productType: 'B', termMonths: 12, rate: 3 });
    expect(rec.isAllSelected).toBe(true);

    rec.setEmptyPeriods(PERIOD_OPTIONS.map((o) => o.code));
    expect(rec.selectablePeriodCount).toBe(0);
    expect(rec.isAllSelected).toBe(false);
  });

  it('세후 금리는 이자소득세 15.4%를 뗀 값이다', () => {
    expect(afterTaxRate(3)).toBe(2.54);
    rec.toggleFavorite('UNDER_12M', { productType: 'A', termMonths: 6, rate: 3 });
    expect(rec.favorites.UNDER_12M.afterTaxRate).toBe(2.54);
  });
});
