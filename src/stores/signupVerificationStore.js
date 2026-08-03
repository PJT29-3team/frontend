const SIGNUP_VERIFICATION_KEY = 'jh_signup_verification'

export function getSignupVerification() {
  if (typeof sessionStorage === 'undefined') return null

  try {
    const value = JSON.parse(sessionStorage.getItem(SIGNUP_VERIFICATION_KEY))
    if (!value?.email || !value?.signupCompletionToken) return null
    return value
  } catch {
    sessionStorage.removeItem(SIGNUP_VERIFICATION_KEY)
    return null
  }
}

export function saveSignupVerification(email, signupCompletionToken) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SIGNUP_VERIFICATION_KEY, JSON.stringify({
    email,
    signupCompletionToken,
  }))
}

export function clearSignupVerification() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SIGNUP_VERIFICATION_KEY)
  }
}
