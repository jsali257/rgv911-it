"use client";

import { ConfirmProvider } from './context/ConfirmContext';

export function Providers({ children }) {
  return (
    <ConfirmProvider>
      {children}
    </ConfirmProvider>
  );
}
