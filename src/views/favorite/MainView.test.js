import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import MainView from './MainView.vue'

const mockHomes = [
  { houseId: 1, houseName: '반포 래미안', houseLocation: '서울특별시 서초구 반포동 101', houseSize: 24, housePrice: 450300000, safetyScore: 82, convenienceScore: 76, assetScore: 64, remainingAmount: 156500000, selected: 'Y' },
  { houseId: 2, houseName: '아현 푸르지오', houseLocation: '서울특별시 마포구 아현동 102', houseSize: 23, housePrice: 338000000, safetyScore: 66, convenienceScore: 58, assetScore: 47, remainingAmount: 163760000, selected: 'N' },
]

vi.mock('@/api/favoriteApi', () => ({
  getFavoriteProperties: vi.fn(() => Promise.resolve(mockHomes)),
  removeFavoriteProperty: vi.fn(() => Promise.resolve()),
  selectFavoriteProperty: vi.fn(() => Promise.resolve()),
}))

describe('MainView', () => {
  it('renders favorite properties received from the API', async () => {
    const wrapper = mount(MainView, { global: { stubs: ['router-link'] } })
    await flushPromises()

    expect(wrapper.text()).toContain('반포 래미안')
    expect(wrapper.text()).toContain('약 1억 5,650만원')
  })

  it('selects another home from the comparison table', async () => {
    const wrapper = mount(MainView, { global: { stubs: ['router-link'] } })
    await flushPromises()
    const buttons = wrapper.findAll('.select-grid button')

    await buttons[1].trigger('click')
    await flushPromises()

    expect(buttons[1].text()).toBe('✓ 선택함')
  })
})
