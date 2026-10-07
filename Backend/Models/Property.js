const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
{
  propertyname: { type: String, required: true, trim: true },
  propertyprice: { type: Number, required: true },
  size: { type: String },
  floor: { type: String },
  city: { type: String, required: true },
  area: { type: String },
  type: { type: String, required: true },

  propertyStatus: {
    type: String,
    enum: ['rent', 'sale', 'sold'],
    lowercase: true,
    required: true
  },

  description: { type: String },

  images: [{ type: String }],

  brokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🔥 IMPORTANT
  isVerified: {
    type: Boolean,
    default: false
  },

  reportCount: {
    type: Number,
    default: 0
  },
  reportedBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
]

},
{ timestamps: true }
);

module.exports =
  mongoose.models.Property ||
  mongoose.model("Property", propertySchema);