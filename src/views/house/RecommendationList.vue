<template>
  <div class="recommendation-list">
    <div class="page-content">
      <section class="content">
        <!-- 왼쪽 패널, 매물 목록 5곳 -->
        <div class="left-panel">
          <h2 class="main-title">{{ survey.displayName }}님이 선택한 페르소나 기준으로 집 {{ displayedHomes.length }}곳을 찾았어요.</h2>
          <p class="sub-title">저장된 설문조사와 희망 지역을 기준으로 추천했어요.</p>
          <p v-if="loading" class="sub-title">추천 매물을 불러오는 중입니다.</p>
          <p v-else-if="errorMessage" class="sub-title error-message">{{ errorMessage }}</p>

          <p v-else-if="loadError" class="state-message">{{ loadError }}</p>
          <p v-else-if="displayedHomes.length === 0" class="state-message">
            조건에 맞는 매물을 찾지 못했어요.
          </p>

          <HomeCard
            v-for="home in displayedHomes"
            :key="home.id"
            :home="home"
            :is-selected="home.id === selectedId"
            @select="selectHome"
          />
        </div>

        <div class="right-column">
          <PurchaseCostPanel v-if="selectedHome" :selected-home="selectedHome" />

          <div class="map-area">
            <HomeMapView :homes="displayedHomes" :selected-id="selectedId" @select="selectHome"/>
          </div>
        </div>
      </section>

      <!-- 구분선 -->
      <div class="divider"></div>

      <div class="bottom-actions">
        <button class="retry-btn" type="button" @click="restartSurvey">← 설문조사 다시하기</button>
        <button class="condition-btn" type="button" @click="changeConditions">마음에 드는 집이 없나요? <br>조건을 바꿔볼게요.</button>
        <div class="compare-area">
          <span class="picked-count">담은 매물 {{ favStore.count }}/3</span>
          <button class="compare-btn" type="button" @click="router.push('/favorite-home')">현재 담은 매물 비교하러 가기 →</button>
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
import HomeCard from '@/components/house/HomeCard.vue';
import HomeMapView from '@/components/house/HomeMapView.vue';
import PurchaseCostPanel from '@/components/house/PurchaseCostPanel.vue';
import { computed, onMounted,reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { favoriteStore } from '@/stores/favoriteStore.js';
import { useSurveyStore } from '@/stores/survey';
import propertyRecommendationApi from '@/api/propertyRecommendation';

const favStore = favoriteStore();
const router = useRouter();
const survey = useSurveyStore();
const homes = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const selectedId = ref(null);

const selectedHome = computed(() => {
  return homes.value.find(h => h.id === selectedId.value) || homes.value[0] || null;
});

const displayedHomes = computed(() => homes.value.slice(0, 5));

async function loadRecommendations() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await propertyRecommendationApi.list();
    homes.value = response.map((home) => ({
      ...home,
      priceNum: Number(home.priceNum) / 10000,
    }));
    selectedId.value = homes.value[0]?.id ?? null;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '추천 매물을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

function selectHome(homeId) {
  selectedId.value = homeId;
}

async function restartSurvey() {
  favStore.clear();
  await survey.reset();
  router.push('/survey?mode=restart');
}

function changeConditions() {
  favStore.clear();
  survey.startConditionEdit();
  router.push('/survey?mode=conditions');
}

onMounted(async () => {
  if (!survey.calculation && !survey.expectedSalePrice) {
    await survey.restoreLatest();
  }
  await favStore.loadFavorites(true);
  await loadRecommendations();
});
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


.main-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}

.sub-title {
  color: #888;
  margin: 0 0 20px;
}

.error-message {
  color: #b44;
}

.state-message {
  color: #888;
  padding: 24px 0;
  text-align: center;
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

/* 오른쪽 패널 */
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* 지도 부분 */
.map-area {
  flex: 1;                 /* 남는 세로 공간을 다 채움 → 왼쪽 목록이랑 높이 맞춰짐 */
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f0e8;
}
</style>
