import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useGameStore } from './store/gameStore.js';

const Login = lazy(() => import('./pages/Login.jsx'));
const Tutorial = lazy(() => import('./pages/Tutorial.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Markets = lazy(() => import('./pages/Markets.jsx'));
const Trade = lazy(() => import('./pages/Trade.jsx'));
const NewsPage = lazy(() => import('./pages/News.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const Watchlist = lazy(() => import('./pages/Watchlist.jsx'));
const Research = lazy(() => import('./pages/Research.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
      Loading CropBank…
    </div>
  );
}

function Protected({ children }) {
  const token = useGameStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function TutorialGate({ children }) {
  const user = useGameStore((s) => s.user);
  const token = useGameStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return <Spinner />;
  if (!user.tutorialCompleted) return <Navigate to="/tutorial" replace />;
  return children;
}

export default function App() {
  const bootstrap = useGameStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/tutorial"
            element={
              <Protected>
                <Tutorial />
              </Protected>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <TutorialGate>
                  <Dashboard />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/markets"
            element={
              <Protected>
                <TutorialGate>
                  <Markets />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/trade"
            element={
              <Protected>
                <TutorialGate>
                  <Trade />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/news"
            element={
              <Protected>
                <TutorialGate>
                  <NewsPage />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/portfolio"
            element={
              <Protected>
                <TutorialGate>
                  <Portfolio />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/watchlist"
            element={
              <Protected>
                <TutorialGate>
                  <Watchlist />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/research"
            element={
              <Protected>
                <TutorialGate>
                  <Research />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/settings"
            element={
              <Protected>
                <TutorialGate>
                  <Settings />
                </TutorialGate>
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <TutorialGate>
                  <Profile />
                </TutorialGate>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
