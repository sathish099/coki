import React, { useState, useEffect, useRef } from 'react';
import { SearchState } from '../types';
import { performSearch } from '../services/geminiService';
import { Search, Globe, ArrowRight, ExternalLink, Loader2, Sparkles, Clock, Trash2, Mic, MicOff } from 'lucide-react';

const SearchMode: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    summary: '',
    isLoading: false,
    hasSearched: false,
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize history from localStorage
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('coki_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  // Cleanup recognition on unmount to prevent memory leaks or background listening
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const addToHistory = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setHistory(prev => {
      const newHistory = [cleanTerm, ...prev.filter(q => q !== cleanTerm)].slice(0, 8);
      localStorage.setItem('coki_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('coki_search_history');
  };

  const executeSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;

    // Update state to show loading
    setState((prev) => ({ 
      ...prev, 
      query: queryToSearch, 
      isLoading: true, 
      hasSearched: true, 
      results: [], 
      summary: '' 
    }));

    // Save to history
    addToHistory(queryToSearch);

    try {
      const { summary, links } = await performSearch(queryToSearch);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        summary,
        results: links,
      }));
    } catch (error) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        summary: "An error occurred while searching. Please try again.",
      }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(state.query);
  };

  const handleVoiceInput = () => {
    // If currently listening, stop the existing instance manually
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return; 
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setState(prev => ({ ...prev, query: transcript }));
      };

      recognition.onerror = (event: any) => {
        // 'aborted' happens when we stop manually, so we ignore it to prevent error noise
        if (event.error !== 'aborted') {
            console.error('Speech recognition error', event.error);
        }
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
        setIsListening(false);
      }
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24 md:pb-8">
      {/* Search Header / Input */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col items-center ${state.hasSearched ? 'mt-4 md:mt-8' : 'mt-[20vh] md:mt-[30vh]'}`}>
        {!state.hasSearched && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4 border border-blue-100 tracking-widest uppercase">
              <Sparkles size={10} />
              Powered by Coki AI
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
              What can <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Coki</span> find for you?
            </h1>
          </div>
        )}
        
        <form onSubmit={handleSearch} className="w-full relative group z-20">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={`text-slate-400 ${state.isLoading ? 'opacity-0' : 'opacity-100'}`} />
            {state.isLoading && <Loader2 className="absolute text-blue-600 animate-spin" />}
          </div>
          
          <input
            type="text"
            value={state.query}
            onChange={(e) => setState({ ...state, query: e.target.value })}
            placeholder={isListening ? "Listening..." : "Search with Coki..."}
            className={`w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 text-slate-900 rounded-2xl py-4 pl-12 pr-28 text-lg shadow-lg shadow-slate-200/50 focus:shadow-xl transition-all outline-none placeholder:text-slate-400 ${isListening ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          />
          
          <div className="absolute inset-y-2 right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title="Voice Search"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button 
              type="submit"
              disabled={state.isLoading || !state.query.trim()}
              className="p-2 bg-slate-100 hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-white"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        {/* History Section - Only visible when not searched yet */}
        {!state.hasSearched && history.length > 0 && (
          <div className="w-full mt-6 animate-fade-in px-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Recent Searches</h3>
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSearch(term)}
                  className="group flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm rounded-xl text-sm text-slate-600 transition-all"
                >
                  <Clock size={14} className="text-slate-400 group-hover:text-blue-400" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      {state.hasSearched && (
        <div className="mt-8 space-y-8 animate-fade-in">
          
          {/* AI Overview */}
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <Globe size={24} />
              <h2 className="text-xl font-semibold">Coki Overview</h2>
            </div>
            
            <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {state.isLoading && !state.summary ? (
                 <div className="space-y-3 animate-pulse">
                   <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                   <div className="h-4 bg-slate-200 rounded w-full"></div>
                   <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                 </div>
              ) : (
                state.summary
              )}
            </div>
          </div>

          {/* Source Links */}
          {state.results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider pl-1">Coki Sources</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {state.results.map((result, idx) => (
                  <a
                    key={`${result.url}-${idx}`}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-500 transition-colors">
                      <ExternalLink size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">{result.title}</h4>
                      <p className="text-sm text-slate-500 truncate mt-1">{result.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchMode;