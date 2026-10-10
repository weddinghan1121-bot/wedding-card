/**
 * 청첩장 동작 스크립트
 * CONFIG 객체(js/config.js)의 값을 화면에 반영하고
 * 카운트다운, 갤러리, 지도, RSVP, 방명록, 공유 기능을 담당합니다.
 */
(function () {
  "use strict";

  const weddingDate = new Date(CONFIG.weddingDateISO);

  /* ------------------------------------------------------------
     언어 상태 (KR / EN)
     ------------------------------------------------------------ */
  let lang = localStorage.getItem("weddingLang") || "kr";
  function t(kr, en) { return lang === "en" ? en : kr; }

  /* ------------------------------------------------------------
     사진 저장 방지 (우클릭 / 드래그)
     ------------------------------------------------------------ */
  const isPhoto = (target) => target instanceof Element && target.closest("img, .story__blur");
  document.addEventListener("contextmenu", (e) => { if (isPhoto(e.target)) e.preventDefault(); });
  document.addEventListener("dragstart", (e) => { if (isPhoto(e.target)) e.preventDefault(); });

  /* ------------------------------------------------------------
     텍스트 채우기
     ------------------------------------------------------------ */
  function fillText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // data-kr/data-en(/data-html)을 채워두면 applyLang()이 실제 렌더링을 담당합니다.
  function setBilingual(id, krValue, enValue, isHtml) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.kr = krValue;
    el.dataset.en = enValue;
    if (isHtml) el.dataset.html = "1";
  }

  setBilingual("hero-venue", CONFIG.venue.name, CONFIG.venue.name_en);
  fillText("hero-groom-en", CONFIG.groom.nameEn);
  fillText("hero-bride-en", CONFIG.bride.nameEn);
  fillText(
    "hero-date",
    weddingDate
      .toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" })
      .replace(/\//g, ". ") + " " + weddingDate.toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Seoul" }).toUpperCase() +
      " · " + weddingDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Seoul" })
  );

  setBilingual(
    "family-groom",
    `${CONFIG.groom.father} · ${CONFIG.groom.mother}의 ${CONFIG.groom.orderLabel} <strong>${CONFIG.groom.nameKr}</strong>`,
    `<strong>${CONFIG.groom.nameEn}</strong>, the ${CONFIG.groom.orderLabel_en} of ${CONFIG.groom.father_en} &amp; ${CONFIG.groom.mother_en}`,
    true
  );
  setBilingual(
    "family-bride",
    `${CONFIG.bride.father} · ${CONFIG.bride.mother}의 ${CONFIG.bride.orderLabel} <strong>${CONFIG.bride.nameKr}</strong>`,
    `<strong>${CONFIG.bride.nameEn}</strong>, the ${CONFIG.bride.orderLabel_en} of ${CONFIG.bride.father_en} &amp; ${CONFIG.bride.mother_en}`,
    true
  );

  setBilingual("wedding-date-display", CONFIG.weddingDateDisplay, CONFIG.weddingDateDisplay_en);
  setBilingual("venue-name", CONFIG.venue.name, CONFIG.venue.name_en);
  setBilingual("venue-address", CONFIG.venue.address, CONFIG.venue.address_en);
  setBilingual("transit-subway", CONFIG.venue.transit.subway, CONFIG.venue.transit.subway_en);
  setBilingual("transit-parking", CONFIG.venue.transit.parking, CONFIG.venue.transit.parking_en);

  /* ------------------------------------------------------------
     지도 (API 키 없이 동작하는 구글맵 임베드)
     ------------------------------------------------------------ */
  const mapFrame = document.getElementById("map-frame");
  const btnOpenMap = document.getElementById("btn-open-map");
  const mapQuery = encodeURIComponent(CONFIG.venue.mapQuery);
  // 구글 임베드 페이지를 직접 엽니다. 예전 주소(maps?q=...&output=embed)는 리디렉트를 거치는데,
  // 일부 휴대폰 브라우저에서 이 리디렉트가 ERR_BLOCKED_BY_RESPONSE 로 차단됩니다.
  if (mapFrame) {
    const query = new TextEncoder().encode(CONFIG.venue.mapQuery);
    const base64 = btoa(String.fromCharCode(...query)).replace(/=+$/, "");
    mapFrame.src = "https://www.google.com/maps/embed?origin=mfe&pb=" + encodeURIComponent("!1m2!2m1!1z" + base64);
  }
  // 네이버 링크는 모두 app=N(모바일 웹)으로 엽니다. 앱 실행 링크는 앱이 없는 휴대폰의
  // 카카오톡 등 인앱 브라우저에서 intent:// 로 넘어가며 "웹페이지를 열 수 없음" 오류가 납니다.
  const naverWebUrl = (params) => "https://m.map.naver.com/?" + new URLSearchParams({ ...params, app: "N" });
  if (btnOpenMap) {
    const placeId = CONFIG.venue.naverPlaceId;
    btnOpenMap.href = placeId
      ? naverWebUrl({ pinId: placeId, pinType: "site", menu: "location", id: placeId })
      : "https://www.google.com/maps/search/?api=1&query=" + mapQuery;
    const mapLink = document.getElementById("map-link");
    if (mapLink) mapLink.href = btnOpenMap.href;
  }

  /* ------------------------------------------------------------
     가까운 출구 → 성당 도보 안내
     (구글 지도는 국내 도보 길찾기를 제공하지 않아 네이버/카카오로 연결합니다)
     ------------------------------------------------------------ */
  const walk = CONFIG.venue.walk;
  if (walk) {
    setBilingual("transit-walk", walk.summary, walk.summary_en);

    const btnWalkNaver = document.getElementById("btn-walk-naver");
    if (btnWalkNaver) {
      // routeType 4 / pathType 3 = 도보 경로
      btnWalkNaver.href = naverWebUrl({
        slng: walk.fromLng, slat: walk.fromLat, sText: walk.fromName,
        elng: CONFIG.venue.lng, elat: CONFIG.venue.lat, eText: CONFIG.venue.name,
        menu: "route", routeType: 4, pathType: 3,
      });
    }
  }

  function renderWalkSteps() {
    const ol = document.getElementById("walk-steps");
    if (!ol || !walk) return;
    const steps = (lang === "en" ? walk.steps_en : walk.steps) || [];
    ol.innerHTML = steps.map((step) => "<li>" + step + "</li>").join("");
    ol.hidden = steps.length === 0;
  }

  function renderParkingLots() {
    const ol = document.getElementById("parking-lots");
    if (!ol) return;
    const lots = CONFIG.venue.parkingLots || [];
    ol.innerHTML = lots
      .map((lot) => {
        const en = lang === "en";
        return (
          '<li><strong>' + (en ? lot.name_en : lot.name) + '</strong>' +
          '<span class="parking-lots__meta">' + (en ? lot.walk_en : lot.walk) + ' · ' + (en ? lot.fee_en : lot.fee) + '</span>' +
          '<span class="parking-lots__addr">' + (en ? lot.address_en : lot.address) + '</span></li>'
        );
      })
      .join("");
    ol.hidden = lots.length === 0;
  }

  const btnCopyAddress = document.getElementById("btn-copy-address");
  if (btnCopyAddress) {
    btnCopyAddress.addEventListener("click", () =>
      copyToClipboard(CONFIG.venue.address, btnCopyAddress, t("주소 복사", "Copy Address"), t("복사됨 ✓", "Copied ✓"))
    );
  }

  /* ------------------------------------------------------------
     클립보드 복사 헬퍼
     ------------------------------------------------------------ */
  function copyToClipboard(text, btn, originalLabel, doneLabel) {
    const done = () => {
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = doneLabel;
      setTimeout(() => (btn.textContent = originalLabel !== undefined ? originalLabel : prev), 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  }

  /* ------------------------------------------------------------
     미니 캘린더
     ------------------------------------------------------------ */
  function renderMiniCalendar() {
    const container = document.getElementById("mini-calendar");
    if (!container) return;
    const year = weddingDate.getFullYear();
    const month = weddingDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const dowNames = lang === "en" ? ["S", "M", "T", "W", "T", "F", "S"] : ["일", "월", "화", "수", "목", "금", "토"];
    let html = dowNames.map((d) => `<div class="mini-calendar__dow">${d}</div>`).join("");

    for (let i = 0; i < firstDow; i++) html += `<div class="mini-calendar__day"></div>`;
    for (let d = 1; d <= lastDate; d++) {
      const isTarget = d === weddingDate.getDate();
      html += `<div class="mini-calendar__day${isTarget ? " mini-calendar__day--target" : ""}">${d}</div>`;
    }
    container.innerHTML = html;
  }
  renderMiniCalendar();

  /* ------------------------------------------------------------
     디데이 카운트다운
     ------------------------------------------------------------ */
  function updateCountdown() {
    const now = new Date();
    const diff = weddingDate.getTime() - now.getTime();

    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-min");
    const sEl = document.getElementById("cd-sec");
    const caption = document.getElementById("countdown-caption");

    if (diff <= 0) {
      if (dEl) dEl.textContent = "00";
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";
      if (caption) caption.textContent = t("저희 결혼식 날입니다 🎉", "It's our wedding day! 🎉");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, "0");
    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(mins);
    if (sEl) sEl.textContent = pad(secs);
    if (caption) caption.textContent = t(`결혼식까지 D-${days}일`, `D-${days} until our wedding 🎉`);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------
     캘린더 저장 (.ics 다운로드)
     ------------------------------------------------------------ */
  const btnAddCalendar = document.getElementById("btn-add-calendar");
  if (btnAddCalendar) {
    btnAddCalendar.addEventListener("click", () => {
      const start = weddingDate;
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${CONFIG.groom.nameKr} ♥ ${CONFIG.bride.nameKr} 결혼식`,
        `LOCATION:${CONFIG.venue.name}, ${CONFIG.venue.address}`,
        `DESCRIPTION:${CONFIG.share.description}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wedding.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  /* ------------------------------------------------------------
     갤러리 + 라이트박스
     ------------------------------------------------------------ */
  const galleryPhotos = CONFIG.story?.photos || [];
  const GALLERY_COUNT = galleryPhotos.length;
  const gallery = document.getElementById("gallery");
  let currentIndex = 0;

  if (gallery) {
    gallery.innerHTML = galleryPhotos.map((photo, i) => `
        <button type="button" class="gallery__item" data-index="${i}" aria-label="${t("사진", "Photo")} ${i + 1}">
          <img src="${photo.thumb || photo.src}" alt="" loading="lazy" decoding="async" />
        </button>`).join("");

    gallery.querySelectorAll(".gallery__item").forEach((btn) => {
      btn.addEventListener("click", () => openLightbox(Number(btn.dataset.index)));
    });
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");

  function openLightbox(index) {
    currentIndex = index;
    renderLightboxImage();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function renderLightboxImage() {
    if (lightboxImage) {
      lightboxImage.src = galleryPhotos[currentIndex].src;
      lightboxImage.alt = `${t("사진", "Photo")} ${currentIndex + 1} / ${GALLERY_COUNT}`;
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % GALLERY_COUNT;
    renderLightboxImage();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + GALLERY_COUNT) % GALLERY_COUNT;
    renderLightboxImage();
  }

  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxPrev = document.getElementById("lightbox-prev");
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener("click", showNext);
  if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // 스와이프 제스처
    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (dx > 40) showPrev();
      else if (dx < -40) showNext();
    }, { passive: true });
  }

  document.addEventListener("keydown", (e) => {
    if (lightbox && !lightbox.hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    }
  });

  /* ------------------------------------------------------------
     계좌번호
     ------------------------------------------------------------ */
  function renderAccounts(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = list
      .map(
        (acc, i) => `
        <div class="account-item">
          <div class="account-item__info">
            <div class="account-item__role">${acc.holder} · ${acc.bank}</div>
            <div class="account-item__number">${acc.number}</div>
          </div>
          <button type="button" class="btn btn--small" data-copy-index="${i}">${t("복사", "Copy")}</button>
        </div>`
      )
      .join("");

    container.querySelectorAll("[data-copy-index]").forEach((btn) => {
      const acc = list[Number(btn.dataset.copyIndex)];
      btn.addEventListener("click", () =>
        copyToClipboard(acc.number.replace(/-/g, ""), btn, t("복사", "Copy"), t("복사됨 ✓", "Copied ✓"))
      );
    });
  }
  renderAccounts("account-groom", CONFIG.accounts.groomSide);
  renderAccounts("account-bride", CONFIG.accounts.brideSide);

  /* ------------------------------------------------------------
     RSVP
     ------------------------------------------------------------ */
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpNote = document.getElementById("rsvp-note");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(rsvpForm).entries());
      data.submittedAt = new Date().toISOString();

      if (CONFIG.rsvpEndpoint) {
        try {
          await fetch(CONFIG.rsvpEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data),
          });
          rsvpNote.textContent = "제출되었습니다. 감사합니다 🤍";
          rsvpForm.reset();
        } catch (err) {
          rsvpNote.textContent = "전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
        }
      } else {
        // 데모 모드: 이 브라우저에만 저장됩니다.
        const list = JSON.parse(localStorage.getItem("rsvpList") || "[]");
        list.push(data);
        localStorage.setItem("rsvpList", JSON.stringify(list));
        rsvpNote.textContent = "제출되었습니다 (미리보기 모드 · 이 기기에만 저장됨)";
        rsvpForm.reset();
      }
    });
  }

  /* ------------------------------------------------------------
     방명록 (localStorage 기반 미리보기)
     ------------------------------------------------------------ */
  const GUESTBOOK_KEY = "guestbookList";
  const guestbookForm = document.getElementById("guestbook-form");
  const guestbookList = document.getElementById("guestbook-list");

  function loadGuestbook() {
    return JSON.parse(localStorage.getItem(GUESTBOOK_KEY) || "[]");
  }

  function saveGuestbook(list) {
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(list));
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderGuestbook() {
    if (!guestbookList) return;
    const list = loadGuestbook();
    if (list.length === 0) {
      guestbookList.innerHTML = `<li class="guestbook-empty">${t("가장 먼저 축하 메시지를 남겨보세요 🤍", "Be the first to leave a message 🤍")}</li>`;
      return;
    }
    guestbookList.innerHTML = list
      .slice()
      .reverse()
      .map(
        (item) => `
        <li class="guestbook-item">
          <div class="guestbook-item__head">
            <span class="guestbook-item__name">${escapeHtml(item.name)}</span>
            <span>${new Date(item.date).toLocaleDateString(lang === "en" ? "en-US" : "ko-KR")}</span>
          </div>
          <p class="guestbook-item__msg">${escapeHtml(item.message)}</p>
        </li>`
      )
      .join("");
  }
  renderGuestbook();

  if (guestbookForm) {
    guestbookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(guestbookForm).entries());
      if (!data.name || !data.message) return;
      const list = loadGuestbook();
      list.push({ name: data.name, message: data.message, date: new Date().toISOString() });
      saveGuestbook(list);
      guestbookForm.reset();
      renderGuestbook();
    });
  }

  /* ------------------------------------------------------------
     공유
     ------------------------------------------------------------ */
  const btnShare = document.getElementById("btn-share");
  const btnCopyLink = document.getElementById("btn-copy-link");

  if (btnShare) {
    btnShare.addEventListener("click", async () => {
      const shareData = {
        title: t(CONFIG.share.title, CONFIG.share.title_en || CONFIG.share.title),
        text: t(CONFIG.share.description, CONFIG.share.description_en || CONFIG.share.description),
        url: CONFIG.share.url || location.href,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (e) {
          // 사용자가 공유 창을 닫은 경우는 그대로 두고, 그 외 실패는 링크 복사로 대체합니다.
          if (e.name === "AbortError") return;
        }
      }
      copyToClipboard(shareData.url, btnShare, t("🔗 공유하기", "🔗 Share"), t("링크 복사됨 ✓", "Link copied ✓"));
    });
  }

  if (btnCopyLink) {
    btnCopyLink.addEventListener("click", () => {
      copyToClipboard(CONFIG.share.url || location.href, btnCopyLink, t("📋 링크 복사", "📋 Copy Link"), t("복사됨 ✓", "Copied ✓"));
    });
  }

  /* ------------------------------------------------------------
     떨어지는 꽃잎 효과
     ------------------------------------------------------------ */
  function initPetals() {
    const container = document.getElementById("petals");
    if (!container) return;
    const PETAL_COUNT = 14;
    let html = "";
    for (let i = 0; i < PETAL_COUNT; i++) {
      const x = (Math.random() * 100).toFixed(1);
      const size = (12 + Math.random() * 10).toFixed(1);
      const duration = (9 + Math.random() * 8).toFixed(1);
      const delay = (-Math.random() * duration).toFixed(1);
      const drift = (Math.random() * 100 - 50).toFixed(0);
      html += `<span class="petal" style="--x:${x}%; --size:${size}px; --duration:${duration}s; --delay:${delay}s; --drift:${drift}px;">🌼</span>`;
    }
    container.innerHTML = html;
  }
  initPetals();

  /* ------------------------------------------------------------
     언어 전환 (KR / EN)
     ------------------------------------------------------------ */
  function renderStaticLang() {
    document.querySelectorAll("[data-kr]").forEach((el) => {
      const val = lang === "en" ? (el.dataset.en ?? el.dataset.kr) : el.dataset.kr;
      if (el.dataset.html === "1") el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll("[data-placeholder-kr]").forEach((el) => {
      el.placeholder = lang === "en" ? (el.dataset.placeholderEn ?? el.dataset.placeholderKr) : el.dataset.placeholderKr;
    });
  }

  function updateLangButtons() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.langBtn === lang);
    });
  }

  function applyLang(newLang) {
    lang = newLang;
    document.documentElement.lang = lang === "en" ? "en" : "ko";
    localStorage.setItem("weddingLang", lang);
    renderStaticLang();
    renderWalkSteps();
    renderParkingLots();
    renderMiniCalendar();
    updateCountdown();
    renderAccounts("account-groom", CONFIG.accounts.groomSide);
    renderAccounts("account-bride", CONFIG.accounts.brideSide);
    renderGuestbook();
    updateLangButtons();
  }

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.langBtn));
  });

  applyLang(lang);
})();
