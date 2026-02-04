export default async function decorate(block) {
    console.log('🚀 Listings Branch Loaded!'); 
  
    const link = block.querySelector('a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
  
    // Fetch Data
    const resp = await fetch(path);
    if (!resp.ok) {
      console.error('❌ Failed to load listings.json');
      return;
    }
  
    const json = await resp.json();
    
    // Clear the block only after data is found
    block.textContent = '';
    
    const ul = document.createElement('ul');
    
    json.data.forEach((row) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="listing-image">
          <picture>
            <img src="${row.image}" alt="${row.name}">
          </picture>
        </div>
        <div class="listing-body">
          <h3>${row.name}</h3>
          <p>${row.distance}</p>
          <p class="price"><strong>$${row.price}</strong> / night</p>
        </div>
      `;
      ul.append(li);
    });
  
    block.append(ul);
  }