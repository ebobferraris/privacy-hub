# Privacy Notice Management System

A comprehensive static website for providing privacy notices with automated versioning and multi-language support.

## 🌟 Features

- **Multiple Projects**: Support for numerous applications or projects
- **Multi-language Support**: Made to support multiple languages both for privacy notices and user interface (with Italian as main language)
- **Automated Versioning**: Automatic archiving and version management
- **Translation Warnings**: Automatic detection of outdated translations
- **Search Functionality**: Client-side search across all notices

- **Static Generation**: Fast, SEO-friendly static site with Eleventy
- **Responsive Design**: Mobile-friendly interface

- **GitHub Actions CI/CD**: Fully automated deployment pipeline

## 📌 Quick Start

### **Local Development**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your privacy notices:**
   Place your markdown files in the `notices/` directory following this structure:
   ```
   notices/
   ├── app1/
   │   ├── metadata.json
   │   ├── it/
   │   │   └── latest.md
   │   └── en/
   │       └── latest.md
   └── app2/
       ├── metadata.json
       └── it/
           └── latest.md
   ```

3. **Process versions:**
   ```bash
   npm run process-versions
   ```

4. **Check translation status:**
   ```bash
   npm run check-status
   ```

5. **Build the site:**
   ```bash
   npm run build
   ```

6. **Start development server:**
   ```bash
   npm run start
   ```

### **Automated Deployment**

The system includes **fully automated CI/CD** via GitHub Actions:

1. **Push to main branch** - GitHub Actions automatically:
   - Detects notice content changes
   - Processes and archives versions
   - Updates metadata files
   - Commits version changes
   - Builds the static site
   - Deploys to GitHub Pages

2. **Manual processing** (if needed):
   ```bash
   npm run ci-prepare  # Process versions + check status
   ```

## 🗂️ Directory Structure

```
privacy-hub/
├── notices/                 # Privacy notice content
│   ├── app1/
│   │   ├── metadata.json    # App metadata
│   │   ├── it/             # Italian version
│   │   │   ├── latest.md   # Current version
│   │   │   └── v1.0/       # Archived versions
│   │   └── en/             # English translation
│   │       ├── latest.md
│   │       └── v1.0/
│   └── app2/               # Another app
├── src/                    # Eleventy source files
│   ├── _layouts/
│   ├── css/
│   ├── js/
│   └── *.njk              # Templates
├── _site/                 # Generated static site
├── version-manager.js     # Version management script
├── .eleventy.js          # Eleventy configuration
└── package.json          # Dependencies and scripts
```

## 🗄️ Version Management

The system automatically manages versions when you update content, you only have to **update your markdown file** in `latest.md` and **run version processing** `npm run process-versions` or **wait for the Github Action to complete**, the:

1. **Old version is automatically archived** to `v{version}/` directory
2. **Metadata is updated** with version information

## ⚠️ **Translation Warnings**

The system automatically detects when privacy notices' translations are outdated or doesn't exist:
- Compares version numbers between main language (Italian) and translations
- Shows warning banners to the user when translations are behind or doesn't exist

## 🌍 Translation System

The system uses a **JSON-based translation system** for multi-language support of the user interface:

### **Translation Files**
Located in `src/_data/locales/`:
- `it.json` - Italian (main language)
- `en.json` - English
- `fr.json` - French
- `de.json` - German
- `sl.json` - Slovenian

### **Translation Format**
```json
{
  "ui": {
    "privacyCenter": "Centro Privacy",
    "search": "Cerca",
    "read": "Leggi"
  },
  "languages": {
    "it": "Italiano",
    "en": "English"
  }
}
```

### **Usage in Templates**
```nunjucks
{{ 'ui.privacyCenter' | t(lang) }}
```

## ✏️ Metadata Format

Each app needs a `metadata.json` file:

```json
{
  "name": "App Name",
  "description": "App description",
  "main_language": "it",
  "languages": ["it", "en"],
  "versions": ["1.0", "1.1"]
}
```

## 🔍 Markdown Frontmatter

Each notice file should have frontmatter:

```yaml
---
title: "Privacy Notice"
date: 2025-01-01
version: "1.0"
last_updated: "2025-01-01"
based_on_version: "1.0"
language: "it"
---

# Privacy Notice Content

Your markdown content here...
```

## 📜 Available Scripts

### **Development & Building**
- `npm run build` - Build static site for production
- `npm run start` - Start development server with live reload
- `npm run dev` - Development mode with file watching

### **Version Management**
- `npm run process-versions` - Process and archive notice versions
- `npm run check-status` - Check translation status across languages
- `npm run ci-prepare` - Combined CI script (versions + status check)
- `npm run version-manager` - Run version manager with custom options

### **Utility Scripts**
- `npm run build` - Generate static site in `_site/` directory
- `npm run start` - Serve site locally at `http://localhost:8080`

## 🔄 GitHub Actions Automation

The system includes **fully automated CI/CD** that handles the entire deployment process:

### **Automated Workflow**
1. **Push to main branch** triggers the workflow
2. **Content change detection** - Checks if `notices/` files were modified
3. **Version processing** - Automatically archives old versions
4. **Metadata updates** - Updates `metadata.json` files
5. **Auto-commit** - Commits version changes back to repository
6. **Build & validation** - Builds site and validates output
7. **Deploy** - Deploys to GitHub Pages

### **Workflow Features**
- **Smart detection** - Only processes versions when notices change
- **Error handling** - Comprehensive validation and error reporting
- **Version tracking** - Complete audit trail of changes
- **Translation monitoring** - Automatic status checks

## 🌐 GitHub Pages Configuration

The system is **optimized for GitHub Pages deployment** at `https://username.github.io/privacy-hub/`:

### **Path Configuration**
- All assets use `/privacy-hub/` base path
- CSS: `/privacy-hub/css/main.css`
- JavaScript: `/privacy-hub/js/main.js`
- Navigation links work from any page depth

### **Repository Setup**
1. Repository name: `privacy-hub`
2. GitHub Pages source: `/_site` directory
3. URL: `https://username.github.io/privacy-hub/`

## 🚀 Deployment

### **GitHub Pages (Recommended)**
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. The workflow automatically deploys on each push to main

### **Other Platforms**
The generated `_site/` directory is ready for deployment to:
- **Netlify** - Drag & drop `_site/` folder
- **Vercel** - Connect repository, set output to `_site/`
- **Any static hosting** - Upload `_site/` contents

## 📥 Add contents

The system is **fully automated** - when you push content changes:
- Versions are automatically processed and archived
- Metadata files are updated
- Site is built and deployed to GitHub Pages
- Translation status is monitored

### **Adding New Apps or Projects**
1. Create new directory in `notices/`
2. Add `metadata.json` with app information
3. Add language directories with `latest.md` files
4. Push to main, automation handles the rest

### **Adding New Translated Notices**
1. Choose the App directory in `notices/`
2. Add language directories with `latest.md` files
3. Update `metadata.json` with app new language
4. Push to main branch, automation handles the rest