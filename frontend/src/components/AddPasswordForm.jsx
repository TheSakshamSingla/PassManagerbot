import { useState } from 'react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

/**
 * Component for adding new password entries
 */
const AddPasswordForm = ({ onSubmit, generatePassword }) => {
  const [label, setLabel] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(16);
  const [useSpecialChars, setUseSpecialChars] = useState(true);
  const [isGenerateMode, setIsGenerateMode] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (label.trim() && password) {
      onSubmit(label.trim(), password);
      // Reset form
      setLabel('');
      setPassword('');
      setShowPassword(false);
    }
  };

  // Generate a random password
  const handleGenerate = () => {
    if (generatePassword) {
      const newPassword = generatePassword(passwordLength, useSpecialChars);
      setPassword(newPassword);
    }
  };

  // Toggle between manual entry and password generation
  const toggleGenerateMode = () => {
    setIsGenerateMode(!isGenerateMode);
    if (!isGenerateMode) {
      handleGenerate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">Add New Password</h2>
      
      <div className="mb-4">
        <label htmlFor="label" className="block text-gray-300 mb-2">
          Label (e.g., "GitHub")
        </label>
        <input
          type="text"
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter service name"
          required
          className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-telegram focus:outline-none"
        />
      </div>

      {isGenerateMode ? (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300">Password Length: {passwordLength}</label>
            <button
              type="button"
              onClick={handleGenerate}
              className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            >
              <FiRefreshCw className="text-gray-300" />
            </button>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            value={passwordLength}
            onChange={(e) => setPasswordLength(Number(e.target.value))}
            className="w-full"
          />
          
          <div className="flex items-center mt-3">
            <input
              type="checkbox"
              id="specialChars"
              checked={useSpecialChars}
              onChange={() => setUseSpecialChars(!useSpecialChars)}
              className="mr-2"
            />
            <label htmlFor="specialChars" className="text-gray-300">
              Include special characters
            </label>
          </div>

          <div className="mt-3">
            <label className="block text-gray-300 mb-2">
              Generated Password
            </label>
            <div className="bg-gray-900 p-2 rounded font-mono text-white break-all">
              {password}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-telegram focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={toggleGenerateMode}
          className="text-telegram hover:underline text-sm"
        >
          {isGenerateMode ? "Enter manually" : "Generate secure password"}
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-telegram text-white rounded hover:bg-telegram-dark transition-colors flex items-center"
        >
          <FiPlus className="mr-1" />
          Add Password
        </button>
      </div>
    </form>
  );
};

export default AddPasswordForm;