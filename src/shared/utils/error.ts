import * as Sentry from '@sentry/react';

const isLocal = process.env.NODE_ENV === 'development';

export function initSentry() {
  if (isLocal) {
    return;
  }

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
  });
}

export function logError(error: unknown, errorInfo?: { [key: string]: unknown }) {
  if (isLocal) {
    return;
  }

  Sentry.withScope((scope) => {
    errorInfo && scope.setExtras(errorInfo);
    Sentry.captureException(error);
  });
}

export function onError(error: { message?: string; config?: { url?: string } }) {
  console.error(error);

  let errorInfo = {};
  let message = error.toString();
  if (!(error instanceof Error) && error.message) {
    errorInfo = error;
    message = error.message;
    error = new Error(message);
  } else if (error.config && error.config.url) {
    (errorInfo as any).url = error.config.url;
  }

  logError(error, errorInfo);
}
