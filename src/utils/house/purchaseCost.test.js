import { describe, expect, it } from 'vitest'
import { calculateBrokerageFee, calculatePurchaseCost, purchaseSummary } from './purchaseCost'

describe('calculatePurchaseCost (취득 관련 세금)', () => {
  it('6억 이하는 취득세 1% + 교육세 0.1%', () => {
    const c = calculatePurchaseCost(380_000_000, 59)
    expect(c.acquisitionTax).toBe(3_800_000)
    expect(c.educationTax).toBe(380_000)
    expect(c.totalTax).toBe(4_180_000)
  })

  it('전용 85㎡ 초과면 농특세 0.2%가 붙는다', () => {
    const small = calculatePurchaseCost(380_000_000, 85)
    const big = calculatePurchaseCost(380_000_000, 100)
    expect(small.ruralTax).toBe(0)
    expect(big.ruralTax).toBe(760_000)
    expect(big.totalTax - small.totalTax).toBe(760_000)
  })

  it('면적을 모르면 국민주택으로 보고 농특세를 매기지 않는다', () => {
    expect(calculatePurchaseCost(380_000_000, null).ruralTax).toBe(0)
  })

  it('6~9억 구간은 취득세율이 선형으로 오른다', () => {
    const c = calculatePurchaseCost(750_000_000, 59)
    expect(c.acquisitionTax).toBe(15_000_000) // 세율 2%
    expect(c.educationTax).toBe(1_500_000) // 취득세율의 10%
  })
})

describe('calculateBrokerageFee (중개보수)', () => {
  it('한도액이 있는 구간은 한도를 넘지 않는다', () => {
    expect(calculateBrokerageFee(45_000_000).brokerageFee).toBe(250_000) // 요율대로면 27만
    expect(calculateBrokerageFee(180_000_000).brokerageFee).toBe(800_000) // 요율대로면 90만
  })

  it('한도가 없는 구간은 요율 그대로고 부가세가 10% 별도다', () => {
    const f = calculateBrokerageFee(380_000_000)
    expect(f.brokerageFee).toBe(1_520_000)
    expect(f.vat).toBe(152_000)
  })
})

describe('purchaseSummary (매수 총액과 남는 돈)', () => {
  const home = { housePrice: 380_000_000, houseSize: 59, netProceedsAmount: 500_000_000 }

  it('매수가 + 취득세 + 중개보수(부가세 포함)가 총액이다', () => {
    expect(purchaseSummary(home).totalPurchaseAmount).toBe(385_852_000)
  })

  it('실수령액에서 총액을 빼면 남는 돈이다', () => {
    expect(purchaseSummary(home).remainingAfterPurchase).toBe(114_148_000)
  })

  it('실수령액이 총액보다 적으면 음수가 아니라 0이다', () => {
    const poor = { ...home, netProceedsAmount: 100_000_000 }
    expect(purchaseSummary(poor).remainingAfterPurchase).toBe(0)
  })

  it('매물이 없으면 전부 0으로 떨어진다', () => {
    expect(purchaseSummary(null).totalPurchaseAmount).toBe(0)
    expect(purchaseSummary(null).remainingAfterPurchase).toBe(0)
  })
})
