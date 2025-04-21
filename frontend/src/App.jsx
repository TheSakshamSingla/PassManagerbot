import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useWebApp } from './hooks/useTelegram';
import { usePasswordManager } from './hooks/usePasswordManager';
import MasterPasswordForm from './components/MasterPasswordForm';
import PasswordVault from './pages/PasswordVault';
import { isWebCryptoSupported } from './utils/crypto';

function App() {
  const { ready, user } = useWebApp();
  const [masterPassword, setMasterPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [idleTimer, setIdleTimer] = useState(null);
  
  const {
    isReady,
    loading,
    error,
    passwordEntries,
    addPassword,
    getPassword,
    deletePassword,
    generatePassword
  } = usePasswordManager(unlocked ? masterPassword : '');

  // Check for Web Crypto API support
  useEffect(() => {
    if (!isWebCryptoSupported()) {
      toast.error('Your browser does not support the Web Crypto API needed for encryption.', {
        duration: 6000
      });
    }
  }, []);

  // Handle errors from the password manager
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Set up auto-lock after inactivity
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      
      if (unlocked) {
        // Auto-lock after 5 minutes of inactivity
        const timer = setTimeout(() => {
          handleLock();
          toast('Vault auto-locked due to inactivity', {
            icon: '🔒'
          });
        }, 5 * 60 * 1000);
        
        setIdleTimer(timer);
      }
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });

    resetIdleTimer();

    // Clean up
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [unlocked, idleTimer]);

  // Handle master password submission
  const handleUnlock = (password) => {
    setMasterPassword(password);
    setUnlocked(true);
    toast.success('Vault unlocked');
  };

  // Lock the vault
  const handleLock = () => {
    setUnlocked(false);
    setMasterPassword('');
  };

  // Wait for Telegram WebApp to be ready
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin mb-4 h-12 w-12 border-t-2 border-b-2 border-telegram rounded-full mx-auto"></div>
          <p>Initializing Secure Password Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4">
      <Toaster position="top-center" />
      
      {!unlocked ? (
        <MasterPasswordForm onSubmit={handleUnlock} loading={loading} />
      ) : (
        <PasswordVault
          isReady={isReady}
          loading={loading}
          passwordEntries={passwordEntries}
          addPassword={addPassword}
          getPassword={getPassword}
          deletePassword={deletePassword}
          generatePassword={generatePassword}
          onLock={handleLock}
          user={user}
        />
      )}
    </div>
  );
}

export default App;