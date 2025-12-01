import { useState, useCallback } from 'react';
import { ChatMessage, ChatResponse, UIState, ComponentSize } from '../types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '/api';

// Generate layout description for AI context
function generateLayoutDescription(ui: UIState): string {
  const sizeNames: Record<ComponentSize, string> = {
    small: 'small (1/4 width)',
    medium: 'medium (1/2 width)', 
    large: 'large (3/4 width)',
    full: 'full width'
  };
  
  const componentNames: Record<string, string> = {
    chart: 'Price Chart',
    positions: 'Open Positions',
    watchlist: 'Watchlist',
    orderPanel: 'Order Panel',
    marketOverview: 'Market Overview',
    news: 'News Feed',
    portfolio: 'Portfolio',
    clock: 'World Clock',
    calculator: 'Calculator'
  };

  const sorted = Object.entries(ui.components)
    .filter(([, config]) => config.visible)
    .sort((a, b) => a[1].order - b[1].order);
  
  const visible = sorted.map(([key, config]) => 
    `${componentNames[key]} (${sizeNames[config.size as ComponentSize]}, position ${config.order})`
  ).join('; ');
  
  const hidden = Object.entries(ui.components)
    .filter(([, config]) => !config.visible)
    .map(([key]) => componentNames[key])
    .join(', ');
  
  return `CURRENT LAYOUT - Visible (in order): ${visible || 'none'}. Hidden: ${hidden || 'none'}. Theme: ${ui.theme}. Language: ${ui.language}. Accent color: ${ui.accentColor}.`;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string, currentUI: UIState) => Promise<ChatResponse | null>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Amy, your AI trading assistant. I can help customize your trading interface. Try asking me to:\n\n• \"Switch to dark/light theme\"\n• \"Hide the news panel\"\n• \"Show me a simple layout\"\n• \"Set up for day trading\"\n• \"Change language to Spanish\"\n\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (message: string, currentUI: UIState): Promise<ChatResponse | null> => {
    if (!message.trim()) return null;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const layoutDescription = generateLayoutDescription(currentUI);
      
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          currentUI,
          layoutDescription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: ChatResponse = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please make sure the backend is running. In the meantime, try these commands:\n\n• \"show calculator\"\n• \"hide news\"\n• \"switch to light theme\"",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared! How can I help you customize your trading interface?",
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
}

