import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, Bug, Lightbulb, FileText, Hammer, Pencil, X, Save, Image as ImageIcon, Smile, Bold, Italic, List, Maximize2, Minimize2, Search, Undo, Redo, Eye, EyeOff } from 'lucide-react';
import { IssueSuggestion, IssueType, RepoInfo } from '../types';

// Declare marked for TypeScript (loaded via CDN)
declare const marked: any;

interface IssueCardProps {
  suggestion: IssueSuggestion;
  repoInfo: RepoInfo | null;
}

// Expanded Emoji Data for Search
const EMOJI_LIST = [
  // Status / Types
  { char: '🐛', name: 'bug', keywords: ['insect', 'error', 'fix', 'problem'] },
  { char: '✨', name: 'sparkles', keywords: ['feature', 'new', 'shiny', 'enhancement'] },
  { char: '🚀', name: 'rocket', keywords: ['deploy', 'speed', 'performance', 'launch'] },
  { char: '📝', name: 'memo', keywords: ['docs', 'write', 'note', 'documentation'] },
  { char: '🎨', name: 'art', keywords: ['design', 'css', 'style', 'ui', 'ux'] },
  { char: '🔨', name: 'hammer', keywords: ['refactor', 'fix', 'tool', 'build'] },
  { char: '✅', name: 'check', keywords: ['pass', 'done', 'success', 'completed'] },
  { char: '❌', name: 'x', keywords: ['fail', 'error', 'delete', 'no'] },
  { char: '🔥', name: 'fire', keywords: ['hot', 'remove', 'burn', 'urgent'] },
  { char: '🚧', name: 'construction', keywords: ['wip', 'work', 'building', 'progress'] },
  
  // Feedback / Reaction
  { char: '👀', name: 'eyes', keywords: ['review', 'look', 'watch', 'seen'] },
  { char: '🎉', name: 'tada', keywords: ['celebrate', 'party', 'release', 'yay'] },
  { char: '👍', name: 'thumbs_up', keywords: ['approve', 'good', 'yes', 'agree'] },
  { char: '👎', name: 'thumbs_down', keywords: ['disapprove', 'bad', 'no'] },
  { char: '❤️', name: 'heart', keywords: ['love', 'like'] },
  { char: '🤯', name: 'mind_blown', keywords: ['wow', 'shock'] },
  { char: '😕', name: 'confused', keywords: ['what', 'question'] },
  { char: '👋', name: 'wave', keywords: ['hello', 'bye'] },
  { char: '🙏', name: 'pray', keywords: ['please', 'thanks', 'hope'] },
  
  // Tech / Dev
  { char: '🔒', name: 'lock', keywords: ['security', 'auth', 'private'] },
  { char: '💡', name: 'bulb', keywords: ['idea', 'light', 'suggestion'] },
  { char: '⚠️', name: 'warning', keywords: ['alert', 'danger', 'caution'] },
  { char: '♻️', name: 'recycle', keywords: ['refactor', 'cycle', 'update'] },
  { char: '🔧', name: 'wrench', keywords: ['tool', 'config', 'settings'] },
  { char: '📈', name: 'chart', keywords: ['analytics', 'graph', 'stats'] },
  { char: '🌐', name: 'globe', keywords: ['i18n', 'web', 'world', 'global'] },
  { char: '🗑️', name: 'trash', keywords: ['delete', 'remove', 'garbage'] },
  { char: '📦', name: 'package', keywords: ['build', 'ship', 'container'] },
  { char: '👽', name: 'alien', keywords: ['weird', 'code'] },
  { char: '🚑', name: 'ambulance', keywords: ['hotfix', 'critical', 'urgent'] },
  { char: '💄', name: 'lipstick', keywords: ['ui', 'style', 'cosmetic'] },
  { char: '♿', name: 'wheelchair', keywords: ['a11y', 'accessibility'] },
  { char: '🔊', name: 'sound', keywords: ['audio', 'log'] },
  { char: '📱', name: 'mobile', keywords: ['phone', 'ios', 'android', 'responsive'] },
  { char: '💾', name: 'floppy', keywords: ['save', 'store', 'db'] },
  { char: '🔌', name: 'plug', keywords: ['plugin', 'connect', 'api'] },
  { char: '🔍', name: 'search', keywords: ['find', 'query'] },
  { char: '🔑', name: 'key', keywords: ['auth', 'password', 'login'] },
  { char: '🐳', name: 'whale', keywords: ['docker', 'container'] },
  { char: '➕', name: 'plus', keywords: ['add', 'include'] },
  { char: '➖', name: 'minus', keywords: ['remove', 'subtract'] },
  { char: '⚡', name: 'zap', keywords: ['fast', 'performance', 'lightning'] },
  { char: '🏁', name: 'flag', keywords: ['windows', 'start'] },
  { char: '🍎', name: 'apple', keywords: ['mac', 'osx'] },
  { char: '🐧', name: 'penguin', keywords: ['linux'] },
  { char: '🤖', name: 'robot', keywords: ['bot', 'android', 'automation'] },
  { char: '🛑', name: 'stop', keywords: ['block', 'halt'] },
  { char: '🧪', name: 'test_tube', keywords: ['test', 'experiment', 'lab'] },
  { char: '🩹', name: 'bandage', keywords: ['fix', 'patch'] },
  { char: '🧐', name: 'monocle', keywords: ['inspect', 'check', 'lint'] },
  { char: '⚗️', name: 'alembic', keywords: ['experiment', 'chemistry'] },
  { char: '🏗️', name: 'building_construction', keywords: ['wip', 'build'] },
  { char: '📱', name: 'iphone', keywords: ['mobile', 'device'] },
  { char: '🤡', name: 'clown', keywords: ['mock', 'joke'] },
  { char: '🥚', name: 'egg', keywords: ['easter egg'] },
  { char: '🙈', name: 'see_no_evil', keywords: ['ignore', 'gitignored'] },
  { char: '📸', name: 'camera', keywords: ['screenshot', 'snapshot'] },
  { char: '⚰️', name: 'coffin', keywords: ['dead code', 'deprecated'] },
  { char: '🛡️', name: 'shield', keywords: ['security', 'protection'] },
  { char: '👕', name: 'shirt', keywords: ['lint', 'style'] },
  { char: '✏️', name: 'pencil', keywords: ['typo', 'edit'] },
  { char: '💩', name: 'poop', keywords: ['bad code', 'poo'] },
  { char: '🔀', name: 'shuffle', keywords: ['merge'] },
  { char: '🚚', name: 'truck', keywords: ['move', 'migrate'] },
  { char: '📄', name: 'page', keywords: ['license', 'document'] },
  { char: '💥', name: 'boom', keywords: ['breaking change'] },
  { char: '🍱', name: 'bento', keywords: ['assets'] },
  { char: '🥅', name: 'goal', keywords: ['catch', 'error handling'] },
  { char: '🥂', name: 'cheers', keywords: ['merge'] },
];

export const IssueCard: React.FC<IssueCardProps> = ({ suggestion, repoInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState(suggestion.title);
  const [body, setBody] = useState(suggestion.body);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Undo/Redo State
  const [history, setHistory] = useState<string[]>([suggestion.body]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when suggestion prop changes
  useEffect(() => {
    setTitle(suggestion.title);
    setBody(suggestion.body);
    setHistory([suggestion.body]);
    setHistoryIndex(0);
  }, [suggestion]);

  // Handle body changes with debounced history update
  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    
    // Clear existing timer
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Set new timer to push to history after 800ms of inactivity
    debounceRef.current = setTimeout(() => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(newBody);
            // Optional: Limit history length to 50
            if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49)); // Adjust index logic
    }, 800);
  };
  
  useEffect(() => {
     // Sync history index with history length if needed
  }, [history]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBody(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBody(history[newIndex]);
    }
  };

  const getIcon = (type: IssueType) => {
    switch (type) {
      case IssueType.BUG: return <Bug size={18} className="text-red-600 dark:text-red-400" />;
      case IssueType.FEATURE: return <Lightbulb size={18} className="text-amber-600 dark:text-yellow-400" />;
      case IssueType.DOCS: return <FileText size={18} className="text-blue-600 dark:text-blue-400" />;
      case IssueType.REFACTOR: return <Hammer size={18} className="text-purple-600 dark:text-purple-400" />;
      default: return <Lightbulb size={18} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getColor = (type: IssueType) => {
    switch (type) {
      case IssueType.BUG: 
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-900/30';
      case IssueType.FEATURE: 
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-900/30';
      case IssueType.DOCS: 
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-900/30';
      case IssueType.REFACTOR: 
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-900/30';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateClick = () => {
    if (!repoInfo) return;
    const baseUrl = `https://github.com/${repoInfo.owner}/${repoInfo.name}/issues/new`;
    const params = new URLSearchParams();
    params.set('title', title);
    params.set('body', body);
    
    const labelMap = {
        [IssueType.BUG]: 'bug',
        [IssueType.FEATURE]: 'enhancement',
        [IssueType.DOCS]: 'documentation',
        [IssueType.REFACTOR]: 'refactor'
    };
    params.set('labels', labelMap[suggestion.type]);
    
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    setIsExpanded(true); // Auto-expand when editing
  };

  const handleSave = () => {
    setIsEditing(false);
    setIsFullscreen(false);
    setPreviewMode(false);
  };

  const handleCancel = () => {
    setTitle(suggestion.title);
    setBody(suggestion.body);
    setHistory([suggestion.body]);
    setHistoryIndex(0);
    setIsEditing(false);
    setIsFullscreen(false);
    setPreviewMode(false);
  };

  const pushToHistory = (newText: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const newText = body.substring(0, start) + before + selectedText + after + body.substring(end);

    setBody(newText);
    pushToHistory(newText);
    
    // Defer cursor update to next tick
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const filteredEmojis = EMOJI_LIST.filter(e => 
    e.name.toLowerCase().includes(emojiSearch.toLowerCase()) || 
    e.keywords.some(k => k.toLowerCase().includes(emojiSearch.toLowerCase()))
  );

  const ToolbarButton = ({ onClick, icon: Icon, title, active = false, disabled = false }: { onClick: () => void, icon: any, title: string, active?: boolean, disabled?: boolean }) => (
    <button
      onClick={onClick}
      type="button"
      disabled={disabled}
      className={`p-1.5 rounded transition-colors 
        ${disabled ? 'opacity-30 cursor-not-allowed text-gray-400' : 
          active 
            ? 'text-github-accent bg-github-border' 
            : 'text-gray-500 hover:text-github-accent hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
        }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`bg-github-card border border-github-border rounded-xl hover:border-github-accent/50 hover:shadow-md transition-all duration-300 flex flex-col group w-full ${isFullscreen ? 'fixed inset-0 z-[100] m-0 rounded-none' : ''} ${isEditing ? 'overflow-visible' : 'overflow-hidden'}`}>
      
      {/* Main Content Area */}
      <div className={`flex flex-col md:flex-row md:items-stretch flex-1 ${isFullscreen ? 'h-full' : ''}`}>
          
          {/* Header Section */}
          <div className={`${isFullscreen ? 'hidden md:flex md:w-1/4' : 'md:w-1/3 lg:w-1/4'} p-5 border-b md:border-b-0 md:border-r border-github-border shrink-0 bg-github-card flex flex-col ${!isFullscreen && !isEditing ? '' : 'rounded-t-xl md:rounded-tr-none md:rounded-l-xl'}`}>
            <div className="w-full">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold mb-3 border transition-colors ${getColor(suggestion.type)}`}>
                {getIcon(suggestion.type)}
                {suggestion.type}
                </div>
                
                {isEditing ? (
                <textarea 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    rows={2}
                    className="w-full text-lg sm:text-xl font-bold border border-github-border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-github-accent bg-white text-gray-900 dark:bg-[#0d1117] dark:text-white placeholder-gray-400 transition-colors resize-none"
                    autoFocus={!isFullscreen}
                />
                ) : (
                <h3 className="text-xl font-bold text-github-text leading-tight group-hover:text-github-accent transition-colors break-words">
                    {title}
                </h3>
                )}
            </div>
            {/* Reasoning text */}
            <p className="mt-3 text-sm text-github-secondary leading-relaxed">
                {suggestion.reasoning}
            </p>
          </div>

          {/* Content Preview / Editor */}
          <div className={`relative transition-all duration-300 md:flex-1 flex flex-col ${isEditing ? 'bg-github-card' : 'bg-gray-50 dark:bg-[#0d1117]'} ${!isFullscreen && (isExpanded || isEditing ? 'h-auto min-h-[16rem]' : 'h-64')}`}>
            
            {isEditing ? (
            <div className="flex flex-col h-full relative">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-github-border bg-github-card sticky top-0 z-10 overflow-x-auto rounded-tr-xl">
                    
                    {/* Tabs: Write | Preview */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-1 mr-2">
                        <button
                            onClick={() => setPreviewMode(false)}
                            className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all ${!previewMode ? 'bg-white dark:bg-[#0d1117] text-github-text shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Write
                        </button>
                        <button
                            onClick={() => setPreviewMode(true)}
                            className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all ${previewMode ? 'bg-white dark:bg-[#0d1117] text-github-text shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Preview
                        </button>
                    </div>

                    <div className="w-px h-4 bg-github-border mx-1"></div>

                    <ToolbarButton onClick={() => insertText('**', '**')} icon={Bold} title="Bold" disabled={previewMode} />
                    <ToolbarButton onClick={() => insertText('*', '*')} icon={Italic} title="Italic" disabled={previewMode} />
                    <ToolbarButton onClick={() => insertText('- ')} icon={List} title="List" disabled={previewMode} />
                    <div className="w-px h-4 bg-github-border mx-1"></div>
                    <ToolbarButton onClick={() => insertText('![Image Description](', ')')} icon={ImageIcon} title="Insert Image" disabled={previewMode} />
                    
                    {/* Emoji Picker Trigger */}
                    <div className="relative">
                        <ToolbarButton 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                            icon={Smile} 
                            title="Insert Emoji" 
                            active={showEmojiPicker}
                            disabled={previewMode}
                        />
                    </div>
                    
                    <div className="w-px h-4 bg-github-border mx-1"></div>
                    <ToolbarButton 
                        onClick={undo} 
                        icon={Undo} 
                        title="Undo" 
                        disabled={previewMode || historyIndex <= 0}
                    />
                    <ToolbarButton 
                        onClick={redo} 
                        icon={Redo} 
                        title="Redo" 
                        disabled={previewMode || historyIndex >= history.length - 1}
                    />

                    <div className="flex-1"></div>

                    <ToolbarButton 
                        onClick={() => setIsFullscreen(!isFullscreen)} 
                        icon={isFullscreen ? Minimize2 : Maximize2} 
                        title={isFullscreen ? "Exit Full Screen" : "Full Screen"} 
                    />
                </div>

                {previewMode ? (
                    <div className="w-full p-6 bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white [&_*]:!text-gray-900 [&_*]:dark:!text-gray-100 [&_blockquote]:!text-gray-500 overflow-y-auto h-full markdown-body border-t border-transparent"
                         dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(body) : body }}
                    />
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={body}
                        onChange={(e) => handleBodyChange(e.target.value)}
                        className={`w-full p-5 font-mono text-sm resize-y focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 dark:bg-[#0d1117] dark:text-white dark:placeholder-gray-600 ${isFullscreen ? 'flex-1 resize-none' : 'min-h-[16rem]'}`}
                        placeholder="Describe the issue... (Markdown supported)"
                        spellCheck={false}
                    />
                )}

                {/* Emoji Picker Popup - Placed here to ensure it stacks ON TOP of the textarea/preview due to DOM order + z-index */}
                {showEmojiPicker && (
                    <>
                        <div 
                            className="fixed inset-0 z-[60] cursor-default bg-transparent" 
                            onClick={() => setShowEmojiPicker(false)}
                        ></div>
                        <div className="absolute top-[3.5rem] left-2 w-80 sm:w-[26rem] h-80 bg-github-card border border-github-border rounded-lg shadow-2xl flex flex-col z-[70] animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-github-border bg-github-card rounded-t-lg">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search emojis..." 
                                        className="w-full bg-white dark:bg-gray-800 border border-github-border rounded-md pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-github-accent focus:ring-1 focus:ring-github-accent transition-colors shadow-sm"
                                        autoFocus
                                        value={emojiSearch}
                                        onChange={(e) => setEmojiSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-6 sm:grid-cols-8 gap-1.5 custom-scrollbar bg-github-card rounded-b-lg content-start">
                                {filteredEmojis.map((emoji, idx) => (
                                    <button
                                        key={`${emoji.name}-${idx}`}
                                        onClick={() => {
                                            insertText(emoji.char);
                                            setShowEmojiPicker(false);
                                            setEmojiSearch('');
                                        }}
                                        className="aspect-square flex items-center justify-center hover:bg-github-border rounded-md text-xl transition-colors hover:scale-110"
                                        title={`:${emoji.name}:`}
                                    >
                                        {emoji.char}
                                    </button>
                                ))}
                                {filteredEmojis.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-sm text-github-secondary">
                                        No emojis found for "{emojiSearch}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            ) : (
            <>
                <div className="p-5 font-mono text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap overflow-hidden h-full">
                    {body}
                </div>
                
                {!isExpanded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent dark:from-[#0d1117] dark:via-[#0d1117]/50 flex items-end justify-center pb-4">
                    </div>
                )}
            </>
            )}
          </div>
      </div>

      {/* Actions */}
      <div className={`p-4 bg-github-card border-t border-github-border mt-auto flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 ${!isFullscreen && !isEditing ? '' : 'rounded-b-xl'}`}>
        <div className="flex items-center gap-2">
            {isEditing ? (
                <>
                    <button 
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors px-2 py-1"
                        title="Save changes"
                    >
                        <Check size={16} /> Save
                    </button>
                    <button 
                        onClick={handleCancel}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors px-2 py-1"
                        title="Discard changes"
                    >
                        <X size={16} /> Cancel
                    </button>
                    
                    <div className="w-px h-4 bg-github-border mx-2"></div>
                    
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="text-gray-500 hover:text-github-accent dark:text-gray-400 dark:hover:text-github-accent text-sm font-medium flex items-center gap-1 transition-colors px-2 py-1"
                    >
                        {previewMode ? <><EyeOff size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
                    </button>
                </>
            ) : (
                <>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-github-text dark:text-gray-400 dark:hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        {isExpanded ? (
                            <>Collapse <ChevronUp size={16} /></>
                        ) : (
                            <>View Content <ChevronDown size={16} /></>
                        )}
                    </button>
                    
                    <div className="w-px h-4 bg-github-border mx-1"></div>

                    <button 
                        onClick={handleEditToggle}
                        className="text-gray-500 hover:text-github-accent dark:text-gray-400 dark:hover:text-github-accent text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        <Pencil size={14} /> Edit
                    </button>
                </>
            )}
        </div>

        <div className="flex items-center gap-2">
            {!isEditing && (
                <button
                    onClick={handleCopy}
                    className="p-2 text-gray-500 hover:text-github-text hover:bg-github-border rounded-md transition-all dark:text-gray-400 dark:hover:text-white"
                    title="Copy Markdown"
                >
                    {copied ? <Check size={18} className="text-green-600 dark:text-green-500" /> : <Copy size={18} />}
                </button>
            )}
            <button
                onClick={handleCreateClick}
                disabled={!repoInfo}
                className="flex items-center gap-2 bg-github-primary hover:bg-github-primaryHover text-white px-4 py-2 rounded-md font-semibold text-sm transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
                Create Issue <ExternalLink size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};