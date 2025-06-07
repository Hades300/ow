#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Font URLs - using different sources
const FONTS = [
  {
    name: 'bignoodletoo.woff2',
    url: 'https://db.onlinewebfonts.com/t/f0d5e409c9b652b7af9f70d01332a834.woff2'
  },
  {
    name: 'koverwatch.woff2',
    url: 'https://db.onlinewebfonts.com/t/9e921cf676f8c8163bc5c6d7a0e22ade.woff2'
  }
];

/**
 * Download a file from a URL
 * @param {string} url - The URL to download from
 * @param {string} dest - The destination file path
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.onlinewebfonts.com/'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file on error
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Create placeholder font files with a message
function createPlaceholderFonts() {
  console.log('Creating placeholder font files...');
  
  for (const font of FONTS) {
    const dest = path.join(FONTS_DIR, font.name);
    
    // Create an empty file
    fs.writeFileSync(dest, '');
    console.log(`Created placeholder for ${font.name}`);
  }
  
  // Create a README file explaining how to get the fonts
  const readmePath = path.join(FONTS_DIR, 'README.md');
  const readmeContent = `# Overwatch Fonts

Due to licensing restrictions, the following font files need to be manually downloaded:

1. BigNoodleTooOblique (bignoodletoo.woff2)
2. Koverwatch (koverwatch.woff2)

You can find these fonts at:
- https://www.onlinewebfonts.com/fonts/big-noodle-titling-oblique
- https://www.onlinewebfonts.com/fonts/koverwatch

Download and place them in this directory.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('Created README with font instructions');
}

// Try to download fonts, fall back to placeholders if it fails
async function setupFonts() {
  console.log('Setting up Overwatch fonts...');
  
  let downloadSuccess = true;
  
  for (const font of FONTS) {
    const dest = path.join(FONTS_DIR, font.name);
    
    try {
      console.log(`Attempting to download ${font.name}...`);
      await downloadFile(font.url, dest);
    } catch (error) {
      console.error(`Error downloading ${font.name}:`, error);
      downloadSuccess = false;
    }
  }
  
  if (!downloadSuccess) {
    console.log('Some downloads failed, creating placeholder files instead.');
    createPlaceholderFonts();
  }
  
  console.log('Font setup complete!');
}

// Run the setup
setupFonts().catch(console.error); 