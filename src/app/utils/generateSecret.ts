import crypto from 'crypto';

/**
 * Generate a cryptographically secure random hex string
 * @param bytes - number of bytes (default 64)
 * @returns hex string
 */
export function generateSecret(bytes: number = 64): string {
  return crypto.randomBytes(bytes).toString('hex');
}
