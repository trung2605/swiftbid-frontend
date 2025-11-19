import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CreateAuctionPage from './pages/CreateAuctionPage/CreateAuctionPage';
import AuctionsPage from './pages/AuctionsPage/AuctionsPage';
import MyProductsPage from './pages/MyProductsPage/MyProductsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import './styles/global.scss';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Authentication Routes - Without MainLayout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Main Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-products" element={<MyProductsPage />} />
            <Route path="create-auction" element={<CreateAuctionPage />} />
            <Route path="auctions" element={<AuctionsPage />} />
            <Route path="contact" element={<div style={{ padding: '3rem', textAlign: 'center' }}>
              <h1>Contact Page</h1>
              <p>Coming soon...</p>
            </div>} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<div style={{ padding: '3rem', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
          </div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
