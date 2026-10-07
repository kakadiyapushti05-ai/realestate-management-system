const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  contact: {                
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['admin', 'user', 'broker'],
    default: 'user'
  },

  profileImage: {
    type: String,
    default: ""
  },

  isOnline: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports =
  mongoose.models.User || mongoose.model('User', userSchema);