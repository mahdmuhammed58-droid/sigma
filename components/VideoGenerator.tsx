
import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('idle'); // idle, generating, complete, error
  const [progressText, setProgressText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus('generating');
    setErrorMsg(null);
    setVideoUrl(null);

    try {
      const url = await generateVideo(prompt, (msg) => setProgressText(msg));
      setVideoUrl(url);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
            Veo Video Generator <span className="text-xs font-extrabold bg-pink-600 text-white px-2 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-pink-600/40">Free Preview</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Turn your text prompts into high-definition videos using Google's Veo model.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-32 h-32 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z"/></svg>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Video Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your video idea... (e.g., 'A cinematic drone shot of a cyberpunk city at night')"
                  className="w-full h-40 bg-slate-800 text-slate-100 rounded-xl p-4 border border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={status === 'generating' || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {status === 'generating' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Generating...
                  </>
                ) : (
                  'Generate Video (Free)'
                )}
              </button>
            </form>
          </div>
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-sm text-blue-200 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>
              <strong>Tip:</strong> Be specific with lighting and camera angles for the best results. The model generates 1080p video.
            </p>
          </div>
        </div>

        {/* Preview/Result Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {status === 'idle' && (
              <div className="text-center text-slate-500">
                <div className="text-7xl mb-4 opacity-20 animate-pulse">🎬</div>
                <p>Your generated video will appear here.</p>
              </div>
            )}

            {status === 'generating' && (
              <div className="flex flex-col items-center text-center z-10">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-2xl">✨</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Creating Magic</h3>
                <p className="text-slate-400 text-sm max-w-xs animate-pulse">{progressText}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center text-red-400 p-4">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold mb-2">Generation Failed</h3>
                <p className="text-sm opacity-80">{errorMsg}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-sm text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === 'complete' && videoUrl && (
              <div className="w-full h-full flex flex-col animate-fade-in">
                <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 shadow-2xl flex-1 group">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <a 
                    href={videoUrl} 
                    download={`veo-generation-${Date.now()}.mp4`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm shadow-lg shadow-green-600/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download MP4 (Free)
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
