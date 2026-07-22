# TravelMate AI v19.1

## 구현 기능
- 일정 추가·수정·삭제
- 일정 변경 내용 Supabase 동기화
- 일정 상세 메모·예약번호·연락처 동기화
- 첨부파일 Supabase Storage 업로드 및 다른 기기 공유
- 이미지/PDF 미리보기 및 다운로드
- Supabase 미설정 시 기존 기기 내부 저장 방식 유지

## 최초 1회 설정
1. Supabase SQL Editor에서 `supabase_setup.sql` 전체를 실행합니다.
2. 앱에서 아무 일정의 `첨부·메모`를 누릅니다.
3. `클라우드 설정`을 눌러 Project URL, anon public key, 공유 코드를 입력합니다.
4. 다른 휴대폰에도 같은 3개 값을 입력합니다.

주의: service_role 키는 입력하지 마세요.
