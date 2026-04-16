import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
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

/** Dedupe by time (keep last). */
function dedupeByTime(rows) {
  const map = new Map();
  for (const r of rows) {
    const t = toUnixTime(r.time);
    if (t == null) continue;
    map.set(t, r);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, row]) => row);
}

/** Build OHLC + synthetic volume from daily closes. */
function buildSeriesData(rows) {
  const sorted = dedupeByTime(rows);
  const candles = [];
  const volumes = [];
  const closes = [];

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

    const ret = i > 0 && prevClose > 0 ? Math.abs((close - prevClose) / prevClose) : 0.008;
    const baseVol = 800_000 * ret + 25_000;
    const noise = ((t * 7) % 1000) / 1000;
    const volume = Math.max(1000, Math.round(baseVol * (0.85 + noise * 0.3)));

    candles.push({
      time: t,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
    volumes.push({
      time: t,
      value: volume,
      color: close >= open ? 'rgba(20, 184, 166, 0.55)' : 'rgba(244, 114, 182, 0.55)',
    });
    closes.push(close);
    prevClose = close;
  }

  function sma(period) {
    const out = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) continue;
      let s = 0;
      for (let j = 0; j < period; j++) s += closes[i - j];
      out.push({ time: candles[i].time, value: Math.round((s / period) * 100) / 100 });
    }
    return out;
  }

  return {
    candles,
    volumes,
    ma20: sma(20),
    ma50: sma(50),
  };
}

const StockChart = forwardRef(function StockChart({ history, emptyHint = 'Loading…' }, ref) {
  const isDark = useHtmlDarkClass();
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);
  const ma20Ref = useRef(null);
  const ma50Ref = useRef(null);

  useImperativeHandle(ref, () => ({
    resetView() {
      chartRef.current?.timeScale().fitContent();
    },
  }));

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const bg = isDark ? '#0b1220' : '#ffffff';
    const text = isDark ? '#cbd5e1' : '#334155';
    const grid = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.25)';

    const chart = createChart(el, {
      autoSize: true,
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
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: 5,
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
      kineticScroll: { mouse: true, touch: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#14b8a6',
      downColor: '#f472b6',
      borderVisible: false,
      wickUpColor: '#5eead4',
      wickDownColor: '#fda4af',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    const ma20Series = chart.addLineSeries({
      color: '#fbbf24',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'MA 20',
    });

    const ma50Series = chart.addLineSeries({
      color: '#a78bfa',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'MA 50',
    });

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.08, bottom: 0.22 },
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;
    ma20Ref.current = ma20Series;
    ma50Ref.current = ma50Series;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      ma20Ref.current = null;
      ma50Ref.current = null;
    };
  }, [isDark]);

  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleRef.current;
    const volumeSeries = volumeRef.current;
    const ma20Series = ma20Ref.current;
    const ma50Series = ma50Ref.current;
    if (!chart || !candleSeries || !volumeSeries || !ma20Series || !ma50Series) return;

    if (!history?.length) {
      candleSeries.setData([]);
      volumeSeries.setData([]);
      ma20Series.setData([]);
      ma50Series.setData([]);
      return;
    }

    const { candles, volumes, ma20, ma50 } = buildSeriesData(history);
    candleSeries.setData(candles);
    volumeSeries.setData(volumes);
    ma20Series.setData(ma20);
    ma50Series.setData(ma50);

    requestAnimationFrame(() => {
      chart.timeScale().fitContent();
    });
  }, [history]);

  if (!history?.length) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-500">{emptyHint}</div>
    );
  }

  return <div ref={wrapRef} className="h-full w-full min-h-[240px] min-w-0" />;
});

StockChart.displayName = 'StockChart';

export default StockChart;
