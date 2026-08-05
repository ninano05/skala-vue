# 한국 지역별 날씨 조회 Vue 프로젝트

## 미리보기(모바일.ver)
https://github.com/user-attachments/assets/9ea03635-6821-47e0-b0b0-a889336e86ed

<br />

## ✨주요 기능
#### 1. HOME 날씨 조회 기능
- 기본으로 도시 9곳에 대한 날씨 카드를 조회할 수 있다.
- 날씨 카드를 선택하면 검색창 옆에 해당 날씨에 대한 애니메이션이 실행된다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/c6d31fa5-e4be-42ad-a6cb-a3eb27e46a8d" />

#### 2. 검색 기능
- 원하는 지역을 검색해서 날씨를 확인할 수 있다.
- 시, 구, 동, 읍, 리 등으로 검색이 가능하다.
- 검색시에 검색 자동완성 기능이 제공된다. (openWeather api에서 제공하는 키워드 기반으로 일부 키워드는 자동완성에 제한이 있다.)
- 몇몇 겹치는 지명에 대해 자동완성에서 시 단위의 추가 정보를 보여준다. (만약 해당 정보가 부재할 경우 좌표를 보여준다.)
- 검색한 도시는 Home 화면에 추가 된다.
- 홈에서 검색한 도시는 store에 도시정보가 추가된다. (추후 상세페이지 접근 용이)
<img width="600" alt="스크린샷(60)" src="https://github.com/user-attachments/assets/a5cef5df-d087-4d0e-8d3a-e3cc936db57f" />

#### 3. 즐겨찾기 기능
- 날씨 카드의 별버튼을 클릭하는 것으로 즐겨찾기가 가능하다.
- 즐겨찾기 보드에 현재 즐겨찾기한 지역들의 날씨 카드가 보인다.
- 날씨 상세화면에서도 즐겨찾기가 가능하다.
- 즐겨찾기 정보는 store에 저장 중이다. (따로 DB 배포를 해두지 않았기 때문에, 페이지 이탈 혹은 새로고침 시에 초기화 된다.)
<img width="600" alt="image" src="https://github.com/user-attachments/assets/d1061e33-8989-4ccc-bd92-826de9cadb4f" />

#### 4. 날씨 상세 조회 기능
- 선택한 지역에 대한 날씨의 상세 정보가 조회된다.
- 날씨 위젯에서는 날씨에 따라 배경 애니메이션이 변화한다.
- 별 버튼을 클릭해서 즐겨찾기가 가능하다.
- 날씨 홈에서 이동할 때 상세 페이지로 도시 이름을 전달한다.
- 이 도시 이름을 바탕으로 store에서 도시 정보를 찾아오고, 도시 정보의 좌표(lat,lon)을 읽고 날씨 api를 호출한다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/5a7a35be-2600-4ee2-8513-45713deedaf2" />

#### 5. 강수량 조회 기능 (우산 챙길지 말지 조언해주는 기능)
- 현재 사용자의 위치 기반 시간대별 강수량을 제공한다.
- 처음 접근하면 위치권한 허용을 해야 한다.
- 강수량과 함께 우산을 챙길지 말지 조언해준다.
<img width="715" height="646" alt="image" src="https://github.com/user-attachments/assets/d8331b0c-9be3-47fd-b8bb-e2f0282dc3f2" />

#### 6. 사이트 소개 화면
- 사이트에 대한 간단한 소개를 제공한다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/bd9d0e85-0c6a-4a69-af2b-2da641afcf82" />

#### 7. 그 외 기능 (nav)
- 최상단 nav 바에서 온도 단위를 선택할 수 있다. (store 기반으로 동작)
- 또한 3일차까지 수업의 실습 코드들을 접근할 수 있다. (모바일 환경 css가 설정되어 있지 않아, 모바일에서는 접근하지 않기를 바란다.)
<img width="1017" height="592" alt="image" src="https://github.com/user-attachments/assets/3f342aed-fe79-4f40-917e-9c805735022f" />

<br />

## ✅ 셀프 코드 리뷰
#### 1. 컴포넌트 역할 체크
#### 2. 반응형 오남용 여부 확인
#### 3. API 요청 중 발생 상황 처리
#### 4. 변수, 함수 이름만 보고 무엇을 하기?





