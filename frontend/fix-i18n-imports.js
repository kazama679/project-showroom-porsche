const fs = require('fs');
const path = require('path');

const EXTENSIONS = ['.tsx', '.ts'];
const DIRECTORIES = ['app', 'components'];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace next/link with @/i18n/navigation
  // from: import Link from 'next/link'
  // to: import { Link } from '@/i18n/navigation'
  if (content.includes("'next/link'") || content.includes('"next/link"')) {
    content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, "import { Link } from '@/i18n/navigation';");
  }

  // Replace next/navigation if it uses useRouter, usePathname, or redirect
  // Note: useSearchParams remains from next/navigation
  if (content.includes('next/navigation')) {
    // Check if it imports useRouter, usePathname, redirect
    const hasRouter = content.includes('useRouter');
    const hasPathname = content.includes('usePathname');
    const hasRedirect = content.includes('redirect');
    const hasSearchParams = content.includes('useSearchParams');

    if (hasRouter || hasPathname || hasRedirect) {
      // Very crude but effective way to split them
      let nextNavigationImports = [];
      let i18nNavigationImports = [];

      if (hasSearchParams) nextNavigationImports.push('useSearchParams');
      
      const regex = /import\s+\{([^}]+)\}\s+from\s+['"]next\/navigation['"];?/g;
      
      content = content.replace(regex, (match, importsStr) => {
        const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
        
        imports.forEach(imp => {
          if (['useRouter', 'usePathname', 'redirect', 'getPathname'].includes(imp)) {
            i18nNavigationImports.push(imp);
          } else {
            nextNavigationImports.push(imp);
          }
        });

        let replacement = '';
        if (nextNavigationImports.length > 0) {
          replacement += `import { ${nextNavigationImports.join(', ')} } from 'next/navigation';\n`;
        }
        if (i18nNavigationImports.length > 0) {
          // Instead of modifying existing, just add to top and remove from here. Or just add import
          // Actually better to just do this replacement inline.
          replacement += `import { ${i18nNavigationImports.join(', ')} } from '@/i18n/navigation';`;
        }
        return replacement;
      });
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (EXTENSIONS.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(dir => traverse(path.join(process.cwd(), dir)));
console.log('Done fixing routing imports!');
