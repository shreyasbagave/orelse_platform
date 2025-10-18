import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderBar from '../../components/HeaderBar.jsx'
import './Checkout.css'

export default function Checkout() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [orderProcessing, setOrderProcessing] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        if (cart.length === 0) {
          navigate('/cart')
          return
        }
        setCartItems(cart)
      } catch (error) {
        console.error('Error loading cart:', error)
        navigate('/cart')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [navigate])

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

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode']
    return required.every(field => shippingInfo[field].trim() !== '')
  }

  const validatePaymentInfo = () => {
    if (paymentMethod === 'card') {
      return cardDetails.cardNumber.length >= 16 && 
             cardDetails.expiryDate.length >= 5 && 
             cardDetails.cvv.length >= 3 && 
             cardDetails.cardName.trim() !== ''
    }
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateShippingInfo()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validatePaymentInfo()) {
      setCurrentStep(3)
    }
  }

  const handlePlaceOrder = async () => {
    setOrderProcessing(true)
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create order
    const order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: cartItems,
      shippingInfo,
      paymentMethod,
      subtotal: calculateSubtotal(),
      shipping: calculateShipping(),
      total: calculateTotal(),
      status: 'confirmed',
      notes: orderNotes
    }

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.unshift(order)
    localStorage.setItem('orders', JSON.stringify(orders))

    // Clear cart
    localStorage.removeItem('cart')

    // Navigate to order confirmation
    navigate(`/order-confirmation/${order.id}`)
  }

  const steps = [
    { number: 1, title: 'Shipping Information', description: 'Enter your delivery details' },
    { number: 2, title: 'Payment Method', description: 'Choose your payment option' },
    { number: 3, title: 'Review & Place Order', description: 'Review your order and confirm' }
  ]

  if (loading) {
    return (
      <div className="checkout-container">
        <HeaderBar />
        <div className="checkout-loading">
          <div className="checkout-loading-text">Loading checkout...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <HeaderBar />
      
      {/* Subheading Bar */}
      <div className="checkout-subheading-bar">
        <div className="checkout-subheading-content">
          <div className="checkout-subheading-inner">
            {/* Left side - Back button and breadcrumb */}
            <div className="checkout-left-section">
              <button
                onClick={() => navigate('/cart')}
                className="checkout-back-button"
              >
                ← Cart
              </button>
              
              {/* Breadcrumb */}
              <div className="checkout-breadcrumb">
                <span>Dashboard</span>
                <span>›</span>
                <span>Marketplace</span>
                <span>›</span>
                <span>Cart</span>
                <span>›</span>
                <span className="checkout-breadcrumb-current">Checkout</span>
              </div>
            </div>

            {/* Right side - Cart and actions */}
            <div className="checkout-right-section">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="checkout-wishlist-button"
              >
                <span className="checkout-wishlist-icon">
                  ❤️
                </span>
                Wishlist
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="checkout-cart-button"
              >
                <span style={{ fontSize: '16px' }}>🛒</span>
                Cart
                <span className="checkout-cart-badge">
                  {cartItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="checkout-main-content">
        {/* Header */}
        <div className="checkout-header">
          <div className="checkout-header-top">
            <span className="checkout-header-icon">💳</span>
            <h1 className="checkout-header-title">
              Checkout
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="checkout-progress-steps">
            {steps.map((step, index) => (
              <div key={step.number} className="checkout-step">
                <div className="checkout-step-content">
                  <div className={`checkout-step-number ${currentStep >= step.number ? 'checkout-step-number-active' : 'checkout-step-number-inactive'}`}>
                    {step.number}
                  </div>
                  <div className="checkout-step-info">
                    <div className={`checkout-step-title ${currentStep >= step.number ? 'checkout-step-title-active' : 'checkout-step-title-inactive'}`}>
                      {step.title}
                    </div>
                    <div className="checkout-step-description">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`checkout-step-connector ${currentStep > step.number ? 'checkout-step-connector-active' : 'checkout-step-connector-inactive'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Checkout Form */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px' }}>
                  Shipping Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Address *
                  </label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    placeholder="Enter complete address"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px' }}>
                  Payment Method
                </h2>
                
                {/* Payment Options */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>💳 Credit/Debit Card</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>📱 UPI Payment</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>💰 Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }}>
                      Card Details
                    </h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4)
                            }
                            handleCardInputChange('expiryDate', value)
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardName}
                        onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Enter cardholder name"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                      UPI Payment
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      You will be redirected to your UPI app to complete the payment
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div style={{ 
                    background: '#fef3c7', 
                    border: '1px solid #fbbf24', 
                    borderRadius: '8px', 
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                      Cash on Delivery
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Pay when your order is delivered
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Place Order */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px' }}>
                  Review Your Order
                </h2>
                
                {/* Order Items */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }}>
                    Order Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cartItems.map(item => {
                      const price = parseInt(item.price.replace(/[^\d]/g, ''))
                      return (
                        <div key={item.id} style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '6px', 
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            <img 
                              src={item.image} 
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                              Quantity: {item.quantity}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                              ₹{(price * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Shipping Information Review */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }}>
                    Shipping Address
                  </h3>
                  <div style={{ 
                    background: '#f9fafb', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                      {shippingInfo.address}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                      {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {shippingInfo.country}
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                style={{
                  padding: '12px 24px',
                  background: currentStep === 1 ? '#f3f4f6' : '#6b7280',
                  color: currentStep === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  style={{
                    padding: '12px 24px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={orderProcessing}
                  style={{
                    padding: '12px 24px',
                    background: orderProcessing ? '#9ca3af' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: orderProcessing ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {orderProcessing ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #fff', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '24px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Subtotal</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Shipping</span>
                <span style={{ fontWeight: '600', fontSize: '14px', color: calculateShipping() === 0 ? '#059669' : '#0f172a' }}>
                  {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}
                </span>
              </div>
              <div style={{ 
                height: '1px', 
                background: '#e5e7eb', 
                margin: '8px 0' 
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Total</span>
                <span style={{ color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            {calculateSubtotal() > 500 && (
              <div style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#059669', fontSize: '14px', fontWeight: '600' }}>
                  🚚 You qualify for free shipping!
                </div>
              </div>
            )}

            <div style={{ 
              background: '#f9fafb', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '16px',
              fontSize: '12px',
              color: '#64748b',
              lineHeight: '1.4'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Secure Checkout</div>
              <div>• SSL encrypted payment processing</div>
              <div>• Your payment information is secure</div>
              <div>• 7-day return policy</div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
