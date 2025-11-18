import React from 'react';
import Projects from '../../components/Projects/Projects';
import './HomePage.scss';
import backgroundImage from '../../assets/images/background-1.png';
/**
 * HomePage Component
 * Landing page of the application
 */
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to SwiftBid</h1>
          <p className="hero-subtitle">
            Discover amazing deals and place your bids on thousands of unique items
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">Browse Auctions</button>
            <button className="btn btn-secondary">How It Works</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={backgroundImage} alt="Auction" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">Active Auctions</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">50,000+</h3>
              <p className="stat-label">Happy Users</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">$5M+</h3>
              <p className="stat-label">Total Transactions</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">99.9%</h3>
              <p className="stat-label">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="featured-section">
        <Projects />
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Bidding?</h2>
          <p>Join thousands of users who trust SwiftBid for their online auctions</p>
          <button className="btn btn-large">Sign Up Now</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
