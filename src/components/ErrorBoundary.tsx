import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('YAAD UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isUrdu =
        typeof window !== 'undefined' &&
        (localStorage.getItem('yaad_language') === 'ur' ||
          window.location.search.includes('lang=ur'));

      return (
        <main
          id="error_boundary_container"
          className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="w-full max-w-md bg-surface-container-lowest border border-surface-dim rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-error-container/40 text-error flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-on-surface">
                {isUrdu ? 'کوئی غیر متوقع مسئلہ پیش آ گیا ہے' : 'Something unexpected occurred'}
              </h1>
              <p className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed">
                {isUrdu
                  ? 'پریشان نہ ہوں، آپ کا ڈیٹا محفوظ ہے۔ براہ کرم صفحہ دوبارہ لوڈ کریں یا ہوم اسکرین پر واپس جائیں۔'
                  : "Don't worry, your lists and data are safe. Please reload the view or return to home."}
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-surface-container rounded-xl text-start text-[11px] font-mono text-outline-variant overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="error_boundary_reload_btn"
                type="button"
                onClick={this.handleReload}
                className="flex-1 h-11 rounded-full bg-primary text-on-primary font-['Manrope'] text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isUrdu ? 'دوبارہ لوڈ کریں' : 'Reload App'}</span>
              </button>
              <button
                id="error_boundary_home_btn"
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 h-11 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                <span>{isUrdu ? 'ہوم اسکرین' : 'Go to Home'}</span>
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
