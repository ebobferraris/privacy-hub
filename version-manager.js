#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

/**
 * Version Manager for Privacy Notices
 * Automatically archives old versions when new content is added
 */

class VersionManager {
  constructor(noticesDir = 'notices') {
    this.noticesDir = noticesDir;
  }

  /**
   * Process all notices and archive old versions
   */
  async processAllNotices() {
    console.log('🔄 Processing all notices for versioning...');

    const notices = this.getAllNoticeDirs();

    for (const noticeId of notices) {
      await this.processNotice(noticeId);
    }

    console.log('✅ Version processing complete');

    // Automatically build the static site
    await this.buildStaticSite();
  }

  /**
   * Process a specific notice
   */
  async processNotice(noticeId) {
    const noticePath = path.join(this.noticesDir, noticeId);
    const metadataPath = path.join(noticePath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) {
      console.log(`⚠️  No metadata found for ${noticeId}, skipping`);
      return;
    }

    const metadata = await fs.readJson(metadataPath);
    const mainLang = metadata.main_language || 'it';

    console.log(`📝 Processing ${noticeId}...`);

    // Process each language
    const langDirs = await this.getLanguageDirs(noticePath);

    for (const lang of langDirs) {
      await this.processLanguage(noticePath, noticeId, lang, mainLang);
    }
  }

  /**
   * Process a specific language for a notice
   */
  async processLanguage(noticePath, noticeId, lang, mainLang) {
    const langPath = path.join(noticePath, lang);
    const latestPath = path.join(langPath, 'latest.md');

    if (!await fs.pathExists(latestPath)) {
      console.log(`⚠️  No latest.md found for ${noticeId}/${lang}, skipping`);
      return;
    }

    // Read the current latest content
    const latestContent = await fs.readFile(latestPath, 'utf-8');
    const { data: frontmatter, content } = matter(latestContent);

    const currentVersion = frontmatter.version;

    if (!currentVersion) {
      console.log(`⚠️  No version found in frontmatter for ${noticeId}/${lang}, skipping`);
      return;
    }

    // Check if this version already exists
    const versionDir = path.join(langPath, `v${currentVersion}`);
    const versionFile = path.join(versionDir, 'notice.md');

    if (await fs.pathExists(versionFile)) {
      console.log(`ℹ️  Version ${currentVersion} already exists for ${noticeId}/${lang}`);
      return;
    }

    // Create version directory and archive the current content
    await fs.ensureDir(versionDir);
    await fs.writeFile(versionFile, latestContent);

    console.log(`📦 Archived version ${currentVersion} for ${noticeId}/${lang}`);

    // Update metadata with version info
    await this.updateMetadataVersions(noticePath, noticeId, lang, currentVersion);
  }

  /**
   * Update metadata with version information
   */
  async updateMetadataVersions(noticePath, noticeId, lang, version) {
    const metadataPath = path.join(noticePath, 'metadata.json');

    try {
      const metadata = await fs.readJson(metadataPath);

      if (!metadata.languages[lang]) {
        metadata.languages[lang] = [];
      }

      if (!metadata.languages[lang].includes(version)) {
        metadata.languages[lang].push(version);
        metadata.languages[lang].sort((a, b) => this.compareVersions(b, a)); // Latest first
      }

      await fs.writeJson(metadataPath, metadata, { spaces: 2 });
      console.log(`📝 Updated metadata for ${noticeId}/${lang} with version ${version}`);
    } catch (error) {
      console.error(`❌ Error updating metadata for ${noticeId}:`, error.message);
    }
  }

  /**
   * Get all notice directories
   */
  getAllNoticeDirs() {
    if (!fs.existsSync(this.noticesDir)) return [];

    return fs.readdirSync(this.noticesDir).filter(dir => {
      const fullPath = path.join(this.noticesDir, dir);
      return fs.statSync(fullPath).isDirectory();
    });
  }

  /**
   * Get language directories for a notice
   */
  async getLanguageDirs(noticePath) {
    const items = await fs.readdir(noticePath);
    return items.filter(item => {
      const fullPath = path.join(noticePath, item);
      return fs.statSync(fullPath).isDirectory() && item !== 'metadata.json';
    });
  }

  /**
   * Compare version strings
   */
  compareVersions(version1, version2) {
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

  /**
   * Check if a translation is outdated compared to main language
   */
  async checkTranslationStatus(noticeId, lang, mainLang = 'it') {
    const noticePath = path.join(this.noticesDir, noticeId);
    const metadataPath = path.join(noticePath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) return null;

    const metadata = await fs.readJson(metadataPath);
    const mainVersions = metadata.languages?.[mainLang] || [];
    const langVersions = metadata.languages?.[lang] || [];

    if (mainVersions.length === 0 || langVersions.length === 0) return null;

    const mainLatest = mainVersions[0];
    const langLatest = langVersions[0];

    if (!mainLatest || !langLatest) return null;

    const comparison = this.compareVersions(langLatest, mainLatest);

    return {
      isOutdated: comparison < 0,
      mainVersion: mainLatest,
      translationVersion: langLatest,
      comparison: comparison
    };
  }

  /**
   * Build the static site using Eleventy
   */
  async buildStaticSite() {
    try {
      console.log('🔨 Building static site with Eleventy...');
      execSync('npx @11ty/eleventy', { stdio: 'inherit' });
      console.log('✅ Static site built successfully');
    } catch (error) {
      console.error('❌ Error building static site:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const versionManager = new VersionManager();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Version Manager for Privacy Notices

Usage:
  node version-manager.js [options]

Options:
  --process-all    Process all notices and archive versions
  --check-status   Check translation status for all notices
  --help, -h       Show this help

Examples:
  node version-manager.js --process-all
  node version-manager.js --check-status
    `);
    return;
  }

  if (args.includes('--process-all')) {
    await versionManager.processAllNotices();
  } else if (args.includes('--check-status')) {
    await checkAllStatuses(versionManager);
  } else {
    console.log('Use --help for usage information');
  }
}

async function checkAllStatuses(versionManager) {
  console.log('🔍 Checking translation statuses...');

  const notices = versionManager.getAllNoticeDirs();

  for (const noticeId of notices) {
    const noticePath = path.join(versionManager.noticesDir, noticeId);
    const metadataPath = path.join(noticePath, 'metadata.json');

    if (!await fs.pathExists(metadataPath)) continue;

    const metadata = await fs.readJson(metadataPath);
    const mainLang = metadata.main_language || 'it';

    for (const lang of Object.keys(metadata.languages || {})) {
      if (lang === mainLang) continue;

      const status = await versionManager.checkTranslationStatus(noticeId, lang, mainLang);

      if (status) {
        if (status.isOutdated) {
          console.log(`⚠️  ${noticeId}/${lang}: Outdated (v${status.translationVersion} < v${status.mainVersion})`);
        } else {
          console.log(`✅ ${noticeId}/${lang}: Up to date (v${status.translationVersion})`);
        }
      }
    }
  }
}

// Export for use as module
module.exports = VersionManager;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
