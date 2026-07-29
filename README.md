# 집현전 프론트엔드

시니어 주거 다운사이징 서비스의 Vue 3 프론트엔드입니다.

## 실행 방법

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## 검증 방법

```bash
npm test -- --run
npm run build
```

## 환경변수와 민감정보

- 로컬 환경값은 `.env.local`에 작성하며 Git에 커밋하지 않습니다.
- 데이터베이스 아이디·비밀번호와 서버 비밀키는 프론트엔드에 저장하지 않습니다.
- `VITE_`로 시작하는 환경변수는 브라우저 번들에 공개되므로 비밀값을 넣지 않습니다.
- 브라우저용 지도 API 키처럼 공개가 불가피한 키는 공급자 콘솔에서 허용 도메인과 사용 API를 제한합니다.

## Kakao Map API 설정

1. [Kakao Developers](https://developers.kakao.com)에 로그인해 앱을 만든 뒤, **카카오맵 > 사용 설정**을 `ON`으로 변경합니다.
2. 앱 설정의 **플랫폼 키 > JavaScript 키**에서 JavaScript SDK 도메인에 로컬 개발 주소를 등록합니다.

   ```text
   http://localhost:5173
   ```

3. `.env.example`을 복사해 `.env.local`을 만들고, 발급받은 **JavaScript 키**를 입력합니다. `.env.local`은 Git에 포함하지 않습니다.

   ```env
   VITE_KAKAO_MAP_APP_KEY=발급받은_JavaScript_키
   ```

4. 개발 서버를 재시작합니다.

   ```bash
   npm run dev
   ```

배포 시에는 실제 서비스 도메인도 JavaScript SDK 도메인에 추가해야 합니다. REST API 키, 데이터베이스 정보, 서버 비밀키는 프론트엔드 환경변수에 저장하지 않습니다.
