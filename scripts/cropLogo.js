const sharp = require('sharp');
const fs = require('fs');

async function processLogo() {
  const input = 'public/mandi-marg-logo.jpg';

  console.log('Reading input image...');
  // Trim white padding around the logo artwork
  const trimmedBuffer = await sharp(input)
    .trim({ threshold: 30 })
    .png()
    .toBuffer();

  const metadata = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed size: ${metadata.width}x${metadata.height}`);

  fs.writeFileSync('public/mandi-marg-logo-trimmed.png', trimmedBuffer);

  // Convert white background pixels to transparent
  const { data, info } = await sharp(trimmedBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = info.width * info.height;
  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    if (r > 230 && g > 230 && b > 230) {
      data[idx + 3] = 0; // Alpha = 0 (Transparent)
    }
  }

  const transparentBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('public/mandi-marg-logo-transparent.png', transparentBuffer);

  // Create Dark Theme Variant: Recolor dark green text/lines to WHITE for dark green sidebar contrast!
  const darkData = Buffer.from(data);
  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    const r = darkData[idx];
    const g = darkData[idx + 1];
    const b = darkData[idx + 2];
    const a = darkData[idx + 3];

    if (a > 0) {
      // Dark green pixels in logo artwork: R < 70, G < 110, B < 70
      if (r < 70 && g < 110 && b < 70) {
        darkData[idx] = 255;     // White R
        darkData[idx + 1] = 255; // White G
        darkData[idx + 2] = 255; // White B
      }
    }
  }

  const transparentDarkBuffer = await sharp(darkData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('public/mandi-marg-logo-dark.png', transparentDarkBuffer);

  // Base64 strings for logoData.ts
  const b64Light = 'data:image/png;base64,' + transparentBuffer.toString('base64');
  const b64Dark = 'data:image/png;base64,' + transparentDarkBuffer.toString('base64');

  const fileContent = `export const MANDI_MARG_LOGO_LIGHT = ${JSON.stringify(b64Light)};
export const MANDI_MARG_LOGO_DARK = ${JSON.stringify(b64Dark)};
export const MANDI_MARG_LOGO_BASE64 = MANDI_MARG_LOGO_LIGHT;
`;

  fs.writeFileSync('src/components/logoData.ts', fileContent);
  console.log('Successfully generated cropped transparent light and dark logos!');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
