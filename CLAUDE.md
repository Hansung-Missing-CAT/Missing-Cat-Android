# Missing PET — 분실 반려동물 AI 매칭 모바일 앱

## 프로젝트 개요

딥러닝 기반 사진 유사도 매칭으로 실종 반려동물(고양이)을 찾는 Android PWA 앱.
신고자(사진 업로더)와 반려인(게시글 작성자)을 AI 매칭 + 1:1 채팅으로 연결한다.

## 핵심 참고 문서

작업 전 반드시 아래 문서를 읽고 시작할 것:

- `docs/WBS.md` — **작업명세서 (106개 항목, Phase 0~8)**. UI 공통 정책, 기술 스택, 폴더 구조, 화면 흐름, Phase별 작업 항목 전체 포함.
- `docs/작업명세서_MissingPET.md` — WBS.md와 동일 내용. 파일명으로 빠르게 찾을 수 있는 한국어 버전.
- `docs/UI_기획서.pdf` — 피그마 기반 상세 화면 설계서. 스크린샷과 세부 UI 스펙 참고용.
  > ⚠️ 이 파일은 `.gitignore`에 등록되어 Git에 포함되지 않음.
  > 팀 Google Drive에서 다운로드하여 `docs/UI_기획서.pdf` 경로에 배치할 것.
  > Drive 링크: (팀 드라이브 URL을 여기에 기입)

## 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite 5
- **상태 관리**: Zustand
- **라우팅**: React Router v6
- **스타일링**: CSS Modules 또는 Tailwind CSS
- **PWA**: vite-plugin-pwa + Workbox
- **네이티브 래핑**: Capacitor (카메라, 푸시 알림, Geolocation)
- **지도**: 카카오맵 또는 네이버맵 JS API
- **폰트**: Pretendard

## 폴더 구조

```
src/
├── components/       # 공통 UI (Button, Card, Modal, NavBar)
├── pages/
│   ├── splash/       # 스플래시
│   ├── auth/         # 로그인, 회원가입
│   ├── home/         # 메인 홈, 피드, 상세, 검색, 알림
│   ├── report/       # 실종 신고 (반려인, Step 1~5)
│   ├── tipoff/       # 제보하기 (신고자, AI 매칭)
│   ├── chat/         # 채팅 목록, 채팅방
│   └── settings/     # 프로필, 설정
├── hooks/            # useAuth, useLocation 등
├── services/         # API 호출 모듈
├── stores/           # Zustand 스토어
├── utils/            # 유틸 함수
├── assets/           # 이미지, 아이콘
├── styles/           # 글로벌 CSS, 테마 변수
└── types/            # TS 타입 정의
```

## 디자인 토큰

- Primary: `#D32F2F` (빨강)
- Background: `#FFFFFF`
- Text: `#333333`
- 카드/썸네일 radius: `12px`
- 버튼 radius: `8px`
- 이미지 비율: 1:1 또는 4:3
- 하단 네비게이션: 홈 / 실종신고 / 제보 / 채팅 (4탭)

## 두 사용자 역할

| 역할 | 설명 | 핵심 플로우 |
|------|------|-------------|
| 신고자 (Reporter) | 길에서 발견한 동물 사진 업로더 | 사진 3장+ 업로드 → AI 매칭 → 보호자에게 제보 전송 |
| 반려인 (Owner) | 실종 게시글 작성자 | 위치→사진 5장+→정보→시기→사례금 → 등록 |

이 두 역할의 화면과 네비게이션은 명확히 분리한다.

## 코드 작성 규칙

- TypeScript strict 모드. 타입 명확히 정의, `any` 사용 금지.
- 컴포넌트는 기능 단위로 분리하고 재사용 가능하게 작성.
- 주석은 **한국어**로 작성.
- 커밋 메시지: `feat:`, `fix:`, `refactor:`, `style:`, `docs:` 접두사 사용.
- 새 기능 구현 전, 해당 Phase의 작업 항목을 `docs/WBS.md`에서 확인.
- 외부 라이브러리 도입 시 이유와 대안을 주석 또는 커밋에 기록.
- 한 번에 전체 코드를 생성하지 않고, 화면/기능 단위로 끊어서 진행.

## 주요 커맨드

```bash
npm create vite@latest missing-pet -- --template react-ts   # 프로젝트 생성
npm run dev                                                  # 개발 서버
npm run build                                                # 프로덕션 빌드
npm run preview                                              # 빌드 미리보기
npx cap init                                                 # Capacitor 초기화
npx cap add android                                          # Android 프로젝트 추가
npx cap sync                                                 # 웹 빌드 → 네이티브 동기화
npx cap open android                                         # Android Studio 열기
```

## 개발 순서

Phase 순서대로 진행하되, 각 Phase 내에서는 `docs/WBS.md`의 No 순서를 따른다:

1. **Phase 0** — 환경 설정 (Vite, PWA, 디자인 시스템)
2. **Phase 1** — 인증 (스플래시, 회원가입, 로그인)
3. **Phase 2** — 메인 홈 (상단 바, 지역, 피드, 검색, 알림)
4. **Phase 3** — 실종 신고 (반려인 5단계 + 게시글 관리)
5. **Phase 4** — 제보하기 (신고자 사진+위치 업로드, AI 매칭)
6. **Phase 5** — 채팅 (목록, 1:1 메시징, 첨부, 신고/나가기)
7. **Phase 6** — 프로필/설정
8. **Phase 7** — 네이티브 연동 (Capacitor, Play Store)
9. **Phase 8** — QA/최적화

## 주의사항

- 모든 UI는 **모바일 퍼스트**로 설계. 데스크톱 대응은 불필요.
- PWA manifest, service worker는 Phase 0에서 반드시 구성.
- 카메라/갤러리/GPS는 Capacitor 플러그인 사용 전제로 설계.
- 모호한 요구사항은 구현 전에 먼저 확인 질문.
