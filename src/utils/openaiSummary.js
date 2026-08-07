/**
 * OpenAI API를 이용해 다운사이징 자산 설계의 "앞으로 행동 지침"을 JSON으로 생성한다.
 *
 * @param {object} params
 * @param {number}  params.investable      - 투자 가능 금액 (원)
 * @param {number}  params.monthlyNeed     - 매달 쓸 돈 (원)
 * @param {string}  params.fundedMonths    - 지속 가능 기간 텍스트 (예: "8년 6개월")
 * @param {Array}   params.items           - 포트폴리오 상품 배열
 * @param {object}  params.propertyResult  - 매물 결과 (currentHome, newHome, netFund)
 * @param {number}  params.userAge         - 사용자 연령대 (예: 60)
 * @param {string}  params.profileCode     - 투자 성향 코드 (VERY_LOW ~ HIGH)
 * @param {string}  params.dataTemplateText - 프론트엔드에서 완성된 요약 문장
 * @returns {Promise<object>} { ai_insight } 형태의 전문가 조언
 */
export async function generateActionPlan({
  investable,
  monthlyNeed,
  fundedMonths,
  items,
  propertyResult,
  userAge,
  profileCode,
  dataTemplateText,
}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');

  const formatWon = (n) => {
    if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억 원`;
    if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만 원`;
    return `${n.toLocaleString()}원`;
  };

  // recommendation 스토어의 RISK_OPTIONS 코드와 동일하게 유지할 것
  const profileMap = {
    VERY_LOW: '매우 보수적 (원금 보장 최우선)',
    LOW: '보수적 (손실 폭 최소화)',
    MEDIUM: '중도적 (수익과 변동성 고려)',
  };
  const profileStr = profileMap[profileCode] || '알 수 없음';

  // 만기 순서대로 정렬된 상품 목록 텍스트
  const itemText = [...items]
    .sort((a, b) => (a.maturityMonths || 0) - (b.maturityMonths || 0))
    .map((item) => {
      const when = item.maturityMonths === 0 ? '즉시 인출 가능' : `${item.maturityMonths}개월 만기`;
      return `- ${item.name} (${when}, ${formatWon(item.invest)}, ${item.percent}%, 위험도: ${item.tag})`;
    })
    .join('\n');

  const systemPrompt = `당신은 ${userAge}대 시니어의 자산 관리를 돕는 금융 어드바이저입니다.
사용자의 다운사이징 자산 설계 결과와 요약 문장(미리 작성됨)을 바탕으로, 사용자 성향(${profileStr})에 맞춘 "전문가의 한마디 조언"에 집중한 실용적 지침을 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "ai_insight": "제공된 [기본 요약 문장]의 맥락을 짚어주고, 사용자의 나이대와 투자 성향을 반영한 2~3문장 분량의 핵심 조언."
}

작성 규칙:
- 60대 이상이 이해할 수 있는 쉬운 말 사용
- 마크다운 기호(#, *, ** 등) 절대 사용 금지
- 숫자는 "억 원", "만 원" 단위로 표현
- ai_insight는 이미 [기본 요약 문장]에 숫자가 있으므로 단순 숫자 반복을 피하고, 왜 이 배분이 좋은지 혹은 어떤 점을 보완하면 좋은지 조언할 것`;

  const userPrompt = `다음 자산 설계 결과를 바탕으로 행동 지침을 JSON으로 작성해주세요.

[기본 요약 문장]
${dataTemplateText}

[자산 현황]
- 현재 집: ${propertyResult.currentHome.name} (${propertyResult.currentHome.pyeong}평)
- 이사 갈 집: ${propertyResult.newHome.name} (${propertyResult.newHome.pyeong}평)
- 이사 후 손에 쥐는 돈: ${formatWon(propertyResult.netFund)}

[투자 계획]
- 투자 가능 금액: ${formatWon(investable)}
- 매달 쓸 돈: ${formatWon(monthlyNeed)}
- 생활비 지속 예상 기간: ${fundedMonths}
- 사용자 나이: ${userAge}대
- 투자 성향: ${profileStr}

[포트폴리오 상품 (만기 순)]
${itemText}`;

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
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI API 오류 (${response.status})`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(raw);
}
