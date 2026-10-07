const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    contactNo: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit number"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Contact", contactSchema);
