export const dummyPropertyDetails = {
  1: {
    id: 1,
    name: '야탑동 탑마을(선경)',
    address: '경기도 성남시 분당구 (야탑로 166-4)',
    pyeong: 24,
    buildYear: 2002,
    buildMonth: 7,
    buildingAge: 24,
    floors: 18,
    buildingCount: 1,
    householdCount: 91,
    aiSummary: '병원과 대중교통 접근성이 우수하고, 주변 CCTV 설치가 많아 치안 면에서 안정적인 매물입니다. 다만 준공 24년차로 노후도는 다소 높은 편입니다.',
    evaluation: {
      safety: {
        grade: '우수',
        items: [
          { label: '보행안전', stars: 5, note: '경사, 엘리베이터' },
          { label: '의료안전', stars: 4, note: '동네의원, 종합병원, 약국' },
          { label: '치안안전', stars: 4, note: 'CCTV, 경찰서, 지구대, 소방서' },
          { label: '재난안전', stars: 4, note: '산사태위험지역, 침수여부' },
        ],
        details: [
          '병원까지 걸어서 5분이면 갈 수 있어요',
          'CCTV 15개가 있어 사각지대가 적어요.',
          '침수나 산사태 이력이 없어요',
          '길이 평탄해서 걷기 편해요',
        ],
      },
      convenience: {
        grade: '매우우수',
        items: [
          { label: '장보기 산책', stars: 5, note: '시장, 마트, 공원' },
          { label: '대중교통', stars: 5, note: '버스정류장, 지하철역' },
          { label: '동네 시설', stars: 5, note: '행정복지센터, 은행, 요양시설' },
        ],
        details: [
          '버스정류장까지 걸어서 2분이에요',
          '대형마트가 걸어서 4분 거리에 있어요',
          '산책하기 좋은공원이 걸어서 10분거리에 있어요',
          '요양시설이 걸어서 20분거리에 있어요',
        ],
      },
      asset: {
        grade: '보통',
        items: [
          { label: '관리비', stars: 3, note: '' },
          { label: '집값수준', stars: 3, note: '' },
          { label: '팔기 쉬운정도', stars: 3, note: '' },
        ],
        details: [
          '관리비가 지역 평균보다 18% 저렴해요',
          '최근 실거래가와 호가 차이가 2%로 작아요',
          '최근 1년간 거래가 꾸준히 이어졌어요',
        ],
      },
    },
  },

  2: {
    id: 2,
    name: '정자동 한솔마을(주공5단지)',
    address: '경기도 성남시 분당구 (정자로 45-1)',
    pyeong: 21,
    buildYear: 1995,
    buildMonth: 11,
    buildingAge: 31,
    floors: 15,
    buildingCount: 3,
    householdCount: 540,
    aiSummary: '대단지로 관리비 부담이 상대적으로 낮고, 판교 접근성이 좋아 자산 안정성이 높게 평가됩니다. 준공년도가 오래돼 안전 항목은 보통 수준입니다.',
    evaluation: {
      safety: {
        grade: '보통',
        items: [
          { label: '보행안전', stars: 3, note: '경사, 엘리베이터' },
          { label: '의료안전', stars: 3, note: '동네의원, 종합병원, 약국' },
          { label: '치안안전', stars: 3, note: 'CCTV, 경찰서, 지구대, 소방서' },
          { label: '재난안전', stars: 3, note: '산사태위험지역, 침수여부' },
        ],
        details: [
          '동네의원까지 걸어서 12분 거리예요',
          'CCTV 설치가 지역 평균 수준이에요',
          '침수나 산사태 이력이 없어요',
        ],
      },
      convenience: {
        grade: '우수',
        items: [
          { label: '장보기 산책', stars: 4, note: '시장, 마트, 공원' },
          { label: '대중교통', stars: 5, note: '버스정류장, 지하철역' },
          { label: '동네 시설', stars: 4, note: '행정복지센터, 은행, 요양시설' },
        ],
        details: [
          '지하철역까지 걸어서 8분이에요',
          '전통시장이 가까이 있어요',
        ],
      },
      asset: {
        grade: '매우우수',
        items: [
          { label: '관리비', stars: 5, note: '' },
          { label: '집값수준', stars: 5, note: '' },
          { label: '팔기 쉬운정도', stars: 5, note: '' },
        ],
        details: [
          '대단지라 관리비 부담이 적어요',
          '최근 6개월간 거래가 활발했어요',
        ],
      },
    },
  },

  3: {
    id: 3,
    name: '서현동 풍림아이원플러스',
    address: '경기도 성남시 분당구 (서현로 88)',
    pyeong: 23,
    buildYear: 2004,
    buildMonth: 3,
    buildingAge: 22,
    floors: 20,
    buildingCount: 2,
    householdCount: 210,
    aiSummary: '서현역 인접으로 생활 편의성이 매우 높으며, 병원·약국 접근성도 우수합니다. 자산 안정성은 거래량 기준 보통 수준입니다.',
    evaluation: {
      safety: {
        grade: '우수',
        items: [
          { label: '보행안전', stars: 4, note: '경사, 엘리베이터' },
          { label: '의료안전', stars: 5, note: '동네의원, 종합병원, 약국' },
          { label: '치안안전', stars: 4, note: 'CCTV, 경찰서, 지구대, 소방서' },
          { label: '재난안전', stars: 4, note: '산사태위험지역, 침수여부' },
        ],
        details: [
          '종합병원까지 차량 10분 이내예요',
          '치안 지표가 양호해요',
        ],
      },
      convenience: {
        grade: '매우우수',
        items: [
          { label: '장보기 산책', stars: 5, note: '시장, 마트, 공원' },
          { label: '대중교통', stars: 5, note: '버스정류장, 지하철역' },
          { label: '동네 시설', stars: 4, note: '행정복지센터, 은행, 요양시설' },
        ],
        details: [
          '서현역까지 걸어서 5분이에요',
          '백화점과 마트가 밀집해 있어요',
        ],
      },
      asset: {
        grade: '보통',
        items: [
          { label: '관리비', stars: 3, note: '' },
          { label: '집값수준', stars: 3, note: '' },
          { label: '팔기 쉬운정도', stars: 3, note: '' },
        ],
        details: [
          '최근 3개월간 거래가 2건 있었어요',
          '가격 변동폭이 안정적이에요',
        ],
      },
    },
  },

  4: {
    id: 4,
    name: '정자동 인빌리전자A',
    address: '경기도 성남시 분당구 (불정로 55)',
    pyeong: 25,
    buildYear: 2010,
    buildMonth: 5,
    buildingAge: 16,
    floors: 25,
    buildingCount: 1,
    householdCount: 320,
    aiSummary: '준공년도가 비교적 최근이라 시설 노후도가 낮고, 판교테크노밸리 접근성이 좋아 자산 안정성이 높게 평가됩니다.',
    evaluation: {
      safety: {
        grade: '매우우수',
        items: [
          { label: '보행안전', stars: 5, note: '경사, 엘리베이터' },
          { label: '의료안전', stars: 5, note: '동네의원, 종합병원, 약국' },
          { label: '치안안전', stars: 5, note: 'CCTV, 경찰서, 지구대, 소방서' },
          { label: '재난안전', stars: 4, note: '산사태위험지역, 침수여부' },
        ],
        details: [
          '최신 CCTV 시스템이 설치돼 있어요',
          '경사 없는 평지 입지예요',
        ],
      },
      convenience: {
        grade: '우수',
        items: [
          { label: '장보기 산책', stars: 4, note: '시장, 마트, 공원' },
          { label: '대중교통', stars: 4, note: '버스정류장, 지하철역' },
          { label: '동네 시설', stars: 4, note: '행정복지센터, 은행, 요양시설' },
        ],
        details: [
          '버스정류장까지 걸어서 2분이에요',
          '대형마트가 걸어서 15분 거리에 있어요',
        ],
      },
      asset: {
        grade: '우수',
        items: [
          { label: '관리비', stars: 4, note: '' },
          { label: '집값수준', stars: 4, note: '' },
          { label: '팔기 쉬운정도', stars: 4, note: '' },
        ],
        details: [
          '판교 접근성이 우수해요',
          '최근 거래가가 상승세예요',
        ],
      },
    },
  },

  5: {
    id: 5,
    name: '수내동 파크뷰(오피스텔)',
    address: '경기도 성남시 분당구 (수내로 12)',
    pyeong: 22,
    buildYear: 2008,
    buildMonth: 9,
    buildingAge: 18,
    floors: 22,
    buildingCount: 1,
    householdCount: 150,
    aiSummary: '오피스텔 특성상 관리비가 다소 높은 편이며, 역세권 입지로 생활 편의성은 우수하지만 자산 환금성은 아파트 대비 낮게 평가됩니다.',
    evaluation: {
      safety: {
        grade: '보통',
        items: [
          { label: '보행안전', stars: 3, note: '경사, 엘리베이터' },
          { label: '의료안전', stars: 3, note: '동네의원, 종합병원, 약국' },
          { label: '치안안전', stars: 3, note: 'CCTV, 경찰서, 지구대, 소방서' },
          { label: '재난안전', stars: 3, note: '산사태위험지역, 침수여부' },
        ],
        details: [
          '의료기관까지 걸어서 10분 거리예요',
          '치안 지표가 보통 수준이에요',
        ],
      },
      convenience: {
        grade: '우수',
        items: [
          { label: '장보기 산책', stars: 4, note: '시장, 마트, 공원' },
          { label: '대중교통', stars: 5, note: '버스정류장, 지하철역' },
          { label: '동네 시설', stars: 4, note: '행정복지센터, 은행, 요양시설' },
        ],
        details: [
          '수내역까지 걸어서 6분이에요',
          '편의시설이 밀집해 있어요',
        ],
      },
      asset: {
        grade: '미흡',
        items: [
          { label: '관리비', stars: 2, note: '' },
          { label: '집값수준', stars: 2, note: '' },
          { label: '팔기 쉬운정도', stars: 2, note: '' },
        ],
        details: [
          '오피스텔 특성상 환금성이 다소 낮아요',
          '관리비가 지역 평균보다 높은 편이에요',
        ],
      },
    },
  },
};