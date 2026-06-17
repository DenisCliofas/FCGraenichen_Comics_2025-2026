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
