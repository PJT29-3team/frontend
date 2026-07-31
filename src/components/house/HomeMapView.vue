<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['homes'])
const mapContainer = ref(null)

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

onMounted(async () => {
  await loadKakaoMapScript()

  const map = new window.kakao.maps.Map(mapContainer.value, {
    center: new window.kakao.maps.LatLng(37.4138, 127.1268),
    level: 6,
  })

  const dummyPositions = [
    { lat: 37.4138, lng: 127.1268 },
    { lat: 37.4200, lng: 127.1350 },
    { lat: 37.4050, lng: 127.1150 },
    { lat: 37.3980, lng: 127.1300 },
    { lat: 37.4080, lng: 127.1400 },
  ]

  props.homes.forEach((home, index) => {
    const position = dummyPositions[index]
    if (!position) return

    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng)

    const content = document.createElement('div')
    content.className = 'map-pin' + (home.isFavorite ? ' active' : '')
    content.innerText = home.rank

    new window.kakao.maps.CustomOverlay({
      position: markerPosition,
      content,
      map,
    })
  })
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