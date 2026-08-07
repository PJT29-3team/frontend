// 새 집을 살 때 드는 세금·수수료. 관심매물 비교 화면과 최종 요약이 같은 숫자를 보여야 해서
// 여기 한 곳에만 둔다.

/** 유상거래 주택 취득세율. 6억 이하 1%, 6~9억 구간 선형, 9억 초과 3%. */
export function getNormalHousingAcquisitionRate(buyPrice) {
  if (buyPrice <= 600_000_000) return 0.01
  if (buyPrice <= 900_000_000) return (buyPrice * 2 / 300_000_000 - 3) / 100
  return 0.03
}

/** 농어촌특별세. 전용 85㎡ 이하 국민주택은 비과세. */
export function calculateRuralTax(buyPrice, isSmallArea) {
  return isSmallArea ? 0 : Math.round(buyPrice * 0.002)
}

/** 지방교육세. */
export function calculateEducationTax(buyPrice, acquisitionRate) {
  let educationRate
  if (buyPrice <= 600_000_000) {
    educationRate = 0.001
  } else if (buyPrice <= 900_000_000) {
    educationRate = acquisitionRate * 0.1
  } else {
    educationRate = 0.003
  }
  return Math.round(buyPrice * educationRate)
}

/**
 * 취득 관련 세금 합계.
 * @param exclusiveAreaSqm 전용면적(㎡). 모르면 국민주택으로 보고 농특세를 0으로 둔다.
 */
export function calculatePurchaseCost(buyPrice, exclusiveAreaSqm) {
  const isSmallArea = exclusiveAreaSqm == null ? true : exclusiveAreaSqm <= 85
  const acquisitionRate = getNormalHousingAcquisitionRate(buyPrice)
  const ruralTax = calculateRuralTax(buyPrice, isSmallArea)
  const educationTax = calculateEducationTax(buyPrice, acquisitionRate)
  const acquisitionTax = Math.round(buyPrice * acquisitionRate)
  const totalTax = acquisitionTax + ruralTax + educationTax
  return { acquisitionTax, ruralTax, educationTax, totalTax }
}

/** 중개보수. 구간별 요율과 한도액이 있고 부가세는 별도다. */
export function calculateBrokerageFee(price) {
  let rate, limit
  if (price < 50_000_000) {
    rate = 0.006
    limit = 250_000
  } else if (price < 200_000_000) {
    rate = 0.005
    limit = 800_000
  } else if (price < 900_000_000) {
    rate = 0.004
    limit = null
  } else if (price < 1_200_000_000) {
    rate = 0.005
    limit = null
  } else if (price < 1_500_000_000) {
    rate = 0.006
    limit = null
  } else {
    rate = 0.007
    limit = null
  }
  const rawFee = price * rate
  const brokerageFee = Math.round(limit == null ? rawFee : Math.min(rawFee, limit))
  const vat = Math.round(brokerageFee * 0.1)
  return { rate, limit, rawFee, brokerageFee, vat }
}

/**
 * 관심매물 1건의 매수 총액과 남는 돈.
 * netProceedsAmount(현재 집을 팔고 세금까지 뗀 실수령액)는 서버가 계산해 내려준다.
 */
export function purchaseSummary(home) {
  const buyPrice = Number(home?.housePrice || 0)
  const areaSqm = home?.houseSize == null ? null : Number(home.houseSize)
  const purchaseCost = calculatePurchaseCost(buyPrice, areaSqm)
  const brokerage = calculateBrokerageFee(buyPrice)
  const totalPurchaseAmount =
    buyPrice + purchaseCost.totalTax + brokerage.brokerageFee + brokerage.vat
  const netProceedsAmount = Number(home?.netProceedsAmount || 0)
  const remainingAfterPurchase = Math.max(netProceedsAmount - totalPurchaseAmount, 0)
  return {
    buyPrice,
    purchaseCost,
    brokerage,
    totalPurchaseAmount,
    netProceedsAmount,
    remainingAfterPurchase,
  }
}
