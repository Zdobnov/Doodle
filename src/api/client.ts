import type { ApiErrorBody } from '../types/api';

const DEFAULT_API_BASE_URL = '';
const DEFAULT_AUTH_TOKEN = 'super-secret-doodle-token';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type RequestConfig = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
};

function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

  return baseUrl.replace(/\/$/, '');
}

function getAuthToken(): string {
  return import.meta.env.VITE_API_AUTH_TOKEN ?? DEFAULT_AUTH_TOKEN;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getBaseUrl();
  const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;

  if (!params) {
    return url;
  }

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value)).replaceAll(
        '%3A',
        ':',
      );

      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');

  return query ? `${url}?${query}` : url;
}

async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function extractErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const errorBody = body as ApiErrorBody;

    if (typeof errorBody.message === 'string') {
      return errorBody.message;
    }

    if (typeof errorBody.error === 'string') {
      return errorBody.error;
    }
  }

  if (typeof body === 'string' && body.length > 0) {
    return body;
  }

  return `Request failed with status ${status}`;
}

/**
 * Reusable HTTP client for all API requests.
 * Handles auth headers, JSON serialization, and centralized error handling.
 */
export async function request<T>(
  path: string,
  config: RequestConfig = {},
): Promise<T> {
  const { body, params, headers, ...init } = config;
  const url = buildUrl(path, params);

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${getAuthToken()}`,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      throw cause;
    }

    const message =
      cause instanceof Error ? cause.message : 'Network request failed';
    throw new ApiError(message, 0, cause);
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new ApiError(
      extractErrorMessage(response.status, errorBody),
      response.status,
      errorBody,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
