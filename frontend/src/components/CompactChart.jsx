import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

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

function toUnix(iso) {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** One point per unique second; last wins (intraday ticks). */
function toLineData(rows) {
  const map = new Map();
  for (const r of rows) {
    const t = toUnix(r.time);
    if (t == null) continue;
    map.set(t, { time: t, value: r.price });
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

const CompactChart = forwardRef(function CompactChart({ history, emptyHint = 'Loading…' }, ref) {
  const isDark = useHtmlDarkClass();
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useImperativeHandle(ref, () => ({
    resetView() {
      chartRef.current?.timeScale().fitContent();
    },
  }));

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const bg = isDark ? '#0b1220' : '#f8fafc';
    const text = isDark ? '#cbd5e1' : '#334155';
    const grid = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)';

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: 'solid', color: bg },
        textColor: text,
        attributionLogo: false,
      },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Magnet },
      rightPriceScale: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)' },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)',
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 4,
        barSpacing: 3,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: { time: true, price: true }, mouseWheel: true, pinch: true },
    });

    const series = chart.addLineSeries({
      color: '#14b8a6',
      lineWidth: 2,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isDark]);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;
    if (!history?.length) {
      series.setData([]);
      return;
    }
    const data = toLineData(history);
    series.setData(data);
    requestAnimationFrame(() => chart.timeScale().fitContent());
  }, [history]);

  if (!history?.length) {
    return (
      <div className="flex h-full min-h-[160px] items-center justify-center text-xs text-slate-500">{emptyHint}</div>
    );
  }

  return <div ref={wrapRef} className="h-full w-full min-h-[160px] min-w-0" />;
});

CompactChart.displayName = 'CompactChart';

export default CompactChart;
