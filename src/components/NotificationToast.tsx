import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Bell, X, Calendar, AlertCircle, Trophy } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AppNotification } from '../types';

export function NotificationToast() {
  const { notifications } = useAppContext();
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    // Show most recent unread notification if it's less than 30 seconds old
    const recentUnread = notifications.find(n => !n.read && (Date.now() - new Date(n.timestamp).getTime() < 30000));
    if (recentUnread && (!activeToast || activeToast.id !== recentUnread.id)) {
      setActiveToast(recentUnread);
      const timer = setTimeout(() => setActiveToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!activeToast) return null;

  const getTypeStyles = (type: AppNotification['type']) => {
    switch (type) {
      case 'motivational': return { icon: <Zap size={20} />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'reminder': return { icon: <Calendar size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
      case 'exam': return { icon: <AlertCircle size={20} />, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
      case 'achievement': return { icon: <Trophy size={20} />, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      default: return { icon: <Bell size={20} />, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    }
  };

  const styles = getTypeStyles(activeToast.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
      >
        <div className={`bg-[#2a221f] border-2 ${styles.border} p-5 rounded-[2rem] shadow-2xl shadow-black/50 flex gap-4 items-start relative overflow-hidden group`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-500" />
          
          <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${styles.bg} ${styles.color} border border-white/5`}>
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-sm font-black text-orange-100 uppercase italic tracking-tight mb-1 truncate">
              {activeToast.title}
            </h4>
            <p className="text-xs text-orange-200/70 font-medium leading-relaxed">
              {activeToast.message}
            </p>
          </div>

          <button 
            onClick={() => setActiveToast(null)}
            className="absolute top-4 right-4 p-1 text-orange-200/20 hover:text-orange-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
