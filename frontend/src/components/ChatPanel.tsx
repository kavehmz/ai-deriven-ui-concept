import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Quick action suggestions
  const suggestions = [
    { label: '🌙 Dark mode', message: 'Switch to dark mode' },
    { label: '☀️ Light mode', message: 'Switch to light mode' },
    { label: '🇪🇸 Español', message: 'Cambia a español' },
    { label: '📊 Show all', message: 'Show me everything' },
    { label: '🔤 Bigger text', message: 'Make the text bigger' },
    { label: '🎨 Green theme', message: 'Change color to green' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass rounded-2xl flex flex-col overflow-hidden ${
        isExpanded ? 'h-full' : 'h-auto'
      }`}
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
            <h2 className="font-semibold">Amy</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
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
                    className={`max-w-[80%] rounded-2xl p-3 ${
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
        </>
      )}
    </motion.div>
  );
}

