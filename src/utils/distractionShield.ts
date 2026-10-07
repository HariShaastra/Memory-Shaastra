// Distraction-Free Immersion Shield & Notification Interceptor for Memory Shaastra
// Ensures all notifications from other apps/sources are suppressed while using the app,
// and delivered only when the user exits the app.

export interface HeldNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

class DistractionShieldService {
  private isShieldActive: boolean = true;
  private isFullscreen: boolean = false;
  private wakeLockSentinel: any = null;
  private heldNotifications: HeldNotification[] = [];
  private listeners: Set<(active: boolean, heldCount: number) => void> = new Set();
  private originalNotification: typeof window.Notification | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Listen for visibility change (User exits or returns to app)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('pagehide', this.handleExit.bind(this));
    window.addEventListener('beforeunload', this.handleExit.bind(this));
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.notifyListeners();
    });

    // Intercept Web Notifications while app is active
    this.interceptWebNotifications();

    // Auto-request wake lock to prevent screen dimming/lock-screen notification wakeups
    this.requestWakeLock();
  }

  public subscribe(listener: (active: boolean, heldCount: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.isShieldActive, this.heldNotifications.length);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.isShieldActive, this.heldNotifications.length));
  }

  public isShieldEngaged(): boolean {
    return this.isShieldActive;
  }

  public getHeldCount(): number {
    return this.heldNotifications.length;
  }

  public getHeldNotifications(): HeldNotification[] {
    return [...this.heldNotifications];
  }

  public async requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !this.wakeLockSentinel) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
      }
    } catch {
      // Wake lock unsupported or restricted
    }
  }

  public async enterFullscreenImmersion(): Promise<boolean> {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        this.isFullscreen = true;
        this.notifyListeners();
        return true;
      }
    } catch (err) {
      console.log('Fullscreen immersion request:', err);
    }
    return false;
  }

  public async exitFullscreenImmersion(): Promise<void> {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        this.isFullscreen = false;
        this.notifyListeners();
      }
    } catch (err) {
      console.log('Fullscreen exit:', err);
    }
  }

  public async toggleShield(): Promise<boolean> {
    if (this.isFullscreen) {
      await this.exitFullscreenImmersion();
      this.isShieldActive = false;
    } else {
      await this.enterFullscreenImmersion();
      await this.requestWakeLock();
      this.isShieldActive = true;
    }
    this.notifyListeners();
    return this.isShieldActive;
  }

  /**
   * Queue a notification to be held silently until user exits the app.
   */
  public holdNotification(title: string, body: string) {
    if (this.isShieldActive && document.visibilityState === 'visible') {
      const item: HeldNotification = {
        id: 'held_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title,
        body,
        timestamp: Date.now()
      };
      this.heldNotifications.push(item);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Called when user exits or leaves the app window/tab.
   * Releases all held notifications.
   */
  private handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.handleExit();
    } else if (document.visibilityState === 'visible') {
      // Re-engage wake lock when returning to the app
      this.requestWakeLock();
    }
  }

  private handleExit() {
    // Deliver held notifications now that user has exited the app
    if (this.heldNotifications.length > 0) {
      this.flushHeldNotificationsOnExit();
    } else {
      // Send standard study summary exit notification if permission granted
      this.dispatchExitSummaryNotification();
    }
  }

  private flushHeldNotificationsOnExit() {
    const queue = [...this.heldNotifications];
    this.heldNotifications = [];
    this.notifyListeners();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const count = queue.length;
        const n = new (this.originalNotification || Notification)(
          `Memory Shaastra: ${count} Notification${count > 1 ? 's' : ''} Released`,
          {
            body: queue.map(q => `• ${q.title}: ${q.body}`).slice(0, 3).join('\n'),
            icon: '/favicon.ico'
          }
        );
        setTimeout(() => n.close(), 6000);
      } catch (err) {
        console.warn('Exit notification dispatch error:', err);
      }
    }
  }

  private dispatchExitSummaryNotification() {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new (this.originalNotification || Notification)(
          'Memory Shaastra Focus Session Ended',
          {
            body: 'You have exited the app. All outside notifications and scheduled revision alerts are now active.',
            icon: '/favicon.ico'
          }
        );
        setTimeout(() => n.close(), 5000);
      } catch {
        // Notification dispatch optional
      }
    }
  }

  private interceptWebNotifications() {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
        this.originalNotification = window.Notification;
        const self = this;

        // Wrap Notification constructor to prevent interruption while inside the app
        const PatchedNotification = function (title: string, options?: NotificationOptions) {
          if (self.isShieldActive && document.visibilityState === 'visible') {
            // Suppress notification banner and queue it for when user exits
            self.holdNotification(title, options?.body || '');
            return {
              close: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              onclick: null,
              onerror: null
            } as any;
          }

          // Outside app or shield inactive - dispatch normally
          if (self.originalNotification) {
            return new self.originalNotification(title, options);
          }
          return {} as any;
        } as any;

        PatchedNotification.permission = window.Notification.permission;
        if (typeof window.Notification.requestPermission === 'function') {
          PatchedNotification.requestPermission = window.Notification.requestPermission.bind(window.Notification);
        }
        PatchedNotification.maxActions = (window.Notification as any).maxActions;

        (window as any).Notification = PatchedNotification;
      }
    } catch {
      // Protected window property or unsupported Notification API in some browsers
    }
  }
}

export const distractionShield = new DistractionShieldService();
