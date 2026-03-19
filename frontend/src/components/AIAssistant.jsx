import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Bot, Send, X, MessageSquare, ChevronRight, Table as TableIcon, List as ListIcon } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello Admin! I am your AI assistant. How can I help you today? You can ask me about "absent students" or "room capacity".' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/admin/ai/query', { query: userMsg.text });
      const aiMsg = { 
        role: 'assistant', 
        text: res.data.answer, 
        data: res.data.data, 
        type: res.data.type 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please check your connection or system settings.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🚀 Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-600/40 hover:scale-110 transition active:scale-95 z-50 group border-4 border-white dark:border-gray-800"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </button>
      )}

      {/* 🤖 Chat Sidebar / Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-500 ease-in-out z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l border-gray-100 dark:border-gray-700`}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight uppercase tracking-tight">AI Assistant</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active Insight Engine</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : 'bg-gray-50 dark:bg-gray-750 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-gray-700'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                
                {/* 📊 Render Data Tables/Lists from AI */}
                {msg.data && msg.type === 'table' && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-650">
                    <table className="min-w-full text-[10px] divide-y divide-gray-200 dark:divide-gray-650">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          {Object.keys(msg.data[0]).map(key => (
                            <th key={key} className="px-2 py-1 text-left font-black uppercase text-gray-500 dark:text-gray-400">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {msg.data.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {Object.values(row).map((val, vIdx) => (
                              <td key={vIdx} className="px-2 py-1 font-medium">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AI anything..."
              className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-gray-750 border-2 border-transparent focus:border-primary-500/50 rounded-xl outline-none text-sm font-bold text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 top-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition active:scale-95 shadow-md shadow-primary-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            AI-generated insights can be inconsistent. <br/> Cross-verify critical data.
          </p>
        </form>
      </div>
    </>
  );
};

export default AIAssistant;
