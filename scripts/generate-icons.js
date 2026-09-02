import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5g9TRzwwUiJeGx-P4sbQOAnxtiXmwsQqI3szmw7B5IcntNUY7hp0bEAQ1881gVPgIw5D29NVjef5zbWqocaso9Ai11fB1HYxnKH3AUwHiu-m6VoKxHKxlnaDUZpBwx0ZPye6fCi7MGJowEQubEdA_GlS7oFpQOt4lySwkpX2LB4Z3XOGSuthhwnsrb37YWZmzKMrk-e2uLak3T4OJzQbGyBWzVqRLfRe8lkYY0A1lAzJUK8UY8IDQ-kq_iakVEhI0';

async function generateIcons() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Downloading original YAAD transparent logo...');
  const res = await fetch(LOGO_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch logo: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const metadata = await sharp(inputBuffer).metadata();
  console.log('Original image info:', metadata);

  // 1. Raw transparent logo
  fs.writeFileSync(path.join(publicDir, 'logo.png'), inputBuffer);

  // Helper to resize maintaining aspect ratio without cropping, centered on transparent canvas
  async function generateCenteredIcon(size, paddingFactor = 0.9, outPath) {
    const targetContentSize = Math.round(size * paddingFactor);
    const resizedLogo = await sharp(inputBuffer)
      .resize({
        width: targetContentSize,
        height: targetContentSize,
        fit: 'inside',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(outPath);

    console.log(`Generated ${path.basename(outPath)} (${size}x${size})`);
  }

  // Favicons
  await generateCenteredIcon(16, 0.95, path.join(publicDir, 'favicon-16x16.png'));
  await generateCenteredIcon(32, 0.95, path.join(publicDir, 'favicon-32x32.png'));
  await generateCenteredIcon(48, 0.95, path.join(publicDir, 'favicon-48x48.png'));
  await generateCenteredIcon(64, 0.95, path.join(publicDir, 'favicon.png'));

  // Apple touch icon (180x180)
  // Clean transparent / centered without circular cut or cropping
  await generateCenteredIcon(180, 0.9, path.join(publicDir, 'apple-touch-icon.png'));

  // PWA icons
  await generateCenteredIcon(192, 0.9, path.join(publicDir, 'pwa-192x192.png'));
  await generateCenteredIcon(512, 0.9, path.join(publicDir, 'pwa-512x512.png'));
  // Maskable icon with 15% safe padding
  await generateCenteredIcon(512, 0.75, path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Also create favicon.ico from the 32x32 or 48x48 png
  // Sharp can output png which modern browsers support as favicon.ico or we copy 32x32 to favicon.ico
  const icoBuffer = await sharp(inputBuffer)
    .resize(32, 32, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
