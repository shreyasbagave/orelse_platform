import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'
import { loginWithCredentials, loginWithAgristack, loginWithMagicLink, loginWithAadhaar, signup } from './api'

export default function App() {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [activeTab, setActiveTab] = useState('credentials')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agristackId, setAgristackId] = useState('')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // Magic Link state
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicToken, setMagicToken] = useState('')
  
  // Aadhaar eKYC state
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignup && !role) {
      setError('Please select a role to continue')
      return
    }
    setError('')
    setLoading(true)

    try {
      let data
      
      if (isSignup) {
        // Validate signup form
        if (!username || !email || !password || !confirmPassword) {
          throw new Error('All fields are required')
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        
        data = await signup({
          username,
          email,
          password,
          role,
          agristackId: agristackId || undefined,
          aadhaarNumber: aadhaarNumber || undefined,
          phoneNumber: phoneNumber || undefined
        })
      } else {
        // Login based on active tab
        switch (activeTab) {
          case 'credentials':
            if (!username || !password) {
              throw new Error('Username and password are required')
            }
            data = await loginWithCredentials({ username, password })
            break
            
          case 'agristack':
            if (!agristackId) {
              throw new Error('Agristack ID is required')
            }
            data = await loginWithAgristack({ agristackId })
            break
            
          case 'magiclink':
            if (!email) {
              throw new Error('Email is required')
            }
            if (!magicLinkSent) {
              const response = await loginWithMagicLink({ email })
              setMagicLinkSent(true)
              setMagicToken(response.magicToken)
              setLoading(false)
              return
            } else {
              data = await loginWithMagicLink({ email, verify: true, magicToken })
            }
            break
            
          case 'aadhaar':
            if (!aadhaarNumber) {
              throw new Error('Aadhaar number is required')
            }
            if (!otpSent) {
              await loginWithAadhaar({ aadhaarNumber })
              setOtpSent(true)
              setLoading(false)
              return
            } else {
              if (!otp) {
                throw new Error('OTP is required')
              }
              data = await loginWithAadhaar({ aadhaarNumber, otp })
            }
            break
            
          default:
            throw new Error('Invalid authentication method')
        }
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('userRole', data.role)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('loginMethod', data.method || activeTab)
      
      if (data.role === 'farmer') navigate('/dashboard/farmer')
      else if (data.role === 'dairy') navigate('/dashboard/dairy')
      else if (data.role === 'msme') navigate('/dashboard/msme')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setError('')
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setAgristackId('')
    setAadhaarNumber('')
    setPhoneNumber('')
    setMagicLinkSent(false)
    setMagicToken('')
    setOtpSent(false)
    setOtp('')
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    resetForm()
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    resetForm()
  }

  return (
    <div className="app-container">
      <div className="login-card">
        <h1 className="login-title">
          {isSignup ? 'AgriStack Signup' : 'AgriStack Login'}
        </h1>
        
        {/* Toggle between Login and Signup */}
        <div className="mode-toggle">
          <button 
            className={`toggle-btn ${!isSignup ? 'active' : ''}`}
            onClick={() => !isSignup || toggleMode()}
          >
            Login
          </button>
          <button 
            className={`toggle-btn ${isSignup ? 'active' : ''}`}
            onClick={() => isSignup || toggleMode()}
          >
            Signup
          </button>
        </div>

        {/* Authentication Method Tabs (only for login) */}
        {!isSignup && (
          <div className="tab-container">
            <button 
              className={`tab ${activeTab === 'credentials' ? 'active' : ''}`}
              onClick={() => handleTabChange('credentials')}
            >
              Username/Password
            </button>
            <button 
              className={`tab ${activeTab === 'agristack' ? 'active' : ''}`}
              onClick={() => handleTabChange('agristack')}
            >
              Agristack ID
            </button>
            <button 
              className={`tab ${activeTab === 'magiclink' ? 'active' : ''}`}
              onClick={() => handleTabChange('magiclink')}
            >
              Magic Link
            </button>
            <button 
              className={`tab ${activeTab === 'aadhaar' ? 'active' : ''}`}
              onClick={() => handleTabChange('aadhaar')}
            >
              Aadhaar eKYC
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection (only for signup) */}
          {isSignup && (
            <div className="form-group">
              <label className="label" htmlFor="role">Role</label>
              <select
                id="role"
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="" disabled>Select role</option>
                <option value="farmer">Farmer</option>
                <option value="dairy">Dairy Farmer</option>
                <option value="msme">MSME</option>
              </select>
            </div>
          )}

          {/* Username/Password Login */}
          {(!isSignup && activeTab === 'credentials') && (
            <>
              <div className="form-group">
                <label className="label" htmlFor="username">Username/Email</label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </>
          )}

          {/* Agristack ID Login */}
          {(!isSignup && activeTab === 'agristack') && (
            <div className="form-group">
              <label className="label" htmlFor="agristackId">Agristack ID</label>
              <input
                id="agristackId"
                className="input"
                type="text"
                placeholder="Enter your Agristack ID"
                value={agristackId}
                onChange={(e) => setAgristackId(e.target.value)}
                required
              />
              <p className="helper-text">Use your registered Agristack ID for authentication</p>
            </div>
          )}

          {/* Magic Link Login */}
          {(!isSignup && activeTab === 'magiclink') && (
            <div className="form-group">
              <label className="label" htmlFor="email">Email Address</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              {magicLinkSent && (
                <div className="success-message">
                  <p>Magic link sent to your email! Check your inbox and click the link to login.</p>
                  <p className="helper-text">You can also click "Login" again to verify.</p>
                </div>
              )}
            </div>
          )}

          {/* Aadhaar eKYC Login */}
          {(!isSignup && activeTab === 'aadhaar') && (
            <>
              <div className="form-group">
                <label className="label" htmlFor="aadhaarNumber">Aadhaar Number</label>
                <input
                  id="aadhaarNumber"
                  className="input"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength="12"
                  required
                />
                {otpSent && (
                  <div className="form-group">
                    <label className="label" htmlFor="otp">OTP</label>
                    <input
                      id="otp"
                      className="input"
                      type="text"
                      placeholder="Enter OTP sent to your registered mobile"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                      required
                    />
                    <p className="helper-text">OTP sent to your registered mobile number</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Signup Form Fields */}
          {isSignup && (
            <>
              <div className="form-group">
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  className="input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="agristackId">Agristack ID (Optional)</label>
                <input
                  id="agristackId"
                  className="input"
                  type="text"
                  placeholder="Enter your Agristack ID"
                  value={agristackId}
                  onChange={(e) => setAgristackId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="aadhaarNumber">Aadhaar Number (Optional)</label>
                <input
                  id="aadhaarNumber"
                  className="input"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength="12"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="phoneNumber">Phone Number (Optional)</label>
                <input
                  id="phoneNumber"
                  className="input"
                  type="text"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength="10"
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="actions">
            <button 
              className="button primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 
               (activeTab === 'magiclink' && magicLinkSent) ? 'Verify Login' :
               (activeTab === 'aadhaar' && otpSent) ? 'Verify OTP' :
               (activeTab === 'magiclink') ? 'Send Magic Link' :
               (activeTab === 'aadhaar') ? 'Send OTP' : 
               (isSignup ? 'Sign Up' : 'Login')}
            </button>
          </div>
        </form>

        <p className="helper">
          {isSignup 
            ? 'Create your AgriStack account to get started' 
            : 'Login to your AgriStack account using any of the available methods'
          }
        </p>
      </div>
    </div>
  )
}
