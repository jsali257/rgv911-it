"use client";

import { useEffect } from 'react';
import styles from './toast.module.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    if (!onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]); // Added missing dependencies

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default Toast;
