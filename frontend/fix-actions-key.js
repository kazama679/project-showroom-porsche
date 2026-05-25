const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.match(/key:\s*['"]id['"](?:\s*as\s+keyof\s+[\w<>\[\]]+)?,\s*label:\s*(?:t\(['"]actions['"]\)|['"]Actions['"])/i)) {
        results.push(file);
      }
    }
  });
  return results;
}
const absolutePath = path.resolve(__dirname, 'src/app');
const targetFiles = walk(absolutePath);
targetFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/(key:\s*['"])id(['"](?:\s*as\s+keyof\s+[\w<>\[\]]+)?,\s*label:\s*(?:t\(['"]actions['"]\)|['"]Actions['"]))/gi, '$1actions$2');
  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed:', f);
});
