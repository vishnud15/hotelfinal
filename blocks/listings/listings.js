/**
 * Listings Block
 * Displays property cards with search, filter, and favorites
 */

let currentFilter = 'all';
let currentSearchQuery = '';
let favorites = [];

export default async function decorate(block) {
  favorites = loadFavorites();
  showLoading(block);
  
  try {
    const listings = await fetchListings();
    renderListings(block, listings);
    initEventListeners(block);
  } catch (error) {
    showError(block, error);
  }
}

async function fetchListings() {
  const response = await fetch('/listings.json');
  if (!response.ok) throw new Error('Failed to load listings');
  
  const json = await response.json();
  if (!json.data || !Array.isArray(json.data)) throw new Error('Invalid data format');
  
  return json.data;
}

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

function renderListings(block, listings) {
  block.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'listings-container';
  
  const ul = document.createElement('ul');
  ul.className = 'listings-grid';
  
  listings.forEach((property) => {
    ul.appendChild(createCard(property));
  });
  
  container.appendChild(ul);
  container.appendChild(createEmptyState());
  block.appendChild(container);
}

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

function createEmptyState() {
  const emptyState = document.createElement('div');
  emptyState.className = 'listings-empty';
  emptyState.style.display = 'none';
  
  emptyState.innerHTML = `
    <div class="empty-state-content">
      <div class="empty-state-icon">🔍</div>
      <h3 class="empty-state-title">No properties found</h3>
      <p class="empty-state-description">
        We couldn't find any properties matching your search and filters.
      </p>
      <div class="empty-state-suggestions">
        <p class="suggestion-title">Try:</p>
        <ul>
          <li id="clear-search-suggestion" style="display: none;">
            Clearing your search query
          </li>
          <li id="clear-filter-suggestion" style="display: none;">
            Selecting "All" categories
          </li>
          <li>Adjusting your search criteria</li>
        </ul>
      </div>
      <div class="empty-state-actions">
        <button id="reset-filters-btn" class="reset-btn">Clear All Filters</button>
      </div>
    </div>
  `;
  
  return emptyState;
}

function initEventListeners(block) {
  block.addEventListener('click', handleHeartClick);
  document.addEventListener('performSearch', handleSearch);
  document.addEventListener('performFilter', handleFilter);
  
  const resetBtn = block.querySelector('#reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetFilters);
  }
}

function handleHeartClick(e) {
  if (!e.target.classList.contains('heart-icon')) return;
  
  e.stopPropagation();
  toggleFavorite(e.target.getAttribute('data-id'), e.target);
}

function toggleFavorite(id, heartElement) {
  const idString = String(id);
  
  if (favorites.includes(idString)) {
    favorites = favorites.filter(favId => favId !== idString);
    heartElement.classList.remove('liked');
  } else {
    favorites.push(idString);
    heartElement.classList.add('liked');
  }
  
  saveFavorites(favorites);
}

function handleSearch(event) {
  currentSearchQuery = event.detail.query;
  applyFilters();
}

function handleFilter(event) {
  currentFilter = event.detail.category;
  applyFilters();
}

function handleResetFilters() {
  currentFilter = 'all';
  currentSearchQuery = '';
  
  const searchInput = document.querySelector('#location-input');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.filter-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-filter') === 'all');
  });
  
  applyFilters();
}

function applyFilters() {
  const cards = document.querySelectorAll('.listings .card');
  const emptyState = document.querySelector('.listings-empty');
  
  let visibleCount = 0;
  
  cards.forEach((card) => {
    const category = card.getAttribute('data-category');
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    
    const matchesFilter = currentFilter === 'all' || currentFilter === category;
    const matchesSearch = !currentSearchQuery || title.includes(currentSearchQuery);
    const shouldShow = matchesFilter && matchesSearch;
    
    card.style.display = shouldShow ? 'flex' : 'none';
    if (shouldShow) visibleCount++;
  });
  
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    
    // Update contextual suggestions
    const searchSuggestion = emptyState.querySelector('#clear-search-suggestion');
    const filterSuggestion = emptyState.querySelector('#clear-filter-suggestion');
    
    if (searchSuggestion) {
      searchSuggestion.style.display = currentSearchQuery ? 'list-item' : 'none';
    }
    if (filterSuggestion) {
      filterSuggestion.style.display = currentFilter !== 'all' ? 'list-item' : 'none';
    }
  }
}

function loadFavorites() {
  try {
    const stored = localStorage.getItem('hotelo-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load favorites:', error);
    return [];
  }
}

function saveFavorites(favoritesArray) {
  try {
    localStorage.setItem('hotelo-favorites', JSON.stringify(favoritesArray));
  } catch (error) {
    console.warn('Failed to save favorites:', error);
  }
}
