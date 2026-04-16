import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function Profile() {
  const user = useGameStore((s) => s.user);
  const txs = useGameStore((s) => s.portfolio.transactions);
  const logout = useGameStore((s) => s.logout);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4">
      <Card className="lg:col-span-1">
        <p className="text-xs uppercase tracking-widest text-slate-500">Operator</p>
        <p className="mt-2 font-display text-2xl text-white">{user?.username}</p>
        <p className="mt-2 text-sm text-slate-400">Mock login — data stays on this device session id.</p>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => logout()}>
          Sign out
        </Button>
      </Card>
      <Card className="lg:col-span-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">Monetization (placeholder)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-neon-violet/40 bg-neon-violet/5 p-3">
            <p className="text-sm font-medium text-white">Balance boost</p>
            <p className="mt-1 text-xs text-slate-400">Future SKU — not purchasable.</p>
            <Button className="mt-3 w-full" disabled>
              Coming soon
            </Button>
          </div>
          <div className="rounded-xl border border-dashed border-neon-mint/40 bg-neon-mint/5 p-3">
            <p className="text-sm font-medium text-white">Premium insights</p>
            <p className="mt-1 text-xs text-slate-400">UI hook only — no payments wired.</p>
            <Button variant="ghost" className="mt-3 w-full" disabled>
              Preview locked
            </Button>
          </div>
        </div>
      </Card>
      <Card className="lg:col-span-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">Ledger</p>
        <div className="mt-3 hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">When</th>
                <th className="py-2">Crop</th>
                <th className="py-2">Side</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Price</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="py-2 text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2">{t.cropName}</td>
                  <td className="py-2 capitalize">{t.type}</td>
                  <td className="py-2">{t.quantity}</td>
                  <td className="py-2">${t.price.toFixed(2)}</td>
                  <td className="py-2">${t.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-2 lg:hidden">
          {txs.length === 0 && <p className="text-sm text-slate-500">No fills yet.</p>}
          {txs.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-white">{t.cropName}</p>
                <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-slate-400">{t.type}</p>
                <p className="text-neon-mint">${t.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
