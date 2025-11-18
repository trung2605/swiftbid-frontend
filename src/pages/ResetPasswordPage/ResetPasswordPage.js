import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import './ResetPasswordPage.scss';

/**
 * Reset Password Page Component
 * Handles password reset with token from email link
 */
const ResetPasswordPage = () => {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setTokenValid(false);
      setError('Token không hợp lệ hoặc đã hết hạn.');
    }
  }, [token]);

  const validatePassword = (pass) => {
    if (pass.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate token
    if (!token || !tokenValid) {
      setError('Token không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.');
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, newPassword: password });
      
      // Show success message and redirect to login
      alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.'
      );
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="error-state">
              <div className="icon error">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Token Không Hợp Lệ</h2>
              <p>{error || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}</p>
              <Link to="/forgot-password" className="btn-primary">
                Yêu Cầu Link Mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <div className="icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2>Đặt Lại Mật Khẩu</h2>
            <p>Nhập mật khẩu mới của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Mật khẩu mới</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <h4>Yêu cầu mật khẩu:</h4>
              <ul>
                <li className={password.length >= 6 ? 'valid' : ''}>
                  <i className={password.length >= 6 ? 'fas fa-check-circle' : 'fas fa-circle'}></i>
                  Tối thiểu 6 ký tự
                </li>
                <li className={password === confirmPassword && password ? 'valid' : ''}>
                  <i className={password === confirmPassword && password ? 'fas fa-check-circle' : 'fas fa-circle'}></i>
                  Mật khẩu xác nhận khớp
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
            </button>

            <div className="form-footer">
              <Link to="/login" className="back-link">
                <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
