import { useState } from 'react';
import { FiKey, FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Component for master password entry and management
 */
const MasterPasswordForm = ({ onSubmit, loading }) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (masterPassword) {
      onSubmit(masterPassword);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex flex-col items-center mb-6">
        <div className="rounded-full bg-telegram p-4 mb-4">
          <FiKey className="text-white text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">Secure Password Manager</h1>
        <p className="text-gray-400 text-center mt-2">
          Enter your master password to unlock your passwords
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="masterPassword" className="block text-gray-300 mb-2">
            Master Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="masterPassword"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-telegram focus:outline-none pr-10"
              placeholder="Enter your master password"
              autoComplete="off"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? 
                <FiEyeOff className="text-gray-400" /> : 
                <FiEye className="text-gray-400" />
              }
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This password never leaves your device and is used to encrypt your data.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !masterPassword}
          className={`w-full py-3 rounded font-bold flex items-center justify-center 
            ${loading || !masterPassword ? 'bg-gray-700 text-gray-500' : 'bg-telegram text-white hover:bg-telegram-dark'} 
            transition-colors`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Unlocking...
            </>
          ) : (
            <>Unlock Vault</>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Remember: We never store your master password.</p>
        <p className="mt-1">If you forget it, your data cannot be recovered.</p>
      </div>
    </div>
  );
};

export default MasterPasswordForm;