"use client";

import { useTransition, useState } from 'react';
import styles from './singleUser.module.css';
import Toast from '@/app/ui/dashboard/toast/toast';

const ResetPasswordButton = ({ userId }) => {
  const [isPending, startTransition] = useTransition();
  const [toastState, setToastState] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleResetPassword = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/users/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        setToastState({
          show: true,
          message: data.message || (data.success ? 'Password reset email sent successfully' : 'Failed to send reset email'),
          type: data.success ? 'success' : 'error'
        });
      } catch (error) {
        setToastState({
          show: true,
          message: 'Failed to send reset email',
          type: 'error'
        });
        console.error('Reset password error:', error);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleResetPassword}
        className={styles.resetButton}
        disabled={isPending}
      >
        {isPending ? 'Sending...' : 'Send Password Reset Email'}
      </button>

      {toastState.show && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          onClose={() => setToastState({ ...toastState, show: false })}
        />
      )}
    </>
  );
};

export default ResetPasswordButton;
