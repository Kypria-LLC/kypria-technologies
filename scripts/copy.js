// scripts/copy.js - Copies static files into dist for Netlify deployment
const fs = require('fs');
const path = require('path');

// Recursive directory copy function
const copyDir = (dir, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(dir)) {
    const src = path.join(dir, item);
    const dst = path.join(dest, item);
    if (fs.lstatSync(src).isDirectory()) {
      copyDir(src, dst);
    } else {
      fs.copyFileSync(src, dst);
    }
  }
};

// Auto-discover files to copy (no manual list to maintain)
const rootFiles = fs.readdirSync('.').filter(f => {
  const stat = fs.lstatSync(f);
  if (stat.isDirectory()) return false;
  // Skip build/config/dev files that shouldn't be deployed
  const skip = [
    'package.json', 'package-lock.json',
    'tailwind.config.js', 'postcss.config.js',
    'netlify.toml', '.gitignore',
    'CHANGELOG.md', 'README.md', 'RELEASE.md', 'SECURITY.md',
    'LICENSE', 'pr-body.md',
    'FINAL_COMMIT_ALL_TO_BASILICA_GATE.sh', 'breathe.sh',
    'inject-head-tags.sh'
  ];
  if (skip.includes(f)) return false;
  if (f.endsWith('.bak')) return false;
  if (f.startsWith('.')) return false;
  return true;
});

const srcDirs = ['assets', 'images', 'favicon_io', 'css', 'js', 'docs'];

// Ensure dist directory exists
fs.mkdirSync('dist', { recursive: true });

// Copy individual root files (preserving flat structure)
rootFiles.forEach(f => {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join('dist', f));
    console.log(`\u2713 Copied ${f}`);
  }
});

// Copy directories
srcDirs.forEach(d => {
  if (fs.existsSync(d)) {
    copyDir(d, path.join('dist', d));
    console.log(`\u2713 Copied directory ${d}/`);
  }
});

console.log(`\u2713 Build complete! ${rootFiles.length} files + ${srcDirs.length} directories copied.`);
