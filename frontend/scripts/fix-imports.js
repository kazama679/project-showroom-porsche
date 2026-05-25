const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../app/[locale]');
const componentsDir = path.join(__dirname, '../components');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We only care if it imports from next/navigation
    if (!content.includes('next/navigation')) return;
    
    // Specifically we want to intercept `useRouter`, `usePathname`, `redirect` but leave `useSearchParams`
    const regex = /import\s+\{([^}]+)\}\s+from\s+['"]next\/navigation['"]/g;
    const match = regex.exec(content);
    
    if (match) {
        const imports = match[1].split(',').map(s => s.trim());
        const i18nImports = [];
        const nextImports = [];
        
        for (const imp of imports) {
            if (!imp) continue;
            if (['useRouter', 'usePathname', 'redirect', 'Link'].includes(imp)) {
                i18nImports.push(imp);
            } else {
                nextImports.push(imp);
            }
        }
        
        if (i18nImports.length > 0) {
            let newImportString = '';
            if (nextImports.length > 0) {
                newImportString += `import { ${nextImports.join(', ')} } from 'next/navigation';\n`;
            }
            newImportString += `import { ${i18nImports.join(', ')} } from '@/i18n/navigation';`;
            
            content = content.replace(match[0], newImportString);
            fs.writeFileSync(filePath, content);
            console.log('Fixed imports in', filePath);
        }
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fixFile(fullPath);
        }
    }
}

traverse(appDir);
traverse(componentsDir);

console.log('Done.');
