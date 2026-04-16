export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}) {
  const base =
    'inline-flex min-h-[48px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40';
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-teal-400/90 to-cyan-400/80 text-slate-900 shadow-glow'
      : variant === 'ghost'
        ? 'border border-white/15 bg-white/5 text-slate-100'
        : variant === 'accent'
          ? 'border border-neon-pink/50 bg-neon-pink/15 text-neon-pink'
          : 'border border-neon-pink/40 bg-neon-pink/10 text-neon-pink';
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
