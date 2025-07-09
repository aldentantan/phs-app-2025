const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function fixImports(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Regex to match import statements
    content = content.replace(
        /from\s+['"]((?:\.{1,2}\/)[^'"]+)\.js['"]/g,
        (match, p1) => {
            const jsxPath = path.resolve(path.dirname(filePath), p1 + '.jsx');
            if (fs.existsSync(jsxPath)) {
                changed = true;
                return `from '${p1}.jsx'`;
            }
            return match;
        }
    );

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated imports in: ${filePath}`);
    }
}

// Change this to your src directory
const SRC_DIR = path.join(__dirname, '../src');
walkDir(SRC_DIR, fixImports);