import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatTabProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => void;
  isAiTyping: boolean;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  chatHistory,
  onSendMessage,
  onClearHistory,
  isAiTyping,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');
    await onSendMessage(textToSend);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiTyping]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] pb-16 animate-fade-in px-4">
      {/* Header bar */}
      <div className="flex items-center justify-between py-4 border-b border-rose-50 flex-none bg-white">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-sm">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800">DearDiary AI</h1>
            <p className="text-[10px] text-gray-400 font-medium">Your empathetic reflection space</p>
          </div>
        </div>

        {/* Clear chat history button */}
        {chatHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-xs mx-auto space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">Reflect with DearDiary AI</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Think of me as a warm, safe mirror for your thoughts. Share your day, your worries, or any joys. I'm always here to listen.
            </p>
          </div>
        ) : (
          chatHistory.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-rose-500 text-white rounded-br-none'
                      : 'bg-rose-50/55 border border-rose-100 text-gray-700 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`text-[8px] font-mono mt-1.5 block text-right ${
                      isUser ? 'text-rose-200' : 'text-gray-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-rose-50/55 border border-rose-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at bottom */}
      <form onSubmit={handleSend} className="flex-none pt-2 bg-white pb-safe-bottom">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share your thoughts or write a log..."
            disabled={isAiTyping}
            className="w-full text-xs rounded-2xl border border-rose-100 px-5 py-4.5 pr-14 focus:border-rose-400 focus:outline-none bg-rose-50/10 placeholder-gray-400 shadow-sm"
          />
          <button
            type="submit"
            disabled={isAiTyping || !inputText.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};
