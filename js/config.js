/**
 * ============================================================
 *  청첩장 설정 파일 (Wedding Invitation Config)
 *  이 파일의 값만 바꾸면 대부분의 내용이 자동으로 반영됩니다.
 * ============================================================
 */
const CONFIG = {
  // 갤러리와 "우리의 이야기" 슬라이드에 함께 쓰이는 사진 목록입니다.
  // caption / caption_en 을 추가하면 슬라이드에 문구가 표시됩니다.
  story: {
    slideDuration: 5000,
    // 갤러리의 "우리의 이야기" 버튼 배경 사진
    cover: "images/photos/16.jpg",
    photos: [
      { src: "images/photos/01.jpg", thumb: "images/photos/thumbs/01.jpg" },
      { src: "images/photos/02.jpg", thumb: "images/photos/thumbs/02.jpg" },
      { src: "images/photos/03.jpg", thumb: "images/photos/thumbs/03.jpg" },
      { src: "images/photos/04.jpg", thumb: "images/photos/thumbs/04.jpg" },
      { src: "images/photos/05.jpg", thumb: "images/photos/thumbs/05.jpg" },
      { src: "images/photos/06.jpg", thumb: "images/photos/thumbs/06.jpg" },
      { src: "images/photos/07.jpg", thumb: "images/photos/thumbs/07.jpg" },
      { src: "images/photos/08.jpg", thumb: "images/photos/thumbs/08.jpg" },
      { src: "images/photos/09.jpg", thumb: "images/photos/thumbs/09.jpg" },
      { src: "images/photos/10.jpg", thumb: "images/photos/thumbs/10.jpg" },
      { src: "images/photos/11.jpg", thumb: "images/photos/thumbs/11.jpg" },
      { src: "images/photos/12.jpg", thumb: "images/photos/thumbs/12.jpg" },
      { src: "images/photos/13.jpg", thumb: "images/photos/thumbs/13.jpg" },
      { src: "images/photos/14.jpg", thumb: "images/photos/thumbs/14.jpg" },
      { src: "images/photos/15.jpg", thumb: "images/photos/thumbs/15.jpg" },
      { src: "images/photos/16.jpg", thumb: "images/photos/thumbs/16.jpg" },
      { src: "images/photos/17.jpg", thumb: "images/photos/thumbs/17.jpg" },
      { src: "images/photos/18.jpg", thumb: "images/photos/thumbs/18.jpg" },
    ],
  },
  // 신랑 / 신부
  groom: {
    nameKr: "문한철",
    nameEn: "HAN CHEOL MOON",
    father: "문영진",
    mother: "김명순",
    father_en: "Mr. Moon",
    mother_en: "Mrs. Kim",
    orderLabel: "장남", // 장남/차남/막내 등
    orderLabel_en: "eldest son",
  },
  bride: {
    nameKr: "송민정",
    nameEn: "MIN JEONG SONG",
    father: "송대규",
    mother: "이정희",
    father_en: "Mr. Song",
    mother_en: "Mrs. Lee",
    orderLabel: "차녀",
    orderLabel_en: "second daughter",
  },

  // 예식 일시 (ISO 형식, 24시간제)
  weddingDateISO: "2026-11-21T12:30:00+09:00",
  weddingDateDisplay: "2026년 11월 21일 토요일 오후 12시 30분",
  weddingDateDisplay_en: "Saturday, November 21, 2026 · 12:30 PM",

  // 예식장
  venue: {
    name: "한강성당",
    name_en: "Hangang Catholic Church",
    address: "서울특별시 용산구 이촌로81길 38",
    address_en: "38 Ichon-ro 81-gil, Yongsan-gu, Seoul",
    tel: "02-796-1847",
    // 구글맵 임베드용 검색어 (주소나 장소명을 그대로 넣으면 됩니다)
    mapQuery: "서울특별시 용산구 이촌로81길 38 한강성당",
    // "네이버 지도에서 보기" 버튼에 쓸 네이버 장소 ID (map.naver.com 장소 주소의 숫자).
    // 앱 실행 링크(naver.me 등)는 앱이 없는 휴대폰의 카카오톡 등에서 "웹페이지를 열 수 없음" 오류가 나므로
    // 항상 모바일 웹 지도로 연결합니다. 비워두면 구글 지도 검색으로 연결됩니다.
    naverPlaceId: "12926675",
    // 실제 좌표를 알면 정확도가 올라갑니다 (선택)
    lat: 37.5206806,
    lng: 126.9778714,
    transit: {
      subway: "4호선 이촌역 3-1번 출구 / 경의중앙선 이촌역 4번 출구",
      subway_en: "Line 4 Ichon Stn. Exit 3-1 / Gyeongui-Jungang Line Exit 4",
      parking: "차량으로 오시는 경우 근처 공영 주차장을 이용해 주세요.",
      parking_en: "If you are driving, please use one of the nearby public parking lots.",
    },
    // 근처 공영 주차장 안내 — 필요 없는 항목은 배열에서 지워도 됩니다
    parkingLots: [
      {
        name: "이촌 한강공원 공영주차장",
        name_en: "Ichon Hangang Park Public Parking",
        walk: "도보 15분",
        walk_en: "15-min walk",
        fee: "60분 1,600원",
        fee_en: "₩1,600 / 60 min",
        address: "서울특별시 용산구 서빙고로62길 5-486",
        address_en: "5-486 Seobinggo-ro 62-gil, Yongsan-gu, Seoul",
      },
      {
        name: "국립중앙박물관 주차장",
        name_en: "National Museum of Korea Parking",
        walk: "도보 15분",
        walk_en: "15-min walk",
        fee: "60분 2,000원",
        fee_en: "₩2,000 / 60 min",
        address: "서울특별시 용산구 서빙고로 137 국립중앙박물관",
        address_en: "137 Seobinggo-ro, Yongsan-gu, Seoul",
      },
      {
        name: "동작대교 공영주차장",
        name_en: "Dongjak Bridge Public Parking",
        walk: "도보 12분",
        walk_en: "12-min walk",
        fee: "60분 1,440원",
        fee_en: "₩1,440 / 60 min",
        address: "서울특별시 용산구 이촌로 343-20",
        address_en: "343-20 Ichon-ro, Yongsan-gu, Seoul",
      },
    ],
    // 가장 가까운 출구에서 성당까지 도보 안내
    walk: {
      fromName: "이촌역 3-1번 출구",
      fromName_en: "Ichon Stn. Exit 3-1",
      fromLat: 37.5226689,
      fromLng: 126.9739086,
      summary: "가장 가까운 3-1번 출구에서 성당까지 도보 약 5분",
      summary_en: "About a 5-minute walk to the church from Exit 3-1, the closest exit",
      // 실제로 걸어보고 눈에 띄는 건물·표지를 순서대로 적어주세요 (비워두면 표시되지 않습니다)
      steps: [],
      steps_en: [],
    },
  },

  // 마음 전하실 곳 (계좌번호) — 필요 없는 항목은 배열에서 지워도 됩니다
	//
  accounts: {
    groomSide: [
      { role: "신랑", bank: "하나은행", number: "556-910243-76107", holder: "문한철" },
      { role: "신랑 아버지", bank: "하나은행", number: "187-890576-48607", holder: "문영진" },
    ],
    brideSide: [
      { role: "신부", bank: "신한은행", number: "110-385-458783", holder: "송민정" },
      { role: "신부 아버지", bank: "하나은행", number: "426-910103-10507", holder: "송대규" },
      { role: "신부 어머니", bank: "신한은행", number: "110-011-450045", holder: "이정희" },
    ],
  },

  // 공유 (링크 미리보기, 카카오톡 공유 등)
  share: {
    title: "문한철 ♥ 송민정 결혼합니다",
    title_en: "Han Cheol Moon ♥ Minjeong Song's Wedding",
    description: "2026년 11월 21일 토요일 오후 12시 30분, 한강성당",
    description_en: "Saturday, November 21, 2026 · 12:30 PM, Hangang Catholic Church",
    // GitHub Pages 배포 후 실제 주소로 바꿔주세요
    url: "https://weddinghan1121-bot.github.io/wedding-card/",
    // 카카오 공유를 쓰려면 https://developers.kakao.com 에서 발급받은 JS 키를 입력하세요
    kakaoJsKey: "",
  },

  // RSVP(참석 여부) 제출을 실제로 수신하려면 Formspree(https://formspree.io) 등에서
  // 무료 엔드포인트를 발급받아 아래에 입력하세요. 비워두면 이 브라우저에만 저장되는
  // 미리보기 모드로 동작합니다 (다른 사람 응답은 볼 수 없습니다).
  rsvpEndpoint: "",
};
