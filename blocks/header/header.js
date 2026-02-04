import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  // 1. Load the Nav Document (Content)
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // 2. Create the HTML Structure (Matching your index.html)
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <div class="logo">
        <img src="/media/logo.webp" alt="Hotelo Logo" onerror="this.style.display='none';this.parentNode.innerText='Hotelo'">
    </div>
    <button class="hamburger" id="hamburger">
        <span></span>
        <span></span>
        <span></span>
    </button>
  `;

  // 3. Extract the Link List from the Fragment
  // We assume your /nav document has a bulleted list. 
  // We grab that list and make it your "nav-menu"
  const ul = fragment.querySelector('ul');
  if (ul) {
    ul.id = 'nav-menu';
    nav.append(ul);
  }

  // 4. Add the Hamburger Logic (From your script.js)
  const hamburger = nav.querySelector('#hamburger');
  const navMenu = nav.querySelector('#nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // 5. Clear and Append
  block.textContent = '';
  block.append(nav);
}