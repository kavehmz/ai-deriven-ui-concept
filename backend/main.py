import os
import json
import re
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI(title="Amy AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client (optional - demo mode works without)
openai_client = None
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Load knowledge base
KNOWLEDGE_BASE = ""
knowledge_path = Path(__file__).parent / "knowledge.md"
if knowledge_path.exists():
    KNOWLEDGE_BASE = knowledge_path.read_text()


class ComponentState(BaseModel):
    visible: bool
    size: str  # small, medium, large, full
    order: int


class LayoutState(BaseModel):
    components: dict[str, ComponentState]
    theme: str  # dark, light
    language: str  # en, es, fr, de, zh, ar, ja, pt, ru
    accentColor: str  # hex color
    healthIssues: Optional[list[str]] = []


class ChatRequest(BaseModel):
    message: str
    layoutState: LayoutState
    conversationHistory: Optional[list[dict]] = []


class UIChange(BaseModel):
    component: Optional[str] = None
    action: Optional[str] = None  # show, hide, resize, reorder, highlight
    value: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    accentColor: Optional[str] = None
    preset: Optional[str] = None  # trading, minimal, analysis, monitoring


class ChatResponse(BaseModel):
    message: str
    uiChanges: list[UIChange]


SYSTEM_PROMPT = """You are Amy, a friendly and knowledgeable AI trading assistant for the Deriv trading platform. You have two main capabilities:

## 1. UI CONTROL
You can control the trading interface layout:

**Components you can control:**
- chart: Price chart with candlesticks (shows real-time price movements)
- orderPanel: Buy Rise/Fall trading panel (where users place trades)
- positions: Open positions with P/L (shows active trades)
- watchlist: Favorite symbols with prices (quick symbol access)
- marketOverview: Market summary and trends
- news: Market news and updates
- portfolio: Account balance and summary
- clock: World clock with multiple timezones
- calculator: Trading calculator

**Actions:**
- show: Make a component visible
- hide: Hide a component
- resize: Change size (small, medium, large, full)
- highlight: Flash/pulse a component to draw user's attention (use this when guiding users!)

**Other controls:**
- theme: "dark" or "light"
- language: en, es, fr, de, zh, ar, ja, pt, ru
- accentColor: Any hex color
- preset: trading, minimal, analysis, monitoring

## 2. TRADING GUIDANCE
You can guide users step-by-step through trading operations. When helping users:
1. Break down tasks into clear steps
2. Use the "highlight" action to draw attention to relevant components
3. Wait for confirmation before moving to the next step
4. Be encouraging and patient with beginners

**Important guidance patterns:**
- When explaining a component, FIRST show it (if hidden), THEN highlight it
- When guiding through a trade, highlight components in sequence: chart → orderPanel → positions
- Always ensure components are visible before highlighting them

## RESPONSE FORMAT
Always respond with a JSON object:
{
  "message": "Your conversational response with clear instructions",
  "uiChanges": [
    {"component": "orderPanel", "action": "highlight"},
    {"component": "chart", "action": "show"}
  ]
}

## CURRENT STATE
You'll receive the current layout state with each message. Use it to:
1. Know what's visible/hidden
2. Avoid redundant actions
3. Give context-aware guidance

## PERSONALITY
- Friendly and encouraging
- Patient with beginners
- Clear and concise
- Proactive in offering help
- Use emojis sparingly for warmth
"""

KNOWLEDGE_PROMPT = f"""## TRADING KNOWLEDGE BASE
Use this knowledge to answer questions and guide users:

{KNOWLEDGE_BASE}
"""


def get_layout_description(layout: LayoutState) -> str:
    """Generate a human-readable description of the current layout."""
    visible = []
    hidden = []
    
    for name, state in layout.components.items():
        if state.visible:
            visible.append(f"{name} ({state.size})")
        else:
            hidden.append(name)
    
    desc = f"Currently visible: {', '.join(visible) if visible else 'none'}.\n"
    desc += f"Hidden: {', '.join(hidden) if hidden else 'none'}.\n"
    desc += f"Theme: {layout.theme}, Language: {layout.language}, Accent: {layout.accentColor}\n"
    
    if layout.healthIssues:
        desc += f"Layout issues detected: {', '.join(layout.healthIssues)}"
    
    return desc


# Component name mappings for natural language
COMPONENT_ALIASES = {
    "chart": ["chart", "price chart", "candlestick", "graph"],
    "orderPanel": ["order panel", "order", "trading panel", "buy panel", "trade panel", "buy/sell"],
    "positions": ["positions", "open positions", "trades", "my trades", "active trades"],
    "watchlist": ["watchlist", "watch list", "favorites", "symbols"],
    "marketOverview": ["market overview", "market", "overview", "market summary"],
    "news": ["news", "market news", "updates"],
    "portfolio": ["portfolio", "balance", "account", "wallet"],
    "clock": ["clock", "world clock", "time", "timezone"],
    "calculator": ["calculator", "calc", "calculate"],
}

def find_component(text: str) -> Optional[str]:
    """Find component ID from natural language text."""
    text_lower = text.lower()
    for comp_id, aliases in COMPONENT_ALIASES.items():
        if any(alias in text_lower for alias in aliases):
            return comp_id
    return None


def demo_mode_response(message: str, layout: LayoutState) -> ChatResponse:
    """Pattern-matching fallback when no OpenAI key is available."""
    msg_lower = message.lower()
    ui_changes = []
    response_text = ""
    
    # ===== TUTORIAL/GUIDE REQUESTS =====
    
    # How to place a trade
    if any(phrase in msg_lower for phrase in ["how to trade", "how do i trade", "place a trade", "make a trade", "buy a contract", "how to buy", "first trade", "start trading"]):
        # Ensure necessary components are visible and highlight them
        if not layout.components.get("chart", ComponentState(visible=False, size="medium", order=0)).visible:
            ui_changes.append(UIChange(component="chart", action="show"))
        if not layout.components.get("orderPanel", ComponentState(visible=False, size="medium", order=0)).visible:
            ui_changes.append(UIChange(component="orderPanel", action="show"))
        
        ui_changes.append(UIChange(component="chart", action="highlight"))
        
        response_text = """Great question! Let me guide you through placing your first trade. 📈

**Step 1: Watch the Chart** (I've highlighted it for you)
First, look at the Price Chart to see how the price is moving. Green candles mean the price went up, red means it went down.

When you're ready, say "next" and I'll show you the next step!"""
    
    # Continue tutorial
    elif msg_lower in ["next", "continue", "ok", "done", "got it", "ready"]:
        # This is a simplified continuation - in real AI mode, context would be tracked
        if not layout.components.get("orderPanel", ComponentState(visible=False, size="medium", order=0)).visible:
            ui_changes.append(UIChange(component="orderPanel", action="show"))
        ui_changes.append(UIChange(component="orderPanel", action="highlight"))
        
        response_text = """**Step 2: Set Up Your Trade** (highlighted the Order Panel)

In the Order Panel:
1. Enter your stake amount (how much you want to risk)
2. Choose the duration (5-20 ticks)
3. Decide: Will the price go UP (Rise) or DOWN (Fall)?

Click **Rise** if you think price will go up, or **Fall** if you think it will go down.

Say "next" when you've placed a trade!"""
    
    # What is Rise/Fall
    elif any(phrase in msg_lower for phrase in ["what is rise", "what is fall", "rise fall", "rise/fall", "explain rise", "explain fall"]):
        ui_changes.append(UIChange(component="orderPanel", action="highlight"))
        response_text = """**Rise/Fall Explained** 📊

Rise/Fall is the simplest way to trade:

• **Rise (Green button)**: You predict the price will go UP
• **Fall (Red button)**: You predict the price will go DOWN

**How it works:**
1. You choose a stake (e.g., $10)
2. You pick a duration (e.g., 5 ticks)
3. If your prediction is correct → You win ~$19.50 (95% profit)
4. If wrong → You lose your $10 stake

It's like a coin flip, but with real market prices! Want me to walk you through placing a trade?"""
    
    # How to connect account
    elif any(phrase in msg_lower for phrase in ["connect account", "login", "log in", "how to connect", "add account", "api token"]):
        response_text = """**How to Connect Your Deriv Account** 🔐

1. Click the **"Connect"** button in the top-right corner of the header
2. You'll need a Deriv API token - click the link to get one from Deriv
3. On Deriv's site, create a new token with "Trade" permissions
4. Copy the token and paste it in our platform
5. Click Connect!

Once connected, you'll see your balance and can place real trades.

⚠️ **Note**: Without connecting, you can still view live prices and charts, just can't trade."""
    
    # What are synthetic indices
    elif any(phrase in msg_lower for phrase in ["synthetic", "volatility index", "what is v100", "what is v10", "what are these markets"]):
        ui_changes.append(UIChange(component="watchlist", action="show"))
        ui_changes.append(UIChange(component="watchlist", action="highlight"))
        response_text = """**Synthetic Indices Explained** 🎲

Synthetic indices (also called Volatility Indices) are unique to Deriv:

• **V10** (Volatility 10): Low volatility, smaller movements
• **V25**: Low-medium volatility
• **V50**: Medium volatility
• **V75**: Medium-high volatility  
• **V100**: High volatility, bigger movements

**Why they're special:**
✓ Available 24/7 (no market hours)
✓ Not affected by real-world news
✓ Pure price action simulation
✓ Great for practice

Higher number = more volatility = bigger potential wins AND losses!"""
    
    # Where is / show me
    elif "where is" in msg_lower or "show me" in msg_lower or "find the" in msg_lower:
        comp = find_component(msg_lower)
        if comp:
            comp_name = COMPONENT_ALIASES[comp][0]
            if layout.components.get(comp) and layout.components[comp].visible:
                ui_changes.append(UIChange(component=comp, action="highlight"))
                response_text = f"Here's the **{comp_name}**! I've highlighted it for you. 👆"
            else:
                ui_changes.append(UIChange(component=comp, action="show"))
                ui_changes.append(UIChange(component=comp, action="highlight"))
                response_text = f"I've made the **{comp_name}** visible and highlighted it for you! 👆"
        else:
            response_text = "Which component are you looking for? I can show you the chart, order panel, positions, watchlist, portfolio, clock, news, market overview, or calculator."
    
    # Explain a component
    elif "what is the" in msg_lower or "what does the" in msg_lower or "explain the" in msg_lower:
        comp = find_component(msg_lower)
        if comp:
            if not layout.components.get(comp, ComponentState(visible=False, size="medium", order=0)).visible:
                ui_changes.append(UIChange(component=comp, action="show"))
            ui_changes.append(UIChange(component=comp, action="highlight"))
            
            explanations = {
                "chart": "The **Price Chart** shows real-time price movements as candlesticks. Green = price went up, Red = price went down. Use it to analyze market direction before trading!",
                "orderPanel": "The **Order Panel** is where you place trades. Enter your stake, choose duration, then click Rise (price goes up) or Fall (price goes down).",
                "positions": "**Open Positions** shows all your active trades with live profit/loss updates. Green means you're winning, red means you're losing. Click X to close early.",
                "watchlist": "The **Watchlist** shows different trading instruments with live prices. Click any symbol to switch to it on the chart.",
                "marketOverview": "**Market Overview** shows a summary of market conditions - which instruments are up/down and overall trading volume.",
                "news": "**News** shows market updates and trading insights. Good for staying informed about market conditions.",
                "portfolio": "**Portfolio** shows your account balance, total invested, and overall profit/loss across all positions.",
                "clock": "**World Clock** shows times in major financial centers. Green dot = market typically open. (Synthetic indices are 24/7!)",
                "calculator": "The **Calculator** helps you plan trades - calculate potential profits, losses, and expected outcomes based on win rate.",
            }
            response_text = explanations.get(comp, f"The {comp} component helps with your trading workflow.")
        else:
            response_text = "Which component would you like me to explain? I can tell you about the chart, order panel, positions, watchlist, or any other panel."
    
    # Help / what can you do
    elif any(phrase in msg_lower for phrase in ["help", "what can you do", "how do you work", "guide me", "tutorial", "get started"]):
        response_text = """Hi! I'm Amy, your trading assistant! 👋 Here's what I can help with:

**🎯 Trading Guidance:**
• "How do I place a trade?" - Step-by-step walkthrough
• "What is Rise/Fall?" - Explain trading concepts
• "Show me the chart" - I'll highlight any component

**🎨 Customize Your Workspace:**
• "Hide the news" / "Show the positions"
• "Make the chart bigger"
• "Switch to dark mode"
• "Set up for day trading" (layout presets)

**📚 Learn Trading:**
• "What are synthetic indices?"
• "How to connect my account?"
• "Explain the order panel"

What would you like help with?"""
    
    # ===== LAYOUT COMMANDS (existing) =====
    
    # Check for greetings
    elif any(word in msg_lower for word in ["hi", "hello", "hey"]):
        response_text = "Hello! I'm Amy, your trading assistant! 👋 I can help you:\n\n• **Learn to trade** - Just ask \"How do I place a trade?\"\n• **Customize your workspace** - \"Hide the news\" or \"Make the chart bigger\"\n• **Explain features** - \"What is Rise/Fall?\"\n\nWhat would you like help with?"
        if layout.healthIssues:
            response_text += f"\n\n⚠️ I noticed some layout issues: {', '.join(layout.healthIssues)}. Want me to fix them?"
    
    # Check for layout description request
    elif any(phrase in msg_lower for phrase in ["what's my layout", "current layout", "what do i have", "what's visible"]):
        visible = [f"{k} ({v.size})" for k, v in layout.components.items() if v.visible]
        hidden = [k for k, v in layout.components.items() if not v.visible]
        response_text = f"Your current layout has {len(visible)} visible components: {', '.join(visible)}. "
        if hidden:
            response_text += f"Hidden: {', '.join(hidden)}. "
        response_text += f"You're using {layout.theme} theme with {layout.language} language."
    
    # Check for presets
    elif "trading" in msg_lower and any(word in msg_lower for word in ["setup", "layout", "mode", "day trading"]):
        response_text = "Perfect! I've set up a trading layout with a large chart, order panel, positions, and clock. 📈"
        ui_changes.append(UIChange(preset="trading"))
    
    elif "minimal" in msg_lower:
        response_text = "Done! Minimal layout active - just the chart and order panel. Clean and focused! ✨"
        ui_changes.append(UIChange(preset="minimal"))
    
    elif "analysis" in msg_lower or "research" in msg_lower:
        response_text = "Analysis mode activated! You now have the chart, watchlist, news, and market overview. 🔍"
        ui_changes.append(UIChange(preset="analysis"))
    
    elif "monitoring" in msg_lower or ("watch" in msg_lower and "position" in msg_lower):
        response_text = "Monitoring layout ready - positions are front and center with your chart and portfolio. 👀"
        ui_changes.append(UIChange(preset="monitoring"))
    
    # Check for show/hide commands
    elif "hide" in msg_lower or "remove" in msg_lower:
        comp = find_component(msg_lower)
        if comp:
            if layout.components.get(comp) and not layout.components[comp].visible:
                response_text = f"The {COMPONENT_ALIASES[comp][0]} is already hidden. Would you like me to show it instead?"
            else:
                response_text = f"Done! I've hidden the {COMPONENT_ALIASES[comp][0]}."
                ui_changes.append(UIChange(component=comp, action="hide"))
        else:
            response_text = "Which component would you like to hide? (chart, order panel, positions, watchlist, news, etc.)"
    
    elif "show" in msg_lower or "add" in msg_lower or "display" in msg_lower:
        comp = find_component(msg_lower)
        if comp:
            if layout.components.get(comp) and layout.components[comp].visible:
                ui_changes.append(UIChange(component=comp, action="highlight"))
                response_text = f"The {COMPONENT_ALIASES[comp][0]} is already visible - I've highlighted it for you! 👆"
            else:
                ui_changes.append(UIChange(component=comp, action="show"))
                ui_changes.append(UIChange(component=comp, action="highlight"))
                response_text = f"Done! I've shown the {COMPONENT_ALIASES[comp][0]} and highlighted it."
    
    # Check for resize commands
    elif any(word in msg_lower for word in ["bigger", "larger", "expand", "full"]):
        comp = find_component(msg_lower)
        if comp:
            new_size = "full" if "full" in msg_lower else "large"
            response_text = f"Done! I've made the {COMPONENT_ALIASES[comp][0]} {new_size}."
            ui_changes.append(UIChange(component=comp, action="resize", value=new_size))
    
    elif any(word in msg_lower for word in ["smaller", "shrink", "compact"]):
        comp = find_component(msg_lower)
        if comp:
            response_text = f"Done! I've made the {COMPONENT_ALIASES[comp][0]} smaller."
            ui_changes.append(UIChange(comp, action="resize", value="small"))
    
    # Check for theme changes
    elif "dark" in msg_lower and ("mode" in msg_lower or "theme" in msg_lower):
        if layout.theme == "dark":
            response_text = "You're already in dark mode! 🌙"
        else:
            response_text = "Switched to dark mode. Easy on the eyes! 🌙"
            ui_changes.append(UIChange(theme="dark"))
    
    elif "light" in msg_lower and ("mode" in msg_lower or "theme" in msg_lower):
        if layout.theme == "light":
            response_text = "You're already in light mode! ☀️"
        else:
            response_text = "Switched to light mode. Bright and clear! ☀️"
            ui_changes.append(UIChange(theme="light"))
    
    # Check for language changes
    elif "spanish" in msg_lower or "español" in msg_lower:
        response_text = "¡Cambiado a español!"
        ui_changes.append(UIChange(language="es"))
    elif "french" in msg_lower or "français" in msg_lower:
        response_text = "Changé en français!"
        ui_changes.append(UIChange(language="fr"))
    elif "german" in msg_lower or "deutsch" in msg_lower:
        response_text = "Auf Deutsch umgestellt!"
        ui_changes.append(UIChange(language="de"))
    elif "chinese" in msg_lower or "中文" in msg_lower:
        response_text = "已切换到中文！"
        ui_changes.append(UIChange(language="zh"))
    elif "arabic" in msg_lower or "عربي" in msg_lower:
        response_text = "تم التغيير إلى العربية!"
        ui_changes.append(UIChange(language="ar"))
    elif "japanese" in msg_lower or "日本語" in msg_lower:
        response_text = "日本語に切り替えました！"
        ui_changes.append(UIChange(language="ja"))
    elif "english" in msg_lower:
        response_text = "Switched to English!"
        ui_changes.append(UIChange(language="en"))
    
    # Check for accent color changes
    elif "accent" in msg_lower or "color" in msg_lower:
        if "blue" in msg_lower:
            response_text = "Accent color changed to blue! 💙"
            ui_changes.append(UIChange(accentColor="#2196F3"))
        elif "red" in msg_lower:
            response_text = "Accent color changed to red! ❤️"
            ui_changes.append(UIChange(accentColor="#FF444F"))
        elif "green" in msg_lower:
            response_text = "Accent color changed to green! 💚"
            ui_changes.append(UIChange(accentColor="#00D4AA"))
        elif "purple" in msg_lower:
            response_text = "Accent color changed to purple! 💜"
            ui_changes.append(UIChange(accentColor="#9C27B0"))
        elif "orange" in msg_lower:
            response_text = "Accent color changed to orange! 🧡"
            ui_changes.append(UIChange(accentColor="#FF9800"))
        else:
            hex_match = re.search(r'#[0-9A-Fa-f]{6}', message)
            if hex_match:
                response_text = f"Accent color changed to {hex_match.group()}!"
                ui_changes.append(UIChange(accentColor=hex_match.group()))
            else:
                response_text = "What color would you like? I support blue, red, green, purple, orange, or any hex color like #FF5733."
    
    # Default response
    if not response_text:
        response_text = """I'm here to help! Here are some things you can ask me:

**🎓 Learn Trading:**
• "How do I place a trade?"
• "What is Rise/Fall?"
• "Explain the chart"

**🎨 Customize Layout:**
• "Show/hide the positions"
• "Make the chart bigger"
• "Set up for trading"

**❓ Get Info:**
• "What are synthetic indices?"
• "How do I connect my account?"

What would you like to know?"""
    
    return ChatResponse(message=response_text, uiChanges=ui_changes)


async def ai_mode_response(message: str, layout: LayoutState, history: list[dict]) -> ChatResponse:
    """Use OpenAI GPT-4 for intelligent responses."""
    layout_desc = get_layout_description(layout)
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": KNOWLEDGE_PROMPT},
        {"role": "system", "content": f"CURRENT LAYOUT STATE:\n{layout_desc}"},
    ]
    
    # Add conversation history
    for msg in history[-10:]:  # Last 10 messages for context
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    
    messages.append({"role": "user", "content": message})
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=800,
        )
        
        result = json.loads(response.choices[0].message.content)
        
        ui_changes = []
        for change in result.get("uiChanges", []):
            ui_changes.append(UIChange(**change))
        
        return ChatResponse(
            message=result.get("message", "I'm not sure how to help with that."),
            uiChanges=ui_changes
        )
    except Exception as e:
        print(f"OpenAI error: {e}")
        # Fall back to demo mode
        return demo_mode_response(message, layout)


@app.get("/")
async def root():
    return {
        "name": "Amy AI Backend",
        "version": "1.0.0",
        "mode": "ai" if openai_client else "demo",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "mode": "ai" if openai_client else "demo"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if openai_client:
        return await ai_mode_response(
            request.message,
            request.layoutState,
            request.conversationHistory or []
        )
    else:
        return demo_mode_response(request.message, request.layoutState)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
