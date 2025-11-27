import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { ChatMessage, translations } from '../types';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  language: string;
  primaryColor: string;
}

export function ChatPanel({ messages, isLoading, onSendMessage, language, primaryColor }: Props) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-open on first load
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Quick action suggestions
  const suggestions = [
    { label: '🌙 Dark', message: 'Switch to dark mode' },
    { label: '☀️ Light', message: 'Switch to light mode' },
    { label: '🇪🇸 Español', message: 'Cambia a español' },
    { label: '📊 Show all', message: 'Show me everything' },
    { label: '🔤 Bigger', message: 'Make the text bigger' },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-50"
            style={{ backgroundColor: primaryColor, boxShadow: `0 4px 20px ${primaryColor}66` }}
          >
            <Sparkles className="w-6 h-6" />
            {/* Notification dot for new messages */}
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] glass rounded-2xl flex flex-col overflow-hidden shadow-2xl z-50"
            style={{ boxShadow: `0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px ${primaryColor}33` }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
              style={{ borderColor: `${primaryColor}33` }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}33` }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Amy</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI UI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}33` }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1 bg-white/10 dark:bg-black/20 rounded-2xl rounded-tl-none p-3">
                      <p className="text-sm">{t.welcomeMessage}</p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-2 pl-11">
                    {suggestions.map((suggestion) => (
                      <motion.button
                        key={suggestion.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSendMessage(suggestion.message)}
                        className="px-3 py-1.5 text-xs rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
                      >
                        {suggestion.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Chat messages */}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-gray-200 dark:bg-gray-700' 
                          : ''
                      }`}
                      style={message.role === 'assistant' ? { backgroundColor: `${primaryColor}33` } : {}}
                    >
                      {message.role === 'assistant' ? (
                        <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div 
                      className={`max-w-[75%] rounded-2xl p-3 ${
                        message.role === 'user'
                          ? 'rounded-tr-none text-white'
                          : 'bg-white/10 dark:bg-black/20 rounded-tl-none'
                      }`}
                      style={message.role === 'user' ? { backgroundColor: primaryColor } : {}}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}33` }}
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" style={{ color: primaryColor }} />
                  </div>
                  <div className="bg-white/10 dark:bg-black/20 rounded-2xl rounded-tl-none p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.typeMessage}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 text-sm border-none outline-none focus:ring-2 transition-all disabled:opacity-50"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl text-white disabled:opacity-50 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
