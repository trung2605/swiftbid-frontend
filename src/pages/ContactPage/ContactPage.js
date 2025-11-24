import React, { useState } from 'react';
import emailService from '../../services/emailService';
import './ContactPage.scss';

/**
 * Contact Page Component
 * Allows users to send messages to the website
 */
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const result = await emailService.sendContactEmail(formData);
      
      if (result.success) {
        setSuccess('Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setError(result.message || 'Không thể gửi tin nhắn. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <h1>
            <i className="fas fa-envelope"></i>
            Liên Hệ Với Chúng Tôi
          </h1>
          <p>Có câu hỏi hoặc góp ý? Hãy gửi tin nhắn cho chúng tôi!</p>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <h2>
                <i className="fas fa-paper-plane"></i>
                Gửi Tin Nhắn
              </h2>

              {/* Alert Messages */}
              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fas fa-user"></i>
                      Họ và tên <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên của bạn"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i>
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    <i className="fas fa-tag"></i>
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Tiêu đề tin nhắn"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <i className="fas fa-comment-alt"></i>
                    Nội dung <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Gửi Tin Nhắn
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="info-card">
              <h2>
                <i className="fas fa-info-circle"></i>
                Thông Tin Liên Hệ
              </h2>

              <div className="info-items">
                <div className="info-item">
                  <div className="icon-wrapper">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="info-content">
                    <h3>Địa chỉ</h3>
                    <p>123 Đường ABC, Quận XYZ<br />Thành phố Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-wrapper">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="info-content">
                    <h3>Điện thoại</h3>
                    <p>
                      <a href="tel:+84123456789">+84 123 456 789</a><br />
                      <a href="tel:+84987654321">+84 987 654 321</a>
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-wrapper">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="info-content">
                    <h3>Email</h3>
                    <p>
                      <a href="mailto:support@swiftbid.com">support@swiftbid.com</a><br />
                      <a href="mailto:info@swiftbid.com">info@swiftbid.com</a>
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-wrapper">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="info-content">
                    <h3>Giờ làm việc</h3>
                    <p>
                      Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                      Thứ 7: 9:00 - 17:00<br />
                      Chủ nhật: Nghỉ
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3>Theo dõi chúng tôi</h3>
                <div className="social-links">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-card">
              <h2>
                <i className="fas fa-question-circle"></i>
                Câu Hỏi Thường Gặp
              </h2>
              <div className="faq-items">
                <div className="faq-item">
                  <h4>Làm sao để tham gia đấu giá?</h4>
                  <p>Bạn cần đăng ký tài khoản và nâng cấp lên quyền SELLER để có thể tạo và tham gia đấu giá.</p>
                </div>
                <div className="faq-item">
                  <h4>Phí giao dịch là bao nhiêu?</h4>
                  <p>SwiftBid thu phí 5% trên mỗi giao dịch thành công.</p>
                </div>
                <div className="faq-item">
                  <h4>Thời gian phản hồi?</h4>
                  <p>Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
