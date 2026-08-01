<template>
    <!-- 남는 돈 패널, 지도 -->
        <div class="right-panel">
          <div class="summary-card">
            <p class="summary-title">{{ selectedHome.address }}로 옮기시면</p>
            <div class="summary-row">
              <span>내집 팔고 대출 갚고 남는 돈</span>
              <span>5억 683만원</span>
            </div>
            <div class="summary-row">
              <span>이 집 가격</span>
              <span>- {{ selectedHome.price }}</span>
            </div>

            <div class="summary-sub">
              <p class="summary-sub-title">집 살 때 드는 비용</p>
              <div class="summary-row small">
                <span>취득세({{ acquisitionRatePercent  }}%)</span>
                <span>- {{ formatKoreanMoney(acquisitionTax) }}</span>
              </div>
              <div class="summary-row small">
                <span>중개보수({{ brokerageRatePercent }}%)</span>
                <span>- {{ formatKoreanMoney(brokerFee) }}</span>
              </div>
            </div>

            <div class="summary-row total">
              <span>실제 총 지출</span>
              <span>- {{ formatKoreanMoney(totalCost) }}</span>
            </div>

            <div class="result-box">
              <span>남는 돈</span>
              <strong>약 1억 5650만원</strong>
            </div>
            <p class="goal-compare">
                목표 1억 5,000만원 대비 <span class="diff">+650만원 여유</span>
            </p>

            <p class="summary-note">
              취득세율은 1주택 조정대상지역 외 기준 예시이며, 실제 세율은 주택 수와 지역, 거래가 구간에 따라 달라져요.
            </p>
          </div>
        </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    selectedHome : {
        type : Object,
        required : true
    }
})

// 1. 계산 함수들
// 취득세율 로직
function getNormalHousingAcquisitionRate(buyPrice) {
  if(buyPrice <= 600_000_000) {
    return 0.01; // 6억 이하 취득세율 1%
  } else if (buyPrice <= 900_000_000) {
    return (buyPrice * 2 / 300_000_000 - 3) / 100; // 6억 이상 9억 이하 취득세율
  } else {
    return 0.03;  // 9억 초과 취득세율
  }
}

// 농어촌특별세
function calculateRuralTax(buyPrice, isSmallArea) {
    const ruralTax = isSmallArea ? 0 : Math.round(buyPrice * 0.002);

    return ruralTax;
}

// 지방교육세
function calculateEducationTax(buyPrice, acquisitionRate) {
    let educationRate;

    if(buyPrice <= 600_000_000) {
        educationRate = 0.001;
    } else if (buyPrice <= 900_000_000) {
        educationRate = acquisitionRate * 0.1;
    } else {
        educationRate = 0.003;
    }

    const educationTax = Math.round(buyPrice * educationRate);
    return educationTax;
}

// 총 취득세
function calculatePurchaseCost(buyPrice, exclusiveAreaSqm) {
    const isSmallArea = exclusiveAreaSqm == null ? true : exclusiveAreaSqm <= 85;

    const acquisitionRate = getNormalHousingAcquisitionRate(buyPrice);
    const ruralTax = calculateRuralTax(buyPrice, isSmallArea);
    const educationTax = calculateEducationTax(buyPrice, acquisitionRate);

    const acquisitionTax = Math.round(buyPrice * acquisitionRate);
    const totalTax = acquisitionTax + ruralTax + educationTax;

    return { acquisitionTax, ruralTax, educationTax, totalTax };
}


// 중개수수료
// 중개보수
function calculateBrokerageFee(price) {
    let rate, limit;

    if (price < 50_000_000) {
        rate = 0.006;
        limit = 250_000;
    } else if (price < 200_000_000) {
        rate = 0.005;
        limit = 800_000;
    } else if (price < 900_000_000) {
        rate = 0.004;
        limit = null;
    } else if (price < 1_200_000_000) {
        rate = 0.005;
        limit = null;
    } else if (price < 1_500_000_000) {
        rate = 0.006;
        limit = null;
    } else {
        rate = 0.007;
        limit = null;
    }

    const rawFee = price * rate;
    const brokerageFee = Math.round(limit == null ? rawFee : Math.min(rawFee, limit));
    const vat = Math.round(brokerageFee * 0.1);

    return { rate, limit, rawFee, brokerageFee, vat };
}

// 2. computed 
const buyPrice = computed(() => props.selectedHome.priceNum * 10000);
const purchaseCost = computed(() => calculatePurchaseCost(buyPrice.value));
const acquisitionTax = computed(() => Math.round(purchaseCost.value.totalTax / 10000));
const brokerage = computed(() => calculateBrokerageFee(buyPrice.value));
const brokerFee = computed(() => Math.round((brokerage.value.brokerageFee + brokerage.value.vat) / 10000));
const totalCost = computed(() => Math.round((buyPrice.value + purchaseCost.value.totalTax + brokerage.value.brokerageFee + brokerage.value.vat) / 10000));

const acquisitionRatePercent = computed(() => {
    const totalRate = (purchaseCost.value.acquisitionTax + purchaseCost.value.educationTax) / buyPrice.value;
    return (totalRate * 100).toFixed(2);
});

const brokerageRatePercent = computed(() => (brokerage.value.rate * 100).toFixed(1));

// 3. 유틸 함수
function formatKoreanMoney(manwon) {
  const eok = Math.floor(manwon / 10000);
  const man = manwon % 10000;
  
  if (eok === 0) return `${man.toLocaleString()}만원`;
  if (man === 0) return `${eok}억원`;
  return `${eok}억 ${man.toLocaleString()}만원`;
}
</script>

<style scoped>
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 남는 돈 요약 카드 */
.summary-card {
  background: #545045;
  color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.summary-title {
  font-size: 13px;
  color: #ddd;
  margin: 0 0 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}

.summary-row.small {
  font-size: 12px;
  color: #ccc;
  padding: 2px 0;
}

.summary-row.total {
  border-top: 1px solid #6b665a;
  margin-top: 8px;
  padding-top: 8px;
  font-weight: 700;
}

.summary-sub {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 8px 0;
}

.summary-sub-title {
  font-size: 12px;
  color: #ccc;
  margin: 0 0 4px;
}

.result-box {
  background: #f5c518;
  color: #4a3a00;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-weight: 700;
}

.summary-note {
  font-size: 11px;
  color: #bbb;
  margin-top: 10px;
  line-height: 1.5;
}

.goal-compare {
  font-size: 12px;
  color: #999;
  margin: 8px 0 0;
}

.diff {
  color: #7ec850;
  font-weight: 700;
}
</style>