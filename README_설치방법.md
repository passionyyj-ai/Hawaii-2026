# Hawaii 2026 v13 Ultimate

## 구조

GitHub Pages → Cloudflare Worker → OpenAI API

OpenAI API 키는 GitHub에 올리지 않고 Cloudflare Worker의 Secret으로 저장합니다.

## 1\. Cloudflare Worker 만들기

1. Cloudflare Dashboard에 로그인합니다.
passionyyj@gmail.com
wldnjswlgh0%0@
2. **Workers \& Pages → Create application → Create Worker**를 선택합니다.
3. Worker 이름을 예: `hawaii-ai-assistant`로 지정합니다.
4. 편집 화면에서 기본 코드를 전부 지우고 `cloudflare-worker.js` 내용을 붙여넣습니다.
5. **Deploy**를 누릅니다.

## 2\. OpenAI 키 저장

Worker 화면에서 **Settings → Variables and Secrets**로 이동합니다.

Secret:

* 이름: `OPENAI\_API\_KEY`
* 값: OpenAI Platform에서 만든 `sk-...` 키

선택 사항:

* `OPENAI\_MODEL` = `gpt-4.1-mini`
* `OPENAI\_VISION\_MODEL` = `gpt-4.1-mini`
* `APP\_ACCESS\_KEY` = 본인이 만든 긴 임의 문자열

`APP\_ACCESS\_KEY`를 설정했다면 `config.js`의 `workerAccessKey`에도 같은 값을 입력합니다.
이 값은 강력한 인증 수단은 아니지만 무단 호출을 줄이는 보조 장치입니다.

## 3\. Worker 주소 복사

배포 후 표시되는 주소를 복사합니다.

예:
`https://hawaii-ai-assistant.사용자명.workers.dev`

`config.js`:

```javascript
window.HAWAII\_CONFIG = {
  workerUrl: "https://hawaii-ai-assistant.사용자명.workers.dev",
  workerAccessKey: ""
};
```

## 4\. GitHub Pages에 업로드

저장소의 기존 파일을 아래 파일로 교체합니다.

* `index.html`
* `config.js`
* `sw.js`
* `manifest.webmanifest`
* 아이콘 파일

`cloudflare-worker.js`는 Cloudflare에 붙여넣는 서버 코드이므로 GitHub Pages에서 실행하지 않습니다.

## v13 Ultimate 기능

* 한국어 ↔ 영어 GPT 문맥 통역
* 통역 영어 자동 읽기
* 하와이 상황별 AI 여행 비서
* 바로 사용할 영어와 다음 행동 추천
* 메뉴판·표지판·영수증 사진 번역
* API 키 서버 보관

