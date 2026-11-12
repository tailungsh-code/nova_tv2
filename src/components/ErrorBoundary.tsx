import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#080B14] text-white p-6">
          <div className="max-w-md w-full rounded-3xl bg-[#101827] border border-white/10 p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#FF365D]/15 text-[#FF365D] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="font-display text-xl font-bold">NOVA TV encountered an error</h1>
            <p className="mt-2 text-sm text-[#A7B0C0]">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
