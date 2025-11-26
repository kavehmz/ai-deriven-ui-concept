# Amy - AI-Driven Dynamic UI

> **The Future of User Experience**: An AI that knows your system is in the best position to design the interface for you.

This is a Proof of Concept demonstrating how AI can dynamically control and customize the user interface based on natural language conversations. Instead of static UIs, Amy creates **Dynamic AI Designs** that adapt to user preferences, needs, and context.

![Concept](https://via.placeholder.com/800x400/1e1b4b/ffffff?text=Amy+Dynamic+UI+POC)

## 🌟 Key Features

### AI-Controlled UI Elements
- **Theme**: Dark/Light mode switching
- **Language**: Multi-language support (English, Spanish, French, German, Chinese, Arabic)
- **Components**: Show/hide dashboard modules dynamically
- **Layout**: Standard, Compact, or Expanded views
- **Colors**: Dynamic accent color changes
- **Font Size**: Accessibility adjustments

### Modular Dashboard Components
- 📊 **Watchlist** - Track assets with real-time price updates
- 💼 **Portfolio** - View holdings and P&L
- 📈 **Price Chart** - Interactive charts with multiple timeframes
- 🔄 **Order Panel** - Quick trade execution
- 📰 **News Feed** - Market news with sentiment indicators
- 🌍 **Market Overview** - Global indices at a glance
- 🕐 **World Clock** - Time in major financial centers
- 🧮 **Position Calculator** - Risk management tool

### AI Conversation Examples

| You Say | Amy Does |
|---------|----------|
| "It's too bright" | Switches to dark mode |
| "Hablo español" | Changes interface to Spanish |
| "I can't see well" | Increases font size |
| "Show me the news" | Adds news component |
| "I'm new to trading" | Simplifies to beginner layout |
| "Show me everything" | Enables all components |
| "Change color to green" | Updates accent color |

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd amy-ui-cursor
   ```

2. **Start everything with one command:**
   ```bash
   docker-compose up --build
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### With OpenAI Integration (Optional)

To enable full AI responses (instead of demo mode):

1. **Create a `.env` file in the root:**
   ```bash
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

2. **Update the frontend to use the `/chat` endpoint:**
   Edit `frontend/src/hooks/useChat.ts` and change `demo-chat` to `chat`

3. **Rebuild and run:**
   ```bash
   docker-compose up --build
   ```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    UI State Manager                  │    │
│  │  • Theme, Language, Components, Layout, Colors       │    │
│  │  • Persisted in localStorage                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │              Modular Component System                  │  │
│  │  Watchlist │ Portfolio │ Chart │ News │ Clock │ etc.  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │                    Chat Interface                      │  │
│  │        User conversations with Amy                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                     HTTP/JSON API
                             │
┌─────────────────────────────▼───────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Chat Endpoint                      │    │
│  │  • Receives message + current UI state               │    │
│  │  • Returns response + UI update instructions         │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │                  OpenAI Integration                    │  │
│  │  • GPT-4 with structured JSON output                   │  │
│  │  • System prompt with UI control capabilities          │  │
│  │  • Context-aware UI recommendations                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
amy-ui-cursor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main application
│   │   ├── components/      # UI components
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Watchlist.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── PriceChart.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   ├── News.tsx
│   │   │   ├── MarketOverview.tsx
│   │   │   ├── WorldClock.tsx
│   │   │   └── Calculator.tsx
│   │   ├── hooks/
│   │   │   ├── useUIState.ts  # UI state management
│   │   │   └── useChat.ts     # Chat API integration
│   │   └── types.ts         # TypeScript interfaces
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🔌 API Reference

### POST `/chat` or `/demo-chat`

Chat with Amy and receive UI update instructions.

**Request:**
```json
{
  "message": "Switch to dark mode",
  "currentUIState": {
    "theme": "light",
    "language": "en",
    "visibleComponents": ["watchlist", "portfolio", "chart"],
    "layout": "standard",
    "primaryColor": "#3b82f6",
    "fontSize": "medium"
  },
  "conversationHistory": []
}
```

**Response:**
```json
{
  "reply": "I've switched to dark mode for you. It's easier on the eyes!",
  "shouldUpdateUI": true,
  "uiUpdate": {
    "theme": "dark",
    "reasoning": "User requested dark mode"
  }
}
```

## 🎯 Use Cases

1. **Accessibility**: Users with visual impairments can ask for larger text
2. **Localization**: Automatically switch language based on conversation
3. **Personalization**: Beginners get simplified views, pros get full dashboards
4. **Context-Aware**: Asking about time shows the world clock
5. **Preference Learning**: AI remembers and applies user preferences

## 🔮 Future Possibilities

- **Learning from behavior**: Track which components users interact with most
- **Predictive UI**: Show relevant components before users ask
- **Voice control**: Hands-free UI manipulation
- **Cross-session memory**: Remember preferences across visits
- **A/B testing**: AI experiments with layouts to optimize engagement
- **Collaborative UI**: Share UI configurations between users

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Python, FastAPI, OpenAI API
- **Deployment**: Docker, Docker Compose, Nginx

## 📝 License

MIT License - Feel free to use this POC as a starting point for your own AI-driven UI experiments!

---

**Remember**: The best UI is one that adapts to you, not one you adapt to. Let Amy show you the future of user experience.

