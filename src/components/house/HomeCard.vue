<template>
  <!-- 카드 자체는 선택만 한다. 외부 링크는 버튼으로 따로 둬야
       지도에서 매물을 고르다가 실수로 새 탭이 열리지 않는다. -->
  <div
    class="home-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select', home.id)"
  >
    <div class="rank">{{ home.rank }}</div>

    <div class="info">
      <p class="name">{{ home.address }}</p>
      <p class="neighborhood">{{ neighborhood }}</p>
      <p class="price">{{ home.price }}</p>

      <!-- 점수는 바 오른쪽 원래 자리. 카드에서 가장 크게 보이는 값이다. -->
      <div class="score-row">
        <div class="score-bar">
          <div class="score-bar-fill" :class="matchClass" :style="{ width: home.score + '%' }"></div>
        </div>
        <span class="score" :class="matchClass">
          <strong>{{ home.score }}</strong>점
        </span>
      </div>

      <!-- 점수 근거는 부수 정보라 작은 글씨로 -->
      <div class="score-foot">
        <button class="reason-link" @click.stop="openReason">
          이 점수가 나온 이유 보기
        </button>
      </div>
    </div>

    <div class="actions">
      <button
        class="favorite-btn"
        :class="{ active: store.isFavorite(home.id) }"
        @click.stop="onToggleFavorite"
      >
        <span class="heart-icon">{{ store.isFavorite(home.id) ? '♥' : '♡' }}</span>
        {{ store.isFavorite(home.id) ? '담았어요' : '관심 목록에 담기' }}
      </button>
      <button class="listing-btn" @click.stop="openListing">
        매물 보러가기 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { favoriteStore } from '@/stores/favoriteStore';
import { useRouter } from 'vue-router';

const props = defineProps(['home', 'isSelected']);
const emit = defineEmits(['select']);
const store = favoriteStore();
const router = useRouter();

/** 점수 구간별 색. 숫자만으로는 90점과 70점의 차이가 잘 안 보인다. */
const matchClass = computed(() => {
  const score = Number(props.home.score) || 0;
  if (score >= 90) return 'is-best';
  if (score >= 70) return 'is-good';
  if (score >= 50) return 'is-fair';
  return 'is-low';
});

/** 화면에는 번지까지 뺀 동네 이름만 보여준다. */
const neighborhood = computed(() => {
  const parts = (props.home.jibunAddress || '').split(' ');
  return parts.slice(0, 3).join(' ');
});

/**
 * 네이버페이 부동산에서 이 매물 위치를 연다. 새 탭이라 추천 목록을 잃지 않는다.
 *
 * 좌표로 지도를 직접 연다. 이름으로 검색하면 "삼익3차"처럼 같은 이름이
 * 전국에 여럿이라 다른 지역이 섞인다.
 *
 * 줌 19. 17이면 주변 단지 마커가 10개 넘게 깔려 어느 것이 이 매물인지
 * 알아보기 어렵다. 카드에 동네를 함께 보여주는 것도 같은 이유다.
 */
function openListing() {
  const { latitude, longitude } = props.home;
  const url = latitude && longitude
    ? `https://new.land.naver.com/complexes?ms=${latitude},${longitude},19`
    : `https://new.land.naver.com/search?sk=${encodeURIComponent(searchKeyword.value)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  emit('select', props.home.id);
}

/** 좌표가 없을 때 쓰는 대비책. "부천시 심곡본동 부천극동" */
const searchKeyword = computed(() => {
  const parts = (props.home.jibunAddress || '').split(' ');
  const region = parts.slice(1, 3).join(' ');
  return `${region} ${props.home.name || ''}`.trim();
});

/** 점수 산출 근거는 우리 서비스 안의 상세 화면에서 본다. */
function openReason() {
  emit('select', props.home.id);
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
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 12px;
  cursor: pointer;
}

.home-card.is-selected {
  background: #fff4d6;
  border-color: #545045;
  border-width: 2px;
  box-shadow: 0 0 0 1px #545045;
}

.rank {
  font-weight: 700;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eee;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.neighborhood {
  font-size: 12.5px;
  color: #868e96;
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 금액은 참고 정보라 점수보다 작게 둔다. */
.price {
  font-size: 15px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 10px;
}

/* 바 + 점수를 한 줄로, 점수는 오른쪽 끝 */
.score-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 4px;
}

.score-bar-fill.is-best { background: #2f9e44; }
.score-bar-fill.is-good { background: #74b816; }
.score-bar-fill.is-fair { background: #f0a500; }
.score-bar-fill.is-low { background: #adb5bd; }

/* 카드에서 가장 크게 보이는 값 */
.score {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.score strong {
  font-size: 26px;
  font-weight: 800;
  margin-right: 1px;
}

.score.is-best { color: #2f9e44; }
.score.is-good { color: #5c940d; }
.score.is-fair { color: #c17d00; }
.score.is-low { color: #868e96; }

.score-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.reason-link {
  padding: 0;
  border: none;
  background: none;
  font-size: 12.5px;
  color: #868e96;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
}

.reason-link:hover {
  color: #495057;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.favorite-btn,
.listing-btn {
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.heart-icon {
  font-size: 14px;
  color: #ccc;
}

.favorite-btn.active {
  background: #fff4d6;
  border-color: #f0c14b;
}

.favorite-btn.active .heart-icon {
  color: #f0a500;
}

.listing-btn {
  border-color: #c8c2b0;
  color: #545045;
  font-weight: 600;
}

.listing-btn:hover {
  background: #f6f5f2;
}
</style>
