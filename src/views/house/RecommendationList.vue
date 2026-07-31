<template>
  <div class="recommendation-list">
    <AppHeader />
    <StepIndicator current-step="recommend"/>

    <div class="page-content">
      <section class="content">
        <!-- 왼쪽 패널, 매물 목록 5곳 -->
        <div class="left-panel">
          <h2 class="main-title">홍길동님 예산에 맞는 집, 5곳을 찾았어요.</h2>
          <p class="sub-title">이중에서 최대 3곳을 관심 목록에 담아보세요.</p>

          <HomeCard
            v-for="home in dummyHomes"
            :key="home.id"
            :home="home"
          />
        </div>

        <!-- 남는 돈 패널, 지도 -->
        <div class="right-panel">
          <div class="summary-card">
            <p class="summary-title">야탑동 탑마을(선경)로 옮기시면</p>
            <div class="summary-row">
              <span>내집 팔고 대출 갚고 남는 돈</span>
              <span>5억 683만원</span>
            </div>
            <div class="summary-row">
              <span>이 집 가격</span>
              <span>- 3억 4,500만원</span>
            </div>

            <div class="summary-sub">
              <p class="summary-sub-title">집 살 때 드는 비용</p>
              <div class="summary-row small">
                <span>취득세(1.1%)</span>
                <span>- 379만원</span>
              </div>
              <div class="summary-row small">
                <span>중개보수(0.4%)</span>
                <span>- 151만원</span>
              </div>
            </div>

            <div class="summary-row total">
              <span>실제 총 지출</span>
              <span>- 3억 5,030만원</span>
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

          <div class="map-area">
            <HomeMapView />
          </div>
        </div>
      </section>

      <!-- 구분선 -->
      <div class="divider"></div>

      <div class="bottom-actions">
        <button class="retry-btn">← 설문조사 다시하기</button>
        <button class="condition-btn">마음에 드는 집이 없나요? <br>조건을 바꿔볼게요.</button>
        <div class="compare-area">
          <span class="picked-count">담은 매물 2/3</span>
          <button class="compare-btn">현재 담은 매물 비교하러 가기 →</button>
        </div>
      </div>

      <p class="disclaimer">
        본 점수는 입력한 조건과 공공데이터를 활용한 매물 간 비교지표입니다. 주택의 가격 적정성, 권리관계, 실제 시설 상태 또는 거래 안전성을 보증하지 않습니다.
        계약 전 현장 확인과 등기·건축물 관련 서류 확인이 필요합니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue';
import HomeCard from '@/components/house/HomeCard.vue';
import HomeMapView from '../../components/house/HomeMapView.vue';
import StepIndicator from '@/components/common/StepIndicator.vue';

const dummyHomes = [
    { id : 1, rank : 1, price : '3억 4,500만원', address : '야탑동 탑마을(선경) · 24평', score : 88, isFavorite : true },
    { id: 2, rank: 2, price: '3억 5,000만원', address: '정자동 한솔마을(주공5단지) · 21평', score: 84, isFavorite: false },
    { id: 3, rank: 3, price: '3억 3,800만원', address: '서현동 풍림아이원플러스 · 23평', score: 79, isFavorite: true },
    { id: 4, rank: 4, price: '2억 9,500만원', address: '정자동 인빌리전자A · 25평', score: 76, isFavorite: true },
    { id: 5, rank: 5, price: '3억 2,000만원', address: '수내동 파크뷰(오피스텔) · 22평', score: 72, isFavorite: false },
]
</script>

<style scoped>
/* 본문 영역: 최대 너비 제한 + 가운데 정렬 (헤더는 별개로 꽉 참) */
.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.content {
  display: flex;
  gap: 32px;
  padding: 32px 0 0;
  align-items: stretch;
}

.left-panel {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}

.sub-title {
  color: #888;
  margin: 0 0 20px;
}

/* 구분선 */
.divider {
  border-top: 1px solid #eee;
  margin-top: 24px;
}

/* 하단 액션 영역 */
.bottom-actions {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: 20px;
}

.retry-btn,
.condition-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.compare-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.picked-count {
  font-size: 13px;
  color: #888;
}

.compare-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: #f5c518;
  font-weight: 700;
  border: none;
}

.disclaimer {
  font-size: 11px;
  color: #aaa;
  margin: 16px 0 24px;
  line-height: 1.6;
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

.map-area {
  flex: 1;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f0e8;
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