import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import auctionService from '../../services/auctionService';
import './AuctionsPage.scss';

/**
 * Auctions Page Component
 * Display all auctions with filtering, sorting, and pagination
 */
const AuctionsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'NEWEST');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    // { value: 'ALL', label: 'Tất cả', icon: 'fa-th' },
    // { value: 'ELECTRONICS', label: 'Điện tử', icon: 'fa-laptop' },
    // { value: 'FASHION', label: 'Thời trang', icon: 'fa-tshirt' },
    // { value: 'HOME', label: 'Đồ gia dụng', icon: 'fa-home' },
    // { value: 'SPORTS', label: 'Thể thao', icon: 'fa-futbol' },
    // { value: 'BOOKS', label: 'Sách', icon: 'fa-book' },
    // { value: 'TOYS', label: 'Đồ chơi', icon: 'fa-gamepad' },
    // { value: 'AUTOMOTIVE', label: 'Ô tô - Xe máy', icon: 'fa-car' },
    // { value: 'ART', label: 'Nghệ thuật', icon: 'fa-palette' },
    // { value: 'COLLECTIBLES', label: 'Sưu tầm', icon: 'fa-gem' },
    // { value: 'OTHER', label: 'Khác', icon: 'fa-ellipsis-h' },
  ];

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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
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
      <div className="auctions-container">
        {/* Page Header */}
        <div className="page-header">
          <h1>
            <i className="fas fa-gavel"></i>
            Phiên Đấu Giá
          </h1>
          <p>Khám phá và tham gia các phiên đấu giá hấp dẫn</p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <button type="submit" className="btn-search">
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <div className="category-grid">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`category-item ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.value)}
              >
                <i className={`fas ${category.icon}`}></i>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="controls-section">
          <div className="controls-left">
            <div className="filter-group">
              <label htmlFor="status-filter">
                <i className="fas fa-filter"></i>
                Trạng thái:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="controls-right">
            <div className="filter-group">
              <label htmlFor="sort-select">
                <i className="fas fa-sort"></i>
                Sắp xếp:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>
            Hiển thị <strong>{auctions.length}</strong> kết quả
            {selectedCategory !== 'ALL' && ` trong danh mục "${categories.find(c => c.value === selectedCategory)?.label}"`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Auctions Grid */}
            {auctions.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <h3>Không tìm thấy phiên đấu giá</h3>
                <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  <i className="fas fa-redo"></i>
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="auctions-grid">
                {auctions.map((auction) => {
                  const status = getStatusBadge(auction.status);
                
                  const currentPrice = auction.currentPrice || auction.startingPrice;

                  return (
                    <div
                      key={auction.id}
                      className="auction-card"
                      onClick={() => handleViewDetails(auction.id)}
                    >
                      <div className="card-image">
                        <img
                          src={auction.images?.[0] || 'https://www.shutterstock.com/image-vector/img-vector-icon-design-on-260nw-2164648583.jpg'}
                          alt={auction.productName || 'Product'}
                          onError={(e) => {
                            e.target.src = 'https://www.shutterstock.com/image-vector/img-vector-icon-design-on-260nw-2164648583.jpg';
                          }}
                        />
                        <div className={`status-badge ${status.class}`}>
                          <i className={`fas ${status.icon}`}></i>
                          {status.label}
                        </div>
                        {auction.bidCount > 0 && (
                          <div className="bid-count">
                            <i className="fas fa-gavel"></i>
                            {auction.bidCount} lượt đấu giá
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h3 className="product-name">{auction.productName || 'Unnamed Product'}</h3>
                        
                      

                        <div className="price-section">
                          <div className="current-price">
                            <label>Giá hiện tại:</label>
                            <span className="price">{formatCurrency(currentPrice)}</span>
                          </div>
                          {auction.buyNowPrice && (
                            <div className="buy-now-price">
                              <label>Mua ngay:</label>
                              <span className="price">{formatCurrency(auction.buyNowPrice)}</span>
                            </div>
                          )}
                        </div>

                        <div className="card-footer">
                          {auction.status === 'ACTIVE' && (
                            <div className="time-remaining">
                              <i className="fas fa-clock"></i>
                              <span>{getTimeRemaining(auction.endTime)}</span>
                            </div>
                          )}
                          {auction.status === 'PENDING' && (
                            <div className="time-remaining">
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
                          <i className="fas fa-eye"></i>
                          Xem chi tiết
                        </button>
                      </div>
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
