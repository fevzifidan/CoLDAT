import { useAppStore as store } from '../index';

export const useAppStore = store;

export const getAppStore = () => store.getState();
export const setAppStore = store.setState;
