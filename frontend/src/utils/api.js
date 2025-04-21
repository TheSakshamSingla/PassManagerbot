/**
 * Secure Password Manager - API Utilities
 * 
 * This module handles all interactions with the backend API
 * while maintaining the zero-knowledge architecture.
 */
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

// Base API URL - will be replaced with actual domain in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Configure axios to include Telegram initData in each request
 */
api.interceptors.request.use((config) => {
  // Get initData from Telegram WebApp
  const initData = WebApp.initData;
  
  // Add it to headers for validation on the server
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  
  return config;
});

/**
 * Store an encrypted password in the backend
 * 
 * @param {string} label - Label for the password entry (e.g., "GitHub")
 * @param {string} encryptedData - AES-GCM encrypted password
 * @param {string} iv - Initialization vector used for encryption
 * @param {string} hash - SHA-256 hash for integrity verification
 * @returns {Promise<Object>} - API response
 */
export async function storePassword(label, encryptedData, iv, hash) {
  try {
    const response = await api.post('/store', {
      label,
      encrypted_data: encryptedData,
      iv,
      hash
    });
    return response.data;
  } catch (error) {
    console.error('API error storing password:', error);
    throw new Error(error.response?.data?.detail || 'Failed to store password');
  }
}

/**
 * Get a list of all password entries for the user
 * 
 * @returns {Promise<Array<string>>} - List of password labels
 */
export async function listPasswords() {
  try {
    const response = await api.get('/list');
    return response.data;
  } catch (error) {
    console.error('API error listing passwords:', error);
    throw new Error(error.response?.data?.detail || 'Failed to retrieve password list');
  }
}

/**
 * Get an encrypted password entry by label
 * 
 * @param {string} label - Password label
 * @returns {Promise<Object>} - Encrypted password data
 */
export async function getPassword(label) {
  try {
    const response = await api.get(`/get/${encodeURIComponent(label)}`);
    return {
      encryptedData: response.data.encrypted_data,
      iv: response.data.iv,
      hash: response.data.hash
    };
  } catch (error) {
    console.error(`API error getting password for "${label}":`, error);
    throw new Error(error.response?.data?.detail || `Failed to retrieve password for "${label}"`);
  }
}

/**
 * Delete a password entry
 * 
 * @param {string} label - Password label
 * @returns {Promise<Object>} - API response
 */
export async function deletePassword(label) {
  try {
    const response = await api.delete(`/delete/${encodeURIComponent(label)}`);
    return response.data;
  } catch (error) {
    console.error(`API error deleting password for "${label}":`, error);
    throw new Error(error.response?.data?.detail || `Failed to delete password for "${label}"`);
  }
}