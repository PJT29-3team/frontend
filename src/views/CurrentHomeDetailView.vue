<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { currentHomePreview } from '../data/currentHome'

const router = useRouter()

// 추후 설문/현재주택 API의 data가 없을 때에는 null이 되도록 연결합니다.
// 지금은 지도 화면을 확인할 수 있도록 임시 미리보기 데이터를 사용합니다.
const home = computed(() => currentHomePreview)

function goBack() {
  router.push('/homes/current')
}
</script>

<template>
  <section class="detail-page">
    <div v-if="home" class="detail-content">
      <button class="back-button" type="button" @click="goBack">← 현재매물 목록으로 돌아가기</button>

      <header class="property-heading">
        <h1>{{ home.name }}</h1>
        <p>{{ home.address }}</p>
        <div class="property-tags" aria-label="주택 기본 정보">
          <span>{{ home.completion }}</span>
          <span>{{ home.buildingAge }}</span>
          <span>{{ home.size }} · {{ home.exclusiveArea }}</span>
          <span>{{ home.householdCount }}</span>
        </div>
      </header>

      <section class="ai-summary" aria-labelledby="ai-summary-title">
        <h2 id="ai-summary-title">✦ AI 요약</h2>
        <p>현재주택 설문과 시세 분석이 완료되면 최근 실거래가, 예상 매각 비용, 대출 잔액을 반영한 맞춤 분석 결과를 안내합니다.</p>
      </section>

      <section class="detail-card" aria-labelledby="area-title">
        <h2 id="area-title">평형 및 세대 정보</h2>
        <div class="area-options" aria-label="선택된 평형">
          <span class="is-selected">{{ home.size }} ({{ home.exclusiveArea }})</span>
        </div>
        <dl class="home-specs">
          <div><dt>공급면적</dt><dd>{{ home.supplyArea }}</dd></div>
          <div><dt>전용면적</dt><dd>{{ home.exclusiveArea }}</dd></div>
          <div><dt>방 / 욕실</dt><dd>{{ home.rooms }} / {{ home.bathrooms }}</dd></div>
          <div><dt>총 세대수</dt><dd>{{ home.householdCount.replace('총 ', '') }}</dd></div>
        </dl>
      </section>

      <section class="detail-card market-card" aria-labelledby="market-title">
        <h2 id="market-title">시세 추이</h2>
        <div class="market-overview">
          <div>
            <strong>2.9<span>억원</span></strong>
            <em>최근 거래가</em>
            <p>최근 실거래 · 2025.05 · {{ home.size }}형 기준</p>
          </div>
          <aside>
            <span>매도 후 예상 실수령액</span>
            <strong>1.72<span>억원</span></strong>
            <p>대출잔액 · 중개보수 · 세금 반영 추정치</p>
          </aside>
        </div>
        <div class="chart" aria-label="최근 시세 흐름 미리보기">
          <div class="chart-line"></div>
          <div class="chart-labels"><span>2023</span><span>2024</span><span>2025</span></div>
        </div>
      </section>

      <section class="detail-card" aria-labelledby="transactions-title">
        <h2 id="transactions-title">최근 실거래 내역</h2>
        <div class="transaction-table" role="table" aria-label="최근 실거래 내역">
          <div class="transaction-row transaction-head" role="row"><span>계약월</span><span>평형</span><span>층</span><span>거래가</span></div>
          <div v-for="transaction in home.transactions" :key="`${transaction.date}-${transaction.floor}`" class="transaction-row" role="row">
            <span>{{ transaction.date }}</span><span>{{ transaction.size }}</span><span>{{ transaction.floor }}</span><strong>{{ transaction.price }}</strong>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="empty-detail" role="status">
      <h1>현재주택 정보가 아직 없어요.</h1>
      <p>설문에서 주거지를 입력하면 이곳에서 맞춤 주택 분석을 확인할 수 있습니다.</p>
      <button type="button" @click="goBack">현재주택 화면으로 돌아가기</button>
    </div>
  </section>
</template>

<style scoped>
.detail-page { min-height: calc(100vh - 182px); padding: 34px 36px 56px; background: #f8f7f2; }
.detail-content { max-width: 1280px; margin: 0 auto; }
.back-button { min-height: 46px; padding: 0 20px; border: 1px solid #e5e3de; border-radius: 10px; background: #fff; color: #77736b; font-weight: 800; }
.property-heading { padding: 28px 0 22px; }.property-heading h1 { margin: 0; color: #2f2d29; font-size: clamp(29px, 3vw, 39px); }.property-heading p { margin: 7px 0 13px; color: #77736b; font-size: 17px; }
.property-tags,.area-options { display: flex; flex-wrap: wrap; gap: 8px; }.property-tags span,.area-options span { padding: 6px 13px; border-radius: 999px; background: #f1efe9; color: #77736b; font-size: 14px; font-weight: 800; }.area-options .is-selected { background: #545045; color: #fff; }
.ai-summary { margin-bottom: 28px; padding: 22px 24px; border: 1px solid #edd890; border-radius: 15px; background: #fff6da; }.ai-summary h2,.detail-card h2 { margin: 0; color: #2f2d29; font-size: 20px; }.ai-summary h2 { color: #957000; }.ai-summary p { margin: 10px 0 0; color: #635941; line-height: 1.7; }
.detail-card { margin-top: 22px; padding: 26px 28px; border: 1px solid #e5e3de; border-radius: 15px; background: #fff; }.detail-card h2 { margin-bottom: 20px; }.home-specs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0 0; }.home-specs div { padding: 18px; border-radius: 12px; background: #f8f8f6; }.home-specs dt { color: #a09b92; font-size: 14px; }.home-specs dd { margin: 8px 0 0; color: #2f2d29; font-size: 20px; font-weight: 900; }
.market-overview { display: flex; justify-content: space-between; gap: 28px; }.market-overview > div > strong,.market-overview aside strong { display: block; color: #2f2d29; font-size: 38px; }.market-overview strong span { margin-left: 5px; color: #77736b; font-size: 19px; }.market-overview em { display: inline-block; margin-left: 9px; padding: 4px 8px; border-radius: 6px; background: #fff2c6; color: #987300; font-style: normal; font-weight: 800; }.market-overview p { color: #aaa59c; }.market-overview aside { width: 310px; padding: 20px; border: 1px solid #d8e2dc; border-radius: 14px; background: #fff7df; }.market-overview aside > span { color: #8e6b00; font-weight: 900; }.market-overview aside strong { color: #9b7809; font-size: 32px; }.market-overview aside p { margin: 6px 0 0; color: #77736b; font-size: 13px; }
.chart { position: relative; height: 180px; margin-top: 28px; border-bottom: 1px solid #ead9a7; background: repeating-linear-gradient(to bottom, transparent 0, transparent 35px, #f0e4bd 36px); }.chart-line { position: absolute; top: 58px; right: 10%; left: 7%; height: 75px; border-top: 4px solid #a57900; border-radius: 50% 50% 0 0; transform: skewY(-5deg); }.chart-labels { position: absolute; right: 4%; bottom: -25px; left: 4%; display: flex; justify-content: space-between; color: #a58225; font-size: 13px; }
.transaction-table { display: grid; gap: 0; }.transaction-row { display: grid; grid-template-columns: 1.1fr 1fr 1fr 1.2fr; padding: 15px 8px; border-top: 1px solid #eeeae2; color: #4e4b46; }.transaction-head { border-top: 0; color: #aaa59c; font-size: 14px; }.transaction-row strong { text-align: right; }.transaction-row span:last-of-type { text-align: center; }
.empty-detail { max-width: 650px; margin: 70px auto; padding: 52px 28px; border: 1px solid #e5e3de; border-radius: 18px; background: #fff; text-align: center; }.empty-detail h1 { color: #2f2d29; }.empty-detail p { color: #77736b; font-size: 17px; line-height: 1.6; }.empty-detail button { margin-top: 15px; padding: 13px 21px; border-radius: 10px; background: #ffcc00; color: #2f2d29; font-weight: 900; }
@media (max-width: 760px) { .detail-page { padding: 24px 16px 42px; }.home-specs { grid-template-columns: repeat(2, 1fr); }.market-overview { display: grid; }.market-overview aside { width: 100%; }.transaction-row { grid-template-columns: 1.1fr .8fr .7fr 1.3fr; font-size: 14px; } }
</style>
