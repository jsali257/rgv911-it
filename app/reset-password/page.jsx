"use client";

import { useState } from 'react';
import styles from './resetPassword.module.css';
import Toast from '@/app/ui/dashboard/toast/toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastState, setToastState] = useState({ show: false, message: '', type: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setToastState({
        show: true,
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (password.length < 6) {
      setToastState({
        show: true,
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the token from the URL
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');

      const response = await fetch('/api/users/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToastState({
          show: true,
          message: 'Password reset successful! You can now login with your new password.',
          type: 'success'
        });
        // Clear the form
        setPassword('');
        setConfirmPassword('');
      } else {
        setToastState({
          show: true,
          message: data.message || 'Failed to reset password',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setToastState({
        show: true,
        message: 'An error occurred while resetting password',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Reset Your Password</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Enter your new password"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Confirm your new password"
            />
          </div>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>

      {toastState.show && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          onClose={() => setToastState({ ...toastState, show: false })}
        />
      )}
    </div>
  );
}
