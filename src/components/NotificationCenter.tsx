import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Trophy, 
  Calendar,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AppNotification } from '../types';

export default function NotificationCenter() {
  const { notifications, markAsRead, clearAllNotifications, goBack } = useAppContext();

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'motivational': return <Zap className="text-amber-500" size={20} />;
      case 'reminder': return <Calendar className="text-blue-500" size={20} />;
      case 'exam': return <AlertCircle className="text-rose-500" size={20} />;
      case 'achievement': return <Trophy className="text-orange-500" size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="p-2 hover:bg-orange-500/10 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-orange-500" />
          </button>
          <h1 className="text-3xl font-black text-orange-100 italic uppercase">
            Notification <span className="text-orange-500">Center</span>
          </h1>
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={clearAllNotifications}
            className="flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1614] p-12 rounded-[2rem] border border-[#3f332c] text-center"
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                <Bell size={24} className="text-orange-500/40" />
              </div>
              <p className="text-orange-100/60 font-bold italic">All caught up! No new notifications.</p>
            </motion.div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className={`group relative p-6 rounded-[2rem] border transition-all ${
                  notif.read 
                    ? 'bg-[#1a1614]/40 border-[#3f332c]/30' 
                    : 'bg-[#2a221f] border-orange-500/30 shadow-lg shadow-orange-500/5'
                }`}
              >
                <div className="flex gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                    notif.read ? 'bg-[#1a1614] border-[#3f332c]/50' : 'bg-[#1a1614] border-orange-500/30 shadow-lg shadow-orange-500/10'
                  }`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-black uppercase italic tracking-tighter ${
                        notif.read ? 'text-orange-100/40' : 'text-orange-100'
                      }`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-200/20">
                        {getTimeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      notif.read ? 'text-orange-200/30' : 'text-orange-200/70'
                    }`}>
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl self-start transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
