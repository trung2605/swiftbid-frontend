import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Navigation from '../../components/Navigation/Navigation';
import Footer from '../../components/Footer/Footer';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.scss';

/**
 * MainLayout Component
 * Main layout wrapper that combines Header, Navigation, Sidebar, Content, and Footer
 */
const MainLayout = ({ showSidebar = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="main-layout">
      <Header />
      <Navigation />
      
      <div className="layout-container">
        {showSidebar && (
          <>
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </>
        )}
        
        <main className={`layout-content ${showSidebar ? 'with-sidebar' : ''}`}>
          {/* Outlet renders the child routes */}
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
