const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    let original = content;
    
    // Replace hardcoded URLs with environment variable template literal
    content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    content = content.replace(/\"http:\/\/localhost:5000(.*?)\"/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');

    // Fix any double substitution in TryOnPage/ProductTryOnModal where API_BASE was already defined
    content = content.replace(/VITE_API_URL \|\| \`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}\`/g, "VITE_API_URL || 'http://localhost:5000'");

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
      changedCount++;
    }
  }
});
console.log('Changed files:', changedCount);
