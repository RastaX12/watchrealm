
// API key & URL
const TMDB_API_KEY = "c8d2a5be394f106d0d73cdbf5f13d927";
const API_URL = "https://api.themoviedb.org/3/";

// Elements
const movieContainer = document.getElementById("movieContainer");
const searchInput = document.getElementById("searchInput");
const categoryList = document.getElementById("categoryList");
const modal = document.getElementById("lockerModal");
const closeModal = document.getElementById("closeModal");
const unlockBtn = document.getElementById("unlockBtn");
const playerContainer = document.getElementById("playerContainer");
const moviePlayer = document.getElementById("moviePlayer");
const closePlayer = document.getElementById("closePlayer");

const detailsModal = document.getElementById("movieDetailsModal");
const closeDetailsModal = document.getElementById("closeDetailsModal");
const detailsTitle = document.getElementById("detailsTitle");
const detailsOverview = document.getElementById("detailsOverview");
const detailsReleaseDate = document.getElementById("detailsReleaseDate");
const detailsRating = document.getElementById("detailsRating");
const watchTrailerBtn = document.getElementById("watchTrailerBtn");

let currentCategory = "popular";
let currentMovie = null;
let currentTrailerKey = null;

async function fetchMovies(category, query = "") {
  let url = "";
  if (query) {
    url = \`\${API_URL}search/movie?api_key=\${TMDB_API_KEY}&query=\${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false\`;
  } else {
    url = \`\${API_URL}movie/\${category}?api_key=\${TMDB_API_KEY}&language=en-US&page=1\`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Fetch movies error:", error);
    return [];
  }
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("movie-card");

  const imgSrc = movie.poster_path
    ? \`https://image.tmdb.org/t/p/w500\${movie.poster_path}\`
    : "https://via.placeholder.com/500x750?text=No+Image";

  card.innerHTML = \`
    <img src="\${imgSrc}" alt="\${movie.title}" />
    <h3>\${movie.title}</h3>
    <button class="watch-btn">Watch Trailer</button>
  \`;

  const watchBtn = card.querySelector(".watch-btn");
  watchBtn.addEventListener("click", () => showMovieDetails(movie));

  return card;
}

function showMovieDetails(movie) {
  currentMovie = movie;
  detailsTitle.textContent = movie.title;
  detailsOverview.textContent = movie.overview || "No description available.";
  detailsReleaseDate.textContent = movie.release_date || "N/A";
  detailsRating.textContent = movie.vote_average || "N/A";
  detailsModal.style.display = "block";
}

async function openTrailer(movie) {
  try {
    const res = await fetch(\`\${API_URL}movie/\${movie.id}/videos?api_key=\${TMDB_API_KEY}&language=en-US\`);
    const data = await res.json();
    const trailer = data.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube" && vid.official)
                  || data.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");

    if (trailer) {
      currentTrailerKey = trailer.key;
      showLocker();
    } else {
      alert("Trailer not available.");
    }
  } catch (error) {
    console.error("Trailer fetch error:", error);
    alert("Failed to load trailer.");
  }
}

function showLocker() {
  modal.classList.add("show");
  modal.style.display = "block";
}

function hideLocker() {
  modal.classList.remove("show");
  modal.style.display = "none";
}

function showPlayer() {
  playerContainer.classList.add("show");
  playerContainer.style.display = "block";
  moviePlayer.src = \`https://www.youtube.com/embed/\${currentTrailerKey}?autoplay=1&rel=0\`;
}

function hidePlayer() {
  playerContainer.classList.remove("show");
  playerContainer.style.display = "none";
  moviePlayer.src = "";
}

async function displayMovies(category = "popular", query = "") {
  movieContainer.innerHTML = "<p style='text-align:center; margin-top: 60px; color:#888;'>Loading...</p>";
  const movies = await fetchMovies(category, query);
  movieContainer.innerHTML = "";

  if (movies.length === 0) {
    movieContainer.innerHTML = "<p style='text-align:center; margin-top: 60px; color:#888;'>No movies found.</p>";
    return;
  }

  movies.forEach(movie => {
    const card = createMovieCard(movie);
    movieContainer.appendChild(card);
  });
}

function setActiveCategory(category) {
  currentCategory = category;
  Array.from(categoryList.querySelectorAll("li")).forEach(li => {
    li.classList.toggle("active", li.dataset.category === category);
  });
}

categoryList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const cat = e.target.dataset.category;
    setActiveCategory(cat);
    displayMovies(cat);
  }
});

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    displayMovies("", query);
    setActiveCategory("");
  } else if (!currentCategory) {
    displayMovies("popular");
    setActiveCategory("popular");
  }
});

closeModal.addEventListener("click", hideLocker);
unlockBtn.addEventListener("click", () => {
  hideLocker();
  showPlayer();
});
closePlayer.addEventListener("click", hidePlayer);
closeDetailsModal.addEventListener("click", () => {
  detailsModal.style.display = "none";
});
watchTrailerBtn.addEventListener("click", () => {
  detailsModal.style.display = "none";
  openTrailer(currentMovie);
});

// Init
setActiveCategory(currentCategory);
displayMovies(currentCategory);
