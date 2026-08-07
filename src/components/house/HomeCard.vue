<template>
  <article
    class="home-card"
    :class="[`tier-${tier.key}`, { 'is-selected': isSelected }]"
    role="button"
    tabindex="0"
    :aria-pressed="isSelected"
    :aria-label="`${home.name} 비용 계산 대상으로 선택`"
    @click="emit('select', home.id)"
    @keydown.enter="emit('select', home.id)"
    @keydown.space.prevent="emit('select', home.id)"
  >
    <!-- 핵심 정보: 나와 맞는 정도 -->
    <div class="score-badge">
      <strong class="score-value">{{ clampedScore }}</strong>
      <span class="score-unit">점</span>
    </div>

    <div class="info">
      <div class="headline">
        <span class="rank-note">추천 {{ home.rank }}위</span>
      </div>

      <p class="name">
        <span class="name-text">{{ home.name }}</span>
        <span class="pyeong">· {{ formatPyeong(home.size) }}</span>
      </p>

      <!-- 지역을 여러 곳 고른 사용자가 어느 동네인지 알 수 있어야 한다 -->
      <p class="neighborhood">{{ neighborhood }}</p>

      <!-- 금액은 판단 재료일 뿐, 더 이상 카드의 주인공이 아니다 -->
      <p class="price">{{ home.price }}</p>

      <!-- 산출 근거: 목록 API가 세부 점수를 주면 그때 자동으로 보인다 -->
      <ul v-if="scoreBasis.length" class="basis">
        <li v-for="item in scoreBasis" :key="item.label" class="basis-item">
          {{ item.label }} <b>{{ item.value }}</b>
        </li>
      </ul>

      <!-- 카드 전체 클릭은 '선택'이라 상세 이동은 따로 뗀다.
           아이콘만으로는 눌러야 할 자리인지 안 읽혀서 말로 적는다 -->
      <button
        class="detail-link"
        type="button"
        :aria-label="`${home.name} 점수 자세히 보기`"
        @click.stop="goToDetail"
      >
        점수 자세히 보기
        <svg class="detail-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="actions">
      <span v-if="isSelected" class="selected-mark">비용 계산 중</span>
      <button
        class="favorite-btn"
        :class="{ active: store.isFavorite(home.id) }"
        type="button"
        @click.stop="onToggleFavorite"
      >
        <span class="heart-icon">{{ store.isFavorite(home.id) ? '♥' : '♡' }}</span>
        {{ store.isFavorite(home.id) ? '담았어요' : '관심 목록' }}
      </button>
      <button class="listing-btn" type="button" @click.stop="openListing">
        매물 보러가기 →
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { favoriteStore } from '@/stores/favoriteStore';
import { useRouter } from 'vue-router';
import { formatPyeong } from '@/utils/area';
import { openListing as openListingInNewTab } from '@/utils/listingUrl';

const props = defineProps(['home', 'isSelected']);
const emit = defineEmits(['select']);
const store = favoriteStore();

const router = useRouter();

const clampedScore = computed(() => {
  const value = Number(props.home.score);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
});

// 점수대를 색으로만 구분한다. 경계는 70점.
const tier = computed(() =>
  clampedScore.value >= 70 ? { key: 'high' } : { key: 'mid' }
);

/** 화면에는 번지까지 뺀 동네 이름만 보여준다. */
const neighborhood = computed(() => {
  const parts = (props.home.jibunAddress || '').split(' ');
  return parts.slice(0, 3).join(' ');
});

/** 네이버페이 부동산에서 이 매물 위치를 연다. 지도 미니 카드와 같은 규칙을 쓴다. */
function openListing() {
  openListingInNewTab(props.home);
}

// 안전/편의/자산 점수는 아직 목록 API에 없다. 내려오기 시작하면 그때만 노출한다.
const scoreBasis = computed(() =>
  [
    { label: '안전', value: props.home.safetyScore },
    { label: '편의', value: props.home.convenienceScore },
    { label: '자산', value: props.home.assetScore },
  ].filter((item) => typeof item.value === 'number')
);

function goToDetail() {
  router.push(`/recommend/${props.home.id}`);
}

async function onToggleFavorite() {
  try {
    await store.toggleFavorite(props.home.id);
  } catch (error) {
    alert(error?.response?.data?.message || error?.message || '관심 매물을 처리하지 못했습니다.');
  }
}
</script>

<style scoped>
.home-card {
  --tier: #2f7d32;
  --tier-soft: #eaf5ea;

  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid #ebe7dd;
  background: #fff;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

/* 70점 미만은 amber 계열 */
.home-card.tier-mid {
  --tier: #c98a00;
  --tier-soft: #fdf3dd;
}

.home-card:hover {
  border-color: #d8d0be;
  box-shadow: 0 6px 18px rgba(84, 80, 69, 0.1);
}

.home-card:focus-visible {
  outline: 2px solid #545045;
  outline-offset: 2px;
}

/* 선택된 카드는 비용 패널이 지금 무엇을 계산 중인지 알려주는 표식이다 */
.home-card.is-selected {
  border: 1.5px solid #f0c14b;
  box-shadow: 0 4px 14px rgba(240, 193, 75, 0.22);
}

/* 점수 배지: 진행률이 아니라 '값'이라 채워지는 형태를 쓰지 않는다 */
.score-badge {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 16px;
  background: var(--tier-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.score-value {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: var(--tier);
  letter-spacing: -1px;
}

.score-unit {
  font-size: 11px;
  font-weight: 700;
  color: var(--tier);
  opacity: 0.75;
}

.info {
  flex: 1;
  min-width: 0;
}

.headline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.rank-note {
  font-size: 11px;
  color: #9a9384;
}

.name {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 15px;
  font-weight: 700;
  color: #2b2822;
  margin: 8px 0 2px;
  min-width: 0;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pyeong {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #948d7e;
}

.neighborhood {
  font-size: 12.5px;
  color: #948d7e;
  margin: 0 0 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #5f5949;
  margin: 0;
}

/* 산출 근거는 어디까지나 부연 설명이다 */
.basis {
  list-style: none;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 8px 0 0;
  padding: 0;
}

.basis-item {
  font-size: 11px;
  color: #9a9384;
  background: #f6f4ee;
  border-radius: 6px;
  padding: 2px 7px;
}

.basis-item b {
  color: #5f5949;
  font-weight: 700;
}

/* base.css 의 .text-link 와 같은 톤. 카드 선택과 섞이지 않게 stopPropagation 한다 */
.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin: 10px 0 0;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: #4d8bbd;
  cursor: pointer;
}

.detail-link:hover {
  text-decoration: underline;
}

.detail-link:focus-visible {
  outline: 2px solid #4d8bbd;
  outline-offset: 3px;
  border-radius: 4px;
}

.detail-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.selected-mark {
  font-size: 11px;
  font-weight: 700;
  color: #7a5c00;
  background: #fff4d6;
  border-radius: 999px;
  padding: 3px 10px;
}

.favorite-btn {
  width: 122px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  border: 1px solid #e3dfd4;
  background: white;
  color: #5f5949;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.favorite-btn:hover {
  border-color: #c9c1ad;
  background: #faf8f3;
}

.heart-icon {
  font-size: 14px;
  color: #ccc;
}

.favorite-btn.active {
  background: #fff4d6;
  border-color: #f0c14b;
  color: #7a5c00;
}

.favorite-btn.active .heart-icon {
  color: #f0a500;
}

/* 실제 매물을 보러 나가는 버튼. 관심 담기와 같은 폭으로 맞춘다 */
.listing-btn {
  width: 122px;
  padding: 8px 0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid #c9c1ad;
  background: white;
  color: #545045;
  cursor: pointer;
  transition: background 0.15s;
}

.listing-btn:hover {
  background: #f6f4ee;
}
</style>