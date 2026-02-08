/**
 * Search Block
 * Handles location autocomplete, date validation, and guest count
 */

const CONFIG = {
  maxGuests: 15,
  debounceDelay: 200,
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'beach', label: 'Beachfront' },
  { id: 'cabins', label: 'Cabins' },
  { id: 'exp', label: 'Experiences' },
  { id: 'serv', label: 'Services' },
];

let availableLocations = [];

export default async function decorate(block) {
  block.innerHTML = `
    <div class="search-container">
      ${createSearchHTML()}
    </div>
    <div class="filters-container">
      ${createFiltersHTML()}
    </div>
  `;
  
  const elements = {
    locationInput: block.querySelector('#location-input'),
    suggestionsList: block.querySelector('#suggestions-list'),
    searchBtn: block.querySelector('#search-btn'),
    checkin: block.querySelector('#checkin'),
    checkout: block.querySelector('#checkout'),
    guests: block.querySelector('#guests-input'),
  };
  
  await loadLocationsFromListings();
  
  initAutocomplete(elements);
  initDateValidation(elements);
  initGuestValidation(elements);
  initSearchButton(elements);
  initFilterHandlers(block);
}

async function loadLocationsFromListings() {
  try {
    const response = await fetch('/listings.json');
    if (!response.ok) return;
    
    const json = await response.json();
    if (!json.data || !Array.isArray(json.data)) return;
    
    availableLocations = json.data
      .map(listing => listing.name)
      .filter(name => name && name.trim())
      .filter((name, index, array) => array.indexOf(name) === index)
      .sort();
    
  } catch (error) {
    console.warn('Failed to load locations:', error);
  }
}

function createSearchHTML() {
  return `
    <div class="search-bar">
      <div class="search-item location-item">
        <label>Location</label>
        <input 
          type="text" 
          id="location-input" 
          placeholder="Where are you going?" 
          autocomplete="off"
        >
        <ul id="suggestions-list" class="suggestions-list"></ul>
      </div>
      
      <div class="search-item">
        <label>Check In</label>
        <input type="date" id="checkin">
      </div>
      
      <div class="search-item">
        <label>Check Out</label>
        <input type="date" id="checkout">
      </div>
      
      <div class="search-item">
        <label>Guests</label>
        <input 
          type="number" 
          id="guests-input" 
          min="1" 
          max="${CONFIG.maxGuests}" 
          placeholder="Add guests"
        >
      </div>
      
      <button id="search-btn">Search</button>
    </div>
  `;
}

function initAutocomplete({ locationInput, suggestionsList }) {
  let debounceTimer;
  
  locationInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = locationInput.value.trim();
    
    if (!query) {
      hideSuggestions(suggestionsList);
      return;
    }
    
    debounceTimer = setTimeout(() => {
      showSuggestions(query, suggestionsList, locationInput);
    }, CONFIG.debounceDelay);
  });
  
  document.addEventListener('click', (e) => {
    if (!locationInput.contains(e.target) && !suggestionsList.contains(e.target)) {
      hideSuggestions(suggestionsList);
    }
  });
  
  locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(locationInput.value);
      hideSuggestions(suggestionsList);
    }
  });
}

function showSuggestions(query, suggestionsList, locationInput) {
  const matches = availableLocations.filter(location =>
    location.toLowerCase().includes(query.toLowerCase())
  );
  
  suggestionsList.innerHTML = '';
  
  if (matches.length === 0) {
    const noResults = document.createElement('li');
    noResults.textContent = 'No matching locations';
    noResults.style.opacity = '0.5';
    noResults.style.cursor = 'default';
    suggestionsList.appendChild(noResults);
  } else {
    matches.forEach(match => {
      const li = document.createElement('li');
      li.textContent = match;
      li.addEventListener('click', () => {
        locationInput.value = match;
        hideSuggestions(suggestionsList);
      });
      suggestionsList.appendChild(li);
    });
  }
  
  suggestionsList.classList.add('show');
}

function hideSuggestions(suggestionsList) {
  suggestionsList.classList.remove('show');
}

function initDateValidation({ checkin, checkout }) {
  const today = new Date().toISOString().split('T')[0];
  
  checkin.setAttribute('min', today);
  checkout.setAttribute('min', today);
  
  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    
    checkout.setAttribute('min', checkin.value);
    
    if (checkout.value && checkout.value <= checkin.value) {
      checkout.value = '';
      alert('Check-out date must be after check-in date');
    }
  });
  
  checkout.addEventListener('change', () => {
    if (checkin.value && checkout.value <= checkin.value) {
      checkout.value = '';
      alert('Check-out date must be after check-in date');
    }
  });
}

function initGuestValidation({ guests }) {
  guests.addEventListener('input', () => {
    const value = parseInt(guests.value);
    
    if (value > CONFIG.maxGuests) {
      guests.value = CONFIG.maxGuests;
      alert(`Maximum ${CONFIG.maxGuests} guests allowed`);
    }
  });
}

function initSearchButton({ searchBtn, locationInput }) {
  searchBtn.addEventListener('click', () => {
    performSearch(locationInput.value);
  });
}

function performSearch(query) {
  const searchEvent = new CustomEvent('performSearch', {
    detail: { query: query.toLowerCase().trim() },
  });
  document.dispatchEvent(searchEvent);
}

function createFiltersHTML() {
  const filterItems = FILTERS.map((filter, index) => {
    const activeClass = index === 0 ? 'active' : '';
    return `
      <div class="filter-item ${activeClass}" data-filter="${filter.id}">
        ${filter.label}
      </div>
    `;
  }).join('');
  
  return `<div class="filter-bar">${filterItems}</div>`;
}

function initFilterHandlers(block) {
  const filterItems = block.querySelectorAll('.filter-item');
  
  filterItems.forEach((item) => {
    item.addEventListener('click', () => {
      handleFilterClick(item, filterItems);
    });
  });
}

function handleFilterClick(clickedItem, allItems) {
  allItems.forEach(item => item.classList.remove('active'));
  clickedItem.classList.add('active');
  
  const category = clickedItem.getAttribute('data-filter');
  const filterEvent = new CustomEvent('performFilter', {
    detail: { category },
  });
  document.dispatchEvent(filterEvent);
}
