import { useState, useEffect } from 'react'
import { me, uploadProfilePhoto } from '../api'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        const userData = await me(token)
        setUser(userData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handlePhotoChange = async (e) => {
    try {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const token = localStorage.getItem('token')
      setUploading(true)
      const res = await uploadProfilePhoto({ token, file })
      // refresh profile
      const updated = await me(token)
      setUser(updated)
      setUploading(false)
    } catch (err) {
      setError(err.message)
      setUploading(false)
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'farmer': return 'Farmer'
      case 'dairy': return 'Dairy Farmer'
      case 'msme': return 'MSME'
      default: return role
    }
  }

  const getSIScoreColor = (score) => {
    if (score >= 800) return '#10b981' // green
    if (score >= 600) return '#f59e0b' // yellow
    if (score >= 400) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getSIScoreLabel = (score) => {
    if (score >= 800) return 'Excellent'
    if (score >= 600) return 'Good'
    if (score >= 400) return 'Fair'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">
            <p>Error loading profile: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">
            <p>No user data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profilePhotoPath ? (
              <img src={`/uploads/${user.profilePhotoPath}`} alt={user.username} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar-circle">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.username}</h2>
            <p className="profile-role">{getRoleDisplayName(user.role)}</p>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 6 }}>Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} />
        </div>

        <div className="profile-stats">
          <div className="stat-card si-score">
            <div className="stat-header">
              <h3>SI Score</h3>
              <div 
                className="score-badge"
                style={{ backgroundColor: getSIScoreColor(user.siScore) }}
              >
                {getSIScoreLabel(user.siScore)}
              </div>
            </div>
            <div className="stat-value">
              <span className="score-number">{user.siScore}</span>
              <span className="score-max">/ 1000</span>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ 
                  width: `${(user.siScore / 1000) * 100}%`,
                  backgroundColor: getSIScoreColor(user.siScore)
                }}
              ></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>Account Details</h3>
            </div>
            <div className="stat-details">
              <div className="detail-item">
                <span className="detail-label">Member Since:</span>
                <span className="detail-value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {user.agristackId && (
                <div className="detail-item">
                  <span className="detail-label">Agristack ID:</span>
                  <span className="detail-value">{user.agristackId}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-active">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="button secondary">
            Edit Profile
          </button>
          <button className="button secondary">
            View Activity
          </button>
          <button 
            className="button danger"
            onClick={() => {
              localStorage.clear()
              window.location.href = '/'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
