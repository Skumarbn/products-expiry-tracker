// src/App.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faBoxOpen, faUserCircle, faBell, faDashboard, faChartBar, faCog, faSearch, faFilter, faCalendarAlt, faExclamationTriangle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [editing, setEditing] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState('');
  const [notify, setNotify] = useState(true);
  const [emailMsg, setEmailMsg] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setEmailMsg('Notifications enabled! You will be notified before expiry.');
        setTimeout(() => setEmailMsg(''), 3000);
      } else {
        setEmailMsg('Please enable notifications to get expiry alerts.');
        setTimeout(() => setEmailMsg(''), 3000);
      }
    }
  };

  // Send browser notification
  const sendNotification = (productName, daysLeft) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Product Expiring Soon!', {
        body: `${productName} expires in ${daysLeft} days`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `expiry-${productName}`,
        requireInteraction: true
      });
    }
  };

  // Check for expiring products every hour
  useEffect(() => {
    const checkExpiringProducts = () => {
      if (!notify || notificationPermission !== 'granted') return;
      const today = new Date();
      products.forEach(product => {
        const expiry = new Date(product.expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 3) {
          sendNotification(product.productName, daysUntilExpiry);
        }
      });
    };
    checkExpiringProducts();
    const interval = setInterval(checkExpiringProducts, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [products, notify, notificationPermission]);

  // Common items that people typically track for expiry
  const commonItems = [
    'Milk', 'Yogurt', 'Cheese', 'Butter', 'Cream',
    'Bread', 'Cereal', 'Pasta', 'Rice', 'Flour',
    'Eggs', 'Meat', 'Chicken', 'Fish', 'Bacon',
    'Fruits', 'Vegetables', 'Salad', 'Tomatoes', 'Onions',
    'Potatoes', 'Carrots', 'Broccoli', 'Spinach', 'Lettuce',
    'Bananas', 'Apples', 'Oranges', 'Strawberries', 'Grapes',
    'Medication', 'Vitamins', 'Supplements', 'Prescription',
    'Cosmetics', 'Skincare', 'Shampoo', 'Conditioner', 'Soap',
    'Toothpaste', 'Deodorant', 'Perfume', 'Makeup',
    'Batteries', 'Light bulbs', 'Cleaning supplies',
    'Canned food', 'Sauces', 'Condiments', 'Spices',
    'Coffee', 'Tea', 'Juice', 'Soda', 'Beer', 'Wine',
    'Snacks', 'Chips', 'Nuts', 'Crackers', 'Cookies',
    'Frozen food', 'Ice cream', 'Pizza', 'Burger patties',
    'Baby food', 'Formula', 'Diapers', 'Wipes',
    'Pet food', 'Dog food', 'Cat food', 'Bird seed',
    'Plant food', 'Fertilizer', 'Seeds'
  ];

  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setProductName(value);
    
    if (value.trim()) {
      const filtered = commonItems.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProductName(suggestion);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const addProduct = () => {
    if (productName.trim() && expiryDate) {
      const newProduct = {
        id: Date.now(),
        productName: productName.trim(),
        expiryDate,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, newProduct]);
      setProductName('');
      setExpiryDate('');
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'EXPIRED', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'warning', text: `${daysUntilExpiry} DAYS LEFT`, days: daysUntilExpiry };
    } else {
      return { status: 'good', text: 'GOOD', days: daysUntilExpiry };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isFormValid = productName.trim() && expiryDate;

  // Statistics calculations
  const getProductStats = () => {
    const stats = {
      total: products.length,
      expired: 0,
      expiringSoon: 0,
      good: 0
    };
    
    products.forEach(product => {
      const status = getExpiryStatus(product.expiryDate);
      if (status.status === 'expired') stats.expired++;
      else if (status.status === 'warning') stats.expiringSoon++;
      else stats.good++;
    });
    
    return stats;
  };

  // Filter products based on search and status
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterStatus === 'all') return matchesSearch;
      
      const status = getExpiryStatus(product.expiryDate);
      return matchesSearch && status.status === filterStatus;
    });
  };

  // Inline editing logic
  const handleEdit = (id, field, value) => {
    setEditing({ id, field });
    setEditValue(value);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = () => {
    setProducts(products.map(product => {
      if (product.id === editing.id) {
        if (editing.field === 'productName') {
          return { ...product, productName: editValue };
        } else if (editing.field === 'expiryDate') {
          return { ...product, expiryDate: editValue };
        }
      }
      return product;
    }));
    setEditing({ id: null, field: null });
    setEditValue('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditing({ id: null, field: null });
      setEditValue('');
    }
  };

  const handleEditBlur = () => {
    handleEditSave();
  };

  // Notification permission logic
  const handleNotificationPermission = (e) => {
    e.preventDefault();
    if (notificationPermission === 'default') {
      requestNotificationPermission();
    } else if (notificationPermission === 'denied') {
      setEmailMsg('Please enable notifications in your browser settings.');
      setTimeout(() => setEmailMsg(''), 3000);
    } else {
      setEmailMsg('Notifications are already enabled!');
      setTimeout(() => setEmailMsg(''), 3000);
    }
  };

  const stats = getProductStats();
  const filteredProducts = getFilteredProducts();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <FontAwesomeIcon icon={faBoxOpen} />
            <span>FreshTrack Pro</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <FontAwesomeIcon icon={faDashboard} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => setActiveView('products')}
          >
            <FontAwesomeIcon icon={faBoxOpen} />
            <span>Products</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <FontAwesomeIcon icon={faChartBar} />
            <span>Analytics</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <FontAwesomeIcon icon={faUserCircle} />
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <span className="user-role">Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div className="page-title">
            <h1>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
            <p>Manage your product inventory efficiently</p>
          </div>
          <div className="topbar-actions">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="notification-badge">
              <FontAwesomeIcon icon={faBell} />
              {(stats.expired + stats.expiringSoon) > 0 && (
                <span className="badge">{stats.expired + stats.expiringSoon}</span>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total Products</p>
              </div>
            </div>
            
            <div className="stat-card good">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="stat-content">
                <h3>{stats.good}</h3>
                <p>Fresh Products</p>
              </div>
            </div>
            
            <div className="stat-card warning">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="stat-content">
                <h3>{stats.expiringSoon}</h3>
                <p>Expiring Soon</p>
              </div>
            </div>
            
            <div className="stat-card expired">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faTimesCircle} />
              </div>
              <div className="stat-content">
                <h3>{stats.expired}</h3>
                <p>Expired Items</p>
              </div>
            </div>
          </div>

          {/* Quick Add Form */}
          <div className="quick-add-section">
            <div className="section-header">
              <h2><FontAwesomeIcon icon={faPlus} /> Quick Add Product</h2>
            </div>
            <form className="quick-add-form" onSubmit={e => { e.preventDefault(); addProduct(); }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="productName">Product Name</label>
                  <input
                    type="text"
                    id="productName"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={handleProductNameChange}
                    onBlur={handleInputBlur}
                    onKeyPress={(e) => e.key === 'Enter' && isFormValid && addProduct()}
                  />
                  {showSuggestions && (
                    <div className="suggestions-dropdown">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && isFormValid && addProduct()}
                  />
                </div>
                <button 
                  className="add-button-modern" 
                  type="submit"
                  disabled={!isFormValid}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Product
                </button>
              </div>
            </form>
          </div>

          {/* Products Section */}
          <div className="products-section">
            <div className="section-header">
              <h2><FontAwesomeIcon icon={faBoxOpen} /> Your Products</h2>
              <div className="section-filters">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="good">Fresh</option>
                  <option value="warning">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-state-modern">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <h3>No products found</h3>
                <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Start by adding your first product using the form above'}</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => {
                  const expiryStatus = getExpiryStatus(product.expiryDate);
                  return (
                    <div key={product.id} className={`product-card ${expiryStatus.status}`}>
                      <div className="product-header">
                        <div className="product-name"
                          onDoubleClick={() => handleEdit(product.id, 'productName', product.productName)}
                        >
                          {editing.id === product.id && editing.field === 'productName' ? (
                            <input
                              type="text"
                              value={editValue}
                              autoFocus
                              onChange={handleEditChange}
                              onBlur={handleEditBlur}
                              onKeyDown={handleEditKeyDown}
                              className="edit-input"
                            />
                          ) : (
                            <h3>{product.productName}</h3>
                          )}
                        </div>
                        <button 
                          className="delete-button-card"
                          onClick={() => removeProduct(product.id)}
                          title="Remove product"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                      
                      <div className="product-info">
                        <div className="expiry-info">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span
                            onDoubleClick={() => handleEdit(product.id, 'expiryDate', product.expiryDate)}
                          >
                            {editing.id === product.id && editing.field === 'expiryDate' ? (
                              <input
                                type="date"
                                value={editValue}
                                autoFocus
                                onChange={handleEditChange}
                                onBlur={handleEditBlur}
                                onKeyDown={handleEditKeyDown}
                                className="edit-input"
                              />
                            ) : (
                              formatDate(product.expiryDate)
                            )}
                          </span>
                        </div>
                        
                        <div className={`status-badge ${expiryStatus.status}`}>
                          <FontAwesomeIcon icon={
                            expiryStatus.status === 'expired' ? faTimesCircle :
                            expiryStatus.status === 'warning' ? faExclamationTriangle : faCheckCircle
                          } />
                          {expiryStatus.text}
                        </div>
                      </div>
                      
                      <div className="days-info">
                        {expiryStatus.status === 'expired' ? 
                          `Expired ${expiryStatus.days} days ago` :
                          expiryStatus.status === 'warning' ?
                          `${expiryStatus.days} days remaining` :
                          `Fresh for ${expiryStatus.days} more days`
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Section */}
          {activeView === 'settings' && (
            <div className="settings-section">
              <div className="settings-card">
                <div className="section-header">
                  <h2><FontAwesomeIcon icon={faBell} /> Notification Settings</h2>
                </div>
                <form className="settings-form" onSubmit={handleNotificationPermission}>
                  <div className="notification-status">
                    <span className={`status-indicator ${notificationPermission}`}>
                      {notificationPermission === 'granted' ? '✓ Enabled' : 
                       notificationPermission === 'denied' ? '✗ Blocked' : 'Notifications not enabled'}
                    </span>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notify}
                      onChange={e => setNotify(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    Get notified before products expire
                  </label>
                  <button className="settings-btn" type="submit">
                    {notificationPermission === 'default' ? 'Enable Notifications' : 
                     notificationPermission === 'denied' ? 'Enable in Settings' : 'Notifications Active'}
                  </button>
                  {emailMsg && <div className="settings-msg">{emailMsg}</div>}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
