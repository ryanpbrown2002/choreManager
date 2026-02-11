import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex flex-col items-center">
            <img src="/Chorho.png" alt="Chorho" className="h-16 mb-2" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Invalid reset link</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This password reset link is invalid. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex flex-col items-center">
            <img src="/Chorho.png" alt="Chorho" className="h-16 mb-2" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Password reset successful</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex flex-col items-center">
          <img src="/Chorho.png" alt="Chorho" className="h-16 mb-2" />
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">Set your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
