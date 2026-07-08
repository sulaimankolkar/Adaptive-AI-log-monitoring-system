import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Datasets from './pages/Datasets';
import DriftAnalysis from './pages/DriftAnalysis';
import PromptEngineering from './pages/PromptEngineering';
import AIInsights from './pages/AIInsights';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

export const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/drift" element={<DriftAnalysis />} />
            <Route path="/prompts" element={<PromptEngineering />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
