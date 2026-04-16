import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import router from './routes/index.js';
import { initSchema, db } from './db/database.js';
import { runMigrations } from './db/migrate.js';
import { seedCropsIfEmpty } from './db/seed.js';
import { tickPrices, appendInitialHistory } from './services/priceEngine.js';
import { backfillDailyHistoryIfNeeded, isHistoryBackfilled } from './services/historyBackfill.js';
import { spawnNewsEvent, pruneExpiredNews } from './services/newsEngine.js';
import { listCrops } from './models/cropModel.js';
import { listNews } from './services/newsEngine.js';
import { computePortfolioMetrics } from './services/portfolioAnalytics.js';
import { recordPortfolioSnapshot } from './models/portfolioModel.js';
import { verifyToken } from './services/jwtService.js';

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const ALLOW_TUNNEL =
  process.env.CROPBANK_ALLOW_TUNNEL === '1' || process.env.CROPBANK_ALLOW_TUNNEL === 'true';

const allowedOrigins = CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (ALLOW_TUNNEL) {
    try {
      const host = new URL(origin).hostname;
      if (host.endsWith('.trycloudflare.com')) return true;
      if (host.endsWith('.loca.lt')) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

const corsOptions = {
  origin(origin, cb) {
    cb(null, isOriginAllowed(origin));
  },
  credentials: true,
};

initSchema();
runMigrations();
seedCropsIfEmpty();
const backfill = backfillDailyHistoryIfNeeded();
if (backfill.ran) {
  console.log(`Price history: daily backfill from 2020 applied (${backfill.crops} crops).`);
} else if (!isHistoryBackfilled()) {
  appendInitialHistory();
}

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', router);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOptions.origin, methods: ['GET', 'POST'] },
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const payload = token ? verifyToken(token) : null;
  if (payload?.sub) socket.data.userId = payload.sub;
  next();
});

io.on('connection', (socket) => {
  socket.emit('crops', { crops: listCrops() });
  socket.emit('news', { news: listNews(30) });
});

function broadcastState() {
  const crops = listCrops();
  io.emit('crops', { crops });
}

function broadcastNews() {
  io.emit('news', { news: listNews(30) });
}

setInterval(() => {
  try {
    pruneExpiredNews();
    tickPrices();
    broadcastState();
  } catch (e) {
    console.error('tick error', e);
  }
}, 3500);

setInterval(() => {
  try {
    if (Math.random() > 0.35) {
      spawnNewsEvent();
      broadcastNews();
    }
  } catch (e) {
    console.error('news spawn error', e);
  }
}, 20000);

setTimeout(() => {
  try {
    spawnNewsEvent();
    broadcastNews();
  } catch (e) {
    console.error('initial news error', e);
  }
}, 2000);

setInterval(() => {
  try {
    const users = db.prepare('SELECT id FROM users').all();
    for (const u of users) {
      const m = computePortfolioMetrics(u.id);
      if (m) {
        recordPortfolioSnapshot(u.id, {
          totalValue: m.totalValue,
          invested: m.invested,
          cash: m.balance,
        });
      }
    }
  } catch (e) {
    console.error('snapshot error', e);
  }
}, 60000);

server.listen(PORT, () => {
  console.log(`CropBank API listening on ${PORT}`);
});
