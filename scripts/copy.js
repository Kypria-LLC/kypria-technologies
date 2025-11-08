// scripts/copy.js — Copies static files into dist for Netlify deployment
const fs = require('fs');
const path = require('path');

// Files and directories to copy
const srcFiles = ['index.html', 'js/ui.js'];
const srcDirs = ['assets', 'images'];

// Ensure dist directory exists
fs.mkdirSync('dist', { recursive: true });

// Copy individual files
srcFiles.forEach(f => {
  fs.copyFileSync(f, path.join('dist', path.basename(f)));
  console.log(`✓ Copied ${f}`);
});

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

// Copy directories
srcDirs.forEach(d => {
  if (fs.existsSync(d)) {
    copyDir(d, path.join('dist', d));
    console.log(`✓ Copied directory ${d}`);
  }
});

console.log('✓ Build complete! Ready for deployment.');
