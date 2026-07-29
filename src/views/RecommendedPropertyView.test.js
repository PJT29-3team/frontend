import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RecommendedPropertyView from './RecommendedPropertyView.vue'
import * as propertyApi from '../api/propertyApi'
import * as favoriteApi from '../api/favoriteApi'

const routerPush = vi.hoisted(() => vi.fn())

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: routerPush }),
  }
})

const properties = [
  {
    propertyId: 'p1',
    externalPropertyKey: 'ext-1',
    name: '중랑구 소형 아파트',
    price: '2억 9,000만원',
    address: '서울 중랑구 면목로 45',
    commuteTime: '도보 12분',
    grade: 'excellent',
    score: 88,
  },
  {
    propertyId: 'p2',
    externalPropertyKey: 'ext-2',
    name: '노원구 소형 아파트',
    price: '2억 5,000만원',
    address: '서울 노원구 상계로 10',
    commuteTime: '버스 20분',
    grade: 'normal',
    score: 62,
  },
]

function mountView() {
  return mount(RecommendedPropertyView)
}

describe('RecommendedPropertyView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    routerPush.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads and renders the top recommended properties with map pins', async () => {
    vi.spyOn(propertyApi, 'getRecommendedProperties').mockResolvedValue(properties)
    vi.spyOn(favoriteApi, 'getFavoriteProperties').mockResolvedValue([])

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.findAll('.property-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('중랑구 소형 아파트')
    expect(wrapper.text()).toContain('적합도 우수')
    expect(wrapper.text()).toContain('담은 매물 0/3')
  })

  it('shows the loading state before data arrives', async () => {
    vi.spyOn(propertyApi, 'getRecommendedProperties').mockReturnValue(new Promise(() => {}))
    vi.spyOn(favoriteApi, 'getFavoriteProperties').mockReturnValue(new Promise(() => {}))

    const wrapper = mountView()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('추천 매물을 불러오고 있어요')
  })

  it('toggles a favorite through the store when the button is clicked', async () => {
    vi.spyOn(propertyApi, 'getRecommendedProperties').mockResolvedValue(properties)
    vi.spyOn(favoriteApi, 'getFavoriteProperties').mockResolvedValue([])
    vi.spyOn(favoriteApi, 'addFavoriteProperty').mockResolvedValue(undefined)

    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('.favorite-button')[0].trigger('click')
    await flushPromises()

    expect(favoriteApi.addFavoriteProperty).toHaveBeenCalledWith('p1')
    expect(wrapper.text()).toContain('담은 매물 1/3')
  })

  it('navigates to the condition change screen', async () => {
    vi.spyOn(propertyApi, 'getRecommendedProperties').mockResolvedValue(properties)
    vi.spyOn(favoriteApi, 'getFavoriteProperties').mockResolvedValue([])

    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('.secondary-action')[1].trigger('click')

    expect(routerPush).toHaveBeenCalledWith('/properties/condition')
  })
})
