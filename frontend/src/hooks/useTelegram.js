import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

/**
 * Custom hook for interacting with Telegram Mini App
 * 
 * @returns {Object} - Telegram WebApp information and methods
 */
export function useWebApp() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  
  // Initialize Telegram WebApp and get user data
  useEffect(() => {
    const initWebApp = () => {
      try {
        // Signal ready to Telegram
        WebApp.ready();
        
        // Configure main button (hidden by default)
        WebApp.MainButton.setParams({
          text: 'CONFIRM',
          color: '#0088cc',
          textColor: '#ffffff',
          isVisible: false,
        });
        
        // Get user info from Telegram
        const webAppUser = WebApp.initDataUnsafe?.user;
        if (webAppUser) {
          setUser(webAppUser);
        } else {
          console.warn('No user data available from Telegram WebApp');
          // For development on desktop browsers where Telegram data isn't available
          if (process.env.NODE_ENV === 'development') {
            setUser({
              id: '12345678',
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
            });
          }
        }
        
        setReady(true);
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    };
    
    initWebApp();
  }, []);

  /**
   * Show a message to the user via Telegram's native UI
   * 
   * @param {string} message - Message to show
   */
  const showAlert = (message) => {
    WebApp.showAlert(message);
  };
  
  /**
   * Show a confirmation dialog to the user via Telegram's native UI
   * 
   * @param {string} message - Message to show
   * @returns {Promise<boolean>} - Whether the user confirmed
   */
  const showConfirm = (message) => {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  };
  
  /**
   * Close the Mini App
   */
  const close = () => {
    WebApp.close();
  };
  
  /**
   * Enable and show the main button
   * 
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   */
  const enableMainButton = (text, onClick) => {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
  };
  
  /**
   * Disable and hide the main button
   */
  const disableMainButton = () => {
    WebApp.MainButton.offClick();
    WebApp.MainButton.hide();
  };
  
  return {
    ready,
    user,
    showAlert,
    showConfirm,
    close,
    enableMainButton,
    disableMainButton,
    webApp: WebApp
  };
}