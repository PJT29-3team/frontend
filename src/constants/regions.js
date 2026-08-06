export const SIDO_LIST = ["서울", "경기도"];

export const SIGUNGU_BY_SIDO = {
  서울: [
    { name: "강남구", count: 342 },
    { name: "송파구", count: 298 },
    { name: "강서구", count: 255 },
    { name: "서초구", count: 240 },
    { name: "마포구", count: 210 },
    { name: "영등포구", count: 195 },
    { name: "성동구", count: 180 },
    { name: "용산구", count: 175 },
    { name: "광진구", count: 160 },
    { name: "동작구", count: 150 },
    { name: "강동구", count: 145 },
    { name: "양천구", count: 140 },
    { name: "종로구", count: 130 },
    { name: "중구", count: 125 },
    { name: "서대문구", count: 120 },
    { name: "은평구", count: 115 },
    { name: "노원구", count: 110 },
    { name: "성북구", count: 105 },
    { name: "동대문구", count: 100 },
    { name: "관악구", count: 95 },
    { name: "구로구", count: 90 },
    { name: "금천구", count: 85 },
    { name: "도봉구", count: 80 },
    { name: "강북구", count: 75 },
    { name: "중랑구", count: 70 },
  ],
  경기도: [
    { name: "수원시", count: 220 },
    { name: "성남시", count: 160 },
    { name: "용인시", count: 160 },
    { name: "고양시", count: 140 },
    { name: "화성시", count: 95 },
    { name: "안산시", count: 93 },
    { name: "부천시", count: 88 },
    { name: "안양시", count: 83 },
    { name: "남양주시", count: 78 },
    { name: "평택시", count: 70 },
    { name: "시흥시", count: 65 },
    { name: "김포시", count: 58 },
    { name: "파주시", count: 55 },
    { name: "의정부시", count: 52 },
    { name: "광주시", count: 48 },
    { name: "하남시", count: 45 },
    { name: "이천시", count: 40 },
    { name: "양주시", count: 38 },
    { name: "오산시", count: 35 },
    { name: "구리시", count: 33 },
    { name: "군포시", count: 30 },
    { name: "의왕시", count: 28 },
    { name: "광명시", count: 27 },
    { name: "안성시", count: 25 },
    { name: "포천시", count: 22 },
    { name: "여주시", count: 18 },
    { name: "동두천시", count: 15 },
    { name: "과천시", count: 12 },
    { name: "양평군", count: 10 },
    { name: "가평군", count: 8 },
    { name: "연천군", count: 5 },
  ],
};

export const REGULATED_AREAS = [
  "(서울) 25개구 전역",
  "(경기) 과천시, 광명시, 성남시 분당구·수정구·중원구, 수원시 영통구·장안구·팔달구, 안양시 동안구, 용인시 수지구, 의왕시, 하남시",
];

export const TAX_DISCLAIMER = [
  "1세대 1주택자를 대상으로 한 계산결과이며, 절세 정보는 참고용으로 제공되며, 법률·세무 자문을 대체하지 않습니다.",
  "세법은 수시로 개정될 수 있으므로 실제 거래 전에는 최신 법령과 전문가 상담을 병행하시길 권장합니다.",
  "본 서비스 이용으로 발생하는 직접 또는 간접적인 손해에 대해서는 책임지지 않습니다.",
];

export const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i,
  label: `${i}년`,
}));

/**
 * 희망 평수 구간.
 *
 * DB의 house.house_size 는 전용면적 ㎡라 비교는 ㎡로 하고, 화면에는 평으로 보여준다.
 * (1평 = 3.305785㎡) 경계는 국민주택 규격(60·85㎡)과 실제 매물 분포에 맞췄다.
 * max 는 미만(<) 비교라 구간이 겹치지 않는다.
 */
export const AREA_OPTIONS = [
  { code: "UNDER_60", label: "20평 이하", hint: "60㎡ 미만", min: null, max: 60 },
  { code: "60_85", label: "20~30평대", hint: "60~85㎡", min: 60, max: 85 },
  { code: "85_135", label: "30~40평대", hint: "85~135㎡", min: 85, max: 135 },
  { code: "OVER_135", label: "40평 이상", hint: "135㎡ 이상", min: 135, max: null },
  { code: "ANY", label: "상관없어요", hint: "평수를 가리지 않아요", min: null, max: null },
];

/** 구간 코드 → { min, max } (㎡). 모르는 코드나 ANY 는 둘 다 null이다. */
export function areaRangeOf(code) {
  const found = AREA_OPTIONS.find((option) => option.code === code);
  return found ? { min: found.min, max: found.max } : { min: null, max: null };
}

/** 저장된 ㎡ 범위 → 구간 코드. 설문을 다시 열었을 때 고른 값을 복원한다. */
export function areaCodeOf(minSqm, maxSqm) {
  if (minSqm == null && maxSqm == null) return null;
  const min = minSqm == null ? null : Number(minSqm);
  const max = maxSqm == null ? null : Number(maxSqm);
  const found = AREA_OPTIONS.find(
    (option) => option.min === min && option.max === max && option.code !== "ANY",
  );
  return found ? found.code : null;
}
