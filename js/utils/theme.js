export const THEMES = ['blue', 'teal', 'purple', 'crimson'];

let currentTheme = localStorage.getItem('lmp_theme') || 'blue';

// Same circular-dependency workaround as i18n.js's setRenderCallback —
// main.js registers the real render() here once it exists.
let renderCallback = null;

export function setThemeRenderCallback(fn) {
  renderCallback = fn;
}

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('lmp_theme', theme);
  document.documentElement.dataset.theme = theme;
  renderCallback?.();
}
