/**
 * Gets the base URL of the application
 * Works in both development and production environments
 */
export function getBaseUrl(): string {
  // For Vercel deployments
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`
  }

  // Fallback for local development
  return "http://localhost:3000/"
}

/**
 * Gets the full URL for a specific path
 * @param path - The path to append to the base URL
 */
export function getUrl(path: string): string {
  return `${getBaseUrl()}${path.startsWith("/") ? path.slice(1) : path}`
}
