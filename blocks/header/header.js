import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.key === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    
    if (!isDesktop.matches) {
      toggleMenu(nav, false);
      nav.querySelector('button').focus();
    }
  }
}

function toggleMenu(nav, shouldOpen) {
  const isOpen = shouldOpen ?? nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  
  nav.setAttribute('aria-expanded', isOpen);
  button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = isOpen ? 'hidden' : '';
  
  if (isOpen) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';

  // Get menu list
  const list = fragment.querySelector('ul');
  if (list) {
    navSections.append(list);
  }

  // Get logo (image or text)
  const logoImg = fragment.querySelector('img, picture');
  const logoText = fragment.querySelector('h1, h2, p');
  
  if (logoImg) {
    navBrand.append(logoImg);
  } else if (logoText) {
    navBrand.append(logoText);
  } else {
    navBrand.innerHTML = '<a href="/">Hotelo</a>';
  }

  // Build nav
  nav.append(navBrand);
  nav.append(navSections);

  // Add hamburger
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>
  `;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  
  nav.setAttribute('aria-expanded', 'false');
  
  // Close menu on desktop
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) {
      toggleMenu(nav, false);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  
  block.textContent = '';
  block.append(navWrapper);

  // Remove empty links
  nav.querySelectorAll('a').forEach((link) => {
    if (!link.textContent.trim() && !link.querySelector('img')) {
      if (link.closest('li')) {
        link.closest('li').remove();
      } else {
        link.remove();
      }
    }
  });
}
