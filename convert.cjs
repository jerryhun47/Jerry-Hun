const sharp = require('sharp');
const fs = require('fs');

async function convert() {
  await sharp('public/logo.png').webp({ quality: 80 }).toFile('public/logo.webp');
  await sharp('public/premium-tools.jpg').webp({ quality: 80 }).toFile('public/premium-tools.webp');
  console.log('Converted to webp');
}
convert();
