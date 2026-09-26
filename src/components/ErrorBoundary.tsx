import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Uncaught Application Error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121622] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-serif-vintage text-white mb-2">
              تنبيه النظام الجنائي الرقمي
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-sans-body">
              حدث خطأ غير متوقع أثناء معالجة الواجهة. يمكنك إعادة تحميل الصفحة للمتابعة الفورية.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تشغيل المنصة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
