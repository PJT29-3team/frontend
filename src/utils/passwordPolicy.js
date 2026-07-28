export const PASSWORD_RULE_MESSAGE = '영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.'

const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/

export function isStrongPassword(password) {
  return strongPasswordPattern.test(password)
}
