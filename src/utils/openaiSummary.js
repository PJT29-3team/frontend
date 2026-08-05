/**
 * OpenAI API를 이용해 금융상품 추천 결과를 한국어로 요약한다.
 *
 * @param {object} params
 * @param {number}  params.investAmount  - 투자 금액 (원)
 * @param {number}  params.remainingCash - 남길 현금 (원)
 * @param {number}  params.monthlyNeed   - 매달 쓸 돈 (원)
 * @param {string}  params.riskLabel     - 위험도 라벨 (예: "매우 낮은 위험")
 * @param {Array}   params.periods       - 기간별 추천 상품 배열
 * @returns {Promise<string>} 마크다운 없는 순수 텍스트 요약
 */
export async function generateRecommendationSummary({
  investAmount,
  remainingCash,
  monthlyNeed,
  riskLabel,
  periods,
}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');

  // 상품 정보를 프롬프트용 텍스트로 변환
  const periodText = periods
    .map((period) => {
      const products = period.products
        .map(
          (p) =>
            `  - [${p.category}] ${p.institution} ${p.name}: 금리 ${p.rate != null ? Number(p.rate).toFixed(2) : '-'}%, 예치기간 ${p.termMonths}개월, 위험도 ${p.safetyLevel}`,
        )
        .join('\n');
      return `▶ ${period.label} (${period.hint})\n${products}`;
    })
    .join('\n\n');

  const formatWon = (n) => {
    if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억 원`;
    if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만 원`;
    return `${n.toLocaleString()}원`;
  };

  const systemPrompt = `당신은 고령층 자산 관리를 돕는 금융 어드바이저입니다.
사용자의 금융상품 추천 결과를 보고, 쉽고 따뜻한 한국어로 2~3문단 분량의 요약 설명을 작성해주세요.
작성 규칙:
- 마크다운 기호(#, *, - 등) 사용 금지
- 전문 용어는 쉬운 말로 풀어서 설명
- 투자 금액, 남길 현금, 매달 쓸 돈 언급 필수
- 각 기간별(단기/중기/장기) 대표 상품 1~2개 언급
- 마지막 문장은 투자 유의사항으로 마무리`;

  const userPrompt = `다음 추천 결과를 요약해주세요.

투자 금액: ${formatWon(investAmount)}
남길 현금: ${formatWon(remainingCash)}
매달 쓸 돈: ${formatWon(monthlyNeed)}
선택 위험도: ${riskLabel}

추천 상품:
${periodText}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI API 오류 (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '요약을 생성하지 못했습니다.';
}
