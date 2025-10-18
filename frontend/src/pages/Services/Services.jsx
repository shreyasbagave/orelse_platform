import React from 'react'
import HeaderBar from '../../components/HeaderBar.jsx'
import './Services.css'

export default function Services() {
  return (
    <div className="services-container">
      <HeaderBar />
      <div className="services-content">
        <div className="services-back-button-container">
          <button
            onClick={() => window.history.back()}
            className="services-back-button"
          >
            ← Back
          </button>
        </div>
        <div className="services-card">
          <h1 className="services-title">Services</h1>
          <p className="services-description">Choose a service to continue</p>
          <div className="services-grid">
            <a href="/services/advisory" className="services-link">
              <div className="services-service-card services-service-card-advisory">
                <div className="services-service-title">Smart Advisory</div>
                <div className="services-service-description services-service-description-advisory">Personalized recommendations for crop health and yield</div>
              </div>
            </a>
            <a href="/services/disease-detection" className="services-link">
              <div className="services-service-card services-service-card-disease">
                <div className="services-service-title">Disease Detection</div>
                <div className="services-service-description services-service-description-disease">Detect crop diseases using images and receive treatment tips</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


