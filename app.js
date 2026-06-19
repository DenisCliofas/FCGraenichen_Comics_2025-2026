// Replace white background fills by StPageFlip with black
(function () {
  const origFill = CanvasRenderingContext2D.prototype.fillRect;
  CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
    const s = this.fillStyle;
    if (typeof s === 'string') {
      const n = s.replace(/\s/g, '').toLowerCase();
      if (n === 'white' || n === '#fff' || n === '#ffffff' || n === 'rgb(255,255,255)') {
        const prev = this.fillStyle;
        this.fillStyle = '#111214';
        origFill.call(this, x, y, w, h);
        this.fillStyle = prev;
        return;
      }
    }
    origFill.call(this, x, y, w, h);
  };
})();

const pageFlip = new St.PageFlip(document.getElementById('book'), {
  width: 420,
  height: 595,
  size: 'stretch',
  minWidth: 200,
  maxWidth: 600,
  minHeight: 285,
  maxHeight: 850,
  drawShadow: false,
  flippingTime: 800,
  usePortrait: true,
  autoSize: false,
  maxShadowOpacity: 0.6,
  showCover: true,
  mobileScrollSupport: false,
});

pageFlip.loadFromImages([
  'content/Cover.png',
  'content/Page1.png',
  'content/Page2.png',
  'content/Page3.png',
  'content/Page4.png',
  'content/Page5.png',
  'content/Page6.png',
  'content/Page7.png',
  'content/Page8.png',
  'content/Page9.png',
  'content/Page10.png',
  'content/Page11.png',
  'content/Page12.png',
  'content/Page13.png',
  'content/Page14.png',
  'content/Page15.png',
  'content/Page16.png',
  'content/Page17.png',
  'content/Page18.png',
  'content/Page19.png',
  'content/Page20.png',
  'content/Page21.png',
  'content/Page22.png',
  'content/Page23.png',
  'content/Page24.png',
  'content/Page25.png',
  'content/Page26.png',
  'content/Page27.png',
  'content/Page28.png',
]);

// Block hover corner preview: suppress mousemove when no button is held
document.getElementById('book').addEventListener('mousemove', (e) => {
  if (e.buttons === 0) e.stopPropagation();
}, true);

function updateCoverClass() {
  const isCover = pageFlip.getCurrentPageIndex() === 0;
  document.getElementById('book').classList.toggle('is-cover', isCover);
}

pageFlip.on('init', updateCoverClass);
pageFlip.on('flip', updateCoverClass);

// ── Zoom & pan (touch + desktop) ─────────────────────────────────────────────
(function () {
  const bookEl = document.getElementById('book');
  const overlay = document.getElementById('zoom-overlay');

  // Must match the loadFromImages order exactly
  const images = [
    'content/Cover.png','content/Page1.png','content/Page2.png',
    'content/Page3.png','content/Page4.png','content/Page5.png',
    'content/Page6.png','content/Page7.png','content/Page8.png',
    'content/Page9.png','content/Page10.png','content/Page11.png',
    'content/Page12.png','content/Page13.png','content/Page14.png',
    'content/Page15.png','content/Page16.png','content/Page17.png',
    'content/Page18.png','content/Page19.png','content/Page20.png',
    'content/Page21.png','content/Page22.png','content/Page23.png',
    'content/Page24.png','content/Page25.png','content/Page26.png',
    'content/Page27.png','content/Page28.png',
  ];

  let scale = 1, panX = 0, panY = 0;
  let pinchDist0 = 0, scale0 = 1;
  let panX0 = 0, panY0 = 0;
  let lastTap = 0;
  let touchActive = false;
  let mouseDown = false;

  function currentPageSrc() {
    return images[pageFlip.getCurrentPageIndex()] || images[0];
  }

  function commitZoom(animated) {
    if (scale > 1.01) {
      overlay.src = currentPageSrc();
      overlay.style.display = 'block';
      overlay.style.pointerEvents = 'auto';
      overlay.style.transition = animated ? 'transform 0.3s ease' : 'none';
      overlay.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`;
    } else {
      overlay.style.transition = animated ? 'transform 0.3s ease' : 'none';
      overlay.style.transform = 'translate(0,0) scale(1)';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => { overlay.style.display = 'none'; }, animated ? 300 : 0);
    }
  }

  function clampPan() {
    const mx = ((scale - 1) * window.innerWidth) / 2;
    const my = ((scale - 1) * window.innerHeight) / 2;
    panX = Math.max(-mx, Math.min(mx, panX));
    panY = Math.max(-my, Math.min(my, panY));
  }

  function resetZoom(animated) {
    scale = 1; panX = 0; panY = 0;
    commitZoom(animated);
  }

  // ── Touch ──
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      touchActive = true;
      // Block StPageFlip from receiving any more touch events during pinch
      bookEl.style.pointerEvents = 'none';
      pinchDist0 = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale0 = scale;
      e.preventDefault(); e.stopImmediatePropagation();
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap < 280) {
        scale = scale > 1.01 ? 1 : 2.5;
        if (scale === 1) { panX = 0; panY = 0; }
        commitZoom(true);
        e.preventDefault(); e.stopImmediatePropagation();
        lastTap = 0; return;
      }
      lastTap = now;
      if (scale > 1.01) {
        touchActive = true;
        panX0 = e.touches[0].clientX - panX;
        panY0 = e.touches[0].clientY - panY;
        e.preventDefault(); e.stopImmediatePropagation();
      }
    }
  }

  function onTouchMove(e) {
    if (!touchActive) return;
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.max(1, Math.min(5, scale0 * (d / pinchDist0)));
      clampPan(); commitZoom(false);
      e.preventDefault(); e.stopImmediatePropagation();
    } else if (e.touches.length === 1 && scale > 1.01) {
      panX = e.touches[0].clientX - panX0;
      panY = e.touches[0].clientY - panY0;
      clampPan(); commitZoom(false);
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }

  function onTouchEnd(e) {
    if (e.touches.length === 1 && touchActive) {
      panX0 = e.touches[0].clientX - panX;
      panY0 = e.touches[0].clientY - panY;
    }
    if (e.touches.length === 0) {
      touchActive = false;
      bookEl.style.pointerEvents = '';  // restore StPageFlip touch handling
      if (scale < 1.05) resetZoom(true);
    }
  }

  // ── Mouse (desktop) ──
  function onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    scale = Math.max(1, Math.min(5, scale * factor));
    if (scale < 1.05) { resetZoom(true); return; }
    clampPan(); commitZoom(false);
  }

  function onMouseDown(e) {
    if (scale > 1.01) {
      mouseDown = true;
      panX0 = e.clientX - panX;
      panY0 = e.clientY - panY;
      overlay.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }

  function onMouseMove(e) {
    if (!mouseDown) return;
    panX = e.clientX - panX0;
    panY = e.clientY - panY0;
    clampPan(); commitZoom(false);
  }

  function onMouseUp() {
    mouseDown = false;
    overlay.style.cursor = scale > 1.01 ? 'grab' : 'default';
  }

  function onDblClick(e) {
    scale = scale > 1.01 ? 1 : 2.5;
    if (scale === 1) { panX = 0; panY = 0; }
    commitZoom(true);
    e.preventDefault();
  }

  // Reset zoom on page flip
  pageFlip.on('flip', () => { if (scale > 1) { bookEl.style.pointerEvents = ''; resetZoom(false); } });

  // Touch events
  document.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
  document.addEventListener('touchmove',  onTouchMove,  { passive: false, capture: true });
  document.addEventListener('touchend',   onTouchEnd,   { passive: true,  capture: true });

  // Mouse events — wheel on book, drag/dblclick on overlay
  bookEl.addEventListener('wheel',     onWheel,    { passive: false });
  overlay.addEventListener('wheel',    onWheel,    { passive: false });
  overlay.addEventListener('mousedown', onMouseDown);
  overlay.addEventListener('dblclick',  onDblClick);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup',   onMouseUp);
})();
