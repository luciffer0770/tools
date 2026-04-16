import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function Landing() {
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const login = useGameStore((s) => s.login);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const [name, setName] = useState('');

  if (user?.tutorialCompleted) return <Navigate to="/dashboard" replace />;
  if (user && !user.tutorialCompleted) return <Navigate to="/tutorial" replace />;

  async function onStart() {
    await login(name.trim() || 'Nova Trader');
    navigate('/tutorial');
  }

  return (
    <div className="space-y-8 pb-10 pt-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-12">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neon-violet">Virtual markets</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Trade crops like <span className="text-neon-mint">assets</span> in a living futures sim.
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-400">
          News moves markets. Demand drifts. Volatility hums. This is a game — no real money, no real crops,
          just strategy and neon-soaked price action.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Callsign (optional)"
            className="min-h-[48px] w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none ring-neon-mint/40 focus:ring-2 sm:max-w-xs"
          />
          <Button className="w-full sm:w-auto sm:min-w-[160px]" disabled={loading} onClick={onStart}>
            {loading ? 'Connecting…' : 'Start Game'}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neon-mint/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-neon-violet/20 blur-3xl" />
        <h2 className="font-display text-lg text-white">Session zero</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li>• $1000 virtual balance after onboarding</li>
          <li>• Event-driven price engine with soft caps</li>
          <li>• Installable PWA — tuned for thumb-first play</li>
        </ul>
      </Card>
    </div>
  );
}
