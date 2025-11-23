export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  googleJwtUrl: process.env.NEXT_PUBLIC_GOOGLE_JWT_URL || 'http://localhost:8080/auth/google/jwt',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Auth Demo - JWT Client',
} as const;
