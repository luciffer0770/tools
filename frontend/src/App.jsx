import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useGameStore } from './store/gameStore.js';
import { useEffect } from 'react';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Tutorial = lazy(() => import('./pages/Tutorial.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Markets = lazy(() => import('./pages/Markets.jsx'));
const Trade = lazy(() => import('./pages/Trade.jsx'));
const NewsPage = lazy(() => import('./pages/News.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
      Loading simulation…
    </div>
  );
}

function Protected({ children }) {
  const user = useGameStore((s) => s.user);
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function TutorialGate({ children }) {
  const user = useGameStore((s) => s.user);
  if (!user) return <Navigate to="/" replace />;
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
          <Route path="/" element={<Landing />} />
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
            path="/profile"
            element={
              <Protected>
                <TutorialGate>
                  <Profile />
                </TutorialGate>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
