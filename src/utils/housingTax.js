export const HIGH_VALUE_HOME_THRESHOLD = 1_200_000_000;
/** 양도소득 기본공제 */
export const BASIC_DEDUCTION = 2_500_000;
export const VAT_RATE = 0.1;

const BROKERAGE_BRACKETS = [
  { under: 50_000_000, rate: 0.006, cap: 250_000 },
  { under: 200_000_000, rate: 0.005, cap: 800_000 },
  { under: 900_000_000, rate: 0.004, cap: null },
  { under: 1_200_000_000, rate: 0.005, cap: null },
  { under: 1_500_000_000, rate: 0.006, cap: null },
  { under: Infinity, rate: 0.007, cap: null },
];

const TAX_BRACKETS = [
  { upTo: 14_000_000, rate: 0.06, deduction: 0 },
  { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { upTo: 500_000_000, rate: 0.4, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { upTo: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function won(n) {
  return Math.floor(n).toLocaleString("ko-KR");
}

function percent(rate) {
  return `${Number((rate * 100).toFixed(4))}%`;
}

export function calculateBrokerageFee(salePrice) {
  const price = Number(salePrice) || 0;
  if (price <= 0) {
    return { amount: 0, rate: 0, baseFee: 0, vat: 0, steps: [] };
  }

  const bracket = BROKERAGE_BRACKETS.find((b) => price < b.under);
  const uncapped = price * bracket.rate;
  const baseFee = Math.floor(
    bracket.cap === null ? uncapped : Math.min(uncapped, bracket.cap),
  );
  const vat = Math.floor(baseFee * VAT_RATE);
  const amount = baseFee + vat;

  const steps = [
    `거래금액(${won(price)}) * 상한요율 ${percent(bracket.rate)} = 중개보수 (${won(baseFee)})`,
    `중개보수 + 부가세(${percent(VAT_RATE)}) = 총 중개보수 ${won(amount)}`,
  ];
  if (bracket.cap !== null && uncapped > bracket.cap) {
    steps.splice(1, 0, `상한액 ${won(bracket.cap)} 적용`);
  }

  return { amount, rate: bracket.rate, baseFee, vat, steps };
}

function longTermDeductionRate(holdingYears, residenceYears) {
  if (holdingYears < 3) return 0;
  if (residenceYears >= 2) {
    const byHolding = Math.min(holdingYears, 10) * 0.04;
    const byResidence = Math.min(residenceYears, 10) * 0.04;
    return Math.min(byHolding + byResidence, 0.8);
  }
  return Math.min(Math.min(holdingYears, 15) * 0.02, 0.3);
}

function shortTermRate(holdingYears) {
  if (holdingYears < 1) return 0.7;
  return 0.6;
}

function applyProgressiveRate(taxBase) {
  const bracket = TAX_BRACKETS.find((b) => taxBase <= b.upTo);
  return {
    rate: bracket.rate,
    deduction: bracket.deduction,
    tax: Math.max(Math.floor(taxBase * bracket.rate - bracket.deduction), 0),
  };
}

/**
 * 1세대 1주택 기준 양도소득세를 추정한다.
 *
 * @param {object} input
 * @param {number} input.purchasePrice   취득가액(샀던 가격)
 * @param {number} input.salePrice       양도가액(팔고 싶은 가격)
 * @param {number} input.holdingYears    보유기간(년)
 * @param {number} input.residenceYears  거주기간(년)
 * @param {boolean} input.isRegulatedArea 조정대상지역 주택 여부
 * @returns {{ amount: number, exempt: boolean, steps: string[] }}
 */
export function calculateCapitalGainsTax({
  purchasePrice,
  salePrice,
  holdingYears,
  residenceYears,
  isRegulatedArea,
} = {}) {
  const buy = Number(purchasePrice) || 0;
  const sell = Number(salePrice) || 0;
  const held = Number(holdingYears) || 0;
  const lived = Number(residenceYears) || 0;

  if (sell <= 0) {
    return { amount: 0, exempt: false, steps: [] };
  }

  const gain = sell - buy;
  if (gain <= 0) {
    return {
      amount: 0,
      exempt: false,
      steps: ["양도차익이 없어 납부할 양도소득세가 없습니다."],
    };
  }

  // 1세대 1주택 비과세: 12억 이하 + 2년 이상 보유. 조정대상지역은 2년 이상 거주까지 필요.
  const meetsHolding = held >= 2;
  const meetsResidence = !isRegulatedArea || lived >= 2;
  if (sell <= HIGH_VALUE_HOME_THRESHOLD && meetsHolding && meetsResidence) {
    const reason = isRegulatedArea
      ? "1세대 1주택 비과세 요건 충족 (매도가격 12억 이하 + 2년 이상 보유 + 조정대상지역 2년 이상 거주)"
      : "1세대 1주택 비과세 요건 충족 (매도가격 12억 이하 + 2년 이상 보유)";
    return { amount: 0, exempt: true, steps: [reason] };
  }

  const steps = [];

  // 보유 2년 미만은 비과세·장기보유공제 없이 단기 중과세율을 적용한다.
  if (!meetsHolding) {
    const rate = shortTermRate(held);
    const taxBase = Math.max(gain - BASIC_DEDUCTION, 0);
    const amount = Math.floor(taxBase * rate);
    steps.push(
      `양도차익 = 매도가격(${won(sell)}) - 취득가격(${won(buy)}) = ${won(gain)}`,
      `과세표준 = 양도차익 - 기본공제(${won(BASIC_DEDUCTION)}) = ${won(taxBase)}`,
      `보유 2년 미만 단기세율 ${percent(rate)} 적용 = ${won(amount)}`,
    );
    return { amount, exempt: false, steps };
  }

  steps.push(
    `양도차익 = 매도가격(${won(sell)}) - 취득가격(${won(buy)}) = ${won(gain)}`,
  );

  // 12억 초과 고가주택은 초과분에 해당하는 양도차익만 과세한다.
  let taxableGain = gain;
  if (sell > HIGH_VALUE_HOME_THRESHOLD) {
    taxableGain = Math.floor(
      (gain * (sell - HIGH_VALUE_HOME_THRESHOLD)) / sell,
    );
    steps.push(
      `12억 초과분 안분: ${won(gain)} x (${won(sell)} - ${won(HIGH_VALUE_HOME_THRESHOLD)}) / ${won(sell)} = ${won(taxableGain)}`,
    );
  } else if (!meetsResidence) {
    steps.push(
      "조정대상지역 2년 이상 거주 요건 미충족으로 비과세가 적용되지 않습니다.",
    );
  }

  const deductionRate = longTermDeductionRate(held, lived);
  const longTermDeduction = Math.floor(taxableGain * deductionRate);
  if (longTermDeduction > 0) {
    steps.push(
      `장기보유특별공제 ${percent(deductionRate)} = ${won(longTermDeduction)}`,
    );
  }

  const income = taxableGain - longTermDeduction;
  const taxBase = Math.max(income - BASIC_DEDUCTION, 0);
  steps.push(
    `과세표준 = ${won(income)} - 기본공제(${won(BASIC_DEDUCTION)}) = ${won(taxBase)}`,
  );

  const { rate, deduction, tax } = applyProgressiveRate(taxBase);
  steps.push(
    `산출세액 = ${won(taxBase)} x ${percent(rate)} - 누진공제(${won(deduction)}) = ${won(tax)}`,
  );

  return { amount: tax, exempt: false, steps };
}
