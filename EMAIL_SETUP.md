# Email Configuration Guide

## Setting Up SMTP for Real Email Sending

Currently, the system sends test emails to `samgachiri2002@gmail.com`. To send real emails, you need to configure SMTP credentials.

### 1. Gmail SMTP Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:

   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Update Coral-Sales-Agent/.env**:

```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
TEST_EMAIL=samgachiri2002@gmail.com
```

### 2. Other Email Providers

#### Outlook/Hotmail

```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your_email@outlook.com
SMTP_PASSWORD=your_password
```

#### Custom SMTP

```env
SMTP_SERVER=your_smtp_server.com
SMTP_PORT=587
SMTP_USERNAME=your_username
SMTP_PASSWORD=your_password
```

### 3. Testing Email Configuration

1. Start the Sales Agent: `cd Coral-Sales-Agent && python main.py`
2. Check logs for "SMTP credentials not configured" vs "Email sent successfully"
3. If configured correctly, you'll see actual email sending in logs

### 4. Current Email Flow

1. **Onboarding** → Collects business info
2. **Auto Research** → Generates prospects (currently mock data)
3. **Auto Email** → Sends personalized emails with "Talk to Sales" links
4. **Conversation** → Handles prospect responses via localhost links

### 5. Email Content

Emails include:

- Personalized subject based on business info
- Business value proposition
- "Talk to Sales" link: `http://localhost:3000/conversations?prospect_id=xxx`
- Professional signature

### 6. Security Notes

- Never commit real SMTP credentials to git
- Use app passwords, not main account passwords
- Test with the provided test email first
- Monitor email sending limits (Gmail: 500/day for free accounts)

### 7. Troubleshooting

**"SMTP credentials not configured"**

- Check .env file exists in Coral-Sales-Agent/
- Verify SMTP_USERNAME and SMTP_PASSWORD are set

**"Authentication failed"**

- Use app password, not regular password
- Enable 2FA on Gmail
- Check username format (full email address)

**"Connection refused"**

- Check SMTP_SERVER and SMTP_PORT
- Verify firewall/antivirus isn't blocking
- Try different port (465 for SSL, 587 for TLS)
