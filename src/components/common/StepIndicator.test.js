import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StepIndicator from './StepIndicator.vue';

// 클릭 가능한 단계는 RouterLink로, 잠긴 단계는 disabled button으로 렌더된다.
function unlockedLabels(currentStep, unlockedStep) {
  const wrapper = mount(StepIndicator, {
    props: { currentStep, unlockedStep },
    global: { stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } } },
  });
  return wrapper.findAll('.step')
    .filter((el) => el.element.tagName === 'A')
    .map((el) => el.find('.step-label').text());
}

describe('StepIndicator 되돌아가기', () => {
  it('금융 단계에 서 있으면 앞 단계로 되돌아갈 수 있다', () => {
    // unlockedStep은 설문 완료까지만 알지만, 지금 서 있는 단계가 더 뒤면 그쪽이 기준이 된다.
    expect(unlockedLabels('finance-manage', 'recommend')).toEqual([
      '설문 조사', '추천 매물', '관심 매물', '금융상품 추천', '금융상품 관리',
    ]);
  });

  it('아직 안 간 뒤 단계는 잠겨 있다', () => {
    expect(unlockedLabels('finance-recommend', 'recommend')).not.toContain('결과 보기');
  });

  it('설문만 끝냈으면 매물 단계까지만 열린다', () => {
    expect(unlockedLabels('recommend', 'recommend')).toEqual(['설문 조사', '추천 매물']);
  });
});
