import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Link2, X, Search, Radio, Brain, BookOpen, Layers, Type, Plus, FileText, Bookmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MemoryLink } from '../types';

interface MemoryLinkerProps {
  itemId: string;
  itemType: MemoryLink['sourceType'];
  className?: string;
}

export const MemoryLinker: React.FC<MemoryLinkerProps> = ({ itemId, itemType, className = "" }) => {
  const { 
    memoryLinks, 
    addMemoryLink, 
    removeMemoryLink,
    flashcards,
    mnemonics,
    memoryPalaces,
    linkChains,
    storyChains,
    firstLetterEntries,
    studyMaterials
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<MemoryLink['sourceType']>('flashcard');

  // Find all active links for this item
  const activeLinks = memoryLinks.filter(l => 
    (l.sourceId === itemId && l.sourceType === itemType) || 
    (l.targetId === itemId && l.targetType === itemType)
  );

  // Helper to fetch details of a target memory object
  const getObjectDetails = (id: string, type: MemoryLink['sourceType']) => {
    switch (type) {
      case 'flashcard':
        const card = flashcards.find(c => c.id === id);
        return card ? { title: card.question, subtitle: "Flashcard", category: card.subject || "General" } : null;
      case 'mnemonic':
        const mn = mnemonics.find(m => m.id === id);
        return mn ? { title: mn.phrase, subtitle: "Mnemonic Trick", category: mn.subject || "Tricks" } : null;
      case 'palace':
        const p = memoryPalaces.find(pv => pv.id === id);
        return p ? { title: p.name, subtitle: `Memory Palace (${p.rooms.length} Stages)`, category: p.subject || "Loci" } : null;
      case 'link-chain':
        const lc = linkChains.find(l => l.id === id);
        return lc ? { title: lc.title || "Story Link", subtitle: "Link Method Chain", category: lc.subject || "Chains" } : null;
      case 'story':
        const st = storyChains.find(s => s.id === id);
        return st ? { title: st.title || "Loci Story", subtitle: "Story Method Method", category: st.subject || "Stories" } : null;
      case 'first-letter':
        const fl = firstLetterEntries.find(f => f.id === id);
        return fl ? { title: fl.word, subtitle: `First-Letter Aid (${fl.sentence})`, category: fl.subject || "Aids" } : null;
      case 'material':
        const mat = studyMaterials.find(m => m.id === id);
        return mat ? { title: mat.title, subtitle: "Syllabus Archive", category: "Library" } : null;
      default:
        return null;
    }
  };

  // Get items lists by types for linking picker
  const getPickerItems = (type: MemoryLink['sourceType']) => {
    switch (type) {
      case 'flashcard':
        return flashcards.filter(c => c.id !== itemId).map(c => ({ id: c.id, title: c.question, subtitle: "Flashcard", subject: c.subject }));
      case 'mnemonic':
        return mnemonics.filter(m => m.id !== itemId).map(m => ({ id: m.id, title: m.phrase, subtitle: "Mnemonic Trick", subject: m.subject }));
      case 'palace':
        return memoryPalaces.filter(p => p.id !== itemId).map(p => ({ id: p.id, title: p.name, subtitle: `${p.rooms.length} rooms`, subject: p.subject }));
      case 'link-chain':
        return linkChains.filter(l => l.id !== itemId).map(l => ({ id: l.id, title: l.title || "Linking Chain", subtitle: `${l.items.length} links`, subject: l.subject }));
      case 'story':
        return storyChains.filter(s => s.id !== itemId).map(s => ({ id: s.id, title: s.title || "Story Chain", subtitle: "Story method", subject: s.subject }));
      case 'first-letter':
        return firstLetterEntries.filter(f => f.id !== itemId).map(f => ({ id: f.id, title: f.word, subtitle: f.sentence, subject: f.subject }));
      case 'material':
        return studyMaterials.filter(m => m.id !== itemId).map(m => ({ id: m.id, title: m.title, subtitle: "Library Reference Docs", subject: "Syllabus" }));
      default:
        return [];
    }
  };

  const currentPickerItems = getPickerItems(activeTab).filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-t border-[#3f332c] pt-4">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-orange-500" />
          <h4 className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 italic">Universal Memory Links</h4>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#1a1614] border border-[#3f332c] hover:border-orange-500/40 text-orange-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
        >
          <Plus size={12} />
          <span>Link Concept</span>
        </button>
      </div>

      {/* Visual Reinforcement Nodes */}
      {activeLinks.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeLinks.map(link => {
            const isSource = link.sourceId === itemId && link.sourceType === itemType;
            const targetId = isSource ? link.targetId : link.sourceId;
            const targetType = isSource ? link.targetType : link.sourceType;
            const details = getObjectDetails(targetId, targetType);

            if (!details) return null;

            return (
              <div 
                key={link.id} 
                className="flex items-center gap-3 bg-[#1a1614] hover:bg-[#231d1b] border border-[#3f332c] px-4 py-2.5 rounded-2xl group transition-all"
              >
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <div className="text-left">
                  <span className="text-[7px] block font-black uppercase text-orange-500 tracking-wider">
                    {details.subtitle} ({details.category})
                  </span>
                  <span className="text-[10px] font-bold text-orange-100 italic line-clamp-1 max-w-[140px]">
                    {details.title}
                  </span>
                </div>
                <button 
                  onClick={() => removeMemoryLink(link.id)}
                  className="text-orange-200/20 hover:text-rose-500 p-1 rounded-md transition-colors ml-1"
                  title="Sever link connection"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[9px] font-black uppercase tracking-wider text-orange-200/10 italic">This memory object experiences solitary solitude. Connect it to other scrolls.</p>
      )}

      {/* Link Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2a221f] border border-[#3f332c] w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex flex-col h-[600px]"
            >
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center">
                    <Link2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase italic text-orange-100 tracking-tight">Select Related Memory Object</h3>
                    <p className="text-[9px] uppercase tracking-widest text-orange-200/30 font-black mt-1">Establish associative memory link bridges</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-orange-200/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </header>

              {/* Type Category Tabs */}
              <div className="flex bg-[#1a1614] overflow-x-auto p-1.5 rounded-2xl border border-[#3f332c] no-scrollbar mb-6">
                {[
                  { id: 'flashcard', label: 'Flashcards', icon: Layers },
                  { id: 'mnemonic', label: 'Mnemonics', icon: Brain },
                  { id: 'palace', label: 'Palace', icon: Bookmark },
                  { id: 'link-chain', label: 'Link method', icon: Link },
                  { id: 'story', label: 'Story Method', icon: Radio },
                  { id: 'first-letter', label: 'First-Letter', icon: Type },
                  { id: 'material', label: 'Library', icon: BookOpen },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                      className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === tab.id 
                          ? 'bg-orange-600 text-white shadow-lg' 
                          : 'text-orange-200/30 hover:text-orange-200/60'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative mb-6">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-200/20" />
                <input 
                  type="text"
                  placeholder="Search contents, concepts or subjects..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 pl-14 pr-6 text-orange-100 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 italic"
                />
              </div>

              {/* Memory list */}
              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                {currentPickerItems.length > 0 ? (
                  currentPickerItems.map(item => {
                    // Check if already linked
                    const isLinked = memoryLinks.some(l => 
                      (l.sourceId === itemId && l.sourceType === itemType && l.targetId === item.id && l.targetType === activeTab) ||
                      (l.targetId === itemId && l.targetType === itemType && l.sourceId === item.id && l.sourceType === activeTab)
                    );

                    return (
                      <div 
                        key={item.id}
                        className="bg-[#1a1614] border border-[#3f332c] p-4 rounded-2xl flex items-center justify-between hover:bg-[#201a18] transition-all"
                      >
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[7px] uppercase font-black bg-orange-600/10 border border-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">
                              {item.subject || "General"}
                            </span>
                            <span className="text-[8px] font-bold text-orange-200/20 uppercase tracking-widest">{item.subtitle}</span>
                          </div>
                          <p className="text-xs font-bold text-orange-100 italic leading-snug line-clamp-2 max-w-[420px]">{item.title}</p>
                        </div>

                        {isLinked ? (
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">Linked</span>
                        ) : (
                          <button
                            onClick={() => {
                              addMemoryLink(itemId, itemType, item.id, activeTab);
                              // Close and reset
                              setIsOpen(false);
                              setSearchTerm('');
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-5 py-2.5 rounded-xl text-[9px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Plus size={12} />
                            <span>Bridge</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-orange-200/10 uppercase font-black tracking-widest text-[10px] italic border border-dashed border-[#3f332c] rounded-2xl">
                    No unconnected items found in this section.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
