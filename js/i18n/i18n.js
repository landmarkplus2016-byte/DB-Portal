import { en } from './en.js';
import { ar } from './ar.js';

const STRINGS = { en, ar };

let currentLang = localStorage.getItem('lmp_lang') || 'en';

// setLanguage() needs to trigger a re-render, but importing render.js directly would create a
// circular dependency (pages call t() from this file). main.js registers the real render()
// here once it exists, instead of i18n.js importing it.
let renderCallback = null;

export function setRenderCallback(fn) {
  renderCallback = fn;
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  return STRINGS[currentLang]?.[key] ?? key;
}

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lmp_lang', lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  renderCallback?.();
}
