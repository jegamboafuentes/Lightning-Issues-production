import React, { useState, useEffect } from 'react';
import { Github, Zap, Sun, Moon, Twitter, Linkedin, Youtube, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// Custom Icon for Nostr since it's not in Lucide
// Replacing generic icon with Ostrich representation
const NostrIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
     <path d="M20.06 14.78c-.28 0-.54.05-.79.13-.23-.62-.64-1.16-1.17-1.55.03-.18.05-.37.05-.56 0-1.84-1.49-3.33-3.33-3.33-1.84 0-3.33 1.49-3.33 3.33 0 .19.02.38.05.56-.53.39-.94.93-1.17 1.55-.25-.08-.51-.13-.79-.13-1.47 0-2.67 1.19-2.67 2.67s1.2 2.67 2.67 2.67c.28 0 .54-.05.79-.13.23.62.64 1.16 1.17 1.55-.03.18-.05.37-.05.56 0 .52.12 1.01.32 1.46-2.1-.47-3.92-1.74-5.04-3.52 1.25-1.79 3.25-3.05 5.54-3.23.41-1.99 1.95-3.56 3.91-4.04C15.42 12.06 14.86 11 14 11c-1.66 0-3 1.34-3 3 0 .18.02.35.05.52-.77.26-1.42.78-1.86 1.45-.63-.19-1.3-.29-2-.29-3.14 0-5.83 1.93-6.91 4.72 1.28 2.38 3.65 4.14 6.46 4.51.58 1.41 1.98 2.41 3.61 2.41 2.16 0 3.92-1.76 3.92-3.92 0-.19-.02-.38-.05-.56.53-.39.94-.93 1.17-1.55.25.08.51.13.79.13 1.47 0 2.67-1.19 2.67-2.67s-1.2-2.64-2.67-2.64zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
     <circle cx="15.5" cy="5.5" r="1.5" />
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [imageError, setImageError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Using absolute path assuming the folder is in 'public/images/'
  const logoSrc = '/images/logo.png';

  return (
    <div className="flex flex-col min-h-screen bg-github-dark text-github-text font-sans selection:bg-github-accent selection:text-white transition-colors duration-300">
      <header className="border-b border-github-border bg-github-card/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="flex-shrink-0">
              {!imageError ? (
                <img 
                  src={logoSrc}
                  alt="Lightning Bounties" 
                  className="h-6 sm:h-8 w-auto object-contain max-h-10"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-bold text-base sm:text-lg tracking-tight text-github-text flex items-center gap-1">
                   <Zap className="text-github-accent fill-current" size={20} />
                   <span className="hidden sm:inline">Lightning Bounties</span>
                </span>
              )}
            </div>
            
            <div className="h-4 w-px bg-github-border mx-1 hidden xs:block"></div>

            <h1 className="font-bold text-sm sm:text-lg tracking-tight text-github-text truncate">
              Lightning Issues
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 text-sm text-github-secondary">
             <a href="https://docs.lightningbounties.com/docs" className="hover:text-github-accent transition-colors">Documentation</a>
             <a href="https://discord.com/invite/zBxj4x4Cbq" className="hover:text-github-accent transition-colors">Support</a>
             <button 
               onClick={toggleTheme}
               className="p-2 hover:bg-github-border rounded-full transition-colors text-github-text"
               title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
             >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-1 sm:gap-2">
             <button 
               onClick={toggleTheme}
               className="p-2 hover:bg-github-border rounded-full transition-colors text-github-text"
             >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button
               onClick={toggleMobileMenu}
               className="p-2 hover:bg-github-border rounded-full transition-colors text-github-text"
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-github-border bg-github-card px-4 py-4 space-y-4 animate-in slide-in-from-top-2 shadow-xl">
             <a href="https://docs.lightningbounties.com/docs" className="block text-github-text font-medium hover:text-github-accent py-2">Documentation</a>
             <a href="https://discord.com/invite/zBxj4x4Cbq" className="block text-github-text font-medium hover:text-github-accent py-2">Support</a>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-github-border bg-github-card pt-6 pb-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4">
            {/* Top Brand Section - Full width on mobile to avoid squishing */}
            <div className="mb-6 md:mb-8">
                <div className="mb-4">
                  {!imageError ? (
                    <img 
                        src={logoSrc}
                        alt="Lightning Bounties" 
                        className="h-8 w-auto object-contain max-h-12"
                        onError={() => setImageError(true)}
                    />
                  ) : (
                     <span className="font-bold text-lg tracking-tight text-github-text flex items-center gap-1">
                        <Zap className="text-github-accent fill-current" size={20} />
                        Lightning Bounties
                     </span>
                  )}
                </div>
                <p className="text-sm text-github-secondary leading-relaxed max-w-md">
                    Empowering developers to maintain healthier open source repositories with AI-driven insights and automated workflows.
                </p>
            </div>

            {/* 3 Column Links Grid - Optimized for Mobile */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
                
                {/* Explore */}
                <div>
                    <h3 className="font-semibold text-github-text mb-4 text-sm md:text-base">Explore</h3>
                    <ul className="space-y-3 text-xs md:text-sm text-github-secondary">
                        <li><a href="#" className="hover:text-github-accent transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-github-accent transition-colors">About</a></li>
                        <li><a href="https://blog.lightningbounties.com/" className="hover:text-github-accent transition-colors">Blog</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="font-semibold text-github-text mb-4 text-sm md:text-base">Resources</h3>
                    <ul className="space-y-3 text-xs md:text-sm text-github-secondary">
                        <li><a href="https://docs.lightningbounties.com/docs" className="hover:text-github-accent transition-colors">Docs</a></li>
                        <li><a href="#" className="hover:text-github-accent transition-colors">FAQ</a></li>
                        <li><a href="https://discord.gg/zBxj4x4Cbq" className="hover:text-github-accent transition-colors">Support</a></li>
                    </ul>
                </div>

                {/* Community / Connect */}
                <div>
                    <h3 className="font-semibold text-github-text mb-4 text-sm md:text-base">Connect</h3>
                    <div className="flex flex-col gap-3">
                         <div className="flex gap-4 text-github-secondary">
                            <a href="https://x.com/LBounties" className="hover:text-github-accent transition-colors" title="Twitter"><Twitter size={18} /></a>
                            <a href="https://www.linkedin.com/company/lightning-bounties/" className="hover:text-github-accent transition-colors" title="LinkedIn"><Linkedin size={18} /></a>
                         </div>
                         <div className="flex gap-4 text-github-secondary">
                            <a href="#" className="hover:text-github-accent transition-colors" title="GitHub"><Github size={18} /></a>
                            <a href="#" className="hover:text-[#8e44ad] transition-colors" title="Nostr"><NostrIcon size={18} /></a>
                            <a href="#" className="hover:text-red-500 transition-colors" title="YouTube"><Youtube size={18} /></a>
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-github-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <p className="text-xs text-github-secondary">
                    © 2025 Lightning Issues. Powered by Lightning Bounties.
                </p>
                <div className="flex gap-6 text-xs text-github-secondary">
                    {/* Empty div for layout balance or future legal links */}
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};