const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const path = require('path')
const mongoose = require('mongoose')
require('dotenv').config()

const User = require('./models/User')
const Onboarding = require('./models/Onboarding')
const Farm = require('./models/Farm')
const fs = require('fs')
const os = require('os')
const multer = require('multer')

const app = express()
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port
    if (origin.match(/^http:\/\/localhost:\d+$/) || 
        origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow specific origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// CORS middleware for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow localhost on any port
  if (origin && (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


const JWT_SECRET = process.env.JWT_SECRET || 'agristack-super-secret-jwt-key-2024'

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shreyashb_db_user:8njtKGW4ea858oBb@cluster0.yd4zogv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err))

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, role, agristackId, aadhaarNumber, phoneNumber } = req.body

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Username, email, password, and role are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email },
        ...(agristackId ? [{ agristackId }] : []),
        ...(aadhaarNumber ? [{ aadhaarNumber }] : [])
      ]
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' })
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already exists' })
      }
      if (existingUser.agristackId === agristackId) {
        return res.status(400).json({ error: 'Agristack ID already exists' })
      }
      if (existingUser.aadhaarNumber === aadhaarNumber) {
        return res.status(400).json({ error: 'Aadhaar number already exists' })
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      agristackId,
      aadhaarNumber,
      phoneNumber
    })

    await user.save()

    // Generate token
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        agristackId: user.agristackId
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: errors.join(', ') })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Username/Password Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      method: 'credentials',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        agristackId: user.agristackId
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Agristack ID Login endpoint
app.post('/api/login/agristack', async (req, res) => {
  try {
    const { agristackId } = req.body || {}
    
    if (!agristackId) {
      return res.status(400).json({ error: 'Agristack ID is required' })
    }

    // Find user by Agristack ID
    const user = await User.findOne({ agristackId })

    if (!user) {
      return res.status(401).json({ error: 'Invalid Agristack ID' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    // Generate token
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: 'Agristack ID authentication successful',
      token,
      role: user.role,
      method: 'agristack',
      agristackId: user.agristackId,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        agristackId: user.agristackId
      }
    })
  } catch (error) {
    console.error('Agristack login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Magic Link Login endpoint
app.post('/api/login/magiclink', async (req, res) => {
  try {
    const { email, verify = false, magicToken } = req.body || {}
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!verify) {
      // Send magic link (mock implementation)
      // In production, you would send an actual email with a magic link
      const magicToken = jwt.sign({ email, type: 'magiclink' }, JWT_SECRET, { expiresIn: '15m' })
      
      res.json({
        success: true,
        message: 'Magic link sent to your email address',
        email: email,
        magicToken: magicToken // In production, this would be sent via email
      })
    } else {
      // Verify magic link
      if (!magicToken) {
        return res.status(400).json({ error: 'Magic token is required for verification' })
      }

      try {
        const payload = jwt.verify(magicToken, JWT_SECRET)
        if (payload.type !== 'magiclink' || payload.email !== email) {
          return res.status(401).json({ error: 'Invalid magic link' })
        }

        // Find user by email
        const user = await User.findOne({ email })

        if (!user) {
          return res.status(401).json({ error: 'No account found with this email' })
        }

        // Check if user is active
        if (!user.isActive) {
          return res.status(401).json({ error: 'Account is deactivated' })
        }

        // Generate session token
        const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

        res.json({
          message: 'Magic link authentication successful',
          token,
          role: user.role,
          method: 'magiclink',
          email: user.email,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            agristackId: user.agristackId
          }
        })
      } catch (tokenError) {
        return res.status(401).json({ error: 'Invalid or expired magic link' })
      }
    }
  } catch (error) {
    console.error('Magic link error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Aadhaar eKYC Login endpoint
app.post('/api/login/aadhaar', async (req, res) => {
  try {
    const { aadhaarNumber, otp } = req.body || {}
    
    if (!aadhaarNumber) {
      return res.status(400).json({ error: 'Aadhaar number is required' })
    }

    if (!otp) {
      // Send OTP (mock implementation)
      // In production, you would integrate with UIDAI OTP service
      res.json({
        success: true,
        message: 'OTP sent to your registered mobile number',
        aadhaarNumber: aadhaarNumber
      })
    } else {
      // Verify OTP and authenticate
      if (!otp || otp.length !== 6) {
        return res.status(400).json({ error: 'OTP must be 6 digits' })
      }

      // Mock OTP validation (in production, verify with UIDAI)
      if (otp !== '123456') {
        return res.status(401).json({ error: 'Invalid OTP. Please try again.' })
      }

      // Find user by Aadhaar number
      const user = await User.findOne({ aadhaarNumber })

      if (!user) {
        return res.status(401).json({ error: 'No account found with this Aadhaar number' })
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' })
      }

      // Generate token
      const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

      res.json({
        message: 'Aadhaar eKYC authentication successful',
        token,
        role: user.role,
        method: 'aadhaar',
        aadhaarNumber: user.aadhaarNumber,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          agristackId: user.agristackId
        }
      })
    }
  } catch (error) {
    console.error('Aadhaar login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })
    
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.sub)
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      agristackId: user.agristackId,
      siScore: user.siScore,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Me endpoint error:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'AgriStack API Server is running!', status: 'healthy' })
})

// Migration endpoint to add SI score to existing users
app.post('/api/migrate-si-score', async (req, res) => {
  try {
    const result = await User.updateMany(
      { siScore: { $exists: false } },
      { $set: { siScore: 300 } }
    )
    
    res.json({
      message: 'SI score migration completed',
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Migration error:', error)
    res.status(500).json({ error: 'Migration failed' })
  }
})

const PORT = 4000
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))

// --- Onboarding upload storage ---
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, uniqueSuffix + '-' + safeName)
  }
})
const upload = multer({ storage })

function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Create or update onboarding
app.post('/api/onboarding', authMiddleware, upload.fields([
  { name: 'landRecord', maxCount: 1 },
  { name: 'geotagPhotos', maxCount: 6 }
]), async (req, res) => {
  try {
    const userId = req.user.sub
    const {
      phoneNumber,
      farmLocation,
      farmSizeAcres,
      primaryCrop,
      secondaryCrop,
      tertiaryCrop,
      soilType,
      irrigationType
    } = req.body

    const landRecordPath = req.files && req.files.landRecord ? req.files.landRecord[0].filename : undefined
    const geotagPhotoPaths = req.files && req.files.geotagPhotos ? req.files.geotagPhotos.map(f => f.filename) : []

    const existing = await Onboarding.findOne({ userId })
    if (existing) {
      if (landRecordPath) existing.landRecordPath = landRecordPath
      if (geotagPhotoPaths.length) existing.geotagPhotoPaths = geotagPhotoPaths
      existing.phoneNumber = phoneNumber
      existing.farmLocation = farmLocation
      existing.farmSizeAcres = farmSizeAcres
      existing.primaryCrop = primaryCrop
      existing.secondaryCrop = secondaryCrop
      existing.tertiaryCrop = tertiaryCrop
      existing.soilType = soilType
      existing.irrigationType = irrigationType
      await existing.save()
      return res.json({ success: true, onboarding: existing })
    }

    const onboarding = new Onboarding({
      userId,
      phoneNumber,
      farmLocation,
      farmSizeAcres,
      primaryCrop,
      secondaryCrop,
      tertiaryCrop,
      soilType,
      irrigationType,
      landRecordPath,
      geotagPhotoPaths
    })
    await onboarding.save()
    res.status(201).json({ success: true, onboarding })
  } catch (err) {
    console.error('Onboarding save error:', err)
    res.status(500).json({ error: 'Failed to save onboarding' })
  }
})

// Fetch current user's onboarding
app.get('/api/onboarding/me', authMiddleware, async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({ userId: req.user.sub })
    res.json({ onboarding })
  } catch (err) {
    console.error('Onboarding fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch onboarding' })
  }
})

// Upload user profile photo
app.post('/api/profile/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Photo file is required' })
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.profilePhotoPath = req.file.filename
    await user.save()
    res.json({ success: true, profilePhotoPath: user.profilePhotoPath })
  } catch (err) {
    console.error('Profile photo upload error:', err)
    res.status(500).json({ error: 'Failed to upload profile photo' })
  }
})

// Create a farm record
app.post('/api/farms', authMiddleware, upload.fields([
  { name: 'landRecord', maxCount: 1 },
  { name: 'geotagPhotos', maxCount: 6 }
]), async (req, res) => {
  try {
    const userId = req.user.sub
    const { location, sizeAcres, primaryCrop, secondaryCrop, tertiaryCrop, soilType, irrigationType } = req.body
    if (!location) return res.status(400).json({ error: 'location is required' })
    const landRecordPath = req.files && req.files.landRecord ? req.files.landRecord[0].filename : undefined
    const geotagPhotoPaths = req.files && req.files.geotagPhotos ? req.files.geotagPhotos.map(f => f.filename) : []
    const farm = new Farm({ userId, location, sizeAcres, primaryCrop, secondaryCrop, tertiaryCrop, soilType, irrigationType, landRecordPath, geotagPhotoPaths })
    await farm.save()
    res.status(201).json({ success: true, farm })
  } catch (err) {
    console.error('Create farm error:', err)
    res.status(500).json({ error: 'Failed to create farm' })
  }
})

// List current user's farms
app.get('/api/farms', authMiddleware, async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.sub }).sort({ createdAt: -1 })
    res.json({ farms })
  } catch (err) {
    console.error('List farms error:', err)
    res.status(500).json({ error: 'Failed to fetch farms' })
  }
})

// --- Wishlist & Cart Persistence ---
// Get wishlist
app.get('/api/wishlist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ wishlist: user.wishlist || [] })
  } catch (e) {
    console.error('Get wishlist error:', e)
    res.status(500).json({ error: 'Failed to fetch wishlist' })
  }
})

// Toggle wishlist item
app.post('/api/wishlist/toggle', authMiddleware, async (req, res) => {
  try {
    const { id, name, image, price, category } = req.body || {}
    if (typeof id !== 'number') return res.status(400).json({ error: 'Product id (number) is required' })
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const exists = (user.wishlist || []).some(p => p.id === id)
    if (exists) {
      user.wishlist = (user.wishlist || []).filter(p => p.id !== id)
    } else {
      user.wishlist = [...(user.wishlist || []), { id, name, image, price, category }]
    }
    await user.save()
    res.json({ wishlist: user.wishlist, inWishlist: !exists })
  } catch (e) {
    console.error('Toggle wishlist error:', e)
    res.status(500).json({ error: 'Failed to update wishlist' })
  }
})

// Get cart
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ cart: user.cart || [] })
  } catch (e) {
    console.error('Get cart error:', e)
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// Add to cart (or increment)
app.post('/api/cart/add', authMiddleware, async (req, res) => {
  try {
    const { id, name, image, price, category, quantity = 1 } = req.body || {}
    if (typeof id !== 'number') return res.status(400).json({ error: 'Product id (number) is required' })
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const cart = user.cart || []
    const idx = cart.findIndex(i => i.id === id)
    if (idx >= 0) {
      cart[idx].quantity = Math.max(1, (cart[idx].quantity || 1) + Number(quantity || 1))
    } else {
      cart.push({ id, name, image, price, category, quantity: Math.max(1, Number(quantity || 1)) })
    }
    user.cart = cart
    await user.save()
    res.json({ cart: user.cart })
  } catch (e) {
    console.error('Add to cart error:', e)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// Update cart item quantity
app.post('/api/cart/update', authMiddleware, async (req, res) => {
  try {
    const { id, quantity } = req.body || {}
    if (typeof id !== 'number' || typeof quantity !== 'number') return res.status(400).json({ error: 'id and quantity (number) are required' })
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const cart = (user.cart || []).map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)
    user.cart = cart
    await user.save()
    res.json({ cart: user.cart })
  } catch (e) {
    console.error('Update cart error:', e)
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// Remove from cart
app.post('/api/cart/remove', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body || {}
    if (typeof id !== 'number') return res.status(400).json({ error: 'Product id (number) is required' })
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.cart = (user.cart || []).filter(i => i.id !== id)
    await user.save()
    res.json({ cart: user.cart })
  } catch (e) {
    console.error('Remove cart error:', e)
    res.status(500).json({ error: 'Failed to remove cart item' })
  }
})
