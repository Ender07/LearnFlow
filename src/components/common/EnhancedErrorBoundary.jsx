import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to analytics service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report to error tracking service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const { fallbackMessage = "Something went wrong", showDetails = false } = this.props;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <Card className="shadow-2xl border-red-200">
              <CardHeader className="text-center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </motion.div>
                <CardTitle className="text-2xl text-red-800">Oops! Something Went Wrong</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-600 text-center text-lg">
                  {fallbackMessage}
                </p>
                
                {retryCount > 2 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      Multiple retry attempts detected. This might be a persistent issue. 
                      Try refreshing the page or contact support if the problem continues.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  
                  <Button variant="outline" onClick={this.handleReload}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                  
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                {showDetails && error && (
                  <details className="mt-6">
                    <summary className="cursor-pointer flex items-center gap-2 text-slate-600 hover:text-slate-800">
                      <Bug className="w-4 h-4" />
                      Technical Details
                    </summary>
                    <div className="mt-4 p-4 bg-slate-100 rounded-lg font-mono text-sm">
                      <div className="text-red-600 font-semibold mb-2">Error:</div>
                      <div className="mb-4">{error.toString()}</div>
                      {this.state.errorInfo && (
                        <>
                          <div className="text-red-600 font-semibold mb-2">Stack Trace:</div>
                          <pre className="whitespace-pre-wrap text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}

                <div className="text-center text-sm text-slate-500">
                  Error ID: {Date.now()}-{Math.random().toString(36).substr(2, 9)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;