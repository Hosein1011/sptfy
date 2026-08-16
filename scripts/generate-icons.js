const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Melora branded SVG icon
const createSvg = (isMaskable = false) => {
  const padding = isMaskable ? 80 : 36;
  const size = 512;
  const innerSize = size - padding * 2;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="meloraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B5CFF" />
      <stop offset="50%" stop-color="#C05CFF" />
      <stop offset="100%" stop-color="#FF4D7D" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B5CFF" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#FF4D7D" stop-opacity="0.2" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="#0B0F16" rx="${isMaskable ? '0' : '108'}" />
  
  <!-- Inner ambient circle -->
  <circle cx="256" cy="256" r="${isMaskable ? 180 : 200}" fill="url(#glowGrad)" />

  <!-- Logo Graphics / Melora Waveform & Musical M -->
  <g transform="translate(${256 - innerSize/2}, ${256 - innerSize/2}) scale(${innerSize / 400})">
    <!-- Sound Waves / Melora Rhythm -->
    <!-- Bar 1 -->
    <rect x="70" y="150" width="28" height="100" rx="14" fill="url(#meloraGrad)" />
    <!-- Bar 2 -->
    <rect x="120" y="100" width="28" height="200" rx="14" fill="url(#meloraGrad)" />
    <!-- Bar 3 (Center M peak) -->
    <rect x="170" y="60" width="28" height="280" rx="14" fill="url(#meloraGrad)" />
    <!-- Bar 4 (Middle dip) -->
    <rect x="220" y="140" width="28" height="120" rx="14" fill="url(#meloraGrad)" />
    <!-- Bar 5 (Second M peak) -->
    <rect x="270" y="80" width="28" height="240" rx="14" fill="url(#meloraGrad)" />
    <!-- Bar 6 -->
    <rect x="320" y="130" width="28" height="140" rx="14" fill="url(#meloraGrad)" />

    <!-- Ambient glowing accents -->
    <circle cx="84" cy="115" r="8" fill="#7B5CFF" filter="url(#glow)" />
    <circle cx="334" cy="95" r="8" fill="#FF4D7D" filter="url(#glow)" />
  </g>
</svg>`;
};

async function generate() {
  const standardSvg = Buffer.from(createSvg(false));
  const maskableSvg = Buffer.from(createSvg(true));

  const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

  for (const size of sizes) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`;
    await sharp(standardSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, filename));
    console.log(`Generated public/icons/${filename}`);
  }

  // Generate maskable icon 512x512
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'maskable-icon-512x512.png'));
  console.log('Generated public/icons/maskable-icon-512x512.png');

  // Root fallbacks
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192x192.png'));

  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-512x512.png'));

  await sharp(standardSvg)
    .resize(32, 32)
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), standardSvg);
  console.log('Generated root icons & favicons successfully.');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
