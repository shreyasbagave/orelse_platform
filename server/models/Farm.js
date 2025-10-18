const mongoose = require('mongoose')

const farmSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: { type: String, trim: true, required: true },
  sizeAcres: { type: Number },
  primaryCrop: { type: String, trim: true },
  secondaryCrop: { type: String, trim: true },
  tertiaryCrop: { type: String, trim: true },
  soilType: { type: String, trim: true },
  irrigationType: { type: String, trim: true },
  landRecordPath: { type: String },
  geotagPhotoPaths: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

farmSchema.pre('save', function(next) { this.updatedAt = Date.now(); next() })

module.exports = mongoose.model('Farm', farmSchema)


