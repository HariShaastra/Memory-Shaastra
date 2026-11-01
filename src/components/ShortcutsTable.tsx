import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FACILITY_SHORTCUTS } from '../utils/shortcuts';
import { Keyboard, Search, ExternalLink } from 'lucide-react';

export function ShortcutsTable({ title = "Facility Keyboard Shortcuts" }: { title?: string }) {
  const { setView, theme } = useApp();
  const isLight = theme === 'light';

  const [shortcutSearch, setShortcutSearch] = useState('');
  const [shortcutCategory, setShortcutCategory] = useState<'All' | 'Core' | 'Tools' | 'Support'>('All');

  const filteredShortcuts = FACILITY_SHORTCUTS.filter(s => {
    const matchesCat = shortcutCategory === 'All' || s.category === shortcutCategory;
    const query = shortcutSearch.toLowerCase();
    const matchesSearch = 
      s.label.toLowerCase().includes(query) ||
      s.keyDisplay.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <section className={`rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl space-y-6 border transition-colors ${
      isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 border border-orange-500/30">
            <Keyboard size={22} />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-black italic uppercase tracking-tight ${
              isLight ? 'text-stone-900' : 'text-orange-100'
            }`}>
              {title}
            </h3>
            <p className={`text-xs font-medium ${isLight ? 'text-stone-500' : 'text-orange-200/60'}`}>
              Non-conflicting global shortcuts (press <strong>Alt + Shift + Key</strong>) to launch any facility
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-orange-600/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-black uppercase tracking-wider self-start sm:self-center">
          21 Shortcuts Active
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Core', 'Tools', 'Support'] as const).map(cat => {
            const count = cat === 'All' 
              ? FACILITY_SHORTCUTS.length 
              : FACILITY_SHORTCUTS.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setShortcutCategory(cat)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  shortcutCategory === cat
                    ? 'bg-orange-600 text-white font-black border-orange-500 shadow-sm'
                    : isLight
                    ? 'bg-orange-50/70 hover:bg-orange-100 text-stone-700 border-orange-200'
                    : 'bg-[#1a1614] hover:bg-[#342722] text-orange-200/80 border-[#3f332c]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={shortcutSearch}
            onChange={e => setShortcutSearch(e.target.value)}
            placeholder="Search shortcuts or keys..."
            className={`w-full text-xs py-2 pl-8 pr-7 rounded-xl border focus:outline-none focus:border-orange-500 ${
              isLight ? 'bg-orange-50/50 border-orange-200 text-stone-900' : 'bg-[#14100e] border-[#362923] text-white'
            }`}
          />
          {shortcutSearch && (
            <button
              onClick={() => setShortcutSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Responsive Shortcuts Display - ZERO SIDE SCROLLING on mobile, tablet & desktop */}
      {/* Mobile & Tablet Card Grid (< lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3 w-full max-w-full">
        {filteredShortcuts.map(shortcut => (
          <div
            key={shortcut.id}
            onClick={() => setView(shortcut.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-sm active:scale-[0.99] group ${
              isLight 
                ? 'bg-orange-50/40 hover:bg-orange-100/70 border-orange-200' 
                : 'bg-[#1e1715] hover:bg-[#2c211c] border-[#382b25]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-black text-sm tracking-tight text-stone-900 dark:text-orange-100 group-hover:text-orange-600 transition-colors break-words">
                  {shortcut.label}
                </h4>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  shortcut.category === 'Core'
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                    : shortcut.category === 'Tools'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                }`}>
                  {shortcut.category}
                </span>
              </div>

              <kbd className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-mono font-black text-xs shadow-sm shrink-0 whitespace-nowrap">
                {shortcut.keyDisplay}
              </kbd>
            </div>

            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              {shortcut.description}
            </p>

            <div className="pt-1 flex items-center justify-between text-xs font-black text-orange-600 dark:text-orange-400">
              <span className="text-[11px] opacity-80 group-hover:opacity-100">Tap card to open</span>
              <div className="flex items-center gap-1">
                <span>Open</span>
                <ExternalLink size={12} className="shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (lg+) - Strict width & wrap with ZERO side scrolling */}
      <div className="hidden lg:block rounded-2xl border border-orange-500/20 w-full max-w-full overflow-hidden">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead>
            <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
              isLight ? 'bg-orange-50 text-stone-700 border-orange-200' : 'bg-[#181311] text-orange-200/70 border-[#3f332c]'
            }`}>
              <th className="py-3 px-4 w-[25%]">Facility</th>
              <th className="py-3 px-3 w-[15%]">Category</th>
              <th className="py-3 px-3 w-[20%]">Shortcut Key</th>
              <th className="py-3 px-4 w-[30%]">Function & Purpose</th>
              <th className="py-3 px-3 w-[10%] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-500/10">
            {filteredShortcuts.map(shortcut => (
              <tr 
                key={shortcut.id}
                className={`transition-colors ${
                  isLight ? 'hover:bg-orange-50/60' : 'hover:bg-[#342722]/50'
                }`}
              >
                <td className="py-3 px-4 font-black">
                  <span className={`break-words ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
                    {shortcut.label}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-block ${
                    shortcut.category === 'Core'
                      ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                      : shortcut.category === 'Tools'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {shortcut.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <kbd className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-mono font-black text-[11px] shadow-sm inline-block whitespace-nowrap">
                    {shortcut.keyDisplay}
                  </kbd>
                </td>
                <td className={`py-3 px-4 text-xs break-words ${
                  isLight ? 'text-stone-600' : 'text-orange-200/70'
                }`}>
                  {shortcut.description}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => setView(shortcut.id)}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95 ${
                      isLight 
                        ? 'bg-white hover:bg-orange-100 text-stone-800 border-orange-200' 
                        : 'bg-[#1a1614] hover:bg-[#382b25] text-orange-200 border-[#3f332c]'
                    }`}
                    title={`Open ${shortcut.label}`}
                  >
                    <span>Open</span>
                    <ExternalLink size={11} className="text-orange-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredShortcuts.length === 0 && (
        <div className="py-8 text-center space-y-1">
          <p className="text-xs font-bold text-stone-500 dark:text-orange-200/50">
            No shortcuts match "{shortcutSearch}"
          </p>
          <button
            onClick={() => { setShortcutSearch(''); setShortcutCategory('All'); }}
            className="text-xs font-black text-orange-600 hover:underline cursor-pointer"
          >
            Clear search filter
          </button>
        </div>
      )}
    </section>
  );
}
