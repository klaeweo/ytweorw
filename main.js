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
      <section class="card" onclick="playVideo('${video.id}')">
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


// * Handling focus navigation: 

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  let currentFocusIndex = 0;

  // Make cards focusable and initialize first card
  cards.forEach((card, index) => {
      card.setAttribute('tabindex', index === 0 ? '0' : '-1');
      card.addEventListener('focus', () => updateFocus(index));
  });

  function updateFocus(newIndex) {
      // Remove focus from previous card
      cards[currentFocusIndex].classList.remove('focused');
      cards[currentFocusIndex].setAttribute('tabindex', '-1');
      
      // Update current index
      currentFocusIndex = newIndex;
      
      // Add focus to new card
      cards[currentFocusIndex].classList.add('focused');
      cards[currentFocusIndex].setAttribute('tabindex', '0');
      cards[currentFocusIndex].focus();
      
      // Scroll into view if needed
      cards[currentFocusIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
      });
  }

  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
      switch(e.key) {
          case 'ArrowRight':
              e.preventDefault();
              updateFocus(Math.min(currentFocusIndex + 1, cards.length - 1));
              break;
          case 'ArrowLeft':
              e.preventDefault();
              updateFocus(Math.max(currentFocusIndex - 1, 0));
              break;
          case 'Enter':
              cards[currentFocusIndex].click();
              break;
          case 'Tab':
              e.preventDefault();
              const direction = e.shiftKey ? -1 : 1;
              updateFocus(Math.min(Math.max(currentFocusIndex + direction, 0), cards.length - 1));
              break;
      }
  });

  // Initial focus
  cards[0].focus();
});