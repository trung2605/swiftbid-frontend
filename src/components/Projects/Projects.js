import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auctionService from '../../services/auctionService';
import './Projects.scss';

/**
 * Projects Component (renamed to Products for auction context)
 * Displays a list of products available for auction
 */
const Projects = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await auctionService.getAllAuctions();
      setAuctions(data);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Không thể tải danh sách phiên đấu giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (auctionId) => {
    try {
      // Fetch auction details before navigating
      const details = await auctionService.getAuctionDetails(auctionId);
      console.log('Auction details:', details);
      // Navigate to auction detail page (will implement later)
      navigate(`/auctions/${auctionId}`);
    } catch (err) {
      console.error('Error fetching auction details:', err);
      alert('Không thể tải chi tiết phiên đấu giá');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ bắt đầu', className: 'status-pending' },
      ACTIVE: { label: 'Đang diễn ra', className: 'status-active' },
      COMPLETED: { label: 'Đã kết thúc', className: 'status-completed' },
      CANCELLED: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="projects-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải phiên đấu giá...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={fetchAuctions} className="retry-btn">
          <i className="fas fa-redo"></i> Thử lại
        </button>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="projects-empty">
        <i className="fas fa-inbox"></i>
        <p>Chưa có phiên đấu giá nào</p>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <h2 className="projects-title">
        <i className="fas fa-gavel"></i>
        Phiên Đấu Giá Nổi Bật
      </h2>
      <div className="projects-grid">
        {auctions.map((auction) => (
          <div key={auction.id} className="project-card">
            <div className="project-image">
              <img 
                src={auction.product?.imageUrl || 'https://img.freepik.com/free-vector/glitch-error-404-page-background_23-2148090004.jpg?semt=ais_hybrid&w=740&q=80'} 
                alt={auction.product?.name || 'Auction Item'}
                onError={(e) => {
                  e.target.src = 'https://img.freepik.com/free-vector/glitch-error-404-page-background_23-2148090004.jpg?semt=ais_hybrid&w=740&q=80';
                }}
              />
              <div className="project-status">
                {getStatusBadge(auction.status)}
              </div>
            </div>
            <div className="project-content">
              <h3 className="project-name">
                {auction.productName || 'Unnamed Product'}
              </h3>
              <p className="project-description">
                {auction.product?.description || 'Không có mô tả'}
              </p>
              
              <div className="project-info">
                <div className="info-item">
                  <i className="fas fa-dollar-sign"></i>
                  <div>
                    <span className="info-label">Giá khởi điểm</span>
                    <span className="info-value">{formatCurrency(auction.startingPrice)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <span className="info-label">Kết thúc</span>
                    <span className="info-value">{formatDate(auction.endTime)}</span>
                  </div>
                </div>
              </div>

              <div className="project-footer">
                <div className="bid-info">
                  <span className="current-bid-label">Giá hiện tại</span>
                  <span className="current-bid-amount">
                    {formatCurrency(auction.currentPrice || auction.startingPrice)}
                  </span>
                </div>
                <button 
                  className="project-btn"
                  onClick={() => handleViewDetails(auction.id)}
                  disabled={auction.status === 'COMPLETED' || auction.status === 'CANCELLED'}
                >
                  {auction.status === 'ACTIVE' ? (
                    <>
                      <i className="fas fa-gavel"></i>
                      Đấu giá ngay
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye"></i>
                      Xem chi tiết
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
