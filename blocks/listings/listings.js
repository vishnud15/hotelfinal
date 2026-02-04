import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  // 1. Fetch the data
  const response = await fetch('/listings.json');
  const json = await response.json();
  
  // 2. Setup Memory (This remembers your choices)
  let currentFilter = 'all';
  let currentSearchQuery = '';

  // 3. The "Master" Filter Function
  // This checks EVERY card against BOTH the search text and the category button
  function applyFilterAndSearch() {
    console.log(`Applying -- Filter: ${currentFilter} | Search: "${currentSearchQuery}"`);
    
    const cards = block.querySelectorAll('.card');

    cards.forEach((card) => {
        // Get the data from the card
        const cardCategory = card.getAttribute('data-category');
        const titleElement = card.querySelector('h3');
        const cardTitle = titleElement ? titleElement.innerText.toLowerCase() : '';

        // Rule 1: Does it match the Category? (or is filter 'all'?)
        const matchesFilter = currentFilter === 'all' || currentFilter === cardCategory;
        
        // Rule 2: Does it match the Search Text? (or is search empty?)
        const matchesSearch = currentSearchQuery === '' || cardTitle.includes(currentSearchQuery);

        // DECISION: Only show if BOTH rules are true
        if (matchesFilter && matchesSearch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
  }

  // 4. Render the Cards initially
  block.textContent = '';
  const ul = document.createElement('ul');
  
  json.data.forEach((property) => {
    const li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('data-category', property.category); // <--- Crucial for filtering
    li.setAttribute('data-id', property.id);
    
    li.innerHTML = `
        <div class="heart-icon">&#10084;</div>
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

  // 5. Add Event Listeners (The "Ears")

  // Listen for SEARCH (from search.js)
  document.addEventListener('performSearch', (event) => {
    currentSearchQuery = event.detail.query.toLowerCase().trim();
    applyFilterAndSearch();
  });

  // Listen for FILTER (from filters.js)
  document.addEventListener('performFilter', (event) => {
    console.log('Filter clicked:', event.detail.category); // Debug message
    currentFilter = event.detail.category;
    applyFilterAndSearch();
  });
}