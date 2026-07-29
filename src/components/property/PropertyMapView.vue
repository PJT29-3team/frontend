<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  currentHome: { type: Object, default: null },
  properties: { type: Array, default: () => [] },
})

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY
const mapElement = ref(null)
const mapError = ref('')
let map = null
let markers = []

function loadKakaoMap() {
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('kakao-map-sdk')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.kakao), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = 'kakao-map-sdk'
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`
    script.onload = () => resolve(window.kakao)
    script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
}

function createNumberedOverlay(kakao, position, number) {
  const wrapper = document.createElement('div')
  wrapper.className = 'property-map-pin'
  wrapper.textContent = String(number)
  return new kakao.maps.CustomOverlay({ content: wrapper, position, yAnchor: 1 })
}

function createHomeOverlay(kakao, position) {
  const wrapper = document.createElement('div')
  wrapper.className = 'property-map-pin property-map-pin--home'
  wrapper.textContent = '우리집'
  return new kakao.maps.CustomOverlay({ content: wrapper, position, yAnchor: 1 })
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null))
  markers = []
}

function renderMarkers(kakao) {
  clearMarkers()
  const bounds = new kakao.maps.LatLngBounds()

  if (props.currentHome?.latitude && props.currentHome?.longitude) {
    const position = new kakao.maps.LatLng(props.currentHome.latitude, props.currentHome.longitude)
    const overlay = createHomeOverlay(kakao, position)
    overlay.setMap(map)
    markers.push(overlay)
    bounds.extend(position)
  }

  props.properties.forEach((property, index) => {
    if (!property.latitude || !property.longitude) return
    const position = new kakao.maps.LatLng(property.latitude, property.longitude)
    const overlay = createNumberedOverlay(kakao, position, index + 1)
    overlay.setMap(map)
    markers.push(overlay)
    bounds.extend(position)
  })

  if (!bounds.isEmpty()) map.setBounds(bounds)
}

async function renderMap() {
  if (!KAKAO_MAP_KEY || !mapElement.value) return
  try {
    const kakao = await loadKakaoMap()
    kakao.maps.load(() => {
      map = new kakao.maps.Map(mapElement.value, {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 6,
      })
      renderMarkers(kakao)
    })
  } catch {
    mapError.value = '지도를 불러오지 못했습니다. 카카오맵 도메인과 JavaScript 키를 확인해 주세요.'
  }
}

watch(
  () => props.properties,
  () => {
    if (map && window.kakao?.maps) renderMarkers(window.kakao)
  },
)

onMounted(renderMap)
onBeforeUnmount(() => {
  clearMarkers()
  map = null
})
</script>

<template>
  <section class="property-map" aria-label="추천 매물 위치">
    <div ref="mapElement" class="property-map__canvas"></div>

    <div v-if="!KAKAO_MAP_KEY || mapError" class="property-map__fallback" role="status">
      <strong>추천 매물 위치</strong>
      <span>{{ mapError || '카카오맵 JavaScript 키를 설정하면 이 지역의 지도가 표시됩니다.' }}</span>
      <ol class="property-map__fallback-list">
        <li v-for="(property, index) in properties" :key="property.propertyId ?? property.externalPropertyKey">
          <span class="property-map__fallback-number">{{ index + 1 }}</span>
          {{ property.name }}
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.property-map {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 480px;
  border-radius: 16px;
  background: var(--color-surface);
}

.property-map__canvas {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
}

.property-map__fallback {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 12px;
  padding: 32px;
  color: var(--color-text-muted);
  text-align: center;
}

.property-map__fallback strong {
  color: var(--color-dark);
  font-size: 20px;
}

.property-map__fallback-list {
  display: grid;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  text-align: left;
}

.property-map__fallback-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.property-map__fallback-number {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #1f1f1f;
  font-weight: 800;
  font-size: 14px;
}
</style>

<style>
.property-map-pin {
  display: grid;
  place-items: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #1f1f1f;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 6px 14px rgba(47, 45, 41, 0.22);
  transform: translateY(-8px);
}

.property-map-pin--home {
  background: var(--color-dark);
  color: #fff;
}
</style>
