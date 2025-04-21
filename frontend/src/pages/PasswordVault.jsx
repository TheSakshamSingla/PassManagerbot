import { useState, useEffect } from 'react';
import { FiLock, FiLoader, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useWebApp } from '../hooks/useTelegram';
import PasswordItem from '../components/PasswordItem';
import AddPasswordForm from '../components/AddPasswordForm';

/**
 * The main password vault component that displays all password entries
 * and provides functionality to add, view, and delete passwords
 */
const PasswordVault = ({ 
  isReady, 
  loading, 
  passwordEntries, 
  addPassword, 
  getPassword, 
  deletePassword, 
  generatePassword, 
  onLock, 
  user 
}) => {
  const { showConfirm, showAlert } = useWebApp();
  const [passwords, setPasswords] = useState({});
  const [loadingLabels, setLoadingLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load decrypted passwords for display
  const loadPasswordDetails = async (label) => {
    if (passwords[label] || loadingLabels.includes(label)) return;

    try {
      setLoadingLabels(prev => [...prev, label]);
      const decryptedPassword = await getPassword(label);
      
      if (decryptedPassword) {
        setPasswords(prev => ({
          ...prev,
          [label]: decryptedPassword
        }));
      }
    } catch (error) {
      toast.error(`Failed to load password for "${label}"`);
      console.error(error);
    } finally {
      setLoadingLabels(prev => prev.filter(l => l !== label));
    }
  };

  // Handle adding a new password
  const handleAddPassword = async (label, password) => {
    try {
      const success = await addPassword(label, password);
      if (success) {
        toast.success(`Password for "${label}" added successfully`);
        // Add to local state as well
        setPasswords(prev => ({
          ...prev,
          [label]: password
        }));
      }
    } catch (error) {
      toast.error(`Failed to add password: ${error.message}`);
    }
  };

  // Handle password deletion with confirmation
  const handleDeletePassword = async (label) => {
    const confirmed = await showConfirm(`Delete password for "${label}"?`);
    
    if (confirmed) {
      try {
        const success = await deletePassword(label);
        if (success) {
          toast.success(`Password for "${label}" deleted`);
          // Remove from local state
          setPasswords(prev => {
            const newPasswords = { ...prev };
            delete newPasswords[label];
            return newPasswords;
          });
        }
      } catch (error) {
        toast.error(`Failed to delete password: ${error.message}`);
      }
    }
  };

  // Handle copying password to clipboard
  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password)
      .then(() => {
        toast.success('Copied to clipboard! Will be cleared in 60 seconds');
        // Auto-clear clipboard after 60 seconds for security
        setTimeout(() => {
          navigator.clipboard.writeText('');
        }, 60000);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  // Filter password entries based on search term
  const filteredEntries = searchTerm.trim() 
    ? passwordEntries.filter(label => 
        label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : passwordEntries;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800 p-4 rounded-lg shadow mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="rounded-full bg-telegram p-2 mr-3">
            <FiUser className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-bold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-400 text-sm">
              {user?.username ? `@${user?.username}` : `ID: ${user?.id}`}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLock}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full"
          aria-label="Lock vault"
        >
          <FiLock size={20} />
        </button>
      </div>

      <AddPasswordForm 
        onSubmit={handleAddPassword} 
        generatePassword={generatePassword} 
      />

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search passwords..."
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-telegram focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h2 className="text-white text-xl font-bold mb-2">Your Passwords</h2>
        {loading && passwordEntries.length === 0 ? (
          <div className="text-center py-8">
            <FiLoader className="animate-spin mx-auto text-3xl text-telegram mb-2" />
            <p className="text-gray-400">Loading passwords...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-2">
              {searchTerm ? 'No matching passwords found.' : 'No passwords saved yet.'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="text-telegram hover:underline"
              >
                Clear search
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Use the form above to add your first password.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(label => (
              <div key={label} onClick={() => loadPasswordDetails(label)}>
                <PasswordItem
                  label={label}
                  password={passwords[label]}
                  onDelete={() => handleDeletePassword(label)}
                  onCopy={handleCopyPassword}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-500 mb-6">
        <p>Secure Password Manager</p>
        <p className="mt-1">All data is encrypted client-side using AES-256</p>
      </div>
    </div>
  );
};

export default PasswordVault;