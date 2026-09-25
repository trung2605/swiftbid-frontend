import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRoles } from '../../services/authService';
import userService from '../../services/userService';
import './AdminPage.scss';

/**
 * Admin Page (FR-ADMIN-01)
 * User management for ADMIN accounts: list every user and remove one if needed.
 * The backend already enforces @PreAuthorize("hasRole('ADMIN')") on every call here —
 * this page's own role check is only for the UI (hide the page / show a friendly message).
 */
const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isRoleChecked, setIsRoleChecked] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      if (!localStorage.getItem('token')) {
        setRoles([]);
        setIsRoleChecked(true);
        return;
      }
      try {
        const response = await getRoles();
        setRoles(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setRoles([]);
      } finally {
        setIsRoleChecked(true);
      }
    };
    fetchRoles();
  }, [user]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải danh sách người dùng (bạn có thể không có quyền ADMIN).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isRoleChecked && roles.includes('ADMIN')) {
      fetchUsers();
    } else if (isRoleChecked) {
      setLoading(false);
    }
  }, [isRoleChecked, roles, fetchUsers]);

  if (roles.length > 0 && !roles.includes('ADMIN')) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <i className="fas fa-ban"></i>
          <h2>Truy cập bị từ chối</h2>
          <p>Trang này chỉ dành cho quản trị viên (ADMIN).</p>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            <i className="fas fa-user"></i>
            Đi tới trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình tại đây.');
      return;
    }
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${targetUser.username}"?`)) return;

    try {
      await userService.deleteUser(targetUser.id);
      setSuccess(`Đã xóa người dùng "${targetUser.username}".`);
      await fetchUsers();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa người dùng này.');
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-user-shield"></i>
            Quản Trị Người Dùng
          </h1>
          <span className="user-count">{users.length} người dùng</span>
        </div>

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

        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <span>Tên đăng nhập</span>
              <span>Email</span>
              <span>Vai trò</span>
              <span>Ngày tham gia</span>
              <span>Hành động</span>
            </div>
            {users.map((u) => (
              <div key={u.id} className="table-row">
                <span className="username">{u.username}</span>
                <span className="email">{u.email}</span>
                <span className="roles">
                  {(u.roles || []).map((r) => (
                    <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r}</span>
                  ))}
                </span>
                <span className="joined">{formatDate(u.createdAt)}</span>
                <span className="actions">
                  <button
                    className="btn-icon btn-danger"
                    title="Xóa người dùng"
                    onClick={() => handleDeleteUser(u)}
                    disabled={u.id === user?.id}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
