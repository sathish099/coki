import React, { useState, useRef, useEffect } from 'react';
import { ChatState, ChatMessage } from '../types';
import { streamChat } from '../services/geminiService';
import { Send, User, Bot, Sparkles, StopCircle } from 'lucide-react';

const ChatMode: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    input: '',
  });
  
  // Use ref to keep track of current message being built during streaming
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.input.trim() || state.isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: state.input };
    const initialBotMsg: ChatMessage = { role: 'model', text: '' };
    
    // Optimistic update
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg, initialBotMsg],
      input: '',
      isLoading: true
    }));

    try {
      // Create a local variable to accumulate the stream text
      let fullText = '';
      
      await streamChat(
        [...state.messages, userMsg], // Current history excluding the empty bot placeholder
        userMsg.text,
        (chunkText) => {
          fullText += chunkText;
          setState(prev => {
            const newMessages = [...prev.messages];
            // Update the last message (the bot placeholder)
            newMessages[newMessages.length - 1] = { role: 'model', text: fullText };
            return { ...prev, messages: newMessages };
          });
        }
      );
    } catch (error) {
      console.error(error);
      setState(prev => {
         const newMessages = [...prev.messages];
         newMessages[newMessages.length - 1] = { role: 'model', text: "I'm having trouble connecting right now. Please try again." };
         return { ...prev, messages: newMessages };
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] flex flex-col bg-white/60 md:border border-slate-200 md:rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg shadow-sm">
                <Sparkles size={20} className="text-white" />
            </div>
            <div>
                <h2 className="font-bold text-slate-900">Coki Chat</h2>
                <p className="text-xs text-slate-500">Advanced reasoning & coding capable</p>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {state.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
                <Bot size={32} className="text-slate-400" />
            </div>
            <p className="font-medium">Start a conversation with Coki</p>
          </div>
        )}
        
        {state.messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
             {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">
                    <Bot size={16} className="text-green-600" />
                </div>
             )}

             <div className={`max-w-[85%] md:max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
             }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.text}</p>
             </div>

             {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-slate-500" />
                </div>
             )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
                type="text"
                value={state.input}
                onChange={(e) => setState({ ...state, input: e.target.value })}
                placeholder="Message Coki..."
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            <button 
                type="submit" 
                disabled={!state.input.trim() || state.isLoading}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
            >
                {state.isLoading ? <StopCircle size={20} className="animate-pulse" /> : <Send size={20} />}
            </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
            Coki may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  );
};

export default ChatMode;