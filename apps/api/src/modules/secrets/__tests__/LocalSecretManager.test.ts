import { describe, it, expect, beforeEach } from "vitest";
import { LocalSecretManager } from "../LocalSecretManager";

describe("LocalSecretManager", () => {
  let sm: LocalSecretManager;

  beforeEach(() => {
    // Reset singleton for isolation
    sm = new LocalSecretManager();
  });

  describe("encrypt / decrypt roundtrip", () => {
    it("should decrypt to the original plaintext", async () => {
      const original = "super_secret_oauth_token_abc123";
      const encrypted = await sm.encrypt(original);
      const decrypted = await sm.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it("should produce different ciphertext for same plaintext (random IV)", async () => {
      const plaintext = "same_plaintext_value";
      const enc1 = await sm.encrypt(plaintext);
      const enc2 = await sm.encrypt(plaintext);
      expect(enc1).not.toBe(enc2);
    });

    it("should produce ciphertext with three dot-separated parts (iv.tag.data)", async () => {
      const encrypted = await sm.encrypt("test");
      const parts = encrypted.split(".");
      expect(parts).toHaveLength(3);
      expect(parts[0].length).toBeGreaterThan(0); // IV
      expect(parts[1].length).toBeGreaterThan(0); // Auth tag
      expect(parts[2].length).toBeGreaterThan(0); // Ciphertext
    });

    it("should throw on tampered ciphertext (auth tag mismatch)", async () => {
      const encrypted = await sm.encrypt("protected_value");
      const parts = encrypted.split(".");
      // Corrupt the ciphertext portion
      parts[2] = parts[2].slice(0, -4) + "XXXX";
      const tampered = parts.join(".");
      await expect(sm.decrypt(tampered)).rejects.toThrow();
    });

    it("should throw on invalid format (missing parts)", async () => {
      await expect(sm.decrypt("invalid-format")).rejects.toThrow("Invalid ciphertext format");
    });

    it("should handle empty string plaintext", async () => {
      const enc = await sm.encrypt("");
      const dec = await sm.decrypt(enc);
      expect(dec).toBe("");
    });

    it("should handle unicode plaintext", async () => {
      const unicode = "oauth_token_🔐_émoji_日本語";
      const enc = await sm.encrypt(unicode);
      const dec = await sm.decrypt(enc);
      expect(dec).toBe(unicode);
    });

    it("should handle long plaintext (JWT-length tokens)", async () => {
      const longToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." + "a".repeat(500);
      const enc = await sm.encrypt(longToken);
      const dec = await sm.decrypt(enc);
      expect(dec).toBe(longToken);
    });
  });

  describe("storeSecret / getSecret", () => {
    it("should store and retrieve a secret", async () => {
      await sm.storeSecret("test:key", "my_secret_value");
      const retrieved = await sm.getSecret("test:key");
      expect(retrieved).toBe("my_secret_value");
    });

    it("should return null for non-existent key", async () => {
      const result = await sm.getSecret("nonexistent:key");
      expect(result).toBeNull();
    });
  });

  describe("deleteSecret", () => {
    it("should delete a secret", async () => {
      await sm.storeSecret("delete:test", "value");
      await sm.deleteSecret("delete:test");
      const result = await sm.getSecret("delete:test");
      expect(result).toBeNull();
    });

    it("should not throw when deleting non-existent key", async () => {
      await expect(sm.deleteSecret("nonexistent:key")).resolves.not.toThrow();
    });
  });

  describe("rotateSecret", () => {
    it("should replace old secret with new one", async () => {
      await sm.storeSecret("rotate:test", "old_value");
      await sm.rotateSecret("rotate:test", "new_value");
      const retrieved = await sm.getSecret("rotate:test");
      expect(retrieved).toBe("new_value");
    });
  });
});
