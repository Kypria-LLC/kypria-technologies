// scripts/copy.js - Copies static files into dist for Netlify deployment
const fs = require('fs');
const path = require('path');

// Files and directories to copy
const srcFiles = [
  'index.html',
  'codex.html',
  'oracle-pricing.html',
  'pricing.html',
  'privacy.html',
  'quickref.html',
  'thank-you.html',
  'themes.html',
  'thread-generator.html',
  'walkthrough.html',
  'js/ui.js',
  'style.css',
  'manifest.json',
  'robots.txt',
  'favicon.ico',
  'apple-touch-icon.png',
  'kypria-crest-golden.png',
  'kypria-crest-og.png',
  'messenger.js',
  '_redirects'
];
const srcDirs = ['assets', 'images', 'favicon_io', 'css', 'js', 'docs'];

// Ensure dist directory exists
fs.mkdirSync('dist', { recursive: true });

// Copy individual files
srcFiles.forEach(f => {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join('dist', path.basename(f)));
    console.log(`\u2713 Copied ${f}`);
  } else {
    console.warn(`\u26A0 Skipped ${f} (not found)`);
  }
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
    console.log(`\u2713 Copied directory ${d}`);
  }
});

console.log('\u2713 Build complete! Ready for deployment.');
