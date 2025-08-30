import { useState, useEffect } from 'react';
import { APIDbHandler } from "../api/APIHandler";
import { useUser } from './UserInfo';

interface User {
  email: string;
  name: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
        if (storedUserId) setUserId(parseInt(storedUserId));
        if (storedUsername) setUsername(storedUsername);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (usernameInput: string, password: string): Promise<boolean> => {
    const response = await APIDbHandler.login(usernameInput, password);
    if (response) {
      console.log(response);
      setUserId(response);
      setUsername(usernameInput);
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', response.toString());
      localStorage.setItem('username', usernameInput);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserId(null);
    setUsername('');
  };

  return {
    isAuthenticated,
    loading,
    userId,
    username,
    login,
    logout
  };
}; 