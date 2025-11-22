import React, { useState } from 'react';
import { ImageState, ImageSize } from '../types';
import { generateProImage, checkApiKey, requestApiKey } from '../services/geminiService';
import { Image as ImageIcon, Download, Settings, Wand2, AlertCircle } from 'lucide-react';

const ImageMode: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    prompt: '',
    generatedImageUrl: null,
    isLoading: false,
    size: '1K',
  });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!state.prompt.trim()) return;
    setError(null);
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 1. Check API Key
      const hasKey = await checkApiKey();
      if (!hasKey) {
        await requestApiKey();
      }

      // 2. Generate
      const imageUrl = await generateProImage(state.prompt, state.size);
      setState(prev => ({ ...prev, isLoading: false, generatedImageUrl: imageUrl }));
      
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found") || e.message?.includes("404")) {
          await requestApiKey();
          setError("Authorization failed. Please select a valid project/key and try again.");
      } else {
          setError("Failed to generate image. Please try again.");
      }
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 md:pb-8 flex flex-col md:flex-row gap-8 h-[calc(100vh-100px)]">
      
      {/* Controls Column */}
      <div className="flex-1 flex flex-col justify-center max-w-md">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold mb-4 border border-purple-100 uppercase tracking-widest">
            <Wand2 size={12} />
            Coki Create
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Imagine with <span className="text-purple-600">Coki</span>.
          </h1>
          <p className="text-slate-600">
            Generate high-fidelity visuals using our pro-level models. Select your preferred resolution and let Coki create.
          </p>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prompt</label>
            <textarea
              value={state.prompt}
              onChange={(e) => setState({ ...state, prompt: e.target.value })}
              placeholder="A futuristic city made of crystal, golden hour lighting..."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Settings size={16} /> Image Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setState({ ...state, size })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                    state.size === size
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={state.isLoading || !state.prompt}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {state.isLoading ? (
              <>Generating...</>
            ) : (
              <>
                <ImageIcon size={20} /> Generate Image
              </>
            )}
          </button>
        </div>
        
        <p className="mt-4 text-xs text-center text-slate-400">
           Coki generation requires a selected paid API Key from a Google Cloud Project.
        </p>
      </div>

      {/* Preview Column */}
      <div className="flex-1 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group min-h-[400px] shadow-inner">
        {state.generatedImageUrl ? (
          <>
            <img 
              src={state.generatedImageUrl} 
              alt="Generated content" 
              className="w-full h-full object-contain animate-fade-in"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <a 
                href={state.generatedImageUrl} 
                download={`coki-generated-${Date.now()}.png`}
                className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors"
              >
                <Download size={20} /> Download
              </a>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400 p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <ImageIcon size={32} />
            </div>
            <p className="font-medium text-slate-600">Your Coki masterpiece awaits</p>
            <p className="text-sm mt-2 text-slate-400">Select size and click generate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageMode;