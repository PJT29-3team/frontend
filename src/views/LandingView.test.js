import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LandingView from './LandingView.vue'

describe('LandingView', () => {
  it('renders service sections and routes both primary actions to login', () => {
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.find('#services').exists()).toBe(true)
    expect(wrapper.find('#reviews').exists()).toBe(true)
    expect(wrapper.text()).toContain('시니어 다운사이징 서비스')
    expect(wrapper.text()).toContain('이용 후기')

    const loginLinks = wrapper
      .findAllComponents(RouterLinkStub)
      .filter((link) => link.props('to') === '/login')

    expect(loginLinks).toHaveLength(2)
    expect(loginLinks.map((link) => link.text())).toEqual([
      '로그인',
      '서비스 이용하러 가기',
    ])
  })

  it('renders three services and five sample reviews', () => {
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.findAll('[data-service-item]')).toHaveLength(3)
    expect(wrapper.findAll('[data-review-item]')).toHaveLength(5)
  })

  it('renders a hidden duplicate review group for a seamless queue', () => {
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    const groups = wrapper.findAll('[data-review-group]')

    expect(groups).toHaveLength(2)
    expect(groups[0].findAll('[data-review-card]')).toHaveLength(5)
    expect(groups[1].findAll('[data-review-card]')).toHaveLength(5)
    expect(groups[0].attributes('aria-hidden')).toBeUndefined()
    expect(groups[1].attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-review-marquee]').attributes('tabindex')).toBe('0')
  })

  it('uses the reference illustration and service icon set', () => {
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.get('[data-hero-illustration]').attributes('src')).toContain('senior-downsizing-hero.png')
    expect(wrapper.findAll('[data-service-icon]').map((icon) => icon.attributes('data-service-icon'))).toEqual([
      'search',
      'check',
      'bell',
    ])
    expect(wrapper.findAll('[data-footer-icon]').map((icon) => icon.attributes('data-footer-icon'))).toEqual([
      'instagram',
      'dribbble',
      'twitter',
      'youtube',
    ])
    expect(wrapper.text()).toContain('서비스 기능')
    expect(wrapper.text()).toContain('이용 후기')
  })
})
