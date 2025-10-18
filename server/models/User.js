const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'dairy', 'msme'],
    default: 'farmer'
  },
  agristackId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  aadhaarNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^\d{12}$/, 'Aadhaar number must be exactly 12 digits']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  siScore: {
    type: Number,
    default: 300,
    min: 0,
    max: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add optional profile photo path
userSchema.add({
  profilePhotoPath: { type: String, trim: true }
})

// Persisted wishlist and cart (lightweight)
userSchema.add({
  wishlist: [{
    id: { type: Number, required: true },
    name: { type: String },
    image: { type: String },
    price: { type: String },
    category: { type: String }
  }],
  cart: [{
    id: { type: Number, required: true },
    name: { type: String },
    image: { type: String },
    price: { type: String },
    category: { type: String },
    quantity: { type: Number, default: 1, min: 1 }
  }]
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
