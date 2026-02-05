import { loadCSS } from '../../scripts/aem.js';

export default async function decorate(block) {
  // 1. FETCH THE NAV CONTENT
  const resp = await fetch('/nav.plain.html');
  if (!resp.ok) {
    console.error("Could not fetch nav.plain.html");
    return;
  }
  const html = await resp.text();
  block.innerHTML = html;

  // 2. CREATE THE CONTAINER
  const nav = document.createElement('nav');
  nav.className = 'nav-wrapper';

  // 3. SMART LOGO FINDER
  // First, look for an image
  let logoEl = block.querySelector('picture, img');
  
  // If no image, look for a Heading (H1, H2) or the first text link
  if (!logoEl) {
    logoEl = block.querySelector('h1, h2');
  }

  // Create Logo Container
  const logoContainer = document.createElement('div');
  logoContainer.className = 'logo';
  
  if (logoEl) {
    logoContainer.append(logoEl);
  } else {
    // Fallback: If absolutely nothing is found, create text
    logoContainer.innerHTML = '<a href="/">Hotelo</a>';
  }
  nav.append(logoContainer);

  // 4. SMART MENU BUILDER (The Fix)
  // Try to find a list first
  let ul = block.querySelector('ul');

  // IF NO LIST FOUND: Create one from any stray links
  if (!ul) {
    const allLinks = block.querySelectorAll('a');
    if (allLinks.length > 0) {
      ul = document.createElement('ul');
      allLinks.forEach(link => {
        // Don't duplicate the logo link if we just used it
        if (!logoContainer.contains(link)) {
            const li = document.createElement('li');
            li.append(link);
            ul.append(li);
        }
      });
    }
  }

  // Add the Menu to the Nav
  if (ul) {
    ul.classList.add('nav-list');
    nav.append(ul);
  }

  // 5. CLEAN UP & RENDER
  block.textContent = '';
  block.append(nav);

  // 6. HAMBURGER BUTTON (Mobile)
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = `<span></span><span></span><span></span>`;
  nav.insertBefore(hamburger, ul); // Sit between Logo and Menu

  // 7. EVENT LISTENER
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !expanded);
    if (ul) ul.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}