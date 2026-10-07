const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    inquiryFor: {
      type: String,
      required: true,
      enum: ['sale', 'rent']
    },

    budget: {
      type: Number
    },

    visitTime: {
  type: String,
  enum: ['Morning', 'Afternoon', 'Evening'],
  required: true
},


    message: {
      type: String,
      trim: true
    },

    // 🔥 REQUIRED FOR BROKER FILTERING
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
     status:{
    type:String,
    enum:['pending','accepted','rejected'],
    default:'pending'
  }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', InquirySchema);
