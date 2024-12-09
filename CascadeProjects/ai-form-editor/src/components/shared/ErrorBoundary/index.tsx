import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  language?: 'en' | 'ar';
  rtl?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  public render() {
    const { language = 'en', rtl = false } = this.props;

    if (this.state.hasError) {
      return (
        <div className={`p-4 ${rtl ? 'rtl' : 'ltr'}`}>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <h2 className="text-lg font-semibold">
              {language === 'en' ? 'Something went wrong' : 'حدث خطأ ما'}
            </h2>
            <p className="text-sm mt-2">
              {language === 'en' 
                ? 'An error occurred while rendering this component'
                : 'حدث خطأ أثناء عرض هذا المكون'
              }
            </p>
            {this.state.error && (
              <pre className="mt-2 p-2 bg-destructive/10 rounded text-xs overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </Alert>

          <Button
            onClick={this.handleReset}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 me-2" />
            {language === 'en' ? 'Try Again' : 'حاول مرة أخرى'}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
