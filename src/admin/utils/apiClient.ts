/**
 * Safe API Client for YAAD Admin & Applet
 * Prevents "Unexpected end of JSON input" and non-JSON / HTML response parse crashes.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  code?: string;
  remainingAttempts?: number;
  lockoutUntil?: number;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });

    const contentType = res.headers.get('content-type') || '';
    let parsedData: any = null;

    if (contentType.includes('application/json')) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = null;
        }
      }
    } else {
      // Received HTML, XML, or plain text instead of JSON
      const rawText = await res.text();
      const isHtml = rawText.includes('<!DOCTYPE') || rawText.includes('<html');
      const is403 = res.status === 403;
      const is401 = res.status === 401;
      let errorMsg = rawText.trim() || `Unexpected response format from server (HTTP ${res.status}).`;

      if (is403) {
        errorMsg = 'Access Denied (HTTP 403 Forbidden). The server or deployment firewall denied access. Please check your admin permissions or disable conflicting browser extensions.';
      } else if (is401) {
        errorMsg = 'Authentication required or session expired (HTTP 401). Please sign in again.';
      } else if (isHtml) {
        errorMsg = `Backend API route not reachable (${res.status}). Server returned HTML page instead of JSON.`;
      }

      return {
        ok: false,
        status: res.status,
        error: errorMsg,
        code: is403 ? 'ACCESS_FORBIDDEN' : is401 ? 'UNAUTHORIZED' : 'INVALID_CONTENT_TYPE',
      };
    }

    if (!res.ok) {
      const errorMessage =
        (typeof parsedData?.error === 'string' ? parsedData.error : parsedData?.error?.message) ||
        parsedData?.message ||
        `Request failed with status ${res.status}.`;

      return {
        ok: false,
        status: res.status,
        data: parsedData,
        error: errorMessage,
        code: parsedData?.code || parsedData?.error?.code,
        remainingAttempts: parsedData?.remainingAttempts,
        lockoutUntil: parsedData?.lockoutUntil,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsedData as T,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || 'Network error: Failed to connect to server API.',
      code: 'NETWORK_ERROR',
    };
  }
}
