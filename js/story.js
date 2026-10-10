/* Full-screen photo story, played with the background music. */
(() => {
  "use strict";
  const photos = CONFIG.story?.photos || [];
  const dialog = document.getElementById("story");
  const launch = document.getElementById("story-launch");
  if (!dialog || !launch || !photos.length) {
    if (launch) launch.hidden = true;
    return;
  }
  const bgm = document.getElementById("bgm");
  const slides = document.getElementById("story-slides");
  const progress = document.getElementById("story-progress");
  const pause = document.getElementById("story-pause");
  const sound = document.getElementById("story-sound");
  const prev = document.getElementById("story-prev");
  const next = document.getElementById("story-next");
  const status = document.getElementById("story-status");
  const text = (kr, en) => document.documentElement.lang === "en" ? en : kr;
  const duration = Math.max(1000, Number(CONFIG.story.slideDuration) || 5000);
  document.getElementById("story-cover").src = CONFIG.story.cover || photos[0].src;
  let index = 0, elapsed = 0, last = 0, frame = 0;
  let playing = false, ended = false, audioFailed = false;
  let originalOverflow;

  const items = photos.map((photo) => {
    const slide = document.createElement("div");
    slide.className = "story__slide";
    const blur = document.createElement("div");
    blur.className = "story__blur";
    const img = document.createElement("img");
    img.alt = photo.alt || "Wedding photo";
    img.decoding = "async";
    slide.append(blur, img);
    slides.append(slide);
    const track = document.createElement("div");
    track.className = "story__track";
    const fill = document.createElement("span");
    fill.className = "story__fill";
    track.append(fill);
    progress.append(track);
    const item = { slide, img, blur, fill, ready: false, failed: false };
    img.addEventListener("load", () => { item.ready = true; if (dialog.open) update(); });
    img.addEventListener("error", () => { item.ready = true; item.failed = true; if (dialog.open) update(); });
    return item;
  });

  function update() {
    pause.textContent = ended ? text("↻ 다시 보기", "↻ Replay") : playing ? text("Ⅱ 일시정지", "Ⅱ Pause") : text("▶ 재생", "▶ Play");
    sound.textContent = bgm.muted || audioFailed ? text("소리 켜기", "Sound on") : text("소리 끄기", "Sound off");
    sound.setAttribute("aria-pressed", String(!bgm.muted && !audioFailed));
    prev.disabled = index === 0;
    next.disabled = index === photos.length - 1;
    dialog.classList.toggle("is-paused", !playing);
    document.getElementById("story-caption").textContent = text(photos[index].caption, photos[index].caption_en) || "";
    document.getElementById("story-count").textContent = `${index + 1} / ${photos.length}`;
    status.textContent = !items[index].ready ? text("사진을 불러오는 중…", "Loading photo…")
      : items[index].failed ? text("사진을 불러올 수 없습니다. 다음 사진으로 이동해주세요.", "Photo unavailable. You can move to the next photo.")
      : audioFailed ? text("음악을 재생하려면 소리 켜기를 눌러주세요.", "Tap Sound on to try playing the music.")
      : ended ? text("함께해 주셔서 감사합니다.", "Thank you for being part of our story.") : "";
  }

  function playAudio() {
    audioFailed = false;
    const attempt = bgm.play();
    if (attempt) attempt.catch((error) => {
      // Pausing while audio is still loading intentionally aborts play().
      if (dialog.open && playing && error.name !== "AbortError") {
        audioFailed = true;
        update();
      }
    });
  }

  function paintProgress() {
    items.forEach((item, i) => {
      item.fill.style.transform = `scaleX(${i < index ? 1 : i === index ? Math.min(elapsed / duration, 1) : 0})`;
    });
  }

  function show(at) {
    index = Math.max(0, Math.min(photos.length - 1, at));
    elapsed = 0;
    last = 0;
    ended = false;
    items.forEach((item, i) => {
      item.slide.classList.toggle("is-active", i === index);
      item.slide.setAttribute("aria-hidden", String(i !== index));
      if (i === index) {
        item.img.style.animation = "none";
        void item.img.offsetWidth;
        item.img.style.animation = "";
      }
    });
    paintProgress();
    update();
  }

  function tick(now) {
    if (!dialog.open) return;
    if (playing && items[index].ready && last) elapsed += now - last;
    last = now;
    if (playing && elapsed >= duration) {
      if (index < photos.length - 1) show(index + 1);
      else { ended = true; playing = false; bgm.pause(); update(); }
    }
    paintProgress();
    frame = requestAnimationFrame(tick);
  }

  function togglePlayback() {
    if (ended) { show(0); playing = true; bgm.currentTime = 0; }
    else playing = !playing;
    last = 0;
    if (playing) playAudio(); else bgm.pause();
    update();
  }

  launch.addEventListener("click", () => {
    originalOverflow = document.body.style.overflow;
    bgm.muted = false;
    bgm.currentTime = 0;
    playing = true;
    audioFailed = false;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    items.forEach((item, i) => {
      if (!item.img.getAttribute("src")) {
        item.img.src = photos[i].src;
        item.blur.style.backgroundImage = `url(${JSON.stringify(photos[i].src)})`;
      }
    });
    show(0);
    playAudio();
    frame = requestAnimationFrame(tick);
  });
  document.getElementById("story-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    cancelAnimationFrame(frame);
    playing = false;
    bgm.pause();
    document.body.style.overflow = originalOverflow;
    launch.focus({ preventScroll: true });
  });
  pause.addEventListener("click", togglePlayback);
  sound.addEventListener("click", () => {
    if (audioFailed) { bgm.muted = false; if (playing) playAudio(); else audioFailed = false; }
    else bgm.muted = !bgm.muted;
    update();
  });
  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); if (!next.disabled) show(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); if (!prev.disabled) show(index - 1); }
    if (event.code === "Space" && event.target.tagName !== "BUTTON") { event.preventDefault(); togglePlayback(); }
  });
  let touch;
  dialog.addEventListener("touchstart", (event) => {
    if (event.target.closest("button")) { touch = null; return; }
    touch = event.changedTouches[0];
  }, { passive: true });
  dialog.addEventListener("touchend", (event) => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch.clientX;
    const dy = event.changedTouches[0].clientY - touch.clientY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && !next.disabled) show(index + 1);
      if (dx > 0 && !prev.disabled) show(index - 1);
    }
    touch = null;
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && dialog.open && playing) { playing = false; bgm.pause(); last = 0; update(); }
  });
})();
