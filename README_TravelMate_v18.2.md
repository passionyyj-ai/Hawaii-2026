# TravelMate AI v18.2

## 핵심 수정
- `controllerchange`에서 `location.reload()` 하던 코드를 완전히 제거했습니다.
- `skipWaiting()`과 `clients.claim()`을 제거했습니다.
- 실행 중인 화면을 Service Worker가 강제로 교체하지 않습니다.
- 새 버전은 백그라운드에서 확인되며 앱/탭을 완전히 닫고 다시 열 때 적용됩니다.
- 일정별 첨부파일·메모 기능과 음성 인식 안정화는 유지됩니다.

## 업로드
압축을 풀고 저장소 루트에 전체 파일을 덮어쓴 뒤 Commit changes를 실행하세요.
특히 index.html, sw.js, version.json을 반드시 교체해야 합니다.
