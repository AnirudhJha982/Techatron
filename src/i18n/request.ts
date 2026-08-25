import { getRequestConfig } from 'next-intl/server';

import en from '../../messages/en.json';
import hi from '../../messages/hi.json';
import bn from '../../messages/bn.json';
import as from '../../messages/as.json';
import or from '../../messages/or.json';
import mr from '../../messages/mr.json';
import gu from '../../messages/gu.json';
import pa from '../../messages/pa.json';
import ta from '../../messages/ta.json';
import te from '../../messages/te.json';
import kn from '../../messages/kn.json';
import ml from '../../messages/ml.json';
import ur from '../../messages/ur.json';
import sa from '../../messages/sa.json';
import mai from '../../messages/mai.json';
import sat from '../../messages/sat.json';
import ks from '../../messages/ks.json';
import ne from '../../messages/ne.json';
import kok from '../../messages/kok.json';
import sd from '../../messages/sd.json';
import doi from '../../messages/doi.json';
import brx from '../../messages/brx.json';
import mni from '../../messages/mni.json';

const dictionaries: Record<string, any> = {
  en, hi, bn, as, or, mr, gu, pa, ta, te, kn, ml, ur,
  sa, mai, sat, ks, ne, kok, sd, doi, brx, mni
};

const validLocales = Object.keys(dictionaries);

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge(target: any, source: any) {
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
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !validLocales.includes(locale)) {
    locale = 'en';
  }

  const requestedMessages = dictionaries[locale] || {};
  const mergedMessages = deepMerge(en, requestedMessages);

  return {
    locale: locale as string,
    messages: mergedMessages
  };
});
