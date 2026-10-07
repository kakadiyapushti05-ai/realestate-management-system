const Inquiry = require('../Models/Inquiry');
const Property = require('../Models/Property');
const mongoose = require('mongoose');
const transporter = require('../config/mailer');


// CREATE INQUIRY
exports.createInquiry = async (req, res) => {
  try {

    const inquiry = await Inquiry.create(req.body);

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry
    });

  } catch (error) {

    console.error("Inquiry error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to submit inquiry"
    });

  }
};



// GET ALL INQUIRIES (ADMIN)
exports.getAllInquiries = async (req, res) => {
  try {

    const inquiries = await Inquiry.find()
      .populate("propertyId", "propertyname city area propertyprice propertyStatus") 
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries"
    });

  }
};



// GET BROKER INQUIRIES
exports.getBrokerInquiries = async (req, res) => {

  try {

    const brokerId = req.user.id;

    const properties = await Property
      .find({ brokerId })
      .select("_id");

    const propertyIds = properties.map(p => p._id);

    const inquiries = await Inquiry.find({
      propertyId: { $in: propertyIds }
    })
      .populate("propertyId", "propertyname city area propertyprice propertyStatus") 
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch broker inquiries"
    });

  }

};



// ACCEPT / REJECT INQUIRY
exports.updateInquiryStatus = async (req, res) => {

  try {

    const { status } = req.body;
    const inquiryId = req.params.id;

    const inquiry = await Inquiry.findById(inquiryId)
      .populate({
        path: "propertyId",
        populate: {
          path: "brokerId",
          model: "User",
          select: "name email contact"
        }
      });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    const property = inquiry.propertyId;
    const broker = property.brokerId;

    if (broker._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    inquiry.status = status;
    await inquiry.save();

    // SEND EMAIL IF ACCEPTED
    if (status === "accepted") {

      const brokerPhone = broker.contact || "Not Available";

      const mailOptions = {
        from: `"${broker.name}" <${broker.email}>`,
        to: inquiry.email,
        subject: "Property Inquiry Accepted",

        html: `
        <h2>Property Inquiry Accepted</h2>
        <p>Dear ${inquiry.username},</p>

        <p>Your inquiry has been accepted.</p>

        <h3>Property Details</h3>
        <p><b>Property:</b> ${property.propertyname}</p>
        <p><b>City:</b> ${property.city}</p>
        <p><b>Area:</b> ${property.area}</p>
        <p><b>Visit Time:</b> ${inquiry.visitTime}</p>

        <h3>Broker Details</h3>
        <p><b>Name:</b> ${broker.name}</p>
        <p><b>Email:</b> ${broker.email}</p>
        <p><b>Phone:</b> ${brokerPhone}</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({
      success: true,
      message: `Inquiry ${status}`
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update inquiry"
    });

  }

};

// GET USER INQUIRIES
exports.getUserInquiries = async (req, res) => {

  try {

    const email = req.params.email;

    const inquiries = await Inquiry.find({ email })
      .populate(
        "propertyId",
        "propertyname propertyprice city area type size floor images propertyStatus"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries"
    });

  }

};