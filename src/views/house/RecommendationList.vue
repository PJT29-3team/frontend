<template>
  <div class="recommendation-list">
    <div class="page-content">
      <div class="view-header">
        <div>
          <h2 class="main-title">{{ survey.displayName }}님이 선택한 페르소나 기준으로 집 {{ displayedHomes.length }}곳을 찾았어요.</h2>
          <p class="sub-title">저장된 설문조사와 희망 지역을 기준으로 추천했어요.</p>
        </div>

        <!-- 보여줄 매물이 없으면 토글은 눌러도 갈 곳이 없다 -->
        <div v-if="hasHomes" class="view-toggle" role="tablist" aria-label="매물 보기 방식">
          <button
            class="toggle-btn"
            :class="{ active: currentView === 'list' }"
            type="button"
            role="tab"
            :aria-selected="currentView === 'list'"
            @click="switchView('list')"
          >
            <span class="toggle-icon" aria-hidden="true">📋</span> 목록
          </button>
          <button
            class="toggle-btn"
            :class="{ active: currentView === 'map' }"
            type="button"
            role="tab"
            :aria-selected="currentView === 'map'"
            @click="switchView('map')"
          >
            <span class="toggle-icon" aria-hidden="true">🗺️</span> 지도
          </button>
        </div>
      </div>

      <p v-if="loading" class="state-message">추천 매물을 불러오는 중입니다.</p>
      <p v-else-if="errorMessage" class="state-message error-message">{{ errorMessage }}</p>
      <div v-else-if="!hasHomes" class="empty-state">
        <p class="empty-title">조건에 맞는 집을 찾지 못했어요.</p>
        <p class="empty-desc">
          예산이나 희망 평수, 지역 범위를 조금 넓히면 후보가 생길 수 있어요.<br />
          아래에서 조건을 바꿔보세요.
        </p>
        <button class="empty-btn" type="button" @click="changeConditions">조건 바꾸러 가기 →</button>
      </div>

      <!-- 목록 뷰: 카드 + 상시 비용 패널.
           높이를 고정하지 않는다. 카드가 화면보다 길어지면 카드 칸이 아니라
           페이지가 스크롤되게 두는 편이 조작이 익숙하다. -->
      <section v-else-if="currentView === 'list'" ref="viewSection" class="content">
        <div class="left-panel">
          <HomeCard
            v-for="home in displayedHomes"
            :key="home.id"
            :home="home"
            :is-selected="home.id === selectedPropertyId"
            @select="selectProperty"
          />
        </div>

        <div class="right-column" :style="{ minHeight: panelMinHeight }">
          <PurchaseCostPanel v-if="selectedHome" :selected-home="selectedHome" />
        </div>
      </section>

      <!-- 지도 뷰: 전체 너비 + 핀 클릭 시 미니 카드 오버레이 -->
      <section v-else ref="viewSection" class="map-view" :style="{ height: viewHeight }">
        <HomeMapView ref="mapRef" :homes="displayedHomes" :selected-id="pinnedId" @select="pinHome" />

        <button class="back-to-list" type="button" @click="switchView('list')">← 목록으로</button>

        <!-- 핀을 눈으로 찾지 않아도 번호로 바로 확대해 볼 수 있게 -->
        <div class="rank-jump">
          <p class="rank-jump-title">매물 위치</p>
          <button
            v-for="home in displayedHomes"
            :key="home.id"
            class="rank-jump-btn"
            :class="{ active: home.id === pinnedId }"
            type="button"
            :title="home.name"
            @click="focusHome(home.id)"
          >
            {{ home.rank }}
          </button>
        </div>

        <div v-if="pinnedHome" class="pin-card">
          <div class="pin-score" :class="pinnedHome.score >= 70 ? 'tier-high' : 'tier-mid'">
            <strong>{{ pinnedHome.score }}</strong>
            <span>점</span>
          </div>
          <div class="pin-info">
            <p class="pin-label">나와 맞는 정도</p>
            <p class="pin-name">{{ pinnedHome.name }}</p>
            <p class="pin-meta">{{ formatPyeong(pinnedHome.size) }} · {{ pinnedHome.price }}</p>
          </div>
          <div class="pin-actions">
            <button class="pin-open" type="button" @click="openInList(pinnedHome.id)">목록에서 보기</button>
            <button
              class="pin-fav"
              :class="{ active: favStore.isFavorite(pinnedHome.id) }"
              type="button"
              :aria-label="favStore.isFavorite(pinnedHome.id) ? '관심 목록에서 빼기' : '관심 목록에 담기'"
              @click="togglePinFavorite(pinnedHome.id)"
            >
              {{ favStore.isFavorite(pinnedHome.id) ? '♥' : '♡' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 구분선 -->
      <div ref="bottomBlock">
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
  </div>
</template>

<script setup>
import HomeCard from '@/components/house/HomeCard.vue';
import HomeMapView from '@/components/house/HomeMapView.vue';
import PurchaseCostPanel from '@/components/house/PurchaseCostPanel.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { favoriteStore } from '@/stores/favoriteStore.js';
import { useSurveyStore } from '@/stores/survey';
import propertyRecommendationApi from '@/api/propertyRecommendation';
import { formatPyeong } from '@/utils/area';

const favStore = favoriteStore();
const router = useRouter();
const survey = useSurveyStore();
const homes = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const currentView = ref('list');
const mapRef = ref(null);
// 목록·지도 중 지금 떠 있는 쪽. v-if 로 한 번에 하나만 그려지므로 ref 를 공유한다.
const viewSection = ref(null);
const bottomBlock = ref(null);
// 두 뷰 모두 페이지 스크롤 없이 화면 안에 들어와야 한다.
// 헤더·단계표시줄 높이가 라우트마다 달라서 상수로 못 박지 않고 실제 위치를 잰다.
const viewHeight = ref('');
// 이보다 좁아지면 내용이 뭉개져서 차라리 페이지가 스크롤되는 편이 낫다.
const MIN_VIEW_HEIGHT = { list: 320, map: 320 };
// 비용 계산 칸의 세로 길이. 화면 바닥까지 채운다.
const panelMinHeight = ref('');
// 이보다 짧아지면 항목 사이가 벌어져 봐야 소용이 없다.
const MIN_PANEL_HEIGHT = 380;
// 비용 패널이 계산 중인 매물. 목록/지도 어느 쪽에서 골라도 이 값 하나로 모인다.
const selectedPropertyId = ref(null);
// 지도에서 핀을 눌러 미니 카드로 띄운 매물. 선택과는 별개다.
const pinnedId = ref(null);

const displayedHomes = computed(() => homes.value.slice(0, 5));
const hasHomes = computed(() => displayedHomes.value.length > 0);

const selectedHome = computed(
  () => displayedHomes.value.find((home) => home.id === selectedPropertyId.value) || null
);

const pinnedHome = computed(
  () => displayedHomes.value.find((home) => home.id === pinnedId.value) || null
);

async function loadRecommendations() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await propertyRecommendationApi.list();
    homes.value = response.map((home) => ({
      ...home,
      priceNum: Number(home.priceNum) / 10000,
    }));
    // 목록은 점수 내림차순이라 첫 항목이 추천 1위다.
    selectedPropertyId.value = homes.value[0]?.id ?? null;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '추천 매물을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

function selectProperty(homeId) {
  selectedPropertyId.value = homeId;
}

// 뷰를 전환하면 지도 미니 카드는 닫는다.
function switchView(view) {
  currentView.value = view;
  pinnedId.value = null;
  // 스크롤이 내려간 채로 전환하면 높이 계산이 어긋나고 지도도 잘려 보인다.
  window.scrollTo({ top: 0 });
  fitViewHeight();
  fitPanelHeight();
}

// 남는 세로 공간을 재서 지도에 그대로 준다.
// 목록 뷰는 높이를 재지 않는다. 카드가 길어지면 페이지가 스크롤되면 된다.
async function fitViewHeight() {
  await nextTick();
  if (currentView.value !== 'map' || !viewSection.value) return;

  // 페이지가 스크롤된 상태에서 재도 어긋나지 않게 문서 기준으로 환산한다.
  const top = viewSection.value.getBoundingClientRect().top + window.scrollY;
  const bottomHeight = bottomBlock.value?.getBoundingClientRect().height ?? 0;
  // 하단 고지문은 bottomBlock 밖에 있어 측정에 안 잡힌다. 그만큼을 빼야
  // 페이지 스크롤이 생기지 않는다.
  const footer = document.querySelector('.disclaimer');
  const footerHeight = footer ? footer.getBoundingClientRect().height + 12 : 0;
  const available = window.innerHeight - top - bottomHeight - footerHeight - 8;
  const floor = MIN_VIEW_HEIGHT[currentView.value] ?? 320;

  viewHeight.value = `${Math.max(floor, Math.round(available))}px`;
  await nextTick();
  if (currentView.value === 'map') mapRef.value?.relayout();
}

/**
 * 비용 계산 칸의 세로 길이를 화면 바닥까지로 맞춘다.
 *
 * calc(100vh - …) 로 못 하는 이유가 있다. 이 칸은 sticky 라 스크롤 전에는
 * 제 자리(화면 위에서 220px 즈음)에, 스크롤 후에는 top:16px 에 선다.
 * 화면 높이를 그대로 주면 스크롤 전 상태에서 아래가 잘린다.
 * 단계 표시줄 높이도 화면 높이에 따라 달라져 상수로 못 박을 수 없다.
 */
async function fitPanelHeight() {
  await nextTick();
  if (currentView.value !== 'list' || !viewSection.value) return;

  // 칸의 시작점은 .content 위가 아니라 그 padding-top 아래다. 이걸 빼먹으면
  // 화면이 클수록(padding 이 vh 비례라) 패널 바닥이 화면 밖으로 밀린다.
  // 칸 자체를 재지 않는 이유: sticky 라 스크롤된 상태에서는 top 이 16px 로 나온다.
  const section = viewSection.value;
  const paddingTop = parseFloat(getComputedStyle(section).paddingTop) || 0;
  const top = section.getBoundingClientRect().top + window.scrollY + paddingTop;
  const available = window.innerHeight - top - 8;
  panelMinHeight.value = `${Math.max(MIN_PANEL_HEIGHT, Math.round(available))}px`;
}

// 창 크기가 바뀌면 지도와 비용 칸 높이를 함께 다시 잰다.
function fitLayout() {
  fitViewHeight();
  fitPanelHeight();
}

// 핀을 누르면 목록으로 튕기지 않고 미니 카드만 갈아 끼운다.
function pinHome(homeId) {
  pinnedId.value = homeId;
}

// 번호 버튼: 그 매물로 지도를 확대하고 미니 카드도 같이 띄운다.
function focusHome(homeId) {
  pinnedId.value = homeId;
  mapRef.value?.focusHome(homeId);
}

function openInList(homeId) {
  selectProperty(homeId);
  switchView('list');
}

async function togglePinFavorite(homeId) {
  try {
    await favStore.toggleFavorite(homeId);
  } catch (error) {
    alert(error?.response?.data?.message || error?.message || '관심 매물을 처리하지 못했습니다.');
  }
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
  // 목록이 기본 뷰라 불러온 직후부터 높이를 맞춰둬야 한다.
  await fitViewHeight();
  await fitPanelHeight();
  window.addEventListener('resize', fitLayout);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', fitLayout);
});
</script>

<style scoped>
/* 본문 영역: 최대 너비 제한 + 가운데 정렬 (헤더는 별개로 꽉 참) */
.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 목록 뷰는 높이를 두지 않는다. 카드 수만큼 자라고, 넘치면 페이지가 스크롤된다. */
.content {
  display: flex;
  gap: 32px;
  /* 세로가 짧은 화면에서 카드 영역을 넓히려고 상단 여백을 줄인다. */
  padding: clamp(8px, 1.4vh, 32px) 0 0;
  align-items: flex-start;
}

/* 좌우 비율 2:1. 한때 1.5 까지 넓혔다가 되돌렸다 —
   금액은 552px 든 429px 든 어차피 한 줄에 들어가고, 넓히면 칸이 둔해 보인다.
   세로로 늘리는 쪽이 낫다(fitPanelHeight). */
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
  /* 세로가 짧은 화면에서 카드 5장을 스크롤 없이 담으려고 여백을 줄인다. */
  margin: 0 0 clamp(6px, 1.2vh, 20px);
}

.error-message {
  color: #b44;
}

.state-message {
  color: #888;
  padding: 24px 0;
  text-align: center;
}

/* 매물이 하나도 없을 때. 막다른 길로 두지 않고 다음 행동을 준다. */
.empty-state {
  margin: 20px 0 0;
  padding: 56px 24px;
  border-radius: 14px;
  border: 1px solid #ebe7dd;
  background: #faf8f3;
  text-align: center;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #2b2822;
  margin: 0 0 10px;
}

.empty-desc {
  font-size: 14px;
  color: #8a8477;
  line-height: 1.7;
  margin: 0 0 20px;
}

.empty-btn {
  padding: 12px 22px;
  border-radius: 999px;
  border: none;
  background: #f5c518;
  font-size: 14px;
  font-weight: 700;
  color: #4a3a00;
  cursor: pointer;
}

.empty-btn:hover {
  background: #e8b800;
}

/* 구분선 */
.divider {
  border-top: 1px solid #eee;
  margin-top: clamp(8px, 1.4vh, 24px);
}

/* 하단 액션 영역 */
.bottom-actions {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: clamp(10px, 1.6vh, 20px);
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
  margin: clamp(6px, 1vh, 16px) 0 clamp(8px, 1.4vh, 24px);
  line-height: 1.6;
}

/* 13인치 노트북(뷰포트 730~790px)에서 카드 5장이 스크롤 없이 들어가도록
   제목·토글·하단 버튼을 한 단계씩 줄인다. 카드 영역은 그만큼 넓어진다. */
@media (max-height: 860px) {
  .main-title {
    font-size: 19px;
  }

  .content {
    padding-top: clamp(6px, 1vh, 32px);
  }

  .view-toggle {
    padding: 3px;
  }

  .toggle-btn {
    padding: 6px 16px;
    font-size: 12.5px;
  }

  .retry-btn,
  .condition-btn,
  .compare-btn {
    padding: 6px 14px;
    font-size: 12.5px;
  }

  .disclaimer {
    font-size: 10.5px;
    line-height: 1.5;
  }

}

/* 오른쪽 패널: 비용 계산 전용.
   페이지를 내려 카드를 훑는 동안에도 금액이 계속 보여야 비교가 되므로
   화면에 붙여 둔다. 카드 높이에 맞춰 늘리지 않고 내용만큼만 차지한다. */
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: sticky;
  top: 16px;
  /* 세로 길이는 fitPanelHeight() 가 인라인으로 넣는다.
     여기 값은 계산 전 한 프레임용 폴백. */
  min-height: 380px;
}

/* 카드만 길어지고 속은 위쪽에 몰리면 어색하다.
   남는 세로 공간을 항목 사이에 나눠 내용이 카드를 채우게 한다. */
.right-column :deep(.summary-card) {
  flex: 1;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
}

/* 시니어 대상이라 글자를 키운다. 여백이 넓어 보이던 것도 대부분 글자가 작아서였다. */
.right-column :deep(.summary-title) {
  font-size: 15px;
}

.right-column :deep(.summary-row) {
  font-size: 15px;
  padding: 7px 0;
  gap: 12px;
}

.right-column :deep(.summary-row.small) {
  font-size: 13px;
  padding: 4px 0;
}

.right-column :deep(.summary-sub) {
  padding: 12px 14px;
}

.right-column :deep(.summary-sub-title) {
  font-size: 13px;
}

/* 이 화면에서 가장 중요한 숫자 */
.right-column :deep(.result-box) {
  font-size: 16px;
  padding: 16px;
}

.right-column :deep(.result-box strong) {
  font-size: 21px;
}

.right-column :deep(.goal-compare) {
  font-size: 13px;
}

.right-column :deep(.summary-note) {
  font-size: 12px;
  margin-top: 0;
}

/* 목록/지도 토글 */
.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-top: clamp(10px, 1.8vh, 32px);
}

.view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f2efe7;
  border-radius: 999px;
  flex-shrink: 0;
}

.toggle-btn {
  min-width: 76px;
  padding: 8px 18px;
  border: none;
  background: transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #8a8477;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn:hover {
  color: #545045;
}

.toggle-btn.active {
  background: #545045;
  color: #fff;
}

/* 지도 뷰 */
.map-view {
  position: relative;
  height: calc(100vh - 220px);
  /* fitViewHeight() 가 계산한 높이를 이 값이 되받아치면 페이지가 스크롤된다.
     하한은 MIN_VIEW_HEIGHT.map 과 같은 320px 로 맞춘다. */
  min-height: 320px;
  margin-top: clamp(8px, 1.4vh, 20px);
  border-radius: 12px;
  overflow: hidden;
  background: #f3f0e8;
}

.back-to-list {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid #e3dfd4;
  background: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 700;
  color: #545045;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(84, 80, 69, 0.15);
}

.back-to-list:hover {
  background: #fff;
  border-color: #c9c1ad;
}

.toggle-icon {
  font-size: 12px;
}

/* 번호로 매물 위치 바로 찾아가기 */
/* 시니어 사용자를 고려해 터치/클릭 목표를 크게 잡는다 */
.rank-jump {
  position: absolute;
  top: 76px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-radius: 34px;
  border: 1px solid #e3dfd4;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(84, 80, 69, 0.15);
}

.rank-jump-title {
  font-size: 12px;
  font-weight: 700;
  color: #8a8477;
  margin: 0 0 2px;
}

.rank-jump-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid #e3dfd4;
  background: #fff;
  font-size: 19px;
  font-weight: 800;
  color: #5f5949;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.rank-jump-btn:hover {
  background: #faf8f3;
  border-color: #c9c1ad;
}

.rank-jump-btn.active {
  background: #545045;
  border-color: #545045;
  color: #fff;
}

/* 핀을 누르면 뜨는 미니 카드 */
.pin-card {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 10;
  width: calc(100% - 32px);
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #ebe7dd;
  background: #fff;
  box-shadow: 0 8px 24px rgba(84, 80, 69, 0.22);
  animation: pin-card-in 0.18s ease;
}

@keyframes pin-card-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.pin-score {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 1px;
  background: #eaf5ea;
  color: #2f7d32;
}

.pin-score.tier-mid {
  background: #fdf3dd;
  color: #c98a00;
}

.pin-score strong {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.pin-score span {
  font-size: 10px;
  font-weight: 700;
}

.pin-info {
  flex: 1;
  min-width: 0;
}

.pin-label {
  font-size: 11px;
  color: #9a9384;
  margin: 0;
}

.pin-name {
  font-size: 14px;
  font-weight: 700;
  color: #2b2822;
  margin: 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pin-meta {
  font-size: 12px;
  color: #948d7e;
  margin: 0;
}

.pin-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pin-open {
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  background: #f5c518;
  font-size: 12px;
  font-weight: 700;
  color: #4a3a00;
  white-space: nowrap;
  cursor: pointer;
}

.pin-open:hover {
  background: #e8b800;
}

.pin-fav {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #e3dfd4;
  background: #fff;
  font-size: 15px;
  color: #ccc;
  cursor: pointer;
}

.pin-fav.active {
  background: #fff4d6;
  border-color: #f0c14b;
  color: #f0a500;
}

/* 지도 뷰의 번호 버튼 줄. 지도가 낮아지면 5번 버튼이 잘리므로 같이 줄인다.
   위 .rank-jump 규칙과 명시도가 같아 파일 뒤쪽에 있어야 덮어쓴다. */
@media (max-height: 860px) {
  .rank-jump {
    top: 60px;
    gap: 6px;
    padding: 10px;
  }

  .rank-jump-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
