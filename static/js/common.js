const burger = document.querySelector('#burger')
const menu = document.querySelector('#menu')


burger.addEventListener('click',()=>{
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
})

const blurredImageDiv = document.querySelectorAll(".blurred-img")
console.log(blurredImageDiv)
blurredImageDiv.forEach(div => {
  const img = div.querySelector("img")
  function loaded() {
    console.log('lazy load img complate')
    img.classList.add("opacity-100")
    div.classList.add("loaded")
  }
  
  if (img.complete) {
    loaded()
  } else {
    img.addEventListener("load", loaded)
  }
})
