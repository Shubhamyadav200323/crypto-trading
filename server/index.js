require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
app.use(cors({ origin: [
  'http://localhost:5173',
  process.env.FRONTEND_URL
]}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/keys',   require('./routes/keys'));
app.use('/api/market', require('./routes/market'));
app.use('/api/orders', require('./routes/orders'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3001, () => {
  console.log(`✅ REST API running → http://localhost:${process.env.PORT || 3001}`);
});

// WebSocket proxy
const wss = new WebSocket.Server({ port: 3002 });
const streams = ['btcusdt','ethusdt','solusdt','xrpusdt','bnbusdt'].map(s => `${s}@ticker`).join('/');

let binanceWS;
function connectBinanceWS() {
  binanceWS = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
  binanceWS.on('open',    () => console.log('✅ Connected to Binance WebSocket stream'));
  binanceWS.on('message', msg => wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(msg.toString())));
  binanceWS.on('close',   () => { console.log('⚠️  Reconnecting...'); setTimeout(connectBinanceWS, 5000); });
  binanceWS.on('error',   err => console.error('❌ WS error:', err.message));
}
connectBinanceWS();

wss.on('connection', () => console.log(`🌐 Browser connected (total: ${wss.clients.size})`));
// ML Service proxy
app.get('/api/ml/predict', async (req, res) => {
  try {
    const symbol = req.query.symbol || 'BTC-USD';
    const { data } = await axios.get(
      `https://fearless-forgiveness-production-56cf.up.railway.app/predict?symbol=${symbol}`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'ML service unavailable' });
  }
});