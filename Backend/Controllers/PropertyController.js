const Property = require("../Models/Property");
const mongoose = require("mongoose");

/* ===============================
   cd VERIFICATION LOGIC
================================ */
const checkVerification = (p) => {
  let score = 0;

  if (p.description) score += 20;
  if (p.images && p.images.length > 0) score += 20;
  if (p.floor) score += 10;

  //  reports reduce trust
  if (p.reportCount >= 1) score -= 30;

  return score >= 30;
};

/* ===============================
   ADD PROPERTY
================================ */
exports.addProperty = async (req, res) => {
  try {

    if (!req.body.propertyname || !req.body.propertyprice || !req.body.city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const propertyData = {
      ...req.body,
      images: req.files ? req.files.map(f => f.filename) : [],
      brokerId: req.user.id
    };

    const property = await Property.create(propertyData);

    // AUTO VERIFY
    property.isVerified = checkVerification(property);
    await property.save();

    res.json(property);

  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET ALL PROPERTIES
================================ */
exports.getAllProperties = async (req, res) => {
  try {

    const properties = await Property.find();

    //  APPLY VERIFICATION LOGIC
    const updated = properties.map(p => {
      const obj = p.toObject();
      obj.isVerified = checkVerification(obj);
      return obj;
    });

    res.json(updated);

  } catch (error) {
    console.error("❌ Property Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   GET PROPERTY BY ID
================================ */
exports.getPropertyById = async (req, res) => {
  try {

    const property = await Property
      .findById(req.params.id)
      .populate("brokerId", "name email");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const obj = property.toObject();
    obj.isVerified = checkVerification(obj);

    res.json(obj);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch property"
    });
  }
};

/* ===============================
   UPDATE PROPERTY
================================ */
exports.updateProperty = async (req, res) => {
  try {

    const propertyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  OWNER CHECK
    if (property.brokerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    //  UPDATE FIELDS
    if (req.body.propertyprice !== undefined) {
      property.propertyprice = req.body.propertyprice;
    }

    if (req.body.propertyStatus) {
      property.propertyStatus = req.body.propertyStatus.toLowerCase();
    }

    if (req.body.description !== undefined) {
      property.description = req.body.description;
    }

    //  EXISTING IMAGES
    if (req.body.existingImages) {
      property.images = JSON.parse(req.body.existingImages);
    }

    //  NEW IMAGES
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      property.images = [...property.images, ...newImages];
    }

    
    property.isVerified = checkVerification(property);

    await property.save();

    res.json({
      success: true,
      message: "Property updated successfully",
      property
    });

  } catch (err) {
    console.error("Update Property Error:", err);
    res.status(500).json({
      message: err.message || "Failed to update property"
    });
  }
};

/* ===============================
   DELETE PROPERTY
================================ */
exports.deleteProperty = async (req, res) => {
  try {

    const propertyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  ADMIN OR OWNER
    if (
      req.user.role !== "admin" &&
      property.brokerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: "Property deleted successfully"
    });

  } catch (err) {
    console.error("Delete Property Error:", err);
    res.status(500).json({
      message: "Failed to delete property"
    });
  }
};

/* ===============================
   GET BY BROKER
================================ */
exports.getPropertiesByBroker = async (req, res) => {
  try {

    const brokerId = req.params.brokerId;

    if (!mongoose.Types.ObjectId.isValid(brokerId)) {
      return res.status(400).json({ message: "Invalid broker ID" });
    }

    const properties = await Property.find({ brokerId });

    const updated = properties.map(p => {
      const obj = p.toObject();
      obj.isVerified = checkVerification(obj);
      return obj;
    });

    res.status(200).json({
      success: true,
      data: updated
    });

  } catch (err) {
    console.error("Fetch Broker Properties Error:", err);
    res.status(500).json({
      message: "Failed to fetch broker properties"
    });
  }
};

/* ===============================
   REPORT PROPERTY
================================ */
exports.reportProperty = async (req, res) => {
  try {

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Not found" });
    }

    //  DUPLICATE REPORT BLOCK
    if (property.reportedBy.includes(req.user.id)) {
      return res.status(400).json({ message: "Already reported" });
    }

    property.reportCount += 1;
    property.reportedBy.push(req.user.id);

    //  UPDATE VERIFY
    property.isVerified = checkVerification(property);

    await property.save();

    res.json({
      message: "Reported",
      isVerified: property.isVerified
    });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

/* ===============================
   ADMIN: GET REPORTED
================================ */
exports.getReportedProperties = async (req, res) => {
  try {

    const properties = await Property.find({
      reportCount: { $gt: 0 }
    });

    const updated = properties.map(p => {
      const obj = p.toObject();
      obj.isVerified = checkVerification(obj);
      return obj;
    });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Error fetching reported properties" });
  }
};

/* ===============================
   ADMIN: RESOLVE
================================ */
exports.resolveProperty = async (req, res) => {
  try {

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.reportCount = 0;

    //  VERIFIED
    property.isVerified = true;

    await property.save();

    res.json({ message: "Property resolved successfully" });

  } catch (err) {
    console.error("Resolve Error:", err);
    res.status(500).json({ message: "Error resolving property" });
  }
};