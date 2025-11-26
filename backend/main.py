"""
Amy Dynamic UI Backend Service

This service acts as the AI brain that:
1. Chats with users
2. Analyzes their preferences and needs
3. Returns UI control instructions to dynamically adjust the frontend
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

app = FastAPI(
    title="Amy Dynamic UI Service",
    description="AI-driven dynamic UI control system",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# UI Component definitions - what AI can control
UI_COMPONENTS = {
    "watchlist": {"name": "Watchlist", "description": "Shows tracked assets and their prices"},
    "portfolio": {"name": "Portfolio Summary", "description": "Shows user's holdings and P&L"},
    "chart": {"name": "Price Chart", "description": "Interactive price chart for selected asset"},
    "orderPanel": {"name": "Order Panel", "description": "Quick trade execution panel"},
    "news": {"name": "Market News", "description": "Latest financial news feed"},
    "marketOverview": {"name": "Market Overview", "description": "Overall market status and indices"},
    "clock": {"name": "World Clock", "description": "Shows time in major financial centers"},
    "calculator": {"name": "Position Calculator", "description": "Calculate position sizes and risk"},
}


class UIState(BaseModel):
    """Current state of the UI"""
    theme: str = "dark"  # dark, light
    language: str = "en"  # en, es, fr, de, zh, ar
    visibleComponents: list[str] = ["watchlist", "portfolio", "chart", "news"]
    layout: str = "standard"  # standard, compact, expanded
    primaryColor: str = "#3b82f6"  # Blue default
    fontSize: str = "medium"  # small, medium, large


class ChatRequest(BaseModel):
    """Incoming chat request"""
    message: str
    currentUIState: UIState
    conversationHistory: list[dict] = []


class UIUpdate(BaseModel):
    """Instructions for UI changes"""
    theme: Optional[str] = None
    language: Optional[str] = None
    showComponents: Optional[list[str]] = None
    hideComponents: Optional[list[str]] = None
    layout: Optional[str] = None
    primaryColor: Optional[str] = None
    fontSize: Optional[str] = None
    reasoning: str = ""  # AI's reasoning for the changes


class ChatResponse(BaseModel):
    """Response containing both chat reply and UI instructions"""
    reply: str
    uiUpdate: Optional[UIUpdate] = None
    shouldUpdateUI: bool = False


SYSTEM_PROMPT = """You are Amy, an intelligent AI assistant for a trading platform. You have a unique capability: you can dynamically adjust the user interface based on user preferences and needs.

AVAILABLE UI COMPONENTS:
- watchlist: Shows tracked assets and their prices
- portfolio: Portfolio Summary showing user's holdings and P&L  
- chart: Interactive price chart for selected asset
- orderPanel: Quick trade execution panel
- news: Market News feed with latest financial news
- marketOverview: Overall market status and indices
- clock: World Clock showing time in major financial centers
- calculator: Position Calculator for calculating position sizes and risk

CURRENT UI STATE:
{ui_state}

YOUR CAPABILITIES:
1. Answer questions about trading, markets, and the platform
2. Detect user preferences from conversation context
3. Recommend and make UI changes when beneficial

UI CONTROL OPTIONS:
- theme: "dark" or "light"
- language: "en", "es", "fr", "de", "zh", "ar" 
- showComponents: list of component IDs to show
- hideComponents: list of component IDs to hide
- layout: "standard", "compact", "expanded"
- primaryColor: hex color code (e.g., "#3b82f6")
- fontSize: "small", "medium", "large"

RESPONSE FORMAT:
You must respond with valid JSON in this exact format:
{{
    "reply": "Your conversational response to the user",
    "shouldUpdateUI": true/false,
    "uiUpdate": {{
        "theme": "dark/light or null",
        "language": "language code or null", 
        "showComponents": ["component1", "component2"] or null,
        "hideComponents": ["component1"] or null,
        "layout": "standard/compact/expanded or null",
        "primaryColor": "#hexcode or null",
        "fontSize": "small/medium/large or null",
        "reasoning": "Brief explanation of why you're making these changes"
    }}
}}

IMPORTANT GUIDELINES:
- Only suggest UI changes when there's a clear benefit or user request
- Be conversational and helpful in your replies
- Consider context: if user mentions they're a beginner, simplify the UI
- If user mentions they can't see well, increase font size
- If user mentions a specific language, switch to it
- If user asks about specific features, show relevant components
- Professional traders might want more components, beginners fewer
- Always explain UI changes naturally in your reply
- Don't change the UI on every message - only when meaningful

Examples of triggers for UI changes:
- "I can't see very well" → increase fontSize
- "It's too bright" → switch to dark theme  
- "I want to see the news" → show news component
- "Hablo español" → switch language to Spanish
- "I'm new to trading" → simplify to fewer components
- "Show me everything" → show all components
- "What time is it in Tokyo?" → show clock component
"""


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Amy Dynamic UI"}


@app.get("/components")
async def get_components():
    """Get available UI components"""
    return {"components": UI_COMPONENTS}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint that returns both response and UI instructions
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    # Build conversation context
    ui_state_str = json.dumps(request.currentUIState.model_dump(), indent=2)
    system_message = SYSTEM_PROMPT.format(ui_state=ui_state_str)
    
    messages = [{"role": "system", "content": system_message}]
    
    # Add conversation history
    for msg in request.conversationHistory[-10:]:  # Keep last 10 messages for context
        messages.append(msg)
    
    # Add current message
    messages.append({"role": "user", "content": request.message})
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Parse UI update if present
        ui_update = None
        if result.get("shouldUpdateUI") and result.get("uiUpdate"):
            ui_update = UIUpdate(**result["uiUpdate"])
        
        return ChatResponse(
            reply=result.get("reply", "I'm sorry, I couldn't process that request."),
            uiUpdate=ui_update,
            shouldUpdateUI=result.get("shouldUpdateUI", False)
        )
        
    except json.JSONDecodeError as e:
        # If AI returns non-JSON, just return the text
        return ChatResponse(
            reply=response.choices[0].message.content,
            shouldUpdateUI=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/demo-chat", response_model=ChatResponse)
async def demo_chat(request: ChatRequest):
    """
    Demo endpoint that works without OpenAI API key
    Uses predefined responses to demonstrate the concept
    """
    message = request.message.lower()
    current_state = request.currentUIState
    
    # Demo responses based on keywords
    if "dark" in message or "bright" in message or "eyes" in message:
        return ChatResponse(
            reply="I've switched to dark mode for you. It's easier on the eyes, especially during long trading sessions. Let me know if you'd like any other adjustments!",
            uiUpdate=UIUpdate(theme="dark", reasoning="User requested darker theme for comfort"),
            shouldUpdateUI=True
        )
    
    elif "light" in message or "brighter" in message:
        return ChatResponse(
            reply="Switching to light mode! This can be better for well-lit environments. How does that look?",
            uiUpdate=UIUpdate(theme="light", reasoning="User requested lighter theme"),
            shouldUpdateUI=True
        )
    
    elif "español" in message or "spanish" in message:
        return ChatResponse(
            reply="¡Por supuesto! He cambiado el idioma a español. La interfaz ahora mostrará todo en español. ¿Hay algo más en lo que pueda ayudarte?",
            uiUpdate=UIUpdate(language="es", reasoning="User requested Spanish language"),
            shouldUpdateUI=True
        )
    
    elif "français" in message or "french" in message:
        return ChatResponse(
            reply="Bien sûr! J'ai changé la langue en français. L'interface affichera maintenant tout en français. Puis-je vous aider avec autre chose?",
            uiUpdate=UIUpdate(language="fr", reasoning="User requested French language"),
            shouldUpdateUI=True
        )
    
    elif "中文" in message or "chinese" in message:
        return ChatResponse(
            reply="好的!我已将语言切换为中文。界面现在将以中文显示。还有什么我可以帮您的吗?",
            uiUpdate=UIUpdate(language="zh", reasoning="User requested Chinese language"),
            shouldUpdateUI=True
        )
    
    elif "bigger" in message or "larger" in message or "can't see" in message or "small text" in message:
        return ChatResponse(
            reply="I've increased the font size to make everything more readable. If you need it even larger, just let me know!",
            uiUpdate=UIUpdate(fontSize="large", reasoning="User indicated difficulty reading text"),
            shouldUpdateUI=True
        )
    
    elif "smaller" in message or "compact" in message:
        return ChatResponse(
            reply="Done! I've made the text smaller and switched to a more compact layout so you can see more information at once.",
            uiUpdate=UIUpdate(fontSize="small", layout="compact", reasoning="User wants more compact view"),
            shouldUpdateUI=True
        )
    
    elif "news" in message:
        show = ["news"] if "news" not in current_state.visibleComponents else None
        return ChatResponse(
            reply="Here's the market news panel! I've added it to your dashboard. It shows the latest financial news and market updates. Would you like me to add any other components?",
            uiUpdate=UIUpdate(showComponents=show, reasoning="User wants to see news") if show else None,
            shouldUpdateUI=bool(show)
        )
    
    elif "clock" in message or "time" in message:
        show = ["clock"] if "clock" not in current_state.visibleComponents else None
        return ChatResponse(
            reply="I've added the World Clock to your dashboard! It shows the current time in major financial centers - New York, London, Tokyo, and Sydney. Very useful for knowing when different markets are open!",
            uiUpdate=UIUpdate(showComponents=show, reasoning="User asked about time/clock") if show else None,
            shouldUpdateUI=bool(show)
        )
    
    elif "calculator" in message or "position size" in message or "risk" in message:
        show = ["calculator"] if "calculator" not in current_state.visibleComponents else None
        return ChatResponse(
            reply="Great idea! I've added the Position Calculator to help you calculate position sizes and manage risk. It's a crucial tool for professional trading!",
            uiUpdate=UIUpdate(showComponents=show, reasoning="User wants calculator") if show else None,
            shouldUpdateUI=bool(show)
        )
    
    elif "beginner" in message or "new to" in message or "simple" in message:
        return ChatResponse(
            reply="Welcome! I've simplified the interface for you, showing just the essentials: your watchlist, portfolio, and the price chart. As you get more comfortable, just ask me to add more features. I'm here to help you learn!",
            uiUpdate=UIUpdate(
                showComponents=["watchlist", "portfolio", "chart"],
                hideComponents=["orderPanel", "news", "marketOverview", "clock", "calculator"],
                layout="standard",
                reasoning="User is a beginner, simplifying interface"
            ),
            shouldUpdateUI=True
        )
    
    elif "everything" in message or "all" in message or "show me more" in message:
        return ChatResponse(
            reply="You got it! I've enabled all available components. You now have: Watchlist, Portfolio, Charts, Order Panel, News, Market Overview, World Clock, and Position Calculator. Feel free to ask me to hide anything you don't need!",
            uiUpdate=UIUpdate(
                showComponents=list(UI_COMPONENTS.keys()),
                layout="expanded",
                reasoning="User wants to see all components"
            ),
            shouldUpdateUI=True
        )
    
    elif "hide" in message:
        # Try to identify what to hide
        to_hide = []
        for comp in UI_COMPONENTS.keys():
            if comp.lower() in message:
                to_hide.append(comp)
        
        if to_hide:
            return ChatResponse(
                reply=f"Done! I've hidden the {', '.join(to_hide)} from your view. Let me know if you want it back anytime.",
                uiUpdate=UIUpdate(hideComponents=to_hide, reasoning="User requested to hide components"),
                shouldUpdateUI=True
            )
    
    elif "green" in message:
        return ChatResponse(
            reply="Nice choice! Green is associated with growth and prosperity - perfect for trading! I've updated the accent color.",
            uiUpdate=UIUpdate(primaryColor="#22c55e", reasoning="User wants green color"),
            shouldUpdateUI=True
        )
    
    elif "red" in message:
        return ChatResponse(
            reply="Going with red! Bold choice. I've updated the accent color for you.",
            uiUpdate=UIUpdate(primaryColor="#ef4444", reasoning="User wants red color"),
            shouldUpdateUI=True
        )
    
    elif "blue" in message:
        return ChatResponse(
            reply="Blue it is! A classic, professional choice. I've updated the accent color.",
            uiUpdate=UIUpdate(primaryColor="#3b82f6", reasoning="User wants blue color"),
            shouldUpdateUI=True
        )
    
    elif "purple" in message:
        return ChatResponse(
            reply="Purple - sophisticated taste! I've updated the accent color to purple.",
            uiUpdate=UIUpdate(primaryColor="#a855f7", reasoning="User wants purple color"),
            shouldUpdateUI=True
        )
    
    elif "reset" in message or "default" in message:
        return ChatResponse(
            reply="No problem! I've reset your interface to the default settings. Fresh start!",
            uiUpdate=UIUpdate(
                theme="dark",
                language="en",
                showComponents=["watchlist", "portfolio", "chart", "news"],
                hideComponents=["orderPanel", "marketOverview", "clock", "calculator"],
                layout="standard",
                primaryColor="#3b82f6",
                fontSize="medium",
                reasoning="User wants to reset to defaults"
            ),
            shouldUpdateUI=True
        )
    
    # Default conversational responses
    elif "hello" in message or "hi" in message or "hey" in message:
        return ChatResponse(
            reply="Hello! I'm Amy, your AI trading assistant. I can help you with market information, answer questions, and even customize this interface to match your preferences. Try asking me to change the theme, show different components, or switch languages!",
            shouldUpdateUI=False
        )
    
    elif "help" in message or "what can you do" in message:
        return ChatResponse(
            reply="""I can help you in many ways! Here are some things you can ask me:

**UI Customization:**
• "Switch to dark/light mode"
• "Make the text bigger/smaller"
• "Show me the news/clock/calculator"
• "I'm a beginner" - I'll simplify the interface
• "Show me everything" - Full dashboard
• "Change color to green/blue/red/purple"
• "Switch to Spanish/French/Chinese"

**Trading Help:**
• Ask about market conditions
• Get help understanding features
• Learn about trading concepts

Just chat naturally and I'll adapt the interface to your needs!""",
            shouldUpdateUI=False
        )
    
    else:
        return ChatResponse(
            reply=f"I understand you're asking about '{request.message}'. As your AI assistant, I can help with trading questions and customize your interface. Try asking me to change the theme, show different components, or adjust the layout. What would you like me to help with?",
            shouldUpdateUI=False
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

