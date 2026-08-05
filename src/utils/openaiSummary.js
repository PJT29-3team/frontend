/**
 * OpenAI API를 이용해 다운사이징 자산 설계의 "앞으로 행동 지침"을 JSON으로 생성한다.
 *
 * @param {object} params
 * @param {number}  params.investable      - 투자 가능 금액 (원)
 * @param {number}  params.monthlyNeed     - 매달 쓸 돈 (원)
 * @param {string}  params.fundedMonths    - 지속 가능 기간 텍스트 (예: "8년 6개월 ~ 10년 2개월")
 * @param {Array}   params.items           - 포트폴리오 상품 배열
 * @param {object}  params.propertyResult  - 매물 결과 (currentHome, newHome, netFund)
 * @returns {Promise<object>} 구조화된 JSON 행동 지침
 */
export async function generateActionPlan({
  investable,
  monthlyNeed,
  fundedMonths,
  items,
  propertyResult,
}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');

  const formatWon = (n) => {
    if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억 원`;
    if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만 원`;
    return `${n.toLocaleString()}원`;
  };

  // 만기 순서대로 정렬된 상품 목록 텍스트
  const itemText = [...items]
    .sort((a, b) => (a.maturityMonths || 0) - (b.maturityMonths || 0))
    .map((item) => {
      const when = item.maturityMonths === 0 ? '즉시 인출 가능' : `${item.maturityMonths}개월 만기`;
      return `- ${item.name} (${when}, ${formatWon(item.invest)}, ${item.percent}%, 위험도: ${item.tag})`;
    })
    .join('\n');

  const systemPrompt = `당신은 60~70대 시니어의 자산 관리를 돕는 금융 어드바이저입니다.
사용자의 다운사이징 자산 설계 결과를 바탕으로, "앞으로 어떻게 행동해야 하는가"에 집중한 실용적 지침을 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "headline": "이 플랜을 한 문장으로 표현 (20자 이내)",
  "overview": "현재 상태와 앞으로 주목해야 할 점을 2~3문장으로 설명. 이미 설정된 숫자를 반복하지 말고 의미와 맥락을 설명할 것.",
  "timeline": [
    {
      "when": "지금 당장 | N개월 후 | N년 후 중 하나",
      "action": "구체적으로 무엇을 해야 하는지 1~2문장",
      "reason": "왜 이 타이밍이 중요한지 한 문장"
    }
  ],
  "watchout": [
    "위험 시나리오 또는 주의 상황 2~3개. 구체적 수치 포함 권장."
  ],
  "next_action": "지금 당장 할 수 있는 가장 중요한 행동 한 문장"
}

작성 규칙:
- 60대 이상이 이해할 수 있는 쉬운 말 사용
- 마크다운 기호(#, *, ** 등) 절대 사용 금지
- 숫자는 "억 원", "만 원" 단위로 표현
- timeline은 만기 시점 순서대로, 상품별 대응을 중심으로
- watchout은 이 사람의 숫자에서 실제로 도출되는 위험만 포함
- overview는 데이터 반복 금지, AI가 판단한 맥락과 시사점만`;

  const userPrompt = `다음 자산 설계 결과를 바탕으로 행동 지침을 JSON으로 작성해주세요.

[자산 현황]
- 현재 집: ${propertyResult.currentHome.name} (${propertyResult.currentHome.pyeong}평)
- 이사 갈 집: ${propertyResult.newHome.name} (${propertyResult.newHome.pyeong}평)
- 이사 후 손에 쥐는 돈: ${formatWon(propertyResult.netFund)}

[투자 계획]
- 투자 가능 금액: ${formatWon(investable)}
- 매달 쓸 돈: ${formatWon(monthlyNeed)}
- 생활비 지속 예상 기간: ${fundedMonths}

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

