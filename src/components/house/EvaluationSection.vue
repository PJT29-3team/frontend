<template>
  <div class="evaluation-section">
    <h3 class="title">{{ title }}</h3>

    <div class="grade-badge" :class="gradeClass">
      <span class="dot"></span>
      {{ grade }}
    </div>

    <div class="items">
      <div class="item" v-for="item in items" :key="item.label">
        <div class="item-label">{{ item.label }}</div>
        <div class="item-row">
          <span class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= item.stars }">★</span>
          </span>
          <span class="item-note">{{ item.note }}</span>
        </div>
      </div>
    </div>

    <button class="toggle-btn" @click="expanded = !expanded">
      세부 정보 보기
      <span class="chevron" :class="{ open: expanded }">⌄</span>
    </button>

    <ul class="detail-list" v-if="expanded">
      <li v-for="(line, i) in details" :key="i">{{ line }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  grade: { type: String, required: true },
  items: { type: Array, required: true }, // [{ label, stars, note }]
  details: { type: Array, default: () => [] },
});

const expanded = ref(false);

// 등급은 미흡 · 보통 · 우수 세 단계다 (백엔드 toGrade, 경계 40 / 70).
const gradeClass = computed(() => {
  if (props.grade === '우수') return 'grade-good';
  if (props.grade === '미흡') return 'grade-bad';
  return 'grade-normal';
});
</script>

<style scoped>
.evaluation-section {
  flex: 1;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
}

.title {
  margin: 0 0 12px;
  font-size: 19px;
  font-weight: 700;
}

.grade-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.grade-good {
  background: #e6f0e0;
  color: #4a7a2a;
}
.grade-good .dot { background: #4a7a2a; }

.grade-bad {
  background: #fbeadd;
  color: #c17a2e;
}
.grade-bad .dot { background: #c17a2e; }

.grade-normal {
  background: #f3ecd9;
  color: #a3822e;
}
.grade-normal .dot { background: #a3822e; }

.items {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 12px;
}

.item-label {
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stars {
  color: #ddd;
  font-size: 18px;
  letter-spacing: 2px;
}

.stars .star.filled {
  color: #f0a500;
}

.item-note {
  font-size: 14px;
  color: #777;
}

.toggle-btn {
  background: none;
  border: none;
  border-top: 1px solid #f0f0f0;
  width: 100%;
  text-align: left;
  padding-top: 12px;
  margin-top: 4px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chevron {
  transition: transform 0.2s;
  display: inline-block;
}

.chevron.open {
  transform: rotate(180deg);
}

.detail-list {
  list-style: none;
  padding: 12px 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-list li {
  font-size: 15px;
  color: #555;
}
</style>