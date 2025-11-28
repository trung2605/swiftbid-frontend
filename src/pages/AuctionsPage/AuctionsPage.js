import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import auctionService from '../../services/auctionService';
import './AuctionsPage.scss';

/**
 * Auctions Page Component with Enhanced Animations
 * Display all auctions with filtering, sorting, pagination and scroll animations
 */
const AuctionsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCards, setVisibleCards] = useState(new Set());
  
  // Refs for intersection observer
  const cardRefs = useRef([]);
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const controlsRef = useRef(null);
  
  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'NEWEST');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const sortOptions = [
    { value: 'NEWEST', label: 'Mới nhất' },
    { value: 'ENDING_SOON', label: 'Sắp kết thúc' },
    { value: 'PRICE_LOW', label: 'Giá thấp đến cao' },
    { value: 'PRICE_HIGH', label: 'Giá cao đến thấp' },
    { value: 'MOST_BIDS', label: 'Nhiều lượt đấu giá' },
  ];

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ bắt đầu' },
    { value: 'ACTIVE', label: 'Đang diễn ra' },
    { value: 'COMPLETED', label: 'Đã kết thúc' },
  ];

  useEffect(() => {
    fetchAuctions();
    // Update URL params
    const params = new URLSearchParams();
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (sortBy !== 'NEWEST') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage !== 1) params.set('page', currentPage);
    setSearchParams(params);
  }, [selectedCategory, selectedStatus, sortBy, currentPage, searchQuery]);

  // Intersection Observer for card animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index;
          setVisibleCards(prev => new Set([...prev, index]));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    // Observe header, search, controls
    if (headerRef.current) observer.observe(headerRef.current);
    if (searchRef.current) observer.observe(searchRef.current);
    if (controlsRef.current) observer.observe(controlsRef.current);

    return () => {
      cardRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (searchRef.current) observer.unobserve(searchRef.current);
      if (controlsRef.current) observer.unobserve(controlsRef.current);
    };
  }, [auctions]);

  const fetchAuctions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await auctionService.getAllAuctions();
      let filteredAuctions = response || [];

      // Filter by category
      if (selectedCategory !== 'ALL') {
        filteredAuctions = filteredAuctions.filter(
          auction => auction.product?.category === selectedCategory
        );
      }

      // Filter by status
      if (selectedStatus !== 'ALL') {
        filteredAuctions = filteredAuctions.filter(
          auction => auction.status === selectedStatus
        );
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredAuctions = filteredAuctions.filter(
          auction =>
            auction.product?.name?.toLowerCase().includes(query) ||
            auction.product?.description?.toLowerCase().includes(query)
        );
      }

      // Sort auctions
      filteredAuctions = sortAuctions(filteredAuctions, sortBy);

      // Pagination
      const totalItems = filteredAuctions.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedAuctions = filteredAuctions.slice(startIndex, endIndex);

      setAuctions(paginatedAuctions);
    } catch (err) {
      console.error('Failed to fetch auctions:', err);
      setError('Không thể tải danh sách đấu giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const sortAuctions = (auctions, sortType) => {
    const sorted = [...auctions];
    switch (sortType) {
      case 'NEWEST':
        return sorted.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      case 'ENDING_SOON':
        return sorted.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
      case 'PRICE_LOW':
        return sorted.sort((a, b) => (a.currentPrice || a.startingPrice) - (b.currentPrice || b.startingPrice));
      case 'PRICE_HIGH':
        return sorted.sort((a, b) => (b.currentPrice || b.startingPrice) - (a.currentPrice || a.startingPrice));
      case 'MOST_BIDS':
        return sorted.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
      default:
        return sorted;
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuctions();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Đã kết thúc';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'pending', label: 'Chờ bắt đầu', icon: 'fa-clock' },
      ACTIVE: { class: 'active', label: 'Đang diễn ra', icon: 'fa-fire' },
      COMPLETED: { class: 'completed', label: 'Đã kết thúc', icon: 'fa-check' },
      CANCELLED: { class: 'cancelled', label: 'Đã hủy', icon: 'fa-times' },
    };
    return badges[status] || badges.PENDING;
  };

  return (
    <div className="auctions-page">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="auctions-container">
        {/* Page Header */}
        <div ref={headerRef} className="page-header animate-on-scroll">
          <div className="header-content">
            <h1>
              <i className="fas fa-gavel"></i>
              <span className="gradient-text">Phiên Đấu Giá</span>
            </h1>
            <p className="subtitle">Khám phá và tham gia các phiên đấu giá hấp dẫn</p>
            <div className="header-stats">
              <div className="stat-item">
                <i className="fas fa-fire"></i>
                <span>{auctions.length} phiên đang diễn ra</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-users"></i>
                <span>50,000+ người tham gia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="search-section animate-on-scroll">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm đấu giá..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button type="submit" className="btn-search btn-gradient">
              <i className="fas fa-search"></i>
              <span>Tìm kiếm</span>
            </button>
          </form>
        </div>

        {/* Filters and Sort */}
        <div ref={controlsRef} className="controls-section animate-on-scroll">
          <div className="controls-wrapper">
            <div className="filter-group">
              <label htmlFor="status-filter">
                <i className="fas fa-filter"></i>
                Trạng thái
              </label>
              <div className="select-wrapper">
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="select-enhanced"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-select">
                <i className="fas fa-sort"></i>
                Sắp xếp
              </label>
              <div className="select-wrapper">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="select-enhanced"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>

            {(selectedStatus !== 'ALL' || searchQuery) && (
              <button
                className="btn-reset"
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <i className="fas fa-redo"></i>
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error animate-shake">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Đang tải dữ liệu phiên đấu giá...</p>
          </div>
        ) : (
          <>
            {/* Auctions Grid */}
            {auctions.length === 0 ? (
              <div className="empty-state animate-fade-in">
                <div className="empty-icon">
                  <i className="fas fa-inbox"></i>
                </div>
                <h3>Không tìm thấy phiên đấu giá</h3>
                <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                <button 
                  className="btn btn-primary btn-gradient"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  <i className="fas fa-redo"></i>
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>
            ) : (
              <div className="auctions-grid">
                {auctions.map((auction, index) => {
                  const status = getStatusBadge(auction.status);
                  const currentPrice = auction.currentPrice || auction.startingPrice;
                  const isVisible = visibleCards.has(index.toString());

                  return (
                    <div
                      key={auction.id}
                      ref={el => cardRefs.current[index] = el}
                      data-index={index}
                      className={`auction-card ${isVisible ? 'visible' : ''}`}
                      onClick={() => handleViewDetails(auction.id)}
                      style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                    >
                      <div className="card-image-wrapper">
                        <img
                          src={auction.bannerImageUrl || 'https://www.shutterstock.com/image-vector/img-vector-icon-design-on-260nw-2164648583.jpg'}
                          alt={auction.productName || 'Product'}
                          onError={(e) => {
                            e.target.src = 'https://www.shutterstock.com/image-vector/img-vector-icon-design-on-260nw-2164648583.jpg';
                          }}
                          className="card-image"
                        />
                        <div className="image-overlay"></div>
                        <div className={`status-badge ${status.class}`}>
                          <i className={`fas ${status.icon}`}></i>
                          <span>{status.label}</span>
                        </div>
                        {auction.bidCount > 0 && (
                          <div className="bid-count-badge">
                            <i className="fas fa-gavel"></i>
                            <span>{auction.bidCount}</span>
                          </div>
                        )}
                        {auction.status === 'ACTIVE' && (
                          <div className="hot-badge">
                            <i className="fas fa-fire"></i>
                            <span>HOT</span>
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h3 className="product-name">{auction.productName || 'Unnamed Product'}</h3>

                        <div className="price-section">
                          <div className="current-price">
                            <label>Giá hiện tại</label>
                            <span className="price">{formatCurrency(currentPrice)}</span>
                          </div>
                          {auction.buyNowPrice && (
                            <div className="buy-now-price">
                              <label>Mua ngay</label>
                              <span className="price">{formatCurrency(auction.buyNowPrice)}</span>
                            </div>
                          )}
                        </div>

                        <div className="card-footer">
                          {auction.status === 'ACTIVE' && (
                            <div className="time-remaining active">
                              <i className="fas fa-clock"></i>
                              <span>{getTimeRemaining(auction.endTime)}</span>
                            </div>
                          )}
                          {auction.status === 'PENDING' && (
                            <div className="time-remaining pending">
                              <i className="fas fa-calendar"></i>
                              <span>Bắt đầu: {formatDate(auction.startTime)}</span>
                            </div>
                          )}
                          {auction.status === 'COMPLETED' && (
                            <div className="time-remaining completed">
                              <i className="fas fa-flag-checkered"></i>
                              <span>Kết thúc: {formatDate(auction.endTime)}</span>
                            </div>
                          )}
                        </div>

                        <button className="btn-view-details">
                          <span>Xem chi tiết</span>
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>

                      <div className="card-shine"></div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                  Trước
                </button>

                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionsPage;
