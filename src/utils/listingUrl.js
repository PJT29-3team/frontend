/**
 * 네이버페이 부동산에서 매물 위치를 여는 주소를 만든다.
 *
 * 좌표로 지도를 직접 연다. 이름으로 검색하면 "삼익3차"처럼 같은 이름이
 * 전국에 여럿이라 다른 지역이 섞인다. 줌 19 — 17이면 주변 마커가 10개 넘게
 * 깔려 어느 것이 이 매물인지 알아보기 어렵다.
 *
 * 좌표가 없는 매물만 이름 검색으로 넘긴다.
 */
export function buildListingUrl(home) {
  const { latitude, longitude } = home || {};
  if (latitude && longitude) {
    return `https://new.land.naver.com/complexes?ms=${latitude},${longitude},19`;
  }
  const parts = (home?.jibunAddress || '').split(' ');
  const fallback = `${parts.slice(1, 3).join(' ')} ${home?.name || ''}`.trim();
  return `https://new.land.naver.com/search?sk=${encodeURIComponent(fallback)}`;
}

/** 새 탭으로 연다. 추천 목록을 잃지 않게 하려는 것이고, opener 는 끊는다. */
export function openListing(home) {
  window.open(buildListingUrl(home), '_blank', 'noopener,noreferrer');
}