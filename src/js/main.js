// Main JavaScript for Privacy Center

// Utility functions for safe DOM access
function safeQuerySelector(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`Error querying selector "${selector}":`, error);
    return null;
  }
}

function safeQuerySelectorAll(selector) {
  try {
    return document.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Error querying selector "${selector}":`, error);
    return [];
  }
}

function safeGetElementById(id) {
  try {
    return document.getElementById(id);
  } catch (error) {
    console.warn(`Error getting element by ID "${id}":`, error);
    return null;
  }
}

// Initialize the application with error handling
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize language system
    initializeLanguageSystem();

    // Handle version selector changes
    const versionSelects = safeQuerySelectorAll('#version-select');
    versionSelects.forEach(select => {
      if (select) {
        select.addEventListener('change', function(e) {
          const version = e.target.value;
          loadVersionContent(version);
        });
      }
    });

    // Initialize search functionality
    initializeSearch();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
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
  try {
    // Update elements with data-translate attribute
    const translatableElements = safeQuerySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
      if (element) {
        const key = element.getAttribute('data-translate');
        let translation = window.langManager.getTranslation(key);
        if (translation) {
          if (key === 'ui.chooseLanguage') {
            // Replace {app} placeholder with actual app name
            const appName = element.closest('.notice-placeholder').querySelector('h1').textContent.split(' - ')[0];
            translation = translation.replace('{app}', appName);
          }

          if (element.tagName === 'INPUT' && element.type === 'placeholder') {
            element.placeholder = translation;
          } else {
            element.textContent = translation;
          }
        }
      }
    });

    // Update elements with data-translate-title attribute
    const titleElements = safeQuerySelectorAll('[data-translate-title]');
    titleElements.forEach(element => {
      if (element) {
        const key = element.getAttribute('data-translate-title');
        const translation = window.langManager.getTranslation(key);
        if (translation) {
          element.title = translation;
        }
      }
    });
  } catch (error) {
    console.error('Error updating page translations:', error);
  }
}



// Search functionality
function initializeSearch() {
  try {
    const searchInput = safeGetElementById('search-input');
    const searchButton = safeGetElementById('search-button');

    if (searchInput && searchButton) {
      // Update placeholder with translation (if langManager is available)
      if (typeof window !== 'undefined' && typeof window.langManager !== 'undefined') {
        const placeholderText = window.langManager.getTranslation('searchPlaceholder');
        const buttonText = window.langManager.getTranslation('search');
        if (placeholderText) searchInput.placeholder = placeholderText;
        if (buttonText) searchButton.textContent = buttonText;
      }

      // Add search functionality
      searchButton.addEventListener('click', performSearch);
      searchInput.addEventListener('input', performSearch);
    }
  } catch (error) {
    console.error('Error initializing search:', error);
  }
}

function performSearch() {
  try {
    const searchInput = safeGetElementById('search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const cards = safeQuerySelectorAll('.notice-card');

    cards.forEach(card => {
      if (card) {
        const titleElement = card.querySelector('h3');
        const descriptionElement = card.querySelector('p');

        if (titleElement && descriptionElement) {
          const title = titleElement.textContent.toLowerCase();
          const description = descriptionElement.textContent.toLowerCase();

          if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
  }
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
  const menu = safeGetElementById('language-menu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

function changeLanguage(lang) {
  try {
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
  } catch (error) {
    console.error('Error changing language:', error);
  }
}

// Update the language dropdown display based on sessionStorage
function updateLanguageDropdownDisplay() {
  try {
    const currentLangElement = safeQuerySelector('.current-lang');
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
  } catch (error) {
    console.error('Error updating language dropdown display:', error);
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = safeGetElementById('language-dropdown');
  const menu = safeGetElementById('language-menu');

  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove('show');
  }
});

// Show translation warning banner if needed
function showTranslationWarning() {
  try {
    const warningBanner = safeGetElementById('translation-warning');
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
          try {
            warningBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } catch (scrollError) {
            console.warn('Error scrolling to warning banner:', scrollError);
          }
        }, 500);
      }
    }
  } catch (error) {
    console.error('Error showing translation warning:', error);
  }
}

// Initialize warning banner on page load
document.addEventListener('DOMContentLoaded', function() {
  try {
    showTranslationWarning();
  } catch (error) {
    console.error('Error showing translation warning:', error);
  }
});
