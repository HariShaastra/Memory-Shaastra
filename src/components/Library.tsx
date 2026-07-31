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
  ArrowRight,
  LayoutGrid,
  LayoutList,
  Filter,
  Sparkles,
  Check,
  ExternalLink
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

  // View Mode: Grid vs Line
  const [viewMode, setViewMode] = useState<'grid' | 'line'>('grid');

  // Search state & Filtered Search by Category
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchFilter, setCategorySearchFilter] = useState<string>('ALL');

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

  // Editing Group / Category modal
  const [editingGroup, setEditingGroup] = useState<Grouping | null>(null);
  const [editGroupNameInput, setEditGroupNameInput] = useState('');

  // Editing Document / Material state
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editGroup, setEditGroup] = useState('');

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

  const handleEditGroupSave = () => {
    if (!editingGroup || !editGroupNameInput.trim()) return;
    const oldName = editingGroup.name;
    const newName = editGroupNameInput.trim();

    const updatedGroupings = groupings.map(g => g.id === editingGroup.id ? { ...g, name: newName } : g);
    setGroupings(updatedGroupings);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updatedGroupings));

    setStudyMaterials(prev => prev.map(m => (m as any).groupName === oldName ? { ...m, groupName: newName } : m));

    if (selectedGroup === oldName) setSelectedGroup(newName);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    const updated = groupings.filter(g => g.id !== groupId);
    setGroupings(updated);
    localStorage.setItem('ms_library_groupings', JSON.stringify(updated));
    if (selectedGroup === groupName) {
      if (updated.length > 0) setSelectedGroup(updated[0].name);
    }
  };

  const handleSaveMaterialEdit = () => {
    if (!editingMaterial || !editTitle.trim()) return;
    setStudyMaterials(prev => prev.map(m => m.id === editingMaterial.id ? {
      ...m,
      title: editTitle,
      content: editContent,
      groupName: editGroup
    } as any : m));

    setEditingMaterial(null);
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

    setActiveMaterialId(obj.id);
    setCurrentStep(3);

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

  // Filtered materials by Search query and Filtered Search by Category
  const filteredMaterials = studyMaterials.filter(m => {
    const matCategory = (m as any).groupName || "Science & Medical";

    // Category Filter check
    if (categorySearchFilter !== 'ALL' && matCategory !== categorySearchFilter) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        m.title.toLowerCase().includes(q) || 
        m.content.toLowerCase().includes(q) ||
        matCategory.toLowerCase().includes(q);
      return matchesSearch;
    }

    // Default category view in Step 1 if no search query & category filter is set to default
    if (categorySearchFilter === 'ALL') {
      return matCategory === selectedGroup;
    }

    return true;
  });

  const activeMaterial = studyMaterials.find(m => m.id === activeMaterialId);
  const mainAttachment = activeMaterial?.attachments?.[0];
  const otherAttachments = activeMaterial?.attachments?.slice(1) || [];

  const handleOpenDocumentInBrowser = (att?: { url: string; name: string; type?: string }) => {
    if (!att || !att.url) return;

    try {
      if (att.url.startsWith('data:')) {
        const parts = att.url.split(',');
        const header = parts[0];
        const base64Data = parts[1] ? parts[1].trim() : '';

        let mime = 'application/pdf';
        const mimeMatch = header.match(/:(.*?);/);
        if (mimeMatch && mimeMatch[1] && mimeMatch[1] !== 'application/octet-stream') {
          mime = mimeMatch[1];
        } else if (att.name?.toLowerCase().endsWith('.png')) {
          mime = 'image/png';
        } else if (att.name?.toLowerCase().endsWith('.jpg') || att.name?.toLowerCase().endsWith('.jpeg')) {
          mime = 'image/jpeg';
        } else if (att.name?.toLowerCase().endsWith('.txt')) {
          mime = 'text/plain';
        }

        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        const win = window.open(blobUrl, '_blank');
        if (!win) {
          window.location.href = blobUrl;
        }
      } else {
        window.open(att.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening document in browser:', err);
      window.open(att.url, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header & Search Bar with Filtered Category Dropdown */}
      <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#fef3c7]">Personal Library</h1>
              <p className="text-xs text-orange-200/60 mt-0.5">Document library, category management & direct browser document links</p>
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

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtered Category Dropdown */}
          <div className="flex items-center space-x-2 bg-[#1a1614] border border-[#3f332c] px-3 py-2.5 rounded-2xl shrink-0">
            <Filter size={15} className="text-orange-400" />
            <select
              value={categorySearchFilter}
              onChange={e => setCategorySearchFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#fef3c7] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#1a1614]">Filter: All Categories</option>
              {groupings.map(g => (
                <option key={g.id} value={g.name} className="bg-[#1a1614]">
                  Filter: {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents & key notes within category..."
              className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-3 pl-12 pr-10 rounded-2xl text-[#fef3c7] focus:outline-none focus:border-orange-500 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-200/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
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
            <span className="text-xs font-bold">View Document</span>
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

      {/* STEP 1 VIEW: CATEGORY SELECTOR, GRID/LINE TOGGLE & DOCUMENTS */}
      {currentStep === 1 && (
        <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {groupings.map(g => (
                <div 
                  key={g.id}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedGroup === g.name 
                      ? 'bg-orange-600 text-white border-orange-500 shadow-md' 
                      : 'bg-[#1a1614] text-orange-200/70 hover:text-white border-[#3f332c]'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedGroup(g.name);
                      if (g.subgroups.length > 0) setSelectedSubgroup(g.subgroups[0]);
                    }}
                    className="font-bold"
                  >
                    {g.name}
                  </button>
                  <div className="flex items-center space-x-0.5 ml-1 border-l border-white/20 pl-1.5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGroup(g);
                        setEditGroupNameInput(g.name);
                      }}
                      className="p-1 hover:text-amber-300"
                      title="Edit Category"
                    >
                      <Edit2 size={11} />
                    </button>
                    {groupings.length > 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(g.id, g.name);
                        }}
                        className="p-1 hover:text-rose-300"
                        title="Delete Category"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid View / Line View Switcher Toggle */}
            <div className="flex items-center space-x-1 bg-[#1a1614] p-1 rounded-2xl border border-[#3f332c] self-start sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-orange-200/60 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('line')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'line' 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-orange-200/60 hover:text-white'
                }`}
                title="Line View"
              >
                <LayoutList size={14} />
                <span>Line</span>
              </button>
            </div>
          </div>

          {/* Edit Category Modal */}
          {editingGroup && (
            <div className="bg-[#1a1614] p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-xs font-bold text-amber-300">Edit Category Name:</span>
                <input 
                  type="text" 
                  value={editGroupNameInput}
                  onChange={e => setEditGroupNameInput(e.target.value)}
                  className="bg-[#2a221f] border border-[#3f332c] px-3 py-1.5 rounded-xl text-xs font-bold text-[#fef3c7] flex-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleEditGroupSave}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
                >
                  Save Name
                </button>
                <button 
                  onClick={() => setEditingGroup(null)}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 rounded-xl border border-stone-300 dark:border-stone-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Edit Document Modal */}
          {editingMaterial && (
            <div className="bg-white dark:bg-[#1a1614] p-6 rounded-2xl border border-stone-200 dark:border-orange-500/40 space-y-4 shadow-lg">
              <h3 className="font-bold text-sm text-stone-900 dark:text-orange-300">Edit Document Details</h3>
              <div className="space-y-3">
                <input 
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-amber-50/60 dark:bg-[#2a221f] border border-amber-200 dark:border-[#3f332c] px-3 py-2 rounded-xl text-xs font-bold text-stone-900 dark:text-[#fef3c7]"
                  placeholder="Title"
                />
                <textarea 
                  rows={4}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full bg-amber-50/60 dark:bg-[#2a221f] border border-amber-200 dark:border-[#3f332c] p-3 rounded-xl text-xs font-medium text-stone-900 dark:text-[#fef3c7] resize-none"
                  placeholder="Content / Notes"
                />
                <select 
                  value={editGroup}
                  onChange={e => setEditGroup(e.target.value)}
                  className="w-full bg-amber-50/60 dark:bg-[#2a221f] border border-amber-200 dark:border-[#3f332c] px-3 py-2 rounded-xl text-xs font-bold text-stone-900 dark:text-[#fef3c7]"
                >
                  {groupings.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 rounded-xl border border-stone-300 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveMaterialEdit}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' ? (
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
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-600/20 px-2.5 py-0.5 rounded-full border border-orange-500/20 flex items-center space-x-1">
                      <FileText size={10} />
                      <span>{(mat as any).groupName || 'General'}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMaterial(mat);
                          setEditTitle(mat.title);
                          setEditContent(mat.content);
                          setEditGroup((mat as any).groupName || selectedGroup);
                        }}
                        className="text-orange-200/40 hover:text-amber-300 p-1"
                        title="Edit Document"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(mat.id); }}
                        className="text-orange-200/30 hover:text-rose-400 p-1"
                        title="Delete Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
                      <span>View Document</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}

              {filteredMaterials.length === 0 && (
                <div className="col-span-full text-center py-12 text-orange-200/40 text-xs space-y-2">
                  <FileText size={32} className="mx-auto text-orange-200/20" />
                  <p>No documents found under this search/category filter.</p>
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="text-orange-400 font-bold hover:underline"
                  >
                    Click here to upload your document (Step 2)
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* LINE VIEW */
            <div className="space-y-3">
              {filteredMaterials.map(mat => (
                <div 
                  key={mat.id}
                  onClick={() => {
                    setActiveMaterialId(mat.id);
                    setCurrentStep(3);
                  }}
                  className="p-4 bg-[#1a1614] hover:bg-[#221c19] rounded-2xl border border-[#3f332c] hover:border-orange-500/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2.5 bg-orange-600/10 text-orange-400 rounded-xl border border-orange-500/20 shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-orange-400 bg-orange-600/20 px-2 py-0.5 rounded-md">
                          {(mat as any).groupName || 'General'}
                        </span>
                        <span className="text-[10px] text-orange-200/40">
                          {new Date(mat.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#fef3c7] group-hover:text-orange-300 transition-colors truncate mt-0.5">
                        {mat.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMaterialId(mat.id);
                        setCurrentStep(3);
                      }}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md"
                    >
                      <Eye size={13} />
                      <span>View Document</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMaterial(mat);
                        setEditTitle(mat.title);
                        setEditContent(mat.content);
                        setEditGroup((mat as any).groupName || selectedGroup);
                      }}
                      className="p-2 text-orange-200/40 hover:text-amber-300 hover:bg-white/5 rounded-xl"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(mat.id); }}
                      className="p-2 text-orange-200/30 hover:text-rose-400 hover:bg-white/5 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredMaterials.length === 0 && (
                <div className="text-center py-12 text-orange-200/40 text-xs space-y-2">
                  <FileText size={32} className="mx-auto text-orange-200/20" />
                  <p>No documents found under this search/category filter.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 2 VIEW: ADD DOCUMENT FORM */}
      {currentStep === 2 && (
        <form onSubmit={handleAddMaterialSubmit} className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          <h2 className="text-lg font-bold text-[#fef3c7]">Add Document to Category ({selectedGroup})</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Document Title</label>
              <input 
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry Reactions & Mechanism Guide"
                className="w-full bg-[#1a1614] border border-[#3f332c] px-4 py-3 rounded-2xl text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Text Summary & Chapter Notes</label>
              <textarea 
                rows={5}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Paste key formulas, notes, or chapter definitions here..."
                className="w-full bg-[#1a1614] border border-[#3f332c] p-4 rounded-2xl text-xs font-medium text-[#fef3c7] focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Attach Reference Document / File</label>
              <div className="flex items-center space-x-3">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-4 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white rounded-xl text-xs font-bold border border-orange-500/30 transition-all flex items-center space-x-2"
                >
                  <FileText size={16} />
                  <span>Attach Document File</span>
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf,image/*,.txt,.doc,.docx" multiple className="hidden" onChange={handleSelectFiles} />
                <span className="text-xs text-orange-200/60 font-bold">{newFiles.length} file(s) attached</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-stone-200 dark:border-[#3f332c]">
            <button 
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 rounded-xl border border-stone-300 dark:border-stone-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95"
            >
              Save & View Document (Step 3)
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 VIEW: DIRECT DOCUMENT VIEWER */}
      {currentStep === 3 && (
        <div className="bg-amber-50 dark:bg-[#2a221f] p-6 rounded-3xl border border-amber-200 dark:border-[#3f332c] space-y-6 shadow-xl transition-colors">
          {activeMaterial ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-[#3f332c] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-600/20 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                    {(activeMaterial as any).groupName || 'General'}
                  </span>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-[#fef3c7] mt-2">{activeMaterial.title}</h2>
                  <p className="text-xs text-stone-600 dark:text-orange-200/50">Uploaded on {new Date(activeMaterial.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="py-2 px-4 bg-stone-200/70 dark:bg-white/5 hover:bg-stone-300 dark:hover:bg-white/10 text-stone-800 dark:text-orange-300 rounded-xl text-xs font-bold border border-stone-300 dark:border-white/10 transition-all"
                  >
                    Back to Library
                  </button>
                </div>
              </div>

              {/* Single Primary Document Action Link */}
              {mainAttachment ? (
                <div className="p-5 bg-white dark:bg-[#1a1614] rounded-2xl border border-stone-200 dark:border-[#3f332c] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-500/20 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-[#fef3c7]">{mainAttachment.name}</h4>
                      <p className="text-xs text-stone-500 dark:text-orange-200/50">Attached Document — Direct Secure Browser View</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleOpenDocumentInBrowser(mainAttachment)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
                  >
                    <ExternalLink size={15} />
                    <span>Open Document in Browser</span>
                  </button>
                </div>
              ) : null}

              {/* Document Text Content / Chapter Notes Body */}
              <div className="p-6 bg-white dark:bg-[#1a1614] rounded-2xl border border-stone-200 dark:border-[#3f332c] space-y-3 shadow-sm">
                <div className="border-b border-stone-200 dark:border-[#3f332c] pb-3 mb-2 flex justify-between text-xs font-bold text-stone-500 dark:text-orange-200/60">
                  <span>DOCUMENT NOTES & SUMMARY</span>
                  <span>Personal Library</span>
                </div>

                <div className="leading-relaxed whitespace-pre-wrap font-sans text-stone-900 dark:text-orange-100 text-sm">
                  {activeMaterial.content || 'No text notes attached to this document.'}
                </div>
              </div>

              {/* Other Reference Files (if additional attachments exist) */}
              {otherAttachments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-stone-700 dark:text-orange-300">Other Attached Files:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherAttachments.map(att => (
                      <button 
                        key={att.id} 
                        type="button"
                        onClick={() => handleOpenDocumentInBrowser(att)}
                        className="p-3 bg-white dark:bg-[#1a1614] hover:bg-stone-100 dark:hover:bg-[#221c19] rounded-xl border border-stone-200 dark:border-[#3f332c] flex items-center justify-between text-xs font-bold text-stone-800 dark:text-orange-200 text-left w-full cursor-pointer transition-all"
                      >
                        <span className="truncate">{att.name}</span>
                        <ExternalLink size={14} className="text-orange-500 dark:text-orange-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500 dark:text-orange-200/40 text-xs space-y-2">
              <BookOpen size={32} className="mx-auto text-stone-300 dark:text-orange-200/20" />
              <p>No document currently selected to view.</p>
              <button 
                onClick={() => setCurrentStep(1)}
                className="text-orange-600 dark:text-orange-400 font-bold hover:underline"
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

