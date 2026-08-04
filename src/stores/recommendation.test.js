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
});
