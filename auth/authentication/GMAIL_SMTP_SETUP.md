# Gmail SMTP Setup Guide for Authentication Service

This guide will help you configure Gmail SMTP to send verification and password reset emails directly from the authentication service.

## Prerequisites
- Gmail account
- 2-Factor Authentication enabled on your Gmail account

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the prompts to enable 2FA if not already enabled

## Step 2: Generate Gmail App Password

1. Visit: https://myaccount.google.com/apppasswords
   - Or go to Google Account → Security → 2-Step Verification → App passwords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter: `Enterprise Application Auth Service`
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - ⚠️ You won't be able to see it again!

## Step 3: Configure application.properties

Update the file: `auth/authentication/src/main/resources/application.properties`

Replace these placeholder values:

```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-actual-email@gmail.com
spring.mail.password=abcdefghijklmnop
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Email Configuration
app.mail.from=your-actual-email@gmail.com
app.frontend.url=http://localhost:3000
```

**Replace:**
- `your-actual-email@gmail.com` → Your Gmail address (e.g., `petergwenstacy123@gmail.com`)
- `abcdefghijklmnop` → The 16-character app password (without spaces)

## Step 4: Restart Authentication Service

```powershell
# Navigate to authentication directory
cd "C:\Users\LENOVO\Desktop\Enterprise\Enterprise_Application\auth\authentication"

# Set Java home and run
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
.\mvnw.cmd spring-boot:run
```

## Step 5: Test Email Functionality

### Test Registration Email:
```bash
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

### Test Password Reset Email:
```bash
POST http://localhost:8081/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## Troubleshooting

### Error: "Username and Password not accepted"
- ✅ Verify 2FA is enabled on your Gmail account
- ✅ Generate a new App Password and use it
- ✅ Remove any spaces from the app password

### Error: "Connection timed out"
- ✅ Check your firewall settings
- ✅ Ensure port 587 is not blocked
- ✅ Try using port 465 with SSL instead

### Error: "Invalid Addresses"
- ✅ Verify the `app.mail.from` matches your Gmail address
- ✅ Check that recipient email is valid

### Emails going to Spam
- ✅ Ask recipients to mark as "Not Spam"
- ✅ Consider using a custom domain with proper SPF/DKIM records
- ✅ For production, use a dedicated email service (SendGrid, AWS SES)

## Gmail Limits

| Limit Type | Value |
|------------|-------|
| **Daily limit** | 500 emails/day |
| **Per minute** | ~20-30 emails |
| **Recipients per email** | 1 (our implementation) |

⚠️ **For production**: Consider using SendGrid, AWS SES, or Mailgun for higher limits and better deliverability.

## Security Best Practices

1. **Never commit credentials to Git**
   - Add `application.properties` to `.gitignore` if it contains secrets
   - Use environment variables for production

2. **Use environment variables** (Optional but recommended):
   ```properties
   spring.mail.username=${GMAIL_USERNAME}
   spring.mail.password=${GMAIL_APP_PASSWORD}
   app.mail.from=${GMAIL_USERNAME}
   ```

3. **Rotate app passwords periodically**

## Benefits of Direct SMTP vs Notification Service

✅ **Simpler** - No microservice dependency  
✅ **Faster** - No queue delays  
✅ **Reliable** - Works even if notification-system is down  
✅ **Free** - Gmail SMTP is free for moderate use  
✅ **Easy to debug** - Direct error messages  

## What Changed?

1. ✅ Added `spring-boot-starter-mail` dependency to `pom.xml`
2. ✅ Created `DirectEmailService.java` for sending emails via SMTP
3. ✅ Updated `AuthenticationService.java` to use `DirectEmailService`
4. ✅ Added Gmail SMTP configuration to `application.properties`

## Next Steps

- [ ] Configure your Gmail App Password
- [ ] Update `application.properties` with your credentials
- [ ] Restart authentication service
- [ ] Test registration and forgot password flows
- [ ] Monitor email delivery in Gmail Sent folder

---

**Need help?** Check the console logs for detailed error messages when emails fail to send.
