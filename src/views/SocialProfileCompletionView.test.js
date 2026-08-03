import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authStore } from '../stores/authStore'
import SocialProfileCompletionView from './SocialProfileCompletionView.vue'

const routerReplace = vi.hoisted(() => vi.fn())

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ replace: routerReplace }),
  }
})

describe('SocialProfileCompletionView', () => {
  beforeEach(() => {
    routerReplace.mockReset()
  })

  it('selects a birth year from the 1960s picker then enters the main screen', async () => {
    vi.spyOn(authStore, 'completeSocialProfile').mockResolvedValue({})
    const wrapper = mount(SocialProfileCompletionView)

    expect(wrapper.text()).toContain('몇 가지만 더 확인할게요')
    const birthYearInput = wrapper.get('input[name="birthYear"]')
    expect(birthYearInput.attributes('readonly')).toBeDefined()
    expect(birthYearInput.attributes('placeholder')).toBe('출생연도를 선택해주세요')

    await wrapper.get('input[name="name"]').setValue('김집현')
    await wrapper.get('[data-birth-year-toggle]').trigger('click')

    expect(wrapper.find('[data-birth-year="1960"]').exists()).toBe(true)
    expect(wrapper.find('[data-birth-year="1969"]').exists()).toBe(true)

    await wrapper.get('[data-previous-decade]').trigger('click')
    await wrapper.get('[data-birth-year="1955"]').trigger('click')

    expect(birthYearInput.element.value).toBe('1955년')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authStore.completeSocialProfile).toHaveBeenCalledWith('김집현', 1955)
    expect(routerReplace).toHaveBeenCalledWith('/main')
  })
})
