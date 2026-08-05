import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { addFavoriteProperty, removeFavoriteProperty } from "@/api/favoriteApi";

export const favoriteStore = defineStore('favorite', () => {
    const ids = reactive([]);

    const isFavorite = (id) => ids.includes(id);
    const count = computed(() => ids.length);
    const toggleFavorite = async (id) => {
        if (isFavorite(id)) {
            try {
                await removeFavoriteProperty(id);
                const index = ids.indexOf(id);
                ids.splice(index, 1);
            } catch (error) {
                console.error("관심 매물 해제 실패:", error);
                alert(error.response?.data?.message || '관심 매물 해제에 실패했습니다.');
            }
        } else {
            if (ids.length >= 3) {
                alert('최대 3개까지 담을 수 있어요.');
                return;
            }
            try {
                await addFavoriteProperty(id);
                ids.push(id);
            } catch (error) {
                console.error("관심 매물 추가 실패:", error);
                alert(error.response?.data?.message || '관심 매물 추가에 실패했습니다.');
            }
        }
    }

    // 조건을 바꿔 새 추천을 받으면 이전 추천 결과 기준으로 담아둔 관심목록은 의미가 없어진다.
    const clear = () => {
        ids.splice(0, ids.length);
    }

    return { ids, count, isFavorite, toggleFavorite, clear };
});