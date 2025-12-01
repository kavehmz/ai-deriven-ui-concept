# Amy AI Trading Platform POC

A proof-of-concept demonstrating how AI can dynamically control and customize a trading UI based on user interactions. Built for Deriv's trading platform.

![Amy Trading Platform](images/shot1.png)

## 🚀 Features

- **AI-Driven UI Customization**: Chat with Amy to show/hide components, change themes, switch languages
- **Real-time Deriv API Integration**: Live market data via WebSocket from api.deriv.com
- **Floating Chat Interface**: Non-intrusive AI assistant that doesn't take up dashboard space
- **Dynamic Layout**: CSS Grid that automatically adjusts when components are hidden
- **Multi-language Support**: EN, ES, FR, DE, ZH, AR, JA, PT, RU with RTL support for Arabic
- **Customizable Themes**: Dark/Light modes with customizable accent colors

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend │ ←→ │  Python Backend  │ ←→ │   OpenAI API    │
│   (Vite + TS)   │     │    (FastAPI)     │     │   (GPT-4o)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ↓
┌─────────────────┐
│   Deriv API     │
│   (WebSocket)   │
└─────────────────┘
```

## 🛠️ Quick Start

### Using Docker Compose (Recommended)

1. **Clone and setup environment:**
   ```bash
   cd amy-ui-cursor-api
   
   # Optional: Set your OpenAI API key for full AI features
   export OPENAI_API_KEY=your_api_key_here
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Manual Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Optional: Set OpenAI API key
export OPENAI_API_KEY=your_api_key_here

uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 💬 Talking to Amy

Amy understands natural language commands. Try these:

### UI Customization
- "Switch to dark theme" / "Switch to light theme"
- "Hide the news panel"
- "Show the calculator"
- "Hide the clock and market overview"
- "Show everything"

### Trading Setups
- "Set up for day trading" - Shows chart, positions, order panel, market overview
- "I'm a beginner, simplify it" - Minimal interface with just essentials
- "Show me the full workspace" - All components visible

### Language
- "Switch to Spanish" / "Cambia a español"
- "Switch to French" / "Passe au français"
- "Switch to Chinese" / "切换到中文"
- "Switch to Arabic" / "التبديل إلى العربية"

### Colors
- "Change accent color to blue"
- "Make it green"
- "Use teal color"

## 🔌 Deriv API Integration

The app connects to Deriv's WebSocket API for:
- Real-time price ticks for Volatility Indices
- Candlestick chart data
- Portfolio/positions (requires API token)
- Account balance (requires API token)

**To connect your Deriv account:**
1. Get an API token from [Deriv API settings](https://app.deriv.com/account/api-token)
2. Click "Connect API" in the header
3. Paste your token

## 📁 Project Structure

```
amy-ui-cursor-api/
├── backend/
│   ├── main.py           # FastAPI server with OpenAI integration
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Header.tsx
│   │   │   ├── PriceChart.tsx
│   │   │   ├── Positions.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   ├── Watchlist.tsx
│   │   │   ├── MarketOverview.tsx
│   │   │   ├── News.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── WorldClock.tsx
│   │   │   ├── Calculator.tsx
│   │   │   └── ChatPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useDerivAPI.ts   # Deriv WebSocket hook
│   │   │   ├── useChat.ts       # Chat API hook
│   │   │   └── useUIState.ts    # UI state management
│   │   ├── types.ts      # TypeScript types & translations
│   │   ├── App.tsx       # Main app component
│   │   └── index.css     # Tailwind + custom styles
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🎨 UI Components

| Component | Description |
|-----------|-------------|
| **Chart** | Real-time candlestick chart using lightweight-charts |
| **Positions** | Open trades with P/L tracking |
| **Watchlist** | Favorite markets with live prices |
| **Order Panel** | Trade execution with Accumulators |
| **Market Overview** | Top gainers/losers and sentiment |
| **Portfolio** | Account balance breakdown |
| **News** | Financial news feed |
| **World Clock** | Major market times |
| **Calculator** | Position size calculator |

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for Amy AI | No (demo mode works without it) |

## 🚀 Future Enhancements

- [ ] Add more Deriv API features (place trades, trading history)
- [ ] Voice commands for Amy
- [ ] Persistent user preferences in database
- [ ] More trading instrument types
- [ ] Advanced AI reasoning about trading patterns

## 📄 License

MIT License - Built as a POC for Deriv.com

---

Built with ❤️ by Amy AI for the future of adaptive trading interfaces.

