import { dummyPropertyDetails } from "@/mock/dummyPropertyDetails";

/*
    매물 세부정보 조회
    TODO : 백엔드 API (GET /api/homes/{homeId}/detail) 완성되면 axios 호출로 교체
*/

export async function fetchPropertyDetail(homeId) {
    // 실제 네트워크처럼 약간의 딜레이 (로딩 상태 테스트용)
    await new Promise((resolve) => setTimeout(resolve, 200));

    const detail = dummyPropertyDetails[Number(homeId)];

    if(!detail) {
        throw new Error(`매물 정보를 찾을 수 없습니다. (homeId : ${homeId})`);
    }

    return detail;
}