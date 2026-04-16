import { useGameStore } from '../store/gameStore.js';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function Settings() {
  const user = useGameStore((s) => s.user);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetGame = useGameStore((s) => s.resetGame);
  const claimDaily = useGameStore((s) => s.claimDaily);
  const theme = user?.settings?.theme || 'dark';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Preferences persist with your account.</p>
      </div>

      <Card>
        <p className="text-xs uppercase tracking-widest text-slate-500">Account</p>
        <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white">{user?.username}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
        <p className="mt-3 text-xs text-slate-500">
          Session uses JWT stored in this browser. Sign out clears it locally.
        </p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-widest text-slate-500">Appearance & feedback</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Theme</p>
              <p className="text-xs text-slate-500">Dark is tuned for neon glass; light is paper mode.</p>
            </div>
            <div className="flex rounded-xl border border-slate-200 p-1 dark:border-white/10">
              <button
                type="button"
                className={`min-h-[44px] rounded-lg px-4 text-sm font-medium ${
                  theme === 'light'
                    ? 'bg-white shadow dark:bg-white/15 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                Light
              </button>
              <button
                type="button"
                className={`min-h-[44px] rounded-lg px-4 text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow dark:bg-white/15'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                Dark
              </button>
            </div>
          </div>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-800 dark:text-slate-200">Sound effects</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-teal-500"
              checked={!!user?.settings?.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-800 dark:text-slate-200">In-app notifications</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-teal-500"
              checked={!!user?.settings?.notificationsEnabled}
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
            />
          </label>
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-widest text-slate-500">Rewards</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Claim a small daily credit once per calendar day.</p>
        <Button className="mt-3" onClick={() => claimDaily()}>
          Claim daily reward (+$25)
        </Button>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-widest text-slate-500">Danger zone</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Reset clears positions, history, watchlist, and achievements. Balance returns to $1000 and tutorial re-opens.
        </p>
        <Button
          variant="accent"
          className="mt-3"
          onClick={() => {
            if (window.confirm('Reset entire game state for this account?')) resetGame();
          }}
        >
          Reset game
        </Button>
      </Card>

      <p className="text-center text-sm">
        <Link to="/portfolio" className="text-teal-600 underline dark:text-neon-mint">
          View full ledger & achievements
        </Link>
      </p>
    </div>
  );
}
