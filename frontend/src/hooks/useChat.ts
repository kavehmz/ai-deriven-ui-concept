import { useState, useCallback } from 'react';
import { ChatMessage, ChatResponse, LayoutState, UIChange, UserContext } from '../types';

// Use relative URL so it works with any domain/proxy setup
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface UseChatOptions {
  onUIChanges: (changes: UIChange[]) => void;
  getLayoutState: () => LayoutState;
  getUserContext: () => UserContext;
}

export function useChat({ onUIChanges, getLayoutState, getUserContext }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Amy, your trading assistant! 👋\n\n**New here?** Say \"I'm a beginner\" for a guided tour to place your first trade!\n\n**Experienced?** Say \"Expert tour\" to explore all features.\n\nI can also customize your workspace, change themes, and answer any trading questions. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const layoutState = getLayoutState();
        const userContext = getUserContext();
        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            layoutState,
            userContext,
            conversationHistory,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data: ChatResponse = await response.json();
        console.log('[Amy] Response from backend:', JSON.stringify(data, null, 2));

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Apply UI changes
        if (data.uiChanges && data.uiChanges.length > 0) {
          console.log('[Amy] Calling onUIChanges with:', data.uiChanges);
          
          // Handle navigation separately
          for (const change of data.uiChanges) {
            if (change.action === 'navigate' && change.url) {
              console.log('[Amy] Navigating to:', change.url);
              window.open(change.url, '_blank');
            }
          }
          
          // Apply other UI changes
          const nonNavigateChanges = data.uiChanges.filter(c => c.action !== 'navigate');
          if (nonNavigateChanges.length > 0) {
            onUIChanges(nonNavigateChanges);
          }
        } else {
          console.log('[Amy] No UI changes to apply');
        }

        // Show notification if chat is closed
        if (!isOpen) {
          setHasNewMessage(true);
        }
      } catch (error) {
        console.error('Chat error:', error);
        
        // Add error message
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, getLayoutState, getUserContext, onUIChanges, isOpen]
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasNewMessage(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm Amy, your trading assistant! 👋\n\n**New here?** Say \"I'm a beginner\" for a guided tour to place your first trade!\n\n**Experienced?** Say \"Expert tour\" to explore all features.\n\nI can also customize your workspace, change themes, and answer any trading questions. What would you like to do?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    hasNewMessage,
    sendMessage,
    openChat,
    closeChat,
    toggleChat,
    clearHistory,
  };
}

