import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderBar from '../../components/HeaderBar.jsx'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    // Load order from localStorage
    const loadOrder = () => {
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        const foundOrder = orders.find(o => o.id === orderId)
        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          navigate('/marketplace')
        }
      } catch (error) {
        console.error('Error loading order:', error)
        navigate('/marketplace')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, navigate])

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

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <HeaderBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Loading order details...</div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <HeaderBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Order not found</div>
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
                <span style={{ color: '#111827', fontWeight: '500' }}>Order Confirmation</span>
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
        {/* Success Message */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: '#059669', 
            margin: '0 0 12px'
          }}>
            Order Confirmed!
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '16px', 
            margin: '0 0 24px',
            lineHeight: '1.5'
          }}>
            Thank you for your order. We've received your order and will process it shortly.
          </p>
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
              Order ID: #{order.id}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Order Date: {new Date(order.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
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
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/orders')}
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
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              View Orders
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Order Details */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px' }}>
              Order Details
            </h2>
            
            {/* Order Items */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }}>
                Items Ordered
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items.map(item => {
                  const price = parseInt(item.price.replace(/[^\d]/g, ''))
                  return (
                    <div key={item.id} style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '8px', 
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
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                          {item.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Quantity: {item.quantity}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                            ₹{(price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Information */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }}>
                Shipping Address
              </h3>
              <div style={{ 
                background: '#f9fafb', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '20px' 
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                  {order.shippingInfo.address}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                  {order.shippingInfo.city}, {order.shippingInfo.state} - {order.shippingInfo.pincode}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  {order.shippingInfo.country}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  📧 {order.shippingInfo.email}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  📱 {order.shippingInfo.phone}
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }}>
                  Order Notes
                </h3>
                <div style={{ 
                  background: '#f9fafb', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '16px',
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  {order.notes}
                </div>
              </div>
            )}
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
                <span style={{ fontWeight: '600', fontSize: '14px' }}>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Shipping</span>
                <span style={{ fontWeight: '600', fontSize: '14px', color: order.shipping === 0 ? '#059669' : '#0f172a' }}>
                  {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}
                </span>
              </div>
              <div style={{ 
                height: '1px', 
                background: '#e5e7eb', 
                margin: '8px 0' 
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Total</span>
                <span style={{ color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 12px' }}>
                Payment Method
              </h3>
              <div style={{ 
                background: '#f9fafb', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {order.paymentMethod === 'card' ? '💳' : order.paymentMethod === 'upi' ? '📱' : '💰'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                Order Status
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {order.status === 'confirmed' ? '✅ Confirmed' : order.status}
              </div>
            </div>

            {/* Delivery Timeline */}
            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #fbbf24', 
              borderRadius: '8px', 
              padding: '16px',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                Expected Delivery
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                2-3 Business Days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
