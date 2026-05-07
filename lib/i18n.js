const path = require('path');
const translations = require(path.join(__dirname, '..', 'locales', 'translations.json'));

const SUPPORTED_LANGUAGES = ['nl', 'en', 'de', 'fr', 'es'];
const DEFAULT_LANGUAGE = 'nl';

function detectBrowserLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const browserLang = navigator.language || navigator.userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();
  return langCode;
}

function getLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  
  if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang.toLowerCase())) {
    return urlLang.toLowerCase();
  }
  
  const browserLang = detectBrowserLanguage();
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE;
}

function t(key) {
  const lang = getLanguage();
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      value = translations[DEFAULT_LANGUAGE];
      for (const k of keys) {
        if (value && value[k] !== undefined) {
          value = value[k];
        } else {
          return key;
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

function applyTranslations() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
      element.setAttribute('placeholder', translation);
    } else {
      element.textContent = translation;
    }
  });
  
  document.querySelectorAll('[data-i18n-html]').forEach(element => {
    const key = element.getAttribute('data-i18n-html');
    element.innerHTML = t(key);
  });
}

function addLanguage(langCode, translationsObj) {
  if (!SUPPORTED_LANGUAGES.includes(langCode)) {
    SUPPORTED_LANGUAGES.push(langCode);
    translations[langCode] = translationsObj;
  }
}

function getSupportedLanguages() {
  return [...SUPPORTED_LANGUAGES];
}

function getTranslations(lang) {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
}

module.exports = { 
  t, 
  getLanguage, 
  applyTranslations, 
  addLanguage,
  getSupportedLanguages,
  getTranslations,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
};
