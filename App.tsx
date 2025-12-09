import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { RepoInput } from './components/RepoInput';
import { IssueCard } from './components/IssueCard';
import { generateIssueSuggestions, parseRepoUrl } from './services/geminiService';
import { GenerateState, RepoInfo } from './types';
import { AlertCircle, ScanSearch, FileSignature, Rocket } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<GenerateState>({
    isLoading: false,
    error: null,
    data: null,
  });
  const [currentRepo, setCurrentRepo] = useState<RepoInfo | null>(null);

  const handleAnalyze = async (url: string, goals: string, scanTodos: boolean) => {
    const repoInfo = parseRepoUrl(url);
    if (!repoInfo) {
      setState(prev => ({ ...prev, error: "Please enter a valid GitHub repository URL." }));
      return;
    }

    setCurrentRepo({ ...repoInfo, url });
    setState({ isLoading: true, error: null, data: null });

    try {
      const suggestions = await generateIssueSuggestions(url, goals, scanTodos);
      setState({ isLoading: false, error: null, data: suggestions });
    } catch (err: any) {
      setState({ 
        isLoading: false, 
        error: err.message || "Something went wrong while analyzing the repository.", 
        data: null 
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <RepoInput 
          onAnalyze={handleAnalyze} 
          isLoading={state.isLoading} 
          hasData={!!state.data}
        />

        {/* Error State */}
        {state.error && (
          <div className="w-full max-w-2xl p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-200 mb-8 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="shrink-0 mt-0.5" />
            <p>{state.error}</p>
          </div>
        )}

        {/* Results List */}
        {state.data && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-github-text">Suggested Issues</h2>
              {currentRepo && (
                <a 
                    href={currentRepo.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-github-accent hover:underline text-sm font-medium"
                >
                    {currentRepo.owner}/{currentRepo.name}
                </a>
              )}
            </div>
            
            <div className="flex flex-col gap-6">
              {state.data.map((suggestion, index) => (
                <IssueCard 
                    key={index} 
                    suggestion={suggestion} 
                    repoInfo={currentRepo} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Features Section / Empty State */}
        {!state.data && !state.isLoading && !state.error && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
                {/* Feature 1 */}
                <div className="group p-6 rounded-2xl bg-github-card border border-github-border hover:border-github-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-github-accent/5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-github-dark border border-github-border flex items-center justify-center mx-auto mb-6 text-github-accent group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_-5px_var(--accent-color)]">
                        <ScanSearch size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-github-text mb-3 group-hover:text-github-accent transition-colors">Deep Analysis</h3>
                    <p className="text-sm text-github-secondary leading-relaxed">
                        We analyze the repo structure and public info to find relevant gaps using advanced AI grounding.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="group p-6 rounded-2xl bg-github-card border border-github-border hover:border-github-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-github-accent/5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-github-dark border border-github-border flex items-center justify-center mx-auto mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_-5px_#a78bfa]">
                        <FileSignature size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-github-text mb-3 group-hover:text-purple-400 transition-colors">Perfect Markdown</h3>
                    <p className="text-sm text-github-secondary leading-relaxed">
                        Issues are formatted with clear steps, reproduction guides, and proper headers ready for GitHub.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="group p-6 rounded-2xl bg-github-card border border-github-border hover:border-github-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-github-accent/5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-github-dark border border-github-border flex items-center justify-center mx-auto mb-6 text-green-500 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_-5px_#22c55e]">
                        <Rocket size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-github-text mb-3 group-hover:text-green-400 transition-colors">Instant Posting</h3>
                    <p className="text-sm text-github-secondary leading-relaxed">
                        One click opens the GitHub New Issue page with everything pre-filled. No manual copy-pasting.
                    </p>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default App;