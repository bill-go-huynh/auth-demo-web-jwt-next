import { env } from '@/config';

const apiBaseUrl = env.apiBaseUrl;

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const url = `${apiBaseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = `HTTP error! status: ${response.status}`;
    let statusCode = response.status;

    try {
      const body = await response.json();
      if (body.statusCode && body.message) {
        statusCode = body.statusCode;
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      message = response.statusText ?? message;
    }

    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = statusCode;
    throw error;
  }

  if (response.status === 204 || response.status === 205) {
    return null as T;
  }

  try {
    return await response.json();
  } catch {
    return null as T;
  }
}

export function getErrorInfo(error: unknown): {
  message: string;
  statusCode: number;
} {
  if (error instanceof Error) {
    const err = error as Error & { statusCode?: number };
    return {
      message: err.message,
      statusCode: err.statusCode ?? 0,
    };
  }
  return { message: 'Unknown error occurred', statusCode: 0 };
}

export { fetchApi };
