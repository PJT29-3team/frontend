# Password Reset Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 작은둥지 브랜드의 이메일 요청·링크 검증·새 비밀번호 설정·완료 화면과 마이페이지 비밀번호 변경을 구현한다.

**Architecture:** 기존 재설정 API와 라우트를 유지하고 두 Vue 화면의 상태 전환을 명확히 한다. 요청 화면과 설정 화면은 공용 `LoginHeader`·`LoginFooter`를 사용하며, 비밀번호 규칙은 공유 유틸리티로 분리해 회원가입과 마이페이지에서도 동일하게 사용한다.

**Tech Stack:** Vue 3, Vue Router, Axios, Vitest, Vue Test Utils, Lucide

## Global Constraints

- 작은둥지 로고와 정확한 화면 문구를 사용한다.
- 영문·숫자·특수문자 포함 8자 이상 규칙을 사용한다.
- 서버의 비밀번호 재사용 오류 문구를 그대로 표시한다.
- 완료 전에는 메인 화면으로 이동하지 않는다.
- 카카오 로그인과 이메일 회원가입 화면 동작을 변경하지 않는다.

---

### Task 1: 비밀번호 규칙 공유

**Files:**
- Create: `src/utils/passwordPolicy.js`
- Modify: `src/views/SignupView.vue`
- Test: `src/views/SignupView.test.js`

- [ ] 공유 규칙 테스트를 추가하고 실패를 확인한다.
- [ ] 회원가입과 재설정이 같은 정규식과 안내 문구를 사용하도록 구현한다.
- [ ] 회원가입 회귀 테스트를 통과시킨다.

### Task 2: 이메일 요청 화면

**Files:**
- Modify: `src/views/PasswordResetRequestView.vue`
- Modify: `src/views/PasswordResetRequestView.test.js`

- [ ] 공용 헤더·푸터, 뒤로가기, 진행 표시, 이메일 안내, 중립 완료 문구 테스트를 추가한다.
- [ ] 현재 카드형 화면과의 차이로 실패하는지 확인한다.
- [ ] 기준 이미지에 맞춘 전체 화면형 중앙 폼을 구현한다.
- [ ] 요청 화면 테스트를 통과시킨다.

### Task 3: 링크 검증·새 비밀번호·완료 화면

**Files:**
- Modify: `src/views/PasswordResetCompleteView.vue`
- Modify: `src/views/PasswordResetCompleteView.test.js`

- [ ] 확인 중·만료·설정·완료 상태와 정확한 문구를 테스트한다.
- [ ] 표시·숨기기, 강도, 일치, 재사용 오류 테스트를 추가한다.
- [ ] 실패를 확인한 뒤 기준 이미지의 중앙 폼과 완료 화면을 구현한다.
- [ ] 설정 화면 테스트를 통과시킨다.

### Task 4: 마이페이지 비밀번호 변경

**Files:**
- Modify: `src/api/authApi.js`
- Modify: `src/views/ProfileView.vue`
- Create: `src/views/ProfileView.test.js`

- [ ] 현재·새·확인 입력과 강한 비밀번호 검증 테스트를 추가한다.
- [ ] `PATCH /api/users/me/password` 호출 후 세션을 비우고 이메일 로그인으로 이동하는 동작을 구현한다.
- [ ] 서버 오류를 현재 화면에서 표시하는지 확인한다.

### Task 5: 전체 및 시각 검증

- [ ] `npm test -- --run`을 실행한다.
- [ ] `npm run build`를 실행한다.
- [ ] 데스크톱과 모바일에서 요청·설정·완료 화면을 캡처해 비교한다.
- [ ] 가로 스크롤, 겹침, 콘솔 오류가 없는지 확인한다.
- [ ] `git diff --check`와 작업 트리 상태를 확인한다.
- [ ] 기능 변경을 커밋한다.

