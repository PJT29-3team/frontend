import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MainView from './MainView.vue'

describe('MainView', () => {
  it('renders the favorite homes comparison after login', () => {
    const wrapper = mount(MainView)

    expect(wrapper.text()).toContain('담아두신 3곳을 상세하게 비교해보고')
    expect(wrapper.text()).toContain('아름동 한마을(선경)')
  })

  it('selects another home from the comparison table', async () => {
    const wrapper = mount(MainView)
    const buttons = wrapper.findAll('.select-grid button')

    await buttons[1].trigger('click')

    expect(buttons[1].text()).toBe('✓ 선택함')
  })
})
