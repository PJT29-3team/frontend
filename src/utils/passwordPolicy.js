export const PASSWORD_RULE_MESSAGE = '영문, 숫자, 특수문자를 포함해 8~72자로 입력해주세요.'

const strongPasswordPattern =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])[A-Za-z\d\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{8,72}$/

export function isStrongPassword(password) {
  return strongPasswordPattern.test(password)
}
