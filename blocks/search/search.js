/**
 * Search Block
 * Handles location autocomplete, date validation, and guest count
 */

// Configuration
const CONFIG = {
  locations: [
    "Munnar, Kerala",
    "Goa Beach Resort",
    "Himalayan Trek",
    "Maldives Villa",
    "Coorg Cottage",
    "Mumbai Grand Hotel",
    "Rajasthan Desert Camp",
    "Shimla Mountain Lodge",
    "Andaman Beach Resort",
    "Kashmir Houseboat",
    "Delhi Grand Palace",
    "Darjeeling Tea Estate",
    "Pondicherry Beach Villa",
    "Jaipur Heritage Hotel",
    "Manali Pine Cottage",
    "Ranthambore Safari Lodge"
  ],
  maxGuests: 15,
  debounceDelay: 200
};

export default function decorate(block) {
  // Create HTML structure
  block.innerHTML = createSearchHTML();
  
  // Get element references
  const elements = {
    locationInput: block.querySelector('#location-input'),
    suggestionsList: block.querySelector('#suggestions-list'),
    searchBtn: block.querySelector('#search-btn'),
    checkin: block.querySelector('#checkin'),
    checkout: block.querySelector('#checkout'),
    guests: block.querySelector('#guests-input')
  };
  
  // Initialize features
  initAutocomplete(elements);
  initDateValidation(elements);
  initGuestValidation(elements);
  initSearchButton(elements);
}

/**
 * Creates the search bar HTML
 */
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

/**
 * Autocomplete functionality
 */
function initAutocomplete({ locationInput, suggestionsList }) {
  let debounceTimer;
  
  // Handle input with debouncing
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
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!locationInput.contains(e.target) && !suggestionsList.contains(e.target)) {
      hideSuggestions(suggestionsList);
    }
  });
  
  // Enter key to search
  locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(locationInput.value);
      hideSuggestions(suggestionsList);
    }
  });
}

/**
 * Show filtered suggestions
 */
function showSuggestions(query, suggestionsList, locationInput) {
  const matches = CONFIG.locations.filter(location =>
    location.toLowerCase().includes(query.toLowerCase())
  );
  
  suggestionsList.innerHTML = '';
  
  if (matches.length === 0) {
    hideSuggestions(suggestionsList);
    return;
  }
  
  matches.forEach(match => {
    const li = document.createElement('li');
    li.textContent = match;
    li.addEventListener('click', () => {
      locationInput.value = match;
      hideSuggestions(suggestionsList);
    });
    suggestionsList.appendChild(li);
  });
  
  suggestionsList.classList.add('show');
}

/**
 * Hide suggestions dropdown
 */
function hideSuggestions(suggestionsList) {
  suggestionsList.classList.remove('show');
}

/**
 * Date validation
 */
function initDateValidation({ checkin, checkout }) {
  const today = new Date().toISOString().split('T')[0];
  
  // Set minimum dates to today
  checkin.setAttribute('min', today);
  checkout.setAttribute('min', today);
  
  // Validate when check-in changes
  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    
    // Update checkout minimum to match check-in
    checkout.setAttribute('min', checkin.value);
    
    // Clear checkout if it's invalid
    if (checkout.value && checkout.value <= checkin.value) {
      checkout.value = '';
      alert('Check-out date must be after check-in date');
    }
  });
  
  // Validate when checkout changes
  checkout.addEventListener('change', () => {
    if (checkin.value && checkout.value <= checkin.value) {
      checkout.value = '';
      alert('Check-out date must be after check-in date');
    }
  });
}

/**
 * Guest count validation
 */
function initGuestValidation({ guests }) {
  // Block non-numeric keys
  guests.addEventListener('keydown', (e) => {
    const allowedKeys = [8, 9, 27, 13, 37, 38, 39, 40, 46]; // Navigation keys
    
    // Allow navigation keys and Ctrl+A
    if (allowedKeys.includes(e.keyCode) || (e.keyCode === 65 && e.ctrlKey)) {
      return;
    }
    
    // Allow number keys (0-9 on both keyboard and numpad)
    const isNumber = (e.keyCode >= 48 && e.keyCode <= 57) || 
                     (e.keyCode >= 96 && e.keyCode <= 105);
    
    if (!e.shiftKey && isNumber) {
      return;
    }
    
    // Block everything else
    e.preventDefault();
  });
  
  // Enforce min/max limits
  guests.addEventListener('input', () => {
    const value = parseInt(guests.value);
    
    if (value < 1) {
      guests.value = '';
      return;
    }
    
    if (value > CONFIG.maxGuests) {
      guests.value = CONFIG.maxGuests;
      alert(`Maximum ${CONFIG.maxGuests} guests allowed`);
    }
  });
}

/**
 * Search button functionality
 */
function initSearchButton({ searchBtn, locationInput }) {
  searchBtn.addEventListener('click', () => {
    performSearch(locationInput.value);
  });
}

/**
 * Dispatch search event
 */
function performSearch(query) {
  const searchEvent = new CustomEvent('performSearch', {
    detail: { query: query.toLowerCase().trim() }
  });
  document.dispatchEvent(searchEvent);
}
