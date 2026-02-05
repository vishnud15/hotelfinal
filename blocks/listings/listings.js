/**
 * Listings Block
 * Displays property cards with search, filter, and favorites
 */

// State
let currentFilter = 'all';
let currentSearchQuery = '';
let favorites = [];

export default async function decorate(block) {
  // Load favorites from storage
  favorites = loadFavorites();
  
  // Show loading state
  showLoading(block);
  
  try {
    // Fetch listings data
    const listings = await fetchListings();
    
    // Render cards
    renderListings(block, listings);
    
    // Setup event listeners
    initEventListeners(block);
    
  } catch (error) {
    showError(block, error);
  }
}

/**
 * Fetch listings from JSON
 */
async function fetchListings() {
  const response = await fetch('/listings.json');
  
  if (!response.ok) {
    throw new Error('Failed to load listings');
  }
  
  const json = await response.json();
  
  if (!json.data || !Array.isArray(json.data)) {
    throw new Error('Invalid data format');
  }
  
  return json.data;
}

/**
 * Show loading state
 */
function showLoading(block) {
  block.innerHTML = `
    <div class="listings-loading">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  `;
}

/**
 * Show error state
 */
function showError(block, error) {
  console.error('Listings error:', error);
  block.innerHTML = `
    <div class="listings-error">
      <h3>Unable to load properties</h3>
      <p>Please refresh the page or try again later.</p>
      <button onclick="location.reload()">Refresh Page</button>
    </div>
  `;
}

/**
 * Render all listings
 */
function renderListings(block, listings) {
  block.innerHTML = '';
  
  const ul = document.createElement('ul');
  
  listings.forEach((property) => {
    const card = createCard(property);
    ul.appendChild(card);
  });
  
  block.appendChild(ul);
}

/**
 * Create a single card element
 */
function createCard(property) {
  const li = document.createElement('li');
  li.className = 'card';
  li.setAttribute('data-category', property.category);
  li.setAttribute('data-id', property.id);
  
  const isLiked = favorites.includes(String(property.id));
  
  li.innerHTML = `
    <div class="heart-icon ${isLiked ? 'liked' : ''}" data-id="${property.id}">
      &#10084;
    </div>
    
    <div class="listing-image">
      <img src="${property.image}" alt="${property.name}" loading="lazy">
    </div>
    
    <div class="listing-body">
      <h3>${property.name}</h3>
      <p>${property.distance}</p>
      <p>${property.dates}</p>
      <p class="price"><strong>$${property.price}</strong>/night</p>
    </div>
  `;
  
  return li;
}

/**
 * Initialize all event listeners
 */
function initEventListeners(block) {
  // Heart click handler (event delegation)
  block.addEventListener('click', handleHeartClick);
  
  // Search event listener
  document.addEventListener('performSearch', handleSearch);
  
  // Filter event listener
  document.addEventListener('performFilter', handleFilter);
}

/**
 * Handle heart icon click
 */
function handleHeartClick(e) {
  if (!e.target.classList.contains('heart-icon')) return;
  
  e.stopPropagation();
  
  const heart = e.target;
  const id = heart.getAttribute('data-id');
  
  toggleFavorite(id, heart);
}

/**
 * Toggle favorite status
 */
function toggleFavorite(id, heartElement) {
  const idString = String(id);
  
  if (favorites.includes(idString)) {
    // Remove from favorites
    favorites = favorites.filter(favId => favId !== idString);
    heartElement.classList.remove('liked');
  } else {
    // Add to favorites
    favorites.push(idString);
    heartElement.classList.add('liked');
  }
  
  // Save to localStorage
  saveFavorites(favorites);
}

/**
 * Handle search event
 */
function handleSearch(event) {
  currentSearchQuery = event.detail.query;
  applyFilters();
}

/**
 * Handle filter event
 */
function handleFilter(event) {
  currentFilter = event.detail.category;
  applyFilters();
}

/**
 * Apply both search and filter
 */
function applyFilters() {
  const cards = document.querySelectorAll('.listings .card');
  
  cards.forEach((card) => {
    const category = card.getAttribute('data-category');
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    
    const matchesFilter = currentFilter === 'all' || currentFilter === category;
    const matchesSearch = !currentSearchQuery || title.includes(currentSearchQuery);
    
    const shouldShow = matchesFilter && matchesSearch;
    card.style.display = shouldShow ? 'flex' : 'none';
  });
}

/**
 * Load favorites from localStorage
 */
function loadFavorites() {
  try {
    const stored = localStorage.getItem('hotelo-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load favorites:', error);
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
function saveFavorites(favoritesArray) {
  try {
    localStorage.setItem('hotelo-favorites', JSON.stringify(favoritesArray));
  } catch (error) {
    console.warn('Failed to save favorites:', error);
  }
}
