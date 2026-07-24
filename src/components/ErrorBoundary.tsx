import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "[ErrorBoundary] caught render error:",
      error,
      errorInfo.componentStack,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndReload = () => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (e) {
      console.error("[ErrorBoundary] failed to clear storage:", e);
    }
    window.location.replace("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/20 rounded-full px-3.5 py-[5px] mb-6">
            <span className="h-[5px] w-[5px] rounded-full bg-[hsl(229_94%_82%)]" />
            <span className="text-[11px] tracking-[0.16em] text-[hsl(229_94%_82%)] font-semibold uppercase">
              Something went wrong
            </span>
          </div>

          <h1
            className="font-display font-bold text-foreground mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            The page hit a snag.
          </h1>

          <p className="text-[15px] text-muted-foreground leading-[1.65] mb-8">
            A reload usually fixes it. If it keeps happening, clearing your session will reset any stale
            login state that might be causing it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={this.handleClearAndReload}
              className="text-[14px] font-semibold text-foreground/80 hover:text-foreground transition-base px-2"
            >
              Clear session and reload
            </button>
          </div>

          {this.state.error?.message && (
            <p className="mt-8 text-[12px] text-muted-foreground/60 font-mono break-words">
              {this.state.error.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
