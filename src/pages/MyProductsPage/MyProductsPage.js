import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoles } from "../../services/authService";
import productService from "../../services/productService";
import apiClient from "../../config/api";
import "./MyProductsPage.scss";

/**
 * My Products Page Component
 * Allows SELLER to manage their products
 */
const MyProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roles, setRoles] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRoleChecked, setIsRoleChecked] = useState(false);

  // Product Form Data
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    initialPrice: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [creating, setCreating] = useState(false);

  // Roles Fetching
  useEffect(() => {
    const fetchUserRoles = async () => {
    
      
      if (localStorage.getItem('token')) {
        console.log('   - "token" preview:', localStorage.getItem('token').substring(0, 30) + '...');
      }
      if (localStorage.getItem('authToken')) {
        console.log('   - "authToken" preview:', localStorage.getItem('authToken').substring(0, 30) + '...');
      }
      
      // Check if user is authenticated by token existence (since user might be null)
      const hasToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (hasToken) {
        try {

          const response = await getRoles();

          // API returns array directly in response.data: ["USER", "SELLER"]
          setRoles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {

          setRoles([]);
        }
      } else {
        console.log('⚠️ No authentication token found');
        setRoles([]);
      }
      setIsRoleChecked(true);
    };

    fetchUserRoles();
  }, [user]);
  // Fetch products
  useEffect(() => {
    console.log("🔍 useEffect triggered - isRoleChecked:", isRoleChecked, "roles:", roles);
    // 1. Chỉ chạy khi đã kiểm tra xong Role
    if (isRoleChecked) {
      const userIsSeller = roles.includes("SELLER") || roles.includes("ADMIN");
      

      if (userIsSeller) {
        fetchMyProducts();
      } else {
        console.log("⚠️ User is not seller/admin, skipping fetch");
        setLoading(false);
      }
    }
  }, [isRoleChecked, roles]);

  const fetchMyProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await productService.getMyProducts();

      // Ensure products is always an array
      setProducts(Array.isArray(response) ? response : []); 
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is SELLER
  if (
    roles.length > 0 &&
    !roles.includes("SELLER") &&
    !roles.includes("ADMIN")
  ) {
    return (
      <div className="my-products-page">
        <div className="access-denied">
          <i className="fas fa-ban"></i>
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn cần có quyền SELLER để quản lý sản phẩm.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
          >
            <i className="fas fa-user"></i>
            Đi tới trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = productData.imageUrl;

      // Upload image if file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await apiClient.post(
          "/api/products/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = uploadResponse.data.imageUrl || uploadResponse.data;
      }

      // Create product
      const payload = {
        name: productData.name,
        description: productData.description,
        initialPrice: parseFloat(productData.initialPrice),
        imageUrl: imageUrl,
      };

      await productService.createProduct(payload);

      setSuccess("Tạo sản phẩm thành công!");

      // Reset form
      setProductData({
        name: "",
        description: "",
        initialPrice: "",
        imageUrl: "",
      });
      setImageFile(null);
      setImagePreview("");

      // Refresh products list
      fetchMyProducts();

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tạo sản phẩm. Vui lòng thử lại."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      setSuccess("Xóa sản phẩm thành công!");
      fetchMyProducts();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleCreateAuction = (productId) => {
    navigate("/create-auction", { state: { productId } });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="my-products-page">
      <div className="products-container">
        {/* Page Header */}
        <div className="page-header">
          <h1>
            <i className="fas fa-box"></i>
            Sản Phẩm Của Tôi
          </h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Tạo Sản Phẩm Mới
          </button>
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

        {/* Loading State */}
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <h3>Chưa có sản phẩm nào</h3>
                <p>Tạo sản phẩm đầu tiên của bạn để bắt đầu đấu giá</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  Tạo Sản Phẩm Mới
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="card-image">
                      <img
                        src={
                          product.imageUrl ||
                          "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        alt={product.name}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="card-content">
                      <h3 className="product-name">{product.name}</h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="product-info">
                        <div className="price-tag">
                          <label>Giá khởi điểm:</label>
                          <span className="price">
                            {formatCurrency(product.initialPrice)}
                          </span>
                        </div>
                        <div className="created-date">
                          <i className="fas fa-calendar"></i>
                          {formatDate(product.createdAt)}
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleCreateAuction(product.id)}
                        >
                          <i className="fas fa-gavel"></i>
                          Tạo đấu giá
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-plus-circle"></i>
                Tạo Sản Phẩm Mới
              </h2>
              <button
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-tag"></i>
                  Tên sản phẩm <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i>
                  Mô tả sản phẩm <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="initialPrice">
                  <i className="fas fa-dollar-sign"></i>
                  Giá khởi điểm <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="initialPrice"
                  name="initialPrice"
                  value={productData.initialPrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-image"></i>
                  Hình ảnh sản phẩm
                  <span className="hint">(Dưới 5MB)</span>
                </label>

                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="modal-image-upload"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="modal-image-upload" className="upload-button">
                    <i className="fas fa-cloud-upload-alt"></i>
                    {imagePreview ? "Thay đổi ảnh" : "Tải ảnh lên"}
                  </label>
                </div>

                {imagePreview && (
                  <div className="image-preview-single">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Tạo sản phẩm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;
