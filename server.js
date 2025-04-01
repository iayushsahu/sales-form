require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Set up file storage
const upload = multer({ dest: "uploads/" });

// Serve index.html on "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Handle form submission
app.post("/submit-form", upload.single("snapshot"), async (req, res) => {
    const { uname, unumber, package} = req.body;
    const filePath = req.file ? req.file.path : null;
    const fileName = req.file ? req.file.originalname : null;

    if (!uname || !unumber || !package || !filePath) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    console.log(req.body);

    // Nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // Email options
    let mailOptions = {
        from: "fxtraderayush@gmail.com",
        to: "forexcafeindia@gmail.com", 
        subject: `New Submission By ${uname}`,
        text: `User Name: ${uname}\nWhatsApp Number: ${unumber}\nPackage: ${package}`,
        attachments: [
            {
                filename: fileName,
                path: filePath
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);

        // Delete file after sending email
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: "Email sending failed" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
