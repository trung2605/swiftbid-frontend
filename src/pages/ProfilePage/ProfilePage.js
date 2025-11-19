import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, becomeSeller, getRoles } from '../../services/authService';
import apiClient from '../../config/api';
import './ProfilePage.scss';

/**
 * Profile Page Component
 * Display and update user profile information
 */
const ProfilePage = () => {
  const { updateUser, logoutAction } = useAuth();
  const fileInputRef = useRef(null);

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [roles, setRoles] = useState([]);

  // Form data for editing
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
  });

  // Fetch user details on mount
  useEffect(() => {
    fetchUserDetails();
    fetchRoles();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCurrentUser();
      setUserDetails(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || '',
        address: response.data.address || '',
        bio: response.data.bio || '',
      });
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Không thể tải thông tin người dùng');
      if (err.response?.status === 401) {
        logoutAction();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setFormData({
        fullName: userDetails.fullName || '',
        email: userDetails.email || '',
        phoneNumber: userDetails.phoneNumber || '',
        address: userDetails.address || '',
        bio: userDetails.bio || '',
      });
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiClient.put('/api/user-details/me', formData);
      setUserDetails(response.data);
      setIsEditing(false);
      setSuccess('Cập nhật thông tin thành công!');
      
      // Update auth context
      updateUser(response.data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(
        err.response?.data?.message ||
        'Không thể cập nhật thông tin. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (jpg, png, gif, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/user-details/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update avatar URL
      const newAvatarUrl = response.data.avatarUrl;
      setUserDetails(prev => ({
        ...prev,
        avatarUrl: newAvatarUrl,
      }));

      // Update auth context
      updateUser({
        ...userDetails,
        avatarUrl: newAvatarUrl,
      });

      setSuccess('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(
        err.response?.data?.message ||
        'Không thể tải ảnh lên. Vui lòng thử lại.'
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBecomeSeller = async () => {
    setUpgrading(true);
    setError('');
    setSuccess('');

    try {
      const response = await becomeSeller();
      
      // Update user details
      await fetchUserDetails();
      await fetchRoles();
      
      setSuccess(response.data.message || 'Nâng cấp tài khoản thành SELLER thành công!');
      setShowUpgradeModal(false);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Failed to become seller:', err);
      setError(
        err.response?.data?.message ||
        'Không thể nâng cấp tài khoản. Vui lòng thử lại.'
      );
    } finally {
      setUpgrading(false);
    }
  };

  if (loading && !userDetails) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>
            <i className="fas fa-user-circle"></i>
            Thông Tin Cá Nhân
          </h1>
          <p>Quản lý thông tin tài khoản của bạn</p>
        </div>

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

        <div className="profile-content">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              <img
                src={
                  userDetails?.avatarUrl ||
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(userDetails?.username || 'User') +
                    '&size=200&background=3498db&color=fff'
                }
                alt="User avatar"
                className="profile-avatar"
              />
              <button
                className="avatar-upload-btn"
                onClick={handleAvatarClick}
                disabled={uploading}
                title="Thay đổi ảnh đại diện"
              >
                {uploading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-camera"></i>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="avatar-info">
              <h2>{userDetails?.username}</h2>
              <p className="user-role">
                <i className="fas fa-shield-alt"></i>
                {userDetails?.role || 'USER'}
              </p>
              <p className="avatar-hint">
                Click vào ảnh để thay đổi (Max 5MB)
              </p>
              
              {/* Upgrade to Seller Button */}
              {!roles.includes('SELLER') && !roles.includes('ADMIN') && (
                <button
                  className="btn-upgrade-seller"
                  onClick={() => setShowUpgradeModal(true)}
                  disabled={upgrading}
                >
                  <i className="fas fa-store"></i>
                  Nâng cấp thành Seller
                </button>
              )}
            </div>
          </div>

          {/* Upgrade Confirmation Modal */}
          {showUpgradeModal && (
            <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    <i className="fas fa-store"></i>
                    Nâng cấp tài khoản Seller
                  </h3>
                  <button 
                    className="modal-close" 
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc chắn muốn nâng cấp tài khoản thành <strong>SELLER</strong>?</p>
                  <div className="upgrade-benefits">
                    <h4>Quyền lợi của Seller:</h4>
                    <ul>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        Tạo và quản lý phiên đấu giá
                      </li>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        Đăng bán sản phẩm của bạn
                      </li>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        Theo dõi và quản lý giao dịch
                      </li>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        Nhận thanh toán trực tiếp
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowUpgradeModal(false)}
                    disabled={upgrading}
                  >
                    <i className="fas fa-times"></i>
                    Hủy bỏ
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleBecomeSeller}
                    disabled={upgrading}
                  >
                    {upgrading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Xác nhận nâng cấp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="profile-form-section">
            <div className="form-header">
              <h3>Thông Tin Chi Tiết</h3>
              <button
                className={`btn-edit ${isEditing ? 'btn-cancel' : ''}`}
                onClick={handleEditToggle}
                disabled={loading}
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-times"></i>
                    Hủy
                  </>
                ) : (
                  <>
                    <i className="fas fa-edit"></i>
                    Chỉnh sửa
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">
                    <i className="fas fa-user"></i>
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={userDetails?.username || ''}
                    disabled
                    className="input-disabled"
                  />
                  <small className="form-hint">Không thể thay đổi</small>
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">
                    <i className="fas fa-id-card"></i>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="example@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    <i className="fas fa-phone"></i>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt"></i>
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">
                  <i className="fas fa-info-circle"></i>
                  Giới thiệu
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleEditToggle}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Account Stats */}
          <div className="profile-stats">
            <h3>Thống Kê Tài Khoản</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-gavel"></i>
                <div className="stat-info">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Đấu giá đã tạo</span>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-hand-holding-usd"></i>
                <div className="stat-info">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Đấu giá đã tham gia</span>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-trophy"></i>
                <div className="stat-info">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Đấu giá thắng</span>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-calendar-check"></i>
                <div className="stat-info">
                  <span className="stat-value">
                    {userDetails?.createdAt
                      ? new Date(userDetails.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </span>
                  <span className="stat-label">Ngày tham gia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
