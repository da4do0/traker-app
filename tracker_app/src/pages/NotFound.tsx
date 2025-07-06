import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFound: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="">
      <h1>404 - Pagina Non Trovata</h1>
      <p>La pagina che stai cercando non esiste.</p>
      <Link to={isAuthenticated ? "/" : "/login"} className="">
        {isAuthenticated ? "Torna alla Home" : "Vai al Login"}
      </Link>
    </div>
  );
};

export default NotFound; 