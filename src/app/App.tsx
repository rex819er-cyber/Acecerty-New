import React from 'react';
import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <RouterProvider router={router} />
        {/* Host for the social-auth / checkout toast notifications */}
        <Toaster position="top-center" />
      </CartProvider>
    </ThemeProvider>
  );
}
