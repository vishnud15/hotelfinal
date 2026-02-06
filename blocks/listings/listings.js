/**
 * Listings Block
 * Displays property cards with search, filter, and favorites
 * NEW: Empty state when no results match
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
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'listings-container';
  
  // Create cards list
  const ul = document.createElement('ul');
  ul.className = 'listings-grid';
  
  listings.forEach((property) => {
    const card = createCard(property);
    ul.appendChild(card);
  });
  
  container.appendChild(ul);
  
  // Create empty state (hidden by default)
  const emptyState = createEmptyState();
  container.appendChild(emptyState);
  
  block.appendChild(container);
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
 * Create empty state element
 */
function createEmptyState() {
  const emptyState = document.createElement('div');
  emptyState.className = 'listings-empty';
  emptyState.style.display = 'none'; // Hidden by default
  
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
  
  // Reset filters button
  const resetBtn = block.querySelector('#reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetFilters);
  }
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
 * Handle reset filters button
 */
function handleResetFilters() {
  // Reset state
  currentFilter = 'all';
  currentSearchQuery = '';
  
  // Clear search input
  const searchInput = document.querySelector('#location-input');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Reset filter buttons to "All"
  const filterItems = document.querySelectorAll('.filter-item');
  filterItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-filter') === 'all') {
      item.classList.add('active');
    }
  });
  
  // Reapply filters (will show all cards)
  applyFilters();
}

/**
 * Apply both search and filter
 */
function applyFilters() {
  const cards = document.querySelectorAll('.listings .card');
  const emptyState = document.querySelector('.listings-empty');
  const searchSuggestion = document.querySelector('#clear-search-suggestion');
  const filterSuggestion = document.querySelector('#clear-filter-suggestion');
  
  let visibleCount = 0;
  
  cards.forEach((card) => {
    const category = card.getAttribute('data-category');
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    
    const matchesFilter = currentFilter === 'all' || currentFilter === category;
    const matchesSearch = !currentSearchQuery || title.includes(currentSearchQuery);
    
    const shouldShow = matchesFilter && matchesSearch;
    card.style.display = shouldShow ? 'flex' : 'none';
    
    if (shouldShow) {
      visibleCount++;
    }
  });
  
  // Show/hide empty state based on visible cards
  if (visibleCount === 0) {
    // No results - show empty state
    if (emptyState) {
      emptyState.style.display = 'flex';
      
      // Update suggestions based on active filters
      if (searchSuggestion && currentSearchQuery) {
        searchSuggestion.style.display = 'list-item';
      } else if (searchSuggestion) {
        searchSuggestion.style.display = 'none';
      }
      
      if (filterSuggestion && currentFilter !== 'all') {
        filterSuggestion.style.display = 'list-item';
      } else if (filterSuggestion) {
        filterSuggestion.style.display = 'none';
      }
    }
  } else {
    // Has results - hide empty state
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
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
