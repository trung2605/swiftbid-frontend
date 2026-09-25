import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import auctionService from '../../services/auctionService';
import bidService from '../../services/bidService';
import { subscribeToAuction } from '../../services/websocketService';
import { useAuth } from '../../contexts/AuthContext';
import './AuctionDetailPage.scss';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Auction Detail Page Component
 * Display detailed information about a specific auction, allow placing bids (FR-BID-01),
 * show bid history (FR-BID-03) and reflect new bids from other users in real time (FR-BID-05).
 */
const AuctionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bidHistory, setBidHistory] = useState([]);
  const [bidHistoryLoading, setBidHistoryLoading] = useState(true);

  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [now, setNow] = useState(() => new Date());

  const fetchAuctionDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Use the /details endpoint for full auction information
      const response = await auctionService.getAuctionDetails(id);
      // Backend may return: { status, data, timestamp } or direct data
      const auctionData = response.data || response;
      setAuction(auctionData);
    } catch (err) {
      console.error('Failed to fetch auction detail:', err);
      setError('Không thể tải thông tin đấu giá');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBidHistory = useCallback(async () => {
    setBidHistoryLoading(true);
    try {
      const bids = await bidService.getBidsByAuction(id);
      setBidHistory(Array.isArray(bids) ? bids : []);
    } catch (err) {
      console.error('Failed to fetch bid history:', err);
    } finally {
      setBidHistoryLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuctionDetail();
    fetchBidHistory();
  }, [fetchAuctionDetail, fetchBidHistory]);

  // Ticks the countdown every second so "thời gian còn lại" updates live instead of only on reload.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // FR-BID-05: live-update the price/bid-count without requiring a page reload.
  useEffect(() => {
    const unsubscribe = subscribeToAuction(id, (update) => {
      setAuction((prev) => {
        // If I was the highest bidder and someone else just took the lead, let me know —
        // without this, the price on screen would just silently change under me.
        const iWasWinning = prev?.currentHighestBidder?.username === user?.username;
        const someoneElseNowWinning = update.currentHighestBidderUsername
          && update.currentHighestBidderUsername !== user?.username;
        if (iWasWinning && someoneElseNowWinning) {
          toast.warn(
            `Bạn đã bị vượt giá! Giá mới: ${new Intl.NumberFormat('vi-VN', {
              style: 'currency', currency: 'VND',
            }).format(update.currentHighestBidAmount)}`
          );
        }

        return prev
          ? {
              ...prev,
              currentHighestBidAmount: update.currentHighestBidAmount,
              currentHighestBidder: update.currentHighestBidderUsername
                ? { username: update.currentHighestBidderUsername }
                : prev.currentHighestBidder,
            }
          : prev;
      });
      fetchBidHistory();
    });
    return unsubscribe;
  }, [id, fetchBidHistory, user?.username]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  const calculateTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const diff = end - now; // `now` ticks every second (see the interval effect above)

    if (diff <= 0) return 'Đã kết thúc';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    if (minutes > 0) return `${minutes} phút ${seconds} giây`;
    return `${seconds} giây`;
  };

  const minNextBid = auction ? Number(auction.currentHighestBidAmount || 0) + 1000 : 0;

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError('');
    setBidSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const amount = Number(bidAmount);
    if (!amount || amount <= Number(auction.currentHighestBidAmount || 0)) {
      setBidError(`Giá đặt phải cao hơn giá hiện tại (${formatCurrency(auction.currentHighestBidAmount)})`);
      return;
    }

    setPlacingBid(true);
    try {
      await bidService.placeBid(Number(id), amount);
      setBidSuccess('Đặt giá thành công!');
      setBidAmount('');
      await fetchAuctionDetail();
      await fetchBidHistory();
      setTimeout(() => setBidSuccess(''), 3000);
    } catch (err) {
      setBidError(
        err.response?.data?.message ||
        'Không thể đặt giá. Vui lòng thử lại.'
      );
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="auction-detail-page">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin đấu giá...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="auction-detail-page">
        <div className="error-state">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Không tìm thấy phiên đấu giá</h2>
          <p>{error || 'Phiên đấu giá không tồn tại hoặc đã bị xóa'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/auctions')}>
            <i className="fas fa-arrow-left"></i>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auction-detail-page">
      <div className="auction-detail-container">
        {/* Header */}
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
        </div>

        {/* Main Content */}
        <div className="auction-content">
          {/* Left Column - Product Image */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={auction.product?.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={auction.product?.name || 'Auction Product'}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
            </div>
            {auction.auctionDetail?.bannerImageUrl && (
              <div className="banner-image">
                <img
                  src={auction.auctionDetail.bannerImageUrl}
                  alt="Auction Banner"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Column - Auction Info */}
          <div className="auction-info">
            {/* Product Title & Status */}
            <div className="auction-header">
              <h1>{auction.product?.name || 'Sản phẩm đấu giá'}</h1>
              {getStatusBadge(auction.status)}
            </div>

            {/* Current Price */}
            <div className="price-section">
              <div className="price-label">Giá hiện tại</div>
              <div className="current-price">
                {formatCurrency(auction.currentHighestBidAmount || 0)}
              </div>
              <div className="price-info">
                <span>Giá khởi điểm: {formatCurrency(auction.product?.initialPrice || 0)}</span>
                <span> · {bidHistory.length} lượt đặt giá</span>
              </div>
            </div>

            {/* Time Remaining */}
            {auction.status === 'ACTIVE' && (
              <div className="time-section">
                <i className="fas fa-clock"></i>
                <div className="time-info">
                  <span className="time-label">Thời gian còn lại</span>
                  <span className="time-remaining">{calculateTimeRemaining(auction.endTime)}</span>
                </div>
              </div>
            )}

            {/* Auction Times */}
            <div className="auction-times">
              <div className="time-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <label>Bắt đầu</label>
                  <span>{formatDateTime(auction.startTime)}</span>
                </div>
              </div>
              <div className="time-item">
                <i className="fas fa-calendar-check"></i>
                <div>
                  <label>Kết thúc</label>
                  <span>{formatDateTime(auction.endTime)}</span>
                </div>
              </div>
            </div>

            {/* Bid Form */}
            {auction.status === 'ACTIVE' && (
              <div className="bid-section">
                {bidError && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {bidError}
                  </div>
                )}
                {bidSuccess && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    {bidSuccess}
                  </div>
                )}
                <form onSubmit={handlePlaceBid} className="bid-form">
                  <input
                    type="number"
                    min={minNextBid}
                    step="1000"
                    placeholder={`Tối thiểu ${formatCurrency(minNextBid)}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    disabled={placingBid}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-bid" disabled={placingBid}>
                    {placingBid ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Đang đặt giá...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-gavel"></i> Đặt giá
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Seller Info */}
            {auction.product?.seller && (
              <div className="seller-info">
                <i className="fas fa-user"></i>
                <div>
                  <label>Người bán</label>
                  <span>{auction.product.seller.username || 'Người dùng'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="description-section">
          <h2>
            <i className="fas fa-info-circle"></i>
            Mô tả sản phẩm
          </h2>

          <ReactMarkdown remarkPlugins={[remarkGfm]} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {auction.product?.description || 'Không có mô tả'}
          </ReactMarkdown>
          {/* Product Details */}
          {auction.product && (
            <div className="product-details">
              {auction.product.category && (
                <div className="detail-row">
                  <span className="label">Danh mục:</span>
                  <span className="value">{auction.product.category}</span>
                </div>
              )}
              {auction.product.createdAt && (
                <div className="detail-row">
                  <span className="label">Ngày tạo:</span>
                  <span className="value">{formatDateTime(auction.product.createdAt)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auction Details Section */}
        {auction.auctionDetail && (
          <div className="auction-details-section">
            <h2>
              <i className="fas fa-gavel"></i>
              Thông tin chi tiết đấu giá
            </h2>

            {auction.auctionDetail.auctionDescription && (
              <div className="detail-block">
                <h3>
                  <i className="fas fa-align-left"></i>
                  Mô tả phiên đấu giá
                </h3>
                <p>{auction.auctionDetail.auctionDescription}</p>
              </div>
            )}

            {auction.auctionDetail.targetAudience && (
              <div className="detail-block">
                <h3>
                  <i className="fas fa-users"></i>
                  Đối tượng mục tiêu
                </h3>
                <p>{auction.auctionDetail.targetAudience}</p>
              </div>
            )}

            {auction.auctionDetail.additionalTerms && (
              <div className="detail-block important-terms">
                <h3>
                  <i className="fas fa-file-contract"></i>
                  Điều khoản bổ sung
                </h3>
                <p>{auction.auctionDetail.additionalTerms}</p>
              </div>
            )}
          </div>
        )}

        {/* Auction Information Summary */}
        <div className="auction-summary-section">
          <h2>
            <i className="fas fa-list"></i>
            Tóm tắt thông tin
          </h2>
          <div className="summary-grid">
            <div className="summary-item">
              <i className="fas fa-hashtag"></i>
              <div>
                <label>ID đấu giá</label>
                <span>#{auction.id}</span>
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-signal"></i>
              <div>
                <label>Trạng thái</label>
                {getStatusBadge(auction.status)}
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-money-bill-wave"></i>
              <div>
                <label>Giá khởi điểm</label>
                <span>{formatCurrency(auction.product?.initialPrice || 0)}</span>
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-chart-line"></i>
              <div>
                <label>Giá hiện tại</label>
                <span className="highlight">{formatCurrency(auction.currentHighestBidAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bid History Section */}
        <div className="bid-history-section">
          <h2>
            <i className="fas fa-history"></i>
            Lịch sử đấu giá
          </h2>
          {bidHistoryLoading ? (
            <div className="loading-history">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          ) : bidHistory.length === 0 ? (
            <div className="empty-history">
              <i className="fas fa-inbox"></i>
              <p>Chưa có lượt đấu giá nào</p>
            </div>
          ) : (
            <ul className="bid-history-list">
              {bidHistory.map((bid) => (
                <li key={bid.id} className="bid-history-item">
                  <span className="bidder">
                    <i className="fas fa-user"></i> {bid.user?.username || 'Người dùng'}
                  </span>
                  <span className="amount">{formatCurrency(bid.bidAmount)}</span>
                  <span className="time">{formatDateTime(bid.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
