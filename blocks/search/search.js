import { loadCSS } from '../../scripts/aem.js';

// Data for autocomplete
const LOCATION_NAMES = [
  "Munnar, Kerala", "Goa Beach Resort", "Himalayan Trek", "Maldives Villa",
  "Coorg Cottage", "Mumbai Grand Hotel", "Rajasthan Desert Camp", 
  "Shimla Mountain Lodge", "Andaman Beach Resort", "Kashmir Houseboat",
  "Delhi Grand Palace", "Darjeeling Tea Estate", "Pondicherry Beach Villa",
  "Jaipur Heritage Hotel", "Manali Pine Cottage", "Ranthambore Safari Lodge"
];

const MAX_GUESTS = 15;

export default function decorate(block) {
  // 1. Create the HTML Structure
  block.innerHTML = `
    <div class="search-bar">
        <div class="search-item location-item">
            <label>Location</label>
            <input type="text" id="location-input" placeholder="Where are you going?" autocomplete="off">
            <ul id="suggestions-list" class="suggestions-list"></ul>
        </div>
        <div class="search-item">
            <label>Check In</label>
            <input type="date" id="checkin">
        </div>
        <div class="search-item">
            <label>Check out</label>
            <input type="date" id="checkout">
        </div>
        <div class="search-item">
            <label>Guests</label>
            <input type="number" id="guests-input" min="1" max="15" placeholder="Add guests">
        </div>
        <button id="search-btn">Search</button>
    </div>
  `;

  // 2. Select Elements
  const locationInput = block.querySelector('#location-input');
  const suggestionsList = block.querySelector('#suggestions-list');
  const searchBtn = block.querySelector('#search-btn');
  const checkinInput = block.querySelector('#checkin');
  const checkoutInput = block.querySelector('#checkout');
  const guestsInput = block.querySelector('#guests-input');

  // --- LOGIC 1: AUTOCOMPLETE ---
  locationInput.addEventListener('input', () => {
      const val = locationInput.value.toLowerCase().trim();
      suggestionsList.innerHTML = '';
      if (val) {
          const matches = LOCATION_NAMES.filter(n => n.toLowerCase().includes(val));
          matches.forEach(match => {
              const li = document.createElement('li');
              li.textContent = match;
              li.onclick = () => {
                  locationInput.value = match;
                  suggestionsList.classList.remove('show');
              };
              suggestionsList.append(li);
          });
          if (matches.length > 0) suggestionsList.classList.add('show');
          else suggestionsList.classList.remove('show');
      } else {
          suggestionsList.classList.remove('show');
      }
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
      if (!locationInput.contains(e.target) && !suggestionsList.contains(e.target)) {
          suggestionsList.classList.remove('show');
      }
  });

  // --- LOGIC 2: DATE VALIDATION ---
  const today = new Date().toISOString().split('T')[0];
  checkinInput.min = today;

  checkinInput.addEventListener('change', () => {
      checkoutInput.min = checkinInput.value;
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = '';
          alert('Check-out date must be after check-in date');
      }
  });

  checkoutInput.addEventListener('change', () => {
      if (checkinInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = '';
          alert('Check-out date must be after check-in date');
      }
  });

  // --- LOGIC 3: STRICT GUEST VALIDATION ---
  
  // A. Block invalid typing (letters, symbols)
  guestsInput.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, arrows
      if ([46, 8, 9, 27, 13, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
         (e.keyCode === 65 && e.ctrlKey === true)) { // Allow Ctrl+A
          return;
      }
      // Stop anything that isn't a number
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
      }
  });

  // B. Enforce Limit on Input
  guestsInput.addEventListener('input', function() {
      let value = parseInt(this.value);

      if (value < 1) {
          this.value = '';
          return;
      }

      if (value > MAX_GUESTS) {
          this.value = MAX_GUESTS; // Force it back to 15 immediately
          alert(`Sorry, the maximum number of guests is ${MAX_GUESTS}.`);
      }
  });

  // --- LOGIC 4: PERFORM SEARCH ---
  function performSearch() {
      const query = locationInput.value.toLowerCase().trim();
      const event = new CustomEvent('performSearch', { detail: { query } });
      document.dispatchEvent(event);
  }

  searchBtn.onclick = performSearch;
  
  // Allow pressing Enter to search
  locationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          performSearch();
          suggestionsList.classList.remove('show');
      }
  });
}