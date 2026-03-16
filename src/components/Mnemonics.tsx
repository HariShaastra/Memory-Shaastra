import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, PenTool, Edit2, Check, X } from 'lucide-react';
import { Mnemonic } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export default function Mnemonics() {
  const { mnemonics, setMnemonics } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPhrase, setNewPhrase] = useState('');

  const addMnemonic = () => {
    if (!newTitle || !newPhrase) return;
    const item: Mnemonic = {
      id: Date.now().toString(),
      title: newTitle,
      phrase: newPhrase
    };
    setMnemonics([item, ...mnemonics]);
    resetForm();
  };

  const startEditing = (item: Mnemonic) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewPhrase(item.phrase);
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (!editingId || !newTitle || !newPhrase) return;
    setMnemonics(mnemonics.map(m => 
      m.id === editingId ? { ...m, title: newTitle, phrase: newPhrase } : m
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewPhrase('');
    setIsAdding(false);
    setEditingId(null);
  };

  const deleteMnemonic = (id: string) => {
    setMnemonics(mnemonics.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic serif">{t.mnemonics}</h2>
          <p className="text-zinc-500 text-sm">Create catchy phrases to remember complex sequences.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          <span>{t.add} {t.mnemonic}</span>
        </button>
      </header>

      {(isAdding || editingId) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-xl"
        >
          <h3 className="text-lg font-bold mb-4">
            {editingId ? t.edit : t.add} {t.mnemonic}
          </h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Concept Name (e.g. Order of Planets)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <textarea 
              placeholder="Mnemonic Phrase..."
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={resetForm} className="px-6 py-2 text-sm text-zinc-500 font-bold uppercase tracking-widest hover:text-zinc-700">
                {t.cancel}
              </button>
              <button 
                onClick={editingId ? saveEdit : addMnemonic} 
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
              >
                {t.save}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mnemonics.map((item) => (
          <div key={item.id} className="bg-white border border-zinc-200 rounded-3xl p-6 hover:border-emerald-500/50 transition-all group shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <PenTool size={20} />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => startEditing(item)}
                  className="text-zinc-300 hover:text-emerald-500 transition-colors p-1"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => deleteMnemonic(item.id)}
                  className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed italic">"{item.phrase}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
