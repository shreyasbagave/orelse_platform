import React, { useState, useEffect } from 'react'
import { me } from '../api'
import './HeaderBar.css'

export default function HeaderBar() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const profile = await me(token)
        setUser(profile)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <div className="header-container">
      <div className="header-content">
        <div className="header-inner">
          {/* Logo */}
          <div className="header-logo">
            <div className="header-logo-icon">
              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <div className="header-logo-text">
              <h1 className="header-title">
                AgriMarketplace
              </h1>
              <p className="header-subtitle">Farmer Dashboard</p>
            </div>
          </div>

          {/* Right controls: Marketplace button + Profile */}
          <div className="header-actions">
            <button
              onClick={() => { window.location.href = '/services' }}
              className="header-button header-button-service"
            >
              <span>🧩</span> Service
            </button>
            <button
              onClick={() => { window.location.href = '/marketplace' }}
              className="header-button header-button-marketplace"
            >
              <span>🛒</span> Marketplace
            </button>
            <div className="header-profile">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="header-profile-button"
              >
                <div
                  className="header-profile-avatar"
                  style={{
                    backgroundColor: user && user.profilePhotoPath ? 'transparent' : '#dbeafe'
                  }}
                >
                  {user && user.profilePhotoPath ? (
                    <img src={`/uploads/${user.profilePhotoPath}`} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user && user.username ? user.username.charAt(0) : '?').toUpperCase()
                  )}
                </div>
                <div className="header-profile-info">
                  <p className="header-profile-name">
                    {loadingUser ? 'Loading...' : (user && user.username) ? user.username : 'Unknown'}
                  </p>
                  <p className="header-profile-role">
                    {loadingUser ? '' : (user && user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : '')}
                  </p>
                </div>
                <svg className={`header-profile-arrow ${showProfileDropdown ? 'open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="header-dropdown">
                  <div className="header-dropdown-content">
                    <p className="header-dropdown-name">
                      {(user && user.username) ? user.username : 'Unknown'}
                    </p>
                    <p className="header-dropdown-email">
                      {(user && user.email) ? user.email : ''}
                    </p>
                    <div className="header-dropdown-score">
                      <span className="header-dropdown-score-label">
                        ⭐ SI Score:
                      </span>
                      <span className="header-dropdown-score-value">
                        {user && typeof user.siScore === 'number' ? user.siScore : '—'}
                      </span>
                    </div>
                    <button
                      onClick={() => { window.location.href = '/onboarding/farm' }}
                      className="header-dropdown-button header-dropdown-button-secondary"
                    >
                      🌱 Farm Onboarding
                    </button>
                    <button
                      onClick={handleLogout}
                      className="header-dropdown-button header-dropdown-button-danger"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


