const sharp = require('sharp');
const fs = require('fs');

async function processEmblem() {
  const input = 'public/mandi-marg-logo.jpg';
  console.log('Processing emblem crop...');

  // Trim white padding around the full logo artwork
  const trimmedBuffer = await sharp(input)
    .trim({ threshold: 25 })
    .png()
    .toBuffer();

  const meta = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed full logo size: ${meta.width}x${meta.height}`);

  // 1. Transparent Full Logo (emblem + text)
  const { data: fullData, info: fullInfo } = await sharp(trimmedBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < fullData.length; i += 4) {
    if (fullData[i] > 230 && fullData[i+1] > 230 && fullData[i+2] > 230) {
      fullData[i+3] = 0; // Alpha = 0
    }
  }

  const fullTransparent = await sharp(fullData, {
    raw: { width: fullInfo.width, height: fullInfo.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('public/mandi-marg-full-transparent.png', fullTransparent);

  // 2. Crop ONLY the circular emblem (left side of the trimmed logo)
  const emblemWidth = Math.round(meta.width * 0.49);
  const emblemBuffer = await sharp(trimmedBuffer)
    .extract({ left: 0, top: 0, width: emblemWidth, height: meta.height })
    .toBuffer();

  const { data: embData, info: embInfo } = await sharp(emblemBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < embData.length; i += 4) {
    if (embData[i] > 230 && embData[i+1] > 230 && embData[i+2] > 230) {
      embData[i+3] = 0; // Alpha = 0
    }
  }

  const emblemTransparent = await sharp(embData, {
    raw: { width: embInfo.width, height: embInfo.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('public/mandi-marg-emblem.png', emblemTransparent);

  // Base64 strings for logoData.ts
  const b64Full = 'data:image/png;base64,' + fullTransparent.toString('base64');
  const b64Emblem = 'data:image/png;base64,' + emblemTransparent.toString('base64');

  const content = `export const MANDI_MARG_FULL_LOGO = ${JSON.stringify(b64Full)};
export const MANDI_MARG_EMBLEM_LOGO = ${JSON.stringify(b64Emblem)};
export const MANDI_MARG_LOGO_BASE64 = MANDI_MARG_FULL_LOGO;
`;

  fs.writeFileSync('src/components/logoData.ts', content);
  console.log('Successfully generated MANDI_MARG_EMBLEM_LOGO and MANDI_MARG_FULL_LOGO!');
}

processEmblem().catch(err => {
  console.error(err);
  process.exit(1);
});
