/**
 * Secure Password Manager - Cryptographic Utilities
 * 
 * This module provides the cryptographic functions necessary for the
 * zero-knowledge password manager. All encryption/decryption happens
 * client-side using the Web Crypto API.
 */

/**
 * Derives a cryptographic key from the user's master password and Telegram ID
 * Using PBKDF2 with high iteration count for security
 * 
 * @param {string} masterPassword - User's master password
 * @param {string} telegramId - Telegram user ID (used as salt)
 * @returns {Promise<CryptoKey>} - Derived key for encryption/decryption
 */
export async function deriveKey(masterPassword, telegramId) {
  try {
    // Convert master password to an array buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    
    // Use Telegram ID as salt with some additional characters
    const saltBuffer = encoder.encode(`telegram-pwd-mgr-${telegramId}`);
    
    // Import the password as a raw key
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Derive a key using PBKDF2
    // 100,000 iterations provides good security against brute force
    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false, // Non-extractable
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Key derivation error:', error);
    throw new Error('Failed to derive encryption key');
  }
}

/**
 * Encrypts a password string using AES-GCM
 * 
 * @param {string} password - The password to encrypt
 * @param {CryptoKey} key - The derived cryptographic key
 * @returns {Promise<Object>} - Object containing encrypted data, IV and hash
 */
export async function encryptPassword(password, key) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Generate random IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Calculate SHA-256 hash of the plaintext for integrity verification
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    
    // Convert binary data to Base64 for storage
    const encryptedBase64 = arrayBufferToBase64(encryptedBuffer);
    const ivBase64 = arrayBufferToBase64(iv);
    const hashBase64 = arrayBufferToBase64(hashBuffer);
    
    return {
      encryptedData: encryptedBase64,
      iv: ivBase64,
      hash: hashBase64
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypts an encrypted password
 * 
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} ivBase64 - Base64 encoded initialization vector
 * @param {string} expectedHashBase64 - Base64 encoded hash for verification
 * @param {CryptoKey} key - The derived cryptographic key
 * @returns {Promise<string>} - The decrypted password
 */
export async function decryptPassword(encryptedData, ivBase64, expectedHashBase64, key) {
  try {
    // Convert Base64 back to ArrayBuffer
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const iv = base64ToArrayBuffer(ivBase64);
    const expectedHash = base64ToArrayBuffer(expectedHashBase64);
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedBuffer
    );
    
    // Calculate hash of decrypted data for integrity check
    const actualHashBuffer = await window.crypto.subtle.digest('SHA-256', decryptedBuffer);
    
    // Verify integrity by comparing hashes
    if (!compareArrayBuffers(actualHashBuffer, expectedHash)) {
      throw new Error('Integrity check failed! The password may have been tampered with.');
    }
    
    // Convert decrypted ArrayBuffer to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password: ' + error.message);
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Compare two ArrayBuffers for equality
 */
function compareArrayBuffers(buf1, buf2) {
  if (buf1.byteLength !== buf2.byteLength) {
    return false;
  }
  
  const dv1 = new Uint8Array(buf1);
  const dv2 = new Uint8Array(buf2);
  
  for (let i = 0; i < buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a secure random password
 * 
 * @param {number} length - Length of password (default: 16)
 * @param {boolean} includeSpecial - Whether to include special characters
 * @returns {string} - Randomly generated password
 */
export function generateSecurePassword(length = 16, includeSpecial = true) {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_-+=<>?';
  
  let chars = uppercaseChars + lowercaseChars + numberChars;
  if (includeSpecial) {
    chars += specialChars;
  }
  
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

/**
 * Test if Web Crypto API is available
 * @returns {boolean} - Whether Web Crypto API is supported
 */
export function isWebCryptoSupported() {
  return window.crypto && window.crypto.subtle ? true : false;
}