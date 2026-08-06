import propertyRecommendationApi from "@/api/propertyRecommendation";

export async function fetchPropertyDetail(homeId) {
  return propertyRecommendationApi.detail(homeId);
}
