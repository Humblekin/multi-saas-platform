# 🔐 Login Security - Quick Reference

## What's Protected?

### Authentication Endpoints

- `POST /api/register` - Rate limited: 5 attempts per 15 minutes
- `POST /api/login` - Rate limited: 5 attempts per 15 minutes
- `POST /api/forgot-password` - Rate limited: 5 attempts per 15 minutes

### All Protected Routes

- Rate limited: 100 requests per 10 minutes per IP
- CORS restricted to approved origins
- Security headers on all responses

---

## Security Features

### 🚫 Attack Prevention

| Issue             | Solution                                                |
| ----------------- | ------------------------------------------------------- |
| **Brute Force**   | 5 login attempts per 15 minutes, then 15-minute lockout |
| **SQL Injection** | No SQL used (Firestore)                                 |
| **XSS Attacks**   | HTML sanitization + Content Security Policy             |
| **CSRF**          | CORS validation + SameSite cookies                      |
| **Clickjacking**  | X-Frame-Options: DENY                                   |
| **MITM Attacks**  | HSTS enforced (HTTPS only)                              |

### ✅ Security Headers Sent

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
```

### ✅ Input Validation

All inputs checked for:

- ✅ Length limits (max 255 chars)
- ✅ Format validation (email regex, token format)
- ✅ HTML/Script injection (removed)
- ✅ Special characters (sanitized)

---

## Error Messages (Intentionally Vague)

Users see generic messages to prevent account enumeration:

- ❌ "User not found" → ✅ "Authentication failed"
- ❌ "Wrong password" → ✅ "Invalid email or password"
- ✅ "Too many attempts" → Still shown (user needs to know)

---

## Account Lockout

**Trigger**: 5 failed login attempts  
**Duration**: 15 minutes (automatic)  
**Reset**: After 30 minutes of no attempts, counter resets to 0

---

## Security Logging

All events logged to Firestore `securityLogs`:

- Successful logins
- Failed attempts
- Invalid tokens
- Account lockouts
- Registration activities

**Includes**: Timestamp, email, IP address, event type

---

## File Structure

```
Backend/
├── middleware/
│   ├── auth.js              ← JWT validation
│   ├── security.js          ← NEW! Security utilities
│   └── subscriptionCheck.js
├── routes/
│   └── auth.js              ← Login & Register routes
└── server.js                ← Security headers & rate limiting

Frontend/
├── pages/
│   └── LoginPage.jsx        ← Enhanced with validation
└── api.js                   ← Token management
```

---

## Testing Security

### 1. Test Rate Limiting

```bash
# Rapid login: Make 6 attempts quickly
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"token":"test","email":"user@test.com"}'
# 6th attempt returns: 429 Too Many Requests
```

### 2. Test Input Sanitization

Try these in login form:

```
Email: test@test.com<script>alert('xss')</script>
Expected: Script tags removed, validation error

Email: test@test.com' OR '1'='1
Expected: Email validation fails
```

### 3. Test Account Lockout

```
1. Enter wrong password 5 times
2. 6th attempt: See "Account locked, try again in 15 minutes"
3. Wait 15 minutes or check DB for loginAttempts record
```

---

## JWT Token Details

**Location**: localStorage (key: `token`)  
**Sent via**: `x-auth-token` header  
**Format**: JWT (header.payload.signature)  
**Expiration**: 7 days  
**Algorithm**: HS256

**Payload**:

```json
{
  "user": {
    "id": "firebase_uid"
  },
  "iat": 1703358400,
  "exp": 1704272800
}
```

**Validation**:

- ✅ Signature verified
- ✅ Not expired
- ✅ Contains required fields
- ✅ Format is valid

---

## Monitoring Security Events

### Access Firestore Console

1. Go to Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Collection: `securityLogs`

### Look for

- Multiple failed attempts from same email
- Failed attempts from unusual IPs
- Token validation failures
- Registration anomalies

### Red Flags 🚩

- 10+ failed login attempts
- Attempts from different countries in short time
- Multiple accounts registered from same IP
- Repeated token validation failures

---

## Environment Setup

### Required Variables (.env)

```
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Secure Practices

- ✅ JWT_SECRET should be >32 characters
- ✅ Use different secrets for dev/prod
- ✅ Never commit .env to git
- ✅ Rotate secrets regularly

---

## Deployment Checklist

Before going to production:

- [ ] Set `FRONTEND_URL` to production domain
- [ ] Update `JWT_SECRET` to strong random string
- [ ] Enable HTTPS on server
- [ ] Update CORS origins to production URLs
- [ ] Monitor security logs regularly
- [ ] Set up alerts for suspicious activity
- [ ] Test all security measures
- [ ] Review rate limiting limits (adjust if needed)
- [ ] Enable database backups
- [ ] Set up WAF (Web Application Firewall)

---

## Support & Troubleshooting

### Issue: "Too many login attempts"

**Solution**: Wait 15 minutes or check `loginAttempts` collection in Firestore

### Issue: Token is not valid

**Solution**:

- Check token is in localStorage
- Verify token hasn't expired
- Re-login to get new token

### Issue: CORS error

**Solution**:

- Check FRONTEND_URL is in server.js CORS origins
- Verify request includes Content-Type header

---

**For detailed technical documentation, see**: [LOGIN_SECURITY_IMPLEMENTATION.md](LOGIN_SECURITY_IMPLEMENTATION.md)
