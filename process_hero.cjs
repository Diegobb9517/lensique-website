const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\bauti\\.gemini\\antigravity\\brain\\642fd5f0-be6e-43cf-a974-5a286d6dace1\\.user_uploaded\\media__1791225701885.jpg';
const destDesktopWebP = 'public/hero-desktop.webp';
const destMobileWebP = 'public/hero-mobile.webp';
const destDesktopJpg = 'public/hero-desktop.jpg';

async function processImages() {
  try {
    // Desktop WebP
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toFile(destDesktopWebP);
    console.log('Created hero-desktop.webp');

    // Mobile WebP
    await sharp(inputPath)
      .resize(1080, 1350, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toFile(destMobileWebP);
    console.log('Created hero-mobile.webp');

    // Desktop JPG Fallback
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(destDesktopJpg);
    console.log('Created hero-desktop.jpg');

  } catch (err) {
    console.error('Error processing images:', err);
  }
}

processImages();
