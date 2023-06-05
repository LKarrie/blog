const burger = document.querySelector('#burger')
const menu = document.querySelector('#menu')
const topnav = document.querySelector('#topnav')
const tophaeder = document.querySelector('#tophaeder')

burger.addEventListener('click',()=>{
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
})

/** 监听滚动条 **/

const DIRECTION_ENUM = {
DOWN: "down",
UP: "up",
};

// 距离顶部或底部的阈值
const threshold = 20;

// 记录前一个滚动位置
let beforeScrollTop = 0;

function handleScroll() {
// 距顶部
var scrollTop =
  document.documentElement.scrollTop || document.body.scrollTop;
var clientHeight =
  document.documentElement.clientHeight || document.body.clientHeight;
var scrollHeight =
  document.documentElement.scrollHeight || document.body.scrollHeight;

let direction = DIRECTION_ENUM.DOWN;
if (beforeScrollTop > scrollTop) {
  direction = DIRECTION_ENUM.UP;
}

if (direction == DIRECTION_ENUM.DOWN) {
  topnav.classList.remove('opacity-0');
  topnav.classList.remove('translate-x-28');
  tophaeder.classList.remove('bg-opacity-0');
  if (scrollTop + clientHeight + threshold >= scrollHeight) {
    console.log("滚动触底");
  }
} else {
  if (scrollTop <= threshold) {
    topnav.classList.add('opacity-0');
    topnav.classList.add('translate-x-28');
    tophaeder.classList.add('bg-opacity-0');
    console.log("滚动到顶部");
  }
}

beforeScrollTop = scrollTop;
}

const throttleHandleScroll = throttleDebounce.throttle(
300,
handleScroll
);

window.addEventListener('scroll', throttleHandleScroll);


/** 监听滚动条 **/