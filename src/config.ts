const port = process.env.PORT || '3001';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  googleJwtUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/auth/jwt/google`,
  frontendBaseUrl: `http://localhost:${port}`,
  oauthCallbackUrl: `http://localhost:${port}/oauth/callback`,
} as const;
