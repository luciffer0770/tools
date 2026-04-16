import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useGameStore } from '../store/gameStore.js';
import { createGameSocket } from '../services/socket.js';

const BottomNav = lazy(() => import('./BottomNav.jsx'));
const DesktopSidebar = lazy(() => import('./DesktopSidebar.jsx'));
const InstallPrompt = lazy(() => import('./InstallPrompt.jsx'));

const navWrap = 'flex flex-col min-h-full';

export default function Layout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const location = useLocation();
  const setCrops = useGameStore((s) => s.setCrops);
  const setNews = useGameStore((s) => s.setNews);
  const user = useGameStore((s) => s.user);

  useEffect(() => {
    const socket = createGameSocket();
    socket.on('crops', (payload) => {
      if (payload?.crops) setCrops(payload.crops);
    });
    socket.on('news', (payload) => {
      if (payload?.news) setNews(payload.news);
    });
    return () => socket.disconnect();
  }, [setCrops, setNews]);

  const hideChrome = location.pathname === '/' || location.pathname.startsWith('/tutorial');

  return (
    <div className={navWrap}>
      {!hideChrome && isDesktop && (
        <Suspense fallback={null}>
          <DesktopSidebar />
        </Suspense>
      )}
      <div className={`flex-1 ${!hideChrome && isDesktop ? 'lg:pl-64' : ''}`}>
        <header className="safe-pt sticky top-0 z-30 glass border-b border-white/5 px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <NavLink to={user ? '/dashboard' : '/'} className="font-display text-lg tracking-tight">
              <span className="text-neon-mint">Crop</span>
              <span className="text-white">Bank</span>
            </NavLink>
            {user && (
              <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  ${user.balance.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>
      {!hideChrome && !isDesktop && (
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>
    </div>
  );
}
