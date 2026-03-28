# Ethereum Weather ⛈️

**A beautiful, meditative web experience that turns live blockchain activity into animated weather patterns.**

Instead of charts and numbers, Ethereum Weather shows you the network's pulse through an ever-changing atmospheric scene. Gas spikes become thunderstorms, quiet periods are sunny skies, and transaction bursts appear as rain and wind.

## ✨ Features

- **Real-time blockchain data** → weather metaphors
- **Smooth 60fps canvas animation** - procedural clouds, rain, lightning
- **Multi-chain support** - Ethereum, Base, Arbitrum, Optimism
- **Zero dependencies** - pure vanilla JS + Canvas
- **Lightweight** - ~15KB total
- **Client-side only** - uses free public RPC endpoints
- **Screenshot capture** - save the current weather conditions

## 🌤️ Weather Conditions

- **Clear** - Low gas, minimal activity
- **Partly Cloudy** - Moderate usage
- **Cloudy** - Rising activity
- **Rainy** - High block utilization
- **Stormy** - Gas spikes, network congestion

## 🎨 How It Works

Every 10 seconds, the app fetches live network data:
- Gas price (`eth_gasPrice`)
- Block utilization (`eth_getBlockByNumber`)
- Fee history (`eth_feeHistory`)

These metrics map to visual parameters:
- **Gas price** → storm intensity, temperature
- **Block usage** → precipitation, cloud density
- **Transaction activity** → wind speed, particle movement
- **Spikes** → lightning flashes

All animation runs at 60fps using `requestAnimationFrame` with exponential smoothing for natural transitions.

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/rickkdev/ethereum-weather.git
cd ethereum-weather

# Serve with any static server
python3 -m http.server 3000
# or
npx serve
```

Open `http://localhost:3000`

## 🌐 Deploy

### Vercel (Recommended)
```bash
vercel --prod
```

### GitHub Pages
1. Push to GitHub
2. Enable Pages in repo settings
3. Set source to root directory

## 📸 Screenshots

Leave it open as a live wallpaper, dashboard, or ambient art piece. Share screenshots of "the storm that hit during the last gas spike."

## 🔧 Customization

Edit `weather.js` to:
- Adjust particle counts (`MAX_PARTICLES`)
- Change smoothing factor (`alpha` in `updateWeatherState`)
- Modify color gradients in `drawSky()`
- Add more RPC endpoints
- Implement Web Audio ambient sounds

## 🎯 Why This Is Novel

Turns invisible on-chain dynamics into something **emotional and sensory**. Instead of staring at gas price charts, you *feel* the network's state through atmospheric conditions.

Perfect for:
- Leaving open as ambient art
- Dashboard monitoring without constant number-checking
- Social media screenshots during interesting network events
- Educational demos of blockchain activity patterns

## 📦 No Build Required

Pure HTML + vanilla JavaScript. No frameworks, no npm, no build step. Just open `index.html` in a browser.

## 🔗 Data Sources

Uses free public RPC endpoints:
- Ethereum: `https://eth.public-rpc.com`
- Base: `https://mainnet.base.org`
- Arbitrum: `https://arb1.arbitrum.io/rpc`
- Optimism: `https://mainnet.optimism.io`

No API keys, no accounts, no tracking.

## 📝 License

MIT - Build whatever you want with it.

---

Built by [Rick](https://rick.build) | [Twitter](https://twitter.com/rickdotbuild)

Leave it open during your next deployment and watch the weather change in real-time ⛈️
