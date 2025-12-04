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

# Load FAQ for customer support (optional - skip if file doesn't exist)
FAQ_BASE = ""
faq_path = Path(__file__).parent / "support_faq.md"
if faq_path.exists():
    FAQ_BASE = faq_path.read_text()
    print(f"[Amy] Loaded support FAQ ({len(FAQ_BASE)} chars)")
else:
    print("[Amy] No support_faq.md found - customer support FAQ disabled")


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


class PositionSummary(BaseModel):
    contractId: int
    contractType: str
    symbol: str
    buyPrice: float
    currentProfit: float
    isWinning: bool
    entrySpot: Optional[float] = None
    currentSpot: Optional[float] = None


class UserContext(BaseModel):
    isAuthenticated: bool = False
    accountType: Optional[str] = None  # demo, real
    accountId: Optional[str] = None
    currency: Optional[str] = None
    balance: Optional[float] = None
    openPositionsCount: Optional[int] = None
    totalProfit: Optional[float] = None
    totalInvested: Optional[float] = None
    winningCount: Optional[int] = None
    losingCount: Optional[int] = None
    positions: Optional[list[PositionSummary]] = None


class ChatRequest(BaseModel):
    message: str
    layoutState: LayoutState
    userContext: Optional[UserContext] = None
    conversationHistory: Optional[list[dict]] = []


class UIChange(BaseModel):
    component: Optional[str] = None
    action: Optional[str] = None  # show, hide, resize, reorder, highlight, set, navigate
    value: Optional[str] = None
    url: Optional[str] = None  # For navigate action
    theme: Optional[str] = None
    language: Optional[str] = None
    accentColor: Optional[str] = None
    preset: Optional[str] = None  # trading, minimal, analysis, monitoring

    model_config = {"extra": "ignore"}
    
    def model_dump(self, **kwargs):
        kwargs.setdefault('exclude_none', True)
        return super().model_dump(**kwargs)


class ChatResponse(BaseModel):
    message: str
    uiChanges: list[UIChange]


SYSTEM_PROMPT_BASE = """You are Amy, a friendly AI assistant for the Deriv trading platform.

## RESPONSE FORMAT
Always respond with valid JSON:
{
  "message": "Your response text",
  "uiChanges": []
}

## UI CONTROL
You can control components: chart, orderPanel, positions, watchlist, marketOverview, news, portfolio, clock, calculator

Actions for components:
- {"component": "chart", "action": "show"}
- {"component": "chart", "action": "hide"}
- {"component": "chart", "action": "resize", "value": "large"}  (small/medium/large/full)
- {"component": "chart", "action": "highlight"}  (flashes the component)

Global settings (use direct format):
- {"theme": "dark"} or {"theme": "light"}
- {"language": "es"}  (en/es/fr/de/zh/ar/ja/pt/ru)
- {"accentColor": "#2196F3"}
- {"preset": "trading"}  (trading/minimal/analysis/monitoring)

Navigation (open URL in new tab):
- {"action": "navigate", "url": "https://app.deriv.com/cashier/deposit"}

Common URLs to redirect users:
- Deposit: https://app.deriv.com/cashier/deposit
- Withdraw: https://app.deriv.com/cashier/withdrawal
- API Token: https://app.deriv.com/account/api-token
- Account Settings: https://app.deriv.com/account/personal-details
- Trading History: https://app.deriv.com/reports/statement
- Deriv Blog: https://deriv.com/blog
- Help Center: https://deriv.com/help-centre

## IMPORTANT
- When guiding users, use "highlight" to draw attention to components
- Always show a component before highlighting it
- For tours, go step by step and wait for user to say "next"
"""

KNOWLEDGE_PROMPT = f"""## KNOWLEDGE BASE - Trading Education & UI Guide
This section contains information about trading concepts, platform components, and guided tours.
Use this when users want to learn about trading or need help navigating the platform.

{KNOWLEDGE_BASE}
"""

# Build system prompt based on available knowledge sources
if FAQ_BASE:
    # Full prompt with both roles
    ROLES_SECTION = """
## YOUR ROLES

### Role 1: Trading Assistant & UI Guide
- Help users learn to trade (Rise/Fall contracts, synthetic indices)
- Guide users through the platform with interactive tours
- Customize the UI layout based on user preferences
- Use the KNOWLEDGE BASE section for this

### Role 2: Customer Support Agent  
- Help users troubleshoot problems (login issues, deposit failures, account problems)
- Answer questions about payments, withdrawals, verification
- Provide solutions from the FAQ when users have issues
- Use the CUSTOMER SUPPORT FAQ section for this

**Be smart about which role to use:**
- "How do I trade?" → Trading Assistant (Knowledge Base)
- "Why can't I withdraw?" → Customer Support (FAQ)
- "Show me the chart" → Trading Assistant (UI Control)
- "My MT5 account is disabled" → Customer Support (FAQ)
- "I'm new here" → Trading Assistant (Tour)
- "I can't login" → Customer Support (FAQ)
"""
else:
    # Simple prompt without customer support
    ROLES_SECTION = """
## YOUR ROLE: Trading Assistant & UI Guide
- Help users learn to trade (Rise/Fall contracts, synthetic indices)
- Guide users through the platform with interactive tours
- Customize the UI layout based on user preferences
- Use the KNOWLEDGE BASE section for trading education
"""

# Insert roles into system prompt
SYSTEM_PROMPT = SYSTEM_PROMPT_BASE.replace(
    "## RESPONSE FORMAT",
    ROLES_SECTION + "\n## RESPONSE FORMAT"
)

# Only create FAQ prompt if FAQ content exists
FAQ_PROMPT = ""
if FAQ_BASE:
    FAQ_PROMPT = f"""## CUSTOMER SUPPORT FAQ - Troubleshooting & Account Issues
This section contains frequently asked questions from our customer support system.

**IMPORTANT: When to use this FAQ:**
- When users have PROBLEMS or ISSUES (can't login, deposit failed, account disabled, etc.)
- When users ask about payments, withdrawals, or account verification
- When users mention errors, bugs, or things not working
- When users ask "why can't I..." or "how do I fix..."
- When users have questions about MT5, cTrader, or specific Deriv products

**When NOT to use this FAQ:**
- For general trading education (use Knowledge Base instead)
- For UI customization requests
- For guided tours

**How to use:**
- Search this FAQ for relevant answers
- Provide the answer naturally in your own words
- Include relevant links if the FAQ provides them
- If the FAQ doesn't cover their issue, acknowledge it and suggest contacting support

{FAQ_BASE}
"""


def get_layout_description(layout: LayoutState) -> str:
    """Generate a human-readable description of the current layout."""
    visible = [f"{name} ({state.size})" for name, state in layout.components.items() if state.visible]
    hidden = [name for name, state in layout.components.items() if not state.visible]
    
    return f"""Current layout:
- Visible: {', '.join(visible) if visible else 'none'}
- Hidden: {', '.join(hidden) if hidden else 'none'}
- Theme: {layout.theme}, Language: {layout.language}"""


# Component name mappings
COMPONENT_ALIASES = {
    "chart": ["chart", "price chart", "graph"],
    "riseFallPanel": ["rise fall", "rise/fall", "risefall", "simple trade", "up down"],
    "higherLowerPanel": ["higher lower", "higher/lower", "higherlower", "barrier trade"],
    "positions": ["positions", "open positions", "trades"],
    "watchlist": ["watchlist", "favorites", "symbols"],
    "marketOverview": ["market overview", "market", "overview"],
    "news": ["news"],
    "portfolio": ["portfolio", "balance", "account"],
    "clock": ["clock", "world clock", "time"],
    "calculator": ["calculator", "calc"],
}

def find_component(text: str) -> Optional[str]:
    text_lower = text.lower()
    for comp_id, aliases in COMPONENT_ALIASES.items():
        if any(alias in text_lower for alias in aliases):
            return comp_id
    return None


def demo_mode_response(message: str, layout: LayoutState) -> ChatResponse:
    """Simple pattern-matching fallback when no OpenAI key is available."""
    msg_lower = message.lower()
    ui_changes = []
    response_text = ""
    
    # Greetings
    if any(word in msg_lower for word in ["hi", "hello", "hey"]):
        response_text = "Hello! 👋 I'm Amy, your trading assistant.\n\n**For the full AI experience with guided tours, please set up an OpenAI API key.**\n\nIn demo mode, I can still help with basic commands:\n• \"Show/hide the chart\"\n• \"Dark mode\" / \"Light mode\"\n• \"Trading layout\"\n• \"What is Rise/Fall?\""
    
    # Beginner/Expert tours - suggest AI mode
    elif any(phrase in msg_lower for phrase in ["beginner", "i'm new", "expert", "tour", "teach me", "learn"]):
        response_text = "🎓 **Guided tours require AI mode!**\n\nTo get personalized step-by-step guidance:\n1. Set the `OPENAI_API_KEY` environment variable\n2. Restart the backend\n\nI'll then guide you through the platform with interactive tutorials!\n\nFor now, try:\n• \"What is Rise/Fall?\" - I'll explain the basics\n• \"Show the order panel\" - I'll display trading controls"
    
    # Layout presets
    elif "trading" in msg_lower and any(word in msg_lower for word in ["layout", "setup", "mode"]):
        ui_changes.append(UIChange(preset="trading"))
        response_text = "✅ Trading layout applied! You now have the chart, order panel, positions, and clock."
    
    elif "minimal" in msg_lower:
        ui_changes.append(UIChange(preset="minimal"))
        response_text = "✅ Minimal layout - just the essentials."
    
    elif "analysis" in msg_lower:
        ui_changes.append(UIChange(preset="analysis"))
        response_text = "✅ Analysis layout with chart, watchlist, news, and market overview."
    
    # Show/hide components
    elif "hide" in msg_lower:
        comp = find_component(msg_lower)
        if comp:
            ui_changes.append(UIChange(component=comp, action="hide"))
            response_text = f"✅ Hidden the {comp}."
        else:
            response_text = "What would you like to hide? (chart, order panel, positions, etc.)"
    
    elif "show" in msg_lower:
        comp = find_component(msg_lower)
        if comp:
            ui_changes.append(UIChange(component=comp, action="show"))
            ui_changes.append(UIChange(component=comp, action="highlight"))
            response_text = f"✅ Here's the {comp}!"
        else:
            response_text = "What would you like to see? (chart, order panel, positions, etc.)"
    
    # Theme
    elif "dark" in msg_lower and ("mode" in msg_lower or "theme" in msg_lower):
        ui_changes.append(UIChange(theme="dark"))
        response_text = "🌙 Dark mode activated!"
    
    elif "light" in msg_lower and ("mode" in msg_lower or "theme" in msg_lower):
        ui_changes.append(UIChange(theme="light"))
        response_text = "☀️ Light mode activated!"
    
    # Language
    elif "spanish" in msg_lower:
        ui_changes.append(UIChange(language="es"))
        response_text = "¡Cambiado a español!"
    elif "french" in msg_lower:
        ui_changes.append(UIChange(language="fr"))
        response_text = "Changé en français!"
    elif "arabic" in msg_lower:
        ui_changes.append(UIChange(language="ar"))
        response_text = "تم التغيير إلى العربية!"
    elif "chinese" in msg_lower:
        ui_changes.append(UIChange(language="zh"))
        response_text = "已切换到中文！"
    elif "german" in msg_lower:
        ui_changes.append(UIChange(language="de"))
        response_text = "Auf Deutsch umgestellt!"
    
    # Rise/Fall explanation
    elif any(phrase in msg_lower for phrase in ["rise", "fall", "what is", "how to trade"]):
        ui_changes.append(UIChange(component="orderPanel", action="show"))
        ui_changes.append(UIChange(component="orderPanel", action="highlight"))
        response_text = """**Rise/Fall Trading** 📈📉

• **Rise** = You predict price goes UP
• **Fall** = You predict price goes DOWN

**How it works:**
1. Set your stake (e.g., $10)
2. Choose duration (5-20 ticks)
3. Click Rise or Fall
4. Win ~95% profit if correct, lose stake if wrong

Look at the Order Panel (highlighted) to place a trade!"""
    
    # Default
    if not response_text:
        response_text = """I'm in demo mode with limited capabilities.

**Try these commands:**
• "Show the chart" / "Hide the news"
• "Trading layout" / "Minimal layout"
• "Dark mode" / "Light mode"
• "What is Rise/Fall?"

**For full AI features** (guided tours, smart conversations), set up an OpenAI API key!"""
    
    return ChatResponse(message=response_text, uiChanges=ui_changes)


def get_user_context_description(user: Optional[UserContext]) -> str:
    """Generate a human-readable description of the user's account."""
    if not user or not user.isAuthenticated:
        return "User is NOT logged in (no Deriv account connected)."
    
    lines = [
        f"User IS logged in:",
        f"- Account ID: {user.accountId}",
        f"- Account Type: {user.accountType.upper() if user.accountType else 'Unknown'}",
        f"- Currency: {user.currency or 'Unknown'}",
        f"- Balance: {user.balance:.2f} {user.currency}" if user.balance is not None else "- Balance: Unknown",
        f"- Open Positions: {user.openPositionsCount or 0}",
    ]
    
    if user.openPositionsCount and user.openPositionsCount > 0:
        lines.append(f"- Total Invested: {user.totalInvested:.2f} {user.currency}" if user.totalInvested else "")
        lines.append(f"- Current P/L: {'+' if (user.totalProfit or 0) >= 0 else ''}{user.totalProfit:.2f} {user.currency}" if user.totalProfit is not None else "")
        lines.append(f"- Winning contracts: {user.winningCount or 0}")
        lines.append(f"- Losing contracts: {user.losingCount or 0}")
        
        # Add individual position details
        if user.positions:
            lines.append("")
            lines.append("Individual Positions:")
            for i, pos in enumerate(user.positions, 1):
                status = "✅ WINNING" if pos.isWinning else "❌ LOSING"
                profit_str = f"+{pos.currentProfit:.2f}" if pos.currentProfit >= 0 else f"{pos.currentProfit:.2f}"
                lines.append(f"  {i}. {pos.contractType} on {pos.symbol}: {status} ({profit_str} {user.currency})")
    
    return "\n".join(filter(None, lines))


async def ai_mode_response(message: str, layout: LayoutState, user_context: Optional[UserContext], history: list[dict]) -> ChatResponse:
    """Use OpenAI for intelligent responses."""
    layout_desc = get_layout_description(layout)
    user_desc = get_user_context_description(user_context)
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": KNOWLEDGE_PROMPT},
    ]
    
    # Only include FAQ if it was loaded
    if FAQ_PROMPT:
        messages.append({"role": "system", "content": FAQ_PROMPT})
    
    # Add context about current state and user
    context_msg = f"""## CURRENT STATE

{layout_desc}

## USER CONTEXT
{user_desc}

Use this information to personalize your responses. For example:
- If user asks "how is my portfolio?" and they have open positions, tell them their P/L
- If user is on a demo account, you can mention they're practicing with virtual funds
- If user is not logged in and asks about their account, suggest they connect first
"""
    messages.append({"role": "system", "content": context_msg})
    
    # Add conversation history (last 10 messages)
    for msg in history[-10:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    
    messages.append({"role": "user", "content": message})
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-5.1",
            messages=messages,
            response_format={"type": "json_object"},
            reasoning_effort="medium",
            max_completion_tokens=5000,
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


@app.post("/chat", response_model=ChatResponse, response_model_exclude_none=True)
async def chat(request: ChatRequest):
    if openai_client:
        response = await ai_mode_response(
            request.message,
            request.layoutState,
            request.userContext,
            request.conversationHistory or []
        )
    else:
        response = demo_mode_response(request.message, request.layoutState)
    
    print(f"[Amy] Response: {response.message[:50]}... | UI changes: {len(response.uiChanges)}")
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
