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

// 월 100만원 필요. 파킹이 1~6개월차, 그 뒤를 6개월 만기 예금이 잇는다.
const ganttReport = {
  propertyResult: {
    currentHome: { name: '', pyeong: null, estimatedSalePrice: 700_000_000 },
    newHome: {
      name: '민락 e편한세상',
      location: '경기도 의정부시 민락동 694',
      pyeong: 30,
      purchasePrice: 400_000_000,
      grades: [
        { label: '주거 안전', score: 82 },
        { label: '생활 편의', score: 55 },
        { label: '자산 안정', score: 20 },
      ],
      memo: '',
    },
    costs: [{ label: '양도소득세', amount: 0, note: '양도차익 없음' }],
    netFund: 180_000_000,
  },
  financePlan: {
    netFund: 180_000_000,
    immediateExpenses: [],
    investable: 18_000_000,
    monthlyNeed: 1_000_000,
    items: [
      { name: '파킹통장·CMA', maturityMonths: 0, rate: 0, fixed: false, invest: 6_000_000, percent: 33, tag: '즉시 인출' },
      { name: '＊＊은행 정기예금', maturityMonths: 6, rate: 0.03, fixed: true, invest: 12_000_000, percent: 67, tag: '단기 · 매우 낮은 위험' },
    ],
  },
  completedSteps: [],
}

describe('PdfReport ④ 굴리는 돈 간트차트', () => {
  const wrapper = mount(PdfReport, { props: { report: ganttReport } })

  it('상품 하나당 간트 행 하나를 그린다', () => {
    const rows = wrapper.findAll('.pdf-gantt-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('파킹통장·CMA')
    // 파킹 600만원 / 월 100만원 = 6개월치 → 1~6개월차
    expect(rows[0].text()).toContain('1~6개월차')
  })

  it('막대를 전체 기간 대비 비율로 배치한다', () => {
    const bars = wrapper.findAll('.pdf-gantt-bar')
    expect(bars[0].attributes('style')).toContain('left: 0%')
    // 두 번째 막대는 첫 막대가 끝난 지점에서 시작한다
    const left = Number(bars[1].attributes('style').match(/left:\s*([\d.]+)%/)[1])
    const firstWidth = Number(bars[0].attributes('style').match(/width:\s*([\d.]+)%/)[1])
    expect(left).toBeCloseTo(firstWidth, 5)
    expect(left).toBeGreaterThan(0)
  })

  it('축 눈금은 0개월에서 시작하고 마지막 눈금이 전체 기간이다', () => {
    const ticks = wrapper.findAll('.pdf-gantt-tick')
    expect(ticks[0].text()).toBe('0개월')
    expect(ticks[ticks.length - 1].attributes('style')).toContain('left: 100%')
    expect(ticks[ticks.length - 1].classes()).toContain('last')
  })

  it('② 옮길 집은 주소·평수를 한 줄로, 등급을 배지로 보여준다', () => {
    expect(wrapper.find('.pdf-home-meta').text()).toBe('경기도 의정부시 민락동 694 · 30평')
    const grades = wrapper.findAll('.pdf-grade')
    expect(grades.map((g) => g.text())).toEqual([
      '주거 안전 우수',
      '생활 편의 보통',
      '자산 안정 미흡',
    ])
    expect(grades[0].classes()).toContain('grade--good')
    expect(grades[2].classes()).toContain('grade--weak')
  })
})
