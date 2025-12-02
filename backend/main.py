import os
import json
import re
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
    action: Optional[str] = None  # show, hide, resize, reorder
    value: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    accentColor: Optional[str] = None
    preset: Optional[str] = None  # trading, minimal, analysis, monitoring


class ChatResponse(BaseModel):
    message: str
    uiChanges: list[UIChange]


SYSTEM_PROMPT = """You are Amy, an AI assistant for a trading platform. You can control the UI layout based on user requests.

Available components (you can show, hide, resize, or reorder these):
- chart: Price chart with candlesticks
- orderPanel: Buy Rise/Fall trading panel
- positions: Open positions with P/L
- watchlist: Favorite symbols with prices
- marketOverview: Market summary and trends
- news: Market news and updates
- portfolio: Account balance and summary
- clock: World clock with multiple timezones
- calculator: Trading calculator

Size options: small, medium, large, full

Layout presets:
- trading: Chart (large) + Order Panel + Positions + Clock - ideal for active trading
- minimal: Chart (large) + Order Panel only - clean and focused
- analysis: Chart (large) + Watchlist + News + Market Overview - for research
- monitoring: Positions (large) + Chart + Portfolio - for watching positions

Theme options: dark, light
Languages: en (English), es (Spanish), fr (French), de (German), zh (Chinese), ar (Arabic), ja (Japanese), pt (Portuguese), ru (Russian)
Accent colors: Any hex color (e.g., #00D4AA for teal, #FF444F for red, #2196F3 for blue)

CURRENT LAYOUT STATE will be provided with each message. Use this to:
1. Know what's already visible/hidden (don't hide something already hidden)
2. Notice cramped/overflow issues and proactively offer to fix them
3. Give context-aware responses

When responding, always:
1. Be concise and friendly
2. Explain what you changed
3. If the user asks for something already in the current state, acknowledge it
4. If there are health issues, mention them proactively

Respond with a JSON object containing:
- message: Your conversational response
- uiChanges: Array of UI changes to make (can be empty)

Each uiChange can have:
- component: Component name to change
- action: "show", "hide", "resize", "reorder"
- value: New size (for resize) or position (for reorder)
- theme: "dark" or "light" (for theme changes)
- language: Language code (for language changes)
- accentColor: Hex color (for accent color changes)
- preset: Preset name (applies a predefined layout)
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


def demo_mode_response(message: str, layout: LayoutState) -> ChatResponse:
    """Pattern-matching fallback when no OpenAI key is available."""
    msg_lower = message.lower()
    ui_changes = []
    response_text = ""
    
    # Check for greetings
    if any(word in msg_lower for word in ["hi", "hello", "hey"]):
        response_text = "Hello! I'm Amy, your trading assistant. I can help customize your workspace - just tell me what you'd like to see or hide, change themes, or set up layouts for different trading styles."
        if layout.healthIssues:
            response_text += f" I noticed some layout issues: {', '.join(layout.healthIssues)}. Want me to fix them?"
    
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
        response_text = "Perfect! I've set up a trading layout with a large chart, order panel, positions, and clock."
        ui_changes.append(UIChange(preset="trading"))
    
    elif "minimal" in msg_lower:
        response_text = "Done! Minimal layout active - just the chart and order panel."
        ui_changes.append(UIChange(preset="minimal"))
    
    elif "analysis" in msg_lower or "research" in msg_lower:
        response_text = "Analysis mode activated! You now have the chart, watchlist, news, and market overview."
        ui_changes.append(UIChange(preset="analysis"))
    
    elif "monitoring" in msg_lower or "watch" in msg_lower and "position" in msg_lower:
        response_text = "Monitoring layout ready - positions are front and center with your chart and portfolio."
        ui_changes.append(UIChange(preset="monitoring"))
    
    # Check for show/hide commands
    elif "hide" in msg_lower or "remove" in msg_lower:
        for comp in ["chart", "orderPanel", "positions", "watchlist", "marketOverview", "news", "portfolio", "clock", "calculator"]:
            comp_lower = comp.lower()
            # Handle compound names
            search_terms = [comp_lower]
            if comp == "orderPanel":
                search_terms.extend(["order panel", "order", "trading panel"])
            elif comp == "marketOverview":
                search_terms.extend(["market overview", "market", "overview"])
            
            if any(term in msg_lower for term in search_terms):
                if layout.components.get(comp) and not layout.components[comp].visible:
                    response_text = f"The {comp} is already hidden. Would you like me to show it instead?"
                else:
                    response_text = f"Done! I've hidden the {comp}."
                    ui_changes.append(UIChange(component=comp, action="hide"))
                break
    
    elif "show" in msg_lower or "add" in msg_lower or "display" in msg_lower:
        for comp in ["chart", "orderPanel", "positions", "watchlist", "marketOverview", "news", "portfolio", "clock", "calculator"]:
            comp_lower = comp.lower()
            search_terms = [comp_lower]
            if comp == "orderPanel":
                search_terms.extend(["order panel", "order", "trading panel"])
            elif comp == "marketOverview":
                search_terms.extend(["market overview", "market", "overview"])
            
            if any(term in msg_lower for term in search_terms):
                if layout.components.get(comp) and layout.components[comp].visible:
                    response_text = f"The {comp} is already visible. Would you like me to resize it?"
                else:
                    response_text = f"Done! I've shown the {comp}."
                    ui_changes.append(UIChange(component=comp, action="show"))
                break
    
    # Check for resize commands
    elif any(word in msg_lower for word in ["bigger", "larger", "expand", "full"]):
        for comp in ["chart", "orderPanel", "positions", "watchlist", "marketOverview", "news", "portfolio", "clock", "calculator"]:
            if comp.lower() in msg_lower or (comp == "orderPanel" and "order" in msg_lower):
                new_size = "full" if "full" in msg_lower else "large"
                response_text = f"Done! I've made the {comp} {new_size}."
                ui_changes.append(UIChange(component=comp, action="resize", value=new_size))
                break
    
    elif any(word in msg_lower for word in ["smaller", "shrink", "compact"]):
        for comp in ["chart", "orderPanel", "positions", "watchlist", "marketOverview", "news", "portfolio", "clock", "calculator"]:
            if comp.lower() in msg_lower or (comp == "orderPanel" and "order" in msg_lower):
                response_text = f"Done! I've made the {comp} smaller."
                ui_changes.append(UIChange(component=comp, action="resize", value="small"))
                break
    
    # Check for theme changes
    elif "dark" in msg_lower and ("mode" in msg_lower or "theme" in msg_lower):
        if layout.theme == "dark":
            response_text = "You're already in dark mode!"
        else:
            response_text = "Switched to dark mode. Easy on the eyes! 🌙"
            ui_changes.append(UIChange(theme="dark"))
    
    elif "light" in msg_lower and ("mode" in msg_lower or "theme" in msg_lower):
        if layout.theme == "light":
            response_text = "You're already in light mode!"
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
            response_text = "Accent color changed to blue!"
            ui_changes.append(UIChange(accentColor="#2196F3"))
        elif "red" in msg_lower:
            response_text = "Accent color changed to red!"
            ui_changes.append(UIChange(accentColor="#FF444F"))
        elif "green" in msg_lower:
            response_text = "Accent color changed to green!"
            ui_changes.append(UIChange(accentColor="#00D4AA"))
        elif "purple" in msg_lower:
            response_text = "Accent color changed to purple!"
            ui_changes.append(UIChange(accentColor="#9C27B0"))
        elif "orange" in msg_lower:
            response_text = "Accent color changed to orange!"
            ui_changes.append(UIChange(accentColor="#FF9800"))
        else:
            # Try to extract hex color
            hex_match = re.search(r'#[0-9A-Fa-f]{6}', message)
            if hex_match:
                response_text = f"Accent color changed to {hex_match.group()}!"
                ui_changes.append(UIChange(accentColor=hex_match.group()))
            else:
                response_text = "What color would you like? I support blue, red, green, purple, orange, or any hex color like #FF5733."
    
    # Default response
    if not response_text:
        response_text = "I can help you customize your trading workspace! Try asking me to:\n• Show or hide components (chart, positions, watchlist, news, etc.)\n• Change themes (dark/light mode)\n• Switch languages\n• Set up layouts for trading, analysis, or monitoring\n• Change accent colors"
    
    return ChatResponse(message=response_text, uiChanges=ui_changes)


async def ai_mode_response(message: str, layout: LayoutState, history: list[dict]) -> ChatResponse:
    """Use OpenAI GPT-4 for intelligent responses."""
    layout_desc = get_layout_description(layout)
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
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
            max_tokens=500,
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

