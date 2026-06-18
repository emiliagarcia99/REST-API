const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const gallery = document.querySelector("#gallery");
const statusText = document.querySelector("#statusText");
const resultCount = document.querySelector("#resultCount");
const tagButtons = document.querySelectorAll(".tag-btn");
const hero = document.querySelector("#hero");
const floatingCards = document.querySelectorAll(".floating-art");

const apiUrl = "https://api.artic.edu/api/v1/artworks/search";

let cursorImages = [];
let lastTrailTime = 0;
let imageIndex = 0;

hero.addEventListener("mousemove", function (event) {
  const currentTime = Date.now();

  if (currentTime - lastTrailTime > 120 && cursorImages.length > 0) {
    createCursorArt(event.clientX, event.clientY);
    lastTrailTime = currentTime;
  }
});

searchButton.addEventListener("click", function () {
  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    statusText.textContent = "Please type something to search.";
    return;
  }

  getArtworks(searchTerm);
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== "") {
      getArtworks(searchTerm);
    }
  }
});

tagButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const searchTerm = button.dataset.search;
    searchInput.value = searchTerm;
    getArtworks(searchTerm);
  });
});

function createCursorArt(xPosition, yPosition) {
  const art = document.createElement("div");

  art.classList.add("cursor-art");

  art.style.left = `${xPosition}px`;
  art.style.top = `${yPosition}px`;
  art.style.backgroundImage = `url(${cursorImages[imageIndex]})`;

  document.body.appendChild(art);

  imageIndex++;

  if (imageIndex >= cursorImages.length) {
    imageIndex = 0;
  }

  setTimeout(function () {
    art.remove();
  }, 1200);
}

function getArtworks(searchTerm) {
  gallery.innerHTML = `
    <div class="loading">
      <h2>Loading artworks...</h2>
    </div>
  `;

  statusText.textContent = `Searching for "${searchTerm}"...`;
  resultCount.textContent = "Loading...";

  const url = `${apiUrl}?q=${searchTerm}&fields=id,title,artist_title,date_display,image_id,thumbnail&limit=16`;

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("API request failed");
      }

      return response.json();
    })
    .then(function (data) {
      displayArtworks(data.data, data.config.iiif_url, searchTerm);
    })
    .catch(function (error) {
      statusText.textContent = "Something went wrong. Please try again.";
      resultCount.textContent = "0 results";
      console.log(error);
    });
}

function displayArtworks(artworks, iiifUrl, searchTerm) {
  gallery.innerHTML = "";

  const artworksWithImages = artworks.filter(function (artwork) {
    return artwork.image_id;
  });

  cursorImages = artworksWithImages.slice(0, 6).map(function (artwork) {
    return `${iiifUrl}/${artwork.image_id}/full/600,/0/default.jpg`;
  });

  floatingCards.forEach(function (card, index) {
    if (cursorImages[index]) {
      card.style.backgroundImage = `url(${cursorImages[index]})`;
    }
  });

  if (artworksWithImages.length === 0) {
    statusText.textContent = `No image results found for "${searchTerm}". Try another word.`;
    resultCount.textContent = "0 results";

    gallery.innerHTML = `
      <div class="empty-message">
        <h3>No artworks found</h3>
        <p>Try searching for another theme like flowers, portrait, nature, or ocean.</p>
      </div>
    `;

    return;
  }

  statusText.textContent = `Showing results for "${searchTerm}".`;
  resultCount.textContent = `${artworksWithImages.length} results`;

  artworksWithImages.forEach(function (artwork) {
    const imageUrl = `${iiifUrl}/${artwork.image_id}/full/843,/0/default.jpg`;

    const card = document.createElement("article");
    card.classList.add("art-card");

    card.innerHTML = `
      <img src="${imageUrl}" alt="${artwork.thumbnail?.alt_text || artwork.title}">
      <div class="art-info">
        <h3>${artwork.title}</h3>
        <p>${artwork.artist_title || "Unknown artist"}</p>
        <p>${artwork.date_display || "Date unavailable"}</p>
      </div>
    `;

    gallery.appendChild(card);
  });
}

getArtworks("flowers");