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

    return { ids, count, isFavorite, toggleFavorite };
});