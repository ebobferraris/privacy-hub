const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Watch for changes in notices directory
  eleventyConfig.addWatchTarget("notices/");

  // Watch for changes in locales
  eleventyConfig.addWatchTarget("src/_data/locales/");

  // Custom collections
  eleventyConfig.addCollection("notices", function(collectionApi) {
    return getAllNotices();
  });

  // Custom data for notices
  eleventyConfig.addGlobalData("notices", function() {
    return getAllNotices();
  });



  // Add project pages
  eleventyConfig.addCollection("projects", function(collectionApi) {
    const notices = getAllNotices();
    return notices.map(notice => ({
      ...notice,
      url: `/notices/${notice.id}/`,
      data: { project: notice.id, layout: 'project.njk' }
    }));
  });

  // Add notice pages
  eleventyConfig.addCollection("allNotices", function(collectionApi) {
    const notices = getAllNotices();
    const allNotices = [];

    for (const notice of notices) {
      for (const lang of Object.keys(notice.available_languages)) {
        for (const version of notice.available_languages[lang]) {
          allNotices.push({
            project: notice.id,
            lang: lang,
            version: version.version,
            isLatest: version.isLatest,
            content: version.content,
            url: version.isLatest ? `/notices/${notice.id}/${lang}/` : `/notices/${notice.id}/${lang}/${version.version}/`,
            data: { layout: 'notice.njk', project: notice.id, lang: lang }
          });
        }
      }
    }

    return allNotices;
  });

  // Add filter to get search parameter from URL
  eleventyConfig.addFilter("getSearchParam", function(url) {
    if (!url) return null;
    try {
      const urlObj = new URL(url, 'http://localhost');
      return urlObj.searchParams.get('search') || null;
    } catch (error) {
      return null;
    }
  });

  // Load all locale files
  function loadLocales() {
    const localesDir = path.join(__dirname, 'src', '_data', 'locales');
    const locales = {};

    if (!fs.existsSync(localesDir)) {
      console.warn('Locales directory not found:', localesDir);
      return locales;
    }

    const localeFiles = fs.readdirSync(localesDir).filter(file =>
      file.endsWith('.json')
    );

    for (const file of localeFiles) {
      const langCode = file.replace('.json', '');
      const filePath = path.join(localesDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        locales[langCode] = JSON.parse(content);
      } catch (error) {
        console.warn(`Warning: Could not load locale file ${file}:`, error.message);
      }
    }

    return locales;
  }

  // Load localization data
  eleventyConfig.addGlobalData("locales", function() {
    return loadLocales();
  });

  // Load languages data
  eleventyConfig.addGlobalData("languages", function() {
    return require('./src/_data/languages.json');
  });

  // Add custom filters
  eleventyConfig.addFilter("getLanguageName", function(code) {
    const names = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español' };
    return names[code] || code.toUpperCase();
  });

  // Filter to find item in array by property
  eleventyConfig.addFilter("find", function(array, key, value) {
    if (!Array.isArray(array)) return null;
    return array.find(item => item[key] === value);
  });

  // Filter to get property from object
  eleventyConfig.addFilter("get", function(obj, key) {
    if (!obj || typeof obj !== 'object') return null;
    return obj[key];
  });

  // Filter to map array to property values
  eleventyConfig.addFilter("map", function(array, key) {
    if (!Array.isArray(array)) return [];
    return array.map(item => item[key]);
  });

  // Filter to convert to JSON string
  eleventyConfig.addFilter("json", function(value) {
    return JSON.stringify(value);
  });

  // Filter to find a notice by ID
  eleventyConfig.addFilter("findNotice", function(notices, noticeId) {
    return notices.find(notice => notice.id === noticeId);
  });

  // Filter to find the appropriate version based on URL
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

  // Filter to find the latest version number
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

  // Markdown processing
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let markdownLib = markdownIt(options).use(markdownItAnchor);

  eleventyConfig.setLibrary("md", markdownLib);

  // Add markdown filter for templates
  eleventyConfig.addFilter("markdown", function(content) {
    return markdownLib.render(content || '');
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    pathPrefix: "/privacy-hub/"
  };
};

function getAllNotices() {
  const noticesDir = path.join(__dirname, 'notices');
  const notices = [];

  if (!fs.existsSync(noticesDir)) return notices;

  const dirs = fs.readdirSync(noticesDir).filter(dir =>
    fs.statSync(path.join(noticesDir, dir)).isDirectory()
  );

  for (const dir of dirs) {
    const metadataPath = path.join(noticesDir, dir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const availableLanguages = getAvailableLanguages(path.join(noticesDir, dir));

        notices.push({
          id: dir,
          name: metadata.name || dir,
          description: metadata.description || '',
          main_language: metadata.main_language || 'it',
          languages: Object.keys(availableLanguages),
          available_languages: availableLanguages,
          versions: metadata.versions || []
        });
      } catch (error) {
        console.warn(`Warning: Could not parse metadata for ${dir}:`, error.message);
      }
    }
  }

  return notices;
}

function getAvailableLanguages(noticeDir) {
  const languages = {};
  const langDirs = fs.readdirSync(noticeDir).filter(dir =>
    fs.statSync(path.join(noticeDir, dir)).isDirectory() &&
    dir !== 'metadata.json'
  );

  for (const lang of langDirs) {
    const langPath = path.join(noticeDir, lang);
    const versions = getVersionsForLanguage(langPath);
    if (versions.length > 0) {
      languages[lang] = versions;
    }
  }

  return languages;
}

function getVersionsForLanguage(langPath) {
  const versions = [];
  const items = fs.readdirSync(langPath);

  // Check for latest.md
  const latestPath = path.join(langPath, 'latest.md');
  if (fs.existsSync(latestPath)) {
    const content = fs.readFileSync(latestPath, 'utf-8');
    const { data, content: body } = matter(content);
    versions.push({
      version: data.version || 'latest',
      isLatest: true,
      path: latestPath,
      content: body,
      ...data
    });
  }

  // Check for version directories
  const versionDirs = items.filter(item =>
    fs.statSync(path.join(langPath, item)).isDirectory() &&
    item.startsWith('v')
  );

  for (const versionDir of versionDirs) {
    const noticePath = path.join(langPath, versionDir, 'notice.md');
    if (fs.existsSync(noticePath)) {
      const content = fs.readFileSync(noticePath, 'utf-8');
      const { data, content: body } = matter(content);
      versions.push({
        version: data.version || versionDir,
        isLatest: false,
        path: noticePath,
        content: body,
        ...data
      });
    }
  }

  return versions.sort((a, b) => {
    // Sort by version, latest first
    if (a.isLatest) return -1;
    if (b.isLatest) return 1;
    return b.version.localeCompare(a.version);
  });
}
