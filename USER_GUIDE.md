# 사용 가이드 (User Guide)

빌드 도구 없이 순수 HTML/CSS/JS로 만든 모바일 청첩장의 수정·배포 방법입니다. GitHub Pages에 바로 배포할 수 있습니다.
예식 정보는 [README.md](README.md)를 참고하세요.

## 포함된 기능

- 커버(히어로) 이미지 + 신랑신부 이름
- 인사말 / 혼주 성함
- D-day 카운트다운 + 미니 캘린더 + 캘린더 저장(.ics 다운로드)
- 갤러리 (그리드 + 라이트박스, 스와이프 지원)
- 오시는 길 (지도 임베드, 주소 복사, 대중교통/주차 안내)
- 연락하기 (전화/문자 바로가기)
- 마음 전하실 곳 (계좌번호 아코디언 + 복사 버튼)
- 참석 여부(RSVP) 폼
- 사진 스토리 (음악과 함께 재생되는 전체 화면 슬라이드)
- 링크 공유 / 네이티브 공유(Web Share API)

## 1. 내용 수정하기

거의 모든 텍스트는 **`js/config.js`** 한 파일에 모여 있습니다. 이름, 날짜, 예식장, 연락처, 계좌번호를 여기서 바꾸세요.

```js
// js/config.js
groom: { nameKr: "김민준", nameEn: "MINJUN KIM", ... }
weddingDateISO: "2026-11-14T13:00:00+09:00",
venue: { name: "...", address: "...", mapQuery: "..." }
accounts: { groomSide: [...], brideSide: [...] }
```

인사말 문구나 섹션 순서처럼 config로 빠지지 않은 텍스트는 `index.html`에서 직접 찾아 수정하면 됩니다 (한국어 텍스트라 검색이 쉽습니다).

## 2. 사진 넣기

- 대표(커버) 사진: `images/photos/hero.jpg`
- 갤러리 + 우리의 이야기 슬라이드: `images/photos/01.jpg` ~ `18.jpg` (썸네일은 `images/photos/thumbs/`)
- 공유 미리보기 이미지: `images/og-image.jpg` (1200×630)

원본 사진은 `images/wedding/`에 있으며 용량이 커서 git에 올리지 않습니다(`.gitignore`).
웹용 사진은 원본에서 흰 여백을 잘라내고 리사이즈해서 만들었습니다:

```bash
magick 원본.jpg -auto-orient -fuzz 2% -trim +repage -strip -resize '1400x1400>' -quality 82 -interlace Plane images/photos/NN.jpg
magick images/photos/NN.jpg -resize 480x -quality 78 images/photos/thumbs/NN.jpg
```

사진 순서·추가·삭제는 `js/config.js`의 `story.photos` 목록을 수정하면 갤러리와 슬라이드에 함께 반영됩니다.

## 3. 지도

기본값은 **API 키가 필요 없는 구글맵 임베드**를 사용합니다 (`js/config.js`의 `venue.mapQuery`).
정확도를 더 높이려면:

- **카카오맵**: [Kakao Developers](https://developers.kakao.com)에서 JS 키 발급 후 카카오맵 SDK로 교체
- **네이버 지도**: [Naver Cloud Platform](https://www.ncloud.com/product/applicationService/maps)에서 Client ID 발급 후 교체

`index.html`의 `#map-frame` iframe과 `js/main.js`의 지도 관련 코드를 참고해서 교체하면 됩니다.

## 4. 참석 여부(RSVP) 실제로 받기 — 중요

기본 설정(`rsvpEndpoint: ""`)에서는 응답이 **제출한 사람의 브라우저에만** 저장됩니다 (localStorage).
즉 하객이 제출해도 신랑신부는 그 응답을 볼 수 없습니다. 실제로 응답을 받으려면 아래 중 하나를 연결하세요.

- **[Formspree](https://formspree.io)** (가장 간단): 무료 가입 후 폼 엔드포인트를 받아 `js/config.js`의
  `rsvpEndpoint`에 붙여넣으면 끝입니다. 이후 응답은 이메일로 옵니다.
- **Google Forms**: 구글 폼을 만들어 RSVP 섹션을 iframe이나 링크로 교체
- **EmailJS / Firebase**: 더 커스텀한 경험이 필요하면 사용

## 5. 공유 (카카오톡 공유 버튼)

기본은 "링크 복사"와 기기 네이티브 공유(iOS/Android 공유 시트)만 지원합니다.
카카오톡 전용 공유 버튼을 쓰려면:

1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성 후 JavaScript 키 발급
2. 플랫폼 설정에 배포 도메인(`https://weddinghan1121-bot.github.io`) 등록
3. `js/config.js`의 `share.kakaoJsKey`에 키 입력
4. `index.html`에 카카오 SDK 스크립트 추가 후 `Kakao.Share.sendDefault(...)` 호출 코드를 `js/main.js`에 추가

## 6. GitHub Pages로 배포하기

저장소는 `weddinghan1121-bot/invitation`이고, 이 컴퓨터에서는 SSH 호스트 별칭 `github-wedding`
(`~/.ssh/config`, 키: `~/.ssh/id_ed25519_weddinghan`)으로 접속합니다. 원격 주소는 이미 설정되어 있습니다.

```bash
git remote -v                # git@github-wedding:weddinghan1121-bot/invitation.git 인지 확인
ssh -T git@github-wedding    # "Hi weddinghan1121-bot!" 이 나와야 합니다
git push -u origin main      # 처음 한 번 (이후에는 git push)
```

GitHub가 새 저장소에서 안내하는 `git remote add origin https://...` 명령은 실행하지 마세요.
원격이 이미 있어서 실패하고, HTTPS 주소는 SSH 키를 사용하지 않습니다.

그 다음 GitHub 저장소 → **Settings → Pages** → Source를 `main` 브랜치 `/ (root)`로 설정하면
`https://weddinghan1121-bot.github.io/invitation/` 주소로 배포됩니다.

배포 후 `js/config.js`의 `share.url`과 `index.html`의 `og:url`을 실제 주소로 업데이트해주세요.

## 로컬에서 미리보기

```bash
cd /Users/han/Project/wedding
python3 serve.py
# http://localhost:8000 접속
```

`serve.py`를 쓰세요. `python3 -m http.server`는 Cache-Control 헤더를 보내지 않아 브라우저가
`js/config.js`, `css/style.css` 같은 파일을 캐시해 버립니다. **내용을 고쳐도 화면이 그대로인**
문제가 여기서 생깁니다. `serve.py`는 매 응답에 `no-store`를 붙이고 304 응답도 막아서
새로고침만 하면 항상 최신 파일이 보입니다.

8000번 포트가 이미 사용 중이면 8001, 8002… 순서로 빈 포트를 찾아 열고 터미널에 주소를 알려줍니다.
이전에 켜 둔 서버가 남아 있을 때 흔히 생기니, 필요 없으면 그 터미널에서 Ctrl+C로 끄세요
(어떤 프로세스인지 보려면 `lsof -iTCP:8000 -sTCP:LISTEN`).
어느 폴더에서 실행해도 청첩장 폴더를 보여주며, Range 요청을 지원해 Safari/iOS에서도 음악이 재생됩니다.

`index.html`을 파일로 바로 열면(`file://`) 지도·공유 기능이 제대로 동작하지 않으니 서버로 여세요.

### 배포 후에 내용을 바꿨다면

하객 브라우저에도 같은 캐시 문제가 생길 수 있습니다. `index.html` 아래쪽의
`?v=20260926-story` 값을 아무 값으로나 바꿔서 올리면 새 파일을 다시 받아갑니다.

```html
<link rel="stylesheet" href="css/style.css?v=20260927" />
<script src="js/config.js?v=20260927"></script>
<script src="js/main.js?v=20260927"></script>
<script src="js/story.js?v=20260927"></script>
```

## 사진 스토리 (Play our story)

갤러리의 **우리의 이야기 재생 / Play our story** 버튼을 누르면 18장의 사진으로 만든
전체 화면 스토리가 재생됩니다. 음악(`audio/bgm.mp3`)은 스토리에서만 재생되며, 열 때마다 처음부터 시작하고 닫으면 멈춥니다.
일시정지, 음소거, 이전/다음, 스와이프, 다시 보기 및 Escape로 닫기를 지원합니다.
닫으면 원래 스크롤 위치로 돌아갑니다. 기기의 동작 줄이기 설정에서는 확대/전환 효과를 끕니다.

`js/config.js`의 `story.photos`에서 사진 경로와 한국어/영어 캡션(`caption`, `caption_en`, 선택)을
바꾸세요. `story.cover`는 갤러리 버튼의 배경 사진, `slideDuration`은 사진당 표시 시간(밀리초)입니다.
