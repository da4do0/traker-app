import React from "react";
import { UserCircle } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="flex items-center gap-4 mb-6 px-2 md:px-0">
        <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full p-2">
          <UserCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-white">Ciao, Utente!</div>
          <div className="text-xs text-gray-400">domenica 6 luglio</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="relative">
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <svg className="w-6 h-6 text-white opacity-80" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </header>
  );
}

export default Header;