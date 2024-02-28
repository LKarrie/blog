const topnav = document.querySelector("#topnav");
const tophaeder = document.querySelector("#tophaeder");
const toplogo = document.querySelector("#toplogo");
const toptext = document.querySelector("#toptext");

const hiddenElements = document.querySelectorAll(".cantsee");
const hiddenElements2 = document.querySelectorAll(".cantsee2");

/** scroll **/
const DIRECTION_ENUM = {
  DOWN: "down",
  UP: "up",
};

const threshold = 20;

let beforeScrollTop = 0;

function handleScroll() {
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
  var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

  let direction = DIRECTION_ENUM.DOWN;
  if (beforeScrollTop > scrollTop) {
    direction = DIRECTION_ENUM.UP;
  }

  if (direction == DIRECTION_ENUM.DOWN) {
    toplogo.classList.remove("opacity-0");
    toptext.classList.remove("opacity-0");
    topnav.classList.remove("opacity-0");
    topnav.classList.remove("translate-x-28");
    tophaeder.classList.remove("bg-opacity-0");
    tophaeder.classList.add("bg-opacity-80");
    if (scrollTop + clientHeight + threshold >= scrollHeight) {
      console.log("滚动触底");
    }
  } else {
    if (scrollTop <= threshold) {
      toplogo.classList.add("opacity-0");
      toptext.classList.add("opacity-0");
      topnav.classList.add("opacity-0");
      topnav.classList.add("translate-x-28");
      tophaeder.classList.remove("bg-opacity-80");
      tophaeder.classList.add("bg-opacity-0");
      console.log("滚动到顶部");
    }
  }

  beforeScrollTop = scrollTop;
}

const throttleHandleScroll = throttleDebounce.throttle(300, handleScroll);

window.addEventListener("scroll", throttleHandleScroll);

/** Cards**/
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove(".cantsee");
      entry.target.classList.add("cansee");
    } else {
      // do not anime again and again :）
      // entry.target.classList.add('cantsee')
      // entry.target.classList.remove('cansee')
    }
  });
});
hiddenElements.forEach((el) => observer.observe(el));

/** Weighanchor **/
const observer2 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove(".cantsee2");
      entry.target.classList.add("cansee2");
    } else {
      // do not anime again and again :）
      // entry.target.classList.add('cantsee2')
      // entry.target.classList.remove('cansee2')
    }
  });
});
hiddenElements2.forEach((el) => observer2.observe(el));
