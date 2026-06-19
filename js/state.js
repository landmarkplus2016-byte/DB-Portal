import { makeBootstrapData } from './data/bootstrap.js';

export let DATA = makeBootstrapData();
export let CURRENT_USER = null;
export let IS_DIRTY = false;
export let ROUTE = 'login';
export let ROUTE_PARAM = null;
export let UI = {};

export function setData(newData) {
  DATA = newData;
}

export function setCurrentUser(user) {
  CURRENT_USER = user;
}

export function setRoute(route, param = null) {
  ROUTE = route;
  ROUTE_PARAM = param;
}

export function markDirty() {
  IS_DIRTY = true;
}

export function clearDirty() {
  IS_DIRTY = false;
}
