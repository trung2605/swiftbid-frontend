import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import './ForgotPasswordPage.scss';

/**
 * Forgot Password Page Component
 * Handles password reset request
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await forgotPassword({ email });
      setMessage(
        'Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu qua email trong vài phút.'
      );
      setEmail(''); // Clear form
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <div className="icon">
              <i className="fas fa-key"></i>
            </div>
            <h2>Quên Mật Khẩu?</h2>
            <p>Nhập email của bạn để nhận link đặt lại mật khẩu</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            {message && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Địa chỉ Email</label>
              <input
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi Link Đặt Lại'}
            </button>

            <div className="form-footer">
              <Link to="/login" className="back-link">
                <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
              </Link>
            </div>
          </form>

          <div className="info-box">
            <i className="fas fa-info-circle"></i>
            <p>
              Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam
              hoặc liên hệ với bộ phận hỗ trợ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
