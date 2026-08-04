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

  it('커버 개월로 구간 잠금을 판단한다 (단기0/중기12/장기36)', () => {
    rec.setImmediateExpense(0); // 투자금액 1억
    rec.setMonthlyNeed(2_000_000); // 커버 50개월 → 전 구간 활성
    expect(rec.coveredMonths).toBe(50);
    expect(rec.periodActive('SHORT')).toBe(true);
    expect(rec.periodActive('MEDIUM')).toBe(true);
    expect(rec.periodActive('LONG')).toBe(true);

    rec.setMonthlyNeed(4_000_000); // 커버 25개월 → 장기 잠금
    expect(rec.periodActive('MEDIUM')).toBe(true);
    expect(rec.periodActive('LONG')).toBe(false);

    rec.setMonthlyNeed(0); // 미입력이면 제한 없음
    expect(rec.periodActive('LONG')).toBe(true);
  });
});
