import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';

const panelBase =
  'fixed z-[55] flex max-h-[min(70vh,520px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi — I explain this sim in plain English. Try “news”, “portfolio”, or a crop name.' },
  ]);
  const [busy, setBusy] = useState(false);
  const askAi = useGameStore((s) => s.askAi);
  const user = useGameStore((s) => s.user);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const res = await askAi(q);
      setMessages((m) => [...m, { role: 'assistant', text: res.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: e.message || 'Could not answer.' }]);
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open AI assistant"
        className="fixed bottom-32 right-4 z-[54] flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/40 bg-gradient-to-br from-teal-400 to-cyan-500 text-xl shadow-lg transition active:scale-95 lg:bottom-8"
        onClick={() => setOpen((o) => !o)}
      >
        ✦
      </button>
      {open && (
        <div className={`${panelBase} bottom-48 right-4 lg:bottom-24`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">Desk analyst</p>
            <button type="button" className="text-slate-500 hover:text-slate-800 dark:hover:text-white" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 ${
                  msg.role === 'user'
                    ? 'ml-6 bg-teal-500/15 text-slate-900 dark:bg-neon-mint/10 dark:text-white'
                    : 'mr-4 bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {busy && <p className="text-xs text-slate-500">Thinking…</p>}
          </div>
          <div className="border-t border-slate-200 p-3 dark:border-white/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about crops, news, risk…"
                className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button
                type="button"
                disabled={busy}
                className="min-h-[44px] rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white disabled:opacity-50 dark:bg-neon-mint dark:text-slate-900"
                onClick={send}
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">Rule-based mock AI — not ChatGPT, not financial advice.</p>
          </div>
        </div>
      )}
    </>
  );
}
