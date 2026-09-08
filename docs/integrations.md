# External Service Integrations

## 1. Paystack (Ghana Mobile Money & Cards)
- **Supported Channels:** MTN MoMo, Telecel Cash, AT Money, Visa, Mastercard.
- **Keys Required:** `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`.
- **Webhook Endpoint:** `https://yourdomain.com/api/webhooks/paystack`
- **Secret for Webhook:** `PAYMENT_WEBHOOK_SECRET`

## 2. WhatsApp Customer Support & Notifications
- **Business WhatsApp Number:** `+233245147912`
- **Direct Link:** `https://wa.me/message/UKIZH3E3AXOXB1`
- **Automated Order URL Generation:** After placing an order, the system generates a pre-filled WhatsApp dispatch confirmation link.

## 3. Email (SMTP / Resend)
- **Support Inbox:** `successlight@gmail.com`
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env` for automated customer order receipt emails.
