import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Type,
  Paperclip,
  FileText
} from 'lucide-react';
import { t } from '../utils/translations';
import { FirstLetterAid } from '../types';

export default function FirstLetterMethod() {
  const { firstLetterEntries, setFirstLetterEntries } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const acronym = useMemo(() => {
    return itemsText
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim()[0])
      .join(' ')
      .toUpperCase();
  }, [itemsText]);

  const handleSave = () => {
    const items = itemsText.split('\n').filter(item => item.trim());
    if (!title || items.length === 0) return;

    if (editingId) {
      setFirstLetterEntries(prev => prev.map(entry => 
        entry.id === editingId 
          ? { ...entry, title, description, items, mnemonic } 
          : entry
      ));
      setEditingId(null);
    } else {
      const newEntry: FirstLetterAid = {
        id: Date.now().toString(),
        title,
        description,
        items,
        mnemonic
      };
      setFirstLetterEntries(prev => [newEntry, ...prev]);
      setIsAdding(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setItemsText('');
    setMnemonic('');
  };

  const handleEdit = (entry: FirstLetterAid) => {
    setTitle(entry.title);
    setDescription(entry.description);
    setItemsText(entry.items.join('\n'));
    setMnemonic(entry.mnemonic);
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setFirstLetterEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic serif">{t.firstLetter}</h2>
          <p className="text-zinc-500 text-sm mt-1">Generate acronyms and mnemonics from lists.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>{t.add}</span>
          </button>
        )}
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm mb-12 overflow-hidden"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">{t.title}</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Components of GDP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">{t.conceptDescription}</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Brief explanation..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">{t.listOfItems}</label>
                  <textarea 
                    value={itemsText}
                    onChange={(e) => setItemsText(e.target.value)}
                    rows={5}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Consumer&#10;Investment&#10;Government&#10;Net Exports"
                  />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">{t.acronym}</label>
                    <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl text-2xl font-black tracking-[0.5em] text-center">
                      {acronym || '...'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">{t.mnemonic}</label>
                    <input 
                      type="text" 
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. Can I Get Now?"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-white/5">
                <button className="flex items-center space-x-2 text-zinc-400 hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-widest">
                  <Paperclip size={16} />
                  <span>{t.upload}</span>
                </button>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                    className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{t.save}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {firstLetterEntries.map(entry => (
          <motion.div 
            layout
            key={entry.id}
            className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black italic serif">{entry.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{entry.description}</p>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(entry)} className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(entry.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-3">{t.items}</p>
                <ul className="space-y-2">
                  {entry.items.map((item, idx) => (
                    <li key={idx} className="text-sm font-bold flex items-center space-x-2">
                      <span className="text-emerald-500">{item[0].toUpperCase()}</span>
                      <span className="text-zinc-600 dark:text-zinc-400">{item.slice(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-3">{t.acronym}</p>
                  <div className="text-3xl font-black tracking-[0.3em] text-emerald-500">{entry.items.map(i => i[0]).join(' ').toUpperCase()}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-3">{t.mnemonic}</p>
                  <p className="text-lg font-bold italic text-zinc-700 dark:text-zinc-300">"{entry.mnemonic}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
