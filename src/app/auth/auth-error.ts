import { HttpErrorResponse } from '@angular/common/http';

interface ValidationDetail {
  loc?: Array<string | number>;
  msg?: string;
}

export function getAuthApiError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'The authentication service is not reachable. Please try again shortly.';
  }

  const detail: unknown = error.error?.detail ?? error.error?.message ?? error.error;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: ValidationDetail) => {
        if (!item?.msg) {
          return null;
        }

        const field = item.loc?.at(-1);
        return typeof field === 'string' ? `${formatFieldName(field)}: ${item.msg}` : item.msg;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return fallback;
}

function formatFieldName(field: string): string {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
