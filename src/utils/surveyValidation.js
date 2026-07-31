/**
 * 설문 단계별 유효성 검사.
 *
 * 각 함수는 필드명을 키로 하는 오류 메시지 객체를 돌려준다.
 * 오류가 없으면 빈 객체이므로 `isStepValid()`로 통과 여부를 판단한다.
 * 단계 컴포넌트는 이 결과를 `다음` 버튼 disabled와 invalid-feedback 문구에 함께 쓴다.
 */

export const MESSAGES = {
  purchasePrice: "실거래가를 입력해주세요.",
  expectedSalePrice: "팔고 싶은 가격을 입력해주세요.",
  holdingYears: "보유기간을 선택해주세요.",
  residenceYears: "거주기간을 선택해주세요.",
  residenceOverHolding: "거주기간은 보유기간보다 길 수 없어요.",
  isRegulatedArea: "조정대상지역 해당 여부를 선택해주세요.",
  hasMortgage: "대출 보유 여부를 선택해주세요.",
  mortgageBalance: "남은 대출 잔액을 입력해주세요.",
  mortgageOverProceeds: "대출 잔액이 집을 팔고 남는 돈보다 많아요.",
  reserveAmount: "남기고 싶은 금액을 입력해주세요.",
  reserveOverProceeds: "이사 후 남길 금액이 예상 실수령액보다 많아요.",
  profileCode: "하나를 선택해주세요.",
  desiredRegions: "지역을 한 곳 이상 골라주세요.",
};

function isPositiveAmount(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isSelectedYears(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** 1단계: 샀던 가격 / 팔고 싶은 가격 */
export function validateSalePrice({ purchasePrice, expectedSalePrice } = {}) {
  const errors = {};
  if (!isPositiveAmount(purchasePrice)) {
    errors.purchasePrice = MESSAGES.purchasePrice;
  }
  if (!isPositiveAmount(expectedSalePrice)) {
    errors.expectedSalePrice = MESSAGES.expectedSalePrice;
  }
  return errors;
}

/** 2단계: 보유기간 / 거주기간 / 조정대상지역 */
export function validateHoldingPeriod({
  holdingYears,
  residenceYears,
  isRegulatedArea,
} = {}) {
  const errors = {};
  if (!isSelectedYears(holdingYears)) {
    errors.holdingYears = MESSAGES.holdingYears;
  }
  if (!isSelectedYears(residenceYears)) {
    errors.residenceYears = MESSAGES.residenceYears;
  } else if (
    isSelectedYears(holdingYears) &&
    residenceYears > holdingYears
  ) {
    errors.residenceYears = MESSAGES.residenceOverHolding;
  }
  if (typeof isRegulatedArea !== "boolean") {
    errors.isRegulatedArea = MESSAGES.isRegulatedArea;
  }
  return errors;
}

/** 3단계: 계산 결과 표시 전용이라 검사할 입력이 없다. */
export function validateTaxSummary() {
  return {};
}

/**
 * 4단계: 이사 후 남기고 싶은 금액.
 * 매도 실수령액을 넘으면 살 집을 구할 수 없으므로 막는다.
 */
export function validateReserveBudget({ reserveAmount, netProceeds } = {}) {
  const errors = {};
  if (
    typeof reserveAmount !== "number" ||
    !Number.isFinite(reserveAmount) ||
    reserveAmount < 0
  ) {
    errors.reserveAmount = MESSAGES.reserveAmount;
  } else if (
    typeof netProceeds === "number" &&
    Number.isFinite(netProceeds) &&
    reserveAmount > netProceeds
  ) {
    errors.reserveAmount = MESSAGES.reserveOverProceeds;
  }
  return errors;
}

/** 3단계: 대출 여부와 잔액 */
export function validateMortgage({
  hasMortgage,
  mortgageBalance,
  netProceeds,
} = {}) {
  const errors = {};
  if (typeof hasMortgage !== "boolean") {
    errors.hasMortgage = MESSAGES.hasMortgage;
    return errors;
  }
  if (!hasMortgage) return errors; // 대출이 없으면 잔액을 묻지 않는다.

  if (
    typeof mortgageBalance !== "number" ||
    !Number.isFinite(mortgageBalance) ||
    mortgageBalance <= 0
  ) {
    errors.mortgageBalance = MESSAGES.mortgageBalance;
  } else if (
    typeof netProceeds === "number" &&
    Number.isFinite(netProceeds) &&
    mortgageBalance > netProceeds
  ) {
    errors.mortgageBalance = MESSAGES.mortgageOverProceeds;
  }
  return errors;
}

/** 5단계: 선호 유형 */
export function validatePreference({ profileCode } = {}) {
  const errors = {};
  if (!profileCode) {
    errors.profileCode = MESSAGES.profileCode;
  }
  return errors;
}

/** 6단계: 희망 지역 */
export function validateDesiredRegions({ desiredRegions } = {}) {
  const errors = {};
  if (!Array.isArray(desiredRegions) || desiredRegions.length === 0) {
    errors.desiredRegions = MESSAGES.desiredRegions;
  }
  return errors;
}

/** STEP_ORDER의 단계 코드 -> 검사 함수 */
export const VALIDATORS = {
  SALE_PRICE: validateSalePrice,
  HOLDING_PERIOD: validateHoldingPeriod,
  TAX_SUMMARY: validateTaxSummary,
  MORTGAGE: validateMortgage,
  RESERVE_BUDGET: validateReserveBudget,
  PREFERENCE_PROFILE: validatePreference,
  DESIRED_REGION: validateDesiredRegions,
};

export function validateStep(stepCode, input) {
  const validator = VALIDATORS[stepCode];
  return validator ? validator(input) : {};
}

export function isStepValid(stepCode, input) {
  return Object.keys(validateStep(stepCode, input)).length === 0;
}
