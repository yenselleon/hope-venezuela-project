// src/App.jsx
// Componente raíz de la aplicación.
// Configura TanStack Query Client y React Router.
// Estructura de layout común: Header, Router Switch, Footer y Toast global.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Landing } from '@/pages/Landing';
import { Registro } from '@/pages/Registro';
import { Donar } from '@/pages/Donar';
import { Toast } from '@/components/ui/Toast';

// Inicializar el cliente de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Header común bilingüe */}
          <Header />

          {/* Área de contenido de rutas */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/donar" element={<Donar />} />
              {/* Fallback de redirección */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Footer común bilingüe */}
          <Footer />

          {/* Toast de notificaciones globales */}
          <Toast />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
