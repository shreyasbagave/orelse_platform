import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderBar from '../../components/HeaderBar.jsx'

export default function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Sample product data - in a real app, this would come from an API
  const products = [
    {
      id: 1,
      name: 'Organic Wheat',
      description: 'Premium farm-grown wheat grains, chemical-free and naturally processed. This high-quality wheat is perfect for making bread, rotis, and other baked goods. Grown using traditional farming methods without any chemical fertilizers or pesticides.',
      price: 'Rs. 1,200/quintal',
      si: 650,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
      category: 'Grains',
      farmer: 'Rajesh Kumar',
      location: 'Punjab',
      rating: 4.8,
      reviews: 124,
      images: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'
      ],
      features: [
        '100% Organic',
        'Chemical-free',
        'High protein content',
        'Long shelf life',
        'Pan India delivery'
      ],
      specifications: {
        'Protein Content': '12-14%',
        'Moisture': 'Below 12%',
        'Purity': '99.5%',
        'Packaging': '50kg bags',
        'Storage': 'Cool, dry place'
      }
    },
    {
      id: 2,
      name: 'Fresh Turmeric',
      description: 'Pure organic turmeric roots, sun-dried and hand-selected. This premium turmeric is known for its high curcumin content and medicinal properties. Perfect for cooking and health benefits.',
      price: 'Rs. 200/kg',
      si: 580,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
      category: 'Spices',
      farmer: 'Priya Sharma',
      location: 'Kerala',
      rating: 4.6,
      reviews: 89,
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop'
      ],
      features: [
        '100% Organic',
        'High curcumin content',
        'Sun-dried naturally',
        'Hand-selected quality',
        'Medicinal properties'
      ],
      specifications: {
        'Curcumin Content': '3-5%',
        'Moisture': 'Below 10%',
        'Purity': '99%',
        'Packaging': '1kg bags',
        'Storage': 'Cool, dry place'
      }
    },
    {
      id: 3,
      name: 'Natural Honey',
      description: 'Raw forest honey, chemical-free and sustainably harvested. This pure honey is collected from wild forest areas and is known for its natural sweetness and health benefits.',
      price: 'Rs. 450/kg',
      si: 720,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
      category: 'Dairy',
      farmer: 'Amit Singh',
      location: 'Himachal Pradesh',
      rating: 4.9,
      reviews: 156,
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop'
      ],
      features: [
        '100% Natural',
        'Raw and unprocessed',
        'Forest harvested',
        'No additives',
        'Rich in antioxidants'
      ],
      specifications: {
        'Moisture': 'Below 18%',
        'HMF': 'Below 40mg/kg',
        'Purity': '100%',
        'Packaging': '500g jars',
        'Storage': 'Room temperature'
      }
    },
    {
      id: 4,
      name: 'Organic Rice',
      description: 'Premium basmati rice, grown in traditional methods. This aromatic rice is perfect for biryanis, pulao, and everyday meals. Grown without chemical fertilizers and pesticides.',
      price: 'Rs. 180/kg',
      si: 620,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      category: 'Grains',
      farmer: 'Sunita Devi',
      location: 'Haryana',
      rating: 4.7,
      reviews: 203,
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'
      ],
      features: [
        '100% Organic',
        'Aromatic basmati',
        'Long grain',
        'Non-sticky',
        'Premium quality'
      ],
      specifications: {
        'Grain Length': '7-8mm',
        'Moisture': 'Below 14%',
        'Purity': '99%',
        'Packaging': '5kg bags',
        'Storage': 'Cool, dry place'
      }
    },
    {
      id: 5,
      name: 'Fresh Vegetables',
      description: 'Farm-fresh seasonal vegetables, pesticide-free. A mix of seasonal vegetables including tomatoes, onions, potatoes, and leafy greens, all grown using organic farming methods.',
      price: 'Rs. 80/kg',
      si: 590,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
      category: 'Vegetables',
      farmer: 'Vikram Patel',
      location: 'Gujarat',
      rating: 4.5,
      reviews: 78,
      images: [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop'
      ],
      features: [
        '100% Organic',
        'Pesticide-free',
        'Fresh daily',
        'Seasonal variety',
        'Nutrient-rich'
      ],
      specifications: {
        'Variety': 'Mixed seasonal',
        'Freshness': 'Daily harvest',
        'Pesticides': 'None',
        'Packaging': 'Eco-friendly bags',
        'Storage': 'Refrigerate'
      }
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const foundProduct = products.find(p => p.id === parseInt(productId))
        if (foundProduct) {
          setProduct(foundProduct)
          // Check if product is in wishlist
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
          setIsInWishlist(wishlist.some(item => item.id === foundProduct.id))
        } else {
          navigate('/marketplace')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        navigate('/marketplace')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, navigate])

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

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    } else {
      // Add new item to cart
      const newItem = { ...product, quantity }
      localStorage.setItem('cart', JSON.stringify([...cart, newItem]))
    }
    
    // Update cart count
    const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0)
    setCartItemCount(totalItems)
    
    // Dispatch custom event to update other components
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    
    alert(`Added ${quantity} ${product.name} to cart!`)
  }

  const handleBuyNow = () => {
    // Add to cart first, then navigate to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    } else {
      // Add new item to cart
      const newItem = { ...product, quantity }
      localStorage.setItem('cart', JSON.stringify([...cart, newItem]))
    }
    
    // Update cart count
    const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0)
    setCartItemCount(totalItems)
    
    // Dispatch custom event to update other components
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    
    navigate('/cart')
  }

  const handleWishlistToggle = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== product.id)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      setIsInWishlist(false)
      alert(`${product.name} removed from wishlist!`)
    } else {
      // Add to wishlist
      const updatedWishlist = [...wishlist, product]
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      setIsInWishlist(true)
      alert(`${product.name} added to wishlist!`)
    }
  }

  const handleAddToCartRecommended = (recommendedProduct) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === recommendedProduct.id)
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedCart = cart.map(item => 
        item.id === recommendedProduct.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    } else {
      // Add new item to cart
      const newItem = { ...recommendedProduct, quantity: 1 }
      localStorage.setItem('cart', JSON.stringify([...cart, newItem]))
    }
    
    // Update cart count
    const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0)
    setCartItemCount(totalItems)
    
    // Dispatch custom event to update other components
    window.dispatchEvent(new CustomEvent('cartUpdated'))
    
    alert(`Added ${recommendedProduct.name} to cart!`)
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <HeaderBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Loading product details...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <HeaderBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Product not found</div>
        </div>
      </div>
    )
  }

  const priceValue = parseInt(product.price.replace(/[^\d]/g, ''))
  const mrp = Math.round(priceValue * 1.3)
  const discountPct = Math.round(((mrp - priceValue) / mrp) * 100)

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <HeaderBar />
      
      {/* Subheading Bar with Cart */}
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
                ← Back
              </button>
              
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                <span>Marketplace</span>
                <span>›</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>{product.name}</span>
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
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
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
                  e.target.style.backgroundColor = '#f9fafb'
                  e.target.style.borderColor = '#d1d5db'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = '#e5e7eb'
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
                {/* Cart badge */}
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

      {/* Product Details */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Product Images */}
          <div>
            <div style={{ 
              width: '100%', 
              height: '400px', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              marginBottom: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            {/* Thumbnail Images */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedImage === index ? '2px solid #059669' : '2px solid #e5e7eb',
                    cursor: 'pointer',
                    background: 'none',
                    padding: 0
                  }}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ 
                fontSize: '14px', 
                color: '#059669', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {product.category}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#0f172a', 
                margin: '0',
                lineHeight: '1.2',
                flex: 1
              }}>
                {product.name}
              </h1>
              
              {/* Wishlist Heart Icon */}
              <button
                onClick={handleWishlistToggle}
                style={{
                  padding: '12px',
                  background: 'transparent',
                  border: `2px solid ${isInWishlist ? '#dc2626' : '#e5e7eb'}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  width: '48px',
                  height: '48px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isInWishlist ? '#fef2f2' : '#f9fafb'
                  e.target.style.borderColor = isInWishlist ? '#dc2626' : '#d1d5db'
                  e.target.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = isInWishlist ? '#dc2626' : '#e5e7eb'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                <span style={{ 
                  fontSize: '24px',
                  color: isInWishlist ? '#dc2626' : '#6b7280'
                }}>
                  {isInWishlist ? '❤️' : '🤍'}
                </span>
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ 
                      color: i < Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb', 
                      fontSize: '20px' 
                    }}>
                      ★
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '16px', color: '#64748b' }}>
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Farmer: <strong>{product.farmer}</strong> • {product.location}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                fontSize: '16px', 
                color: '#374151', 
                lineHeight: '1.6',
                margin: '0 0 16px'
              }}>
                {product.description}
              </p>
            </div>

            {/* Price Section */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#64748b', 
                    textDecoration: 'line-through',
                    marginBottom: '4px'
                  }}>
                    MRP: ₹{mrp.toLocaleString('en-IN')}
                  </div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: '#059669'
                  }}>
                    ₹{priceValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {discountPct}% OFF
                </div>
              </div>
              
              {priceValue > 500 && (
                <div style={{ 
                  color: '#059669', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🚚 Free Delivery Available
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                >
                  -
                </button>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  minWidth: '40px', 
                  textAlign: 'center' 
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  background: 'transparent',
                  color: '#059669',
                  border: '2px solid #059669',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ecfdf5'
                  e.target.style.borderColor = '#047857'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = '#059669'
                }}
              >
                Add to Cart
              </button>
            </div>

            {/* Features */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#0f172a', 
                marginBottom: '12px' 
              }}>
                Key Features
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {product.features.map((feature, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#f0fdf4',
                      color: '#166534',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* SI Score */}
            <div style={{ 
              background: '#fef3c7', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #fbbf24'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#92400e',
                marginBottom: '4px'
              }}>
                Sustainability Index Score
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '800', 
                color: '#92400e'
              }}>
                {product.si}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#92400e'
              }}>
                High quality, sustainable farming practices
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginTop: '24px'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#0f172a', 
            marginBottom: '24px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '12px'
          }}>
            Product Specifications
          </h3>
          
          {/* General Information */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '16px',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              General Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Brand
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  Organic Farm
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Category
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  {product.category}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Farmer
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  {product.farmer}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Location
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  {product.location}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '16px',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              Product Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <div key={key} style={{ 
                  display: 'flex', 
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'transparent'
                }}>
                  <span style={{ 
                    color: '#6b7280', 
                    fontWeight: '500', 
                    minWidth: '140px',
                    fontSize: '14px'
                  }}>
                    {key}
                  </span>
                  <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality & Certification */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '16px',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              Quality & Certification
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Organic Certified
                </span>
                <span style={{ color: '#059669', fontWeight: '600', fontSize: '14px' }}>
                  ✓ Yes
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Pesticide Free
                </span>
                <span style={{ color: '#059669', fontWeight: '600', fontSize: '14px' }}>
                  ✓ Yes
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Quality Grade
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  Premium
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Sustainability Score
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  {product.si}/1000
                </span>
              </div>
            </div>
          </div>

          {/* Shipping & Delivery */}
          <div>
            <h4 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '16px',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              Shipping & Delivery
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Delivery Time
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  2-3 Business Days
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Shipping Charges
                </span>
                <span style={{ color: priceValue > 500 ? '#059669' : '#111827', fontWeight: '600', fontSize: '14px' }}>
                  {priceValue > 500 ? 'Free' : '₹50'}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Return Policy
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  7 Days Return
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ 
                  color: '#6b7280', 
                  fontWeight: '500', 
                  minWidth: '140px',
                  fontSize: '14px'
                }}>
                  Warranty
                </span>
                <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                  Quality Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginTop: '24px'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#0f172a', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>✨</span>
          </h3>
          <p style={{ 
            color: '#64748b', 
            fontSize: '16px', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            You might also like these products from our marketplace
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '32px', 
            justifyContent: 'center' 
          }}>
            {products
              .filter(p => p.id !== product.id && (p.category === product.category || Math.random() > 0.5))
              .slice(0, 3)
              .map(recommendedProduct => {
                const recPriceValue = parseInt(recommendedProduct.price.replace(/[^\d]/g, ''))
                const recMrp = Math.round(recPriceValue * 1.3)
                const recDiscountPct = Math.round(((recMrp - recPriceValue) / recMrp) * 100)
                
                return (
                  <div
                    key={recommendedProduct.id}
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
                    onClick={() => navigate(`/product/${recommendedProduct.id}`)}
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
                    {/* Badge */}
                    <div className="badge" style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'linear-gradient(to right, #a90329 0%, #c44848 44%, #aa2238 100%)',
                      color: '#fff',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      borderRadius: '10px',
                      zIndex: 10
                    }}>
                      HOT SALE
                    </div>
                    
                    {/* Image */}
                    <div className="img" style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                      <img src={recommendedProduct.image} alt={recommendedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {/* Free Delivery Badge at left lower corner */}
                      {recPriceValue > 500 && (
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
                      <div className="title" style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: '0 0 10px', letterSpacing: '-.5px' }}>
                        {recommendedProduct.name}
                      </div>
                      <div className="desc" style={{ fontSize: 13, color: '#52525B', lineHeight: 1.4, marginBottom: 12 }}>
                        {recommendedProduct.description}
                      </div>
                      <div className="feats" style={{ display: 'flex', gap: 6, marginBottom: 15 }}>
                        <span className="feat" style={{ fontSize: 10, background: '#F4F4F5', color: '#71717A', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>4K Display</span>
                        <span className="feat" style={{ fontSize: 10, background: '#F4F4F5', color: '#71717A', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>16-Hour Battery</span>
                        <span className="feat" style={{ fontSize: 10, background: '#F4F4F5', color: '#71717A', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>Thunderbolt 4</span>
                      </div>
                      <div className="bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div className="price" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="old" style={{ fontSize: 13, textDecoration: 'line-through', color: '#A1A1AA', marginBottom: 2 }}>
                            ₹{recMrp.toLocaleString('en-IN')}
                          </span>
                          <span className="new" style={{ fontSize: 20, fontWeight: 700, color: '#18181B' }}>
                            ₹{recPriceValue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button 
                          className="btn" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCartRecommended(recommendedProduct)
                          }}
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
                        >
                          <span className="icon" style={{ marginRight: 4 }}>🛒</span> Add to Cart
                        </button>
                      </div>
                      <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F4F4F5', paddingTop: 12 }}>
                        <div className="rating" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} style={{ color: i < Math.floor(recommendedProduct.rating) ? '#fbbf24' : '#e5e7eb', fontSize: 16 }}>★</span>
                          ))}
                          <span className="rcount" style={{ marginLeft: 6, fontSize: 11, color: '#71717A' }}>{recommendedProduct.reviews} Reviews</span>
                        </div>
                        <span className="stock" style={{ fontSize: 11, fontWeight: 600, color: '#22C55E' }}>In Stock</span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
          
          {/* View All Products Button */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button
              onClick={() => navigate('/marketplace')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#059669',
                border: '2px solid #059669',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ecfdf5'
                e.target.style.borderColor = '#047857'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.borderColor = '#059669'
              }}
            >
              View All Products →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
