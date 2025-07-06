import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
                path="/" 
                element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
                } 
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );
};

export default App; 