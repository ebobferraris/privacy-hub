// Main JavaScript for Privacy Center

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize language system
  initializeLanguageSystem();

  // Handle version selector changes
  const versionSelects = document.querySelectorAll('#version-select');
  versionSelects.forEach(select => {
    select.addEventListener('change', function(e) {
      const version = e.target.value;
      loadVersionContent(version);
    });
  });

  // Initialize search functionality
  initializeSearch();
});

// Language System Initialization
function initializeLanguageSystem() {
  // Check if langManager is available, if not, wait for it
  if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
    // Update page content with translations
    updatePageTranslations();

    // Update dropdown to reflect stored language preference
    updateLanguageDropdownDisplay();
  } else {
    // If langManager is not ready yet, wait a bit and try again
    setTimeout(initializeLanguageSystem, 10);
  }
}

// Update all translatable elements on the page
function updatePageTranslations() {
  // Update elements with data-translate attribute
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = window.langManager.getTranslation(key);
    if (translation) {
      if (element.tagName === 'INPUT' && element.type === 'placeholder') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // Update elements with data-translate-title attribute
  document.querySelectorAll('[data-translate-title]').forEach(element => {
    const key = element.getAttribute('data-translate-title');
    const translation = window.langManager.getTranslation(key);
    if (translation) {
      element.title = translation;
    }
  });
}



// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  if (searchInput && searchButton) {
    // Update placeholder with translation (if langManager is available)
    if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
      searchInput.placeholder = window.langManager.getTranslation('searchPlaceholder');
      searchButton.textContent = window.langManager.getTranslation('search');
    }

    // Add search functionality
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('input', performSearch);
  }
}

function performSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll('.notice-card');

  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();

    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Version content loading (placeholder for now)
function loadVersionContent(version) {
  console.log('Loading version:', version);
  // In a real implementation, this would fetch the content
  // For now, it's handled in the individual notice template
}

// Utility functions
function getLanguageName(code) {
  if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
    return window.langManager.getTranslation(`languages.${code}`) || code.toUpperCase();
  }
  const names = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español' };
  return names[code] || code.toUpperCase();
}

// Version comparison utility
function compareVersions(version1, version2) {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

// Language dropdown functionality
function toggleLanguageDropdown() {
  const menu = document.getElementById('language-menu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

function changeLanguage(lang) {
  // Store selected language in sessionStorage
  sessionStorage.setItem('selectedLanguage', lang);

  if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
    // Update the current language in langManager
    window.langManager.currentLang = lang;

    // Re-run translation updates
    updatePageTranslations();

    // Update current language display specifically
    updateLanguageDropdownDisplay();
  } else {
    // Fallback: redirect to the language-specific URL
    window.location.href = `/${lang}/`;
  }
}

// Update the language dropdown display based on sessionStorage
function updateLanguageDropdownDisplay() {
  const currentLangElement = document.querySelector('.current-lang');
  if (!currentLangElement) return;

  // Check sessionStorage first for user's selected language
  let storedLang = sessionStorage.getItem('selectedLanguage');

  // If no stored language, set Italian as default
  if (!storedLang) {
    storedLang = 'it';
    sessionStorage.setItem('selectedLanguage', 'it');
  }

  if (storedLang && typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
    // Update langManager to use stored language
    window.langManager.currentLang = storedLang;

    // Update the display with the stored language
    const currentLangText = window.langManager.getTranslation('currentLang');
    if (currentLangText) {
      currentLangElement.textContent = currentLangText;
    }
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('language-dropdown');
  const menu = document.getElementById('language-menu');

  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove('show');
  }
});

// Show translation warning banner if needed
function showTranslationWarning() {
  const warningBanner = document.getElementById('translation-warning');
  if (warningBanner) {
    // Check if we arrived here because translation was not available
    const urlParams = new URLSearchParams(window.location.search);
    const showWarning = urlParams.get('warning') === 'translation-unavailable';

    // Also check referrer - if coming from homepage, might need warning
    const referrer = document.referrer;
    const isFromHomepage = referrer && (
      referrer.includes('/en/') ||
      referrer.includes('/fr/') ||
      referrer.includes('/de/') ||
      referrer.includes('/sl/')
    );

    if (showWarning || (isFromHomepage && !window.location.pathname.includes('/it/'))) {
      warningBanner.style.display = 'block';

      // Scroll to warning after a short delay
      setTimeout(() => {
        warningBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 500);
    }
  }
}

// Initialize warning banner on page load
document.addEventListener('DOMContentLoaded', function() {
  showTranslationWarning();
});

// Search functionality (if needed for dynamic search)
function performSearch(query) {
  // This could be enhanced for more complex search
  console.log('Searching for:', query);
}
