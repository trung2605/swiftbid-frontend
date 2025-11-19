import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRoles } from '../../services/authService';
import auctionService from '../../services/auctionService';
import productService from '../../services/productService';
import './CreateAuctionPage.scss';

/**
 * Create Auction Page Component
 * Allows SELLER role users to create auctions for their existing products
 */
const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
    const [isRoleChecked, setIsRoleChecked] = useState(false);

  // Auction Data - Aligned with backend Auction model
  const [auctionData, setAuctionData] = useState({
    startTime: '',
    endTime: '',
    currentHighestBidAmount: '',
  });

  // Auction Detail Data - Aligned with backend AuctionDetail model
  const [auctionDetailData, setAuctionDetailData] = useState({
    auctionDescription: '',
    targetAudience: '',
    additionalTerms: '',
    bannerImageUrl: '',
  });

  // Roles Fetching
  useEffect(() => {
    const fetchUserRoles = async () => {
      const hasToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (hasToken) {
        try {
          const response = await getRoles();
          setRoles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Failed to fetch user roles:', error);
          setRoles([]);
        }
      } else {
        setRoles([]);
      }
      setIsRoleChecked(true);
    };

    fetchUserRoles();
  }, [user]);

  // Fetch products when roles are checked
  useEffect(() => {
    if (isRoleChecked) {
      const userIsSeller = roles.includes("SELLER") || roles.includes("ADMIN");

      if (userIsSeller) {
        fetchMyProducts();
      } else {
        setLoading(false);
      }
    }
  }, [isRoleChecked, roles]);

  const fetchMyProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await productService.getMyProducts();
      setProducts(Array.isArray(response) ? response : []); 
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Auto-select product if passed via navigation state
  useEffect(() => {
    if (location.state?.productId && products.length > 0) {
      const product = products.find(p => p.id === location.state.productId);
      if (product) {
        setSelectedProduct(product);
        // Set initial bid amount from product's initialPrice
        setAuctionData(prev => ({
          ...prev,
          currentHighestBidAmount: product.initialPrice || '',
        }));
      }
    }
  }, [location.state, products]);


  // Check if user is SELLER
  if (roles.length > 0 && !roles.includes('SELLER') && !roles.includes('ADMIN')) {
    return (
      <div className="create-auction-page">
        <div className="access-denied">
          <i className="fas fa-ban"></i>
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn cần có quyền SELLER để tạo phiên đấu giá.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/profile')}
          >
            <i className="fas fa-user"></i>
            Đi tới trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    
    if (product) {
      // Set initial bid amount from product's initialPrice
      setAuctionData(prev => ({
        ...prev,
        currentHighestBidAmount: product.initialPrice || '',
      }));
    }
  };

  const handleAuctionChange = (e) => {
    const { name, value } = e.target;
    setAuctionData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setAuctionDetailData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate product selection
      if (!selectedProduct) {
        setError('Vui lòng chọn sản phẩm để đấu giá');
        setLoading(false);
        return;
      }

      // Validate dates
      const startTime = new Date(auctionData.startTime);
      const endTime = new Date(auctionData.endTime);
      
      if (endTime <= startTime) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu');
        setLoading(false);
        return;
      }

      // Create auction payload aligned with backend
      const auctionPayload = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        currentHighestBidAmount: parseFloat(auctionData.currentHighestBidAmount),
        status: 'PENDING',
        auctionDetail: {
          auctionDescription: auctionDetailData.auctionDescription || null,
          targetAudience: auctionDetailData.targetAudience || null,
          additionalTerms: auctionDetailData.additionalTerms || null,
          bannerImageUrl: auctionDetailData.bannerImageUrl || null,
        }
      };

      // Call API to create auction with productId
      await auctionService.createAuction(auctionPayload, selectedProduct.id);

      setSuccess('Tạo phiên đấu giá thành công!');
      
      // Redirect to auctions page after 2 seconds
      setTimeout(() => {
        navigate('/auctions');
      }, 2000);

    } catch (err) {
      console.error('Failed to create auction:', err);
      setError(
        err.response?.data?.message ||
        'Không thể tạo phiên đấu giá. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="create-auction-page">
      <div className="create-auction-container">
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <h1>
            <i className="fas fa-gavel"></i>
            Tạo Phiên Đấu Giá Mới
          </h1>
          <p>Chọn sản phẩm và thiết lập phiên đấu giá</p>
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

        {/* No Products State */}
        {products.length === 0 && !loading && (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>Bạn chưa có sản phẩm nào</h3>
            <p>Tạo sản phẩm trước khi bắt đầu đấu giá</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/my-products')}
            >
              <i className="fas fa-plus"></i>
              Tạo Sản Phẩm
            </button>
          </div>
        )}

        {/* Auction Form */}
        {products.length > 0 && (
          <form onSubmit={handleSubmit} className="auction-form">
            {/* Product Selection Section */}
            <div className="form-section">
              <h2>
                <i className="fas fa-box"></i>
                Chọn Sản Phẩm
              </h2>

              <div className="form-group">
                <label htmlFor="product">
                  <i className="fas fa-cube"></i>
                  Sản phẩm <span className="required">*</span>
                </label>
                <select
                  id="product"
                  value={selectedProduct?.id || ''}
                  onChange={handleProductSelect}
                  required
                >
                  <option value="">-- Chọn sản phẩm để đấu giá --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.initialPrice)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Preview */}
              {selectedProduct && (
                <div className="product-preview">
                  <div className="preview-image">
                    <img
                      src={selectedProduct.imageUrl || 'https://via.placeholder.com/200x150?text=No+Image'}
                      alt={selectedProduct.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="preview-info">
                    <h3>{selectedProduct.name}</h3>
                    <p>{selectedProduct.description}</p>
                    <div className="price-tag">
                      <label>Giá khởi điểm:</label>
                      <span>{formatCurrency(selectedProduct.initialPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auction Settings Section */}
            {selectedProduct && (
              <>
                <div className="form-section">
                  <h2>
                    <i className="fas fa-cog"></i>
                    Thiết Lập Đấu Giá
                  </h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="currentHighestBidAmount">
                        <i className="fas fa-dollar-sign"></i>
                        Giá khởi điểm <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="currentHighestBidAmount"
                        name="currentHighestBidAmount"
                        value={auctionData.currentHighestBidAmount}
                        onChange={handleAuctionChange}
                        placeholder="0"
                        min="0"
                        step="1000"
                        required
                      />
                      <small className="form-hint">
                        Mặc định từ giá sản phẩm
                      </small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="startTime">
                        <i className="fas fa-calendar-alt"></i>
                        Thời gian bắt đầu <span className="required">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        name="startTime"
                        value={auctionData.startTime}
                        onChange={handleAuctionChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="endTime">
                        <i className="fas fa-calendar-check"></i>
                        Thời gian kết thúc <span className="required">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="endTime"
                        name="endTime"
                        value={auctionData.endTime}
                        onChange={handleAuctionChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Auction Details Section */}
                <div className="form-section">
                  <h2>
                    <i className="fas fa-info-circle"></i>
                    Thông Tin Chi Tiết (Tùy chọn)
                  </h2>

                  <div className="form-group">
                    <label htmlFor="auctionDescription">
                      <i className="fas fa-align-left"></i>
                      Mô tả phiên đấu giá
                    </label>
                    <textarea
                      id="auctionDescription"
                      name="auctionDescription"
                      rows="4"
                      value={auctionDetailData.auctionDescription}
                      onChange={handleDetailChange}
                      placeholder="Mô tả chi tiết về phiên đấu giá, điều khoản đặc biệt..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="targetAudience">
                      <i className="fas fa-users"></i>
                      Đối tượng mục tiêu
                    </label>
                    <input
                      type="text"
                      id="targetAudience"
                      name="targetAudience"
                      value={auctionDetailData.targetAudience}
                      onChange={handleDetailChange}
                      placeholder="Ví dụ: Nhà sưu tầm, Doanh nghiệp..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="additionalTerms">
                      <i className="fas fa-file-contract"></i>
                      Điều khoản bổ sung
                    </label>
                    <textarea
                      id="additionalTerms"
                      name="additionalTerms"
                      rows="3"
                      value={auctionDetailData.additionalTerms}
                      onChange={handleDetailChange}
                      placeholder="Các điều khoản và điều kiện bổ sung..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bannerImageUrl">
                      <i className="fas fa-image"></i>
                      URL ảnh banner
                    </label>
                    <input
                      type="url"
                      id="bannerImageUrl"
                      name="bannerImageUrl"
                      value={auctionDetailData.bannerImageUrl}
                      onChange={handleDetailChange}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Tạo đấu giá
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAuctionPage;
