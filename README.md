# WXT Chrome Extension Universal Starter Kit

최신 Manifest V3 기반의 크롬/파이어폭스/엣지 확장 프로그램을 신속하게 구축할 수 있도록 구성한 WXT 기반 스타터킷입니다. React 18·TypeScript 5·TailwindCSS·Vitest 등을 기본 탑재하여, DX(Developer Experience)와 유지보수성을 동시에 확보할 수 있습니다.

## 1. 아키텍처 개요

- **레이어 분리**: Presentation(팝업/옵션/사이드패널/DevTools) ↔ Application(상태·로직) ↔ Service(Background, 메시지 버스) ↔ Infrastructure(Storage/Browser API)
- **컨벤션 기반 엔트리포인트**: `entrypoints/` 디렉터리 구조가 곧 매니페스트 구성을 결정하며, WXT가 자동 빌드·매핑을 수행합니다.
- **타입 안전 메시징**: `lib/messaging` 모듈이 Runtime 메시지를 단일 버스로 추상화해 RPC-style 통신을 제공합니다.
- **스토리지 추상화**: Zod 스키마와 Immer 기반 `storageManager`로 확장 상태를 안전하게 읽고 갱신합니다.

## 2. 기술 스택

| 카테고리      | 사용 기술                                     |
| ------------- | --------------------------------------------- |
| 프레임워크    | [WXT](https://wxt.dev/) v0.19 + React 18.3    |
| 언어          | TypeScript 5.4 (strict)                       |
| 상태/스토리지 | Zustand(선택), WXT Storage API, Immer, Zod    |
| 스타일        | Tailwind CSS 3.4, Radix UI, Lucide Icons      |
| 번들/빌드     | WXT + Vite 5, Tailwind/PostCSS 파이프라인     |
| 품질/자동화   | ESLint, Prettier, Husky + lint-staged, Vitest |

## 3. 프로젝트 구조

```
wxt-extension-starter/
├── entrypoints/
│   ├── background.ts          # MV3 Service Worker
│   ├── content/
│   │   ├── index.ts           # 콘텐츠 스크립트 진입점
│   │   ├── ui.tsx             # Shadow DOM React UI
│   │   └── styles.css
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── options/               # 확장 설정 페이지
│   ├── sidepanel/             # Chrome 114+ 사이드패널
│   └── devtools/              # DevTools 패널
├── components/
│   ├── ui/                    # Button/Card/Badge 등 UI 프리미티브
│   ├── features/              # Popup/Options/SidePanel/DevTools 화면
│   └── layouts/               # 재사용 레이아웃
├── lib/
│   ├── api/                   # API 클라이언트 스텁
│   ├── hooks/                 # useStorage, useAsyncTask 등
│   ├── messaging/             # 타입 안전 메시지 버스
│   ├── services/              # Analytics, Sync 작업
│   ├── storage/               # 스토리지 스키마/매니저
│   └── utils/                 # 공용 유틸리티 (cn 등)
├── assets/
│   ├── icons/                 # 기본 아이콘 (교체 권장)
│   └── styles/globals.css     # Tailwind 진입점
├── public/_locales/           # 다국어 리소스 (en, ko)
├── tests/                     # Vitest 기반 단위/통합/E2E 스텁
├── types/                     # 전역 타입 선언
├── wxt.config.ts              # 매니페스트 & WXT 설정
├── tailwind.config.ts         # Tailwind 확장 설정
├── vitest.config.ts           # Vitest 구성
├── .eslintrc.cjs / .prettierrc / postcss.config.cjs
└── package.json
```

## 4. 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 개발 서버 (Chrome)
pnpm dev

# 3. 다른 브라우저
pnpm dev:firefox
pnpm dev:edge

# 4. 품질 검증
pnpm lint
pnpm typecheck
pnpm test
```

> 개발 서버 실행 후 WXT가 자동으로 크롬을 띄우고 언팩된 확장을 로드합니다. 수정 사항은 HMR로 즉시 반영됩니다.

## 5. 핵심 구성 요소 요약

### Background (`entrypoints/background.ts`)

- 설치/업데이트 시 초기화 및 마이그레이션 수행
- Context menu → Content Script → Storage → Side Panel로 이어지는 액션 파이프라인
- DevTools 패널에서 전송한 스크립트를 활성 탭에서 평가

### Content Script (`entrypoints/content/*`)

- Shadow DOM 기반 React UI로 현재 텍스트 선택 상태 표시
- Background가 전파한 `context.selection` 이벤트를 실시간 수신

### Popup (`entrypoints/popup/*`)

- 확장 활성 토글, 통계 조회, 옵션 페이지 이동 등을 React UI로 제공
- 메시지 버스를 통해 Background와 RPC-style로 통신

### Options / SidePanel / DevTools

- `components/features/*`에 분리된 화면 컴포넌트를 사용해 기능 확장 용이
- Side Panel은 활동 로그 스트림을 표시하고, DevTools는 코드 스니펫 evaluate 스텁 제공

## 6. 스토리지 & 메시징

- `lib/storage/schema.ts`: 모든 키에 대해 Zod 스키마 정의 → 자동 기본값 생성 → 타입 안전 접근
- `lib/messaging/bus.ts`: Runtime 메시지 → Promise 기반 응답 → `messageClient.emit()`으로 사용
- `useStorage` 훅: React 컴포넌트에서 확장 스토리지를 비동기로 동기화

## 7. 빌드 · 배포

```bash
pnpm build         # 기본 MV3 빌드
pnpm build:chrome  # 특정 브라우저 타깃 빌드
pnpm zip           # Web Store 제출용 ZIP 생성
```

`wxt.config.ts` 의 `zip.artifactTemplate` 값을 수정하면 배포 아티팩트 명명 규칙을 제어할 수 있습니다.

## 8. 테스트 전략

- `tests/unit`: 스토리지 매니저 등 순수 로직 단위 테스트
- `tests/integration`: 메시지 버스 흐름 검증
- `tests/e2e`: Playwright/Puppeteer 연결을 위한 스텁 (CI 구성 시 교체 권장)

## 9. 코드 스타일 & 커밋

- ESLint + Prettier + Husky + lint-staged 가 기본 설정되어 있으며 `pnpm lint` / `pnpm format` 으로 수동 실행 가능
- 커밋 전에 자동 포맷 및 린트를 수행하도록 `.husky/` 훅을 원하는 대로 추가하십시오.

## 10. 다음 단계

1. `assets/icons` 이미지를 브랜드에 맞게 교체하고, 필요 시 `manifest.icons`를 수정합니다.
2. API 연동이 필요하다면 `lib/api/client.ts`의 베이스 URL 및 엔드포인트 구현을 실제 서버에 맞춰 확장합니다.
3. 보안 정책(CSP)·선언적 권한·호스트 권한을 프로젝트 요구 사항에 맞게 `wxt.config.ts`에서 조정합니다.
4. E2E 테스트를 Playwright 등으로 교체하고 GitHub Actions 워크플로(`.github/workflows/`)에 배포 파이프라인을 추가합니다.

---

**최종 업데이트**: 2025-09-19  
**유지 관리자**: Extension Development Team
