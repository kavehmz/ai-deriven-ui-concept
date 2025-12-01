import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, UIState, Language, translations } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string, currentUI: UIState) => void;
  currentUI: UIState;
  accentColor: string;
  language: Language;
  layoutDescription: string;
}

export const ChatPanel = memo(function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  currentUI,
  accentColor,
  language,
  layoutDescription
}: ChatPanelProps) {
  void layoutDescription; // Used in currentUI context
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), currentUI);
      setInput('');
    }
  };

  return (
    <div className="chat-floating" dir="ltr">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="chat-panel"
          >
            {/* Header */}
            <div 
              className="flex items-center gap-3 p-4 border-b border-deriv-border dark:border-deriv-border light:border-deriv-lightBorder"
              style={{ background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 100%)` }}
            >
              <div className="amy-avatar w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: accentColor }}>
                A
              </div>
              <div className="flex-1">
                <div className="font-semibold">Amy</div>
                <div className="text-xs text-deriv-text">AI Trading Assistant</div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[320px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'accent-bg text-white rounded-br-sm'
                        : 'bg-white/10 dark:bg-white/10 light:bg-black/5 rounded-bl-sm'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-deriv-text'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-deriv-border dark:border-deriv-border light:border-deriv-lightBorder">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 input-field text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: accentColor }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-bubble"
        style={{ background: accentColor }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.div
              key="amy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-white font-bold text-xl"
            >
              A
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
});

