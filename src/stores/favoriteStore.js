import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { addFavoriteProperty, getFavoriteProperties, removeFavoriteProperty } from "@/api/favoriteApi";

export const favoriteStore = defineStore('favorite', () => {
    const ids = reactive([]);
    const loaded = ref(false);
    const loading = ref(false);
    const errorMessage = ref('');

    const isFavorite = (id) => ids.includes(id);
    const count = computed(() => ids.length);

    function replaceIds(nextIds) {
        ids.splice(0, ids.length, ...nextIds);
    }

    async function loadFavorites(force = false) {
        if (loading.value || (loaded.value && !force)) return;
        loading.value = true;
        errorMessage.value = '';
        try {
            const homes = await getFavoriteProperties();
            replaceIds(homes.map((home) => home.houseId));
            loaded.value = true;
        } catch (error) {
            errorMessage.value = error.response?.data?.message || '관심 매물을 불러오지 못했습니다.';
        } finally {
            loading.value = false;
        }
    }

    async function toggleFavorite(id) {
        if (!id || loading.value) return;
        if (!loaded.value) {
            await loadFavorites();
        }
        if (isFavorite(id)) {
            await removeFavoriteProperty(id);
            replaceIds(ids.filter((value) => value !== id));
            return;
        }
        if (ids.length >= 3) {
            throw new Error('관심 매물은 최대 3곳까지 담을 수 있습니다.');
        }
        await addFavoriteProperty(id);
        ids.push(id);
    }

    function clear() {
        replaceIds([]);
        loaded.value = false;
        errorMessage.value = '';
    }

    return { ids, count, isFavorite, toggleFavorite, loadFavorites, clear, loaded, loading, errorMessage };
});
