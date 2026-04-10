import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay Instance
let razorpay: Razorpay | null = null;
const initRazorpay = () => {
    if (!razorpay && (process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID) && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: (process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID) as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
};

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', razorpayInitialized: !!initRazorpay() });
});

app.post('/api/create-razorpay-order', async (req, res) => {
    const rzp = initRazorpay();
    if (!rzp) return res.status(500).json({ error: 'Razorpay is not configured with API keys.' });

    try {
        const { amount, currency = 'INR', receipt } = req.body;
        
        // Razorpay expects amount in subunits (paise for INR). 
        // Incoming 'amount' from frontend is already in paise.
        console.log(`[DEBUG] Creating Razorpay Order: Amount ${amount} paise (₹${amount/100})`);
        const options = {
            amount: Math.round(amount), 
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await rzp.orders.create(options);
        res.json(order);
    } catch (e: any) {
        console.error("Razorpay Order Error:", e);
        res.status(400).json({ error: e.message });
    }
});

// Email Service (SMTP)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

app.post('/api/send-email', async (req, res) => {
    const { to, subject, text, html, attachments } = req.body;

    try {
        const mailOptions = {
            from: `"CARE AT EASE" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
            attachments: attachments?.map((att: any) => ({
                filename: att.filename,
                content: att.content,
                encoding: 'base64',
                contentType: att.contentType
            }))
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Email sent: ${info.messageId}`);
        res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error("[SMTP] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend Server successfully running on Port ${PORT}`);
});
