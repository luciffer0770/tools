import { create } from 'zustand';
import {
  apiLogin,
  apiMe,
  apiCrops,
  apiPortfolio,
  apiNews,
  apiHistory,
  apiBuy,
  apiSell,
  apiTutorialStart,
  apiTutorialComplete,
} from '../services/api.js';

const LS_USER = 'cropbank_user';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  if (!user) localStorage.removeItem(LS_USER);
  else localStorage.setItem(LS_USER, JSON.stringify(user));
}

export const useGameStore = create((set, get) => ({
  user: loadStoredUser(),
  crops: [],
  news: [],
  portfolio: { balance: 0, holdings: [], transactions: [] },
  historyByCrop: {},
  selectedCropId: null,
  loading: false,
  error: null,
  installPrompt: null,

  setInstallPrompt: (e) => set({ installPrompt: e }),

  async bootstrap() {
    const { user } = get();
    set({ loading: true, error: null });
    try {
      if (user?.id) {
        const me = await apiMe(user.id);
        set({ user: me.user });
        persistUser(me.user);
      }
      const [cropsRes, newsRes] = await Promise.all([apiCrops(), apiNews(40)]);
      set({ crops: cropsRes.crops, news: newsRes.news });
      if (get().user?.id) {
        await get().refreshPortfolio();
      }
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  async login(username) {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(username);
      set({ user: data.user });
      persistUser(data.user);
      await get().refreshAll();
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  logout() {
    persistUser(null);
    set({
      user: null,
      portfolio: { balance: 0, holdings: [], transactions: [] },
      historyByCrop: {},
    });
  },

  async refreshPortfolio() {
    const { user } = get();
    if (!user) return;
    const p = await apiPortfolio(user.id);
    set({
      portfolio: {
        balance: p.balance,
        holdings: p.holdings,
        transactions: p.transactions,
      },
    });
  },

  async refreshAll() {
    const { user } = get();
    const [cropsRes, newsRes] = await Promise.all([apiCrops(), apiNews(40)]);
    set({ crops: cropsRes.crops, news: newsRes.news });
    if (user?.id) await get().refreshPortfolio();
  },

  setCrops: (crops) => set({ crops }),
  setNews: (news) => set({ news }),

  selectCrop: (id) => set({ selectedCropId: id }),

  async loadHistory(cropId) {
    const data = await apiHistory(cropId, 150);
    set((s) => ({
      historyByCrop: { ...s.historyByCrop, [cropId]: data.history },
    }));
  },

  async buy(cropId, quantity) {
    const { user } = get();
    if (!user) throw new Error('Not logged in');
    await apiBuy(user.id, cropId, quantity);
    await get().refreshPortfolio();
    const me = await apiMe(user.id);
    set({ user: me.user });
    persistUser(me.user);
  },

  async sell(cropId, quantity) {
    const { user } = get();
    if (!user) throw new Error('Not logged in');
    await apiSell(user.id, cropId, quantity);
    await get().refreshPortfolio();
    const me = await apiMe(user.id);
    set({ user: me.user });
    persistUser(me.user);
  },

  async startTutorial() {
    const { user } = get();
    if (!user) return;
    const data = await apiTutorialStart(user.id);
    set({ user: data.user });
    persistUser(data.user);
    await get().refreshPortfolio();
  },

  async completeTutorial() {
    const { user } = get();
    if (!user) return;
    const data = await apiTutorialComplete(user.id);
    set({ user: data.user });
    persistUser(data.user);
    await get().refreshPortfolio();
  },
}));
