import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  // 1. Fetch Data
  const response = await fetch('/listings.json');
  const json = await response.json();
  
  // 2. Setup State
  let currentFilter = 'all';
  let currentSearchQuery = '';
  
  // LOAD FAVORITES: Check browser storage for saved likes
  let favorites = JSON.parse(localStorage.getItem('hotelo-favorites')) || [];

  // 3. Helper: Filter Logic
  function applyFilterAndSearch() {
    const cards = block.querySelectorAll('.card');
    cards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        const titleElement = card.querySelector('h3');
        const cardTitle = titleElement ? titleElement.innerText.toLowerCase() : '';

        const matchesFilter = currentFilter === 'all' || currentFilter === cardCategory;
        const matchesSearch = currentSearchQuery === '' || cardTitle.includes(currentSearchQuery);

        if (matchesFilter && matchesSearch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
  }

  // 4. Render Cards
  block.textContent = '';
  const ul = document.createElement('ul');
  
  json.data.forEach((property) => {
    const li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('data-category', property.category);
    li.setAttribute('data-id', property.id); // We need ID to track specific likes
    
    // CHECK IF LIKED: Is this ID in our list?
    const isLiked = favorites.includes(property.id.toString());
    
    li.innerHTML = `
        <div class="heart-icon ${isLiked ? 'liked' : ''}" data-id="${property.id}">&#10084;</div>
        
        <div class="listing-image">
            <img src="${property.image}" alt="${property.name}">
        </div>
        <div class="listing-body">
            <h3>${property.name}</h3>
            <p>${property.distance}</p>
            <p>${property.dates}</p>
            <p class="price"><strong>$${property.price}</strong>/night</p>
        </div>
    `;
    ul.append(li);
  });
  block.append(ul);

  // 5. EVENT LISTENERS
  
  // A. Heart Click Listener (Delegation)
  // We use the block listener to catch clicks on any heart
  block.addEventListener('click', (e) => {
    if (e.target.classList.contains('heart-icon')) {
        // Prevent the Card Click (so it doesn't open the page)
        e.stopPropagation();
        
        const heart = e.target;
        const id = heart.getAttribute('data-id');
        
        // Toggle Logic
        if (favorites.includes(id)) {
            // Remove from array
            favorites = favorites.filter(favId => favId !== id);
            heart.classList.remove('liked');
        } else {
            // Add to array
            favorites.push(id);
            heart.classList.add('liked');
        }
        
        // Save to Browser Storage
        localStorage.setItem('hotelo-favorites', JSON.stringify(favorites));
    }
  });

  // B. Search & Filter Listeners
  document.addEventListener('performSearch', (event) => {
    currentSearchQuery = event.detail.query.toLowerCase().trim();
    applyFilterAndSearch();
  });

  document.addEventListener('performFilter', (event) => {
    currentFilter = event.detail.category;
    applyFilterAndSearch();
  });
}