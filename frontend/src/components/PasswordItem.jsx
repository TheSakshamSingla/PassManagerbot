import { useState } from 'react';
import { FiCopy, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';

/**
 * Component to display and interact with a single password entry
 */
const PasswordItem = ({ label, password, onDelete, onCopy }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toggle password visibility
  const toggleVisibility = () => {
    setShowPassword(!showPassword);
    // Auto-hide after 30 seconds for security
    if (!showPassword) {
      setTimeout(() => {
        setShowPassword(false);
      }, 30000);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (onCopy) {
      onCopy(password);
    } else {
      navigator.clipboard.writeText(password)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy: ', err));
    }

    // Auto-clear clipboard after 60 seconds
    setTimeout(() => {
      navigator.clipboard.writeText('');
    }, 60000);
  };

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(label);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-white">{label}</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleVisibility}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 
              <FiEyeOff className="text-gray-300" /> : 
              <FiEye className="text-gray-300" />
            }
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Copy password to clipboard"
          >
            <FiCopy className={copied ? "text-green-400" : "text-gray-300"} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-red-700 transition-colors"
            aria-label="Delete password"
          >
            <FiTrash2 className="text-gray-300" />
          </button>
        </div>
      </div>

      <div className="mt-2">
        {password ? (
          <div className="bg-gray-900 rounded p-2 font-mono text-sm break-all">
            {showPassword ? password : '••••••••••••••••'}
          </div>
        ) : (
          <div className="bg-gray-900 rounded p-2 text-gray-500 text-sm italic">
            Tap to view password
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordItem;