// ===================================================================
// ERROR BOUNDARY — Graceful error handling for React components
// ===================================================================

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
            <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-6 max-w-md backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h1 className="text-lg font-bold text-red-300">Something went wrong</h1>
              </div>

              <p className="text-sm text-red-200 mb-4 font-mono break-words">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>

              <p className="text-xs text-red-300 mt-4">
                If this persists, check the console logs for details.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
