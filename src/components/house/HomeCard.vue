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
        <span class="match-label">나와 맞는 정도</span>
        <span class="tier-chip">{{ tier.label }}</span>
        <!-- 순위는 등급 칩과 나란히 두면 알약이 둘이라 빼곡하다. 곁텍스트로 내린다 -->
        <span class="rank-note">추천 {{ home.rank }}위</span>
      </div>

      <p class="name">
        <span class="name-text">{{ home.name }}</span>
      </p>

      <!-- 금액은 판단 재료일 뿐, 더 이상 카드의 주인공이 아니다 -->
      <p class="meta">
        <span class="address">{{ home.address }}</span>
        <span class="dot">·</span>
        <span class="pyeong">{{ formatPyeong(home.size) }}</span>
        <span class="dot">·</span>
        <span class="price">{{ home.price }}</span>
      </p>

      <!-- 척도는 배지에서 떼어내 얇은 막대로만 -->
      <div class="scale">
        <div class="scale-fill" :style="{ width: clampedScore + '%' }"></div>
      </div>

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
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { favoriteStore } from '@/stores/favoriteStore';
import { useRouter } from 'vue-router';
import { formatPyeong } from '@/utils/area';

const props = defineProps(['home', 'isSelected']);
const emit = defineEmits(['select']);
const store = favoriteStore();

const router = useRouter();

const clampedScore = computed(() => {
  const value = Number(props.home.score);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
});

// 숫자만으로는 잘 안 읽혀서 말로도 한 번 더 알려준다. 경계는 70점.
const tier = computed(() =>
  clampedScore.value >= 70 ? { key: 'high', label: '잘 맞아요' } : { key: 'mid', label: '무난해요' }
);

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

.match-label {
  font-size: 13px;
  font-weight: 700;
  color: #4a463d;
}

.tier-chip {
  font-size: 11px;
  font-weight: 700;
  color: var(--tier);
  background: var(--tier-soft);
  border-radius: 999px;
  padding: 2px 8px;
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

.meta {
  font-size: 13px;
  color: #948d7e;
  margin: 0;
  display: flex;
  gap: 6px;
  min-width: 0;
}

.address {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dot,
.pyeong,
.price {
  flex-shrink: 0;
}

.price {
  color: #5f5949;
  font-weight: 600;
}

/* 척도 표시. 배지 옆이 아니라 정보 영역에 눕혀서 무게를 뺀다 */
.scale {
  height: 5px;
  background: #f0ede5;
  border-radius: 999px;
  overflow: hidden;
  margin: 10px 0 0;
  max-width: 260px;
}

.scale-fill {
  height: 100%;
  background: var(--tier);
  border-radius: 999px;
  transition: width 0.4s ease;
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
</style>