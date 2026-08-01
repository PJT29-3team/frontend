<template>
  <div class="home-card" 
  :class="{ 'is-selected' : isSelected }"
  @click="emit('select', home.id)"
  >
    <div class="rank">{{ home.rank }}</div>

    <div class="info">
      <p class="price">{{ home.price }}</p>
      <p class="address">{{ home.address }}</p>

      <div class="score-row">
        <div class="fit-score-bar">
          <div class="fit-score-fill" :style="{ width: home.score + '%' }"></div>
        </div>
        <span class="fit-score">적합도 {{ home.score }}점</span>
      </div>
    </div>

    <div class="actions">
      <button class="detail-btn">
        <span class="icon-circle">?</span>
        세부정보 보기
      </button>
      <button 
      class="favorite-btn" 
      :class="{ active: store.isFavorite(home.id) }"
      @click.stop="store.toggleFavorite(home.id)"
      >
        <span class="heart-icon">{{ store.isFavorite(home.id) ? '♥' : '♡' }}</span>
        {{ store.isFavorite(home.id) ? '담았어요' : '관심 목록에 담기' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { favoriteStore } from '@/stores/favoriteStore';

const props = defineProps(['home', 'isSelected']);
const emit = defineEmits(['select']);
const store = favoriteStore();
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
  flex-shrink: 0;   /* 카드 내용 많아져도 찌그러지지 않게 */
}
.info {
  flex: 1;
}

.price {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
}

.address {
  font-size: 13px;
  color: #888;
  margin: 0 0 8px;
}

/* 1. 바 + 점수를 한 줄로, 점수는 오른쪽 끝 */
.score-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fit-score-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.fit-score-fill {
  height: 100%;
  background: #7ec850;
}

.fit-score {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* 2. 버튼 가로 배치 + 아이콘 */
.actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.detail-btn,
.favorite-btn {
  width: 130px;   /* min-width 대신 width로 고정 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;   /* 좌우 padding은 제거 (width가 이미 고정이니까) */
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  border: 1px solid #ddd;
  background: white;
}

.icon-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #999;
  font-size: 11px;
  color: #999;
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
</style>