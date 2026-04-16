import { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

const MIN_PRICE = 0.01;

function useHtmlDarkClass() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function toUnixTime(iso) {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** Build OHLC from close-only sim data (synthetic wicks). */
function toCandles(rows) {
  const sorted = [...rows].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  const out = [];
  let prevClose = sorted[0]?.price ?? 0;
  for (let i = 0; i < sorted.length; i++) {
    const close = sorted[i].price;
    const open = i === 0 ? close : prevClose;
    const bodyTop = Math.max(open, close);
    const bodyBot = Math.min(open, close);
    const wick = Math.max(bodyTop * 0.004, 0.02);
    const high = bodyTop + wick;
    const low = Math.max(MIN_PRICE, bodyBot - wick);
    const t = toUnixTime(sorted[i].time);
    if (t == null) continue;
    out.push({
      time: t,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
    prevClose = close;
  }
  return out;
}

export default function StockChart({ history, emptyHint = 'Loading…' }) {
  const isDark = useHtmlDarkClass();
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const bg = isDark ? '#0b1220' : '#ffffff';
    const text = isDark ? '#cbd5e1' : '#334155';
    const grid = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.25)';

    const chart = createChart(el, {
      layout: {
        background: { type: 'solid', color: bg },
        textColor: text,
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)' },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
        barSpacing: 6,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        mouse: true,
        touch: true,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#14b8a6',
      downColor: '#f472b6',
      borderVisible: false,
      wickUpColor: '#5eead4',
      wickDownColor: '#fda4af',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) chart.applyOptions({ width, height });
    });
    ro.observe(el);
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) chart.applyOptions({ width, height });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isDark]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (!history?.length) {
      series.setData([]);
      return;
    }
    const candles = toCandles(history);
    series.setData(candles);
    chartRef.current?.timeScale().fitContent();
  }, [history]);

  if (!history?.length) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-500">{emptyHint}</div>
    );
  }

  return <div ref={wrapRef} className="h-full w-full min-h-[220px]" />;
}
