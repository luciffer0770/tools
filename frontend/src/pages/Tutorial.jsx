import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { useSwipe } from '../hooks/useSwipe.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const steps = [
  {
    title: 'Welcome, operator',
    body: 'CropBank simulates crop futures with news shocks, demand drift, and controlled volatility. You are not on a real exchange.',
    highlight: 'balance',
  },
  {
    title: 'Practice purse',
    body: 'For this walkthrough you start with $100. When you finish, your account resets to the full $1000 starting balance.',
    highlight: 'balance',
  },
  {
    title: 'Markets pulse',
    body: 'Prices tick every few seconds. Watch the News tab — headlines steer one to three crops at a time with decaying impact.',
    highlight: 'news',
  },
  {
    title: 'Execute trades',
    body: 'Use Trade to open a crop, read the chart, then buy or sell from the action rail. Large tap targets keep thumbs happy.',
    highlight: 'trade',
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const startTutorial = useGameStore((s) => s.startTutorial);
  const completeTutorial = useGameStore((s) => s.completeTutorial);
  const user = useGameStore((s) => s.user);
  const [index, setIndex] = useState(0);
  const primedRef = useRef(false);

  const step = steps[index];

  const swipe = useSwipe({
    onLeft: () => setIndex((i) => Math.min(steps.length - 1, i + 1)),
    onRight: () => setIndex((i) => Math.max(0, i - 1)),
  });

  const halo = useMemo(() => {
    if (step.highlight === 'balance')
      return 'ring-2 ring-neon-mint/60 shadow-[0_0_40px_rgba(94,234,212,0.35)]';
    if (step.highlight === 'news') return 'ring-2 ring-neon-violet/60';
    return 'ring-2 ring-neon-pink/50';
  }, [step.highlight]);

  useEffect(() => {
    if (!user || user.tutorialCompleted || primedRef.current) return;
    if (user.balance > 100) {
      primedRef.current = true;
      startTutorial().catch(() => {
        primedRef.current = false;
      });
    }
  }, [user, startTutorial]);

  async function finish() {
    await completeTutorial();
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-10 pt-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-500">
        <span>Tutorial</span>
        <span>
          Step {index + 1}/{steps.length}
        </span>
      </div>
      <Card {...swipe} className={`${halo} transition`}>
        <h1 className="font-display text-2xl text-white">{step.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.body}</p>
        {user && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            Balance: <span className="text-neon-mint font-semibold">${user.balance.toFixed(2)}</span>
          </div>
        )}
      </Card>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        {index < steps.length - 1 ? (
          <Button className="flex-1" onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}>
            Next
          </Button>
        ) : (
          <Button className="flex-1" onClick={finish}>
            Enter markets ($1000)
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-slate-500">Swipe the card left or right to change steps.</p>
    </div>
  );
}
