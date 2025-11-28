import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Projects from '../../components/Projects/Projects';
import './HomePage.scss';
import backgroundImage from '../../assets/images/background-1.png';

/**
 * HomePage Component
 * Landing page with scroll-triggered animations and lazy loading
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  
  // Refs for sections
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Smooth scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for lazy loading sections
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = [statsRef, featuresRef, stepsRef, testimonialsRef, ctaRef];
    sections.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sections.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (visibleSections.has('stats')) {
      const counters = document.querySelectorAll('.stat-number[data-target]');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            counter.textContent = Math.ceil(current).toLocaleString() + '+';
            setTimeout(updateCounter, 20);
          } else {
            counter.textContent = counter.dataset.display || (target.toLocaleString() + '+');
          }
        };
        
        updateCounter();
      });
    }
  }, [visibleSections]);

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Nhà sưu tầm",
      content: "SwiftBid đã giúp tôi tìm được những món đồ cổ quý hiếm. Giao diện dễ sử dụng, thanh toán nhanh chóng!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
      name: "Trần Thị B",
      role: "Người bán",
      content: "Tôi đã bán được nhiều sản phẩm với giá tốt. Hệ thống đấu giá minh bạch và chuyên nghiệp.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=45"
    },
    {
      name: "Lê Văn C",
      role: "Nhà đầu tư",
      content: "Nền tảng tuyệt vời cho những ai muốn mua bán đồ có giá trị. Rất đáng tin cậy!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=33"
    }
  ];

  const features = [
    {
      icon: "fa-shield-halved",
      title: "An Toàn & Bảo Mật",
      description: "Mã hóa SSL 256-bit, bảo vệ thông tin giao dịch của bạn tuyệt đối",
      color: "#4CAF50"
    },
    {
      icon: "fa-bolt",
      title: "Đấu Giá Thời Gian Thực",
      description: "Hệ thống cập nhật giá đấu ngay lập tức, không bỏ lỡ cơ hội nào",
      color: "#FF9800"
    },
    {
      icon: "fa-headset",
      title: "Hỗ Trợ 24/7",
      description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc",
      color: "#2196F3"
    },
    {
      icon: "fa-credit-card",
      title: "Thanh Toán Đa Dạng",
      description: "Chấp nhận nhiều phương thức thanh toán: Thẻ, Ví điện tử, Chuyển khoản",
      color: "#9C27B0"
    },
    {
      icon: "fa-certificate",
      title: "Xác Thực Sản Phẩm",
      description: "Mọi sản phẩm được kiểm tra và xác thực nguồn gốc trước khi đấu giá",
      color: "#F44336"
    },
    {
      icon: "fa-mobile-screen",
      title: "Đa Nền Tảng",
      description: "Trải nghiệm mượt mà trên mọi thiết bị: Desktop, Tablet, Mobile",
      color: "#00BCD4"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Đăng Ký Tài Khoản",
      description: "Tạo tài khoản miễn phí chỉ trong 1 phút",
      icon: "fa-user-plus"
    },
    {
      number: "02",
      title: "Duyệt Sản Phẩm",
      description: "Khám phá hàng ngàn sản phẩm đang được đấu giá",
      icon: "fa-magnifying-glass"
    },
    {
      number: "03",
      title: "Đặt Giá Thầu",
      description: "Đưa ra mức giá của bạn và theo dõi cuộc đua",
      icon: "fa-gavel"
    },
    {
      number: "04",
      title: "Chiến Thắng & Nhận Hàng",
      description: "Giành chiến thắng và nhận sản phẩm tại nhà",
      icon: "fa-trophy"
    }
  ];

  return (
    <div className="home-page">
      {/* Animated Background Particles */}
      <div className="particles-background">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{ 
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: 1 - scrollY / 800
        }}
      >
        <div className="hero-content">
          <div className="badge-new animate-bounce-in">
            <i className="fas fa-sparkles"></i>
            <span>Ra mắt tính năng đấu giá trực tiếp</span>
          </div>
          <h1 className="hero-title animate-slide-in-left">
            Nền Tảng Đấu Giá <br />
            <span className="gradient-text typing-effect">Hàng Đầu Việt Nam</span>
          </h1>
          <p className="hero-subtitle animate-slide-in-left delay-1">
            Khám phá hàng ngàn sản phẩm độc đáo, đấu giá minh bạch và an toàn. 
            Tham gia cộng đồng 50,000+ người dùng tin tưởng SwiftBid.
          </p>
          <div className="hero-actions animate-slide-in-left delay-2">
            <button className="btn btn-primary btn-ripple" onClick={() => navigate('/auctions')}>
              <i className="fas fa-rocket"></i>
              <span>Khám Phá Ngay</span>
            </button>
            <button className="btn btn-secondary btn-ripple" onClick={() => navigate('/about')}>
              <i className="fas fa-play-circle"></i>
              <span>Xem Giới Thiệu</span>
            </button>
          </div>
          <div className="hero-stats-inline animate-fade-in delay-3">
            <div className="stat-inline">
              <i className="fas fa-users"></i>
              <span><strong>50,000+</strong> Người dùng</span>
            </div>
            <div className="stat-inline">
              <i className="fas fa-gavel"></i>
              <span><strong>10,000+</strong> Phiên đấu giá</span>
            </div>
            <div className="stat-inline">
              <i className="fas fa-star"></i>
              <span><strong>4.9/5</strong> Đánh giá</span>
            </div>
          </div>
        </div>
        <div className="hero-image animate-slide-in-right">
          <div className="image-wrapper floating-3d">
            <img src={backgroundImage} alt="Auction Platform" />
            
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        data-section="stats"
        className={`stats-section ${visibleSections.has('stats') ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-gavel"></i>
              </div>
              <h3 className="stat-number" data-target="10000" data-display="10,000+">0</h3>
              <p className="stat-label">Phiên Đấu Giá Hoàn Thành</p>
              <div className="stat-bar"></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="stat-number" data-target="50000" data-display="50,000+">0</h3>
              <p className="stat-label">Người Dùng Tin Tưởng</p>
              <div className="stat-bar"></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-sack-dollar"></i>
              </div>
              <h3 className="stat-number" data-display="150 Tỷ VNĐ+">0</h3>
              <p className="stat-label">Tổng Giá Trị Giao Dịch</p>
              <div className="stat-bar"></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-smile"></i>
              </div>
              <h3 className="stat-number" data-display="99.9%">0</h3>
              <p className="stat-label">Khách Hàng Hài Lòng</p>
              <div className="stat-bar"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        data-section="features"
        className={`features-section ${visibleSections.has('features') ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-decoration">✦</span>
              Tại Sao Chọn SwiftBid?
              <span className="title-decoration">✦</span>
            </h2>
            <p className="section-subtitle">
              Chúng tôi mang đến trải nghiệm đấu giá tốt nhất với công nghệ hiện đại
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon" style={{ background: feature.color }}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-shine"></div>
                <div className="feature-glow" style={{ background: feature.color }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={stepsRef}
        data-section="steps"
        className={`how-it-works-section ${visibleSections.has('steps') ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Quy Trình Đấu Giá Đơn Giản</h2>
            <p className="section-subtitle">4 bước để sở hữu sản phẩm yêu thích</p>
          </div>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="step-card"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < steps.length - 1 && <div className="step-connector"></div>}
                <div className="step-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Phiên Đấu Giá Nổi Bật</h2>
            <p className="section-subtitle">Những sản phẩm đang được quan tâm nhất</p>
          </div>
          <Projects />
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        data-section="testimonials"
        className={`testimonials-section ${visibleSections.has('testimonials') ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Khách Hàng Nói Gì Về Chúng Tôi</h2>
            <p className="section-subtitle">Hơn 50,000 người dùng hài lòng</p>
          </div>
          <div className="testimonials-slider">
            <button 
              className="slider-btn prev"
              onClick={() => setCurrentTestimonial((prev) => 
                prev === 0 ? testimonials.length - 1 : prev - 1
              )}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="testimonial-card active">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <div className="stars">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>
              <p className="testimonial-content">
                "{testimonials[currentTestimonial].content}"
              </p>
              <div className="testimonial-author">
                <img 
                  src={testimonials[currentTestimonial].avatar} 
                  alt={testimonials[currentTestimonial].name}
                  className="author-avatar"
                />
                <div className="author-info">
                  <h4 className="author-name">{testimonials[currentTestimonial].name}</h4>
                  <p className="author-role">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>

            <button 
              className="slider-btn next"
              onClick={() => setCurrentTestimonial((prev) => 
                (prev + 1) % testimonials.length
              )}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div className="slider-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        data-section="cta"
        className={`cta-section ${visibleSections.has('cta') ? 'visible' : ''}`}
      >
        <div className="cta-background">
          <div className="cta-shape shape-1"></div>
          <div className="cta-shape shape-2"></div>
        </div>
        <div className="cta-content">
          <div className="cta-icon">
            <i className="fas fa-rocket"></i>
          </div>
          <h2>Sẵn Sàng Bắt Đầu Đấu Giá?</h2>
          <p>
            Tham gia cùng hàng ngàn người dùng đang tin tưởng SwiftBid. 
            Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt!
          </p>
          <div className="cta-features">
            <div className="cta-feature">
              <i className="fas fa-check-circle"></i>
              <span>Miễn phí đăng ký</span>
            </div>
            <div className="cta-feature">
              <i className="fas fa-check-circle"></i>
              <span>Không phí ẩn</span>
            </div>
            <div className="cta-feature">
              <i className="fas fa-check-circle"></i>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
          <button className="btn btn-large btn-ripple" onClick={() => navigate('/register')}>
            <i className="fas fa-user-plus"></i>
            <span>Đăng Ký Miễn Phí</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
