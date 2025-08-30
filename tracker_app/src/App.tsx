import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Food from './pages/Food';
import FoodDetailPage from './pages/FoodDetailPage';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
                path="/" 
                element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
                } 
            />
            <Route 
                path="/food" 
                element={
                <ProtectedRoute>
                    <Food />
                </ProtectedRoute>
                }/>
            <Route 
                path="/food/:id" 
                element={
                <ProtectedRoute>
                    <FoodDetailPage />
                </ProtectedRoute>
                }/>
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );
};

export default App; 