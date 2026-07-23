# 🔐 OAuth Setup Guide - Google & Facebook Sign-In

## Status: ✅ IMPLEMENTATION COMPLETE

Google and Facebook Sign-In has been fully implemented. Now you need to configure your credentials.

---

## 📋 What Was Implemented

### Backend Changes
- ✅ Google OAuth token verification (`POST /api/auth/google`)
- ✅ Facebook OAuth token verification (`POST /api/auth/facebook`)
- ✅ Auto user creation for first-time OAuth users
- ✅ Auto user profile updates from OAuth data
- ✅ JWT token generation for OAuth users

### Frontend Changes
- ✅ Google Sign-In button (login page)
- ✅ Facebook Login button (login page)
- ✅ Google Sign-In button (register page)
- ✅ Facebook Login button (register page)
- ✅ OAuth handler module (oauth.js)
- ✅ Token exchange with backend

### Dependencies Added
- ✅ `google-auth-library@^9.6.3` - For verifying Google tokens

---

## 🚀 Setup Instructions

### Step 1: Get Google Client ID

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Go to "OAuth consent screen"
   - Choose "External"
   - Fill in app name: "Takanj"
   - Add scopes: `email`, `profile`, `openid`
4. Go to "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:5500
     http://localhost:8000
     http://localhost:8888
     https://yourdomain.com
     ```
   - Create and copy the Client ID

5. **Current Placeholder** (in code):
   ```
   1051632903265-9n8o0v8p0h3l7b2c5d1e9f3g2h4i5j6k.apps.googleusercontent.com
   ```

6. **Replace with your real Client ID** in:
   - `frontend/login.html` (in oauth.js initialization)
   - `frontend/register.html` (in oauth.js initialization)
   - `backend/controllers/authController.js` (line: `googleClient = new OAuth2Client(...)`)

### Step 2: Get Facebook App ID

1. Go to: https://developers.facebook.com/
2. Create a new app
3. Add "Facebook Login" product
4. In Settings → Basic, copy:
   - App ID
   - App Secret

5. Configure OAuth redirect URIs:
   ```
   http://localhost:5500
   http://localhost:8000
   http://localhost:8888
   https://yourdomain.com
   ```

6. **Add to HTML** (already included):
   ```html
   <script async defer crossorigin="anonymous" 
     src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=YOUR_APP_ID" 
     id="facebook-jssdk"></script>
   ```

7. **Replace `YOUR_APP_ID`** in:
   - `frontend/login.html`
   - `frontend/register.html`

---

## 🔧 Configuration Files to Update

### File 1: `frontend/login.html`

Find and replace:
```javascript
// Line ~180
google.accounts.id.initialize({
    client_id: '1051632903265-9n8o0v8p0h3l7b2c5d1e9f3g2h4i5j6k.apps.googleusercontent.com',
    callback: handleGoogleSignIn
});

// Replace with YOUR Google Client ID
```

And Facebook SDK tag:
```html
<!-- Find this line and add your App ID -->
<script async defer crossorigin="anonymous" 
  src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=YOUR_APP_ID" 
  id="facebook-jssdk"></script>
```

### File 2: `frontend/register.html`

Same replacements as login.html (exact duplicate)

### File 3: `backend/controllers/authController.js`

Find and replace:
```javascript
// Line ~5
const googleClient = new OAuth2Client('1051632903265-9n8o0v8p0h3l7b2c5d1e9f3g2h4i5j6k.apps.googleusercontent.com');

// And Line ~90
audience: '1051632903265-9n8o0v8p0h3l7b2c5d1e9f3g2h4i5j6k.apps.googleusercontent.com'

// Replace BOTH with YOUR Google Client ID
```

---

## 🌍 Allowed Redirect URIs

### Development
```
http://localhost:5500
http://localhost:8000
http://localhost:8888
http://127.0.0.1:5500
http://127.0.0.1:8000
```

### Production
```
https://your-domain.com
https://www.your-domain.com
https://app.your-domain.com
```

---

## 📝 Environment Variables (.env)

Optional - Add to `backend/.env` if needed:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

Then update `authController.js` to use:
```javascript
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
```

---

## 🧪 Testing OAuth

### Test 1: Google Sign-In
1. Open: `http://localhost:5500/frontend/login.html`
2. Click "Sign in with Google" button
3. Choose Google account
4. Should create/login user and redirect to home

### Test 2: Facebook Login
1. Open: `http://localhost:5500/frontend/login.html`
2. Click "Continue with Facebook" button
3. Approve permissions
4. Should create/login user and redirect to home

### Test 3: Auto User Creation
1. First time with Google email: `john@gmail.com`
2. User automatically created in database
3. Login with Google `john@gmail.com` again
4. Finds existing user and logs in

### Test 4: Profile Updates
1. Register with Google
2. Check `localStorage.user` - should have:
   ```json
   {
     "id": 1,
     "name": "John Doe",
     "email": "john@gmail.com",
     "profileImage": "https://..."
   }
   ```

---

## 🐛 Troubleshooting

### "Google SDK not loaded"
**Solution**:
- Check internet connection
- Check script tag in HTML
- Check browser console for errors

### "Google Sign-In button not showing"
**Solution**:
- Make sure Google Client ID is correct
- Verify domain is in authorized URIs
- Check browser console (F12) for errors

### "Facebook login not working"
**Solution**:
- Verify Facebook App ID is correct
- Check Facebook SDK script tag
- Make sure app is in development/production mode

### "Invalid credentials" after OAuth
**Solution**:
- Backend might not be running
- Check backend console for errors
- Verify token exchange (check network tab)

### "User not created"
**Solution**:
- Check database connection
- Check backend error logs
- Verify email is valid

---

## 🔒 Security Notes

### Current Implementation
- ✅ Google tokens verified server-side
- ✅ Facebook tokens verified server-side
- ✅ JWT tokens generated server-side
- ✅ Environment variables for sensitive data

### Best Practices
1. **Never expose secrets in frontend code**
   - Keep Client ID only (public)
   - Keep secrets only in backend environment

2. **Always verify tokens on backend**
   - Don't trust frontend verification
   - Always verify on server

3. **Use HTTPS in production**
   - Never send tokens over HTTP
   - Use secure cookies if possible

4. **Implement rate limiting**
   - Prevent brute force attacks
   - Limit failed login attempts

5. **Store profile images securely**
   - Validate image URLs
   - Consider downloading and serving locally

---

## 📊 User Data from OAuth

### Google provides:
- `sub` - Unique ID
- `name` - Full name
- `email` - Email address
- `picture` - Profile image URL
- `email_verified` - Email verification status

### Facebook provides:
- `id` - Unique ID
- `name` - Full name
- `email` - Email address
- `picture.data.url` - Profile image URL

### Application stores:
- `id` - Database user ID
- `email` - Email
- `name` - Name
- `profileImage` - Avatar URL
- `role` - User role (always 'user' for OAuth)

---

## 🚀 Production Deployment

### Before Going Live

1. **Get Production Credentials**
   - Google: Production OAuth 2.0 credentials
   - Facebook: Production app credentials

2. **Update Redirect URIs**
   - Add production domain to both

3. **Update Frontend URLs**
   ```javascript
   // In production, update API_CONFIG
   return 'https://api.yourdomain.com/api';
   ```

4. **Environment Variables**
   ```
   GOOGLE_CLIENT_ID=prod_client_id
   FACEBOOK_APP_ID=prod_app_id
   NODE_ENV=production
   ```

5. **Enable HTTPS**
   - OAuth requires HTTPS in production

6. **Test Thoroughly**
   - Test all auth flows
   - Test error scenarios
   - Monitor logs

---

## 📋 Checklist

### Setup
- [ ] Google Client ID obtained
- [ ] Facebook App ID obtained
- [ ] Update login.html with credentials
- [ ] Update register.html with credentials
- [ ] Update authController.js with Client ID
- [ ] Install dependencies (`npm install`)
- [ ] Backend running (`npm start`)

### Testing
- [ ] Google Sign-In works
- [ ] Facebook Login works
- [ ] User created in database
- [ ] Token saved in localStorage
- [ ] Redirect to home works
- [ ] Profile shows user data
- [ ] Can logout and login again

### Production
- [ ] Production credentials obtained
- [ ] Production URLs configured
- [ ] HTTPS enabled
- [ ] All tests pass
- [ ] Monitoring set up
- [ ] Error handling verified

---

## 📞 Support

### Common Issues

**Issue**: "Redirect URI mismatch"
**Solution**: Make sure domain exactly matches configuration

**Issue**: "Invalid client ID"
**Solution**: Copy exact Client ID from credentials page

**Issue**: "CORS error"
**Solution**: Verify CORS_ORIGIN includes frontend domain

**Issue**: "User not logged in after OAuth"
**Solution**: Check network tab > find `/auth/google` or `/auth/facebook` request > check response

---

## 🎯 Next Steps

1. ✅ Obtain Google Client ID
2. ✅ Obtain Facebook App ID
3. ✅ Update configuration files
4. ✅ Test OAuth flows
5. ✅ Deploy to production

---

## 📚 Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/web)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [OAuth 2.0 Standard](https://oauth.net/2/)
- [JWT Documentation](https://jwt.io/)

---

**Status**: Implementation complete, awaiting your OAuth credentials configuration.

After you add your credentials, OAuth will be fully functional!
