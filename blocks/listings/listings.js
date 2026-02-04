export default async function decorate(block) {
  // 1. Fetch Data
  const response = await fetch('/listings.json');
  const json = await response.json();
  
  // 2. Clear Block
  block.textContent = '';
  const ul = document.createElement('ul');
  
  // 3. Create Cards
  json.data.forEach((property) => {
    const li = document.createElement('li');
    li.className = 'card';
    
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

  // 4. Search Listener
  document.addEventListener('performSearch', (event) => {
    const query = event.detail.query.toLowerCase().trim();
    const cards = block.querySelectorAll('.card');

    cards.forEach((card) => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (query === '' || title.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
  });
}