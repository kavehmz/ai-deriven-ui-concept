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
│   + User Context (account, positions)            │          │
│                                                  │          │
│   ◄──────────────────────────────────────────────┘          │
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

| Component ID | Name | Description |
|--------------|------|-------------|
| `chart` | Price Chart | Real-time candlestick chart |
| `riseFallPanel` | Rise/Fall Panel | Simple up/down trading (CALL/PUT) |
| `higherLowerPanel` | Higher/Lower Panel | Barrier-based trading |
| `positions` | Open Positions | Live positions with P/L updates |
| `watchlist` | Watchlist | Favorite symbols with live prices |
| `marketOverview` | Market Overview | Market summary and trends |
| `news` | News | Market news and updates (can be mocked) |
| `portfolio` | Portfolio | Account balance and summary |
| `clock` | World Clock | Multiple timezone display |
| `calculator` | Calculator | Trading calculator |

**Important**: Rise/Fall and Higher/Lower are **separate panels** that can be shown simultaneously. This allows users to have both trading modes visible at once.

**Contract Types**:
- **Rise/Fall** (`riseFallPanel`): Predict if price goes UP (Rise/CALL) or DOWN (Fall/PUT) from entry price
- **Higher/Lower** (`higherLowerPanel`): Predict if price ends ABOVE or BELOW a custom barrier price

**Duration Options**: Both panels support multiple duration units:
- Ticks: 5, 10, 15, 20
- Minutes: 1, 2, 5, 15, 30
- Hours: 1, 2, 4, 8, 12
- Days: 1, 2, 3, 7

**Key UI Requirements**:
- Modular component architecture
- Layout auto-adjusts when components are hidden (no empty spaces)
- Floating chat bubble (bottom-right, NOT a side panel)
- Dark/light theme support
- Multi-language support with RTL for Arabic
- Customizable accent colors
- Persist UI state in localStorage
- **Component highlighting**: Flash/pulse animation to draw user attention during guidance

**AI Controls**:
- Component visibility (show/hide)
- Component sizing (small/medium/large/full-width)
- Component ordering (reorder with numeric position: 0 = first)
- Component highlighting (flash animation for tutorials)
- Theme, language, accent color
- Navigation to external URLs

### 2. Backend Service

Python FastAPI service that processes conversations and returns UI instructions.

**Core Functionality**:
- Chat endpoint that accepts user message + current layout state + user context
- Returns both conversational response AND UI change instructions
- Uses OpenAI (GPT-4) for intelligent responses
- Demo mode that works without API key (pattern matching fallback)

**Knowledge System** (AI-Driven, Not Hardcoded):

The AI's behavior is controlled through markdown knowledge files, not Python code:

| File | Purpose | Required |
|------|---------|----------|
| `backend/knowledge.md` | Trading education, UI guidance, guided tours | Yes |
| `backend/support_faq.md` | Customer support FAQ | No (optional) |

If `support_faq.md` exists, Amy acts as both trading assistant AND customer support. If not, she's just a trading assistant.

**Important**: Tours, guidance, and support answers should be defined in these markdown files in plain English. The AI interprets and delivers them naturally. Do NOT hardcode conversation flows in Python.

**User Context**: The AI receives detailed user information with every message:
- Authentication status (logged in or not)
- Account type (demo/real)
- Account balance and currency
- **Individual position details** (contract type, symbol, P/L, winning/losing status)
- Winning/losing position counts

This enables Amy to answer questions like:
- "Do I have any winners?" → Lists specific winning contracts
- "How is my V75 trade doing?" → Finds and reports on that specific position
- "What's my balance?" → Reports current balance

**Critical: AI Must Be Layout-Aware**

The AI must receive the complete current layout state with every message:
- Which components are visible/hidden
- Current size of each component
- Component order/positions
- Theme, language, accent color
- Layout health issues (overflow, cramped content)

### 3. Guided Tours

Amy provides interactive guided tours controlled via `knowledge.md`:

**Beginner Tour**:
- Triggered by: "I'm new", "beginner", "help me get started"
- Hides all components, reveals them step-by-step
- Uses highlight action to draw attention to each component
- Guides user to place their first trade
- User says "next" to proceed through steps

**Expert Tour**:
- Triggered by: "I'm experienced", "show me all features"
- Quick overview of all platform capabilities
- Demonstrates advanced features like Higher/Lower, calculator
- Ends with pro tips

**Tour Exit**:
- User can say "stop", "enough", "I get it" anytime
- Amy acknowledges and restores the layout to trading preset

### 4. Deriv API Integration

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
- Buy/sell Rise/Fall and Higher/Lower contracts

**Instruments**: Volatility indices (R_10, R_25, R_50, R_75, R_100, etc.)

---

## AI Behavior Guidelines

### What Amy Can Control

| Control | Options | Example Command |
|---------|---------|-----------------|
| Visibility | show/hide | "Hide the news panel" |
| Sizing | small, medium, large, full | "Make the chart bigger" |
| Ordering | reorder (0=first, higher=later) | "Put positions at the top" |
| Highlight | flash/pulse animation | "Show me where to trade" |
| Theme | dark/light | "Switch to dark mode" |
| Language | en, es, fr, de, zh, ar, ja, pt, ru | "Switch to Spanish" |
| Accent Color | any hex color | "Change accent to blue" |
| Presets | trading, minimal, analysis, monitoring | "Set up for day trading" |
| Navigation | open URL in new tab | "Take me to deposit page" |

### Layout Presets

- **trading**: Chart + Rise/Fall Panel + Positions + Clock + Portfolio
- **minimal**: Chart + Rise/Fall Panel only
- **analysis**: Chart + Watchlist + News + Market Overview
- **monitoring**: Positions (large) + Chart + Portfolio

### Navigation URLs Amy Can Use

| Action | URL |
|--------|-----|
| Deposit | https://app.deriv.com/cashier/deposit |
| Withdraw | https://app.deriv.com/cashier/withdrawal |
| API Token | https://app.deriv.com/account/api-token |
| Account Settings | https://app.deriv.com/account/personal-details |
| Trading History | https://app.deriv.com/reports/statement |
| Help Center | https://deriv.com/help-centre |

### Smart Behaviors

1. **Context-aware**: Knows what's already visible/hidden
2. **Proactive**: Notices cramped components and offers to fix
3. **Conversational**: Explains changes naturally
4. **Efficient**: Only changes what needs changing
5. **Helpful**: Suggests layouts based on user's stated goals
6. **Personalized**: Uses user's account data to give specific answers
7. **Educational**: Guides beginners step-by-step with highlighting

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
> **Amy**: "Perfect! I've set up a trading layout - large chart, Rise/Fall panel ready, and your positions visible."

**Trading Guidance**:
> **User**: "I'm new here"  
> **Amy**: "Welcome! Let me give you a quick tour. I've simplified the view to just the chart. Watch the price move up and down - that's what you'll be predicting! Say 'next' when ready."

**Portfolio Questions**:
> **User**: "Do I have any winners?"  
> **Amy**: "Yes! You have 2 winning contracts: CALL on R_10 (+$1.50) and PUT on R_75 (+$0.80). You also have 3 losing positions totaling -$4.26."

**Navigation**:
> **User**: "I want to deposit money"  
> **Amy**: "I'll open the deposit page for you!" *(opens Deriv cashier in new tab)*

**Tour Exit**:
> **User**: "Ok that's enough"  
> **Amy**: "No problem! I've restored your workspace. Feel free to ask if you need help with anything specific!"

---

## Technical Setup

### Architecture

Everything runs through a **single port (3000)** for easy deployment:

```
Port 3000 (nginx)
      │
      ├── /api/* → Backend (FastAPI on port 8000 internal)
      │
      └── /* → Frontend (React static files)
```

This allows simple proxy/tunnel setup (e.g., ngrok) with just one port.

### Running the POC

```bash
docker-compose up --build
```

| Endpoint | Description |
|----------|-------------|
| http://localhost:3000 | Frontend app |
| http://localhost:3000/api | Backend API (proxied) |
| http://localhost:3000/api/health | Health check |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables GPT-4 (demo mode works without) |

### User-Provided API Token

The Deriv API token is **not** a backend environment variable—it's provided by each user through the UI:

1. User enters their personal Deriv API token in the frontend
2. Frontend connects directly to Deriv WebSocket with the token
3. Each user trades with their own account

This enables:
- Real portfolio/positions display for the logged-in user
- Actual trading (buy/sell) on the user's account
- Account balance display

Without a token, the app still works in "view-only" mode with public market data (prices, charts).

---

## File Structure

```
├── backend/
│   ├── main.py              # FastAPI service
│   ├── knowledge.md         # Trading knowledge & tour instructions
│   ├── support_faq.md       # Customer support FAQ (optional)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RiseFallPanel.tsx    # Rise/Fall trading
│   │   │   ├── HigherLowerPanel.tsx # Higher/Lower trading
│   │   │   ├── PriceChart.tsx
│   │   │   ├── Positions.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useDerivAPI.ts   # Deriv WebSocket
│   │   │   ├── useUIState.ts    # Layout state management
│   │   │   └── useChat.ts       # Chat with backend
│   │   └── i18n/                # Translations
│   ├── nginx.conf               # Proxies /api to backend
│   └── Dockerfile
└── docker-compose.yml
```

---

## Success Criteria

The POC is successful when:

1. ✅ User can chat with Amy and see UI change in real-time
2. ✅ No empty spaces when components are hidden
3. ✅ Real Deriv market data displays in charts
4. ✅ Can execute Rise/Fall AND Higher/Lower trades (with API token)
5. ✅ AI proactively notices and offers to fix layout issues
6. ✅ AI is fully layout-aware and gives contextual responses
7. ✅ Works in dark and light themes
8. ✅ Language switching works (including RTL for Arabic)
9. ✅ Single `docker-compose up` starts everything
10. ✅ Guided tours work for beginners and experts
11. ✅ Amy can answer questions about individual positions
12. ✅ Amy can redirect users to external Deriv pages

---

## Implementation Notes

These are lessons learned from previous iterations - guidelines, not requirements:

- **Positions display**: Deriv API returns symbol in different fields - check both `symbol` and `underlying`
- **Chart library**: `lightweight-charts` works well, use `UTCTimestamp` type casting
- **Buy flow**: Send `proposal` request first, then `buy` with the proposal ID
- **Live P/L**: Subscribe to `proposal_open_contract` for real-time position updates
- **Layout gaps**: CSS Grid with `grid-auto-flow: dense` helps fill empty spaces
- **Protected components**: Trading panels and Calculator need minimum sizes - don't make them too small
- **Higher/Lower contracts**: Use CALL/PUT with a barrier parameter, not separate contract types
- **Error handling**: Dispatch error events from WebSocket handler so Promises can catch API errors
- **Tour instructions**: Keep in knowledge.md, not hardcoded in Python
- **Translation keys**: Can use descriptive keys like `orderPanel.stake` even if component ID changed

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
