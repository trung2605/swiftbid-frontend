import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/logo.png"; // Đảm bảo bạn đã có file ảnh logo ở đây
import "./Header.scss";

/**
 * Header Component
 * Modern header with sticky positioning and refined UI
 */
const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        {/* Left: Logo */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="SwiftBid Logo" className="logo-img" />
          {/* Nếu bạn muốn giữ chữ bên cạnh logo thì uncomment dòng dưới */}
          {/* <span className="logo-text">SwiftBid</span> */}
        </Link>

        {/* Center: Search Bar */}
        <div className="header-search-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Tìm kiếm phiên đấu giá..."
            className="search-input"
          />
        </div>

        {/* Right: Actions */}
        <>
          <Link to="/notifications" className="action-btn" title="Thông báo">
            <i className="far fa-bell"></i>
          </Link>

          <Link to="/cart" className="action-btn cart-btn" title="Giỏ hàng">
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-badge">3</span>
          </Link>
        </>
      </div>
    </header>
  );
};

export default Header;
