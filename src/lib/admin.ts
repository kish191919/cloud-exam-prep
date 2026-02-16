/**
 * Check if a user is the admin.
 * Set VITE_ADMIN_EMAIL in .env (and Vercel env vars) to your email.
 */
export function isAdmin(userEmail?: string | null): boolean {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  if (!adminEmail || !userEmail) return false;
  return userEmail.toLowerCase() === adminEmail.toLowerCase();
}
