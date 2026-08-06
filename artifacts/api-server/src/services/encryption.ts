import crypto from 'crypto';

// Environment variable for 32-byte encryption key
// DEVELOPMENT FALLBACK: In development, we use a deterministic key
// PRODUCTION: Must set INTEGRATION_TOKEN_KEY env variable
const DEV_FALLBACK_KEY = 'a'.repeat(64); // 32 bytes in hex = 64 chars
const ENCRYPTION_KEY = process.env.INTEGRATION_TOKEN_KEY || DEV_FALLBACK_KEY;

// Validate key on module load
if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, 'hex').length !== 32) {
  console.error('CRITICAL: INTEGRATION_TOKEN_KEY must be exactly 32 bytes (64 hex chars)');
  console.error('Generate with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"');
  throw new Error('INTEGRATION_TOKEN_KEY must be exactly 32 bytes');
}

// Warn if using dev key
if (ENCRYPTION_KEY === DEV_FALLBACK_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('PRODUCTION: INTEGRATION_TOKEN_KEY must be set to a secure random key');
}

if (ENCRYPTION_KEY === DEV_FALLBACK_KEY) {
  console.warn('⚠️  WARNING: Using development encryption key. Set INTEGRATION_TOKEN_KEY for production.');
}

const IV_LENGTH = 16;

/**
 * Encrypt sensitive data using AES-256-CBC
 * @param text Plain text to encrypt
 * @returns Encrypted string in format: IV:ENCRYPTED_DATA
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV:ENCRYPTED format
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data encrypted with encrypt()
 * @param text Encrypted string in format: IV:ENCRYPTED_DATA
 * @returns Decrypted plain text
 */
export function decrypt(text: string): string {
  if (!text) return '';
  
  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  return ENCRYPTION_KEY.length === 64 && Buffer.from(ENCRYPTION_KEY, 'hex').length === 32;
}
