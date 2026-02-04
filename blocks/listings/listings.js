export default async function decorate(block) {
    const link = block.querySelector('a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
  
    // 1. Fetch Data FIRST
    const resp = await fetch(path);
    
    // 🔴 SAFETY CHECK: If fetch fails, STOP.
    // The Blue Link will stay on screen so you KNOW the data is missing.
    if (!resp.ok) {
      console.error('❌ Failed to load listings.json. Status:', resp.status);
      return; 
    }
  
    const json = await resp.json();
    
    // 2. Data is good! NOW we clear the screen.
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