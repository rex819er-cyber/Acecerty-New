import React from 'react';
import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ThemeProvider>
  );
}
