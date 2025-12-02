# Amy AI - Dynamic UI Customization POC

## The Big Vision

### Amy Becomes The User Experience

Traditional UIs are static—designed once, used by everyone the same way. But no static UI is truly optimal for every user. Different traders have different needs:
- A day trader wants charts and quick order entry
- A portfolio manager wants positions and P/L summaries
- A beginner wants guidance and simpler interfaces
- A news-focused trader wants market updates prominent

**The Revolutionary Concept**: Instead of building one UI that tries to satisfy everyone, let AI **derive the UI dynamically** based on:
- User preferences expressed through conversation
- Trading style and behavior patterns
- Current context and what the user is trying to accomplish
- Real-time feedback on what's working and what isn't

### Why This Matters for Deriv

1. **Competitive Differentiator**: No competitor has AI-driven dynamic UIs
2. **Solves the "UI is not optimal" Problem**: Instead of endless redesigns, let AI optimize per-user
3. **Low-Risk Entry Point**: Start with Developers API, expand to main platform
4. **Natural Evolution of Amy**: From support chatbot → to the entire user experience

### How It Works

1. Client opens the platform and starts chatting with Amy
2. Amy understands what they're trying to do
3. Amy adjusts the interface in real-time:
   - Shows/hides relevant components
   - Resizes panels based on importance
   - Reorders layout for workflow optimization
   - Adjusts theme, colors, language
4. The UI evolves with the conversation and user needs
5. Preferences persist across sessions
6. **AI receives layout feedback**: With every message, the frontend sends the complete current layout state back to the AI—which components are visible, their sizes, positions, and any health issues (overflow, cramped content). This feedback loop ensures AI always knows exactly what the user sees and can make intelligent, context-aware decisions.

```
┌─────────────────────────────────────────────────────────────┐
│                     FEEDBACK LOOP                           │
│                                                             │
│   User Message ──────────────────────────────► Backend      │
│   + Current Layout State                        (AI)        │
│   + Layout Health Report                          │         │
│                                                   │         │
│   ◄──────────────────────────────────────────────┘         │
│   AI Response                                               │
│   + UI Change Instructions                                  │
│                                                             │
│   Frontend applies changes ──► New layout state ──► Next    │
│                                 stored for          message │
│                                 next message                │
└─────────────────────────────────────────────────────────────┘
```

---

## What We're Building (POC)

### 1. Trading Platform Demo

A functional trading platform using **real Deriv API data** with AI-controlled layout.

**Visual Reference**: See `images/shot1.png` - the Deriv Trader interface

**Components** (AI can control each):
- **Price Chart** - Real-time candlestick chart (use lightweight-charts or similar)
- **Order Panel** - Buy Rise/Fall contracts with stake input
- **Open Positions** - Live positions with P/L updates
- **Watchlist** - Favorite symbols with live prices
- **Market Overview** - Market summary and trends
- **News** - Market news and updates (can be mocked)
- **Portfolio** - Account balance and summary
- **World Clock** - Multiple timezone display
- **Calculator** - Trading calculator

**Key UI Requirements**:
- Modular component architecture
- Layout auto-adjusts when components are hidden (no empty spaces)
- Floating chat bubble (bottom-right, NOT a side panel)
- Dark/light theme support
- Multi-language support with RTL for Arabic
- Customizable accent colors
- Persist UI state in localStorage

**AI Controls**:
- Component visibility (show/hide)
- Component sizing (small/medium/large/full-width)
- Component ordering
- Theme, language, accent color

### 2. Backend Service

Python FastAPI service that processes conversations and returns UI instructions.

**Core Functionality**:
- Chat endpoint that accepts user message + current layout state
- Returns both conversational response AND UI change instructions
- Uses OpenAI (GPT-4) for intelligent responses
- Demo mode that works without API key (pattern matching fallback)

**Critical: AI Must Be Layout-Aware**

The AI must receive the complete current layout state with every message:
- Which components are visible/hidden
- Current size of each component
- Component order/positions
- Theme, language, accent color
- Layout health issues (overflow, cramped content)

This enables intelligent responses like:
- "The chart is already hidden" (instead of redundantly hiding it)
- "I notice your order panel is cramped, want me to fix it?"
- "You're already in dark mode"

**Layout Health Monitoring**:
- Frontend measures actual component dimensions
- Detects content overflow and cramped components
- Reports issues to AI so it can proactively suggest fixes

### 3. Deriv API Integration

Connect to real Deriv trading infrastructure.

**WebSocket**: `wss://ws.derivws.com/websockets/v3?app_id=1089`

**Public Features** (no token needed):
- Real-time price ticks
- Candlestick/OHLC data for charts
- Market instruments list

**Authenticated Features** (user provides their API token in UI):
- Authorization with user's personal token
- Account balance and portfolio
- Open positions with live P/L
- Buy/sell Rise/Fall contracts

**Instruments**: Volatility indices (V10, V25, V50, V75, V100, etc.)

### 4. Drop-in SDK (Optional/Stretch Goal)

A JavaScript SDK that brings Amy's UI control to any website with minimal integration:
- Floating chat widget
- Mark controllable elements with data attributes
- AI can show/hide/resize any marked element

---

## AI Behavior Guidelines

### What Amy Can Control

| Control | Options | Example Command |
|---------|---------|-----------------|
| Visibility | show/hide | "Hide the news panel" |
| Sizing | small, medium, large, full | "Make the chart bigger" |
| Ordering | move components | "Put positions at the top" |
| Theme | dark/light | "Switch to dark mode" |
| Language | en, es, fr, de, zh, ar, ja, pt, ru | "Switch to Spanish" |
| Accent Color | any hex color | "Change accent to blue" |
| Presets | trading, minimal, analysis, monitoring | "Set up for day trading" |

### Layout Presets

- **trading**: Chart + Order Panel + Positions + Clock
- **minimal**: Chart + Order Panel only
- **analysis**: Chart + Watchlist + News + Market Overview
- **monitoring**: Positions (large) + Chart + Portfolio

### Smart Behaviors

1. **Context-aware**: Knows what's already visible/hidden
2. **Proactive**: Notices cramped components and offers to fix
3. **Conversational**: Explains changes naturally
4. **Efficient**: Only changes what needs changing
5. **Helpful**: Suggests layouts based on user's stated goals

---

## Example Conversations

**Basic Control**:
> **User**: "Hide the news"  
> **Amy**: "Done! I've hidden the news panel."

**Layout Awareness**:
> **User**: "Hide the watchlist"  
> **Amy**: "The watchlist is already hidden. Would you like me to show it instead?"

**Contextual Setup**:
> **User**: "I'm day trading today"  
> **Amy**: "Perfect! I've set up a trading layout - large chart, order panel ready, and your positions visible."

**Proactive Health Fix**:
> **User**: "Hi"  
> **Amy**: "Hello! I notice your order panel is a bit cramped. Would you like me to give it more space?"

**Describe Current State**:
> **User**: "What's my current layout?"  
> **Amy**: "You have 5 components visible: large chart, medium order panel, and small positions, portfolio, and clock. News and watchlist are hidden. Dark mode, English."

---

## Technical Setup

### Running the POC

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Backend | http://localhost:8000 |
| Frontend | http://localhost:3000 |
| SDK Demo | http://localhost:4000 (if implemented) |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables GPT-4 (demo mode works without) |

### User-Provided API Token

The Deriv API token is **not** a backend environment variable—it's provided by each user through the UI:

1. User enters their personal Deriv API token in the frontend
2. Frontend sends the token to backend with requests that need authentication
3. Backend uses the token to call Deriv API on the user's behalf
4. Each user trades with their own account

This enables:
- Real portfolio/positions display for the logged-in user
- Actual trading (buy/sell) on the user's account
- Account balance display

Without a token, the app still works in "view-only" mode with public market data (prices, charts).

---

## Success Criteria

The POC is successful when:

1. ✅ User can chat with Amy and see UI change in real-time
2. ✅ No empty spaces when components are hidden
3. ✅ Real Deriv market data displays in charts
4. ✅ Can execute Rise/Fall trades (with API token)
5. ✅ AI proactively notices and offers to fix layout issues
6. ✅ AI is fully layout-aware and gives contextual responses
7. ✅ Works in dark and light themes
8. ✅ Language switching works (including RTL for Arabic)
9. ✅ Single `docker-compose up` starts everything

---

## Implementation Notes

These are lessons learned from previous iterations - guidelines, not requirements:

- **Positions display**: Deriv API returns symbol in different fields - check both `symbol` and `underlying`
- **Chart library**: `lightweight-charts` works well, use `UTCTimestamp` type casting
- **Buy flow**: Send `proposal` request first, then `buy` with the proposal ID
- **Live P/L**: Subscribe to `proposal_open_contract` for real-time position updates
- **Layout gaps**: CSS Grid with `grid-auto-flow: dense` helps fill empty spaces
- **Protected components**: Order Panel and Calculator need minimum sizes - don't make them too small

---

## Future Vision

This POC demonstrates the foundation. Future expansions:

- **Learning Preferences**: AI remembers preferred layouts per user
- **Predictive UI**: AI anticipates needs before user asks
- **Trading Suggestions**: AI suggests trades based on user's style
- **Full Platform**: Replace legacy trading platform UI
- **Mobile**: AI adapts layout for smaller screens
- **Accessibility**: AI adjusts UI for different accessibility needs

---

*"The best interface is one that adapts to you, not one you adapt to."*
