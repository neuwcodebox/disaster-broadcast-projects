# SKYFALL

청천면의 국지성 호우가 폭포처럼 이어지는 낙수로 변한다. 낙수 범위가 커지고 물이 유역과 행정 경계를 넘어 퍼지면서, 마을의 대피를 맡던 재난대응 체계가 국가의 수송·의료·급수를 유지하는 데 쓰인다. 마지막 장면은 낙수 종료 한 달 뒤의 복구계획을 다룬다.

2031년 7~8월의 가상 사건이다. 대응 권한과 업무는 조사 시점인 2026년 한국 제도를 바탕으로 구성했다. 괴산군 청천면과 충주시 등 실제 행정구역을 배경으로 삼았다. 사건·발표·수치·레이더 영상은 창작이다. 지도는 DBS 내장 시군구 경계를 사용한다.

## 작품과 집필 근거

- [scenario.yaml](scenario.yaml) — 8분 30초 시나리오와 연출 원본.
- [broadcast-draft.md](broadcast-draft.md) — 9개 컷의 조치·보고·공개 순서와 결말.
- [research.md](research.md) — 낙수와 범람의 물리적 전제, 기관별 역할과 장면별 제도 근거.
- [제도 중심 역할극 기록](src/writing/response-roleplay.md) — 역할에 전달한 정보, 제안, 후속 회신과 채택한 전개.

초기 구성과 문안은 [treatment.md](treatment.md), [opening-draft.md](opening-draft.md), [transfer-draft.md](transfer-draft.md), [roleplay-log.md](roleplay-log.md)에 보관한다.

## 미리보기

Node.js 22 이상에서 저장소 루트의 `npm ci`로 의존성을 설치한다. 작품 폴더에서 다음 명령을 실행한다.

```sh
node src/maps/radar.mjs
npx dbs validate scenario.yaml
npx dbs preview scenario.yaml
```

영상 파일이 필요한 경우 작품 폴더에서 `npx dbs render scenario.yaml --out output/film.mp4`를 실행한다. `src/maps/radar.mjs`가 `output/maps/`에 합성 레이더 격자 여섯 장을 만든다. 격자는 자체 제작 CC0이며 실제 관측값과 무관하다. 영상, 생성 자산과 출처 파일은 `output/`에 둔다.
