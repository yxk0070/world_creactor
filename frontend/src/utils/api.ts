export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const fetchApi = async (url: string, options: FetchOptions = {}) => {
  const { timeout = 60000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const token = localStorage.getItem('auth_token') || '';

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new ApiError('请求过于频繁，请稍后再试 (Rate Limited)', 429);
    }
    if (response.status === 401) {
      throw new ApiError('未授权或 Token 已过期', 401);
    }
    if (!response.ok) {
      throw new ApiError(`请求失败: ${response.statusText}`, response.status);
    }

    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiError('请求超时或已取消', 408);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
};
