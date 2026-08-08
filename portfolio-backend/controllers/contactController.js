const nodemailer = require('nodemailer');
const { getAll, getOne } = require('../config/database');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Escape values before embedding them in the notification email HTML
function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Map DB row to the API shape the admin panel expects (date/read)
function mapMessage(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        date: row.created_at,
        read: row.is_read
    };
}

async function getMessages(req, res) {
    try {
        const rows = await getAll(
            'SELECT * FROM messages ORDER BY created_at DESC, id DESC'
        );
        res.json({ success: true, data: rows.map(mapMessage) });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
}


async function getMessageById(req, res) {
    try {
        const { id } = req.params;
        const row = await getOne('SELECT * FROM messages WHERE id = $1', [id]);

        if (!row) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, data: mapMessage(row) });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch message' });
    }
}

async function sendMessage(req, res) {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Validate email format (also guards the email replyTo header)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Save the message to the database (persists across restarts)
        const saved = await getOne(
            'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), email.trim(), message.trim()]
        );

    
        try {
            const safeName = escapeHtml(name);
            const safeEmail = escapeHtml(email);
            const safeMessage = escapeHtml(message);

            const mailOptions = {
                from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                replyTo: email,
                subject: `📧 Portfolio Message from ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                        <h2 style="color: #2563eb;">📩 New Message from Portfolio</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <p><strong>👤 Name:</strong> ${safeName}</p>
                            <p><strong>📧 Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
                            <p><strong>💬 Message:</strong></p>
                            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 10px; white-space: pre-wrap;">
                                ${safeMessage}
                            </div>
                        </div>
                        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                            Sent from Mekdes Wale's Portfolio
                        </p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email notification failed (message still saved):', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again.'
        });
    }
}


async function deleteMessage(req, res) {
    try {
        const { id } = req.params;
        const deleted = await getOne('DELETE FROM messages WHERE id = $1 RETURNING *', [id]);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, message: 'Message deleted successfully!' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
}


async function testEmail(req, res) {
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
        res.json({ success: true, message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send test email' });
    }
}

module.exports = {
    getMessages,
    getMessageById,
    sendMessage,
    deleteMessage,
    testEmail
};
