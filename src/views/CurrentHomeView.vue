<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentHomePreview } from '../data/currentHome'

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY
const router = useRouter()
const mapElement = ref(null)
const mapError = ref('')
let map = null
let propertyOverlay = null

const currentHome = currentHomePreview

const mapMessage = computed(() => !KAKAO_MAP_KEY ? '카카오맵 JavaScript 키를 설정하면 이 위치의 지도가 표시됩니다.' : mapError.value)

function loadKakaoMap() {
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('kakao-map-sdk')
    if (existingScript) { existingScript.addEventListener('load', () => resolve(window.kakao), { once: true }); existingScript.addEventListener('error', () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.')), { once: true }); return }
    const script = document.createElement('script')
    script.id = 'kakao-map-sdk'; script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`
    script.onload = () => resolve(window.kakao); script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
}

function createMapCard() {
  const card = document.createElement('article')
  card.className = 'current-home-map-card'
  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'current-home-map-card__close'
  closeButton.setAttribute('aria-label', '카드 닫기')
  closeButton.textContent = '×'
  closeButton.addEventListener('click', () => propertyOverlay?.setMap(null))
  const title = document.createElement('strong')
  title.textContent = currentHome.name
  const address = document.createElement('p')
  address.textContent = `${currentHome.address} · ${currentHome.size}`
  const amount = document.createElement('span')
  amount.className = 'current-home-map-card__price'
  amount.textContent = currentHome.price
  const remaining = document.createElement('small')
  remaining.textContent = `이사 후 최종 잔액 ${currentHome.remainingAmount}`
  const detailButton = document.createElement('button')
  detailButton.type = 'button'
  detailButton.className = 'current-home-map-card__detail'
  detailButton.textContent = '상세보기   ›'
  detailButton.addEventListener('click', () => router.push('/homes/current/detail'))
  card.append(closeButton, title, address, amount, remaining, detailButton)
  return card
}

async function renderMap() {
  if (!KAKAO_MAP_KEY || !mapElement.value) return
  try {
    const kakao = await loadKakaoMap()
    kakao.maps.load(() => {
      const fallbackLocation = new kakao.maps.LatLng(currentHome.latitude, currentHome.longitude)
      map = new kakao.maps.Map(mapElement.value, { center: fallbackLocation, level: 3 })

      const showCurrentHome = (location) => {
        map.setCenter(location)
        const marker = new kakao.maps.Marker({ position: location, title: `현재 거주지: ${currentHome.name}` })
        marker.setMap(map)
        propertyOverlay = new kakao.maps.CustomOverlay({ content: createMapCard(), position: location, yAnchor: 1.18, zIndex: 3 })
        kakao.maps.event.addListener(marker, 'click', () => propertyOverlay.setMap(map))
      }

      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.addressSearch(currentHome.address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          showCurrentHome(new kakao.maps.LatLng(result[0].y, result[0].x))
          return
        }

        showCurrentHome(fallbackLocation)
      })
    })
  } catch { mapError.value = '지도를 불러오지 못했습니다. 카카오맵 도메인과 JavaScript 키를 확인해 주세요.' }
}
function editHome() { router.push('/homes/current/edit') }
onMounted(renderMap)
onBeforeUnmount(() => { map = null })
</script>

<template>
  <div class="home-content">
    <aside class="home-sidebar"><h1>우리집</h1><article class="home-summary-card"><h2>{{ currentHome.name }}</h2><p class="address">{{ currentHome.address }} · {{ currentHome.size }}</p><span class="status-chip">적정</span><div class="summary-divider"></div><div class="net-amount"><span>지금 매도 시 예상 실수령액</span><strong>{{ currentHome.expectedNetAmount }}</strong></div><button class="edit-button" type="button" @click="editHome">우리집 수정</button></article></aside>
    <section class="map-section" aria-label="현재 주택 위치"><div ref="mapElement" class="kakao-map"></div><div v-if="mapMessage" class="map-fallback" role="status"><strong>현재 주택 위치</strong><span>{{ mapMessage }}</span></div></section>
  </div>
</template>

<style scoped>
.home-content { display: grid; min-height: calc(100vh - 182px); grid-template-columns: 27.5% 1fr; }.home-sidebar { padding: 0 22px; border-right: 1px solid #e8e2d4; box-shadow: 8px 8px 25px rgba(60, 51, 29, .04); background: #fff; z-index: 2; }.home-sidebar h1 { margin: 0 -22px 25px; padding: 0 32px; height: 78px; display: flex; align-items: center; border-bottom: 1px solid #eceae5; color: #16294c; font-size: 28px; }.home-summary-card { padding: 25px 26px; border: 1.5px solid #eadfc8; border-radius: 25px; box-shadow: 0 14px 22px rgba(47,45,41,.08); }.home-summary-card h2 { margin: 0; color: #1a2d51; font-size: 23px; }.address { margin: 8px 0 14px; color: #536787; text-align: center; font-size: 16px; }.status-chip { display: inline-block; padding: 7px 15px; border-radius: 999px; background: #dff5e6; color: #3d9961; font-weight: 800; }.summary-divider,.panel-divider { border-top: 1px dashed #eadfc8; margin: 18px 0; }.net-amount { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; color: #536787; font-size: 16px; }.net-amount strong { color: #1a2d51; font-size: clamp(21px,1.8vw,29px); white-space: nowrap; }.edit-button { width: 100%; margin-top: 18px; padding: 13px; border: 1.5px solid #e5d8be; border-radius: 17px; background: #fff; color: #536787; font-size: 19px; }.map-section { position: relative; isolation: isolate; overflow: hidden; min-height: 650px; background: #f0ecd9; }.kakao-map { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; }.map-fallback { position: absolute; z-index: 1; inset: 0; display: grid; place-content: center; gap: 10px; padding: 40px; background: linear-gradient(90deg,transparent 49.8%,#e1d9bd 50%,transparent 50.2%),linear-gradient(#f2efdf 49.8%,#e1d9bd 50%,#f2efdf 50.2%); color: #6c6559; text-align: center; }.map-fallback strong { color: #545045; font-size: 23px; }.property-panel { position: absolute; z-index: 2; top: 50%; left: 50%; width: min(480px,calc(100% - 42px)); transform: translate(-50%,-45%); padding: 31px 28px 22px; border-radius: 22px; background: #fff; box-shadow: 0 12px 30px rgba(68,61,46,.14); }.property-panel::after { content: ''; position: absolute; bottom: -20px; left: 50%; width: 0; height: 0; transform: translateX(-50%); border: 20px solid transparent; border-top-color: #fff; border-bottom: 0; }.property-panel h2 { margin: 0; font-size: 29px; }.property-panel p { margin: 8px 0 0; color: #737373; font-size: 17px; }.close-button { position: absolute; right: 24px; top: 27px; background: transparent; color: #bbb; font-size: 36px; font-weight: 300; line-height: 1; }dl { margin: 0; }dl div { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin: 13px 0; }dt { color: #8d8d8d; font-size: 17px; }dd { margin: 0; color: #555; font-size: 19px; font-weight: 800; }dd.price { color: #222; font-size: 30px; }.detail-button { width: 100%; margin-top: 68px; padding: 16px 20px; border-radius: 13px; background: #ffcc00; color: #1f1f1f; font-size: 21px; font-weight: 900; }.detail-button span { float: right; font-size: 34px; line-height: 21px; }@media (max-width: 720px) { .home-content { display: block; }.home-sidebar { padding-bottom: 18px; border-right: 0; }.home-sidebar h1 { height: 60px; margin-bottom: 15px; font-size: 24px; }.home-summary-card { padding: 20px; }.map-section { min-height: 560px; }.property-panel { top: 43%; padding: 25px 22px 20px; }.property-panel h2 { font-size: 24px; }.detail-button { margin-top: 40px; } }
</style>

<style>
.current-home-map-card { position: relative; width: 216px; padding: 13px 15px 12px; border-radius: 13px; background: #fff; box-shadow: 0 6px 20px rgba(47, 45, 41, .22); color: #2f2d29; transform: translateY(-8px); }.current-home-map-card::after { content: ''; position: absolute; bottom: -10px; left: 50%; border: 10px solid transparent; border-top-color: #fff; border-bottom: 0; transform: translateX(-50%); }.current-home-map-card strong { display: block; padding-right: 18px; font-size: 15px; }.current-home-map-card p { overflow: hidden; margin: 5px 0 10px; color: #77736b; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.current-home-map-card__price { display: block; padding-top: 8px; border-top: 1px dashed #e5e3de; color: #1f1f1f; font-size: 18px; font-weight: 900; text-align: right; }.current-home-map-card small { display: block; margin-top: 5px; color: #77736b; font-size: 10px; text-align: right; }.current-home-map-card__detail { width: 100%; margin-top: 12px; padding: 9px 12px; border-radius: 7px; background: #ffcc00; color: #2f2d29; font-size: 12px; font-weight: 900; text-align: center; }.current-home-map-card__close { position: absolute; top: 8px; right: 9px; padding: 0; background: transparent; color: #aaa; font-size: 20px; line-height: 1; }
@media (min-width: 721px) { .home-sidebar { margin-top: -112px; } }
</style>
