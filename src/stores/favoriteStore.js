import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const favoriteStore = defineStore('favorite', () => {
    const ids = reactive([]);

    const isFavorite = (id) => ids.includes(id);
    const count = computed(() => ids.length);
    const toggleFavorite = (id) => {
        if (isFavorite(id)) {
            const index = ids.indexOf(id);
            ids.splice(index, 1);
        } else {
            if (ids.length >= 3) {
                alert('최대 3개까지 담을 수 있어요.');
                return;
            }
            ids.push(id);
        }
    }

    // 조건을 바꿔 새 추천을 받으면 이전 추천 결과 기준으로 담아둔 관심목록은 의미가 없어진다.
    const clear = () => {
        ids.splice(0, ids.length);
    }

    return { ids, count, isFavorite, toggleFavorite, clear };
});