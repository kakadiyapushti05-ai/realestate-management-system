const express = require("express");
const router = express.Router();
const contactController = require("../Controllers/ContactController");

router.post("/contact", contactController.createContact);

module.exports = router;
