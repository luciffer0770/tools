import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import router from './routes/index.js';
import { initSchema } from './db/database.js';
import { seedCropsIfEmpty } from './db/seed.js';
import { tickPrices, appendInitialHistory } from './services/priceEngine.js';
import { spawnNewsEvent, pruneExpiredNews } from './services/newsEngine.js';
import { listCrops } from './models/cropModel.js';
import { listNews } from './services/newsEngine.js';

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
seedCropsIfEmpty();
appendInitialHistory();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', router);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOptions.origin, methods: ['GET', 'POST'] },
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

server.listen(PORT, () => {
  console.log(`CropBank API listening on ${PORT}`);
});
