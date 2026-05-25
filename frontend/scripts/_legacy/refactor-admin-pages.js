/**
 * @deprecated One-off migration helper (Phase C i18n). Do not run in CI.
 * Converts useLanguage + t('admin.*') patterns to next-intl useTranslations.
 *
 * Usage (from frontend/): node scripts/_legacy/refactor-admin-pages.js
 */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../../src/app/[locale]/admin');

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      refactorFile(fullPath);
    }
  }
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('useLanguage')) {
    content = content.replace(
      /import \{ useLanguage \} from ["']@\/lib\/language-context["'];?/,
      "import { useTranslations } from 'next-intl';"
    );

    content = content.replace(
      /const \{ t \} = useLanguage\(\);?/,
      "const t = useTranslations('admin');\n  const tCommon = useTranslations('common');"
    );

    content = content.replace(/t\(['"]admin\.([^'"]+)['"]\)/g, "t('$1')");
    content = content.replace(/t\(['"]common\.([^'"]+)['"]\)/g, "tCommon('$1')");

    fs.writeFileSync(filePath, content);
    console.log('Refactored', filePath);
  }
}

traverse(adminDir);
console.log('Done.');
