# Social Profile Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 신규 카카오 회원이 메인 화면 진입 전에 제공 시안과 같은 화면에서 이름과 생년월일을 입력하도록 한다.

**Architecture:** 기존 `/social/profile` 라우트와 `authStore.completeSocialProfile(name, birthYear)` 계약은 유지한다. 공용 `LoginHeader`에 우측 메뉴 표시 여부만 선택할 수 있는 속성을 추가하고, 소셜 추가정보 화면은 전체 화면형 폼과 생년월일의 1960 기본값을 담당한다.

**Tech Stack:** Vue 3, Vue Router, Vitest, Vue Test Utils, Vite

## Global Constraints

- 기존 소셜 로그인 콜백과 백엔드 API 계약을 변경하지 않는다.
- 화면에서 생년월일을 입력받되 서버에는 출생연도 숫자만 전송한다.
- 공용 헤더를 사용하는 다른 로그인·회원가입 화면의 우측 메뉴는 그대로 유지한다.
- 저장이 성공하기 전에는 메인 화면으로 이동하지 않는다.

---

### Task 1: 소셜 추가정보 화면 동작과 레이아웃

**Files:**
- Modify: `src/components/LoginHeader.vue`
- Modify: `src/views/SocialProfileCompletionView.vue`
- Test: `src/views/SocialProfileCompletionView.test.js`

**Interfaces:**
- Consumes: `authStore.completeSocialProfile(name: string, birthYear: number)`
- Produces: `LoginHeader`의 `showNavigation: boolean` 속성과 `/social/profile`의 이름·생년월일 폼

- [ ] **Step 1: 제공 시안의 화면 계약을 테스트에 추가**

`SocialProfileCompletionView.test.js`에서 `작은둥지`, `몇 가지만 더 확인할게요`, `이름을 입력해주세요.`, `나이`, `다음`, 우측 메뉴 미표시, 카드 미사용을 확인한다.

- [ ] **Step 2: 테스트가 현재 화면 차이로 실패하는지 확인**

Run: `npm test -- --run src/views/SocialProfileCompletionView.test.js`

Expected: 정확한 안내 문구, 공용 헤더, 카드 없는 레이아웃 또는 1960 기본값 검증이 실패한다.

- [ ] **Step 3: 공용 헤더와 추가정보 화면을 최소 범위로 수정**

`LoginHeader.vue`에는 기본값이 `true`인 `showNavigation` 속성을 추가한다. `SocialProfileCompletionView.vue`는 `:show-navigation="false"`로 헤더를 사용하고, 이름과 날짜 입력을 렌더링하며 날짜가 비어 있을 때 처음 포커스하면 `1960-01-01`을 설정한다.

- [ ] **Step 4: 성공 및 실패 흐름을 테스트**

성공 테스트는 `authStore.completeSocialProfile('김집현', 1955)`와 `/main` 이동을 확인한다. 실패 테스트는 서버 오류 문구를 보여주고 `/main`으로 이동하지 않는지 확인한다.

- [ ] **Step 5: 대상 테스트와 전체 검증**

Run: `npm test -- --run src/views/SocialProfileCompletionView.test.js`

Run: `npm test -- --run`

Run: `npm run build`

Expected: 모든 명령이 성공한다.

- [ ] **Step 6: 반응형 화면 확인**

데스크톱과 모바일 브라우저에서 헤더, 중앙 폼, 입력 필드, 버튼이 겹치거나 잘리지 않는지 확인한다.

- [ ] **Step 7: 변경 커밋**

```bash
git add docs/superpowers/specs/2026-07-28-social-profile-completion-design.md docs/superpowers/plans/2026-07-28-social-profile-completion.md src/components/LoginHeader.vue src/views/SocialProfileCompletionView.vue src/views/SocialProfileCompletionView.test.js
git commit -m "feat: 소셜 회원가입 추가정보 화면 개선"
```
