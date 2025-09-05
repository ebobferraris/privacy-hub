const { loadLocales } = require('../_utils/locales');

/**
 * Filters configuration for Eleventy
 * Defines all custom filters for templates
 */

module.exports = {
  setup(eleventyConfig) {
    // URL and search filters
    eleventyConfig.addFilter("getSearchParam", function(url) {
      if (!url) return null;
      try {
        const urlObj = new URL(url, 'http://localhost');
        return urlObj.searchParams.get('search') || null;
      } catch (error) {
        return null;
      }
    });

    // Language filters
    eleventyConfig.addFilter("getLanguageName", function(code) {
      const names = { 
        it: 'Italiano', 
        en: 'English', 
        fr: 'Français', 
        de: 'Deutsch', 
        sl: 'Slovenščina', 
        es: 'Español' 
      };
      return names[code] || code.toUpperCase();
    });

    // Array/Object utility filters
    eleventyConfig.addFilter("find", function(array, key, value) {
      if (!Array.isArray(array)) return null;
      return array.find(item => item[key] === value);
    });

    eleventyConfig.addFilter("get", function(obj, key) {
      if (!obj || typeof obj !== 'object') return null;
      return obj[key];
    });

    eleventyConfig.addFilter("map", function(array, key) {
      if (!Array.isArray(array)) return [];
      return array.map(item => item[key]);
    });

    eleventyConfig.addFilter("json", function(value) {
      return JSON.stringify(value);
    });

    // Notice-specific filters
    eleventyConfig.addFilter("findNotice", function(notices, noticeId) {
      return notices.find(notice => notice.id === noticeId);
    });

    eleventyConfig.addFilter("findVersion", function(versions, url) {
      if (!versions || versions.length === 0) return null;

      // Check if URL contains a specific version
      const versionMatch = url.match(/\/v([\d\.]+)\//);
      if (versionMatch) {
        const requestedVersion = 'v' + versionMatch[1];
        return versions.find(v => v.version === requestedVersion) || versions.find(v => v.isLatest);
      }

      // Default to latest
      return versions.find(v => v.isLatest) || versions[0];
    });

    eleventyConfig.addFilter("findLatestVersion", function(versions) {
      if (!versions || versions.length === 0) return null;
      const latest = versions.find(v => v.isLatest);
      return latest ? latest.version : null;
    });

    // Translation filter
    eleventyConfig.addFilter("t", function(key, lang = 'it', params = {}) {
      const locales = loadLocales();
      const locale = locales[lang] || locales['it'];

      if (!locale) return key;

      // Navigate through nested object with dot notation
      const keys = key.split('.');
      let value = locale;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key if not found
        }
      }

      // Replace parameters if they exist
      if (typeof value === 'string' && params) {
        Object.keys(params).forEach(param => {
          value = value.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });
      }

      return value;
    });
  }
};
