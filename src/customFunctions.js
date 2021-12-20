function constrain(num, min, max) {
  const MIN = min
  const MAX = max
  const parsed = parseInt(num)
  return Math.min(Math.max(parsed, MIN), MAX)
}

function print(...args) {
  console.log(...args)
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function map(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function vhToPx(vh) {
  return window.innerHeight * (vh / 100)
}

function vwToPx(vw) {
  return window.innerWidth * (vw / 100)
}


function pxToVh(px) {
  return px * (100 / window.innerHeight)
}

function pxToVw(px) {
  return px * (100 / window.innerWidth)
}

function createDomElement(type, isDisplay, id, innerHtml, doc) {
  const dom = document.createElement(type);
  if (!isDisplay) {
    dom.style.display = "none"
  }
  dom.id = id

  dom.innerHTML = innerHtml
  doc.appendChild(dom)
}


function checkAccessRoute() {
  if (!sessionStorage.getItem("userId")) {
    window.location.href = 'https://greenverse.art/artworks/plastic-sarira/';
  } else {
    createDomElement("div", false, "userId", sessionStorage.getItem("userId"), document.body)
    createDomElement("div", false, "userName", sessionStorage.getItem("userName"), document.body)
  }
}

function reloadCss() {
  let links = document.getElementsByTagName("link");
  for (var cl in links) {
    var link = links[cl];
    if (link.rel === "stylesheet")
      link.href += "";
  }
}

function moveToTopWindow() {
  let input = document.querySelector("input")
  input.addEventListener("input", (event) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }, true)
}

function mapRange(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return this.constrain(newval, start2, stop2);
  } else {
    return this.constrain(newval, stop2, start2);
  }
};