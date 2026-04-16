import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function Login() {
  const navigate = useNavigate();
  const login = useGameStore((s) => s.login);
  const register = useGameStore((s) => s.register);
  const loading = useGameStore((s) => s.loading);
  const storeError = useGameStore((s) => s.error);
  const clearError = useGameStore((s) => s.clearError);
  const user = useGameStore((s) => s.user);

  useEffect(() => {
    clearError();
  }, [mode, clearError]);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  if (user?.tutorialCompleted) {
    navigate('/dashboard', { replace: true });
    return null;
  }
  if (user && !user.tutorialCompleted) {
    navigate('/tutorial', { replace: true });
    return null;
  }

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return false;
    }
    if (mode === 'register' && !username.trim()) {
      setLocalError('Choose a display name.');
      return false;
    }
    setLocalError('');
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password, username: username.trim() });
      }
      navigate('/tutorial');
    } catch (err) {
      setLocalError(err.message || 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center pb-12 pt-6 lg:max-w-4xl lg:flex-row lg:items-stretch lg:gap-10">
      <div className="lg:flex-1 lg:py-8">
        <p className="text-xs uppercase tracking-[0.25em] text-teal-600 dark:text-neon-violet">
          CropBank simulation
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
          Trade synthetic crops with news-driven prices.
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Virtual cash only. JWT sessions, portfolio analytics, research desk, and a built-in analyst
          assistant — all mobile-first.
        </p>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
          Already migrated an old account? Use password <span className="font-mono text-slate-700 dark:text-slate-300">CropBank2024!</span> with your legacy email if prompted.
        </p>
      </div>
      <Card className="mt-8 shrink-0 lg:mt-0 lg:w-[400px]">
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          <button
            type="button"
            className={`min-h-[44px] flex-1 rounded-lg text-sm font-semibold transition ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => {
              setMode('login');
              setLocalError('');
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`min-h-[44px] flex-1 rounded-lg text-sm font-semibold transition ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => {
              setMode('register');
              setLocalError('');
            }}
          >
            Create account
          </button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-teal-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Display name</label>
              <input
                type="text"
                autoComplete="nickname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-teal-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Password</label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-teal-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          {(localError || storeError) && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {localError || storeError}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          By continuing you agree this is a fictional game, not financial advice.
        </p>
      </Card>
    </div>
  );
}
