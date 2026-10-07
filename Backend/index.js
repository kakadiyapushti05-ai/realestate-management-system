require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require('mongoose');
const app = express();

//  DATABASE 
require("./Models/db"); 
  
//  MIDDLEWARE 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  STATIC FILES 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//  ROUTERS
const AuthRouter = require("./Routes/AuthRouter");
const PropertyRouter = require("./Routes/PropertyRouter");
const InquiryRouter = require("./Routes/InquiryRouter");
const contactRoutes = require("./Routes/ContactRouter");
//  ROUTES 
app.get("/ping", (req, res) => {
  res.json({ message: "PONG" });
});

app.use("/api/auth", AuthRouter);
app.use("/api/properties", PropertyRouter);
app.use("/api/inquiries", InquiryRouter);
app.use("/api", contactRoutes);

//   HANDLER 
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//  ERROR HANDLER 
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
});

// START SERVER 
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
