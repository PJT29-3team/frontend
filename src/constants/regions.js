/**
 * 설문 6단계 지역 선택과 2단계 조정대상지역 안내에 쓰는 상수.
 *
 * 시군구별 매물 수는 피그마 시안 수치를 그대로 옮긴 목 데이터다.
 * 실제 집계 API가 생기면 이 상수 대신 응답값을 쓰면 된다.
 */

export const SIDO_LIST = ["서울", "경기도"];

/** 매물 많은 순으로 정렬해 둔다(피그마: "매물 많은 순으로 보여드려요"). */
export const SIGUNGU_BY_SIDO = {
  서울: [
    { name: "강남구", count: 310 },
    { name: "송파구", count: 265 },
    { name: "노원구", count: 240 },
    { name: "강서구", count: 228 },
    { name: "은평구", count: 205 },
    { name: "성북구", count: 198 },
    { name: "구로구", count: 186 },
    { name: "관악구", count: 175 },
    { name: "양천구", count: 168 },
    { name: "동대문구", count: 160 },
    { name: "영등포구", count: 152 },
    { name: "마포구", count: 148 },
    { name: "서초구", count: 143 },
    { name: "중랑구", count: 138 },
    { name: "동작구", count: 130 },
    { name: "광진구", count: 122 },
    { name: "강동구", count: 118 },
    { name: "도봉구", count: 110 },
    { name: "성동구", count: 102 },
    { name: "강북구", count: 95 },
    { name: "서대문구", count: 88 },
    { name: "금천구", count: 74 },
    { name: "용산구", count: 66 },
    { name: "종로구", count: 52 },
    { name: "중구", count: 45 },
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

/** 2단계 각주로 노출하는 조정대상지역 안내 */
export const REGULATED_AREAS = [
  "(서울) 25개구 전역",
  "(경기) 과천시, 광명시, 성남시 분당구·수정구·중원구, 수원시 영통구·장안구·팔달구, 안양시 동안구, 용인시 수지구, 의왕시, 하남시",
];

/** 2단계 면책 문구 */
export const TAX_DISCLAIMER = [
  "1세대 1주택자를 대상으로 한 계산결과이며, 절세 정보는 참고용으로 제공되며, 법률·세무 자문을 대체하지 않습니다.",
  "세법은 수시로 개정될 수 있으므로 실제 거래 전에는 최신 법령과 전문가 상담을 병행하시길 권장합니다.",
  "본 서비스 이용으로 발생하는 직접 또는 간접적인 손해에 대해서는 책임지지 않습니다.",
];

/** 보유기간·거주기간 셀렉트 옵션 (0~30년) */
export const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i,
  label: `${i}년`,
}));
