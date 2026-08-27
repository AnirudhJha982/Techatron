const sharp = require('sharp');
const fs = require('fs');

async function processEmblem() {
  // Use the exact new emblem attached image
  const input = 'C:/Users/jhaan/.gemini/antigravity-ide/brain/65a49086-e164-4363-aaf3-6ad6e231574c/media__1787797956174.png';
  console.log('Processing new attached emblem image...');

  // Trim white outer padding
  const trimmed = await sharp(input)
    .trim({ threshold: 30 })
    .png()
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  console.log(`Trimmed new emblem dimensions: ${meta.width}x${meta.height}`);

  // Convert white background pixels to transparent alpha
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = info.width * info.height;
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Convert pure/near white background to transparent
    if (r > 225 && g > 225 && b > 225) {
      data[idx + 3] = 0; // Alpha = 0
    }
  }

  const transparentEmblem = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('public/mandi-marg-emblem.png', transparentEmblem);

  const b64Emblem = 'data:image/png;base64,' + transparentEmblem.toString('base64');

  // Read existing full logo if present or generate fallback
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
  console.log('Successfully updated logoData.ts with the new transparent emblem!');
}

processEmblem().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
