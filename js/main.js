import { initRouter } from './router.js';
import { render } from './render.js';
import { setRenderCallback, getLanguage } from './i18n/i18n.js';
import { setThemeRenderCallback, getTheme } from './utils/theme.js';

document.documentElement.dir = getLanguage() === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = getLanguage();
document.documentElement.dataset.theme = getTheme();

setRenderCallback(render);
setThemeRenderCallback(render);
initRouter();
render();
