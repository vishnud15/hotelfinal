/**
 * Filters Block
 * Category filter bar with active state management
 */

// Configuration
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'beach', label: 'Beachfront' },
  { id: 'cabins', label: 'Cabins' },
  { id: 'exp', label: 'Experiences' },
  { id: 'serv', label: 'Services' }
];

export default function decorate(block) {
  // Create HTML
  block.innerHTML = createFiltersHTML();
  
  // Initialize click handlers
  initFilterHandlers(block);
}

/**
 * Creates the filters HTML
 */
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

/**
 * Initialize filter click handlers
 */
function initFilterHandlers(block) {
  const filterItems = block.querySelectorAll('.filter-item');
  
  filterItems.forEach((item) => {
    item.addEventListener('click', () => {
      handleFilterClick(item, filterItems);
    });
  });
}

/**
 * Handle filter click
 */
function handleFilterClick(clickedItem, allItems) {
  // Update visual state
  allItems.forEach(item => item.classList.remove('active'));
  clickedItem.classList.add('active');
  
  // Dispatch filter event
  const category = clickedItem.getAttribute('data-filter');
  const filterEvent = new CustomEvent('performFilter', {
    detail: { category }
  });
  document.dispatchEvent(filterEvent);
}
