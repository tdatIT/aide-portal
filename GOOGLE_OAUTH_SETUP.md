# Google OAuth2 Setup Guide

## Overview
This guide helps you set up Google OAuth2 integration with FedCM (Federated Credential Management) for enhanced privacy and security.

## Prerequisites
- Google Cloud Console account
- Domain for your application (for production)

## Step 1: Google Cloud Console Setup

### 1.1 Create or Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 1.2 Enable APIs
1. Navigate to **APIs & Services > Library**
2. Search for and enable:
   - **Google+ API** (if available)
   - **Google Identity Services API**

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless using Google Workspace)
3. Fill in required information:
   - **App name**: Your application name
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes (optional):
   - `openid`
   - `email`
   - `profile`
5. Save and continue

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - **Name**: Your app name
   - **Authorized JavaScript origins**:
     - For development: `http://localhost:5173`
     - For production: `https://yourdomain.com`
   - **Authorized redirect URIs** (optional):
     - For development: `http://localhost:5173/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`
5. Click **CREATE**
6. Copy the **Client ID** (you'll need this)

## Step 2: Environment Configuration

### 2.1 Create Environment File
```bash
cp .env.example .env
```

### 2.2 Configure Environment Variables
Edit `.env` file:
```env
# Google OAuth2 Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_AUTH_API_URL=https://testing-auth.aide.games/api/v1
```

### 2.3 Update HTML Meta Tag (Optional)
In `index.html`, update the Google Client ID meta tag:
```html
<meta name="google-signin-client_id" content="your-google-client-id-here.apps.googleusercontent.com">
```

## Step 3: FedCM Configuration

### 3.1 Understanding FedCM
- **FedCM** enhances privacy by preventing tracking across sites
- **User gesture required**: Google sign-in only works after user clicks button
- **Browser-mediated**: The browser manages the auth flow
- **Third-party cookie independent**: Works even when 3rd party cookies are blocked

### 3.2 Testing FedCM
1. Open Chrome DevTools
2. Go to **Application > Storage > Cookies**
3. Check **Block third-party cookies** in settings
4. Test Google sign-in functionality

## Step 4: Domain Verification (Production)

### 4.1 Verify Domain Ownership
1. In Google Cloud Console, go to **APIs & Services > Domain verification**
2. Add and verify your domain
3. Follow verification instructions (DNS, HTML file, or meta tag)

### 4.2 Update Authorized Origins
1. Go back to **APIs & Services > Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add your verified domain to **Authorized JavaScript origins**

## Step 5: Testing

### 5.1 Local Testing
```bash
npm run dev
```
Navigate to `http://localhost:5173` and test Google sign-in

### 5.2 Production Testing
1. Deploy your application
2. Update environment variables
3. Test on production domain
4. Monitor browser console for errors

## Troubleshooting

### Common Issues

#### 1. "Invalid Client ID"
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Check domain is authorized in Google Cloud Console

#### 2. "Popup Blocked"
- FedCM requires user gesture (button click)
- Ensure user clicks the sign-in button

#### 3. "Cross-origin Request Blocked"
- Verify domain is in authorized origins
- Check CORS settings

#### 4. "Third-party Cookies Blocked"
- This is expected with FedCM
- FedCM should work without third-party cookies

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.debug = 'google:*'
```

### Browser Support
- **Chrome**: 108+ (FedCM support)
- **Firefox**: Limited support
- **Safari**: Limited support
- **Edge**: 108+ (Chromium-based)

## Security Considerations

1. **Client ID**: Never expose in client-side code (it's safe in frontend)
2. **Token Validation**: Always validate tokens on your backend
3. **HTTPS**: Use HTTPS in production
4. **Domain Verification**: Verify ownership of all authorized domains

## API Response Format

The backend API expects this format:
```bash
curl --location 'https://testing-auth.aide.games/api/v1/auth/oauth2/google' \
--header 'Content-Type: application/json' \
--data '{
    "token": "GOOGLE_JWT_TOKEN_HERE"
}'
```

Expected response:
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "expiresIn": 3600,
        "user": {
            "userId": "...",
            "username": "...",
            "fullName": "...",
            "email": "...",
            "roles": ["ROLE_ADMIN", "ROLE_USER"]
        }
    }
}
```

## Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [FedCM API Documentation](https://developer.chrome.com/docs/privacy-sandbox/fedcm/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes) 