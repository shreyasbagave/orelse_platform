import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import App from './App.jsx'
import Marketplace from './components/Marketplace.jsx'
import ProductDetails from './pages/ProductDetails/ProductDetails.jsx'
import Wishlist from './pages/Wishlist/Wishlist.jsx'
import Cart from './pages/Cart/Cart.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation.jsx'
import FarmOnboarding from './pages/FarmOnboarding/FarmOnboarding.jsx'
import Services from './pages/Services/Services.jsx'
import ServicesDiseaseDetection from './pages/ServicesDiseaseDetection/ServicesDiseaseDetection.jsx'
import FarmerDashboard from './pages/FarmerDashboard/FarmerDashboard.jsx'
import DairyDashboard from './pages/DairyDashboard/DairyDashboard.jsx'
import MSMEDashboard from './pages/MSMEDashboard/MSMEDashboard.jsx'
import './index.css'
import './App.css'

// Use page-based dashboards from src/pages

function useAuthGuard() {
  const navigate = useNavigate()
  const location = useLocation()
  React.useEffect(() => {
    const token = localStorage.getItem('token')
    const onDashboard = location.pathname.startsWith('/dashboard')
    if (onDashboard && !token) navigate('/')
  }, [navigate, location])
}

function Guarded({ children }) {
  useAuthGuard()
  return children
}

const rootElement = document.getElementById('root')
createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard/farmer" element={<Guarded><FarmerDashboard /></Guarded>} />
        <Route path="/dashboard/dairy" element={<Guarded><DairyDashboard /></Guarded>} />
        <Route path="/dashboard/msme" element={<Guarded><MSMEDashboard /></Guarded>} />
        <Route path="/marketplace" element={<Guarded><Marketplace /></Guarded>} />
        <Route path="/product/:productId" element={<Guarded><ProductDetails /></Guarded>} />
        <Route path="/wishlist" element={<Guarded><Wishlist /></Guarded>} />
        <Route path="/cart" element={<Guarded><Cart /></Guarded>} />
        <Route path="/checkout" element={<Guarded><Checkout /></Guarded>} />
        <Route path="/order-confirmation/:orderId" element={<Guarded><OrderConfirmation /></Guarded>} />
        <Route path="/services" element={<Guarded><Services /></Guarded>} />
        <Route path="/services/disease-detection" element={<Guarded><ServicesDiseaseDetection /></Guarded>} />
        <Route path="/onboarding/farm" element={<Guarded><FarmOnboarding /></Guarded>} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
