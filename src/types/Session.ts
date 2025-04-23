export interface Session {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}
