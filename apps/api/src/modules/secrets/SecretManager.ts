/**
 * SecretManager — pluggable interface for credential storage.
 *
 * Development: LocalSecretManager (AES-256-GCM, DB-backed).
 * Production: drop-in adapters for AWS Secrets Manager, Azure Key Vault, HashiCorp Vault.
 *
 * NEVER expose plaintext secrets in logs or API responses.
 */
export interface SecretManager {
  /** Encrypt a plaintext string and return an opaque ciphertext blob. */
  encrypt(plaintext: string): Promise<string>;

  /** Decrypt a ciphertext blob produced by `encrypt`. */
  decrypt(ciphertext: string): Promise<string>;

  /**
   * Persist an encrypted secret under a logical key.
   * Key format recommendation: `ws:{workspaceId}:platform:{Platform}:field`
   */
  storeSecret(key: string, value: string): Promise<void>;

  /** Retrieve and decrypt a previously stored secret by key. */
  getSecret(key: string): Promise<string | null>;

  /** Permanently delete a stored secret (used during disconnect / revocation). */
  deleteSecret(key: string): Promise<void>;

  /** Rotate a stored secret: atomically delete the old value and store the new one. */
  rotateSecret(key: string, newValue: string): Promise<void>;
}
