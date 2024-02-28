function displayResults(results, store) {
  const searchResults = document.getElementById("results");
  let resultList = "";
  let searchPrompt = "";
  if (results.length) {
    // let resultList = ''
    // Iterate and build result list elements
    for (const n in results) {
      const item = store[results[n].ref];
      // resultList += '<img draggable="false" src="' + item.cardImg + '" loading="lazy">'
      // resultList += '<li><p><a href="' + item.url + '">' + item.title + '</a></p>'
      // resultList += '<p>' + item.content.substring(0, 150) + '...</p></li>'

      resultList += '<li class="flex flex-row h-28 text-ellipsis overflow-hidden gap-10">';
      resultList += '<div class="hidden md:flex items-center shrink-0 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-1 rounded-full">';
      resultList += '<a href="' + item.url + '" class="block bg-white p-1 rounded-full transform transition hover:-rotate-6">';
      resultList += '<div class="search-blurred-img relative h-full w-full bg-center bg-cover rounded-full" style="background-image: url(' + item.lazyCardImg + ')">';
      resultList += '<img class="opacity-0 transition-opacity duration-1000 ease-in-out w-24 h-24 rounded-full object-cover" src="' + item.cardImg + '" loading="lazy"/>';
      resultList += "</div>";
      resultList += "</a>";
      resultList += "</div>";
      resultList += '<div class="flex flex-col gap-2">';
      resultList += '<div class="flex justify-between items-center mr-1">';
      resultList += '<p class="text-xl font-bold">' + item.title + "</p>";
      resultList += '<p class="text-sm"><i class="inline-block fa-solid fa-clock animate-pulse"></i>&nbsp;Created&nbsp;:&nbsp;' + item.time + "</p>";
      resultList += "</div>";
      resultList += '<div class="flex flex-col break-all text-sm overflow-hidden text-ellipsis ">';
      resultList += '<span class="line-clamp-2">' + item.content.substring(0, 150) + "</span>";
      resultList += "</div>";
      resultList += '<div class="flex justify-end">';
      resultList += '<a href="' + item.url + '">';
      resultList += '<i class="fa-solid fa-ellipsis fa-2xl mt-4"></i>';
      resultList += "</a>";
      resultList += "</div>";
      resultList += "</div>";
      resultList += "</li>";
    }
    searchResults.innerHTML = resultList;
  } else {
    if (document.documentElement.lang === "en") {
      searchPrompt = "No results found.";
    } else if (document.documentElement.lang === "zh-CN") {
      searchPrompt = "没有找到哦😥";
    }

    resultList += '<li class="flex flex-row h-28 text-xl gap-10 justify-center items-center">';
    resultList += "<span>";
    resultList += searchPrompt;
    resultList += "</span>";
    resultList += "</li>";
    searchResults.innerHTML = resultList;
  }
}

function displayEmpty() {
  const searchResults = document.getElementById("results");
  let resultList = "";
  let searchPrompt = "";

  if (document.documentElement.lang === "en") {
    searchPrompt = "Enter a keyword above to search this site. ᕕ(◠ڼ◠)ᕗ";
  } else if (document.documentElement.lang === "zh-CN") {
    searchPrompt = "键入关键字开始搜索哦~ ᕕ(◠ڼ◠)ᕗ";
  }

  resultList += '<li class="flex flex-row h-28 text-xl gap-10 justify-center items-center">';
  resultList += "<span>";
  resultList += searchPrompt;
  resultList += "</span>";
  resultList += "</li>";
  searchResults.innerHTML = resultList;
}

// Get the query parameter(s)
const params = new URLSearchParams(window.location.search);
const query = params.get("query");

// Perform a search if there is a query
if (query) {
  // Retain the search input in the form when displaying results
  document.getElementById("search-input").setAttribute("value", query);

  const idx = lunr(function () {
    this.ref("id");
    this.field("title", {
      boost: 15,
    });
    this.field("tags");
    this.field("categories");
    this.field("content", {
      boost: 10,
    });

    for (const key in window.store) {
      this.add({
        id: key,
        title: window.store[key].title,
        time: window.store[key].time,
        tags: window.store[key].tags,
        categories: window.store[key].categories,
        content: window.store[key].content,
        lazyCardImg: window.store[key].lazyCardImg,
        cardImg: window.store[key].cardImg,
      });
    }
  });

  // Perform the search
  const results = idx.search(query);
  // Update the list with results
  displayResults(results, window.store);

  const searchBlurredImageDiv = document.querySelectorAll(".search-blurred-img");
  searchBlurredImageDiv.forEach((div) => {
    const img = div.querySelector("img");
    function loaded() {
      console.log("lazy load search img complate");
      img.classList.add("opacity-100");
      div.classList.add("loaded");
    }

    if (img.complete) {
      loaded();
    } else {
      img.addEventListener("load", loaded);
    }
  });
} else {
  displayEmpty();
}
