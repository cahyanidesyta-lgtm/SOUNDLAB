'use strict';
// Build SOUNDLAB's public-facing static assets for Vercel.
// API functions and database/source files intentionally stay outside the output.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
const staticFiles = ['index.html', 'manifest.webmanifest'];
const staticDirectories = ['assets'];

for (const relative of [...staticFiles, ...staticDirectories]) {
  if (!fs.existsSync(path.join(root, relative))) {
    throw new Error(`Missing required static asset: ${relative}`);
  }
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const relative of staticFiles) {
  fs.copyFileSync(path.join(root, relative), path.join(output, relative));
}
for (const relative of staticDirectories) {
  fs.cpSync(path.join(root, relative), path.join(output, relative), {
    recursive: true,
  });
}

console.log('SOUNDLAB build succeeded. Generated public/index.html and public/assets/.');
