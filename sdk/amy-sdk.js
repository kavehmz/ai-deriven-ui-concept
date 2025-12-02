/**
 * Amy AI SDK - Drop-in AI-powered UI customization for any website
 * 
 * Usage:
 *   <script src="amy-sdk.js"></script>
 *   <script>
 *     Amy.init({ apiUrl: 'https://your-api.com' });
 *   </script>
 * 
 * Mark controllable elements:
 *   <div data-amy="sidebar" data-amy-size="medium" data-amy-order="1">...</div>
 *   <div data-amy="chart" data-amy-size="large" data-amy-order="2">...</div>
 */

(function(window, document) {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    apiUrl: 'http://localhost:8000',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    theme: 'dark', // dark, light, auto
    accentColor: '#ff444f',
    bubbleSize: 60,
    panelWidth: 380,
    panelHeight: 500,
    greeting: "Hi! I'm Amy, your AI assistant. I can help customize this interface for you. Try:\n\n• \"Hide the sidebar\"\n• \"Make the chart bigger\"\n• \"Switch to dark mode\"\n\nWhat would you like to change?",
    language: 'en',
    zIndex: 9999,
    containerSelector: null, // Optional: CSS selector for grid container
    debug: false
  };

  // State
  let config = { ...DEFAULT_CONFIG };
  let isOpen = false;
  let isLoading = false;
  let messages = [];
  let elements = new Map(); // Track amy-controlled elements
  let sessionId = 'amy-' + Math.random().toString(36).substr(2, 9);

  // Styles to inject
  const STYLES = `
    /* Amy SDK Styles */
    .amy-hidden { display: none !important; }
    .amy-visible { display: block !important; }
    
    /* Size classes for grid items */
    .amy-size-small { grid-column: span 3; }
    .amy-size-medium { grid-column: span 4; }
    .amy-size-large { grid-column: span 6; grid-row: span 2; }
    .amy-size-full { grid-column: span 12; grid-row: span 2; }
    
    /* Flex-based sizes (alternative) */
    .amy-flex-small { flex: 0 0 25%; max-width: 25%; }
    .amy-flex-medium { flex: 0 0 33.333%; max-width: 33.333%; }
    .amy-flex-large { flex: 0 0 50%; max-width: 50%; }
    .amy-flex-full { flex: 0 0 100%; max-width: 100%; }
    
    /* Transition for smooth changes */
    [data-amy] {
      transition: all 0.3s ease-in-out;
    }
    
    /* Theme classes */
    .amy-theme-dark {
      --amy-bg: #1a1a1a;
      --amy-text: #ffffff;
      --amy-border: #2a2a2a;
      --amy-input-bg: rgba(255,255,255,0.05);
    }
    .amy-theme-light {
      --amy-bg: #ffffff;
      --amy-text: #1a1a1a;
      --amy-border: #e0e0e0;
      --amy-input-bg: rgba(0,0,0,0.03);
    }
    
    /* Chat Widget */
    #amy-widget {
      position: fixed;
      z-index: var(--amy-z-index, 9999);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
    }
    #amy-widget.bottom-right { bottom: 24px; right: 24px; }
    #amy-widget.bottom-left { bottom: 24px; left: 24px; }
    #amy-widget.top-right { top: 24px; right: 24px; }
    #amy-widget.top-left { top: 24px; left: 24px; }
    
    /* Chat Bubble */
    #amy-bubble {
      width: var(--amy-bubble-size, 60px);
      height: var(--amy-bubble-size, 60px);
      border-radius: 50%;
      background: var(--amy-accent, #ff444f);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: none;
      outline: none;
    }
    #amy-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(var(--amy-accent-rgb, 255,68,79), 0.4);
    }
    #amy-bubble svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #amy-bubble .amy-avatar {
      font-size: 24px;
      font-weight: bold;
      color: white;
    }
    
    /* Chat Panel */
    #amy-panel {
      position: absolute;
      width: var(--amy-panel-width, 380px);
      max-height: var(--amy-panel-height, 500px);
      background: var(--amy-bg);
      border-radius: 16px;
      border: 1px solid var(--amy-border);
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #amy-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .bottom-right #amy-panel,
    .bottom-left #amy-panel {
      bottom: calc(var(--amy-bubble-size, 60px) + 16px);
    }
    .top-right #amy-panel,
    .top-left #amy-panel {
      top: calc(var(--amy-bubble-size, 60px) + 16px);
    }
    .bottom-right #amy-panel,
    .top-right #amy-panel {
      right: 0;
    }
    .bottom-left #amy-panel,
    .top-left #amy-panel {
      left: 0;
    }
    
    /* Panel Header */
    #amy-header {
      padding: 16px;
      border-bottom: 1px solid var(--amy-border);
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, rgba(var(--amy-accent-rgb),0.1) 0%, transparent 100%);
    }
    #amy-header .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--amy-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    #amy-header .info {
      flex: 1;
    }
    #amy-header .name {
      font-weight: 600;
      color: var(--amy-text);
    }
    #amy-header .subtitle {
      font-size: 12px;
      opacity: 0.6;
      color: var(--amy-text);
    }
    #amy-header .close-btn {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
      color: var(--amy-text);
    }
    #amy-header .close-btn:hover {
      opacity: 1;
    }
    
    /* Messages Area */
    #amy-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 320px;
    }
    .amy-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      line-height: 1.4;
      white-space: pre-wrap;
      color: var(--amy-text);
    }
    .amy-message.user {
      align-self: flex-end;
      background: var(--amy-accent);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .amy-message.assistant {
      align-self: flex-start;
      background: var(--amy-input-bg);
      border-bottom-left-radius: 4px;
    }
    .amy-message .time {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 4px;
    }
    
    /* Typing Indicator */
    .amy-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: var(--amy-input-bg);
      border-radius: 16px;
      align-self: flex-start;
    }
    .amy-typing span {
      width: 8px;
      height: 8px;
      background: var(--amy-accent);
      border-radius: 50%;
      animation: amyTyping 1.4s infinite ease-in-out;
    }
    .amy-typing span:nth-child(2) { animation-delay: 0.2s; }
    .amy-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes amyTyping {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; }
    }
    
    /* Input Area */
    #amy-input-area {
      padding: 16px;
      border-top: 1px solid var(--amy-border);
      display: flex;
      gap: 8px;
    }
    #amy-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--amy-border);
      border-radius: 8px;
      background: var(--amy-input-bg);
      color: var(--amy-text);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    #amy-input:focus {
      border-color: var(--amy-accent);
    }
    #amy-input::placeholder {
      color: var(--amy-text);
      opacity: 0.5;
    }
    #amy-send {
      padding: 10px 16px;
      background: var(--amy-accent);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    #amy-send:hover {
      opacity: 0.9;
    }
    #amy-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      #amy-panel {
        width: calc(100vw - 32px);
        max-height: 70vh;
      }
    }
  `;

  /**
   * Initialize the SDK
   */
  function init(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    
    // Parse accent color to RGB
    config.accentRgb = hexToRgb(config.accentColor);
    
    // Inject styles
    injectStyles();
    
    // Discover controllable elements
    discoverElements();
    
    // Create widget
    createWidget();
    
    // Add greeting message
    addMessage('assistant', config.greeting);
    
    // Set up mutation observer to detect new elements
    observeDOM();
    
    if (config.debug) {
      console.log('[Amy SDK] Initialized with config:', config);
      console.log('[Amy SDK] Found elements:', elements);
    }
  }

  /**
   * Inject CSS styles
   */
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'amy-sdk-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    
    // Apply theme to body
    document.body.classList.add(`amy-theme-${config.theme}`);
  }

  /**
   * Discover all elements with data-amy attribute
   */
  function discoverElements() {
    const amyElements = document.querySelectorAll('[data-amy]');
    elements.clear();
    
    amyElements.forEach(el => {
      const name = el.getAttribute('data-amy');
      const size = el.getAttribute('data-amy-size') || 'medium';
      const visible = el.getAttribute('data-amy-visible') !== 'false';
      const order = parseInt(el.getAttribute('data-amy-order') || '0', 10);
      
      elements.set(name, {
        element: el,
        name,
        size,
        visible,
        order
      });
      
      // Apply initial classes
      applyElementState(name, { size, visible, order });
    });
  }

  /**
   * Apply state to an element
   */
  function applyElementState(name, state) {
    const data = elements.get(name);
    if (!data) return;
    
    const el = data.element;
    
    // Update visibility
    if (state.visible !== undefined) {
      data.visible = state.visible;
      el.classList.toggle('amy-hidden', !state.visible);
      el.classList.toggle('amy-visible', state.visible);
      el.setAttribute('data-amy-visible', state.visible);
    }
    
    // Update size
    if (state.size !== undefined) {
      // Remove old size classes
      el.classList.remove('amy-size-small', 'amy-size-medium', 'amy-size-large', 'amy-size-full');
      el.classList.remove('amy-flex-small', 'amy-flex-medium', 'amy-flex-large', 'amy-flex-full');
      
      // Add new size class
      el.classList.add(`amy-size-${state.size}`);
      el.classList.add(`amy-flex-${state.size}`);
      el.setAttribute('data-amy-size', state.size);
      data.size = state.size;
    }
    
    // Update order
    if (state.order !== undefined) {
      el.style.order = state.order;
      el.setAttribute('data-amy-order', state.order);
      data.order = state.order;
    }
  }

  /**
   * Create the chat widget
   */
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'amy-widget';
    widget.className = config.position;
    widget.style.setProperty('--amy-z-index', config.zIndex);
    widget.style.setProperty('--amy-accent', config.accentColor);
    widget.style.setProperty('--amy-accent-rgb', config.accentRgb);
    widget.style.setProperty('--amy-bubble-size', config.bubbleSize + 'px');
    widget.style.setProperty('--amy-panel-width', config.panelWidth + 'px');
    widget.style.setProperty('--amy-panel-height', config.panelHeight + 'px');
    
    widget.innerHTML = `
      <div id="amy-panel">
        <div id="amy-header">
          <div class="avatar">A</div>
          <div class="info">
            <div class="name">Amy</div>
            <div class="subtitle">AI Assistant</div>
          </div>
          <button class="close-btn" onclick="Amy.toggle()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div id="amy-messages"></div>
        <div id="amy-input-area">
          <input type="text" id="amy-input" placeholder="Ask me to customize the layout..." />
          <button id="amy-send" onclick="Amy.send()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
      <button id="amy-bubble" onclick="Amy.toggle()">
        <span class="amy-avatar">A</span>
      </button>
    `;
    
    document.body.appendChild(widget);
    
    // Handle Enter key
    document.getElementById('amy-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  /**
   * Toggle chat panel
   */
  function toggle() {
    isOpen = !isOpen;
    const panel = document.getElementById('amy-panel');
    panel.classList.toggle('open', isOpen);
    
    if (isOpen) {
      document.getElementById('amy-input').focus();
    }
  }

  /**
   * Send message to backend
   */
  async function send() {
    const input = document.getElementById('amy-input');
    const message = input.value.trim();
    
    if (!message || isLoading) return;
    
    input.value = '';
    addMessage('user', message);
    
    isLoading = true;
    showTyping(true);
    
    try {
      // Build layout description
      const layoutDesc = buildLayoutDescription();
      
      const response = await fetch(`${config.apiUrl}/chat?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          layoutDescription: layoutDesc,
          currentUI: {
            theme: config.theme,
            language: config.language,
            accentColor: config.accentColor
          }
        })
      });
      
      const data = await response.json();
      
      showTyping(false);
      addMessage('assistant', data.message);
      
      // Apply UI changes
      if (data.uiChanges) {
        applyUIChanges(data.uiChanges);
      }
      
    } catch (error) {
      console.error('[Amy SDK] Error:', error);
      showTyping(false);
      addMessage('assistant', "Sorry, I'm having trouble connecting. Please try again.");
    } finally {
      isLoading = false;
    }
  }

  /**
   * Build layout description for AI context
   */
  function buildLayoutDescription() {
    const parts = [];
    const visible = [];
    const hidden = [];
    
    elements.forEach((data, name) => {
      if (data.visible) {
        visible.push(`${name} (size: ${data.size}, order: ${data.order})`);
      } else {
        hidden.push(name);
      }
    });
    
    parts.push(`CURRENT LAYOUT - Visible elements: ${visible.join(', ') || 'none'}`);
    parts.push(`Hidden elements: ${hidden.join(', ') || 'none'}`);
    parts.push(`Theme: ${config.theme}, Accent: ${config.accentColor}`);
    
    return parts.join('. ');
  }

  /**
   * Apply UI changes from AI response
   */
  function applyUIChanges(changes) {
    if (config.debug) {
      console.log('[Amy SDK] Applying changes:', changes);
    }
    
    // Handle component changes
    if (changes.components) {
      Object.entries(changes.components).forEach(([name, value]) => {
        if (typeof value === 'boolean') {
          applyElementState(name, { visible: value });
        } else if (typeof value === 'object') {
          applyElementState(name, value);
        }
      });
    }
    
    // Handle theme change
    if (changes.theme) {
      config.theme = changes.theme;
      document.body.classList.remove('amy-theme-dark', 'amy-theme-light');
      document.body.classList.add(`amy-theme-${changes.theme}`);
      
      // Dispatch event for website to handle
      dispatchEvent('themeChange', { theme: changes.theme });
    }
    
    // Handle accent color change
    if (changes.accentColor) {
      config.accentColor = changes.accentColor;
      config.accentRgb = hexToRgb(changes.accentColor);
      const widget = document.getElementById('amy-widget');
      widget.style.setProperty('--amy-accent', changes.accentColor);
      widget.style.setProperty('--amy-accent-rgb', config.accentRgb);
      
      dispatchEvent('accentColorChange', { color: changes.accentColor });
    }
    
    // Handle language change
    if (changes.language) {
      config.language = changes.language;
      document.documentElement.lang = changes.language;
      
      dispatchEvent('languageChange', { language: changes.language });
    }
    
    // Dispatch general change event
    dispatchEvent('uiChange', changes);
  }

  /**
   * Add message to chat
   */
  function addMessage(role, content) {
    messages.push({ role, content, time: new Date() });
    
    const container = document.getElementById('amy-messages');
    const msg = document.createElement('div');
    msg.className = `amy-message ${role}`;
    msg.innerHTML = `
      ${escapeHtml(content)}
      <div class="time">${formatTime(new Date())}</div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Show/hide typing indicator
   */
  function showTyping(show) {
    const container = document.getElementById('amy-messages');
    let typing = container.querySelector('.amy-typing');
    
    if (show && !typing) {
      typing = document.createElement('div');
      typing.className = 'amy-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(typing);
      container.scrollTop = container.scrollHeight;
    } else if (!show && typing) {
      typing.remove();
    }
  }

  /**
   * Observe DOM for new amy elements
   */
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      let shouldRediscover = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.hasAttribute && node.hasAttribute('data-amy') || node.querySelector && node.querySelector('[data-amy]'))) {
            shouldRediscover = true;
          }
        });
      });
      
      if (shouldRediscover) {
        discoverElements();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Dispatch custom event
   */
  function dispatchEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(`amy:${name}`, { detail }));
  }

  /**
   * Utility: Hex to RGB
   */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
      : '255,68,79';
  }

  /**
   * Utility: Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  /**
   * Utility: Format time
   */
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Public API
  window.Amy = {
    init,
    toggle,
    send,
    
    // Manual control methods
    show: (name) => applyElementState(name, { visible: true }),
    hide: (name) => applyElementState(name, { visible: false }),
    resize: (name, size) => applyElementState(name, { size }),
    reorder: (name, order) => applyElementState(name, { order }),
    setTheme: (theme) => applyUIChanges({ theme }),
    setAccentColor: (color) => applyUIChanges({ accentColor: color }),
    
    // Get current state
    getElements: () => Object.fromEntries(elements),
    getConfig: () => ({ ...config }),
    
    // Refresh elements
    refresh: discoverElements
  };

})(window, document);

