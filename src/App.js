// src/App.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faBoxOpen, faUserCircle, faBell } from '@fortawesome/free-solid-svg-icons';
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

  return (
    <>
      <div className="appbar">
        <div className="appbar-title">
          <FontAwesomeIcon icon={faBoxOpen} size="lg" />
          FreshTrack Pro
        </div>
        <div className="appbar-profile">
          <FontAwesomeIcon icon={faUserCircle} size="lg" />
        </div>
      </div>
      <div className="App">
        <div className="card">
          <div className="card-title"><FontAwesomeIcon icon={faPlus} /> Track Something New</div>
          <form className="add-product add-product-row" onSubmit={e => { e.preventDefault(); addProduct(); }}>
            <div className="form-group add-product-group">
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
            <div className="form-group add-product-group">
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
              className="add-button" 
              type="submit"
              disabled={!isFormValid}
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
              Track
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title"><FontAwesomeIcon icon={faBoxOpen} /> Products List</div>
          <div className="content-panel">
            {products.length === 0 ? (
              <div className="empty-state">
                <h3>No products added yet</h3>
                <p>Start by adding your first product using the form above.</p>
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const expiryStatus = getExpiryStatus(product.expiryDate);
                    return (
                      <tr key={product.id}>
                        <td
                          onDoubleClick={() => handleEdit(product.id, 'productName', product.productName)}
                          style={{ cursor: 'pointer' }}
                        >
                          {editing.id === product.id && editing.field === 'productName' ? (
                            <input
                              type="text"
                              value={editValue}
                              autoFocus
                              onChange={handleEditChange}
                              onBlur={handleEditBlur}
                              onKeyDown={handleEditKeyDown}
                              style={{ minWidth: 80 }}
                            />
                          ) : (
                            product.productName
                          )}
                        </td>
                        <td
                          onDoubleClick={() => handleEdit(product.id, 'expiryDate', product.expiryDate)}
                          style={{ cursor: 'pointer' }}
                        >
                          {editing.id === product.id && editing.field === 'expiryDate' ? (
                            <input
                              type="date"
                              value={editValue}
                              autoFocus
                              onChange={handleEditChange}
                              onBlur={handleEditBlur}
                              onKeyDown={handleEditKeyDown}
                              style={{ minWidth: 120 }}
                            />
                          ) : (
                            formatDate(product.expiryDate)
                          )}
                        </td>
                        <td>
                          <span className={`expiry-status ${expiryStatus.status}`}>
                            {expiryStatus.text}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="delete-button"
                            onClick={() => removeProduct(product.id)}
                            title="Remove product"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title"><FontAwesomeIcon icon={faBell} /> Browser Notifications</div>
          <form className="email-form" onSubmit={handleNotificationPermission}>
            <div className="notification-status">
              <span className={`status-indicator ${notificationPermission}`}>
                {notificationPermission === 'granted' ? '✓ Enabled' : 
                 notificationPermission === 'denied' ? '✗ Blocked' : 'Notifications not enabled. Click below to enable.'}
              </span>
            </div>
            <label className="notify-label">
              <input
                type="checkbox"
                checked={notify}
                onChange={e => setNotify(e.target.checked)}
              /> Get notified before products expire
            </label>
            <button className="email-save-btn" type="submit">
              {notificationPermission === 'default' ? 'Enable Notifications' : 
               notificationPermission === 'denied' ? 'Enable in Settings' : 'Notifications Active'}
            </button>
            {emailMsg && <div className="email-msg">{emailMsg}</div>}
          </form>
        </div>

        <div className="footer">
          &copy; {new Date().getFullYear()} FreshTrack Pro &mdash; Product Expiry SaaS | Powered by React | 
          <button type="button" className="footer-link" style={{color:'#2563eb',textDecoration:'none',background:'none',border:'none',padding:0,cursor:'pointer'}} onClick={() => window.open('mailto:support@freshtrackpro.com')}>Contact Support</button>
        </div>
      </div>
    </>
  );
}

export default App;
