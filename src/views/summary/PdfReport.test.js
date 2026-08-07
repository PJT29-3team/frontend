import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PdfReport from './PdfReport.vue'

// SummaryView는 report를 computed로 넘긴다. 관심매물·배분 결과가 늦게 도착하면
// 매번 새 객체가 오므로, PdfReport가 setup에서 한 번만 꺼내 두면 빈 보고서를 그린다.
function reportOf({ homeName, purchasePrice, netFund, investable, items }) {
  return {
    userName: '테스트',
    propertyResult: {
      currentHome: { name: '', pyeong: null, estimatedSalePrice: 700_000_000 },
      newHome: { name: homeName, pyeong: 24, fitScore: 87, purchasePrice },
      costs: [],
      netFund,
    },
    financePlan: { netFund, immediateExpenses: [], investable, monthlyNeed: 1_000_000, items },
    completedSteps: [],
  }
}

const empty = reportOf({ homeName: '', purchasePrice: 0, netFund: 0, investable: 0, items: [] })
const loaded = reportOf({
  homeName: '야탑동 탑마을',
  purchasePrice: 400_000_000,
  netFund: 239_960_000,
  investable: 239_960_000,
  items: [{ name: '파킹통장·CMA', tag: '즉시 인출', maturityMonths: 0, invest: 6_000_000, percent: 3 }],
})

describe('PdfReport', () => {
  it('report가 갱신되면 새 값으로 다시 그린다', async () => {
    const wrapper = mount(PdfReport, { props: { report: empty } })
    expect(wrapper.find('.pdf-home-name').text()).toBe('')
    expect(wrapper.find('.pdf-invest-sub').text()).toContain('0개')

    // 데이터가 도착한 시점 — 부모 computed가 새 객체를 준다
    await wrapper.setProps({ report: loaded })
    expect(wrapper.find('.pdf-home-name').text()).toBe('야탑동 탑마을')
    expect(wrapper.find('.pdf-invest-sub').text()).toContain('1개')
    expect(wrapper.find('.pdf-highlight').text()).toContain('2억')
  })
})
