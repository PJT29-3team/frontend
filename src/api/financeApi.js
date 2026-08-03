import client from './client';

// ponytail: 백엔드 미구현 동안 목 데이터 반환, 백엔드 완성 시 아래 주석 해제
const MOCK = [
  { productName: 'KB Star CMA', institutionName: 'KB증권', amount: 30_000_000, termMonths: 0, annualRate: '3.0', maxAnnualRate: '3.0', productRiskGrade: '매우 낮은 위험' },
  { productName: '신한 정기적금', institutionName: '신한은행', amount: 15_000_000, termMonths: 12, annualRate: '4.2', maxAnnualRate: '5.0', productRiskGrade: '낮은 위험' },
  { productName: 'KODEX 국고채 10년', institutionName: '삼성자산운용', amount: 20_000_000, termMonths: 36, annualRate: '3.8', maxAnnualRate: null, productRiskGrade: '보통 위험' },
];

export function fetchFavoriteProducts() {
  // return client.get('/api/finance/favorites').then((res) => res.data);
  return Promise.resolve(MOCK);
}
