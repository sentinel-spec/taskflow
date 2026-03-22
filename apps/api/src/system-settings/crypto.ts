import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const PREFIX = 'enc:v1';
const IV_LENGTH = 12;

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

export function isEncryptedValue(value: string): boolean {
  return value.startsWith(`${PREFIX}:`);
}

export function encryptValue(plainText: string, secret: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(secret);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

export function decryptValue(payload: string, secret: string): string {
  const [prefix, ivPart, tagPart, dataPart] = payload.split(':');

  if (prefix !== PREFIX || !ivPart || !tagPart || !dataPart) {
    throw new Error('Invalid encrypted payload format');
  }

  const iv = Buffer.from(ivPart, 'base64');
  const authTag = Buffer.from(tagPart, 'base64');
  const encryptedData = Buffer.from(dataPart, 'base64');
  const key = deriveKey(secret);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function maskSecret(value: string): string {
  if (!value) {
    return '';
  }

  if (value.length <= 8) {
    return `${value[0]}***${value[value.length - 1]}`;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
