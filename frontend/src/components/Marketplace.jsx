import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { me } from '../api'
import HeaderBar from './HeaderBar.jsx'
import { products, categories, priceRanges, ecoScoreRanges, searchProducts, getProductsByCategory, getProductsByPriceRange, getProductsByEcoScore } from '../data/products.js'
import './Marketplace.css'

export default function Marketplace() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('marketplace')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [hoveredProductId, setHoveredProductId] = useState(null)
  const [showProfilePage, setShowProfilePage] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState('')
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setUserError('Not authenticated')
          return
        }
        const profile = await me(token)
        setUser(profile)
      } catch (e) {
        setUserError(e.message || 'Failed to load user')
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
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
    
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleStorageChange)
    }
  }, [])

  // Products are now imported from the data file

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    } else {
      // Add new item to cart
      const newItem = { ...product, quantity: 1 }
      localStorage.setItem('cart', JSON.stringify([...cart, newItem]))
    }
    
    // Update cart count
    const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0)
    setCartItemCount(totalItems)
    
    // Dispatch custom event to update other components
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    
    alert(`Added ${product.name} to cart!`)
  }

  const getEcoColor = (eco) => {
    if (eco >= 80) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#22c55e' }
    if (eco >= 70) return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' }
    return { backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#ef4444' }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg key={i} className="w-4 h-4 text-yellow-400" fill={i < Math.floor(rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ))
  }

  // Filter products using imported helper functions
  const filteredProducts = (() => {
    let filtered = products

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchProducts(searchQuery)
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      if (priceFilter.includes('-')) {
        const [min, max] = priceFilter.split('-').map(Number)
        filtered = filtered.filter(product => {
          const priceValue = parseInt(product.price.replace(/[^\d]/g, ''))
          return priceValue >= min && priceValue <= max
        })
      } else if (priceFilter === '1000+') {
        filtered = filtered.filter(product => {
          const priceValue = parseInt(product.price.replace(/[^\d]/g, ''))
          return priceValue >= 1000
        })
      }
    }

    return filtered
  })()

  // FarmerProfile component with steppers
  function FarmerProfile() {
    const [step, setStep] = useState(0)
    const steps = [
      { label: 'Personal Info' },
      { label: 'Farm Details' },
      { label: 'Documents / Verification' }
    ]
    return (
      <div style={{
        maxWidth: '500px',
        margin: '40px auto',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '32px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#2563eb' }}>👨‍🌾 Farmer Profile</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', gap: '24px' }}>
          {steps.map((s, idx) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: idx === step ? '#2563eb' : '#e5e7eb',
                  color: idx === step ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  margin: '0 auto 8px'
                }}
              >
                {idx + 1}
              </div>
              <div style={{ fontSize: '14px', color: idx === step ? '#2563eb' : '#6b7280', fontWeight: idx === step ? 'bold' : 'normal' }}>
                {s.label}
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  background: '#e5e7eb',
                  margin: '16px auto 0'
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ minHeight: '120px', marginBottom: '24px' }}>
          {step === 0 && <div>
            <p style={{ color: '#374151' }}>Enter your personal information here.</p>
          </div>}
          {step === 1 && <div>
            <p style={{ color: '#374151' }}>Enter your farm details here.</p>
          </div>}
          {step === 2 && <div>
            <p style={{ color: '#374151' }}>Upload documents for verification.</p>
          </div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            style={{
              padding: '10px 20px',
              background: step === 0 ? '#e5e7eb' : '#2563eb',
              color: step === 0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: step === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <button
            disabled={step === steps.length - 1}
            onClick={() => setStep(step + 1)}
            style={{
              padding: '10px 20px',
              background: step === steps.length - 1 ? '#e5e7eb' : '#059669',
              color: step === steps.length - 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
        <button
          onClick={() => setShowProfilePage(false)}
          style={{
            marginTop: '32px',
            background: '#f3f4f6',
            color: '#2563eb',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  // ProductCard component with rounded corners and shadow
  function ProductCard({ product, onClick, hovered, onMouseEnter, onMouseLeave }) {
    const priceValue = parseInt(product.price.replace(/[^\d]/g, ''))
    const discountPct = Math.round(((priceValue * 1.3 - priceValue) / (priceValue * 1.3)) * 100)
    const mrp = Math.round(priceValue * 1.3)
    return (
      <div
        className={`marketplace-product-card ${hovered ? 'hovered' : ''}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Badge */}
        <div className="marketplace-product-badge">
          HOT SALE
        </div>
        {/* Image */}
        <div className="marketplace-product-image">
          <img src={product.image} alt={product.name} />
          {/* Free Delivery Badge at left lower corner */}
          {priceValue > 500 && (
            <div className="marketplace-free-delivery-badge">
              🚚 Free Delivery
            </div>
          )}
        </div>
        {/* Info */}
        <div className="marketplace-product-info">
          <div className="marketplace-product-title">
            {product.name}
          </div>
          <div className="marketplace-product-description">
            {product.description}
          </div>
          {/* EcoScore pill */}
          <div className="marketplace-ecoscore">
            <span 
              className="marketplace-ecoscore-badge"
              style={{
                border: '1px solid ' + (getEcoColor(product.eco).borderColor),
                background: getEcoColor(product.eco).backgroundColor,
                color: getEcoColor(product.eco).color
              }}
            >
              EcoScore: {product.eco}
            </span>
          </div>
          <div className="marketplace-product-features">
            <span className="marketplace-feature-tag">4K Display</span>
            <span className="marketplace-feature-tag">16-Hour Battery</span>
            <span className="marketplace-feature-tag">Thunderbolt 4</span>
          </div>
          <div className="marketplace-product-bottom">
            <div className="marketplace-price-container">
              <span className="marketplace-price-old">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              <span className="marketplace-price-new">
                ₹{priceValue.toLocaleString('en-IN')}
              </span>
            </div>
            <button 
              className="marketplace-add-to-cart-button"
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart(product)
              }}
            >
              <span>🛒</span> Add to Cart
            </button>
          </div>
          <div className="marketplace-product-meta">
            <div className="marketplace-rating">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? 'marketplace-star' : 'marketplace-star-empty'}>★</span>
              ))}
              <span className="marketplace-review-count">{product.reviews} Reviews</span>
            </div>
            <span className="marketplace-stock-status">In Stock</span>
          </div>
        </div>
        {/* More Info Overlay on hover */}
        {hovered && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(207, 207, 234, 0.97)',
            color: '#18181B',
            borderRadius: '5%',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '15px',
            boxShadow: '0 10px 25px rgba(0,0,0,.15)',
            padding: '32px'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '22px', marginBottom: '12px' }}>{product.name}</div>
            <div style={{ marginBottom: '8px', textAlign: 'center' }}>{product.description}</div>
            <div style={{ marginBottom: '8px' }}>Category: <b>{product.category}</b></div>
            <div style={{ marginBottom: '8px' }}>EcoScore: <b>{product.eco}</b></div>
            <div style={{ marginBottom: '8px' }}>Rating: <b>{product.rating}</b> ({product.reviews} reviews)</div>
            <div style={{ marginBottom: '8px' }}>Price: <b>₹{priceValue.toLocaleString('en-IN')}</b></div>
            {priceValue > 500 && (
              <div style={{ marginBottom: '8px', color: '#059669', fontWeight: 'bold' }}>🚚 Free Delivery</div>
            )}
            <div style={{ marginBottom: '8px' }}>This product is organically grown and verified for quality. Delivery available pan India.</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="marketplace-container">
      {/* Shared Header */}
      <HeaderBar />
      
      {/* Subheading Bar */}
      <div className="marketplace-subheading-bar">
        <div className="marketplace-subheading-content">
          <div className="marketplace-subheading-inner">
            {/* Left side - Back button and breadcrumb */}
            <div className="marketplace-left-section">
              <button
                onClick={() => {
                  const role = localStorage.getItem('userRole') || 'farmer'
                  navigate(`/dashboard/${role}`)
                }}
                className="marketplace-back-button"
              >
                ← Dashboard
              </button>
              
              {/* Breadcrumb */}
              <div className="marketplace-breadcrumb">
                <span>Dashboard</span>
                <span>›</span>
                <span className="marketplace-breadcrumb-current">Marketplace</span>
              </div>
            </div>

            {/* Right side - Cart and actions */}
            <div className="marketplace-right-section">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="marketplace-wishlist-button"
              >
                <span className="marketplace-wishlist-icon">❤️</span>
                Wishlist
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="marketplace-cart-button"
              >
                <span>🛒</span>
                Cart
                {/* Cart badge */}
                <span className="marketplace-cart-badge">
                  {cartItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs removed per request */}

      {/* Main Content */}
      <div className="marketplace-main-content">
        {showProfilePage ? (
          <FarmerProfile />
        ) : (
          <>
            {
              <div className="marketplace-products-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                    hovered={hoveredProductId === product.id}
                    onMouseEnter={() => setHoveredProductId(product.id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="marketplace-no-products">
                    <h3 className="marketplace-no-products-title">🔍 No products found</h3>
                    <p className="marketplace-no-products-description">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setPriceFilter('all')
                      }}
                      className="marketplace-clear-filters-button"
                    >
                      🔄 Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            }
          </>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

    </div>
  )
}