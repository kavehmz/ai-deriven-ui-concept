"""
Amy AI Backend Service
Handles AI-driven UI decisions and chat interactions for the Deriv trading platform POC.
"""

import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Amy AI Backend", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Available UI components that AI can control
AVAILABLE_COMPONENTS = {
    "chart": {"name": "Price Chart", "description": "Real-time price chart with trading indicators"},
    "positions": {"name": "Open Positions", "description": "Shows current open trades and P/L"},
    "watchlist": {"name": "Watchlist", "description": "User's favorite markets to track"},
    "orderPanel": {"name": "Order Panel", "description": "Trade execution panel with buy/sell options"},
    "marketOverview": {"name": "Market Overview", "description": "Summary of market conditions"},
    "news": {"name": "News Feed", "description": "Latest financial news and updates"},
    "portfolio": {"name": "Portfolio Summary", "description": "Account balance and portfolio breakdown"},
    "clock": {"name": "World Clock", "description": "Shows time in major financial centers"},
    "calculator": {"name": "Trading Calculator", "description": "Calculate position sizes and risk"},
}

# System prompt for Amy with layout awareness
SYSTEM_PROMPT = """You are Amy, an intelligent AI assistant for a trading platform. You help users navigate and customize their trading interface with full control over the layout.

## AVAILABLE COMPONENTS
Each component can be shown/hidden, resized, and reordered:
- chart: Price Chart (recommended: large or full)
- positions: Open Positions panel (shows current trades)
- watchlist: Favorite markets to track
- orderPanel: Trade execution panel (essential for placing trades)
- marketOverview: Market conditions summary
- news: Financial news feed
- portfolio: Account balance and summary
- clock: World clock showing major financial center times
- calculator: Trading calculator for position sizing

## SIZE OPTIONS
- "small": Takes 1/4 of the row (good for: clock, calculator, portfolio)
- "medium": Takes 1/2 of the row (good for: positions, watchlist, orderPanel, news)
- "large": Takes 3/4 of the row + 2 rows tall (good for: chart)
- "full": Takes full width + 2 rows tall (good for: chart when focused)

## ORDER
Components are displayed in order from 0 (first/top-left) to 8 (last/bottom-right).
Lower numbers appear first. You can reorder by changing the order numbers.

## LAYOUT PRESETS
- "default": Standard trading layout
- "trading": Focus on chart, positions, and order panel
- "minimal": Just chart and order panel
- "analysis": Focus on market data, news, and analysis tools
- "monitoring": Focus on positions and market overview

## UI CONTROLS
- theme: "dark" or "light"
- language: "en", "es", "fr", "de", "zh", "ar", "ja", "pt", "ru"
- accentColor: any hex color (e.g., "#ff444f" for Deriv red, "#00d0ff" for teal, "#00c853" for green)

## RESPONSE FORMAT
Respond in JSON format:
{
    "message": "Your helpful response explaining what you're doing",
    "uiChanges": {
        "layout": "preset_name",  // Optional: apply a preset first
        "components": {
            "componentName": {
                "visible": true/false,
                "size": "small/medium/large/full",
                "order": 0-8
            }
            // Can also use simple: "componentName": true/false for just visibility
        },
        "theme": "dark/light",
        "language": "en",
        "accentColor": "#hex"
    }
}

Only include fields you want to change. If no changes needed, set uiChanges to null.

## IMPORTANT RULES
1. The user's current layout is provided - use it to make intelligent decisions
2. When user asks to "make X bigger", increase its size (small→medium→large→full)
3. When user asks to "make X smaller", decrease its size
4. When user asks to move something "left" or "up", decrease its order number
5. When user asks to move something "right" or "down", increase its order number
6. When user asks for X to be "on its own row", set its size to "full"
7. Consider the trading context - traders need chart and order panel visible
8. Be proactive about optimizing layout based on user's stated goals

Be friendly, professional, and explain what layout changes you're making!"""


class ChatMessage(BaseModel):
    message: str
    currentUI: Optional[dict] = None
    layoutDescription: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    uiChanges: Optional[dict] = None


# Conversation history storage
conversations: dict = {}


@app.get("/")
def root():
    return {"status": "ok", "service": "Amy AI Backend", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/components")
def get_components():
    """Return list of available UI components"""
    return AVAILABLE_COMPONENTS


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage, session_id: str = "default"):
    """Process chat message and return AI response with optional UI changes"""
    
    if not os.getenv("OPENAI_API_KEY"):
        return demo_response(request.message, request.currentUI, request.layoutDescription)
    
    try:
        if session_id not in conversations:
            conversations[session_id] = []
        
        # Build context with layout description
        context = ""
        if request.layoutDescription:
            context = f"\n\n{request.layoutDescription}"
        elif request.currentUI:
            context = f"\n\nCurrent UI state: {json.dumps(request.currentUI)}"
        
        conversations[session_id].append({
            "role": "user",
            "content": request.message + context
        })
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + conversations[session_id][-10:]
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        conversations[session_id].append({
            "role": "assistant", 
            "content": result.get("message", "")
        })
        
        return ChatResponse(
            message=result.get("message", "I'm here to help!"),
            uiChanges=result.get("uiChanges")
        )
        
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def demo_response(message: str, current_ui: Optional[dict], layout_desc: Optional[str]) -> ChatResponse:
    """Demo responses with layout awareness"""
    
    msg_lower = message.lower()
    
    # Layout presets
    if "trading" in msg_lower and ("layout" in msg_lower or "setup" in msg_lower or "mode" in msg_lower):
        return ChatResponse(
            message="Switching to trading layout! I've optimized the view with a large chart, your positions, and the order panel front and center. Let's trade! 📈",
            uiChanges={"layout": "trading"}
        )
    
    if "minimal" in msg_lower or "simple" in msg_lower or "clean" in msg_lower:
        return ChatResponse(
            message="Here's a minimal, distraction-free layout with just the essentials: a full-width chart and the order panel. Perfect for focused trading! 🎯",
            uiChanges={"layout": "minimal"}
        )
    
    if "analysis" in msg_lower or "research" in msg_lower:
        return ChatResponse(
            message="Switching to analysis mode! I've arranged the layout to focus on market data, news, and analysis tools. Great for market research! 📊",
            uiChanges={"layout": "analysis"}
        )
    
    if "monitor" in msg_lower and ("layout" in msg_lower or "mode" in msg_lower):
        return ChatResponse(
            message="Monitoring layout activated! Your positions are now prominent so you can keep a close eye on your trades. 👀",
            uiChanges={"layout": "monitoring"}
        )
    
    if "default" in msg_lower and "layout" in msg_lower:
        return ChatResponse(
            message="Restored the default layout! Everything is back to the standard arrangement. 🔄",
            uiChanges={"layout": "default"}
        )
    
    # Size adjustments
    if "bigger" in msg_lower or "larger" in msg_lower or "expand" in msg_lower:
        component = None
        if "chart" in msg_lower: component = "chart"
        elif "position" in msg_lower: component = "positions"
        elif "watchlist" in msg_lower: component = "watchlist"
        elif "order" in msg_lower: component = "orderPanel"
        elif "market" in msg_lower: component = "marketOverview"
        elif "news" in msg_lower: component = "news"
        elif "portfolio" in msg_lower: component = "portfolio"
        elif "clock" in msg_lower: component = "clock"
        elif "calculator" in msg_lower: component = "calculator"
        
        if component:
            return ChatResponse(
                message=f"Made the {AVAILABLE_COMPONENTS[component]['name']} larger! It now takes up more space on your screen. 📐",
                uiChanges={"components": {component: {"size": "large" if component == "chart" else "medium"}}}
            )
    
    if "smaller" in msg_lower or "shrink" in msg_lower or "compact" in msg_lower:
        component = None
        if "chart" in msg_lower: component = "chart"
        elif "position" in msg_lower: component = "positions"
        elif "watchlist" in msg_lower: component = "watchlist"
        elif "order" in msg_lower: component = "orderPanel"
        elif "market" in msg_lower: component = "marketOverview"
        elif "news" in msg_lower: component = "news"
        elif "portfolio" in msg_lower: component = "portfolio"
        elif "clock" in msg_lower: component = "clock"
        elif "calculator" in msg_lower: component = "calculator"
        
        if component:
            return ChatResponse(
                message=f"Made the {AVAILABLE_COMPONENTS[component]['name']} smaller to save space! 📏",
                uiChanges={"components": {component: {"size": "small"}}}
            )
    
    if "full" in msg_lower and ("width" in msg_lower or "screen" in msg_lower or "row" in msg_lower):
        component = None
        if "chart" in msg_lower: component = "chart"
        elif "position" in msg_lower: component = "positions"
        elif "news" in msg_lower: component = "news"
        
        if component:
            return ChatResponse(
                message=f"The {AVAILABLE_COMPONENTS[component]['name']} now spans the full width! 📺",
                uiChanges={"components": {component: {"size": "full"}}}
            )
    
    # Movement commands
    if "move" in msg_lower and ("left" in msg_lower or "first" in msg_lower or "top" in msg_lower or "beginning" in msg_lower):
        component = None
        if "chart" in msg_lower: component = "chart"
        elif "position" in msg_lower: component = "positions"
        elif "watchlist" in msg_lower: component = "watchlist"
        elif "order" in msg_lower: component = "orderPanel"
        elif "market" in msg_lower: component = "marketOverview"
        elif "news" in msg_lower: component = "news"
        elif "portfolio" in msg_lower: component = "portfolio"
        elif "clock" in msg_lower: component = "clock"
        elif "calculator" in msg_lower: component = "calculator"
        
        if component:
            return ChatResponse(
                message=f"Moved {AVAILABLE_COMPONENTS[component]['name']} to the beginning of the layout! ⬅️",
                uiChanges={"components": {component: {"order": 0}}}
            )
    
    if "move" in msg_lower and ("right" in msg_lower or "last" in msg_lower or "end" in msg_lower or "bottom" in msg_lower):
        component = None
        if "chart" in msg_lower: component = "chart"
        elif "position" in msg_lower: component = "positions"
        elif "watchlist" in msg_lower: component = "watchlist"
        elif "order" in msg_lower: component = "orderPanel"
        elif "market" in msg_lower: component = "marketOverview"
        elif "news" in msg_lower: component = "news"
        elif "portfolio" in msg_lower: component = "portfolio"
        elif "clock" in msg_lower: component = "clock"
        elif "calculator" in msg_lower: component = "calculator"
        
        if component:
            return ChatResponse(
                message=f"Moved {AVAILABLE_COMPONENTS[component]['name']} to the end of the layout! ➡️",
                uiChanges={"components": {component: {"order": 8}}}
            )
    
    # Theme changes
    if "dark" in msg_lower and ("theme" in msg_lower or "mode" in msg_lower):
        return ChatResponse(
            message="Switching to dark theme for easier viewing during long trading sessions! 🌙",
            uiChanges={"theme": "dark"}
        )
    
    if "light" in msg_lower and ("theme" in msg_lower or "mode" in msg_lower):
        return ChatResponse(
            message="Switching to light theme! Great for well-lit environments. ☀️",
            uiChanges={"theme": "light"}
        )
    
    # Language changes
    if "spanish" in msg_lower or "español" in msg_lower:
        return ChatResponse(
            message="¡Cambiando a español! La interfaz ahora se mostrará en español.",
            uiChanges={"language": "es"}
        )
    
    if "french" in msg_lower or "français" in msg_lower:
        return ChatResponse(
            message="Passage au français ! L'interface sera maintenant en français.",
            uiChanges={"language": "fr"}
        )
    
    if "english" in msg_lower:
        return ChatResponse(
            message="Switching back to English!",
            uiChanges={"language": "en"}
        )
    
    if "chinese" in msg_lower or "中文" in msg_lower:
        return ChatResponse(
            message="切换到中文！界面现在将以中文显示。",
            uiChanges={"language": "zh"}
        )
    
    if "arabic" in msg_lower or "العربية" in msg_lower:
        return ChatResponse(
            message="تم التبديل إلى العربية! ستظهر الواجهة الآن باللغة العربية.",
            uiChanges={"language": "ar"}
        )
    
    # Visibility toggles
    if "hide" in msg_lower or "close" in msg_lower or "remove" in msg_lower:
        components = {}
        if "chart" in msg_lower:
            components["chart"] = {"visible": False}
        if "position" in msg_lower:
            components["positions"] = {"visible": False}
        if "watchlist" in msg_lower or "watch list" in msg_lower:
            components["watchlist"] = {"visible": False}
        if "order" in msg_lower:
            components["orderPanel"] = {"visible": False}
        if "market" in msg_lower and "overview" in msg_lower:
            components["marketOverview"] = {"visible": False}
        if "news" in msg_lower:
            components["news"] = {"visible": False}
        if "portfolio" in msg_lower:
            components["portfolio"] = {"visible": False}
        if "clock" in msg_lower:
            components["clock"] = {"visible": False}
        if "calculator" in msg_lower:
            components["calculator"] = {"visible": False}
        
        if components:
            names = [AVAILABLE_COMPONENTS.get(k.replace('"visible": False', ''), {}).get("name", k) for k in components.keys()]
            return ChatResponse(
                message=f"Hidden {', '.join([AVAILABLE_COMPONENTS[k]['name'] for k in components.keys()])}. The layout automatically adjusts to fill the space! 👋",
                uiChanges={"components": components}
            )
    
    if "show" in msg_lower or "open" in msg_lower or "add" in msg_lower or "display" in msg_lower:
        components = {}
        if "chart" in msg_lower:
            components["chart"] = {"visible": True, "size": "large"}
        if "position" in msg_lower:
            components["positions"] = {"visible": True, "size": "medium"}
        if "watchlist" in msg_lower or "watch list" in msg_lower:
            components["watchlist"] = {"visible": True, "size": "medium"}
        if "order" in msg_lower:
            components["orderPanel"] = {"visible": True, "size": "medium"}
        if "market" in msg_lower and "overview" in msg_lower:
            components["marketOverview"] = {"visible": True, "size": "small"}
        if "news" in msg_lower:
            components["news"] = {"visible": True, "size": "small"}
        if "portfolio" in msg_lower:
            components["portfolio"] = {"visible": True, "size": "small"}
        if "clock" in msg_lower:
            components["clock"] = {"visible": True, "size": "small"}
        if "calculator" in msg_lower:
            components["calculator"] = {"visible": True, "size": "small"}
        if "everything" in msg_lower or "all" in msg_lower:
            components = {k: {"visible": True} for k in AVAILABLE_COMPONENTS.keys()}
        
        if components:
            return ChatResponse(
                message=f"Added {', '.join([AVAILABLE_COMPONENTS[k]['name'] for k in components.keys()])} to your workspace! 📊",
                uiChanges={"components": components}
            )
    
    # Color changes
    if "red" in msg_lower and "color" in msg_lower:
        return ChatResponse(
            message="Changed the accent color to Deriv red! 🔴",
            uiChanges={"accentColor": "#ff444f"}
        )
    
    if "blue" in msg_lower and "color" in msg_lower:
        return ChatResponse(
            message="Changed the accent color to blue! 🔵",
            uiChanges={"accentColor": "#0066ff"}
        )
    
    if "green" in msg_lower and "color" in msg_lower:
        return ChatResponse(
            message="Changed the accent color to green! 🟢",
            uiChanges={"accentColor": "#00c853"}
        )
    
    if ("teal" in msg_lower or "cyan" in msg_lower) and "color" in msg_lower:
        return ChatResponse(
            message="Changed the accent color to teal! Perfect for that modern look! 💎",
            uiChanges={"accentColor": "#00d0ff"}
        )
    
    if "purple" in msg_lower and "color" in msg_lower:
        return ChatResponse(
            message="Changed the accent color to purple! 💜",
            uiChanges={"accentColor": "#9c27b0"}
        )
    
    if "orange" in msg_lower and "color" in msg_lower:
        return ChatResponse(
            message="Changed the accent color to orange! 🟠",
            uiChanges={"accentColor": "#ff9800"}
        )
    
    # Help
    if "help" in msg_lower or "what can you do" in msg_lower:
        return ChatResponse(
            message="""Hi! I'm Amy, your AI trading assistant. Here's what I can do:

🎨 **UI Customization:**
- "Switch to dark/light theme"
- "Hide the news panel" / "Show the calculator"
- "Change color to blue/red/green/purple"

📐 **Layout Control:**
- "Make the chart bigger" / "Make positions smaller"
- "Move the chart to the top"
- "Put the positions on its own row" (full width)
- "Switch to trading/minimal/analysis layout"

🌍 **Language:**
- "Switch to Spanish/French/Chinese/Arabic"

📊 **Layout Presets:**
- "Trading layout" - Focus on chart & order panel
- "Minimal layout" - Just the essentials
- "Analysis layout" - Market data & news focus
- "Monitoring layout" - Watch your positions

Just tell me what you need! 🚀""",
            uiChanges=None
        )
    
    # Default response
    return ChatResponse(
        message=f"I can help you customize your trading interface! Try:\n\n• \"Make the chart bigger\"\n• \"Switch to trading layout\"\n• \"Move positions to the top\"\n• \"Hide the news\"\n• \"Show everything\"\n\nWhat would you like to adjust?",
        uiChanges=None
    )


@app.post("/reset")
async def reset_session(session_id: str = "default"):
    """Reset conversation history for a session"""
    if session_id in conversations:
        del conversations[session_id]
    return {"status": "ok", "message": "Session reset"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
