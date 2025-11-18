import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.scss';

/**
 * Sidebar Component
 * Navigation sidebar for filtering and categories
 */
const Sidebar = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState('categories');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const categories = [
    { id: 1, name: 'Electronics', count: 45 },
    { id: 2, name: 'Collectibles', count: 32 },
    { id: 3, name: 'Fashion', count: 28 },
    { id: 4, name: 'Home & Garden', count: 19 },
    { id: 5, name: 'Sports', count: 15 },
    { id: 6, name: 'Art', count: 12 }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Filters</h2>
          <button className="sidebar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Categories Section */}
          <div className="sidebar-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('categories')}
            >
              <span>Categories</span>
              <i className={`fas fa-chevron-${expandedSection === 'categories' ? 'up' : 'down'}`}></i>
            </button>
            {expandedSection === 'categories' && (
              <ul className="section-list">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link to={`/category/${category.id}`}>
                      {category.name}
                      <span className="count">({category.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Price Range Section */}
          <div className="sidebar-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('price')}
            >
              <span>Price Range</span>
              <i className={`fas fa-chevron-${expandedSection === 'price' ? 'up' : 'down'}`}></i>
            </button>
            {expandedSection === 'price' && (
              <div className="price-filter">
                <div className="price-inputs">
                  <input type="number" placeholder="Min" />
                  <span>-</span>
                  <input type="number" placeholder="Max" />
                </div>
                <button className="apply-btn">Apply</button>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="sidebar-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('status')}
            >
              <span>Status</span>
              <i className={`fas fa-chevron-${expandedSection === 'status' ? 'up' : 'down'}`}></i>
            </button>
            {expandedSection === 'status' && (
              <ul className="section-list">
                <li>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Active Auctions</span>
                  </label>
                </li>
                <li>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Ending Soon</span>
                  </label>
                </li>
                <li>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>New Today</span>
                  </label>
                </li>
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
