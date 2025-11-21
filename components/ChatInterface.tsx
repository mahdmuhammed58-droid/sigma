import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "Hello! I'm PyChat. I can help you write complex Python code, debug issues, or architect full-stack applications. How can I assist you today?",
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to persist the chat session across renders
  const chatSession = useRef(createChatSession());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    // Add placeholder for streaming
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      const stream = await sendMessageStream(chatSession.current, userMsg.text);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;

        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: fullText, isThinking: false }
            : msg
        ));
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, text: "**Error:** Failed to generate response. Please try again.", isThinking: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-md ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.isThinking && msg.text.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span>Thinking...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                   <ReactMarkdown
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match;
                        return !isInline ? (
                          <div className="relative group mt-4 mb-4 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700 text-xs text-slate-400 font-mono">
                              <span>{match?.[1] || 'code'}</span>
                            </div>
                            <div className="overflow-x-auto p-4">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </div>
                          </div>
                        ) : (
                          <code className="bg-slate-700/50 px-1.5 py-0.5 rounded text-amber-300 font-mono text-sm" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                   >
                    {msg.text}
                   </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask PyChat about code, architecture, or bugs..."
            className="w-full bg-slate-800 text-slate-200 rounded-xl pl-5 pr-14 py-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner placeholder-slate-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-slate-600 mt-2">
          PyChat can make mistakes. Review generated code carefully.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;