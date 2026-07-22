# TravelMate AI v20.0

- 새 여행 생성 및 여행 코드 자동 발급
- 여행 코드/공유 링크로 다른 기기 참가
- 일정 추가·수정·삭제 클라우드 동기화
- 첨부파일 Supabase Storage 공유
- 기존 일정·상세정보·첨부파일 일괄 이관
- QR 코드와 모바일 공유 기능

## 설치
1. Supabase SQL Editor에서 `supabase_setup.sql` 전체 실행
2. GitHub Pages에 압축 해제 파일 전체 업로드
3. 앱의 `☁️ 여행 공유`에서 Project URL과 anon public key 입력
4. `새 여행 생성` 후 `기존 일정·파일 이관` 실행
5. 다른 기기에서 같은 앱을 열고 여행 코드 입력

`config.js`의 `cloudProjectUrl`, `cloudAnonKey`를 입력하면 다른 기기에서 URL/key를 다시 입력할 필요가 없습니다.
