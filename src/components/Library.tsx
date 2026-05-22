import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, 
  Plus, 
  FileText, 
  Trash2, 
  BookOpen, 
  ChevronRight, 
  Download, 
  Link2,
  Bookmark,
  ChevronLeft,
  Video,
  Music,
  File,
  Search,
  Check,
  X,
  Edit2,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MemoryLinker } from './MemoryLinker';

interface Grouping {
  id: string;
  name: string;
  subgroups: string[];
}

export default function Library() {
  const { 
    studyMaterials, 
    setStudyMaterials, 
    handleFileUpload, 
    addXP,
    flashcards,
    mnemonics,
    memoryLinks,
    triggerRandomRecallNotification
  } = useAppContext();

  const [groupings, setGroupings] = useState<Grouping[]>(() => {
    const saved = localStorage.getItem('ms_library_groupings');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Science', subgroups: ['Physics', 'Chemistry', 'Biology'] },
      { id: '2', name: 'Humanities', subgroups: ['History', 'Literature', 'Philosophy'] },
      { id: '3', name: 'Mathematics', subgroups: ['Calculus', 'Algebra', 'Statistics'] }
    ];
  });

  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('All');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [selectedSubgroupForAdd, setSelectedSubgroupForAdd] = useState<string>('');

  // Editing groupings helper states
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [editingSubgroupKey, setEditingSubgroupKey] = useState<string | null>(null); // "groupId-subgroupName"
  const [editingSubgroupName, setEditingSubgroupName] = useState<string>('');

  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFiles, setNewFiles] = useState<any[]>([]);
  const [newMaterialGroup, setNewMaterialGroup] = useState('Science');
  const [newMaterialSubgroup, setNewMaterialSubgroup] = useState('Physics');

  const handleRenameGroup = (groupId: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = groupings.map(g => g.id === groupId ? { ...g, name: newName } : g);
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
    setEditingGroupId(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    const updated = groupings.filter(g => g.id !== groupId);
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
  };

  const handleRenameSubgroup = (groupId: string, oldSubName: string, newSubName: string) => {
    if (!newSubName.trim()) return;
    const updated = groupings.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subgroups: g.subgroups.map(s => s === oldSubName ? newSubName : s)
        };
      }
      return g;
    });
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
    setEditingSubgroupKey(null);
  };

  const handleDeleteSubgroup = (groupId: string, subName: string) => {
    const updated = groupings.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subgroups: g.subgroups.filter(s => s !== subName)
        };
      }
      return g;
    });
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
  };

  // Detailing View
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [pageNumberLink, setPageNumberLink] = useState<string>('');
  const [linkedFlashcardId, setLinkedFlashcardId] = useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Group creation
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const group: Grouping = {
      id: Date.now().toString(),
      name: newGroupName,
      subgroups: newSubgroupName.trim() ? [newSubgroupName] : []
    };
    const updated = [...groupings, group];
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
    setNewGroupName('');
    setNewSubgroupName('');
    setIsAddingGroup(false);
  };

  const handleAddSubgroup = () => {
    if (!selectedSubgroupForAdd || !newSubgroupName.trim()) return;
    const updated = groupings.map(g => {
      if (g.name === selectedSubgroupForAdd) {
        return {
          ...g,
          subgroups: [...new Set([...g.subgroups, newSubgroupName])]
        };
      }
      return g;
    });
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
    setNewSubgroupName('');
    setSelectedSubgroupForAdd('');
  };

  // Uploading handler
  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const attachment = await handleFileUpload(files[i]);
      setNewFiles(prev => [...prev, attachment]);
    }
  };

  // Document registration
  const handleAddMaterialSubmit = () => {
    if (!newTitle.trim()) return;
    const obj = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      attachments: newFiles,
      groupName: newMaterialGroup,
      subgroupName: newMaterialSubgroup,
      createdAt: new Date().toISOString()
    };
    
    // Inject and save to context
    setStudyMaterials(prev => [obj, ...prev]);
    addXP(40);

    // Call active recall notifications integration
    if (triggerRandomRecallNotification) {
      triggerRandomRecallNotification();
    }

    // Reset fields
    setNewTitle('');
    setNewContent('');
    setNewFiles([]);
    setIsAddingMaterial(false);
  };

  const handleDeleteMaterial = (id: string) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    if (activeMaterialId === id) setActiveMaterialId(null);
  };

  // Filtering materials
  const matchedMaterials = studyMaterials.filter(m => {
    const mGroup = (m as any).groupName || "Science";
    const mSub = (m as any).subgroupName || "Physics";
    const groupMatches = selectedGroup === 'All' || mGroup === selectedGroup;
    const subMatches = selectedSubgroup === 'All' || mSub === selectedSubgroup;
    return groupMatches && subMatches;
  });

  const activeMaterial = studyMaterials.find(m => m.id === activeMaterialId);

  // Link specific pages/chapters to flashcards or memory objects
  const handleLinkPageNumber = () => {
    if (!activeMaterialId || !linkedFlashcardId) return;
    
    // We can save page reference inside a custom array or register a direct MemoryLink relation
    // Let's create a custom link context or descriptive indicator
    addXP(15);
    setPageNumberLink('');
    setLinkedFlashcardId('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#3f332c]/30 pb-6">
        <div>
          <h2 className="text-3xl font-black font-display text-orange-100 uppercase italic tracking-tight">Your Personal Library</h2>
          <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Syllabus documents, files, audios & references</p>
        </div>
        
        <button 
          onClick={() => {
            setIsAddingMaterial(true);
            setTimeout(() => {
              const el = document.getElementById('log-study-box');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
          className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
        >
          <Plus size={16} />
          <span>Catalog Document</span>
        </button>
      </header>

      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Your Personal Library</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A study vault where you classify, store, and edit complex syllabus documents, study notes, or uploaded references to keep them highly structured.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Tap "Modify Volumes" to create study chapters/folders.</span>
          <span className="block mt-1">2. Tap "Catalog Document" to write down topics notes and save them.</span>
          <span className="block mt-1">3. Click any document card in the list to read or review its full content.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column sidebar for Groups and Subgroups setup */}
        <div className="bg-[#2a221f] p-8 rounded-[3rem] border border-[#3f332c] space-y-8 h-fit">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-black text-orange-500 tracking-wider">Groupings</h3>
            <div className="space-y-1.5 flex flex-col">
              <button
                onClick={() => { setSelectedGroup('All'); setSelectedSubgroup('All'); }}
                className={`text-left px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all ${selectedGroup === 'All' ? 'bg-orange-600 text-white' : 'text-orange-200/30 hover:bg-[#1a1614]'}`}
              >
                All Volumes
              </button>

              {groupings.map(group => (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => { setSelectedGroup(group.name); setSelectedSubgroup('All'); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider flex items-center justify-between transition-all ${selectedGroup === group.name ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20' : 'text-orange-200/30 hover:bg-[#1a1614]'}`}
                  >
                    <span>{group.name}</span>
                    <ChevronRight size={12} />
                  </button>

                  {/* Subgroups nested layout */}
                  {selectedGroup === group.name && (
                    <div className="pl-4 space-y-1 flex flex-col pt-1">
                      <button
                        onClick={() => setSelectedSubgroup('All')}
                        className={`text-left px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${selectedSubgroup === 'All' ? 'text-orange-400 font-extrabold' : 'text-orange-200/10 hover:text-orange-200/30'}`}
                      >
                        • All {group.name}
                      </button>
                      {group.subgroups.map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubgroup(sub)}
                          className={`text-left px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors ${selectedSubgroup === sub ? 'text-orange-500 font-extrabold' : 'text-orange-200/10 hover:text-orange-200/30'}`}
                        >
                          • {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#3f332c] pt-6 space-y-4">
            <button 
              onClick={() => setIsAddingGroup(true)}
              className="w-full py-3 bg-[#1a1614] border border-[#3f332c] hover:border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FolderPlus size={14} />
              <span>Configure Groups</span>
            </button>
          </div>
        </div>

        {/* Center column: Documents table and Details Inspector */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence>
            {isAddingMaterial && (
              <motion.div 
                id="log-study-box"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-black text-orange-100 italic uppercase">Log Study Document</h4>
                  <button onClick={() => setIsAddingMaterial(false)} className="text-orange-200/40 hover:text-white"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-2">Title</label>
                    <input 
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic text-xs"
                      placeholder="e.g. Organic Chemistry Carbon Atoms"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-2">Class Group</label>
                      <select 
                        value={newMaterialGroup} 
                        onChange={e => {
                          setNewMaterialGroup(e.target.value);
                          const gObj = groupings.find(g => g.name === e.target.value);
                          if (gObj && gObj.subgroups.length > 0) setNewMaterialSubgroup(gObj.subgroups[0]);
                        }}
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none text-xs h-[46px]"
                      >
                        {groupings.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-2">Subgroup</label>
                      <select 
                        value={newMaterialSubgroup} 
                        onChange={e => setNewMaterialSubgroup(e.target.value)}
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none text-xs h-[46px]"
                      >
                        {(groupings.find(g => g.name === newMaterialGroup)?.subgroups || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-2">Summaries and Syllabus Core Concepts</label>
                  <textarea 
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    rows={4}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic resize-none text-xs leading-relaxed"
                    placeholder="Describe main takeaways and concept checkpoints here..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-2">Reference PDF File Uploads (Mocked)</label>
                  <div className="flex flex-wrap gap-3">
                    {newFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-[#1a1614] px-4 py-2 border border-[#3f332c] rounded-xl text-[9px] font-black uppercase text-orange-200/60">
                        <FileText size={12} className="text-orange-500" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl bg-[#1a1614] hover:bg-orange-500/10 transition-all border border-dashed border-orange-500/30 flex items-center justify-center text-orange-500"
                    >
                      <Plus size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleSelectFiles} />
                  </div>
                </div>

                <button 
                  onClick={handleAddMaterialSubmit}
                  className="w-full py-4.5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Confirm Registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Groupings configuration modal popups */}
          <AnimatePresence>
            {isAddingGroup && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#2a221f] border border-[#3f332c] p-8 rounded-[3rem] w-full max-w-2xl space-y-6 max-h-[85vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center border-b border-[#3f332c]/50 pb-4">
                    <div>
                      <h3 className="text-xl font-black italic uppercase text-orange-100">Structure Your Library Volumes</h3>
                      <p className="text-orange-200/40 text-[9px] uppercase font-bold tracking-wider mt-1">Change, Add, and Delete all Groups and Subgroups</p>
                    </div>
                    <button onClick={() => setIsAddingGroup(false)} className="text-orange-200/30 hover:text-white bg-[#1a1614] p-2.5 rounded-full border border-[#3f332c]"><X size={16} /></button>
                  </div>

                  {/* CREATE NEW GROUP PART */}
                  <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Create New Classification Group</h4>
                    <div className="flex gap-2.5">
                      <input 
                        type="text" 
                        value={newGroupName} 
                        onChange={e => setNewGroupName(e.target.value)} 
                        className="flex-1 bg-[#2a221f] border border-[#3f332c] rounded-xl py-2.5 px-4 outline-none font-bold text-orange-100 text-xs italic"
                        placeholder="e.g. Science or Medicine"
                      />
                      <button 
                        onClick={handleAddGroup}
                        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-wider text-[10px] rounded-xl transition-colors shrink-0"
                      >
                        Create Group
                      </button>
                    </div>
                  </div>

                  {/* LIST & EDIT EXISTING GROUPS & SUBGROUPS */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-orange-200/40 tracking-widest ml-2">Active Library Structural Tree</h4>
                    
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                      {groupings.map(group => (
                        <div key={group.id} className="bg-[#1a1614]/50 border border-[#3f332c] p-5 rounded-2xl space-y-4">
                          
                          {/* GROUP ROW */}
                          <div className="flex items-center justify-between gap-4 border-b border-[#3f332c]/30 pb-2.5">
                            {editingGroupId === group.id ? (
                              <div className="flex items-center gap-2 flex-grow">
                                <input 
                                  type="text"
                                  value={editingGroupName}
                                  onChange={e => setEditingGroupName(e.target.value)}
                                  className="bg-[#2a221f] border border-orange-500/30 rounded-lg px-3 py-1 font-bold text-xs text-orange-100 italic"
                                />
                                <button 
                                  onClick={() => handleRenameGroup(group.id, editingGroupName)}
                                  className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase transition-colors"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingGroupId(null)}
                                  className="p-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-orange-200/60 rounded text-[10px] font-bold uppercase transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <span className="font-black italic text-sm text-orange-100 uppercase tracking-tighter">
                                  {group.name}
                                </span>
                                <span className="text-[8px] uppercase font-bold bg-orange-600/10 text-orange-400 px-2.5 py-0.5 rounded-full">
                                  {group.subgroups.length} sub-branches
                                </span>
                              </div>
                            )}

                            {editingGroupId !== group.id && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button 
                                  onClick={() => {
                                    setEditingGroupId(group.id);
                                    setEditingGroupName(group.name);
                                  }}
                                  className="p-2 bg-[#2a221f] text-orange-200/50 hover:text-orange-400 rounded-lg transition-colors border border-[#3f332c]"
                                  title="Change Group Name"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-2 bg-[#2a221f] text-rose-400/50 hover:text-rose-450 hover:bg-rose-950/20 rounded-lg transition-colors border border-[#3f332c]"
                                  title="Remove Group"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* SUBGROUPS LAYOUT */}
                          <div className="space-y-3 pl-4">
                            <p className="text-[8px] font-black text-orange-200/20 uppercase tracking-widest">Subgroups / Sub-folders</p>
                            
                            <div className="flex flex-wrap gap-2">
                              {group.subgroups.map((sub, idx) => {
                                const isEditingThisSub = editingSubgroupKey === `${group.id}-${sub}`;
                                return (
                                  <div 
                                    key={sub} 
                                    className="bg-[#2a221f] border border-[#3f332c] pl-3.5 pr-2 py-1.5 rounded-xl flex items-center gap-2"
                                  >
                                    {isEditingThisSub ? (
                                      <div className="flex items-center gap-1">
                                        <input 
                                          type="text"
                                          value={editingSubgroupName}
                                          onChange={e => setEditingSubgroupName(e.target.value)}
                                          className="bg-[#1a1614] border border-orange-500/20 rounded px-1.5 py-0.5 text-[10px] font-bold text-orange-100"
                                        />
                                        <button 
                                          onClick={() => handleRenameSubgroup(group.id, sub, editingSubgroupName)}
                                          className="p-0.5 px-1.5 bg-emerald-600 rounded text-[8px] font-bold uppercase hover:bg-emerald-700"
                                        >
                                          ✓
                                        </button>
                                        <button 
                                          onClick={() => setEditingSubgroupKey(null)}
                                          className="p-0.5 px-1.5 bg-neutral-850 rounded text-[8px] font-bold uppercase hover:bg-neutral-800"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-[10px] font-bold text-orange-100/80 uppercase tracking-wider">{sub}</span>
                                        <button 
                                          onClick={() => {
                                            setEditingSubgroupKey(`${group.id}-${sub}`);
                                            setEditingSubgroupName(sub);
                                          }}
                                          className="text-orange-200/30 hover:text-orange-400 p-0.5"
                                          title="Change Subgroup Name"
                                        >
                                          <Edit2 size={8} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteSubgroup(group.id, sub)}
                                          className="text-rose-400/40 hover:text-rose-400 p-0.5"
                                          title="Delete Subgroup"
                                        >
                                          <X size={10} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* DYNAMIC COMPACT ADD SUBGROUP DIRECTLY IN GROUP CONTAINER */}
                            <div className="flex items-center gap-2 max-w-xs mt-3.5 pt-2 border-t border-[#3f332c]/20">
                              <input 
                                type="text"
                                placeholder={`Add subgroup to ${group.name}...`}
                                id={`quick-sub-input-${group.id}`}
                                className="bg-[#2a221f] border border-[#3f332c] text-[10px] italic font-bold rounded-lg px-2.5 py-1.5 text-orange-100 outline-none flex-grow"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const inputVal = (e.target as HTMLInputElement).value;
                                    if (inputVal.trim()) {
                                      const updated = groupings.map(g => {
                                        if (g.id === group.id) {
                                          return {
                                            ...g,
                                            subgroups: [...new Set([...g.subgroups, inputVal.trim()])]
                                          };
                                        }
                                        return g;
                                      });
                                      setGroupings(updated);
                                      localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <button 
                                onClick={() => {
                                  const el = document.getElementById(`quick-sub-input-${group.id}`) as HTMLInputElement;
                                  if (el && el.value.trim()) {
                                    const updated = groupings.map(g => {
                                      if (g.id === group.id) {
                                        return {
                                          ...g,
                                          subgroups: [...new Set([...g.subgroups, el.value.trim()])]
                                        };
                                      }
                                      return g;
                                    });
                                    setGroupings(updated);
                                    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
                                    el.value = '';
                                  }
                                }}
                                className="p-1 px-2.5 bg-neutral-850 hover:bg-neutral-800 text-orange-400 border border-[#3f332c] text-[9px] font-black uppercase rounded-lg"
                              >
                                + Add
                              </button>
                            </div>

                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Details inspection segment OR full library listing */}
          {activeMaterialId && activeMaterial ? (
            <div className="bg-[#2a221f] rounded-[4rem] p-10 border border-[#3f332c] space-y-8 animate-fade-in relative">
              <button 
                onClick={() => setActiveMaterialId(null)}
                className="absolute top-8 left-8 flex items-center gap-2 text-[9px] uppercase font-black text-orange-200/40 hover:text-orange-500 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back to catalogue</span>
              </button>

              <div className="pt-8 space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[8px] font-black bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-full uppercase">
                    {(activeMaterial as any).groupName || "Science"}
                  </span>
                  <span className="text-[8px] font-black bg-neutral-800 text-orange-100 px-3 py-1 rounded-full uppercase">
                    {(activeMaterial as any).subgroupName || "Physics"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase text-orange-100 leading-tight">
                    {activeMaterial.title}
                  </h3>
                  <p className="text-[9px] text-orange-200/20 font-black uppercase tracking-widest">
                    Cataloged on {new Date(activeMaterial.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {activeMaterial.content && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-orange-500">Document Summary</p>
                    <div className="bg-[#1a1614] p-8 rounded-[2.5rem] border border-[#3f332c] text-sm text-orange-100/70 leading-relaxed font-bold italic shadow-inner">
                      {activeMaterial.content}
                    </div>
                  </div>
                )}

                {/* Uploaded attachments cards */}
                {activeMaterial.attachments && activeMaterial.attachments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-black tracking-widest text-orange-500">Uploaded Archives</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeMaterial.attachments.map(file => {
                        const Icon = file.type === 'video' ? Video : file.type === 'audio' ? Music : FileText;
                        return (
                          <div key={file.id} className="bg-[#1a1614] border border-[#3f332c] px-6 py-4 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <Icon size={18} className="text-orange-500 shrink-0" />
                              <span className="text-xs font-bold text-orange-100 truncate max-w-[140px] italic">{file.name}</span>
                            </div>
                            <a href={file.url} download target="_blank" rel="noreferrer" className="text-orange-400 hover:text-white shrink-0">
                              <Download size={16} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Linking trigger widget */}
                <div className="border-t border-[#3f332c] pt-8 space-y-4">
                  <MemoryLinker itemId={activeMaterial.id} itemType="material" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-200/30">
                  Showing {matchedMaterials.length} Documents
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedMaterials.map(m => {
                  const mGroup = (m as any).groupName || "Science";
                  const mSub = (m as any).subgroupName || "Physics";
                  return (
                    <div 
                      key={m.id}
                      onClick={() => setActiveMaterialId(m.id)}
                      className="bg-[#2a221f] border border-[#3f332c] p-8 rounded-[3rem] hover:bg-[#2d2522] transition-all group flex flex-col justify-between cursor-pointer shadow-sm min-h-[220px]"
                    >
                      <div className="space-y-4 text-left">
                        <div className="flex gap-2">
                          <span className="text-[7px] font-black uppercase bg-orange-500/10 text-orange-500 px-2 py-0.5 border border-orange-500/10 rounded-full">{mGroup}</span>
                          <span className="text-[7px] font-black uppercase bg-neutral-800 text-orange-200/40 px-2 py-0.5 rounded-full">{mSub}</span>
                        </div>
                        <h4 className="text-xl font-black italic uppercase leading-none text-orange-100 group-hover:text-orange-400 transition-colors">{m.title}</h4>
                        <p className="text-xs text-orange-200/40 font-bold italic line-clamp-2 leading-relaxed">{m.content || "Empty content scroll."}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#3f332c]/50 pt-4 mt-6">
                        <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider flex items-center gap-1.5">
                          <Bookmark size={12} />
                          <span>Inspect details</span>
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(m.id); }}
                          className="text-orange-200/10 hover:text-rose-500 p-2 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {matchedMaterials.length === 0 && (
                  <div className="col-span-2 text-center py-24 bg-[#2a221f]/20 border-2 border-dashed border-[#3f332c] rounded-[4rem]">
                    <BookOpen size={48} className="mx-auto text-orange-200/10 mb-4" />
                    <p className="text-orange-200/20 font-black uppercase tracking-widest text-xs italic">Catalog archive is empty under this volume</p>
                    <button onClick={() => setIsAddingMaterial(true)} className="mt-4 text-orange-500 font-black uppercase text-[10px] hover:underline">Register first scroll</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
