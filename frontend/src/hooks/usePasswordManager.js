import { useState, useEffect, useCallback } from 'react';
import { useWebApp } from './useTelegram';
import * as cryptoUtils from '../utils/crypto';
import * as api from '../utils/api';

/**
 * Custom hook for password management operations
 * 
 * @param {string} masterPassword - User's master password
 * @returns {Object} - Password management methods and state
 */
export function usePasswordManager(masterPassword) {
  const { user } = useWebApp();
  const [isReady, setIsReady] = useState(false);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [passwordEntries, setPasswordEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive the crypto key when master password changes or user is loaded
  useEffect(() => {
    const initializeCryptoKey = async () => {
      if (!masterPassword || !user?.id) {
        setCryptoKey(null);
        setIsReady(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Derive key from master password and Telegram user ID
        const key = await cryptoUtils.deriveKey(masterPassword, user.id);
        setCryptoKey(key);
        setIsReady(true);
        
        // Load password list
        await loadPasswordList();
      } catch (err) {
        console.error('Failed to initialize crypto key:', err);
        setError(`Initialization error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeCryptoKey();
  }, [masterPassword, user?.id]);

  // Load password entries
  const loadPasswordList = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all password labels from the API
      const labels = await api.listPasswords();
      setPasswordEntries(labels);
    } catch (err) {
      console.error('Failed to load password list:', err);
      setError(`Failed to load passwords: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Add a new password entry
  const addPassword = useCallback(async (label, password) => {
    if (!isReady || !cryptoKey) {
      throw new Error('Crypto system not initialized');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Encrypt the password
      const { encryptedData, iv, hash } = await cryptoUtils.encryptPassword(password, cryptoKey);
      
      // Store it on the server
      await api.storePassword(label, encryptedData, iv, hash);
      
      // Update the password list
      await loadPasswordList();
      
      return true;
    } catch (err) {
      console.error(`Failed to add password for "${label}":`, err);
      setError(`Failed to add password: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isReady, cryptoKey, loadPasswordList]);

  // Get and decrypt a password
  const getPassword = useCallback(async (label) => {
    if (!isReady || !cryptoKey) {
      throw new Error('Crypto system not initialized');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get encrypted data from the server
      const { encryptedData, iv, hash } = await api.getPassword(label);
      
      // Decrypt the password
      const decryptedPassword = await cryptoUtils.decryptPassword(
        encryptedData,
        iv,
        hash,
        cryptoKey
      );
      
      return decryptedPassword;
    } catch (err) {
      console.error(`Failed to get password for "${label}":`, err);
      setError(`Failed to get password: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isReady, cryptoKey]);

  // Delete a password entry
  const deletePassword = useCallback(async (label) => {
    if (!isReady) {
      throw new Error('Password manager not initialized');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Delete from the server
      await api.deletePassword(label);
      
      // Update the password list
      await loadPasswordList();
      
      return true;
    } catch (err) {
      console.error(`Failed to delete password for "${label}":`, err);
      setError(`Failed to delete password: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isReady, loadPasswordList]);

  // Generate a secure random password
  const generatePassword = useCallback((length = 16, includeSpecial = true) => {
    return cryptoUtils.generateSecurePassword(length, includeSpecial);
  }, []);

  return {
    isReady,
    passwordEntries,
    loading,
    error,
    loadPasswordList,
    addPassword,
    getPassword,
    deletePassword,
    generatePassword
  };
}