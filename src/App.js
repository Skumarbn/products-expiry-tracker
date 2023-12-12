// src/App.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const addProduct = () => {
    if (productName && expiryDate) {
      setProducts([...products, { productName, expiryDate }]);
      setProductName('');
      setExpiryDate('');
    }
  };

  const removeProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  return (
    <div className="App">
      <div className="intro">
        <h1>Product Expiry Tracker</h1>
        <p>
          Welcome to Product Expiry Tracker! This will allows you to keep
          track of the expiry dates of your products. Add your products and
          ensure that you never miss an expiry date again.
        </p>
      </div>

      <div className="left-panel">
        <h2>Enter the product to be tracked below : </h2>
        <div className="add-product">
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            id="productName"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <label htmlFor="expiryDate">Expiry Date:</label>
          <input
            type="date"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <button onClick={addProduct}>Add</button>
        </div>
      </div>

      <div className="content-panel">
        <h2>Products List</h2>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Expiry Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>{product.productName}</td>
                <td>{product.expiryDate}</td>
                <td>
                  <button onClick={() => removeProduct(index)}>
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
