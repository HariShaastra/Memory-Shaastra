// Offline Study & Local Synchronization Manager for Memory Shaastra
// Manages local persistence, network state, and sync queue

export interface QueuedSyncItem {
  id: string;
  type: 'session_complete' | 'task_update' | 'flashcard_review' | 'goal_achieved';
  data: any;
  timestamp: string;
}

export interface OfflineStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncTime: string | null;
}

const STORAGE_KEY_QUEUE = 'ms_offline_sync_queue';
const STORAGE_KEY_OFFLINE_DOCS = 'ms_offline_cached_materials';

class OfflineSyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(status: OfflineStatus) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
        this.notify();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  public getStatus(): OfflineStatus {
    const queue = this.getQueue();
    return {
      isOnline: this.isOnline,
      pendingSyncCount: queue.length,
      lastSyncTime: localStorage.getItem('ms_last_sync_time') || new Date().toISOString()
    };
  }

  public subscribe(cb: (status: OfflineStatus) => void): () => void {
    this.listeners.push(cb);
    cb(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(cb => {
      try {
        cb(status);
      } catch (e) {
        console.warn('Listener error in OfflineSyncManager:', e);
      }
    });
  }

  public getQueue(): QueuedSyncItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public enqueue(type: QueuedSyncItem['type'], data: any): void {
    try {
      const queue = this.getQueue();
      const newItem: QueuedSyncItem = {
        id: 'sync_' + Math.random().toString(36).substr(2, 9),
        type,
        data,
        timestamp: new Date().toISOString()
      };
      queue.push(newItem);
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
      
      // If currently online, process immediately
      if (this.isOnline) {
        this.processSyncQueue();
      } else {
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to enqueue offline item:', e);
    }
  }

  public async processSyncQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    // Simulate safe server sync flush
    try {
      // In production, each queued item would be POSTed to /api/sync
      localStorage.setItem('ms_last_sync_time', new Date().toISOString());
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify([]));
    } catch (e) {
      console.warn('Sync queue flush error:', e);
    }

    this.notify();
  }

  // Caching study materials for full offline reading
  public saveMaterialForOffline(materialId: string, materialData: any): void {
    try {
      const cached = this.getOfflineMaterials();
      cached[materialId] = {
        ...materialData,
        cachedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_OFFLINE_DOCS, JSON.stringify(cached));
    } catch (e) {
      console.warn('Failed to cache material offline:', e);
    }
  }

  public getOfflineMaterials(): Record<string, any> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFLINE_DOCS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }
}

export const offlineSyncManager = new OfflineSyncManager();
