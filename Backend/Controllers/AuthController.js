const UserModel = require('../Models/User'); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require('../config/mailer');

// ADMIN CREDENTIAL
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";


/* ===============================
   SIGNUP (NO ADMIN ALLOWED)
================================ */
const signup = async (req, res) => {
  try {

    const { name, email, contact, password, confirmPassword, role } = req.body;

    //  DEFAULT ROLE
    let userRole = role || "user";

    //  ADMIN 
    if (userRole === "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot register as admin"
      });
    }

    if (!name || !email || !contact || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password mismatch"
      });
    }

    //  BLOCK ADMIN EMAIL REGISTER
    if (email === ADMIN_EMAIL) {
      return res.status(400).json({
        success: false,
        message: "This email is reserved for admin"
      });
    }

    const exists = await UserModel.findOne({ email });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imagePath = "";
    if (req.file) {
      imagePath = `uploads/${req.file.filename}`;
    }

    const user = await UserModel.create({
      name,
      email,
      contact,
      password: hashedPassword,
      role: userRole, 
      profileImage: imagePath
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* 
   LOGIN ( ADMIN + USER)
*/
const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // ===============================
    //  ADMIN LOGIN 
    // ===============================
    if (email === ADMIN_EMAIL) {

      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials"
        });
      }

      const token = jwt.sign(
        {
          id: "admin",
          role: "admin",
          email: ADMIN_EMAIL
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          _id: "admin",
          name: "Admin",
          email: ADMIN_EMAIL,
          role: "admin",
          profileImage: "",
          isOnline: true
        }
      });
    }

    

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access restricted"
      });
    }

// FORCE UPDATE 
const updatedUser = await UserModel.findByIdAndUpdate(
  user._id,
  { isOnline: true },
  { new: true }
);
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        role: user.role,
        profileImage: user.profileImage,
        isOnline: true
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* 
   MY PROFILE
 */
const getMyProfile = async (req, res) => {
  try {

    // 🔥 ADMIN LOGIN CASE (IMPORTANT FIX)
    if (req.user.id === "admin") {
      return res.json({
        _id: "admin",
        name: "Admin",
        email: "admin@gmail.com",
        role: "admin"
      });
    }

    const user = await UserModel.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   UPDATE PROFILE
================================ */
const updateProfile = async (req, res) => {
  try {

    const userId = req.user.id;

    const { name, email, contact } = req.body;

    const existingUser = await UserModel.findById(userId);

    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      contact: contact || existingUser.contact,
      profileImage: req.file
  ? `uploads/${req.file.filename}` 
  : existingUser.profileImage
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile update failed"
    });
  }
};


/* ===============================
   ADMIN GET BROKERS
================================ */
const getAllBrokers = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const brokers = await UserModel
      .find({ role: "broker" })
     .select('_id name email profileImage createdAt isOnline')
     .lean(); 
    res.status(200).json(brokers);

  } catch (error) {
    res.status(500).json({ message: "Broker fetch error" });
  }
};


/* ===============================
   FORGOT PASSWORD
================================ */
const forgotPassword = async (req, res) => {
  try {

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password required"
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ===============================
   ADMIN GET USERS
================================ */
const getAllUsers = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await UserModel
      .find({ role: 'user' })
      .select('_id name email contact role profileImage createdAt isOnline'); // ✅ ADD isOnline

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users'
    });
  }
};

/* ===============================
   ADMIN DELETE USER
================================ */
const deleteUser = async (req, res) => {
  try {

    //  ONLY ADMIN
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userId = req.params.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await UserModel.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};
const logoutUser = async (req, res) => {
  try {

    console.log(" LOGOUT USER:", req.user);

    // ADMIN SKIP
    if (req.user.id === "admin") {
      return res.json({
        success: true,
        message: "Admin logout"
      });
    }

    //  PROPER UPDATE + RETURN
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      { isOnline: false },
      { new: true }
    );

    console.log(" OFFLINE SET:", updatedUser);

    return res.json({
      success: true,
      message: "Logout successful"
    });

  } catch (err) {
    console.log(" LOGOUT ERROR", err);
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};



// TEMP OTP STORE
const otpStore = {};

/* ===============================
   SEND OTP
================================ */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    //  GENERATE OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 min
    };

    //  SEND EMAIL
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER || "pushtikakadiya77@gmail.com"}>`,
      to: email,
      subject: "🔐 OTP for Password Reset",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    return res.json({
      success: true,
      message: "OTP sent successfully 📩"
    });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
};


/* 
   VERIFY OTP + RESET PASSWORD
 */
const verifyOTPAndReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }

    if (record.otp != otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    //  DELETE OTP
    delete otpStore[email];

    return res.json({
      success: true,
      message: "Password updated successfully "
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Reset failed"
    });
  }
};


module.exports = {
  signup,
  login,
  getMyProfile,
  updateProfile,
  getAllBrokers,
  getAllUsers,
  forgotPassword,
   logoutUser,
   deleteUser,
   sendOTP,
  verifyOTPAndReset
};