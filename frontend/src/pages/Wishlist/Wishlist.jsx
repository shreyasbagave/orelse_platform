import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderBar from '../../components/HeaderBar.jsx'

export default function Wishlist() {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    // Load wishlist from localStorage
    const loadWishlist = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
        setWishlistItems(wishlist)
      } catch (error) {
        console.error('Error loading wishlist:', error)
        setWishlistItems([])
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
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

  const handleRemoveFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId)
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    setWishlistItems(updatedWishlist)
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

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <HeaderBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Loading wishlist...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <HeaderBar />
      
      {/* Subheading Bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 0',
        position: 'sticky',
        top: '0',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            {/* Left side - Back button and breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/marketplace')}
                style={{
                  padding: '8px 14px',
                  background: '#f3f4f6',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                ← Marketplace
              </button>
              
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                <span>Dashboard</span>
                <span>›</span>
                <span>Marketplace</span>
                <span>›</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>Wishlist</span>
              </div>
            </div>

            {/* Right side - Cart and actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fef2f2'
                  e.target.style.borderColor = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = '#dc2626'
                }}
              >
                <span style={{ 
                  fontSize: '16px',
                  color: '#dc2626'
                }}>
                  ❤️
                </span>
                Wishlist
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                style={{
                  padding: '8px 16px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
              >
                <span style={{ fontSize: '16px' }}>🛒</span>
                Cart
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px' }}>❤️</span>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#0f172a', 
              margin: '0'
            }}>
              My Wishlist
            </h1>
          </div>
          <p style={{ 
            color: '#64748b', 
            fontSize: '16px', 
            margin: '0',
            lineHeight: '1.5'
          }}>
            {wishlistItems.length === 0 
              ? 'Your wishlist is empty. Start adding products you love!'
              : `You have ${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} in your wishlist.`
            }
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '64px 32px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>💔</div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#111827', 
              margin: '0 0 12px'
            }}>
              Your wishlist is empty
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#6b7280', 
              margin: '0 0 24px',
              lineHeight: '1.5'
            }}>
              Start exploring our marketplace and add products you love to your wishlist
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              style={{
                padding: '12px 24px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '32px', 
            justifyContent: 'center' 
          }}>
            {wishlistItems.map(product => {
              const priceValue = parseInt(product.price.replace(/[^\d]/g, ''))
              const mrp = Math.round(priceValue * 1.3)
              
              return (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    position: 'relative',
                    width: 360,
                    margin: '20px auto',
                    transform: 'scale(1)',
                    zIndex: 1,
                    transition: 'transform 0.2s',
                    borderRadius: '5%',
                    boxShadow: '0 5px 20px rgba(0,0,0,.1)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.zIndex = 2
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.zIndex = 1
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,.1)'
                  }}
                >
                  {/* Wishlist Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#dc2626',
                    color: '#fff',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    borderRadius: '10px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ❤️ WISHLISTED
                  </div>

                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFromWishlist(product.id)
                    }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      zIndex: 10,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626'
                      e.target.style.color = 'white'
                      e.target.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                      e.target.style.color = '#dc2626'
                      e.target.style.transform = 'scale(1)'
                    }}
                  >
                    ✕
                  </button>
                  
                  {/* Image */}
                  <div className="img" style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Free Delivery Badge at left lower corner */}
                    {priceValue > 500 && (
                      <div style={{
                        position: 'absolute',
                        left: 10,
                        bottom: 10,
                        background: '#059669',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}>
                        🚚 Free Delivery
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="info" style={{ padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#71717A', marginBottom: 5 }}>
                      {product.category}
                    </div>
                    <div className="title" style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: '0 0 10px', letterSpacing: '-.5px' }}>
                      {product.name}
                    </div>
                    <div className="desc" style={{ fontSize: 13, color: '#52525B', lineHeight: 1.4, marginBottom: 12 }}>
                      {product.description}
                    </div>
                    <div className="feats" style={{ display: 'flex', gap: 6, marginBottom: 15 }}>
                      <span className="feat" style={{ fontSize: 10, background: '#F4F4F5', color: '#71717A', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>Organic</span>
                      <span className="feat" style={{ fontSize: 10, background: '#F4F4F5', color: '#71717A', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>Premium</span>
                      <span className="feat" style={{ fontSize: 10, background: '#F4F4F5', color: '#71717A', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>Fresh</span>
                    </div>
                    <div className="bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div className="price" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="old" style={{ fontSize: 13, textDecoration: 'line-through', color: '#A1A1AA', marginBottom: 2 }}>
                          ₹{mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="new" style={{ fontSize: 20, fontWeight: 700, color: '#18181B' }}>
                          ₹{priceValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button 
                        className="btn" 
                        style={{
                          background: '#18181B',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          padding: '8px 15px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 3px 10px rgba(0,0,0,.1)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                      >
                        <span className="icon" style={{ marginRight: 4 }}>🛒</span> Add to Cart
                      </button>
                    </div>
                    <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F4F4F5', paddingTop: 12 }}>
                      <div className="rating" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} style={{ color: i < Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb', fontSize: 16 }}>★</span>
                        ))}
                        <span className="rcount" style={{ marginLeft: 6, fontSize: 11, color: '#71717A' }}>{product.reviews} Reviews</span>
                      </div>
                      <span className="stock" style={{ fontSize: 11, fontWeight: 600, color: '#22C55E' }}>In Stock</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
