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
        <span class="name-text">{{ home.name }}</span>
        <span class="pyeong">· {{ formatPyeong(home.size) }}</span>
      </div>

      <!-- 동네(지역을 여러 곳 고른 사용자용)와 금액을 한 줄에 둔다.
           세로가 짧은 화면에서 카드 5개를 스크롤 없이 담기 위해서다. -->
      <p class="meta">
        <span class="neighborhood">{{ neighborhood }}</span>
        <span class="dot">·</span>
        <span class="price">{{ home.price }}</span>
      </p>

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

/**
 * 네이버페이 부동산에서 이 매물 위치를 연다. 새 탭이라 추천 목록을 잃지 않는다.
 *
 * 좌표로 지도를 직접 연다. 이름으로 검색하면 "삼익3차"처럼 같은 이름이
 * 전국에 여럿이라 다른 지역이 섞인다. 줌 19 — 17이면 주변 마커가 10개 넘게
 * 깔려 어느 것이 이 매물인지 알아보기 어렵다.
 */
function openListing() {
  const { latitude, longitude } = props.home;
  const parts = (props.home.jibunAddress || '').split(' ');
  const fallback = `${parts.slice(1, 3).join(' ')} ${props.home.name || ''}`.trim();
  const url = latitude && longitude
    ? `https://new.land.naver.com/complexes?ms=${latitude},${longitude},19`
    : `https://new.land.naver.com/search?sk=${encodeURIComponent(fallback)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
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
  gap: 14px;
  /* 세로가 짧은 화면에서 카드 5개가 스크롤 없이 들어가도록 여백을 줄인다. */
  padding: clamp(6px, 0.9vh, 18px) 18px;
  border-radius: 14px;
  position: relative;
  border: 1px solid #ebe7dd;
  background: #fff;
  margin-bottom: clamp(3px, 0.5vh, 12px);
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
  width: clamp(44px, 5.6vh, 72px);
  height: clamp(44px, 5.6vh, 72px);
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
  font-size: clamp(20px, 2.6vh, 30px);
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
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.rank-note {
  font-size: 11px;
  color: #9a9384;
}

.name-text {
  line-height: 1.3;
  font-size: 15px;
  font-weight: 700;
  color: #2b2822;
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

.meta {
  display: flex;
  align-items: baseline;
  gap: 5px;
  line-height: 1.3;
  margin: 2px 0 0;
  min-width: 0;
}

.neighborhood {
  font-size: 12.5px;
  color: #948d7e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dot {
  color: #c8c2b0;
  flex-shrink: 0;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #5f5949;
  flex-shrink: 0;
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
  margin: clamp(1px, 0.3vh, 10px) 0 0;
  padding: 0;
  border: none;
  background: transparent;
  line-height: 1.3;
  font-size: 12.5px;
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
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.selected-mark {
  position: absolute;
  top: 6px;
  right: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #7a5c00;
  background: #fff4d6;
  border-radius: 999px;
  padding: 3px 10px;
}

.favorite-btn {
  width: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: clamp(6px, 1vh, 8px) 0;
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
  width: 112px;
  padding: clamp(6px, 1vh, 8px) 0;
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

/* 13인치 노트북(뷰포트 730~790px). 카드 한 장에서 6~8px 씩만 줄여도
   5장이면 40px 가까이 남아 목록이 스크롤 없이 들어간다. */
@media (max-height: 860px) {
  .home-card {
    padding: 5px 18px;
    margin-bottom: 2px;
    gap: 16px;
  }

  /* 점수 배지와 버튼은 이전 크기를 지킨다. 카드 높이는 세 열 중 가장 높은
     것으로 정해지므로, 정보 열을 두 줄로 눌러 놓으면 배지를 키워도
     카드가 더 높아지지 않는다. */
  .score-badge {
    width: 62px;
    height: 62px;
    border-radius: 16px;
  }

  .score-value {
    font-size: 26px;
  }

  .name-text {
    font-size: 14.5px;
  }

  .meta {
    margin-top: 1px;
  }

  .price {
    font-size: 14.5px;
  }

  .detail-link {
    margin-top: 1px;
    font-size: 12px;
  }

  /* 이전 배치대로 버튼을 세로로 쌓는다.
     버튼이 세로로 서면 오른쪽 위 절대 배치한 '비용 계산 중' 표식과 겹치므로
     표식도 이전처럼 버튼 위 흐름 안으로 되돌린다. */
  .actions {
    flex-direction: column;
    gap: 4px;
  }

  .selected-mark {
    position: static;
    padding: 2px 10px;
  }

  .favorite-btn,
  .listing-btn {
    width: 122px;
    padding: 5px 0;
  }
}

/* 창을 더 낮춰 쓰는 경우(주소창 + 북마크바 + 독). 마지막 남은 여백까지 턴다. */
@media (max-height: 780px) {
  .home-card {
    padding: 4px 18px;
    margin-bottom: 1px;
  }

  .detail-link {
    margin-top: 0;
  }

  .score-badge {
    width: 56px;
    height: 56px;
  }

  .score-value {
    font-size: 24px;
  }

  /* 버튼 높이는 글자 크기가 아니라 줄 간격이 대부분이다.
     line-height 만 조여도 카드 한 장에서 8px 가까이 나온다. */
  .favorite-btn,
  .listing-btn {
    padding: 4px 0;
    line-height: 1.1;
  }

  .heart-icon {
    font-size: 13px;
  }

  .actions {
    gap: 3px;
  }
}

/* 여기까지 오면 글자 크기는 그대로 두고 줄 간격만 좁힌다.
   시니어 사용자에게 글자를 더 줄이는 것보다 낫다. */
@media (max-height: 730px) {
  .headline,
  .meta,
  .detail-link {
    line-height: 1.15;
  }

  .favorite-btn,
  .listing-btn {
    padding: 3px 0;
  }

  .home-card {
    margin-bottom: 1px;
  }

  .detail-link {
    font-size: 11.5px;
  }
}
</style>