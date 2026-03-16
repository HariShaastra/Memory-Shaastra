import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Link as LinkIcon, ChevronRight, Edit2 } from 'lucide-react';
import { LinkChain } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export default function LinkingMethod() {
  const { linkChains, setLinkChains } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newItems, setNewItems] = useState('');
  const [newStory, setNewStory] = useState('');

  const addChain = () => {
    if (!newTitle || !newItems) return;
    const chain: LinkChain = {
      id: Date.now().toString(),
      title: newTitle,
      items: newItems.split(',').map(i => i.trim()),
      story: newStory
    };
    setLinkChains([chain, ...linkChains]);
    resetForm();
  };

  const startEditing = (chain: LinkChain) => {
    setEditingId(chain.id);
    setNewTitle(chain.title);
    setNewItems(chain.items.join(', '));
    setNewStory(chain.story);
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (!editingId || !newTitle || !newItems) return;
    setLinkChains(linkChains.map(c => 
      c.id === editingId ? { 
        ...c, 
        title: newTitle, 
        items: newItems.split(',').map(i => i.trim()), 
        story: newStory 
      } : c
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewItems('');
    setNewStory('');
    setIsAdding(false);
    setEditingId(null);
  };

  const deleteChain = (id: string) => {
    setLinkChains(linkChains.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic serif dark:text-white">{t.linking}</h2>
          <p className="text-zinc-500 text-sm">Create story chains connecting unrelated ideas.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          <span>{t.add} Story</span>
        </button>
      </header>

      {(isAdding || editingId) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-xl"
        >
          <h3 className="text-lg font-bold mb-4 dark:text-white">{editingId ? t.edit : t.add} Story</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Topic Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
            <input 
              type="text" 
              placeholder="Items (comma separated: Apple, Car, Dog...)"
              value={newItems}
              onChange={(e) => setNewItems(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
            <textarea 
              placeholder="Write your story linking these items..."
              value={newStory}
              onChange={(e) => setNewStory(e.target.value)}
              rows={4}
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none dark:text-white"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={resetForm} className="px-6 py-2 text-sm text-zinc-500 font-bold uppercase tracking-widest hover:text-zinc-700 dark:hover:text-zinc-300">{t.cancel}</button>
              <button onClick={editingId ? saveEdit : addChain} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600">{t.save}</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {linkChains.map((chain) => (
          <div key={chain.id} className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm hover:border-emerald-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold dark:text-white">{chain.title}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => startEditing(chain)}
                  className="text-zinc-300 hover:text-emerald-500 transition-colors p-1"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteChain(chain.id)}
                  className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {chain.items.map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-xs font-medium dark:text-zinc-300">{item}</span>
                  {i < chain.items.length - 1 && <ChevronRight size={14} className="mx-1 text-zinc-300" />}
                </div>
              ))}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5">
              <p className="text-sm text-zinc-500 leading-relaxed italic">"{chain.story}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
