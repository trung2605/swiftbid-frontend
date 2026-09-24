import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRoles } from '../../services/authService';
import auctionService from '../../services/auctionService';
import './MyAuctionsPage.scss';

/**
 * My Auctions Page
 * Lets a SELLER (or ADMIN) see and manage the auctions they created:
 * edit the schedule while still PENDING (FR-AUC-04), cancel an auction (FR-AUC-05).
 */
const MyAuctionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isRoleChecked, setIsRoleChecked] = useState(false);

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '' });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      const hasToken = localStorage.getItem('token');
      if (hasToken) {
        try {
          const response = await getRoles();
          setRoles(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
          setRoles([]);
        }
      } else {
        setRoles([]);
      }
      setIsRoleChecked(true);
    };
    fetchUserRoles();
  }, [user]);

  const fetchMyAuctions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auctionService.getMyAuctions();
      setAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải danh sách phiên đấu giá của bạn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isRoleChecked) {
      if (roles.includes('SELLER') || roles.includes('ADMIN')) {
        fetchMyAuctions();
      } else {
        setLoading(false);
      }
    }
  }, [isRoleChecked, roles, fetchMyAuctions]);

  if (roles.length > 0 && !roles.includes('SELLER') && !roles.includes('ADMIN')) {
    return (
      <div className="my-auctions-page">
        <div className="access-denied">
          <i className="fas fa-ban"></i>
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn cần có quyền SELLER để quản lý phiên đấu giá.</p>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            <i className="fas fa-user"></i>
            Đi tới trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });

  const toDatetimeLocal = (dateString) => {
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { label: 'Chờ bắt đầu', className: 'status-pending' },
      ACTIVE: { label: 'Đang diễn ra', className: 'status-active' },
      COMPLETED: { label: 'Đã kết thúc', className: 'status-completed' },
      CANCELLED: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    const info = map[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${info.className}`}>{info.label}</span>;
  };

  const startEdit = (auction) => {
    setEditingId(auction.id);
    setEditForm({
      startTime: toDatetimeLocal(auction.startTime),
      endTime: toDatetimeLocal(auction.endTime),
    });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (auctionId) => {
    setSavingId(auctionId);
    setError('');
    try {
      const startTime = new Date(editForm.startTime).toISOString();
      const endTime = new Date(editForm.endTime).toISOString();
      if (new Date(endTime) <= new Date(startTime)) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu');
        setSavingId(null);
        return;
      }
      await auctionService.updateAuction(auctionId, { startTime, endTime });
      setSuccess('Cập nhật lịch đấu giá thành công!');
      setEditingId(null);
      await fetchMyAuctions();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật lịch đấu giá');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy phiên đấu giá này?')) return;
    try {
      await auctionService.deleteAuction(auctionId);
      setSuccess('Đã hủy phiên đấu giá.');
      await fetchMyAuctions();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy phiên đấu giá');
    }
  };

  return (
    <div className="my-auctions-page">
      <div className="auctions-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-gavel"></i>
            Phiên Đấu Giá Của Tôi
          </h1>
          <button className="btn btn-primary" onClick={() => navigate('/create-auction')}>
            <i className="fas fa-plus"></i>
            Tạo Phiên Mới
          </button>
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
        ) : auctions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>Bạn chưa tạo phiên đấu giá nào</h3>
            <button className="btn btn-primary" onClick={() => navigate('/my-products')}>
              <i className="fas fa-box"></i>
              Đi tới Sản Phẩm Của Tôi
            </button>
          </div>
        ) : (
          <div className="auctions-table">
            {auctions.map((auction) => (
              <div key={auction.id} className="auction-row">
                <div className="row-main" onClick={() => navigate(`/auctions/${auction.id}`)}>
                  <img
                    src={auction.product?.imageUrl || 'https://via.placeholder.com/80x60?text=No+Image'}
                    alt={auction.product?.name}
                    className="row-image"
                  />
                  <div className="row-info">
                    <h3>{auction.product?.name || 'Sản phẩm'}</h3>
                    <span className="row-price">{formatCurrency(auction.currentHighestBidAmount)}</span>
                    <span className="row-bids">{auction.bidCount || 0} lượt đặt giá</span>
                  </div>
                  {getStatusBadge(auction.status)}
                </div>

                {editingId === auction.id ? (
                  <div className="row-edit-form" onClick={(e) => e.stopPropagation()}>
                    <label>
                      Bắt đầu
                      <input
                        type="datetime-local"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm((p) => ({ ...p, startTime: e.target.value }))}
                      />
                    </label>
                    <label>
                      Kết thúc
                      <input
                        type="datetime-local"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm((p) => ({ ...p, endTime: e.target.value }))}
                      />
                    </label>
                    <div className="row-edit-actions">
                      <button
                        className="btn btn-primary"
                        disabled={savingId === auction.id}
                        onClick={() => saveEdit(auction.id)}
                      >
                        {savingId === auction.id ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button className="btn btn-secondary" onClick={cancelEdit}>
                        Hủy bỏ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row-times">
                    <span><i className="fas fa-calendar-alt"></i> {formatDateTime(auction.startTime)}</span>
                    <span><i className="fas fa-calendar-check"></i> {formatDateTime(auction.endTime)}</span>
                  </div>
                )}

                {editingId !== auction.id && (
                  <div className="row-actions">
                    {auction.status === 'PENDING' && (
                      <button className="btn-icon" title="Sửa lịch" onClick={() => startEdit(auction)}>
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                    {auction.status !== 'COMPLETED' && auction.status !== 'CANCELLED' && (
                      <button className="btn-icon btn-danger" title="Hủy" onClick={() => handleCancelAuction(auction.id)}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctionsPage;
