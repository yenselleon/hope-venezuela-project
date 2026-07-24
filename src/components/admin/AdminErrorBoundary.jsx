// src/components/admin/AdminErrorBoundary.jsx
// Error Boundary para rutas admin. Captura errores de carga lazy o de renderizado
// para evitar pantallas en blanco (blank crashes).

import React from 'react';

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AdminErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '16px',
          margin: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
            No se pudo cargar el panel
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6b7280', maxWidth: '400px' }}>
            Ocurrió un inconveniente temporal al cargar esta vista. Puedes recargar para restaurar la conexión.
          </p>
          <button
            onClick={this.handleReload}
            className="admin-btn admin-btn-pri sm"
            style={{ fontWeight: 700, cursor: 'pointer' }}
          >
            Reintentar / Cargar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
