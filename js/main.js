(function() {
  'use strict';

  /* ═══════════════════════════════════════
     Configuration
     ═══════════════════════════════════════ */
  const ANNIVERSARY = new Date(2023, 5, 5); // June 5, 2023 (month is 0-indexed)
  const EASTER_CLICKS = 5;

  /* ═══════════════════════════════════════
     Floating elements in hero
     ═══════════════════════════════════════ */
  function createFloatingEls() {
    const container = document.getElementById('floatingEls');
    if (!container) return;
    const emojis = ['💕', '🌟', '✨', '💖', '🎀', '🌸', '🦋', '💫', '🍀', '🎈', '💝', '⭐', '🌺', '💗', '🫧'];
    const count = 22;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'floating-el';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 94 + '%';
      el.style.top = Math.random() * 90 + '%';
      el.style.setProperty('--dur', (3 + Math.random() * 5) + 's');
      el.style.setProperty('--delay', (Math.random() * 4) + 's');
      el.style.fontSize = (18 + Math.random() * 24) + 'px';
      frag.appendChild(el);
    }
    container.appendChild(frag);
  }

  /* ═══════════════════════════════════════
     Day counter
     ═══════════════════════════════════════ */
  function updateCounter() {
    const el = document.getElementById('dayCount');
    if (!el) return;
    const now = new Date();
    const diffMs = now - ANNIVERSARY;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    // Animate number
    animateNumber(el, days);
  }

  function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    const diff = target - current;
    const duration = Math.min(1200, Math.abs(diff) * 15);
    const start = performance.now();

    function step(ts) {
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = Math.round(current + diff * eased);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
    }

    if (diff !== 0) requestAnimationFrame(step);
    else el.textContent = target;
  }

  function createHearts() {
    const container = document.getElementById('counterHearts');
    if (!container) return;
    const hearts = ['❤️','💕','💖','💗','💝','💘','💞','🩷','💓','🫶'];
    const n = 8;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'counter-heart';
      h.textContent = hearts[i % hearts.length];
      h.style.animationDelay = (i * 0.08) + 's';
      frag.appendChild(h);
    }
    container.appendChild(frag);
  }

  /* ═══════════════════════════════════════
     Photo Gallery
     ═══════════════════════════════════════ */
  async function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    const emptyEl = document.getElementById('galleryEmpty');
    if (!grid) return;

    let photos = [];
    try {
      const resp = await fetch('photos/photos.json');
      if (resp.ok) photos = await resp.json();
    } catch (_) {
      // No photos yet, show empty state
    }

    if (!photos.length) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    photos.forEach((photo, idx) => {
      const item = document.createElement('div');
      item.className = 'polaroid reveal';
      item.innerHTML = `
        <div class="polaroid-pin"></div>
        <img class="polaroid-img" src="photos/${photo.src}" alt="${photo.title || ''}">
        <div class="polaroid-caption">
          ${photo.title || ''}
          ${photo.date ? `<span class="polaroid-date">${photo.date}</span>` : ''}
        </div>
      `;
      item.addEventListener('click', () => openLightbox(photo, idx, photos));
      grid.appendChild(item);
    });
  }

  /* ═══════════════════════════════════════
     Lightbox
     ═══════════════════════════════════════ */
  let currentPhotos = [];

  function openLightbox(photo, idx, allPhotos) {
    currentPhotos = allPhotos;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    if (!lb || !img) return;
    img.src = 'photos/' + photo.src;
    img.setAttribute('data-idx', idx);
    caption.textContent = photo.title || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.getElementById('lightboxBg')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ═══════════════════════════════════════
     Video Gallery
     ═══════════════════════════════════════ */
  async function loadVideos() {
    const grid = document.getElementById('videoGrid');
    const emptyEl = document.getElementById('videoEmpty');
    if (!grid) return;

    let videos = [];
    try {
      const resp = await fetch('videos/videos.json');
      if (resp.ok) videos = await resp.json();
    } catch (_) {}

    if (!videos.length) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    videos.forEach(video => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <video controls preload="metadata"
          ${video.poster ? `poster="videos/${video.poster}"` : ''}>
          <source src="videos/${video.src}" type="video/mp4">
          您的浏览器不支持视频播放
        </video>
        <div class="video-info">
          <div class="video-title">${video.title || ''}</div>
          ${video.date ? `<div class="video-date">${video.date}</div>` : ''}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* ═══════════════════════════════════════
     Easter egg: mini pixel character
     ═══════════════════════════════════════ */
  let easterClicks = 0;

  function drawMiniChar() {
    const canvas = document.getElementById('miniChar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 32, H = 48;

    // Simple pixel character (small version of the original)
    const pixels = [
      // Hair spikes
      [14,0,'#111'],[15,0,'#111'],[16,0,'#111'], [17,0,'#111'],[18,0,'#111'],
      [13,1,'#111'],[19,1,'#111'],
      // Head
      [10,2,'#F2CAA0'],[11,2,'#F2CAA0'],[12,2,'#F2CAA0'],[13,2,'#F2CAA0'],[14,2,'#F2CAA0'],
      [15,2,'#F2CAA0'],[16,2,'#F2CAA0'],[17,2,'#F2CAA0'],[18,2,'#F2CAA0'],[19,2,'#F2CAA0'],
      [20,2,'#F2CAA0'],[21,2,'#F2CAA0'],
      [9,3,'#F2CAA0'],[10,3,'#F2CAA0'],[11,3,'#FFE8CC'],[12,3,'#F2CAA0'],[13,3,'#F2CAA0'],
      [14,3,'#F2CAA0'],[15,3,'#F2CAA0'],[16,3,'#F2CAA0'],[17,3,'#F2CAA0'],[18,3,'#F2CAA0'],
      [19,3,'#FFE8CC'],[20,3,'#F2CAA0'],[21,3,'#F2CAA0'],[22,3,'#F2CAA0'],
      [8,4,'#F2CAA0'],[9,4,'#F2CAA0'],[10,4,'#F2CAA0'],[11,4,'#F2CAA0'],[12,4,'#F2CAA0'],
      [13,4,'#F2CAA0'],[14,4,'#F2CAA0'],[15,4,'#F2CAA0'],[16,4,'#F2CAA0'],[17,4,'#F2CAA0'],
      [18,4,'#F2CAA0'],[19,4,'#F2CAA0'],[20,4,'#F2CAA0'],[21,4,'#F2CAA0'],[22,4,'#F2CAA0'],[23,4,'#F2CAA0'],
      // Hair sides
      [7,5,'#111'],[8,5,'#111'],[23,5,'#111'],[24,5,'#111'],
      [7,6,'#111'],[8,6,'#111'],[9,6,'#111'],[23,6,'#111'],[24,6,'#111'],
      [8,7,'#111'],[9,7,'#111'],[22,7,'#111'],[23,7,'#111'],
      // Face
      [9,5,'#F2CAA0'],[10,5,'#F2CAA0'],[11,5,'#F2CAA0'],[12,5,'#F2CAA0'],[13,5,'#F2CAA0'],
      [14,5,'#F2CAA0'],[15,5,'#F2CAA0'],[16,5,'#F2CAA0'],[17,5,'#F2CAA0'],[18,5,'#F2CAA0'],
      [19,5,'#F2CAA0'],[20,5,'#F2CAA0'],[21,5,'#F2CAA0'],[22,5,'#F2CAA0'],
      // (etc - simplified face)
      [10,6,'#F2CAA0'],[11,6,'#F2CAA0'],[12,6,'#F2CAA0'],[13,6,'#F2CAA0'],[14,6,'#F2CAA0'],
      [15,6,'#F2CAA0'],[16,6,'#F2CAA0'],[17,6,'#F2CAA0'],[18,6,'#F2CAA0'],[19,6,'#F2CAA0'],
      [20,6,'#F2CAA0'],[21,6,'#F2CAA0'],
      // Glasses
      [10,7,'#080808'],[11,7,'#080808'],[12,7,'#080808'],[13,7,'#080808'],
      [18,7,'#080808'],[19,7,'#080808'],[20,7,'#080808'],[21,7,'#080808'],
      [14,8,'#080808'],[15,8,'#080808'],[16,8,'#080808'],[17,8,'#080808'],
      // Eyes (smile)
      [11,8,'#111'],[12,8,'#111'],[18,8,'#111'],[19,8,'#111'],
      // Smile
      [13,9,'#6B3030'],[14,9,'#6B3030'],[17,9,'#6B3030'],[18,9,'#6B3030'],
      [14,10,'#6B3030'],[15,10,'#6B3030'],[16,10,'#6B3030'],[17,10,'#6B3030'],
      // Body (gray T-shirt)
      [11,11,'#7A7A7A'],[12,11,'#7A7A7A'],[13,11,'#7A7A7A'],[14,11,'#7A7A7A'],
      [15,11,'#7A7A7A'],[16,11,'#7A7A7A'],[17,11,'#7A7A7A'],[18,11,'#7A7A7A'],
      [19,11,'#7A7A7A'],[20,11,'#7A7A7A'],
      [10,12,'#7A7A7A'],[11,12,'#949494'],[12,12,'#7A7A7A'],[13,12,'#7A7A7A'],
      [14,12,'#7A7A7A'],[15,12,'#7A7A7A'],[16,12,'#7A7A7A'],[17,12,'#7A7A7A'],
      [18,12,'#7A7A7A'],[19,12,'#7A7A7A'],[20,12,'#949494'],[21,12,'#7A7A7A'],
      [10,13,'#7A7A7A'],[11,13,'#7A7A7A'],[12,13,'#949494'],[13,13,'#7A7A7A'],
      [14,13,'#7A7A7A'],[15,13,'#7A7A7A'],[16,13,'#7A7A7A'],[17,13,'#7A7A7A'],
      [18,13,'#7A7A7A'],[19,13,'#949494'],[20,13,'#7A7A7A'],[21,13,'#7A7A7A'],
      // Legs / khaki pants
      [11,14,'#C4B898'],[12,14,'#C4B898'],[13,14,'#C4B898'],[14,14,'#C4B898'],
      [15,14,'#C4B898'],[16,14,'#C4B898'],[17,14,'#D8CEAE'],[18,14,'#C4B898'],
      [19,14,'#C4B898'],[20,14,'#C4B898'],
      [10,15,'#C4B898'],[11,15,'#D8CEAE'],[12,15,'#C4B898'],[13,15,'#C4B898'],
      [14,15,'#C4B898'],[15,15,'#C4B898'],[16,15,'#D8CEAE'],[17,15,'#C4B898'],
      [18,15,'#D8CEAE'],[19,15,'#C4B898'],[20,15,'#C4B898'],
    ];

    ctx.clearRect(0, 0, W, H);
    pixels.forEach(([x, y, color]) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  }

  function setupEasterEgg() {
    const char = document.getElementById('easterChar');
    const toast = document.getElementById('easterToast');
    const countEl = document.getElementById('easterCount');
    if (!char) return;

    char.addEventListener('click', () => {
      easterClicks++;
      if (easterClicks < EASTER_CLICKS && countEl) {
        countEl.textContent = `(${easterClicks}/${EASTER_CLICKS})`;
        countEl.style.color = '#ddd';
      }
      if (easterClicks >= EASTER_CLICKS) {
        if (toast) toast.classList.add('show');
        if (countEl) countEl.textContent = '';
        // Bounce animation
        char.style.animation = 'none';
        char.offsetHeight; // reflow
        char.style.animation = '';
      }
    });

    // Reset toast when leaving
    document.querySelector('.easter-toast a')?.addEventListener('click', (e) => {
      // Let the link work
    });
  }

  /* ═══════════════════════════════════════
     Scroll reveal animation
     ═══════════════════════════════════════ */
  function setupScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Add reveal class to sections
    const sections = document.querySelectorAll('.counter-card, .polaroid, .video-card');
    sections.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ═══════════════════════════════════════
     Init
     ═══════════════════════════════════════ */
  function init() {
    createFloatingEls();
    updateCounter();
    createHearts();
    loadGallery();
    loadVideos();
    drawMiniChar();
    setupEasterEgg();
    setupScrollReveal();

    // Update counter every minute (in case day ticks over)
    setInterval(updateCounter, 60000);
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
