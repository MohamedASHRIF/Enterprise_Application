# Email Verification and Password Reset Features

## Overview
This document describes the email verification and password reset features implemented in the authentication service.

## Features Implemented

### 1. Email Verification on Registration
When a user registers, they receive an email with a verification link. The user must click this link to verify their email address.

### 2. Forgot Password / Password Reset
Users can request a password reset link via email. The link contains a token that allows them to set a new password.

## API Endpoints

### Registration with Email Verification
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "CUSTOMER",
    "emailVerified": false
  }
}
```

### Verify Email
**GET** `/api/auth/verify-email?token={verificationToken}`

**Response (Success):**
```json
{
  "message": "Email verified successfully",
  "success": true
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired verification token",
  "success": false
}
```

### Resend Verification Email
**POST** `/api/auth/resend-verification`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent successfully",
  "success": true
}
```

### Request Password Reset
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link will be sent",
  "success": true
}
```

### Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully",
  "success": true
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired reset token",
  "success": false
}
```

### Login (Updated to include email verification status)
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "CUSTOMER",
    "emailVerified": true
  }
}
```

## Database Changes

The `User` entity has been updated with the following new fields:

- `emailVerified` (Boolean): Indicates if the user's email is verified
- `verificationToken` (String): Token used for email verification
- `verificationTokenExpiry` (LocalDateTime): Expiry time for verification token (24 hours)
- `passwordResetToken` (String): Token used for password reset
- `passwordResetTokenExpiry` (LocalDateTime): Expiry time for reset token (1 hour)

## Email Service Integration

The authentication service integrates with the notification service to send emails:

- **Notification Service URL**: `http://localhost:8084`
- **Endpoint**: `POST /api/email/send`
- **Request Format**:
```json
{
  "toMail": "user@example.com",
  "subject": "Email Subject",
  "body": "Email body content"
}
```

## Configuration

Add the following to `application.properties`:

```properties
# Notification Service Configuration
notification.service.url=http://localhost:8084
```

## Token Expiry Times

- **Email Verification Token**: 24 hours
- **Password Reset Token**: 1 hour

## Security Notes

1. **Password Reset Security**: The forgot-password endpoint returns the same message whether the email exists or not, preventing email enumeration attacks.

2. **Token Generation**: Both verification and reset tokens use UUID for secure random token generation.

3. **Token Expiry**: All tokens expire after a set time period to enhance security.

4. **Password Requirements**: Passwords must be at least 6 characters long.

## Frontend Integration

### Email Verification Flow
1. User registers → receives verification email
2. User clicks link in email → redirected to `http://localhost:3000/verify-email?token={token}`
3. Frontend calls `GET /api/auth/verify-email?token={token}`
4. Display success/error message to user

### Password Reset Flow
1. User clicks "Forgot Password" → enters email
2. Frontend calls `POST /api/auth/forgot-password` with email
3. User receives reset email with link to `http://localhost:3000/reset-password?token={token}`
4. User enters new password on reset page
5. Frontend calls `POST /api/auth/reset-password` with token and new password
6. Display success/error message and redirect to login

## Testing

### Test Email Verification
```bash
# 1. Register a user
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'

# 2. Check email for verification link or use token from database
# 3. Verify email
curl -X GET "http://localhost:8081/api/auth/verify-email?token={TOKEN}"
```

### Test Password Reset
```bash
# 1. Request password reset
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# 2. Check email for reset link or use token from database
# 3. Reset password
curl -X POST http://localhost:8081/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "{TOKEN}",
    "newPassword": "newPassword123"
  }'
```

## Dependencies

No additional dependencies were required. The implementation uses:
- Spring Boot Web (for RestTemplate)
- Existing authentication infrastructure
- Java UUID for token generation
- Java LocalDateTime for token expiry

## Services and Classes Modified/Created

### Created:
- `EmailService.java` - Service for sending emails via notification system

### Modified:
- `User.java` - Added email verification and password reset fields
- `UserRepository.java` - Added methods to find users by tokens
- `AuthenticationService.java` - Added verification and reset logic
- `AuthController.java` - Added new endpoints
- `application.properties` - Added notification service URL

## Notes

- Make sure the notification service is running on port 8084
- Email links currently point to `http://localhost:3000` - update for production
- The notification service uses RabbitMQ for email queuing
- All endpoints under `/api/auth/**` are publicly accessible (no authentication required)
