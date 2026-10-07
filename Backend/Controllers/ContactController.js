const Contact = require("../Models/contact");
const transporter = require("../config/mailer"); // path check karjo

exports.createContact = async (req, res) => {
  try {
    const { name, email, contactNo, message } = req.body;

    // Save in DB
    const newContact = new Contact({
      name,
      email,
      contactNo,
      message,
    });

    await newContact.save();

    //  Send Email
    const mailOptions = {
      from: email, // user email
      to: "pushtikakadiya77@gmail.com", // admin email
      subject: "New Contact Form Message",
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact No:</strong> ${contactNo}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Message sent successfully & email delivered",
      data: newContact,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};