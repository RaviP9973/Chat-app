import crypto from 'crypto';

// 1. Get your secret key from environment variables
// This must be exactly 32 chars long or a hex string of 32 bytes
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a text string
 */
export const encryptMessage = (text) => {
  // Generate a unique IV for this specific message
  const iv = crypto.randomBytes(16);

  // Create the cipher
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get the auth tag (vital for GCM integrity check)
  const authTag = cipher.getAuthTag().toString('hex');

  // Return everything needed to decrypt later
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    authTag: authTag
  };
};

/**
 * Decrypts the data object
 */
export const decryptMessage = (encryptedData) => {
  const { iv, content, authTag } = encryptedData;

  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};