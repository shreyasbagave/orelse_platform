// API configuration
const API_BASE_URL = 'http://localhost:4000/api'

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }
    
    return data
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Username/Password Authentication
export async function loginWithCredentials({ username, password }) {
  return await apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

// Agristack ID Authentication
export async function loginWithAgristack({ agristackId }) {
  return await apiCall('/login/agristack', {
    method: 'POST',
    body: JSON.stringify({ agristackId })
  })
}

// Magic Link Authentication
export async function loginWithMagicLink({ email, verify = false, magicToken }) {
  return await apiCall('/login/magiclink', {
    method: 'POST',
    body: JSON.stringify({ email, verify, magicToken })
  })
}

// Aadhaar eKYC Authentication
export async function loginWithAadhaar({ aadhaarNumber, otp }) {
  return await apiCall('/login/aadhaar', {
    method: 'POST',
    body: JSON.stringify({ aadhaarNumber, otp })
  })
}

// Signup function
export async function signup({ username, email, password, role, agristackId, aadhaarNumber, phoneNumber }) {
  return await apiCall('/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, role, agristackId, aadhaarNumber, phoneNumber })
  })
}

// Get current user profile
export async function me(token) {
  return await apiCall('/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// Wishlist API
export async function getWishlist(token) {
  return await apiCall('/wishlist', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export async function toggleWishlist({ token, product }) {
  return await apiCall('/wishlist/toggle', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(product)
  })
}

// Cart API
export async function getCart(token) {
  return await apiCall('/cart', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

export async function addToCart({ token, product }) {
  return await apiCall('/cart/add', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(product)
  })
}

export async function updateCartItem({ token, id, quantity }) {
  return await apiCall('/cart/update', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ id, quantity })
  })
}

export async function removeFromCart({ token, id }) {
  return await apiCall('/cart/remove', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ id })
  })
}

// Legacy function for backward compatibility
export async function login({ username, password }) {
  return loginWithCredentials({ username, password })
}

// Submit farm onboarding (multipart)
export async function submitOnboarding({ token, formData }) {
  const url = `${API_BASE_URL}/onboarding`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: fetch sets multipart boundary automatically; don't set Content-Type
    },
    body: formData
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to submit onboarding')
  return data
}

export async function getMyOnboarding(token) {
  return await apiCall('/onboarding/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// Upload user profile photo
export async function uploadProfilePhoto({ token, file }) {
  const url = `${API_BASE_URL}/profile/photo`
  const form = new FormData()
  form.append('photo', file)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to upload photo')
  return data
}

// Farms API
export async function createFarm({ token, farm, files }) {
  // If files present, send multipart; else JSON
  if (files && (files.landRecord || (files.geotagPhotos && files.geotagPhotos.length))) {
    const form = new FormData()
    Object.entries(farm || {}).forEach(([k, v]) => form.append(k, v ?? ''))
    if (files.landRecord) form.append('landRecord', files.landRecord)
    ;(files.geotagPhotos || []).forEach(f => form.append('geotagPhotos', f))
    const res = await fetch(`${API_BASE_URL}/farms`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create farm')
    return data
  }
  return await apiCall('/farms', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(farm)
  })
}

export async function listFarms(token) {
  return await apiCall('/farms', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}
