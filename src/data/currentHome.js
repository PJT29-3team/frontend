// 임시 미리보기 데이터입니다. 현재주택 설문·조회 API가 연결되면
// GET /api/homes/current 및 /api/homes/current/analysis 응답으로 교체합니다.
export const currentHomePreview = {
  name: '중랑구 소형 아파트',
  address: '서울 중랑구 면목로 45',
  size: '18평',
  price: '2억 9,000만원',
  remainingAmount: '약 1억 7,200만원',
  expectedNetAmount: '2억 9,000만원',
  latitude: 37.5886,
  longitude: 127.0871,
  completion: '2002.07 준공',
  buildingAge: '24년차',
  householdCount: '총 91세대',
  exclusiveArea: '59.57㎡',
  supplyArea: '77㎡',
  rooms: '3개',
  bathrooms: '1개',
  transactions: [
    { date: '2025.05', size: '18평', floor: '13층', price: '2억 9,000만' },
    { date: '2025.04', size: '18평', floor: '3층', price: '2억 8,600만' },
    { date: '2025.03', size: '18평', floor: '7층', price: '3억 100만' },
  ],
}
