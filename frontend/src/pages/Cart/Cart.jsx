import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderBar from '../../components/HeaderBar.jsx'
import './Cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        setCartItems(cart)
      } catch (error) {
        console.error('Error loading cart:', error)
        setCartItems([])
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  useEffect(() => {
    // Load cart item count
    const loadCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
        setCartItemCount(totalItems)
      } catch (error) {
        console.error('Error loading cart count:', error)
        setCartItemCount(0)
      }
    }

    loadCartCount()

    // Listen for storage changes to update cart count
    const handleStorageChange = () => {
      loadCartCount()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleStorageChange)
    }
  }, [])

  const updateCart = (updatedCart) => {
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    
    // Update cart count
    const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0)
    setCartItemCount(totalItems)
    
    // Dispatch custom event to update other components
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const handleQuantityChange = (productId, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change
        if (newQuantity >= 1) {
          return { ...item, quantity: newQuantity }
        }
        return item
      }
      return item
    }).filter(item => item.quantity > 0)
    
    updateCart(updatedCart)
  }

  const handleRemoveItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId)
    updateCart(updatedCart)
  }

  const handleClearCart = () => {
    updateCart([])
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[^\d]/g, ''))
      return total + (price * item.quantity)
    }, 0)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal > 500 ? 0 : 50
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="cart-container">
        <HeaderBar />
        <div className="cart-loading">
          <div className="cart-loading-text">Loading cart...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <HeaderBar />
      
      {/* Subheading Bar */}
      <div className="cart-subheading-bar">
        <div className="cart-subheading-content">
          <div className="cart-subheading-inner">
            {/* Left side - Back button and breadcrumb */}
            <div className="cart-left-section">
              <button
                onClick={() => navigate('/marketplace')}
                className="cart-back-button"
              >
                ← Marketplace
              </button>
              
              {/* Breadcrumb */}
              <div className="cart-breadcrumb">
                <span>Dashboard</span>
                <span>›</span>
                <span>Marketplace</span>
                <span>›</span>
                <span className="cart-breadcrumb-current">Cart</span>
              </div>
            </div>

            {/* Right side - Cart and actions */}
            <div className="cart-right-section">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="cart-wishlist-button"
              >
                <span className="cart-wishlist-icon">
                  ❤️
                </span>
                Wishlist
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="cart-button"
              >
                <span style={{ fontSize: '16px' }}>🛒</span>
                Cart
                <span className="cart-badge">
                  {cartItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="cart-main-content">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-top">
            <span className="cart-header-icon">🛒</span>
            <h1 className="cart-header-title">
              Shopping Cart
            </h1>
          </div>
          <p className="cart-header-description">
            {cartItems.length === 0 
              ? 'Your cart is empty. Start adding products you love!'
              : `You have ${cartItems.length} item${cartItems.length === 1 ? '' : 's'} in your cart.`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-container">
            <div className="cart-empty-icon">🛒</div>
            <h3 className="cart-empty-title">
              Your cart is empty
            </h3>
            <p className="cart-empty-description">
              Start exploring our marketplace and add products to your cart
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="cart-browse-button"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-content-grid">
            {/* Cart Items */}
            <div className="cart-items-container">
              <div className="cart-items-header">
                <h2 className="cart-items-title">
                  Cart Items ({cartItems.length})
                </h2>
                <button
                  onClick={handleClearCart}
                  className="cart-clear-button"
                >
                  Clear Cart
                </button>
              </div>

              <div className="cart-items-list">
                {cartItems.map(item => {
                  const price = parseInt(item.price.replace(/[^\d]/g, ''))
                  const mrp = Math.round(price * 1.3)
                  
                  return (
                    <div key={item.id} className="cart-item">
                      {/* Product Image */}
                      <div className="cart-item-image-container">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="cart-item-image"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="cart-item-info">
                        <h3 
                          className="cart-item-name"
                          onClick={() => navigate(`/product/${item.id}`)}
                        >
                          {item.name}
                        </h3>
                        <p className="cart-item-description">
                          {item.description}
                        </p>
                        <div className="cart-item-price-container">
                          <span className="cart-item-mrp">
                            ₹{mrp.toLocaleString('en-IN')}
                          </span>
                          <span className="cart-item-price">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="cart-item-controls">
                        <div className="cart-quantity-controls">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="cart-quantity-button"
                          >
                            -
                          </button>
                          <span className="cart-quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="cart-quantity-button"
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-total">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="cart-remove-button"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="cart-order-summary">
              <h2 className="cart-order-summary-title">
                Order Summary
              </h2>

              <div className="cart-summary-items">
                <div className="cart-summary-item">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-value">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="cart-summary-item">
                  <span className="cart-summary-label">Shipping</span>
                  <span className={`cart-summary-value ${calculateShipping() === 0 ? 'cart-summary-shipping-free' : ''}`}>
                    {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}
                  </span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-item">
                  <span className="cart-summary-total-label">Total</span>
                  <span className="cart-summary-total-value">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              {calculateSubtotal() > 500 && (
                <div className="cart-free-shipping-banner">
                  <div className="cart-free-shipping-text">
                    🚚 You qualify for free shipping!
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="cart-checkout-button"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/marketplace')}
                className="cart-continue-shopping-button"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
