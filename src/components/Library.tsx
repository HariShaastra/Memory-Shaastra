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
  Search, 
  X, 
  Edit2, 
  HelpCircle,
  Folder,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
    logActivity
  } = useAppContext();

  const [groupings, setGroupings] = useState<Grouping[]>(() => {
    const saved = localStorage.getItem('ms_library_groupings');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Science & Medical', subgroups: ['Physics', 'Chemistry', 'Biology'] },
      { id: '2', name: 'Economics & Shaastra', subgroups: ['Macroeconomics', 'Finance', 'Trade'] },
      { id: '3', name: 'Humanities & Civics', subgroups: ['History', 'Philosophy', 'Law'] }
    ];
  });

  // Step state for 3-Step Grouping Workflow: 1 = Select Group, 2 = Add Doc, 3 = View Doc
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Grouping & Material
  const [selectedGroup, setSelectedGroup] = useState<string>('Science & Medical');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('Physics');
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);

  // Add Document form fields
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFiles, setNewFiles] = useState<any[]>([]);

  // Add Grouping modal
  const [isAddingGroupModal, setIsAddingGroupModal] = useState(false);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [newSubgroupNameInput, setNewSubgroupNameInput] = useState('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddGroup = () => {
    if (!newGroupNameInput.trim()) return;
    const group: Grouping = {
      id: Date.now().toString(),
      name: newGroupNameInput,
      subgroups: newSubgroupNameInput.trim() ? [newSubgroupNameInput] : ['General']
    };
    const updated = [...groupings, group];
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
    setSelectedGroup(group.name);
    setSelectedSubgroup(group.subgroups[0]);
    setNewGroupNameInput('');
    setNewSubgroupNameInput('');
    setIsAddingGroupModal(false);
  };

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const attachment = await handleFileUpload(files[i]);
      setNewFiles(prev => [...prev, attachment]);
    }
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const obj = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      attachments: newFiles,
      groupName: selectedGroup,
      subgroupName: selectedSubgroup,
      createdAt: new Date().toISOString()
    };

    setStudyMaterials(prev => [obj, ...prev]);
    logActivity(`Added Document: ${newTitle}`, 'material', obj.id);

    // Set as active document and switch to Step 3 (View Document)
    setActiveMaterialId(obj.id);
    setCurrentStep(3);

    // Reset inputs
    setNewTitle('');
    setNewContent('');
    setNewFiles([]);
  };

  const handleDeleteMaterial = (id: string) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    if (activeMaterialId === id) {
      setActiveMaterialId(null);
      setCurrentStep(1);
    }
  };

  // Filtered materials by Search query and selected Group
  const filteredMaterials = studyMaterials.filter(m => {
    const matchesSearch = searchQuery.trim() === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((m as any).groupName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (searchQuery.trim() !== '') return matchesSearch;

    const mGroup = (m as any).groupName || "Science & Medical";
    return mGroup === selectedGroup;
  });

  const activeMaterial = studyMaterials.find(m => m.id === activeMaterialId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#fef3c7]">Personal Library</h1>
              <p className="text-xs text-orange-200/60 mt-0.5">3-Step non-scrolling document vault with instant search & reader</p>
            </div>
          </div>

          <button 
            onClick={() => setIsAddingGroupModal(true)}
            className="flex items-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-orange-200 rounded-2xl border border-white/10 text-xs font-bold transition-all"
          >
            <FolderPlus size={16} />
            <span>Add Group Category</span>
          </button>
        </div>

        {/* SEARCH BAR (Direct Requirement) */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search uploaded documents, notes, or topics instantly without downloading again..."
            className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-3 pl-12 pr-4 rounded-2xl text-[#fef3c7] focus:outline-none focus:border-orange-500 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-200/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3-STEP WORKFLOW TABS */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className={`py-3 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
            currentStep === 1 
              ? 'bg-orange-600 text-white border-orange-500 shadow-lg' 
              : 'bg-[#2a221f] text-orange-200/60 border-[#3f332c]'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase opacity-75 block">Step 1</span>
            <span className="text-xs font-bold">Select Category</span>
          </div>
          <Folder size={16} />
        </button>

        <button
          onClick={() => setCurrentStep(2)}
          className={`py-3 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
            currentStep === 2 
              ? 'bg-orange-600 text-white border-orange-500 shadow-lg' 
              : 'bg-[#2a221f] text-orange-200/60 border-[#3f332c]'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase opacity-75 block">Step 2</span>
            <span className="text-xs font-bold">Add Document</span>
          </div>
          <Plus size={16} />
        </button>

        <button
          onClick={() => setCurrentStep(3)}
          className={`py-3 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
            currentStep === 3 
              ? 'bg-orange-600 text-white border-orange-500 shadow-lg' 
              : 'bg-[#2a221f] text-orange-200/60 border-[#3f332c]'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase opacity-75 block">Step 3</span>
            <span className="text-xs font-bold">View & Read</span>
          </div>
          <Eye size={16} />
        </button>
      </div>

      {/* Add Group Category Modal */}
      {isAddingGroupModal && (
        <div className="bg-[#2a221f] p-6 rounded-3xl border border-orange-500/30 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-orange-300 text-sm">Create New Subject Category</h3>
            <button onClick={() => setIsAddingGroupModal(false)} className="text-xs text-orange-200/40 hover:text-white">Close</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Category Name (e.g. History)"
              value={newGroupNameInput}
              onChange={e => setNewGroupNameInput(e.target.value)}
              className="bg-[#1a1614] border border-[#3f332c] px-4 py-2 text-xs font-bold text-[#fef3c7] rounded-xl focus:outline-none focus:border-orange-500"
            />
            <input 
              type="text" 
              placeholder="Subgroup Name (e.g. World War II)"
              value={newSubgroupNameInput}
              onChange={e => setNewSubgroupNameInput(e.target.value)}
              className="bg-[#1a1614] border border-[#3f332c] px-4 py-2 text-xs font-bold text-[#fef3c7] rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>
          <button 
            onClick={handleAddGroup}
            className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md"
          >
            Create Category
          </button>
        </div>
      )}

      {/* STEP 1 VIEW: SELECT CATEGORY & VIEW DOCUMENT CARDS */}
      {currentStep === 1 && (
        <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          <div className="flex flex-wrap gap-2">
            {groupings.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGroup(g.name);
                  if (g.subgroups.length > 0) setSelectedSubgroup(g.subgroups[0]);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  selectedGroup === g.name 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'bg-[#1a1614] text-orange-200/70 hover:text-white border border-[#3f332c]'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map(mat => (
              <div 
                key={mat.id}
                onClick={() => {
                  setActiveMaterialId(mat.id);
                  setCurrentStep(3);
                }}
                className="p-5 bg-[#1a1614] hover:bg-[#221c19] rounded-2xl border border-[#3f332c] hover:border-orange-500/50 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-600/20 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                    {(mat as any).groupName || 'General'}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(mat.id); }}
                    className="text-orange-200/30 hover:text-rose-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#fef3c7] group-hover:text-orange-300 transition-colors line-clamp-1">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-orange-200/60 line-clamp-2 mt-1">
                    {mat.content || 'No summary notes attached.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#3f332c]/50 text-[11px] text-orange-200/50">
                  <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                  <span className="text-orange-400 font-bold flex items-center space-x-1">
                    <span>Read</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}

            {filteredMaterials.length === 0 && (
              <div className="col-span-full text-center py-12 text-orange-200/40 text-xs space-y-2">
                <FileText size={32} className="mx-auto text-orange-200/20" />
                <p>No documents found under this category.</p>
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="text-orange-400 font-bold hover:underline"
                >
                  Click here to add your first document (Step 2)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 VIEW: ADD DOCUMENT FORM */}
      {currentStep === 2 && (
        <form onSubmit={handleAddMaterialSubmit} className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          <h2 className="text-lg font-bold text-[#fef3c7]">Add Document / Notes to Category ({selectedGroup})</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Document Title</label>
              <input 
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry Reactions Summary"
                className="w-full bg-[#1a1614] border border-[#3f332c] px-4 py-3 rounded-2xl text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Text Summary & Key Notes</label>
              <textarea 
                rows={5}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Paste key formulas, notes, or chapter definitions here..."
                className="w-full bg-[#1a1614] border border-[#3f332c] p-4 rounded-2xl text-xs font-medium text-[#fef3c7] focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Attach Files / Documents</label>
              <div className="flex items-center space-x-3">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-4 bg-white/5 hover:bg-white/10 text-orange-300 rounded-xl text-xs font-bold border border-white/10"
                >
                  Upload Local File
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleSelectFiles} />
                <span className="text-xs text-orange-200/60">{newFiles.length} file(s) attached</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#3f332c]">
            <button 
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-bold text-orange-200/50 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              Save & Open Document (Step 3)
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 VIEW: READ DOCUMENT CONTENT IN BROWSER */}
      {currentStep === 3 && (
        <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          {activeMaterial ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#3f332c] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-600/20 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                    {(activeMaterial as any).groupName || 'General'}
                  </span>
                  <h2 className="text-2xl font-black text-[#fef3c7] mt-2">{activeMaterial.title}</h2>
                  <p className="text-xs text-orange-200/50">Created on {new Date(activeMaterial.createdAt).toLocaleDateString()}</p>
                </div>

                <button 
                  onClick={() => setCurrentStep(1)}
                  className="py-2 px-4 bg-white/5 hover:bg-white/10 text-orange-300 rounded-xl text-xs font-bold border border-white/10"
                >
                  Back to Library
                </button>
              </div>

              {/* Reader View Body */}
              <div className="bg-[#1a1614] p-6 rounded-2xl border border-[#3f332c] text-sm text-orange-100/90 leading-relaxed font-sans whitespace-pre-wrap">
                {activeMaterial.content || 'No text notes provided for this document.'}
              </div>

              {/* Attachments */}
              {activeMaterial.attachments && activeMaterial.attachments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-orange-300">Attached Reference Files:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeMaterial.attachments.map(att => (
                      <a 
                        key={att.id} 
                        href={att.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-[#1a1614] hover:bg-[#221c19] rounded-xl border border-[#3f332c] flex items-center justify-between text-xs font-bold text-orange-200"
                      >
                        <span className="truncate">{att.name}</span>
                        <Download size={14} className="text-orange-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-orange-200/40 text-xs space-y-2">
              <BookOpen size={32} className="mx-auto text-orange-200/20" />
              <p>No document currently selected to view.</p>
              <button 
                onClick={() => setCurrentStep(1)}
                className="text-orange-400 font-bold hover:underline"
              >
                Select a document from Step 1
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
