const express = require("express");
const router = express.Router();

const PropertyController = require("../Controllers/PropertyController");
const { verifyToken, allowRoles } = require("../Middlewares/AuthMiddleware");
const upload = require("../Middlewares/upload");

/* ADD */
router.post(
  "/add",
  verifyToken,
  allowRoles("broker"),
  upload.array("images", 5),
  PropertyController.addProperty
);

/* ✅ FIX: ONLY ONE /all ROUTE */
router.get(
  "/all",
  verifyToken, // 🔥 MUST
  PropertyController.getAllProperties
);

// 🔥 ADMIN ONLY
router.get(
  "/admin/all",
  verifyToken,
  allowRoles("admin"),
  PropertyController.getAllProperties
);

/* GET REPORTED */
router.get(
  "/reported",
  verifyToken,
  allowRoles("admin"),
  PropertyController.getReportedProperties
);

/* RESOLVE */
router.put(
  "/resolve/:id",
  verifyToken,
  allowRoles("admin"),
  PropertyController.resolveProperty
);

/* BROKER */
router.get("/broker/:brokerId", PropertyController.getPropertiesByBroker);

/* GET BY ID */
router.get("/:id", PropertyController.getPropertyById);

/* UPDATE */
router.put(
  "/:id",
  verifyToken,
  allowRoles("broker"),
  upload.array("images", 5),
  PropertyController.updateProperty
);

/* DELETE */
router.delete(
  "/:id",
  verifyToken,
  allowRoles("broker", "admin"),
  PropertyController.deleteProperty
);

/* REPORT */
router.post(
  "/report/:id",
  verifyToken,
  allowRoles("user"),
  PropertyController.reportProperty
);

module.exports = router;