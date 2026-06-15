import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes and shows the error instead of a white screen.
 * A blank page tells you nothing; this tells you exactly what broke.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaced in the browser console too for debugging.
    console.error("Tally crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md p-6 text-sm">
          <h1 className="mb-2 text-lg font-bold text-destructive">
            Something broke
          </h1>
          <p className="mb-3 text-muted-foreground">
            This message replaces a white screen so you can see what happened:
          </p>
          <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
          <button
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
