// src/App.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faBoxOpen, faUserCircle, faBell, faDashboard, faChartBar, faCog, faSearch, faCalendarAlt, faExclamationTriangle, faCheckCircle, faTimesCircle, faTrash, faDownload, faUpload, faSquare, faCheckSquare, faSync, faShoppingCart, faExternalLinkAlt, faShoppingBasket, faListUl, faCheck, faLightbulb, faClipboardList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import './App.css';

// Local Storage constants and helpers
const STORAGE_KEY = 'products-expiry-tracker';
const STORAGE_VERSION = '1.0';

const saveToLocalStorage = (data) => {
  try {
    const storageData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data: data
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsedData = JSON.parse(stored);
    
    // Version compatibility check
    if (!parsedData.version || parsedData.version !== STORAGE_VERSION) {
      console.warn('localStorage data version mismatch, using defaults');
      return null;
    }
    
    return parsedData.data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

function GroceryProApp() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [groceryList, setGroceryList] = useState([]);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [editingGroceryItem, setEditingGroceryItem] = useState(null);
  const [editingGroceryValue, setEditingGroceryValue] = useState('');
  // Removed theme functionality - app now uses only dark mode

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData && savedData.products) {
      setProducts(savedData.products);
      // Load other saved preferences if they exist
      if (savedData.notify !== undefined) setNotify(savedData.notify);
      if (savedData.activeView) setActiveView(savedData.activeView);
      if (savedData.groceryList) setGroceryList(savedData.groceryList);
      // Theme functionality removed
    }
  }, []);

  // Save data to localStorage whenever products or key preferences change
  useEffect(() => {
    // Don't save on initial load
    if (products.length === 0 && notify === true && activeView === 'dashboard') {
      return;
    }
    
    setSaveStatus('saving');
    const dataToSave = {
      products,
      notify,
      activeView,
      groceryList
    };
    
    const success = saveToLocalStorage(dataToSave);
    setSaveStatus(success ? 'saved' : 'error');
    
    // Reset save status after a short delay
    if (success) {
      setTimeout(() => setSaveStatus('saved'), 1000);
    }
  }, [products, notify, activeView, groceryList]);

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
        expiryDate: expiryDate.toISOString().split('T')[0],
        addedDate: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, newProduct]);
      setProductName('');
      setExpiryDate(null);
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
          const dateValue = editValue instanceof Date ? editValue.toISOString().split('T')[0] : editValue;
          return { ...product, expiryDate: dateValue };
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

  // Bulk actions
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedProducts([]);
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    const filtered = getFilteredProducts();
    const allIds = filtered.map(product => product.id);
    setSelectedProducts(selectedProducts.length === allIds.length ? [] : allIds);
  };

  const bulkDeleteProducts = () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      setProducts(products.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      setSelectMode(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `products-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProducts = JSON.parse(e.target.result);
          if (Array.isArray(importedProducts)) {
            // Merge with existing products, avoiding duplicates
            const existingIds = new Set(products.map(p => p.id));
            const newProducts = importedProducts.filter(p => !existingIds.has(p.id));
            setProducts([...products, ...newProducts]);
            setEmailMsg(`Successfully imported ${newProducts.length} products`);
            setTimeout(() => setEmailMsg(''), 3000);
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          setEmailMsg('Error importing file. Please check the format.');
          setTimeout(() => setEmailMsg(''), 3000);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = '';
  };

  // Clear localStorage function
  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setProducts([]);
        setNotify(true);
        setActiveView('dashboard');
        setEmailMsg('All data cleared successfully');
        setTimeout(() => setEmailMsg(''), 3000);
      } catch (error) {
        setEmailMsg('Error clearing data');
        setTimeout(() => setEmailMsg(''), 3000);
      }
    }
  };

  // Amazon ordering functions
  const searchOnAmazon = (productName) => {
    const searchQuery = encodeURIComponent(productName);
    const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&ref=freshtrack_search`;
    window.open(amazonUrl, '_blank', 'noopener,noreferrer');
  };

  const orderFromAmazon = (productName) => {
    const searchQuery = encodeURIComponent(`${productName} fresh grocery`);
    const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&i=wholefoods&ref=freshtrack_order`;
    window.open(amazonUrl, '_blank', 'noopener,noreferrer');
  };

  const bulkOrderFromAmazon = (productNames) => {
    if (productNames.length === 0) return;
    
    const searchQuery = encodeURIComponent(productNames.join(' '));
    const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&i=wholefoods&ref=freshtrack_bulk`;
    window.open(amazonUrl, '_blank', 'noopener,noreferrer');
  };

  const getExpiredAndExpiringProducts = () => {
    return products.filter(product => {
      const status = getExpiryStatus(product.expiryDate);
      return status.status === 'expired' || status.status === 'warning';
    });
  };

  const orderAllExpiredExpiring = () => {
    const expiredExpiring = getExpiredAndExpiringProducts();
    if (expiredExpiring.length === 0) {
      setEmailMsg('No expired or expiring products to order');
      setTimeout(() => setEmailMsg(''), 3000);
      return;
    }
    
    const productNames = expiredExpiring.map(product => product.productName);
    bulkOrderFromAmazon(productNames);
    setEmailMsg(`Opening Amazon search for ${productNames.length} products`);
    setTimeout(() => setEmailMsg(''), 3000);
  };

  // Grocery List functions
  const addToGroceryList = (itemName, category = 'general') => {
    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      completed: false,
      category: category,
      addedDate: new Date().toISOString(),
      fromExpiredProduct: category === 'suggested'
    };
    setGroceryList([...groceryList, newItem]);
    setEmailMsg(`"${itemName}" added to grocery list`);
    setTimeout(() => setEmailMsg(''), 2000);
  };

  const removeFromGroceryList = (id) => {
    setGroceryList(groceryList.filter(item => item.id !== id));
  };

  const toggleGroceryItem = (id) => {
    setGroceryList(groceryList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addNewGroceryItem = () => {
    if (newGroceryItem.trim()) {
      addToGroceryList(newGroceryItem, 'manual');
      setNewGroceryItem('');
    }
  };

  const clearCompletedItems = () => {
    setGroceryList(groceryList.filter(item => !item.completed));
    setEmailMsg('Completed items cleared from grocery list');
    setTimeout(() => setEmailMsg(''), 2000);
  };

  const addExpiredToGroceryList = () => {
    const availableSuggestions = getAvailableSuggestions();
    
    if (availableSuggestions.length === 0) {
      setEmailMsg('All expired/expiring products are already in your grocery list');
      setTimeout(() => setEmailMsg(''), 3000);
      return;
    }
    
    availableSuggestions.forEach(product => {
      addToGroceryList(product.productName, 'suggested');
    });
    
    setEmailMsg(`${availableSuggestions.length} expired/expiring products added to grocery list`);
    setTimeout(() => setEmailMsg(''), 3000);
  };

  const getGroceryListStats = () => {
    return {
      total: groceryList.length,
      completed: groceryList.filter(item => item.completed).length,
      pending: groceryList.filter(item => !item.completed).length,
      suggested: groceryList.filter(item => item.category === 'suggested').length
    };
  };

  // Grocery item editing functions
  const startEditingGroceryItem = (id, currentName) => {
    setEditingGroceryItem(id);
    setEditingGroceryValue(currentName);
  };

  const saveGroceryItemEdit = () => {
    if (editingGroceryValue.trim()) {
      setGroceryList(groceryList.map(item => 
        item.id === editingGroceryItem 
          ? { ...item, name: editingGroceryValue.trim() }
          : item
      ));
    }
    setEditingGroceryItem(null);
    setEditingGroceryValue('');
  };

  const cancelGroceryItemEdit = () => {
    setEditingGroceryItem(null);
    setEditingGroceryValue('');
  };

  const handleGroceryEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveGroceryItemEdit();
    } else if (e.key === 'Escape') {
      cancelGroceryItemEdit();
    }
  };

  // Get available suggestions (exclude items already in grocery list)
  const getAvailableSuggestions = () => {
    const expiredExpiring = getExpiredAndExpiringProducts();
    return expiredExpiring.filter(product => 
      !groceryList.some(item => 
        item.name.toLowerCase().trim() === product.productName.toLowerCase().trim()
      )
    );
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

  // Initialize dark mode on component mount
  useEffect(() => {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
    document.body.classList.remove('light');
    document.documentElement.classList.remove('light');
  }, []);

  const stats = getProductStats();
  const filteredProducts = getFilteredProducts();

  return (
    <div className="app-container dark">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <FontAwesomeIcon icon={faBoxOpen} />
            <span>Lettucetrack</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeView === 'grocery' ? 'active' : ''}`}
            onClick={() => setActiveView('grocery')}
          >
            <FontAwesomeIcon icon={faListUl} />
            <span>Grocery List</span>
            {getGroceryListStats().pending > 0 && (
              <span className="nav-badge grocery">{getGroceryListStats().pending}</span>
            )}
          </div>
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <FontAwesomeIcon icon={faDashboard} />
            <span>Expiry Tracker</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => setActiveView('products')}
          >
            <FontAwesomeIcon icon={faBoxOpen} />
            <span>Products</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'reorder' ? 'active' : ''}`}
            onClick={() => setActiveView('reorder')}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            <span>Quick Reorder</span>
            {getExpiredAndExpiringProducts().length > 0 && (
              <span className="nav-badge">{getExpiredAndExpiringProducts().length}</span>
            )}
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
              <span className="user-name">{user?.email?.split('@')[0] || 'User'}</span>
              <span className="user-role">Authenticated</span>
            </div>
            <button 
              className="logout-button"
              onClick={logout}
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div className="page-title">
            <h1>{
              activeView === 'dashboard' ? 'Expiry Tracker' :
              activeView === 'grocery' ? 'Grocery List' :
              activeView.charAt(0).toUpperCase() + activeView.slice(1)
            }</h1>
            <p>{
              activeView === 'dashboard' ? 'Track expiry dates and manage your products efficiently' :
              activeView === 'products' ? 'Manage all your products with detailed controls' :
              activeView === 'reorder' ? 'Order expired and expiring products from Amazon' :
              activeView === 'grocery' ? 'Create and manage your shopping lists with smart suggestions' :
              activeView === 'analytics' ? 'Insights and trends from your inventory data' :
              activeView === 'settings' ? 'Configure notifications and app preferences' :
              'Manage your product inventory efficiently'
            }</p>
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
            <div className="save-status">
              {saveStatus === 'saving' && (
                <span className="save-indicator saving">
                  <FontAwesomeIcon icon={faSync} spin /> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="save-indicator saved">
                  <FontAwesomeIcon icon={faCheckCircle} /> Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="save-indicator error">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Save Error
                </span>
              )}
            </div>
            {/* Theme toggle removed - app now uses dark mode only */}
            <div className="notification-badge">
              <FontAwesomeIcon icon={faBell} />
              {(stats.expired + stats.expiringSoon) > 0 && (
                <span className="badge">{stats.expired + stats.expiringSoon}</span>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Dashboard View - Statistics Cards, Quick Add, Product List */}
          {activeView === 'dashboard' && (
            <>
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
                      <DatePicker
                        selected={expiryDate}
                        onChange={(date) => setExpiryDate(date)}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Select expiry"
                        className="modern-datepicker"
                        calendarClassName="dark-calendar"
                        minDate={new Date()}
                        showPopperArrow={false}
                        onKeyDown={(e) => e.key === 'Enter' && isFormValid && addProduct()}
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

              {/* Recent Products List */}
              <div className="recent-products-section">
                <div className="section-header">
                  <h2><FontAwesomeIcon icon={faBoxOpen} /> Recent Products</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveView('products')}
                  >
                    View All Products
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FontAwesomeIcon icon={faBoxOpen} />
                    </div>
                    <h3>No products found</h3>
                    <p>Start by adding your first product using the form above</p>
                  </div>
                ) : (
                  <div className="products-list">
                    {filteredProducts.slice(0, 8).map((product) => {
                      const expiryStatus = getExpiryStatus(product.expiryDate);
                      return (
                        <div key={product.id} className={`product-list-item ${expiryStatus.status}`}>
                          <div className="product-list-info">
                            <div className="product-list-name">{product.productName}</div>
                            <div className="product-list-date">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              {formatDate(product.expiryDate)}
                            </div>
                          </div>
                          <div className="product-list-status">
                            <div className={`status-badge-small ${expiryStatus.status}`}>
                              <FontAwesomeIcon icon={
                                expiryStatus.status === 'expired' ? faTimesCircle :
                                expiryStatus.status === 'warning' ? faExclamationTriangle : faCheckCircle
                              } />
                              {expiryStatus.status === 'expired' ? 'EXPIRED' :
                               expiryStatus.status === 'warning' ? `${expiryStatus.days}d` : 'FRESH'}
                            </div>
                          </div>
                          <div className="product-list-actions">
                            {(expiryStatus.status === 'expired' || expiryStatus.status === 'warning') && (
                              <button 
                                className="amazon-button-small"
                                onClick={() => orderFromAmazon(product.productName)}
                                title="Order from Amazon"
                              >
                                <FontAwesomeIcon icon={faShoppingCart} />
                              </button>
                            )}
                            <button 
                              className="delete-button-list"
                              onClick={() => removeProduct(product.id)}
                              title="Remove product"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Analytics Section */}
          {activeView === 'analytics' && (
            <div className="analytics-section">
              {products.length === 0 ? (
                <div className="analytics-empty-state">
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FontAwesomeIcon icon={faChartBar} />
                    </div>
                    <h3>No Analytics Data</h3>
                    <p>Analytics will appear here once you have products in your inventory.</p>
                  </div>
                </div>
              ) : (
              <div className="analytics-grid">
                {/* Expiry Timeline Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3><FontAwesomeIcon icon={faChartBar} /> Expiry Timeline</h3>
                    <p>Products expiring over the next 30 days</p>
                  </div>
                  <div className="chart-content">
                    <div className="timeline-chart">
                      {(() => {
                        const today = new Date();
                        const timeline = Array.from({length: 30}, (_, i) => {
                          const date = new Date(today);
                          date.setDate(today.getDate() + i);
                          const expiringCount = products.filter(product => {
                            const expiry = new Date(product.expiryDate);
                            return expiry.toDateString() === date.toDateString();
                          }).length;
                          return { date, count: expiringCount };
                        });
                        
                        const maxCount = Math.max(...timeline.map(item => item.count), 1);
                        
                        return timeline.map((item, index) => (
                          <div key={index} className="timeline-bar">
                            <div 
                              className="bar-fill" 
                              style={{ 
                                height: `${(item.count / maxCount) * 100}%`,
                                background: item.count > 0 ? 
                                  (index < 3 ? '#ef4444' : index < 7 ? '#f59e0b' : '#3b82f6') : 
                                  'transparent'
                              }}
                              title={`${item.date.toLocaleDateString()}: ${item.count} products`}
                            ></div>
                            <div className="bar-label">
                              {index % 5 === 0 ? item.date.getDate() : ''}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3><FontAwesomeIcon icon={faChartBar} /> Status Distribution</h3>
                    <p>Current status breakdown</p>
                  </div>
                  <div className="chart-content">
                    <div className="donut-chart">
                      <div 
                        className="donut-segments"
                        style={{
                          '--good-end': stats.total > 0 ? `${(stats.good / stats.total) * 360}deg` : '0deg',
                          '--warning-end': stats.total > 0 ? `${((stats.good + stats.expiringSoon) / stats.total) * 360}deg` : '0deg',
                          '--expired-end': stats.total > 0 ? `${((stats.good + stats.expiringSoon + stats.expired) / stats.total) * 360}deg` : '0deg'
                        }}
                      ></div>
                      <div className="donut-center">
                        <span className="donut-total">{stats.total}</span>
                        <span className="donut-label">Total</span>
                      </div>
                    </div>
                    <div className="donut-legend">
                      <div className="legend-item">
                        <span className="legend-color good"></span>
                        <span>Fresh ({stats.good})</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color warning"></span>
                        <span>Expiring ({stats.expiringSoon})</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color expired"></span>
                        <span>Expired ({stats.expired})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3><FontAwesomeIcon icon={faBoxOpen} /> Recent Activity</h3>
                    <p>Latest product additions</p>
                  </div>
                  <div className="chart-content">
                    <div className="activity-list">
                      {products
                        .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
                        .slice(0, 8)
                        .map(product => {
                          const status = getExpiryStatus(product.expiryDate);
                          return (
                            <div key={product.id} className="activity-item">
                              <div className={`activity-status ${status.status}`}></div>
                              <div className="activity-details">
                                <span className="activity-name">{product.productName}</span>
                                <span className="activity-date">
                                  Added {formatDate(product.addedDate)}
                                </span>
                              </div>
                              <div className="activity-expiry">
                                <span className={`activity-badge ${status.status}`}>
                                  {status.status === 'expired' ? 'EXPIRED' :
                                   status.status === 'warning' ? `${status.days}d` : 'FRESH'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      {products.length === 0 && (
                        <div className="empty-activity">
                          <FontAwesomeIcon icon={faBoxOpen} />
                          <span>No products added yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3><FontAwesomeIcon icon={faChartBar} /> Quick Insights</h3>
                    <p>Key metrics at a glance</p>
                  </div>
                  <div className="chart-content">
                    <div className="insights-list">
                      <div className="insight-item">
                        <span className="insight-label">Avg. Shelf Life</span>
                        <span className="insight-value">
                          {products.length > 0 ? 
                            Math.round(products.reduce((acc, product) => {
                              const added = new Date(product.addedDate);
                              const expiry = new Date(product.expiryDate);
                              return acc + Math.ceil((expiry - added) / (1000 * 60 * 60 * 24));
                            }, 0) / products.length) : 0} days
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Expiring This Week</span>
                        <span className="insight-value warning-text">
                          {products.filter(product => {
                            const status = getExpiryStatus(product.expiryDate);
                            return status.status === 'warning';
                          }).length}
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Most Common Item</span>
                        <span className="insight-value">
                          {(() => {
                            if (products.length === 0) return 'None';
                            const frequency = {};
                            products.forEach(product => {
                              const name = product.productName.toLowerCase();
                              frequency[name] = (frequency[name] || 0) + 1;
                            });
                            const mostCommon = Object.entries(frequency)
                              .sort(([,a], [,b]) => b - a)[0];
                            return mostCommon ? mostCommon[0] : 'None';
                          })()}
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Success Rate</span>
                        <span className="insight-value good-text">
                          {products.length > 0 ? 
                            Math.round((stats.good / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Products Page - Full Tile View */}
          {activeView === 'products' && (
            <div className="products-page">
              <div className="products-section">
                <div className="section-header">
                  <h2><FontAwesomeIcon icon={faBoxOpen} /> Your Products</h2>
                  <div className="section-actions">
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
                    <div className="action-buttons">
                      <button 
                        className="action-btn secondary"
                        onClick={toggleSelectMode}
                        title={selectMode ? "Exit selection mode" : "Select multiple products"}
                      >
                        <FontAwesomeIcon icon={selectMode ? faTimes : faCheckSquare} />
                        {selectMode ? 'Cancel' : 'Select'}
                      </button>
                      
                      <button 
                        className="action-btn secondary"
                        onClick={exportData}
                        title="Export product data"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        Export
                      </button>
                      
                      <label className="action-btn secondary file-import" title="Import product data">
                        <FontAwesomeIcon icon={faUpload} />
                        Import
                        <input 
                          type="file" 
                          accept=".json"
                          onChange={importData}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectMode && (
                  <div className="bulk-actions-bar">
                    <div className="bulk-actions-left">
                      <button 
                        className="bulk-select-all"
                        onClick={selectAllProducts}
                      >
                        <FontAwesomeIcon icon={selectedProducts.length === getFilteredProducts().length && getFilteredProducts().length > 0 ? faCheckSquare : faSquare} />
                        {selectedProducts.length === getFilteredProducts().length && getFilteredProducts().length > 0 ? 'Deselect All' : 'Select All'}
                      </button>
                      <span className="selection-count">
                        {selectedProducts.length} of {getFilteredProducts().length} selected
                      </span>
                    </div>
                    <div className="bulk-actions-right">
                      <button 
                        className="bulk-action-btn amazon"
                        onClick={() => {
                          const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
                          const expiredExpiring = selectedProductsData.filter(product => {
                            const status = getExpiryStatus(product.expiryDate);
                            return status.status === 'expired' || status.status === 'warning';
                          });
                          if (expiredExpiring.length > 0) {
                            const productNames = expiredExpiring.map(p => p.productName);
                            bulkOrderFromAmazon(productNames);
                            setEmailMsg(`Opening Amazon for ${productNames.length} expired/expiring products`);
                            setTimeout(() => setEmailMsg(''), 3000);
                          } else {
                            setEmailMsg('No expired or expiring products selected');
                            setTimeout(() => setEmailMsg(''), 3000);
                          }
                        }}
                        disabled={selectedProducts.length === 0}
                      >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        Order Selected from Amazon
                      </button>
                      <button 
                        className="bulk-action-btn danger"
                        onClick={bulkDeleteProducts}
                        disabled={selectedProducts.length === 0}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete Selected ({selectedProducts.length})
                      </button>
                    </div>
                  </div>
                )}

                {emailMsg && <div className="action-message">{emailMsg}</div>}

                {filteredProducts.length === 0 ? (
                  <div className="empty-state-modern">
                    <div className="empty-icon">
                      <FontAwesomeIcon icon={faBoxOpen} />
                    </div>
                    <h3>No products found</h3>
                    <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Start by adding your first product from the Dashboard'}</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map((product) => {
                      const expiryStatus = getExpiryStatus(product.expiryDate);
                      return (
                        <div key={product.id} className={`product-card ${expiryStatus.status} ${selectedProducts.includes(product.id) ? 'selected' : ''}`}>
                          <div className="product-header">
                            {selectMode && (
                              <div className="product-checkbox">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={() => toggleProductSelection(product.id)}
                                  className="card-checkbox"
                                />
                              </div>
                            )}
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
                            {!selectMode && (
                              <button 
                                className="delete-button-card"
                                onClick={() => removeProduct(product.id)}
                                title="Remove product"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            )}
                          </div>
                          
                          <div className="product-info">
                            <div className="expiry-info">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              <span
                                onDoubleClick={() => handleEdit(product.id, 'expiryDate', new Date(product.expiryDate))}
                              >
                                {editing.id === product.id && editing.field === 'expiryDate' ? (
                                  <DatePicker
                                    selected={editValue}
                                    onChange={(date) => setEditValue(date)}
                                    dateFormat="MMM dd, yyyy"
                                    className="edit-datepicker"
                                    calendarClassName="dark-calendar"
                                    autoFocus
                                    onBlur={handleEditBlur}
                                    onKeyDown={handleEditKeyDown}
                                    showPopperArrow={false}
                                    withPortal
                                    portalId="edit-date-picker-portal"
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
                          
                          {(expiryStatus.status === 'expired' || expiryStatus.status === 'warning') && (
                            <div className="product-amazon-actions">
                              <button 
                                className="amazon-order-btn secondary"
                                onClick={() => searchOnAmazon(product.productName)}
                                title="Search on Amazon"
                              >
                                <FontAwesomeIcon icon={faSearch} />
                                Search Amazon
                              </button>
                              <button 
                                className="amazon-order-btn primary"
                                onClick={() => orderFromAmazon(product.productName)}
                                title="Order from Amazon"
                              >
                                <FontAwesomeIcon icon={faShoppingCart} />
                                Order Now
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Reorder Page - Balanced Design */}
          {activeView === 'reorder' && (
            <div className="reorder-page-balanced">
              {getExpiredAndExpiringProducts().length === 0 ? (
                <div className="empty-state-modern">
                  <div className="empty-icon">
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </div>
                  <h3>All products are fresh!</h3>
                  <p>Items that are expired or expiring soon will appear here for easy reordering.</p>
                  <button 
                    className="empty-action-btn"
                    onClick={() => setActiveView('products')}
                  >
                    <FontAwesomeIcon icon={faBoxOpen} />
                    View Products
                  </button>
                </div>
              ) : (
                <div className="reorder-content-balanced">
                  {/* Header with summary stats */}
                  <div className="reorder-header-balanced">
                    <div className="reorder-stats">
                      <div className="stat-item">
                        <span className="stat-number">{getExpiredAndExpiringProducts().length}</span>
                        <span className="stat-label">Items to Reorder</span>
                      </div>
                      <div className="stat-divider"></div>
                      <div className="stat-item expired">
                        <span className="stat-number">
                          {getExpiredAndExpiringProducts().filter(p => getExpiryStatus(p.expiryDate).status === 'expired').length}
                        </span>
                        <span className="stat-label">Expired</span>
                      </div>
                      <div className="stat-item warning">
                        <span className="stat-number">
                          {getExpiredAndExpiringProducts().filter(p => getExpiryStatus(p.expiryDate).status === 'warning').length}
                        </span>
                        <span className="stat-label">Expiring Soon</span>
                      </div>
                    </div>
                    <button 
                      className="order-all-btn-balanced"
                      onClick={orderAllExpiredExpiring}
                    >
                      <FontAwesomeIcon icon={faShoppingBasket} />
                      Order All from Amazon
                    </button>
                  </div>

                  {/* Product cards - balanced between simple list and complex cards */}
                  <div className="reorder-products-balanced">
                    {getExpiredAndExpiringProducts()
                      .sort((a, b) => {
                        const statusA = getExpiryStatus(a.expiryDate);
                        const statusB = getExpiryStatus(b.expiryDate);
                        if (statusA.status === 'expired' && statusB.status !== 'expired') return -1;
                        if (statusA.status !== 'expired' && statusB.status === 'expired') return 1;
                        return statusA.days - statusB.days;
                      })
                      .map((product) => {
                        const expiryStatus = getExpiryStatus(product.expiryDate);
                        return (
                          <div key={product.id} className={`reorder-card-balanced ${expiryStatus.status}`}>
                            <div className="card-left">
                              <div className={`status-indicator ${expiryStatus.status}`}>
                                <FontAwesomeIcon icon={
                                  expiryStatus.status === 'expired' ? faTimesCircle : faExclamationTriangle
                                } />
                              </div>
                              <div className="product-details">
                                <h3 className="product-name">{product.productName}</h3>
                                <div className="product-meta">
                                  <FontAwesomeIcon icon={faCalendarAlt} />
                                  <span>Expires: {formatDate(product.expiryDate)}</span>
                                </div>
                                <div className={`urgency-text ${expiryStatus.status}`}>
                                  {expiryStatus.status === 'expired' 
                                    ? `Expired ${expiryStatus.days} days ago`
                                    : `Expires in ${expiryStatus.days} days`}
                                </div>
                              </div>
                            </div>
                            <div className="card-actions">
                              <button 
                                className="action-btn-secondary"
                                onClick={() => searchOnAmazon(product.productName)}
                                title="Search on Amazon"
                              >
                                <FontAwesomeIcon icon={faSearch} />
                                Search
                              </button>
                              <button 
                                className="action-btn-primary"
                                onClick={() => orderFromAmazon(product.productName)}
                                title="Order from Amazon"
                              >
                                <FontAwesomeIcon icon={faShoppingCart} />
                                Order Now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {emailMsg && <div className="action-message balanced">{emailMsg}</div>}
            </div>
          )}

          {/* Grocery List Page */}
          {activeView === 'grocery' && (
            <div className="grocery-page">
              <div className="grocery-section">
                {/* Grocery List Stats */}
                <div className="grocery-stats-grid">
                  <div className="grocery-stat-card total">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faClipboardList} />
                    </div>
                    <div className="stat-content">
                      <h3>{getGroceryListStats().total}</h3>
                      <p>Total Items</p>
                    </div>
                  </div>
                  
                  <div className="grocery-stat-card pending">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faListUl} />
                    </div>
                    <div className="stat-content">
                      <h3>{getGroceryListStats().pending}</h3>
                      <p>To Buy</p>
                    </div>
                  </div>
                  
                  <div className="grocery-stat-card completed">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="stat-content">
                      <h3>{getGroceryListStats().completed}</h3>
                      <p>Completed</p>
                    </div>
                  </div>
                  
                  <div className="grocery-stat-card suggested">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faLightbulb} />
                    </div>
                    <div className="stat-content">
                      <h3>{getGroceryListStats().suggested}</h3>
                      <p>Suggested</p>
                    </div>
                  </div>
                </div>

                {/* Add New Item Form */}
                <div className="add-grocery-section">
                  <div className="section-header">
                    <h2><FontAwesomeIcon icon={faPlus} /> Add to Grocery List</h2>
                  </div>
                  <form className="add-grocery-form" onSubmit={e => { e.preventDefault(); addNewGroceryItem(); }}>
                    <div className="grocery-input-group">
                      <input
                        type="text"
                        placeholder="Enter grocery item (e.g., Milk, Bread, Bananas...)"
                        value={newGroceryItem}
                        onChange={(e) => setNewGroceryItem(e.target.value)}
                        className="grocery-input"
                        onKeyPress={(e) => e.key === 'Enter' && newGroceryItem.trim() && addNewGroceryItem()}
                      />
                      <button 
                        className="add-grocery-btn" 
                        type="submit"
                        disabled={!newGroceryItem.trim()}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Add Item
                      </button>
                    </div>
                  </form>
                </div>

                {/* Smart Suggestions */}
                {getAvailableSuggestions().length > 0 && (
                  <div className="grocery-suggestions-section">
                    <div className="section-header">
                      <h2><FontAwesomeIcon icon={faLightbulb} /> Smart Suggestions</h2>
                      <p>Items that are expired or expiring soon</p>
                    </div>
                    <div className="suggestions-card">
                      <div className="suggestions-header">
                        <div className="suggestion-stats">
                          <span className="suggestion-count">{getAvailableSuggestions().length}</span>
                          <span className="suggestion-label">items need replacement</span>
                        </div>
                        <button 
                          className="add-all-suggestions-btn"
                          onClick={addExpiredToGroceryList}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          Add All to List
                        </button>
                      </div>
                      <div className="suggestions-list">
                        {getAvailableSuggestions().slice(0, 6).map(product => {
                          const expiryStatus = getExpiryStatus(product.expiryDate);
                          
                          return (
                            <div key={product.id} className={`suggestion-item ${expiryStatus.status}`}>
                              <div className="suggestion-info">
                                <span className="suggestion-name">{product.productName}</span>
                                <span className={`suggestion-status ${expiryStatus.status}`}>
                                  {expiryStatus.status === 'expired' ? 'Expired' : `${expiryStatus.days}d left`}
                                </span>
                              </div>
                              <button 
                                className="suggestion-add-btn"
                                onClick={() => addToGroceryList(product.productName, 'suggested')}
                                title="Add to grocery list"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </button>
                            </div>
                          );
                        })}
                        {getAvailableSuggestions().length > 6 && (
                          <div className="suggestion-item more">
                            <span className="suggestion-name">+{getAvailableSuggestions().length - 6} more expired/expiring items</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grocery List */}
                <div className="grocery-list-section">
                  <div className="section-header">
                    <h2><FontAwesomeIcon icon={faListUl} /> Your Grocery List</h2>
                    <div className="list-actions">
                      {getGroceryListStats().completed > 0 && (
                        <button 
                          className="clear-completed-btn"
                          onClick={clearCompletedItems}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Clear Completed
                        </button>
                      )}
                    </div>
                  </div>

                  {groceryList.length === 0 ? (
                    <div className="empty-state-modern">
                      <div className="empty-icon">
                        <FontAwesomeIcon icon={faListUl} />
                      </div>
                      <h3>Your grocery list is empty</h3>
                      <p>Add items manually or use our smart suggestions from expired products</p>
                    </div>
                  ) : (
                    <div className="grocery-items-container">
                      {/* Pending Items */}
                      {groceryList.filter(item => !item.completed).length > 0 && (
                        <div className="grocery-group">
                          <h3 className="group-title">
                            <FontAwesomeIcon icon={faListUl} />
                            To Buy ({groceryList.filter(item => !item.completed).length})
                          </h3>
                          <div className="grocery-items-list">
                            {groceryList
                              .filter(item => !item.completed)
                              .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
                              .map(item => (
                                <div key={item.id} className={`grocery-item ${item.category}`}>
                                  <div className="item-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() => toggleGroceryItem(item.id)}
                                      className="grocery-checkbox"
                                    />
                                  </div>
                                  <div className="item-content">
                                    {editingGroceryItem === item.id ? (
                                      <input
                                        type="text"
                                        value={editingGroceryValue}
                                        onChange={(e) => setEditingGroceryValue(e.target.value)}
                                        onBlur={saveGroceryItemEdit}
                                        onKeyDown={handleGroceryEditKeyDown}
                                        className="grocery-edit-input"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="item-name editable"
                                        onDoubleClick={() => startEditingGroceryItem(item.id, item.name)}
                                        title="Double-click to edit"
                                      >
                                        {item.name}
                                      </span>
                                    )}
                                    {item.category === 'suggested' && (
                                      <span className="item-badge suggested">
                                        <FontAwesomeIcon icon={faLightbulb} />
                                        Suggested
                                      </span>
                                    )}
                                  </div>
                                  <button 
                                    className="item-remove-btn"
                                    onClick={() => removeFromGroceryList(item.id)}
                                    title="Remove item"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Completed Items */}
                      {groceryList.filter(item => item.completed).length > 0 && (
                        <div className="grocery-group completed">
                          <h3 className="group-title">
                            <FontAwesomeIcon icon={faCheck} />
                            Completed ({groceryList.filter(item => item.completed).length})
                          </h3>
                          <div className="grocery-items-list">
                            {groceryList
                              .filter(item => item.completed)
                              .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
                              .map(item => (
                                <div key={item.id} className="grocery-item completed">
                                  <div className="item-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() => toggleGroceryItem(item.id)}
                                      className="grocery-checkbox"
                                    />
                                  </div>
                                  <div className="item-content">
                                    {editingGroceryItem === item.id ? (
                                      <input
                                        type="text"
                                        value={editingGroceryValue}
                                        onChange={(e) => setEditingGroceryValue(e.target.value)}
                                        onBlur={saveGroceryItemEdit}
                                        onKeyDown={handleGroceryEditKeyDown}
                                        className="grocery-edit-input"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="item-name editable"
                                        onDoubleClick={() => startEditingGroceryItem(item.id, item.name)}
                                        title="Double-click to edit"
                                      >
                                        {item.name}
                                      </span>
                                    )}
                                  </div>
                                  <button 
                                    className="item-remove-btn"
                                    onClick={() => removeFromGroceryList(item.id)}
                                    title="Remove item"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {emailMsg && <div className="action-message grocery">{emailMsg}</div>}
              </div>
            </div>
          )}

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
              
              <div className="settings-card">
                <div className="section-header">
                  <h2><FontAwesomeIcon icon={faTrash} /> Data Management</h2>
                </div>
                <div className="settings-form">
                  <p style={{color: '#94a3b8', marginBottom: '16px'}}>
                    Your data is automatically saved to your browser's local storage. 
                    You can clear all data if needed.
                  </p>
                  <button 
                    className="settings-btn danger"
                    onClick={clearLocalStorage}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTrash} /> Clear All Data
                  </button>
                  <p style={{color: '#64748b', fontSize: '0.8rem', marginTop: '8px'}}>
                    This will remove all products and reset your preferences.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Portal containers for date pickers */}
      <div id="date-picker-portal"></div>
      <div id="edit-date-picker-portal"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <GroceryProApp />
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
