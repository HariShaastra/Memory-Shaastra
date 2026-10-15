import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown runtime error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Memory Shaastra Runtime Caught Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      // Clear potentially corrupt keys without deleting user identity
      const keysToClean = [
        'ms_study_materials',
        'ms_library_groupings',
        'ms_custom_calendar_events',
        'ms_study_bubble_active_session'
      ];
      keysToClean.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1614] text-amber-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#2a221f] border-2 border-orange-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl">
              🧠
            </div>
            <div>
              <h1 className="text-2xl font-black text-amber-100 italic">Memory Shaastra</h1>
              <p className="text-xs text-orange-200/70 mt-1">
                A temporary error occurred while rendering your workspace.
              </p>
            </div>
            {this.state.errorMessage && (
              <div className="p-3 bg-black/40 border border-[#3f332c] rounded-xl text-left text-xs font-mono text-orange-300 break-words max-h-32 overflow-y-auto">
                {this.state.errorMessage}
              </div>
            )}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
              >
                Reload & Continue
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full py-3 bg-[#1a1614] hover:bg-[#342722] text-orange-200/80 font-bold text-xs uppercase tracking-wider rounded-xl border border-[#3f332c] cursor-pointer transition-all"
              >
                Safe Recovery (Refresh Cache)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
