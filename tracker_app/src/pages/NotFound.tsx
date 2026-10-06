import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Dot, RDot } from '../components/ui';

const NotFound: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-void px-5 pb-8 text-center text-ink lg:pb-16">
      <span className="absolute left-16 top-16 hidden lg:block"><Dot text="bilancio" p={5} /></span>
      <RDot text="404" p={[14, 22]} />
      <h1 className="t-title mt-[55px] lg:t-title-l lg:mt-[50px]">Pagina non trovata</h1>
      <p className="t-body mt-2 max-w-[310px] text-ink2 lg:mt-3 lg:max-w-none">L’indirizzo non porta da nessuna parte. Torna alla giornata di oggi.</p>
      <Link to={isAuthenticated ? "/" : "/login"} className="t-button mt-8 inline-flex h-[52px] w-[190px] items-center justify-center rounded-full bg-ink text-void hover:opacity-85 lg:mt-[38px] lg:w-[220px]">
        {isAuthenticated ? "Torna a oggi" : "Vai al login"}
      </Link>
      <span className="t-label absolute bottom-[70px] left-16 hidden text-ink2 lg:block">ERRORE 404</span>
    </div>
  );
};

export default NotFound;
