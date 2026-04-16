import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import Button from './Button.jsx';

export default function InstallPrompt() {
  const setInstallPrompt = useGameStore((s) => s.setInstallPrompt);
  const installPrompt = useGameStore((s) => s.installPrompt);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [setInstallPrompt]);

  async function onInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setVisible(false);
    setInstallPrompt(null);
  }

  if (!visible || !installPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 lg:bottom-8 lg:left-auto lg:right-8 lg:w-80">
      <div className="glass rounded-2xl p-4 shadow-glow">
        <p className="text-sm text-slate-200">Install CropBank for a full-screen, app-like experience.</p>
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={onInstall}>
            Install
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => setVisible(false)}>
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
