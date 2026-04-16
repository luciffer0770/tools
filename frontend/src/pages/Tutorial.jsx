import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { useSwipe } from '../hooks/useSwipe.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const STEPS = [
  {
    title: 'Welcome to CropBank',
    body: 'This is a fictional market sim: crops have prices, news shocks them, and you trade with virtual dollars only.',
    target: 'concept',
  },
  {
    title: 'Practice balance',
    body: 'You start this walkthrough with $100. When you finish (or skip), your account resets to $1000 for the real run.',
    target: 'balance',
  },
  {
    title: 'How buying works',
    body: 'Open Trade from the bottom bar. Pick a crop, choose quantity, tap Buy. Your average cost updates automatically.',
    target: 'buy',
  },
  {
    title: 'Prices move',
    body: 'The tape ticks every few seconds. Headlines in News can lift or press specific crops — watch Research for movers.',
    target: 'chart',
  },
  {
    title: 'Selling & P&L',
    body: 'Sell frees cash and locks P&L vs your average buy price. Portfolio shows unrealized P&L on open lots.',
    target: 'sell',
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const startTutorial = useGameStore((s) => s.startTutorial);
  const completeTutorial = useGameStore((s) => s.completeTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);
  const setTutorialStep = useGameStore((s) => s.setTutorialStep);
  const user = useGameStore((s) => s.user);
  const [index, setIndex] = useState(0);
  const primedRef = useRef(false);

  const step = STEPS[index];

  const swipe = useSwipe({
    onLeft: () => setIndex((i) => Math.min(STEPS.length - 1, i + 1)),
    onRight: () => setIndex((i) => Math.max(0, i - 1)),
  });

  useEffect(() => {
    if (user?.tutorialCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.tutorialCompleted || primedRef.current) return;
    if (user.balance > 100) {
      primedRef.current = true;
      startTutorial().catch(() => {
        primedRef.current = false;
      });
    }
  }, [user, startTutorial]);

  useEffect(() => {
    if (user && !user.tutorialCompleted) {
      setTutorialStep(index + 1);
    }
  }, [index, user, setTutorialStep]);

  async function finish() {
    await completeTutorial();
    navigate('/dashboard', { replace: true });
  }

  async function skip() {
    await skipTutorial();
    navigate('/dashboard', { replace: true });
  }

  const highlight =
    step.target === 'balance'
      ? 'ring-2 ring-teal-500 shadow-lg dark:ring-neon-mint'
      : step.target === 'chart'
        ? 'ring-2 ring-violet-500 dark:ring-neon-violet'
        : 'ring-2 ring-amber-400/80 dark:ring-amber-300/60';

  return (
    <div className="relative mx-auto max-w-lg pb-28 pt-4">
      <div className="pointer-events-none fixed inset-0 z-40 bg-slate-900/50 dark:bg-black/60" aria-hidden />
      <div className="relative z-50 space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-600 dark:text-slate-500">
          <span>Onboarding</span>
          <span>
            Step {index + 1}/{STEPS.length}
          </span>
        </div>
        <Card {...swipe} className={`relative ${highlight}`}>
          <h1 className="font-display text-2xl text-slate-900 dark:text-white">{step.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.body}</p>
          {user && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
              Balance:{' '}
              <span className="font-semibold text-teal-700 dark:text-neon-mint">${user.balance.toFixed(2)}</span>
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
          {index < STEPS.length - 1 ? (
            <Button className="flex-1" onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}>
              Next
            </Button>
          ) : (
            <Button className="flex-1" onClick={finish}>
              Start with $1000
            </Button>
          )}
        </div>
        <div className="flex justify-center">
          <button type="button" className="text-sm text-slate-500 underline dark:text-slate-400" onClick={skip}>
            Skip tutorial
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-500">Swipe the card to change steps.</p>
      </div>
    </div>
  );
}
