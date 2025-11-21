
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { createChatSession, sendMessageStream, generateSpeech } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// Helper component for Code Blocks with Preview
const CodeBlock = ({ language, code }: { language: string, code: string }) => {
  const [showPreview, setShowPreview] = useState(false);
  // Only allow preview for HTML to avoid trying to render Python/JS backend code which won't work
  const isPreviewable = language?.toLowerCase() === 'html';

  return (
    <>
      <div className="relative group mt-4 mb-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50 shadow-xl transition-all hover:border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 backdrop-blur border-b border-slate-700/50">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">{language || 'text'}</span>
          </div>
          
           <div className="flex items-center gap-2">
              {isPreviewable && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md transition-all"
                  title="Open Live Preview"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Preview
                </button>
              )}

             <button 
                onClick={() => {
                    navigator.clipboard.writeText(code);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-md transition-colors"
                title="Copy code"
             >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto p-4 bg-slate-950/50">
          <code className={`!bg-transparent !p-0 font-mono text-sm text-blue-100/90`}>
            {code}
          </code>
        </div>
      </div>

      {/* 3D Preview Window Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 md:p-10 transition-opacity duration-300">
           <div className="w-full max-w-6xl h-[85vh] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl shadow-black flex flex-col relative overflow-hidden ring-1 ring-white/10 transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out]">
              
              {/* Window Title Bar */}
              <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0 select-none cursor-default">
                 <div className="flex gap-2 items-center">
                    <button onClick={() => setShowPreview(false)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer shadow-inner group relative flex items-center justify-center">
                       <span className="hidden group-hover:block text-[8px] text-red-900 font-bold">✕</span>
                    </button>
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-inner" />
                 </div>
                 <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
                    <span className="opacity-50">Live Preview</span>
                 </div>
                 <div className="w-14 flex justify-end">
                 </div>
              </div>

              {/* Browser Chrome / Toolbar (Mock) */}
              <div className="h-9 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-3 shrink-0">
                 <div className="flex gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <svg className="w-4 h-4 hover:text-slate-400 cursor-pointer transition-colors" onClick={() => { const f = document.querySelector('iframe'); if(f) f.srcdoc = code; }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 </div>
                 <div className="flex-1 bg-slate-950 rounded-md h-6 flex items-center px-3 text-xs text-slate-500 border border-slate-800 font-mono">
                    about:blank
                 </div>
              </div>

              {/* Iframe Content */}
              <div className="flex-1 bg-white relative">
                <iframe
                  srcDoc={code}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin allow-top-navigation-by-user-activation allow-downloads-without-user-activation"
                />
              </div>
           </div>
           
           {/* Backdrop Close Click Area */}
           <div className="absolute inset-0 -z-10" onClick={() => setShowPreview(false)} />
        </div>
      )}
    </>
  );
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "Hello! I'm PyChat. Toggle 'Code Mode' for complex engineering tasks, or use 'Research' to access the web. You can also talk to me!",
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Config Toggles
  const [isCodeMode, setIsCodeMode] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Use a ref to persist the chat session
  const chatSession = useRef(createChatSession(isCodeMode, isSearchEnabled));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-initialize chat when modes change
  useEffect(() => {
    chatSession.current = createChatSession(isCodeMode, isSearchEnabled);
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: `Switched to ${isCodeMode ? 'Code Mode (Deep Thinking)' : 'Standard Mode'}${isSearchEnabled ? ' with Research' : ''}.`,
      timestamp: Date.now()
    }]);
  }, [isCodeMode, isSearchEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        alert("Voice input is not supported in this browser. Please use Chrome.");
      }
    }
  };

  const handleSpeakLastResponse = async () => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && m.text);
    if (!lastModelMessage) return;

    setIsSpeaking(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      // Clean text for speech (remove code blocks for better audio flow)
      const textToSpeak = lastModelMessage.text.replace(/```[\s\S]*?```/g, "Code block omitted for brevity.").substring(0, 4000);

      const audioData = await generateSpeech(textToSpeak);
      
      if (audioData && audioContextRef.current) {
        const buffer = await audioContextRef.current.decodeAudioData(audioData.buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
        source.onended = () => setIsSpeaking(false);
      } else {
         setIsSpeaking(false);
      }
    } catch (e) {
      console.error("TTS Error", e);
      setIsSpeaking(false);
    }
  };

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
      isThinking: isCodeMode // Show thinking indicator only in Code Mode
    }]);

    try {
      const stream = await sendMessageStream(chatSession.current, userMsg.text);
      
      let fullText = '';
      let groundingSources: { title: string; uri: string }[] = [];
      
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;

        // Check for grounding metadata (search results)
        // @ts-ignore - groundingMetadata type might differ in raw response vs SDK type
        const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          chunks.forEach((chunk: any) => {
             if (chunk.web?.uri && chunk.web?.title) {
               // Avoid duplicates
               if (!groundingSources.find(s => s.uri === chunk.web.uri)) {
                 groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
               }
             }
          });
        }

        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: fullText, isThinking: false, groundingSources: groundingSources.length > 0 ? groundingSources : undefined }
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
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex flex-wrap items-center gap-4 justify-between z-10">
         <div className="flex items-center gap-2">
           <span className="font-semibold text-slate-300 text-sm hidden sm:block">Mode:</span>
           <button 
             onClick={() => setIsCodeMode(true)}
             className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isCodeMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
           >
             Code 🧠
           </button>
           <button 
             onClick={() => setIsCodeMode(false)}
             className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!isCodeMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
           >
             Not Code ⚡
           </button>
         </div>

         <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isSearchEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <input type="checkbox" checked={isSearchEnabled} onChange={(e) => setIsSearchEnabled(e.target.checked)} className="hidden" />
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isSearchEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">Research 🌐</span>
            </label>
         </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 shadow-md ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.isThinking && msg.text.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span>{isCodeMode ? "Thinking deeply..." : "Typing..."}</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                   <ReactMarkdown
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match;
                        const codeContent = String(children).replace(/\n$/, '');

                        return !isInline ? (
                          <CodeBlock language={match?.[1] || 'text'} code={codeContent} />
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

                   {/* Grounding Sources */}
                   {msg.groundingSources && msg.groundingSources.length > 0 && (
                     <div className="mt-4 pt-3 border-t border-slate-700/50">
                       <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Sources:</p>
                       <div className="flex flex-wrap gap-2">
                         {msg.groundingSources.map((source, idx) => (
                           <a 
                             key={idx} 
                             href={source.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/50 hover:bg-slate-700 border border-slate-700 rounded-md text-xs text-blue-300 transition-colors"
                           >
                             <span className="truncate max-w-[150px]">{source.title}</span>
                             <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                           </a>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex gap-2 items-center">
          
          {/* Text Input */}
          <div className="relative flex-1">
             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isCodeMode ? "Ask for complex code, architecture, or debugging..." : "Ask a quick question..."}
                className="w-full bg-slate-800 text-slate-200 rounded-xl pl-5 pr-12 py-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner placeholder-slate-500 transition-all"
                disabled={isLoading}
              />
              
              {/* Microphone Button (Inside Input) */}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                title="Voice Input (Talk to Code)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 9.375v3a.75.75 0 01-1.5 0v-3A6.751 6.751 0 015.25 12.75v-1.5a.75.75 0 01.75-.75z" />
                </svg>
              </button>
          </div>

          {/* TTS Button */}
          <button
            type="button"
            onClick={handleSpeakLastResponse}
            disabled={isSpeaking}
            className={`p-4 rounded-xl bg-slate-800 border border-slate-700 transition-all ${isSpeaking ? 'text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
            title="Read Aloud (Text to Speech)"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-slate-600 mt-2">
          {isCodeMode ? "Using Gemini 3 Pro (Thinking)" : "Using Gemini 2.5 Flash (Fast)"} • "Talk" to input • "Listen" to hear response.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
