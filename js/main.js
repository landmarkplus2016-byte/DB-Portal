import { initRouter } from './router.js';
import { render } from './render.js';
import { setRenderCallback } from './i18n/i18n.js';

setRenderCallback(render);
initRouter();
render();
