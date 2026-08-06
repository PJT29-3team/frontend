<template>
  <div class="property-detail">
    <AppHeader/>

    <div class="content" v-if="loading">
        <p>불러오는 중...</p>
    </div>

    <div class="content" v-else-if="error">
        <p>{{ error }}</p>
        <button class="back-btn" @click="router.push('/recommend')">
        ← 추천주택 단계로 돌아가기
      </button>
    </div>

    <div class="content" v-else-if="property">
      <button class="back-btn" @click="router.push('/recommend')">
        ← 추천주택 단계로 돌아가기
      </button>

      <div class="header-row">
        <div class="address-info">
          <h2>{{ property.name }}</h2>
          <p class="sub-address">{{ property.address }}</p>
          <div class="tags">
            <span class="tag">{{ property.buildYear }}.{{ property.buildMonth }}준공 · {{ property.buildingAge }}년차</span>
            <span class="tag">{{ property.floors }}층 · {{ property.buildingCount }}개동</span>
            <span class="tag">총 {{ property.householdCount }}세대</span>
            <span class="tag">{{ property.pyeong }}평</span>
          </div>
        </div>
        <button class="eval-link" type="button" @click="router.push('/evaluation-method')">평가 방법 상세보기 →</button>
      </div>

      <div class="ai-summary">
        <!-- AI 요약 들어가는 공간 -->
         <p>✦ AI 요약</p>
         {{ property.aiSummary }}
      </div>

      <div class="evaluation-sections">
        <!-- 3개 카드 컴포넌트 자리 -->
         <EvaluationSection
         title="주거안전"
         :grade="property.evaluation.safety.grade"
         :items="property.evaluation.safety.items"
         :details="property.evaluation.safety.details"
         />
         <EvaluationSection
         title="생활 편의"
         :grade="property.evaluation.convenience.grade"
         :items="property.evaluation.convenience.items"
         :details="property.evaluation.convenience.details"
         />
         <EvaluationSection
         title="자산 안정"
         :grade="property.evaluation.asset.grade"
         :items="property.evaluation.asset.items"
         :details="property.evaluation.asset.details"
         />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue';
import { useRoute, useRouter } from 'vue-router';
import propertyRecommendationApi from '@/api/propertyRecommendation';
import { onMounted, watch, ref } from 'vue';
import EvaluationSection from '@/components/house/EvaluationSection.vue';

const router = useRouter();
const route = useRoute();

const property = ref(null);
const loading = ref(true);
const error = ref(null);

async function loadProperty(homeId) {
    loading.value = true;
    error.value = null;
    try {
        property.value = await propertyRecommendationApi.detail(homeId);
    } catch (e) {
        error.value = e.response?.data?.message || e.message || '매물 정보를 불러오는데 실패했습니다.';
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadProperty(route.params.homeId);
});

// 같은 화면에서 homeId만 바뀌는 경우 (예 : 비교 화면에서 상세로 다시 이동) 대비
watch(() => route.params.homeId, (newId) => {
    if(newId) loadProperty(newId);
});
</script>

<style scoped>
.property-detail {
  min-height: 100vh;
  background: #fafafa;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 40px;
}

.back-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 20px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  margin-bottom: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.address-info h2 {
  margin: 0 0 4px;
  font-size: 26px;
  font-weight: 700;
}

.sub-address {
  color: #666;
  font-size: 15px;
  margin: 0 0 12px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.eval-link {
  background: none;
  border: none;
  color: #545045;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.ai-summary {
  background: #fff4d6;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  font-size: 16px;
}

.evaluation-sections {
  display: flex;
  gap: 16px;
}
</style>
