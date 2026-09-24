import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import bidService from '../../services/bidService';
import './MyBidsPage.scss';

/**
 * My Bids Page (FR-BID-04)
 * Shows every bid the current user has ever placed, newest first, and whether
 * it is currently the winning bid on its auction.
 */
const MyBidsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBids = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError('');
      try {
        const data = await bidService.getBidsByUser(user.id);
        setBids(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải lịch sử đặt giá của bạn');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [user]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });

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

  if (!isAuthenticated) {
    return (
      <div className="my-bids-page">
        <div className="access-denied">
          <i className="fas fa-lock"></i>
          <h2>Vui lòng đăng nhập</h2>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bids-page">
      <div className="bids-container">
        <div className="page-header">
          <h1>
            <i className="fas fa-history"></i>
            Lịch Sử Đặt Giá Của Tôi
          </h1>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>Bạn chưa đặt giá phiên đấu giá nào</h3>
            <button className="btn btn-primary" onClick={() => navigate('/auctions')}>
              <i className="fas fa-gavel"></i>
              Khám phá phiên đấu giá
            </button>
          </div>
        ) : (
          <div className="bids-list">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className={`bid-row ${bid.winning ? 'winning' : ''}`}
                onClick={() => navigate(`/auctions/${bid.auctionId}`)}
              >
                <div className="bid-main">
                  <h3>{bid.productName || 'Sản phẩm đấu giá'}</h3>
                  <span className="bid-time">{formatDateTime(bid.timestamp)}</span>
                </div>
                <div className="bid-amount-block">
                  <span className="bid-amount">{formatCurrency(bid.bidAmount)}</span>
                  {bid.winning && (
                    <span className="winning-badge">
                      <i className="fas fa-trophy"></i> Đang giữ giá cao nhất
                    </span>
                  )}
                </div>
                {getStatusBadge(bid.auctionStatus)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBidsPage;
