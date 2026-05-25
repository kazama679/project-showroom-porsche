const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../app/[locale]/admin');

function traverse(dir) {
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
    
    // Check if it uses useLanguage
    if (content.includes('useLanguage')) {
        // Swap import
        content = content.replace(/import \{ useLanguage \} from ["']@\/lib\/language-context["'];?/, "import { useTranslations } from 'next-intl';");
        
        // Setup hooks. Replace const { t } = useLanguage()
        content = content.replace(/const \{ t \} = useLanguage\(\);?/, "const t = useTranslations('admin');\n  const tCommon = useTranslations('common');");

        // Now replace all t('admin.something') with t('something')
        content = content.replace(/t\(['"]admin\.([^'"]+)['"]\)/g, "t('$1')");
        // And replace t('common.something') with tCommon('something')
        content = content.replace(/t\(['"]common\.([^'"]+)['"]\)/g, "tCommon('$1')");
        
        fs.writeFileSync(filePath, content);
        console.log('Refactored', filePath);
    }
}

traverse(adminDir);
console.log('Done.');
