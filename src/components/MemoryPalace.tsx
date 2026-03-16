import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Map, MapPin, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { MemoryPalace as PalaceType } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export default function MemoryPalace() {
  const { memoryPalaces, setMemoryPalaces } = useAppContext();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');
  const [editLocConcept, setEditLocConcept] = useState('');

  const selectedPalace = memoryPalaces.find(p => p.id === selectedId);

  const addPalace = () => {
    if (!newName) return;
    const palace: PalaceType = {
      id: Date.now().toString(),
      name: newName,
      locations: []
    };
    setMemoryPalaces([...memoryPalaces, palace]);
    setNewName('');
    setIsAdding(false);
  };

  const deletePalace = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMemoryPalaces(memoryPalaces.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addLocation = (palaceId: string) => {
    const name = prompt('Location Name (e.g. Bedroom Window):');
    if (!name) return;
    const concept = prompt('Concept to attach (optional):') || '';
    
    setMemoryPalaces(memoryPalaces.map(p => {
      if (p.id === palaceId) {
        return {
          ...p,
          locations: [...p.locations, { id: Date.now().toString(), name, concept }]
        };
      }
      return p;
    }));
  };

  const deleteLocation = (palaceId: string, locId: string) => {
    setMemoryPalaces(memoryPalaces.map(p => {
      if (p.id === palaceId) {
        return {
          ...p,
          locations: p.locations.filter(l => l.id !== locId)
        };
      }
      return p;
    }));
  };

  const startEditingLoc = (loc: { id: string, name: string, concept: string }) => {
    setEditingLocId(loc.id);
    setEditLocName(loc.name);
    setEditLocConcept(loc.concept);
  };

  const saveLocEdit = (palaceId: string) => {
    if (!editingLocId) return;
    setMemoryPalaces(memoryPalaces.map(p => {
      if (p.id === palaceId) {
        return {
          ...p,
          locations: p.locations.map(l => 
            l.id === editingLocId ? { ...l, name: editLocName, concept: editLocConcept } : l
          )
        };
      }
      return p;
    }));
    setEditingLocId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic serif dark:text-white">{t.palace}</h2>
          <p className="text-zinc-500 text-sm">Assign concepts to locations in a familiar place.</p>
        </div>
        {!selectedId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 w-full md:w-auto justify-center"
          >
            <Plus size={18} />
            <span>{t.add} {t.palace}</span>
          </button>
        )}
      </header>

      {selectedId ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button 
            onClick={() => setSelectedId(null)}
            className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 flex items-center space-x-2"
          >
            <ChevronRight className="rotate-180" size={14} />
            <span>{t.back}</span>
          </button>

          <div className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold dark:text-white">{selectedPalace?.name}</h3>
              <button 
                onClick={() => addLocation(selectedId)}
                className="bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10"
              >
                {t.add} {t.items}
              </button>
            </div>

            <div className="space-y-4">
              {selectedPalace?.locations.map((loc, i) => (
                <div key={loc.id} className="flex items-center space-x-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingLocId === loc.id ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          value={editLocName}
                          onChange={(e) => setEditLocName(e.target.value)}
                          className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm dark:text-white"
                        />
                        <input 
                          type="text" 
                          value={editLocConcept}
                          onChange={(e) => setEditLocConcept(e.target.value)}
                          className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs dark:text-white"
                        />
                        <div className="flex space-x-2">
                          <button onClick={() => saveLocEdit(selectedId)} className="text-emerald-500"><Check size={16}/></button>
                          <button onClick={() => setEditingLocId(null)} className="text-red-500"><X size={16}/></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-bold text-sm dark:text-white truncate">{loc.name}</h4>
                        <p className="text-xs text-zinc-500 truncate">{loc.concept || 'No concept attached'}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditingLoc(loc)}
                      className="text-zinc-300 hover:text-emerald-500 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteLocation(selectedId, loc.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {selectedPalace?.locations.length === 0 && (
                <div className="text-center py-12 text-zinc-500 italic text-sm">
                  No locations added yet. Start by adding your first location.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdding && (
            <div className="bg-white dark:bg-[#151619] border-2 border-dashed border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-center">
              <input 
                autoFocus
                type="text" 
                placeholder="Palace Name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPalace()}
                className="bg-transparent border-b border-zinc-200 dark:border-white/10 py-2 text-sm outline-none mb-4 dark:text-white"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsAdding(false)} className="text-[10px] font-bold uppercase text-zinc-500">{t.cancel}</button>
                <button onClick={addPalace} className="text-[10px] font-bold uppercase text-emerald-500">{t.save}</button>
              </div>
            </div>
          )}
          {memoryPalaces.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedId(p.id)}
              className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm relative"
            >
              <button 
                onClick={(e) => deletePalace(e, p.id)}
                className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map size={24} />
              </div>
              <h3 className="font-bold text-lg mb-1 dark:text-white">{p.name}</h3>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest">{p.locations.length} {t.items}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
