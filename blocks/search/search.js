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
  
    // 2. Add Logic
    const locationInput = block.querySelector('#location-input');
    const suggestionsList = block.querySelector('#suggestions-list');
    const searchBtn = block.querySelector('#search-btn');
    const checkinInput = block.querySelector('#checkin');
    const checkoutInput = block.querySelector('#checkout');
    const guestsInput = block.querySelector('#guests-input');
  
    // Autocomplete Listener
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
  
    // Date Logic
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkinInput.onchange = () => checkoutInput.min = checkinInput.value;
  
    // Search Logic
    searchBtn.onclick = () => {
        const query = locationInput.value.toLowerCase().trim();
        const event = new CustomEvent('performSearch', { detail: { query } });
        document.dispatchEvent(event);
        console.log('Search dispatched:', query);
    };
  }