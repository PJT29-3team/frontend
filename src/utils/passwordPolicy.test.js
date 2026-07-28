import { describe, expect, it } from 'vitest'
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from './passwordPolicy'

describe('passwordPolicy', () => {
  it('requires letters numbers special characters and at least eight characters', () => {
    expect(isStrongPassword('Senior!23')).toBe(true)
    expect(isStrongPassword('passwordonly')).toBe(false)
    expect(isStrongPassword('SeniorHome23')).toBe(false)
    expect(isStrongPassword('Senior Home!23')).toBe(false)
  })

  it('uses the signup password guidance text', () => {
    expect(PASSWORD_RULE_MESSAGE).toBe('영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.')
  })
})
