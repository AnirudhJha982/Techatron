const sharp = require('sharp');
const fs = require('fs');

async function updateEmblem() {
  const input = 'C:/Users/jhaan/.gemini/antigravity-ide/brain/65a49086-e164-4363-aaf3-6ad6e231574c/media__1787798236840.png';
  console.log('Processing exact user attached PNG emblem file...');

  // Trim outer space
  const trimmed = await sharp(input)
    .trim({ threshold: 15 })
    .png()
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  console.log(`Trimmed exact emblem size: ${meta.width}x${meta.height}`);

  // Ensure alpha transparency for white background pixels if any
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = info.width * info.height;
  for (let i = 0; i < pixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Convert background white pixels to transparent
    if (r > 240 && g > 240 && b > 240) {
      data[idx + 3] = 0;
    }
  }

  const cleanEmblem = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('public/mandi-marg-emblem.png', cleanEmblem);

  const b64Emblem = 'data:image/png;base64,' + cleanEmblem.toString('base64');

  let b64Full = b64Emblem;
  try {
    const fullBuf = fs.readFileSync('public/mandi-marg-full-transparent.png');
    b64Full = 'data:image/png;base64,' + fullBuf.toString('base64');
  } catch (e) {}

  const fileContent = `export const MANDI_MARG_FULL_LOGO = ${JSON.stringify(b64Full)};
export const MANDI_MARG_EMBLEM_LOGO = ${JSON.stringify(b64Emblem)};
export const MANDI_MARG_LOGO_BASE64 = MANDI_MARG_EMBLEM_LOGO;
`;

  fs.writeFileSync('src/components/logoData.ts', fileContent);
  console.log('Successfully updated logoData.ts with the exact ultra-sharp emblem!');
}

updateEmblem().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
