import React, { useState } from 'react';
import { SearchState } from '../types';
import { performSearch } from '../services/geminiService';
import { Search, Globe, ArrowRight, ExternalLink, Loader2, Sparkles } from 'lucide-react';

const SearchMode: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    summary: '',
    isLoading: false,
    hasSearched: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.query.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true, hasSearched: true, results: [], summary: '' }));

    try {
      const { summary, links } = await performSearch(state.query);
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
        
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={`text-slate-400 ${state.isLoading ? 'opacity-0' : 'opacity-100'}`} />
            {state.isLoading && <Loader2 className="absolute text-blue-600 animate-spin" />}
          </div>
          <input
            type="text"
            value={state.query}
            onChange={(e) => setState({ ...state, query: e.target.value })}
            placeholder="Search with Coki..."
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 text-slate-900 rounded-2xl py-4 pl-12 pr-12 text-lg shadow-lg shadow-slate-200/50 focus:shadow-xl transition-all outline-none placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={state.isLoading || !state.query.trim()}
            className="absolute inset-y-2 right-2 p-2 bg-slate-100 hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-white"
          >
            <ArrowRight size={20} />
          </button>
        </form>
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