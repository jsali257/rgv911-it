"use client";

import React from 'react';
import styles from './confirmDialog.module.css';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={`${styles.dialogHeader} ${styles[type]}`}>
          <FaExclamationTriangle className={styles.icon} />
          <h3>{title}</h3>
        </div>
        <div className={styles.dialogContent}>
          <p>{message}</p>
        </div>
        <div className={styles.dialogActions}>
          <button 
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.button} ${styles[`${type}Button`]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
