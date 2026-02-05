import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Mobile breakpoint
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

export default async function decorate(block) {
  // 1. FETCH CONTENT
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // 2. SETUP CONTAINERS
  const nav = document.createElement('nav');
  nav.id = 'nav';
  
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';

  // 3. SMART SORTING
  // Find the List (Menu)
  const list = fragment.querySelector('ul');
  if (list) {
      // 3a. Check for "Hotelo" link inside the list (The Duplicate Fix)
      // If the first link is just the brand name, move it to Brand!
      const firstItem = list.querySelector('li');
      if (firstItem && firstItem.innerText.trim().toLowerCase() === 'hotelo') {
          navBrand.append(firstItem.querySelector('a') || firstItem.innerText);
          firstItem.remove(); // Remove it from the menu
      }
      navSections.append(list);
  }

  // 4. LOGO FINDER (If we didn't find it in the list)
  if (!navBrand.innerHTML.trim()) {
      // Look for an image or H1 in the rest of the fragment
      const logoImg = fragment.querySelector('img, picture');
      const logoText = fragment.querySelector('h1, h2, p');
      
      if (logoImg) {
          navBrand.append(logoImg);
      } else if (logoText) {
          navBrand.append(logoText);
      } else {
          navBrand.innerHTML = '<a href="/">Hotelo</a>';
      }
  }

  // 5. BUILD NAV
  nav.append(navBrand);
  nav.append(navSections);

  // 6. HAMBURGER
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.textContent = '';
  block.append(navWrapper);

  // 7. FINAL CLEANUP
  // Remove empty text nodes and phantom links
  nav.querySelectorAll('a').forEach((link) => {
    if (!link.textContent.trim() && !link.querySelector('img')) {
       if (link.closest('li')) link.closest('li').remove();
       else link.remove();
    }
  });
}