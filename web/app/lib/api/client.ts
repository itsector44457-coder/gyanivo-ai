export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://gyanivo-api.onrender.com'
    : 'http://localhost:5000');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('gyanivo_access_token') : null;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: 'include',
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    // Auto refresh token on 401 if not already requesting refresh/login.
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.accessToken && typeof window !== 'undefined') {
            localStorage.setItem('gyanivo_access_token', refreshData.accessToken);
          }

          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${refreshData.accessToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new ApiError(errorData.message || 'Request failed after refresh', retryResponse.status, errorData);
          }
          return retryResponse.json();
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gyanivo_access_token');
          localStorage.removeItem('accessToken');
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API Error: ${response.status} ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error or service unreachable',
      0,
    );
  }
}
