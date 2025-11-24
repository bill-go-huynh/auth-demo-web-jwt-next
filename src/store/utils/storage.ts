const TOKEN_STORAGE_KEY = 'jwt_tokens';

export interface TokenData {
  accessToken: string | null;
  refreshToken: string | null;
}

export function loadTokensFromStorage(): TokenData {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      const tokens = JSON.parse(stored) as { accessToken: string; refreshToken?: string };
      return {
        accessToken: tokens.accessToken || null,
        refreshToken: tokens.refreshToken || null,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { accessToken: null, refreshToken: null };
}

export function saveTokensToStorage(accessToken: string | null, refreshToken: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}
