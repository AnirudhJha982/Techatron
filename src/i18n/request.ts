import { getRequestConfig } from 'next-intl/server';

const locales = [
  'en', 'hi', 'bn', 'as', 'or', 'mr', 'gu', 'pa', 'ta', 'te', 'kn', 'ml', 'ur',
  'sa', 'mai', 'sat', 'ks', 'ne', 'kok', 'sd', 'doi', 'brx', 'mni'
];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en'; // fallback to English
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return {
      locale: locale as string,
      messages
    };
  } catch (error) {
    return {
      locale: 'en',
      messages: (await import(`../../messages/en.json`)).default
    };
  }
});
