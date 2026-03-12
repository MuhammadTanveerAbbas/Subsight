export function logError(error: any, context?: Record<string, any>) {
  let errorMessage = 'Unknown error';
  let errorStack = '';
  
  try {
    if (error instanceof Error) {
      errorMessage = error.message || 'Error with no message';
      errorStack = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Handle Supabase errors
      if (error.message) {
        errorMessage = String(error.message);
      } else if (error.error_description) {
        errorMessage = String(error.error_description);
      } else if (error.details) {
        errorMessage = String(error.details);
      } else if (error.hint) {
        errorMessage = String(error.hint);
      } else if (error.code) {
        errorMessage = `Error code: ${error.code}`;
      } else {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = 'Unable to stringify error object';
        }
      }
      errorStack = error.stack || '';
    }
  } catch (e) {
    errorMessage = 'Error occurred while processing error';
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.error('[Production Error]', {
      message: errorMessage || 'Unknown',
      stack: errorStack,
      context,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error('[Dev Error]', {
      message: errorMessage || 'Unknown',
      stack: errorStack,
      context,
      rawError: error,
    });
  }
}
