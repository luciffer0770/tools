import { create } from 'zustand';
import {
  apiLogin,
  apiGuest,
  apiRegister,
  apiMe,
  apiCrops,
  apiPortfolio,
  apiNews,
  apiHistory,
  apiBuy,
  apiSell,
  apiTutorialStart,
  apiTutorialComplete,
  apiTutorialSkip,
  apiTutorialStep,
  apiWatchlist,
  apiWatchlistAdd,
  apiWatchlistRemove,
  apiResearch,
  apiAiQuery,
  apiPatchSettings,
  apiResetGame,
  apiDailyReward,
} from '../services/api.js';

const LS_TOKEN = 'cropbank_token';
const LS_USER = 'cropbank_user';

function loadToken() {
  try {
    return localStorage.getItem(LS_TOKEN);
  } catch {
    return null;
  }
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(token, user) {
  try {
    if (token) localStorage.setItem(LS_TOKEN, token);
    else localStorage.removeItem(LS_TOKEN);
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  } catch {
    /* ignore */
  }
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (theme === 'light') root.classList.remove('dark');
  else root.classList.add('dark');
}

const initialUser = loadStoredUser();
if (initialUser?.settings?.theme) applyThemeClass(initialUser.settings.theme);
else applyThemeClass('dark');

export const useGameStore = create((set, get) => ({
  token: loadToken(),
  user: initialUser,
  crops: [],
  news: [],
  watchlist: [],
  research: null,
  portfolio: {
    balance: 0,
    holdings: [],
    transactions: [],
    portfolioHistory: [],
    achievements: [],
    invested: 0,
    marketValue: 0,
    totalValue: 0,
    unrealizedPl: 0,
    unrealizedPlPct: 0,
  },
  historyByCrop: {},
  selectedCropId: null,
  loading: false,
  pageLoading: false,
  error: null,
  toast: null,
  installPrompt: null,

  setInstallPrompt: (e) => set({ installPrompt: e }),
  clearError: () => set({ error: null }),

  showToast: (message, variant = 'info') => {
    set({ toast: { message, variant, id: Date.now() } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  async bootstrap() {
    const { token } = get();
    set({ loading: true, error: null });
    try {
      if (token) {
        const me = await apiMe(token);
        set({ user: me.user });
        persistSession(token, me.user);
        applyThemeClass(me.user.settings?.theme || 'dark');
      }
      const [cropsRes, newsRes] = await Promise.all([apiCrops(), apiNews(40)]);
      set({ crops: cropsRes.crops, news: newsRes.news });
      if (get().token) {
        await Promise.all([get().refreshPortfolio(), get().refreshWatchlist(), get().refreshResearch()]);
      }
    } catch (e) {
      persistSession(null, null);
      set({ token: null, user: null, error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  async register({ email, password, username }) {
    set({ loading: true, error: null });
    try {
      const data = await apiRegister({ email, password, username });
      persistSession(data.token, data.user);
      applyThemeClass(data.user.settings?.theme || 'dark');
      set({ token: data.token, user: data.user });
      await get().refreshAll();
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  async login({ email, password }) {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin({ email, password });
      persistSession(data.token, data.user);
      applyThemeClass(data.user.settings?.theme || 'dark');
      set({ token: data.token, user: data.user });
      await get().refreshAll();
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  async loginAsGuest() {
    set({ loading: true, error: null });
    try {
      const data = await apiGuest();
      persistSession(data.token, data.user);
      applyThemeClass(data.user.settings?.theme || 'dark');
      set({ token: data.token, user: data.user });
      await get().refreshAll();
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout() {
    persistSession(null, null);
    set({
      token: null,
      user: null,
      watchlist: [],
      research: null,
      portfolio: {
        balance: 0,
        holdings: [],
        transactions: [],
        portfolioHistory: [],
        achievements: [],
        invested: 0,
        marketValue: 0,
        totalValue: 0,
        unrealizedPl: 0,
        unrealizedPlPct: 0,
      },
      historyByCrop: {},
    });
  },

  async refreshPortfolio() {
    const { token } = get();
    if (!token) return;
    const p = await apiPortfolio(token);
    set({
      portfolio: {
        balance: p.balance,
        holdings: p.holdings || [],
        transactions: p.transactions || [],
        portfolioHistory: p.portfolioHistory || [],
        achievements: p.achievements || [],
        invested: p.invested ?? 0,
        marketValue: p.marketValue ?? 0,
        totalValue: p.totalValue ?? p.balance,
        unrealizedPl: p.unrealizedPl ?? 0,
        unrealizedPlPct: p.unrealizedPlPct ?? 0,
      },
    });
  },

  async refreshWatchlist() {
    const { token } = get();
    if (!token) return;
    const data = await apiWatchlist(token);
    set({ watchlist: data.items || [] });
  },

  async refreshResearch() {
    const data = await apiResearch();
    set({ research: data });
  },

  async refreshAll() {
    const { token } = get();
    const [cropsRes, newsRes] = await Promise.all([apiCrops(), apiNews(40)]);
    set({ crops: cropsRes.crops, news: newsRes.news });
    if (token) {
      await Promise.all([get().refreshPortfolio(), get().refreshWatchlist(), get().refreshResearch()]);
    }
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
    const { token } = get();
    if (!token) throw new Error('Not logged in');
    const res = await apiBuy(token, cropId, quantity);
    await get().refreshPortfolio();
    const me = await apiMe(token);
    set({ user: me.user });
    persistSession(token, me.user);
    if (res.toast) get().showToast(res.toast, 'success');
    if (res.achievements?.length) {
      get().showToast(`Achievement: ${res.achievements.join(', ')}`, 'success');
    }
  },

  async sell(cropId, quantity) {
    const { token } = get();
    if (!token) throw new Error('Not logged in');
    const res = await apiSell(token, cropId, quantity);
    await get().refreshPortfolio();
    const me = await apiMe(token);
    set({ user: me.user });
    persistSession(token, me.user);
    if (res.toast) get().showToast(res.toast, 'success');
    if (res.achievements?.length) {
      get().showToast(`Achievement: ${res.achievements.join(', ')}`, 'success');
    }
  },

  async addWatch(cropId) {
    const { token } = get();
    if (!token) return;
    const data = await apiWatchlistAdd(token, cropId);
    set({ watchlist: data.items || [] });
    get().showToast('Added to watchlist', 'success');
  },

  async removeWatch(cropId) {
    const { token } = get();
    if (!token) return;
    const data = await apiWatchlistRemove(token, cropId);
    set({ watchlist: data.items || [] });
  },

  async askAi(message) {
    const { token } = get();
    if (!token) throw new Error('Login required');
    return apiAiQuery(token, message);
  },

  async updateSettings(partial) {
    const { token } = get();
    if (!token) return;
    const data = await apiPatchSettings(token, partial);
    set({ user: data.user });
    persistSession(token, data.user);
    if (partial.theme) applyThemeClass(data.user.settings.theme);
  },

  async resetGame() {
    const { token } = get();
    if (!token) return;
    const data = await apiResetGame(token);
    set({ user: data.user });
    persistSession(token, data.user);
    await get().refreshPortfolio();
    get().showToast(data.message || 'Game reset', 'success');
  },

  async claimDaily() {
    const { token } = get();
    if (!token) return;
    const data = await apiDailyReward(token);
    if (data.ok) {
      set({ user: data.user });
      persistSession(token, data.user);
      get().showToast(`Daily bonus +$${data.bonus}`, 'success');
    } else {
      get().showToast('Already claimed today', 'info');
    }
  },

  async startTutorial() {
    const { token } = get();
    if (!token) return;
    const data = await apiTutorialStart(token);
    set({ user: data.user });
    persistSession(token, data.user);
    await get().refreshPortfolio();
  },

  async completeTutorial() {
    const { token } = get();
    if (!token) return;
    const data = await apiTutorialComplete(token);
    set({ user: data.user });
    persistSession(token, data.user);
    await get().refreshPortfolio();
  },

  async skipTutorial() {
    const { token } = get();
    if (!token) return;
    const data = await apiTutorialSkip(token);
    set({ user: data.user });
    persistSession(token, data.user);
    await get().refreshPortfolio();
  },

  async setTutorialStep(step) {
    const { token } = get();
    if (!token) return;
    const data = await apiTutorialStep(token, step);
    set({ user: data.user });
    persistSession(token, data.user);
  },

  setPageLoading: (v) => set({ pageLoading: v }),
}));
