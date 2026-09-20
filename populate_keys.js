const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const enPath = path.join(messagesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

const deepMerge = (target, source) => {
  if (!isObject(target)) return source || {};
  if (!isObject(source)) return target;

  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      if (key in target && isObject(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  });
  return output;
};

// Target is EN, Source is Lang
const files = fs.readdirSync(messagesDir);
files.forEach(file => {
  if (file === 'en.json' || !file.endsWith('.json')) return;
  const filePath = path.join(messagesDir, file);
  
  let langData = {};
  try {
    langData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${file}`, e);
  }

  // Merge English with Lang Data. 
  // We want English keys but if Lang Data has it, keep it.
  // Wait, deepMerge(target, source) overwrites target with source.
  // So deepMerge(enData, langData) will return an object with ALL english keys, overwritten by any existing lang keys!
  const merged = deepMerge(enData, langData);
  
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Updated ${file} to have all keys from en.json`);
});

console.log("All language files have been updated with complete keyword structures.");
