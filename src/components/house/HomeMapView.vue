<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { favoriteStore } from '../../stores/favoriteStore'

const props = defineProps(['homes', 'selectedId']);
const emit = defineEmits(['select']);
const mapContainer = ref(null);
const store = favoriteStore();

let map = null
let overlays = []  // 생성된 마커들을 기억해뒀다가 지울 때 씀

const dummyPositions = [
  { lat: 37.4138, lng: 127.1268 },
  { lat: 37.4200, lng: 127.1350 },
  { lat: 37.4050, lng: 127.1150 },
  { lat: 37.3980, lng: 127.1300 },
  { lat: 37.4080, lng: 127.1400 },
]

function loadKakaoMapScript() {
  return new Promise((resolve) => {
    if (window.kakao && window.kakao.maps) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_APP_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    document.head.appendChild(script)
  })
}

// home.id → 카카오 LatLng. 선택된 매물로 지도를 이동시킬 때 다시 계산하지 않고 찾아 쓴다.
const positionByHomeId = new Map()

function renderMarkers() {
  if (!map) return;

  // 기존 마커 전부 지우기
  overlays.forEach((overlay) => overlay.setMap(null))
  overlays = []
  positionByHomeId.clear()

  const bounds = new window.kakao.maps.LatLngBounds()
  let hasValidPosition = false
  // 같은(또는 아주 가까운) 좌표에 마커가 겹치면 구별이 안 되니, 중복된 순서만큼 살짝 벌려서 찍는다.
  const seenKeyCounts = new Map()

  props.homes.forEach((home, index) => {
    const rawPosition = (home.latitude != null && home.longitude != null)
      ? { lat: Number(home.latitude), lng: Number(home.longitude) }
      : dummyPositions[index]
    if (!rawPosition) return

    const key = `${rawPosition.lat.toFixed(4)},${rawPosition.lng.toFixed(4)}`
    const duplicateIndex = seenKeyCounts.get(key) ?? 0
    seenKeyCounts.set(key, duplicateIndex + 1)

    // 두 번째부터 원형으로 살짝(약 80~160m) 벌려서 찍는다.
    let position = rawPosition
    if (duplicateIndex > 0) {
      const angle = (duplicateIndex * 137.5) * (Math.PI / 180) // 황금각으로 고르게 분산
      const radius = 0.0008 * Math.ceil(duplicateIndex / 1)
      position = {
        lat: rawPosition.lat + radius * Math.cos(angle),
        lng: rawPosition.lng + radius * Math.sin(angle),
      }
    }

    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng)
    positionByHomeId.set(home.id, markerPosition)
    bounds.extend(markerPosition)
    hasValidPosition = true

    const content = document.createElement('div')
    content.className = 'map-pin' + (store.isFavorite(home.id) ? ' active' : '')
    content.innerText = home.rank
    content.addEventListener('click', () => emit('select', home.id))

    const overlay = new window.kakao.maps.CustomOverlay({
      position: markerPosition,
      content,
      map,
    })

    overlays.push(overlay)
  })

  // 매물들이 지도 기본 범위(분당) 밖에 있어도 전부 보이도록 범위를 맞춘다.
  if (hasValidPosition) {
    map.setBounds(bounds)
  }
}

// 매물 카드를 선택하면 그 위치로 지도를 이동시킨다.
function panToSelected() {
  if (!map || props.selectedId == null) return
  const position = positionByHomeId.get(props.selectedId)
  if (position) {
    map.panTo(position)
  }
}

onMounted(async () => {
  await loadKakaoMapScript()
  console.log('mapContainer : ', mapContainer.value);


  if (!mapContainer.value) return;

  const firstHome = props.homes[0]
  map = new window.kakao.maps.Map(mapContainer.value, {
    center: new window.kakao.maps.LatLng(firstHome?.latitude || 37.5486808, firstHome?.longitude || 127.0088805),
    level: 6,
  })

  renderMarkers()
})

watch(() => store.count, () => {
  renderMarkers()
})

// 추천 목록은 마운트 이후 비동기로 채워지므로, 도착하면 다시 그려준다.
watch(() => props.homes, () => {
  renderMarkers()
}, { deep: true })

watch(() => props.selectedId, () => {
  panToSelected()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
.map-pin {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8a8577;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.map-pin.active {
  background: #f5c518;
  color: #4a3a00;
}
</style>