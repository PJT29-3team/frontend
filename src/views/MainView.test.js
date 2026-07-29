import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MainView from './MainView.vue'

describe('MainView', () => {
  it('renders an empty main screen after login', () => {
    const wrapper = mount(MainView)

    expect(wrapper.get('[data-main-screen]').text()).toBe('')
  })
})
