import React, { useEffect, useRef, useState } from 'react';
import './About.scss';

/**
 * About Component
 * Displays information about the SwiftBid platform with animations
 */
const About = () => {
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = {
    stats: useRef(null),
    features: useRef(null),
    values: useRef(null),
  };

  useEffect(() => {
    const observers = {};

    Object.keys(sectionRefs).forEach((key) => {
      observers[key] = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({ ...prev, [key]: true }));
            }
          });
        },
        { threshold: 0.1 }
      );

      if (sectionRefs[key].current) {
        observers[key].observe(sectionRefs[key].current);
      }
    });

    return () => {
      Object.keys(observers).forEach((key) => {
        if (sectionRefs[key].current) {
          observers[key].unobserve(sectionRefs[key].current);
        }
      });
    };
  }, []);

  const stats = [
    { icon: 'fa-users', number: '50,000+', label: 'Active Users', color: '#3498db' },
    { icon: 'fa-gavel', number: '100,000+', label: 'Auctions Completed', color: '#e74c3c' },
    { icon: 'fa-dollar-sign', number: '$10M+', label: 'Total Transactions', color: '#27ae60' },
    { icon: 'fa-trophy', number: '99.9%', label: 'Success Rate', color: '#f39c12' },
  ];

  const features = [
    {
      icon: 'fa-bolt',
      title: 'Real-time Bidding',
      description: 'Experience live auction action with instant updates and real-time notifications.',
      color: '#3498db',
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Transactions',
      description: 'Your payments and data are protected with industry-leading security protocols.',
      color: '#27ae60',
    },
    {
      icon: 'fa-th-large',
      title: 'Wide Selection',
      description: 'Browse thousands of products across multiple categories and find what you love.',
      color: '#e74c3c',
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Our dedicated support team is always ready to help you with any questions.',
      color: '#f39c12',
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Bid on the go with our responsive design that works on any device.',
      color: '#9b59b6',
    },
    {
      icon: 'fa-chart-line',
      title: 'Smart Analytics',
      description: 'Track your bidding history and get insights to make better decisions.',
      color: '#1abc9c',
    },
  ];

  const values = [
    {
      icon: 'fa-heart',
      title: 'Trust',
      description: 'Building long-term relationships based on transparency and integrity.',
    },
    {
      icon: 'fa-rocket',
      title: 'Innovation',
      description: 'Constantly evolving to provide the best auction experience.',
    },
    {
      icon: 'fa-handshake',
      title: 'Community',
      description: 'Creating a supportive environment for buyers and sellers.',
    },
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="hero-content">
          <h2 className="about-title">
            <span className="title-line">Revolutionizing</span>
            <span className="title-line gradient-text">Online Auctions</span>
          </h2>
          <p className="about-description">
            SwiftBid is a modern online auction platform that connects buyers and sellers
            in a secure and efficient marketplace. Our mission is to make bidding simple,
            transparent, and accessible to everyone around the world.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">
              <i className="fas fa-play"></i>
              Get Started
            </button>
            <button className="btn-secondary">
              <i className="fas fa-info-circle"></i>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={sectionRefs.stats}
        className={`stats-section ${isVisible.stats ? 'visible' : ''}`}
      >
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
              <div className="stat-line" style={{ backgroundColor: stat.color }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div
        ref={sectionRefs.features}
        className={`features-section ${isVisible.features ? 'visible' : ''}`}
      >
        <h2 className="section-title">
          <span className="title-badge">Why Choose Us</span>
          Powerful Features for Everyone
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ color: feature.color }}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <div className="icon-background" style={{ backgroundColor: `${feature.color}40` }}></div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div
        ref={sectionRefs.values}
        className={`values-section ${isVisible.values ? 'visible' : ''}`}
      >
        <h2 className="section-title">Our Core Values</h2>
        <div className="values-grid">
          {values.map((value, index) => (
            <div
              key={index}
              className="value-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="value-icon">
                <i className={`fas ${value.icon}`}></i>
              </div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-description">
            Join thousands of satisfied users and experience the future of online auctions
          </p>
          <button className="cta-button">
            <span>Join SwiftBid Today</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div className="cta-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default About;
