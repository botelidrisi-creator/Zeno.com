import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Zeno.com Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0E1626] border border-blue-900/50 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black mx-auto text-xl shadow-lg shadow-blue-500/30">
              Z
            </div>
            <h1 className="text-xl font-black">Zeno.com</h1>
            <p className="text-xs text-slate-400">
              Something went wrong loading this session. Tap below to reload.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-400 bg-black/40 p-3 rounded-xl overflow-x-auto text-left font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="btn-3d-blue w-full py-3 rounded-xl text-white font-bold text-xs cursor-pointer"
            >
              Reset & Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
