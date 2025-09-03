// Multilingual System for Privacy Center

const translations = {
  it: {
    // Header
    companyName: "PPE Corp.",
    privacyCenter: "Privacy Center",
    subtitle: "qui puoi trovare le informative privacy di tutti i nostri prodotti",

    // Navigation
    read: "Leggi",
    back: "Torna alla home",
    backToHome: "← Torna alla home",
    backToLanguages: "Torna alle lingue",
    latest: "Più recente",
    version: "Versione:",
    latestVersion: "Più recente (v1.0)",
    currentLang: "🇮🇹 IT",

    // Search
    searchPlaceholder: "Cerca informative...",
    search: "Cerca",

    // Language names
    languages: {
      it: "Italiano",
      en: "English",
      fr: "Français",
      de: "Deutsch",
      sl: "Slovenščina"
    },

    // App descriptions
    apps: {
      app1: {
        name: "App1",
        description: "Descrizione dell'applicazione 1"
      },
      app2: {
        name: "App2",
        description: "Descrizione dell'applicazione 2"
      }
    }
  },

  en: {
    // Header
    companyName: "PPE Corp.",
    privacyCenter: "Privacy Center",
    subtitle: "here you can find the privacy notices of all our products",

    // Navigation
    read: "Read",
    back: "Back to home",
    backToHome: "← Back to home",
    backToLanguages: "Back to languages",
    latest: "Latest",
    version: "Version:",
    latestVersion: "Latest (v1.0)",
    currentLang: "🇬🇧 EN",

    // Search
    searchPlaceholder: "Search notices...",
    search: "Search",

    // Language names
    languages: {
      it: "Italian",
      en: "English",
      fr: "French",
      de: "German",
      sl: "Slovenian"
    },

    // App descriptions
    apps: {
      app1: {
        name: "App1",
        description: "Application 1 description"
      },
      app2: {
        name: "App2",
        description: "Application 2 description"
      }
    }
  },

  fr: {
    // Header
    companyName: "PPE Corp.",
    privacyCenter: "Privacy Center",
    subtitle: "ici vous pouvez trouver les notices de confidentialité de tous nos produits",

    // Navigation
    read: "Lire",
    back: "Retour à l'accueil",
    backToHome: "← Retour à l'accueil",
    backToLanguages: "Retour aux langues",
    latest: "Dernière",
    version: "Version :",
    latestVersion: "Dernière (v1.0)",
    currentLang: "🇫🇷 FR",

    // Search
    searchPlaceholder: "Rechercher des notices...",
    search: "Rechercher",

    // Language names
    languages: {
      it: "Italien",
      en: "Anglais",
      fr: "Français",
      de: "Allemand",
      sl: "Slovène"
    },

    // App descriptions
    apps: {
      app1: {
        name: "App1",
        description: "Description de l'application 1"
      },
      app2: {
        name: "App2",
        description: "Description de l'application 2"
      }
    }
  },

  de: {
    // Header
    companyName: "PPE Corp.",
    privacyCenter: "Privacy Center",
    subtitle: "hier finden Sie die Datenschutzhinweise all unserer Produkte",

    // Navigation
    read: "Lesen",
    back: "Zurück zur Startseite",
    backToHome: "← Zurück zur Startseite",
    backToLanguages: "Zurück zu den Sprachen",
    latest: "Neueste",
    version: "Version:",
    latestVersion: "Neueste (v1.0)",
    currentLang: "🇩🇪 DE",

    // Search
    searchPlaceholder: "Hinweise suchen...",
    search: "Suchen",

    // Language names
    languages: {
      it: "Italienisch",
      en: "Englisch",
      fr: "Französisch",
      de: "Deutsch",
      sl: "Slowenisch"
    },

    // App descriptions
    apps: {
      app1: {
        name: "App1",
        description: "Beschreibung der Anwendung 1"
      },
      app2: {
        name: "App2",
        description: "Beschreibung der Anwendung 2"
      }
    }
  },

  sl: {
    // Header
    companyName: "PPE Corp.",
    privacyCenter: "Privacy Center",
    subtitle: "tukaj najdete obvestila o zasebnosti vseh naših izdelkov",

    // Navigation
    read: "Preberi",
    back: "Nazaj na domačo stran",
    backToHome: "← Nazaj na domačo stran",
    backToLanguages: "Nazaj na jezike",
    latest: "Najnovejša",
    version: "Različica:",
    latestVersion: "Najnovejša (v1.0)",
    currentLang: "🇸🇮 SL",

    // Search
    searchPlaceholder: "Iskanje obvestil...",
    search: "Iskanje",

    // Language names
    languages: {
      it: "Italijanski",
      en: "Angleški",
      fr: "Francoski",
      de: "Nemški",
      sl: "Slovenščina"
    },

    // App descriptions
    apps: {
      app1: {
        name: "App1",
        description: "Opis aplikacije 1"
      },
      app2: {
        name: "App2",
        description: "Opis aplikacije 2"
      }
    }
  }
};

// Language detection and management
class LanguageManager {
  constructor() {
    this.translations = translations;
    this.currentLang = this.detectLanguage();
  }

  detectLanguage() {
    // Check sessionStorage first (user's selected language)
    const sessionLang = sessionStorage.getItem('selectedLanguage');
    if (sessionLang && this.translations[sessionLang]) {
      return sessionLang;
    }

    // Check URL path
    const pathLang = window.location.pathname.split('/')[1];
    if (pathLang && this.translations[pathLang]) {
      return pathLang;
    }

    // Check localStorage
    const storedLang = localStorage.getItem('privacy-center-lang');
    if (storedLang && this.translations[storedLang]) {
      return storedLang;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.translations[browserLang]) {
      return browserLang;
    }

    // Default to Italian
    return 'it';
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('privacy-center-lang', lang);

      // Update URL if not already correct
      const currentPath = window.location.pathname;
      const pathLang = currentPath.split('/')[1];

      if (pathLang !== lang) {
        const newPath = currentPath.replace(/^\/[^\/]*/, `/${lang}`);
        window.location.href = newPath;
      }

      return true;
    }
    return false;
  }

  getTranslation(key, fallback = '') {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];

    for (const k of keys) {
      value = value && value[k];
    }

    return value || fallback;
  }

  getCurrentTranslations() {
    return this.translations[this.currentLang];
  }

  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

// Global language manager instance
const langManager = new LanguageManager();

// Export for global use
window.LanguageManager = LanguageManager;
window.langManager = langManager;
