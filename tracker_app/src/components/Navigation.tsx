import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Non mostrare la navigazione se non autenticato
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">Chi Siamo</Link>
          </li>
          <li>
            <Link to="/contact">Contatti</Link>
          </li>
        </ul>
        
        <div className="user-section">
          <span className="user-info">
            Benvenuto, {user?.name || 'Utente'}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 