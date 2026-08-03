const nodemailer = require('nodemailer');

// Create transporter using createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add this to avoid connection issues
    tls: {
        rejectUnauthorized: false
    }
});

// ============================================
// SEND MESSAGE FUNCTION
// ============================================

exports.sendMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Email options with better formatting
        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `📧 Portfolio Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                    <h2 style="color: #2563eb;">📩 New Message from Portfolio</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                        <p><strong>👤 Name:</strong> ${name}</p>
                        <p><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
                        <p><strong>💬 Message:</strong></p>
                        <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 10px; white-space: pre-wrap;">
                            ${message}
                        </div>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                        Sent from Mekdes Wale's Portfolio
                    </p>
                </div>
            `
        };

        // Send email with error handling
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again.'
        });
    }
};

// ============================================
// TEST EMAIL FUNCTION (Optional)
// ============================================
exports.testEmail = async (req, res) => {
    try {
        const mailOptions = {
            from: `"Portfolio Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '✅ Test Email - Portfolio Backend',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2563eb;">✅ Email Configuration Working!</h2>
                    <p>Your portfolio backend is successfully configured to send emails.</p>
                    <p style="color: #666;">Sent at: ${new Date().toLocaleString()}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'Test email sent successfully!'
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email'
        });
    }
};