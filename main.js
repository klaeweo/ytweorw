(async function init() {
  const videos = await fetchVideos();
  renderVideos(videos);
})();

async function fetchVideos() {
  const CORS_PROXY = "https://api.allorigins.win/raw?url=";
  const CHANNEL_ID = "UCOfDJSJjnNC-eqyL7Chflew";
  const RSS_URL = `${CORS_PROXY}https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  try {
    const response = await fetch(RSS_URL);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    return parseVideos(xmlDoc);
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
}

function parseVideos(xmlDoc) {
  const entries = xmlDoc.getElementsByTagName("entry");
  return Array.from(entries).map((entry) => {
    const id = entry.getElementsByTagName("yt:videoId")[0].textContent;
    const title = entry.getElementsByTagName("title")[0].textContent;
    const published = new Date(
      entry.getElementsByTagName("published")[0].textContent
    );

    return {
      id,
      title,
      published,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`,
    };
  });
}

function renderVideos(videos) {
  const container = document.querySelector("article");
  container.innerHTML = videos
    .map(
      (video) => `
      <section class="card"  tabindex="0" onclick="playVideo('${video.id}')">
                <div class="thumb">
                    <img src="${video.thumbnail}" alt="${video.title}">
                </div>
                <div class="caption">
                    <p>${video.title}</p>
                    <small>
                        <span>${video.published.toDateString()}</span>
                    </small>
                </div>
            </section>
    `
    )
    .join("");
}

// video player
function playVideo(videoId) {
  const player = document.createElement("iframe");
  player.allow = "autoplay";
  player.id = "fullscreen-player";
  player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  document.body.appendChild(player);
  player.requestFullscreen();

  // Add a history state to track fullscreen mode
  history.pushState({ isFullscreen: true }, "", "#player");
}

// Listen for Back Button (Popstate Event)
window.addEventListener("popstate", (event) => {
  const iframe = document.getElementById("fullscreen-player");

  // Check if exiting from fullscreen state
  if (iframe && event.state?.isFullscreen) {
    document.exitFullscreen();
    iframe.remove();
  }
});

// Handle Fullscreen Exit via ESC Key
document.addEventListener("fullscreenchange", () => {
  const iframe = document.getElementById("fullscreen-player");

  // If fullscreen is exited and iframe exists
  if (!document.fullscreenElement && iframe) {
    iframe.remove(); // Remove the iframe
    history.replaceState(null, "", " "); // Clean up the URL
  }
});

// Focus first card after slight delay to ensure DOM is ready
setTimeout(() => {
  const firstCard = document.querySelector('article').firstElementChild;

  if(firstCard){
    firstCard.focus();
  }
}, 100);

// Handle Enter key on the card
document.addEventListener('keydown', (e)=> {
  if(e.key === "Enter") {
    const focusedElement = document.activeElement;
    if(focusedElement.classList.contains('card')){
      focusedElement.click();
    }
  }
})

//Make Arrow Keys Work for TV Navigation 
document.addEventListener('keydown', (e) => {
  const focusedElement = document.activeElement;
  
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      moveFocus('left', focusedElement);
      break;
    case 'ArrowRight':
      e.preventDefault();
      moveFocus('right', focusedElement);
      break;
  }
});

function moveFocus(direction, currentElement) {
  // Implement your grid navigation logic here
  const allCards = Array.from(document.querySelectorAll('.card'));
  const currentIndex = allCards.indexOf(currentElement);
  
  switch(direction) {
    case 'right':
      if (currentIndex < allCards.length - 1) {
        allCards[currentIndex + 1].focus();
      }
      break;
    case 'left':
      if (currentIndex > 0) {
        allCards[currentIndex - 1].focus();
      }
      break;
  }
}
