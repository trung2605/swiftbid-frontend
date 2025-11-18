import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.scss';

/**
 * Header Component
 * Top header with logo and user actions
 */
const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🏆</span>
          SwiftBid
        </Link>

        <div className="header-actions">
          <div className="header-search">
            <input 
              type="text" 
              placeholder="Search auctions..." 
              className="search-input"
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>

          {isAuthenticated && (
            <div className="header-user">
              <Link to="/profile" className="user-link">
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>
              <Link to="/cart" className="user-link">
                <i className="fas fa-shopping-cart"></i>
                <span className="cart-badge">3</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
