import { loadCSS } from '../../scripts/aem.js';

export default function decorate(block) {
  // 1. Reuse your HTML Structure
  block.innerHTML = `
    <div class="filter-bar">
        <div class="filter-item active" data-filter="all">All</div>
        <div class="filter-item" data-filter="beach">Beachfront</div>
        <div class="filter-item" data-filter="cabins">Cabins</div>
        <div class="filter-item" data-filter="exp">Experiences</div>
        <div class="filter-item" data-filter="serv">Services</div>
    </div>
  `;

  // 2. Reuse your Event Listener Logic
  const filters = block.querySelectorAll('.filter-item');

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
        // Visual: Remove active from all, add to clicked
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        // Logic: Dispatch the filter event
        const category = filter.getAttribute('data-filter');
        const event = new CustomEvent('performFilter', { detail: { category } });
        document.dispatchEvent(event);
    });
  });
}