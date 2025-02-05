"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../dashboard/confirmDialog/confirmDialog';

const ConfirmContext = createContext(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: () => {},
  });

  const showConfirm = useCallback((config) => {
    setConfirmState({
      ...confirmState,
      ...config,
      isOpen: true,
    });
  }, [confirmState]);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.onConfirm();
    hideConfirm();
  }, [confirmState, hideConfirm]);

  const value = {
    showConfirm,
    hideConfirm,
  };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
      />
    </ConfirmContext.Provider>
  );
}
