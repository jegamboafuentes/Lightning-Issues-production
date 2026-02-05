import React, { useState } from 'react';
import { Search, Loader2, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface RepoInputProps {
  onAnalyze: (url: string, goals: string, scanTodos: boolean) => void;
  isLoading: boolean;
  hasData?: boolean;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onAnalyze, isLoading, hasData }) => {
  const [url, setUrl] = useState('');
  const [goals, setGoals] = useState('');
  const [scanTodos, setScanTodos] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim(), goals, scanTodos);
    }
  };

  const handleRegenerate = () => {
    if (url.trim()) {
      onAnalyze(url.trim(), goals, scanTodos);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-github-text mb-4 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-github-accent to-purple-400">Lightning Issues</span>
        </h2>
        <p className="text-github-secondary text-base sm:text-lg px-2 max-w-xl mx-auto">
          Enrique was here! The fastest way to generate high-quality GitHub issues. Streamline your open source contributions and get ready to earn rewards on <strong>Lightning Bounties</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group px-2 sm:px-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-github-accent to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 hidden sm:block"></div>
        
        <div className="relative bg-github-card border border-github-border rounded-lg shadow-2xl overflow-hidden">
          
          {/* Main Input Area - Responsive Layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2">
            
            <div className="flex-1 flex items-center bg-github-page/50 sm:bg-transparent rounded-md border border-github-border sm:border-none px-2 sm:px-0">
              <div className="pl-2 pr-2 text-github-secondary">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/lightning-bounties/example"
                className="flex-1 bg-transparent border-none text-github-text placeholder-gray-500 focus:ring-0 text-base sm:text-lg py-3 outline-none w-full min-w-0"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2 sm:contents">
              {hasData && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isLoading || !url}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-github-text bg-github-page border border-github-border hover:border-github-accent hover:text-github-accent transition-all active:scale-95 whitespace-nowrap"
                  title="Generate new suggestions based on the same inputs"
                >
                  <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Regenerate</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !url}
                className={`
                  flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-white transition-all w-full sm:w-auto
                  ${isLoading || !url 
                    ? 'bg-github-border text-gray-500 cursor-not-allowed' 
                    : 'bg-github-primary hover:bg-github-primaryHover shadow-lg shadow-green-900/20 active:scale-95'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Options Toggler */}
          <div className="border-t border-github-border">
             <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3 text-sm font-medium text-github-secondary hover:text-github-text hover:bg-github-dark/40 transition-all active:bg-github-dark/60"
             >
                <span className="flex items-center gap-2">
                    Advanced Options
                    {showAdvanced && <span className="text-xs bg-github-accent/10 text-github-accent px-2 py-0.5 rounded-full">Active</span>}
                </span>
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
             </button>
          </div>

          {/* Advanced Options Content */}
          {showAdvanced && (
            <div className="p-4 sm:p-6 bg-github-dark/30 space-y-5 animate-in slide-in-from-top-2 duration-200 border-t border-github-border">
                {/* Project Goals */}
                <div className="space-y-2">
                    <label htmlFor="goals" className="block text-sm font-semibold text-github-text">
                        Project Goals <span className="text-github-secondary font-normal text-xs ml-1">(Optional)</span>
                    </label>
                    <textarea
                        id="goals"
                        rows={3}
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="e.g., 'I want to improve performance' or 'Make the codebase more maintainable for new developers.'"
                        className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-700 rounded-md p-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all resize-y"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-github-secondary">Provide extra context to help the AI tailor its suggestions to your specific needs.</p>
                </div>

                {/* Scan for TODOs */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <span className="block text-sm font-semibold text-github-text">Scan for TODOs</span>
                        <span className="block text-xs text-github-secondary mt-0.5">Create issues from // TODO: comments found in the code.</span>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => setScanTodos(!scanTodos)}
                        className={`
                            relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-2 focus:ring-offset-github-card
                            ${scanTodos ? 'bg-github-accent' : 'bg-github-border'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm
                                ${scanTodos ? 'translate-x-6' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
