import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, getRoles } from '../../services/authService';
import './Navigation.scss';

/**
 * Navigation Component
 * Main navigation menu for the application
 */
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const { isAuthenticated, logoutAction, user } = useAuth();
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fetch user details when authenticated
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        try {
          const response = await getCurrentUser();
          setUserDetails(response.data);
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          // If token is invalid, logout
          if (error.response?.status === 401) {
            logoutAction();
          }
        }
      } else {
        setUserDetails(null);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, logoutAction]);

  // Fetch user roles when authenticated
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated) {
        try {
          const response = await getRoles();
          setRoles(response.data);
        } catch (error) {
          console.error('Failed to fetch user roles:', error);
        }
      } else {
        setRoles([]);
      }
    };

    fetchUserRoles();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logoutAction();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SwiftBid
        </Link>

        <button 
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/auctions" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Auctions
            </Link>
          </li>
          
          {/* Show My Products for SELLER and ADMIN */}
          {(roles.includes('SELLER') || roles.includes('ADMIN')) && (
            <li className="nav-item">
              <Link to="/my-products" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                My Products
              </Link>
            </li>
          )}
          
          <li className="nav-item">
            <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>

          {/* Show Create Auction for SELLER and ADMIN */}
          {(roles.includes('SELLER') || roles.includes('ADMIN')) && (
            <li className="nav-item">
              <Link to="/create-auction" className="nav-link nav-link-primary" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-plus-circle"></i>
                Create Auction
              </Link>
            </li>
          )}
          
          {/* Authentication Section */}
          {!isAuthenticated ? (
            <li className="nav-item">
              <Link to="/login" className="nav-link nav-link-primary" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </li>
          ) : (
            <li className="nav-item nav-user-dropdown">
              <button 
                className="nav-user-btn" 
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                <img 
                  src={userDetails?.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userDetails?.username || user?.username || 'User') + '&background=3498db&color=fff'} 
                  alt="User avatar"
                  className="nav-avatar"
                />
                <span className="nav-username">{userDetails?.username || user?.username || 'User'}</span>
                <i className={`fas fa-chevron-down dropdown-icon ${isDropdownOpen ? 'open' : ''}`}></i>
              </button>
              
              {isDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/my-auctions" 
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-gavel"></i>
                    <span>My Auctions</span>
                  </Link>
                  <Link 
                    to="/my-bids" 
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-history"></i>
                    <span>My Bids</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
