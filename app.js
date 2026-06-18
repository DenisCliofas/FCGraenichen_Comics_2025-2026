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

// ── Mobile pinch-to-zoom & double-tap (touch devices only) ─────────────────
if ('ontouchstart' in window) {
  const bookEl = document.getElementById('book');

  let scale = 1, panX = 0, panY = 0;
  let pinchDist0 = 0, scale0 = 1;
  let panX0 = 0, panY0 = 0;
  let lastTap = 0;
  let active = false;

  function isPortrait() { return window.innerHeight > window.innerWidth; }

  function coverOffsetX() {
    if (isPortrait()) return 0;
    return bookEl.classList.contains('is-cover') ? -window.innerWidth * 0.25 : 0;
  }

  function commitZoom(animated) {
    bookEl.style.transition = animated ? 'transform 0.3s ease' : 'none';
    if (scale > 1.01) {
      bookEl.style.transform =
        `translate(${coverOffsetX() + panX}px, ${panY}px) scale(${scale})`;
    } else {
      bookEl.style.transform = '';
    }
  }

  function clampPan() {
    const mx = ((scale - 1) * window.innerWidth) / 2;
    const my = ((scale - 1) * window.innerHeight) / 2;
    panX = Math.max(-mx, Math.min(mx, panX));
    panY = Math.max(-my, Math.min(my, panY));
  }

  function onStart(e) {
    if (e.touches.length === 2) {
      active = true;
      pinchDist0 = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale0 = scale;
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap < 280) {
        scale = scale > 1.01 ? 1 : 2.5;
        if (scale === 1) { panX = 0; panY = 0; }
        commitZoom(true);
        e.preventDefault();
        e.stopImmediatePropagation();
        lastTap = 0;
        return;
      }
      lastTap = now;
      if (scale > 1.01) {
        active = true;
        panX0 = e.touches[0].clientX - panX;
        panY0 = e.touches[0].clientY - panY;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  }

  function onMove(e) {
    if (!active) return;
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.max(1, Math.min(5, scale0 * (d / pinchDist0)));
      clampPan();
      commitZoom(false);
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.touches.length === 1 && scale > 1.01) {
      panX = e.touches[0].clientX - panX0;
      panY = e.touches[0].clientY - panY0;
      clampPan();
      commitZoom(false);
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  function onEnd(e) {
    if (e.touches.length === 1 && active) {
      panX0 = e.touches[0].clientX - panX;
      panY0 = e.touches[0].clientY - panY;
    }
    if (e.touches.length === 0) {
      active = false;
      if (scale < 1.05) { scale = 1; panX = 0; panY = 0; commitZoom(true); }
    }
  }

  document.addEventListener('touchstart', onStart, { passive: false, capture: true });
  document.addEventListener('touchmove',  onMove,  { passive: false, capture: true });
  document.addEventListener('touchend',   onEnd,   { passive: true,  capture: true });
}
