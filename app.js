const book = document.querySelector("[data-book]");
const counter = document.querySelector("[data-counter]");
const dots = document.querySelector("[data-dots]");
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");
const templates = Array.from(document.querySelectorAll("[data-page-template]"));

const pageCount = templates.length;
const sheetCount = Math.ceil(pageCount / 2);
let currentSheet = 0;
let isAnimating = false;

function clonePage(index) {
  if (index < 0 || index >= pageCount) {
    const blank = document.createElement("article");
    blank.className = "page-art blank-page";
    blank.innerHTML = "<span>FC Gränichen</span>";
    return blank;
  }

  return templates[index].content.firstElementChild.cloneNode(true);
}

function makeFace(className, pageIndex) {
  const face = document.createElement("section");
  face.className = `page-face ${className}`;
  face.dataset.pageIndex = pageIndex;
  face.appendChild(clonePage(pageIndex));
  return face;
}

function buildBook() {
  book.innerHTML = "";

  for (let sheetIndex = 0; sheetIndex < sheetCount; sheetIndex += 1) {
    const sheet = document.createElement("article");
    sheet.className = "sheet";
    sheet.dataset.sheet = sheetIndex;
    sheet.style.setProperty("--sheet-depth", sheetCount - sheetIndex);

    const frontIndex = sheetIndex * 2;
    const backIndex = frontIndex + 1;

    sheet.appendChild(makeFace("front", frontIndex));
    sheet.appendChild(makeFace("back", backIndex));
    sheet.addEventListener("click", handleSheetClick);
    book.appendChild(sheet);
  }
}

function renderDots() {
  if (!dots) return;
  dots.innerHTML = "";

  for (let index = 0; index <= sheetCount; index += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Gehe zu Position ${index + 1}`);
    dot.addEventListener("click", () => goToSheet(index));
    dots.appendChild(dot);
  }
}

function labelForState() {
  if (currentSheet === 0) {
    return `Cover / ${pageCount}`;
  }

  const leftPage = currentSheet * 2;
  const rightPage = leftPage + 1;

  if (leftPage >= pageCount) {
    return `${pageCount} / ${pageCount}`;
  }

  return `${leftPage + 1}-${Math.min(rightPage + 1, pageCount)} / ${pageCount}`;
}

function updateBook() {
  const sheets = Array.from(book.querySelectorAll(".sheet"));

  sheets.forEach((sheet, index) => {
    const flipped = index < currentSheet;
    sheet.classList.toggle("is-flipped", flipped);
    sheet.style.zIndex = flipped ? index + 1 : sheetCount - index + 10;
  });

  Array.from(dots ? dots.children : []).forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentSheet);
  });

  book.classList.toggle("is-cover", currentSheet === 0);

  if (counter) counter.textContent = labelForState();
  if (prevButton) prevButton.disabled = isAnimating || currentSheet === 0;
  if (nextButton) nextButton.disabled = isAnimating || currentSheet === sheetCount;
}

function goToSheet(target) {
  const nextSheet = Math.max(0, Math.min(target, sheetCount));
  if (nextSheet === currentSheet || isAnimating) {
    return;
  }

  isAnimating = true;
  currentSheet = nextSheet;
  updateBook();

  window.setTimeout(() => {
    isAnimating = false;
    updateBook();
  }, 720);
}

function nextPage() {
  goToSheet(currentSheet + 1);
}

function previousPage() {
  goToSheet(currentSheet - 1);
}

function handleSheetClick(event) {
  const rect = book.getBoundingClientRect();
  const isRightHalf = event.clientX > rect.left + rect.width / 2;

  if (isRightHalf) {
    nextPage();
  } else {
    previousPage();
  }
}

if (prevButton) prevButton.addEventListener("click", previousPage);
if (nextButton) nextButton.addEventListener("click", nextPage);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    nextPage();
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    previousPage();
  }
});

buildBook();
renderDots();
updateBook();
