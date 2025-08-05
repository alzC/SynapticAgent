// components/ToastManager.tsx
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastManager() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '0.5rem',
        },
      }}
    />
  );
}
