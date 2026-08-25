import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const ALGO = "aes-256-gcm"
const IV_LENGTH = 12

function getEncryptionKey(): Buffer {
  const rawKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY
  if (!rawKey) throw new Error("Missing OAUTH_TOKEN_ENCRYPTION_KEY")

  const key = Buffer.from(rawKey, "base64")
  if (key.length !== 32) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY must be base64-encoded 32 bytes")
  }
  return key
}

export function encryptToken(plain: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

export function decryptToken(payload: string): string {
  const key = getEncryptionKey()
  const buffer = Buffer.from(payload, "base64")
  const iv = buffer.subarray(0, IV_LENGTH)
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16)
  const encrypted = buffer.subarray(IV_LENGTH + 16)

  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString("utf8")
}
