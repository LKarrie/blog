const burger = document.querySelector('#burger')
const menu = document.querySelector('#menu')


burger.addEventListener('click',()=>{
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
})

/** lazy loading js **/
const blurredImageDiv = document.querySelectorAll(".blurred-img")
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

/** lazy loading js **/
const highlightDiv = document.querySelectorAll(".highlight")
highlightDiv.forEach(div => {
  div.classList.add("border-solid")
  div.classList.add("border-2")
  div.classList.add("rounded-xl")
  div.classList.add("shadow-lg") 
  div.classList.add("p-2") 
  div.classList.add("my-2") 
})