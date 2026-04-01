// Welding AI Configuration
// Production: Set VITE_API_BASE_URL in Vercel dashboard → Project Settings → Environment Variables
// Development: Falls back to localhost:8000

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.DEV ? 'http://localhost:8000' : '');
