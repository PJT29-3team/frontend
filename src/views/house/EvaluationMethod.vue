<template>
  <div class="evaluation-method">
    <div class="content">
      <button class="back-btn" @click="router.back()">← 매물 세부정보로 돌아가기</button>
      <div class="header-row">
        <div>
          <h2>평가 방법 상세보기</h2>
          <p class="subtitle">어떤 기준으로, 왜 이만큼 반영했는지 알려드려요</p>
        </div>
      </div>
 
      <div class="intro-box">
        <span class="intro-icon">🏠</span>
        <p>
          지금 설정하신 비율은
          <strong
            >주거안전 {{ current.safety }}% · 생활편의
            {{ current.convenience }}% · 자산안정 {{ current.asset }}%</strong
          >
          예요. 주거안전은 어떤 경우에도 가장 먼저 지켜야 할 조건이라 항상
          상대적으로 높은 비중을 두고, 생활과 자산은 어르신의 상황에 맞춰 비중을
          나누어 가져요.
        </p>
      </div>
 
      <p class="section-label">현재 반영된 비중</p>
 
      <div
        v-for="(category, idx) in categories"
        :key="category.key"
        class="category-block"
        :data-key="category.key"
      >
        <div class="rank-label">
          <span class="rank-badge">{{ idx + 1 }}순위</span>
          {{ category.name }} (전체 비중 {{ category.weight }}%)
        </div>
 
        <div class="weight-bar-row">
          <div
            v-for="cat in categories"
            :key="cat.key"
            class="weight-chip"
            :class="{ active: cat.key === category.key }"
            :style="{ flex: cat.weight }"
          >
            {{ cat.name }}
            <span class="chip-percent">{{ cat.weight }}%</span>
          </div>
        </div>
 
        <!-- 사다리꼴 점선 연결선: 활성 박스의 좌우 경계 → 아래 막대 전체 너비로 벌어짐 -->
        <div class="connector">
          <svg
            class="connector-svg"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <line
              :x1="bounds(category.key).left"
              y1="0"
              x2="0"
              y2="20"
              class="connector-line"
            />
            <line
              :x1="bounds(category.key).right"
              y1="0"
              x2="100"
              y2="20"
              class="connector-line"
            />
          </svg>
        </div>
 
        <div class="sub-items-bar">
          <div
            v-for="(item, i) in category.items"
            :key="item.label"
            class="sub-item-segment"
          >
            <span>{{ i + 1 }}</span>
          </div>
        </div>
 
        <ul class="sub-items-list">
          <li v-for="(item, i) in category.items" :key="item.label">
            <span class="item-num">{{ i + 1 }}</span>
            <span class="item-label">{{ item.label }} — {{ item.detail }}</span>
            <span class="item-percent">{{ item.percent }}%</span>
          </li>
        </ul>
      </div>
 
      <div class="formula-box">
        계산식 : 시그마(항목별 가중치 × (선택한 세부사항(경사, 엘리베이터 등)
        개수)/최대 × 100 (점))
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
 
const router = useRouter();
 
// TODO: 실제 로그인 유저의 persona 값으로 교체 (설문 결과 store 등에서 가져오기)
const userPersona = 'safety_first';
 
// TODO: 나머지 3개 페르소나 이름/비율 확인 필요 (50/10/40, 50/40/10, 40/30/30 추정)
const personaWeights = {
  safety_first: { name: '안전중시형', safety: 60, convenience: 20, asset: 20 },
  convenience_first: { name: '편의중시형', safety: 50, convenience: 40, asset: 10 },
  asset_first: { name: '자산중시형', safety: 50, convenience: 10, asset: 40 },
  balanced: { name: '균형중시형', safety: 40, convenience: 30, asset: 30 },
};
 
const current = computed(() => personaWeights[userPersona]);
 
// 하위 항목 비율 — 관리비 항목 제외 반영 (asset은 2개 항목으로 재분배)
const categories = computed(() => [
  {
    key: 'safety',
    name: '주거안전',
    weight: current.value.safety,
    items: [
      { label: '넘어짐 위험', detail: '엘리베이터, 경사', percent: 30 },
      { label: '의료', detail: '동네의원, 종합병원, 약국', percent: 30 },
      { label: '재난·침수', detail: '침수, 산사태 위험', percent: 20 },
      { label: '치안', detail: 'CCTV, 경찰서·지구대, 소방서', percent: 20 },
    ],
  },
  {
    key: 'convenience',
    name: '생활 편의',
    weight: current.value.convenience,
    items: [
      { label: '장보기·상권', detail: '편의점, 대형마트, 시장', percent: 40 },
      { label: '버스·지하철', detail: '정류장, 지하철역 접근성', percent: 35 },
      {
        label: '동네 시설',
        detail: '복지관, 은행, 공원, 요양시설',
        percent: 25,
      },
    ],
  },
  {
    key: 'asset',
    name: '자산 안정',
    weight: current.value.asset,
    // TODO: 관리비 제외 후 정확한 재분배 비율 확인 필요, 일단 50/50 가정
    items: [
      {
        label: '집값 수준',
        detail: '단지 공시가, 동네 평형대 비교',
        percent: 50,
      },
      {
        label: '팔기 쉬운 정도',
        detail: '하락장 거래건수 ÷ 5년 연평균',
        percent: 50,
      },
    ],
  },
]);
 
// 카테고리의 좌우 경계(%)를 누적 비율로 계산
// 예: safety(60) → {left:0, right:60}, convenience(20) → {left:60, right:80}, asset(20) → {left:80, right:100}
function bounds(key) {
  let acc = 0;
  for (const c of categories.value) {
    if (c.key === key) {
      return { left: acc, right: acc + c.weight };
    }
    acc += c.weight;
  }
  return { left: 0, right: 100 };
}
</script>
 
<style scoped>
.evaluation-method {
  min-height: 100vh;
}
 
.content {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px;
}
 
.back-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  margin-bottom: 20px;
}
 
.header-row h2 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
}
 
.subtitle {
  color: #777;
  font-size: 15px;
  margin: 0 0 20px;
}
 
.intro-box {
  display: flex;
  gap: 12px;
  background: #fff4d6;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 28px;
  font-size: 15px;
  line-height: 1.6;
}
 
.intro-icon {
  font-size: 20px;
  flex-shrink: 0;
}
 
.intro-box strong {
  color: #a3822e;
}
 
.section-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}
 
/* 섹션 간 간격 */
.category-block {
  margin-bottom: 56px;
}
 
.category-block:last-of-type {
  margin-bottom: 32px;
}
 
.rank-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
}
 
.rank-badge {
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
 
/* 순위 배지: 카테고리별 색상 다르게 */
.category-block[data-key="safety"] .rank-badge { background: #d98a2e; }
.category-block[data-key="convenience"] .rank-badge { background: #5a7a3a; }
.category-block[data-key="asset"] .rank-badge { background: #2e3f6e; }
 
/* 비율(가중치) 박스: flex-grow로 실제 60/20/20 비율 반영 */
.weight-bar-row {
  display: flex;
  gap: 4px;
  margin-bottom: 0;
}
 
.weight-chip {
  text-align: center;
  padding: 14px 8px;
  border-radius: 8px;
  background: #eee;
  color: #999;
  font-size: 14px;
  min-width: 0;
}
 
.weight-chip.active {
  background: #d98a2e;
  color: white;
  font-weight: 700;
}
 
.category-block[data-key="convenience"] .weight-chip.active { background: #5a7a3a; }
.category-block[data-key="asset"] .weight-chip.active { background: #2e3f6e; }
 
.chip-percent {
  display: block;
  font-size: 13px;
  margin-top: 4px;
}
 
/* 사다리꼴 점선 연결선 */
.connector {
  height: 20px;
}
 
.connector-svg {
  width: 100%;
  height: 100%;
  display: block;
}
 
.connector-line {
  stroke-width: 2.5;
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}
 
.category-block[data-key="safety"] .connector-line { stroke: #d98a2e; }
.category-block[data-key="convenience"] .connector-line { stroke: #5a7a3a; }
.category-block[data-key="asset"] .connector-line { stroke: #2e3f6e; }
 
/* 하위 항목 세그먼트 바: 알약 모양, 숫자는 흰 동그라미 */
.sub-items-bar {
  display: flex;
  border-radius: 13px;
  overflow: hidden;
  margin-bottom: 20px;
  height: 56px;
}
 
.sub-item-segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.sub-item-segment span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  color: #333;
  font-size: 13px;
  font-weight: 700;
}


 
/* 주거안전: 연한 주황 → 진한 주황, 4단계 */
.category-block[data-key="safety"] .sub-item-segment:nth-child(1) { background: #ecb96a; }
.category-block[data-key="safety"] .sub-item-segment:nth-child(2) { background: #e2a24e; }
.category-block[data-key="safety"] .sub-item-segment:nth-child(3) { background: #d18d3a; }
.category-block[data-key="safety"] .sub-item-segment:nth-child(4) { background: #b8762b; }
 
/* 생활편의: 연한 초록 → 진한 초록, 3단계 */
.category-block[data-key="convenience"] .sub-item-segment:nth-child(1) { background: #b7c894; }
.category-block[data-key="convenience"] .sub-item-segment:nth-child(2) { background: #8fa86f; }
.category-block[data-key="convenience"] .sub-item-segment:nth-child(3) { background: #5a7a3a; }
 
/* 자산안정: 연한 남색 → 진한 남색, 2단계 */
.category-block[data-key="asset"] .sub-item-segment:nth-child(1) { background: #7e93bd; }
.category-block[data-key="asset"] .sub-item-segment:nth-child(2) { background: #2e3f6e; }
 
.sub-items-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
 
.sub-items-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
}
 
.item-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 주거안전: 1~4번 순서대로 sub-item-segment와 동일한 색 */
.category-block[data-key="safety"] .sub-items-list li:nth-child(1) .item-num { background: #ecb96a; }
.category-block[data-key="safety"] .sub-items-list li:nth-child(2) .item-num { background: #e2a24e; }
.category-block[data-key="safety"] .sub-items-list li:nth-child(3) .item-num { background: #d18d3a; }
.category-block[data-key="safety"] .sub-items-list li:nth-child(4) .item-num { background: #b8762b; }

/* 생활편의: 1~3번 */
.category-block[data-key="convenience"] .sub-items-list li:nth-child(1) .item-num { background: #b7c894; }
.category-block[data-key="convenience"] .sub-items-list li:nth-child(2) .item-num { background: #8fa86f; }
.category-block[data-key="convenience"] .sub-items-list li:nth-child(3) .item-num { background: #5a7a3a; }

/* 자산안정: 1~2번 */
.category-block[data-key="asset"] .sub-items-list li:nth-child(1) .item-num { background: #7e93bd; }
.category-block[data-key="asset"] .sub-items-list li:nth-child(2) .item-num { background: #2e3f6e; }
 
.item-label {
  flex: 1;
  color: #333;
}
 
.item-percent {
  color: #999;
  font-weight: 600;
}
 
.formula-box {
  margin-top: 24px;
  padding: 16px 20px;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 13px;
  color: #777;
  text-align: center;
}
</style>