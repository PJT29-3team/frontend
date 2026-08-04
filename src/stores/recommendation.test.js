import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRecommendationStore } from '@/stores/recommendation';

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
    rec.toggleFavorite('SHORT', a);
    expect(rec.isFavorited('SHORT', 'A')).toBe(true);
    rec.toggleFavorite('SHORT', b); // 같은 구간 → 교체
    expect(rec.isFavorited('SHORT', 'A')).toBe(false);
    expect(rec.isFavorited('SHORT', 'B')).toBe(true);
    rec.toggleFavorite('SHORT', b); // 같은 상품 다시 → 해제
    expect(rec.isFavorited('SHORT', 'B')).toBe(false);

    rec.toggleFavorite('SHORT', a);
    rec.toggleFavorite('MEDIUM', b);
    rec.toggleFavorite('LONG', { productType: 'C', termMonths: 36 });
    expect(rec.favoriteCount).toBe(3);
    expect(rec.favoriteList.map((p) => p.productType)).toEqual(['A', 'B', 'C']);
  });
});
