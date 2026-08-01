import './styles.scss';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';

interface AsyncBoundaryProps {
  children: ReactNode;
  onRetry(): void;
}

interface AsyncBoundaryState {
  failed: boolean;
}

class AsyncErrorBoundary extends Component<
  AsyncBoundaryProps,
  AsyncBoundaryState
> {
  state = { failed: false };

  static getDerivedStateFromError(): AsyncBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // React reports the original error; this boundary keeps the shell usable.
  }

  render() {
    return this.state.failed ? (
      <AsyncErrorFallback onRetry={this.props.onRetry} />
    ) : (
      this.props.children
    );
  }
}

function AsyncErrorFallback({ onRetry }: Pick<AsyncBoundaryProps, 'onRetry'>) {
  const { copy } = useLocalization();
  return (
    <section className="async-boundary-message" role="alert">
      <p>{copy.shell.moduleLoadFailed}</p>
      <Button variant="primary" onClick={onRetry}>
        {copy.shell.retry}
      </Button>
    </section>
  );
}

function AsyncLoading() {
  const { copy } = useLocalization();
  return (
    <p className="async-boundary-message" role="status">
      {copy.shell.moduleLoading}
    </p>
  );
}

export { AsyncErrorBoundary as AsyncBoundary, AsyncLoading };
