# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for file storage and Excel file processing.

## Important: Google Drive Requires OAuth 2.0 Credentials

The API key you provided (`AIzaSyDOUPZ83SaXXC5_f3i7Icm-rypm_43_IvQ`) is useful for some Google APIs, but **Google Drive requires OAuth 2.0 credentials** for secure file access.

## Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project (or select existing one):
   - Click "Select a project" dropdown
   - Click "New Project"
   - Name it "HAV Project Management" or similar
   - Click "Create"

3. Enable Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External (or Internal if using Google Workspace)
     - App name: "HAV Project Management"
     - User support email: your email
     - Developer contact: your email
     - Add scopes:
       - `https://www.googleapis.com/auth/drive.file`
       - `https://www.googleapis.com/auth/drive.readonly`
     - Add test users (your email)
   - Choose "Web application"
   - Name: "HAV Backend"
   - Authorized redirect URIs:
     - `http://localhost:3001/api/google/callback`
     - (Add your production URL when deploying)
   - Click "Create"
   - **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Update Environment Variables

Update your `.env` file with the OAuth credentials:

```bash
# Google Drive API Configuration
GOOGLE_API_KEY="AIzaSyDOUPZ83SaXXC5_f3i7Icm-rypm_43_IvQ"
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/google/callback"
GOOGLE_REFRESH_TOKEN=""  # Leave empty for now
```

Replace `your-client-id-here` and `your-client-secret-here` with the values from Step 1.

## Step 3: Authorize the Application

After updating the credentials and restarting the server:

1. **Get the authorization URL:**
   ```bash
   curl http://localhost:3001/api/google/auth-url
   ```

   Or visit in your browser (after logging in to the app):
   - Frontend: Make a request to `/api/google/auth-url`

2. **Open the returned URL in your browser**
   - Sign in with your Google account
   - Grant permissions to access Google Drive
   - You'll be redirected to the callback URL

3. **Save the Refresh Token:**
   - The callback will return a `refresh_token`
   - Copy this token and add it to your `.env` file:
     ```bash
     GOOGLE_REFRESH_TOKEN="your-refresh-token-here"
     ```
   - Restart the server

## Step 4: Test the Integration

Once setup is complete, you can test the integration:

### Upload a file:
```bash
curl -X POST http://localhost:3001/api/google/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### List files:
```bash
curl http://localhost:3001/api/google/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Read an Excel file:
```bash
curl http://localhost:3001/api/google/xlsx/FILE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Available API Endpoints

All endpoints require authentication (JWT token in Authorization header).

### File Management
- `GET /api/google/files` - List all files
- `GET /api/google/files/:fileId` - Get file metadata
- `GET /api/google/files/:fileId/download` - Download file
- `POST /api/google/files/upload` - Upload file (multipart/form-data)
- `DELETE /api/google/files/:fileId` - Delete file
- `POST /api/google/files/:fileId/share` - Share file publicly

### Excel/XLSX Operations
- `GET /api/google/xlsx/:fileId` - Read XLSX file from Drive (returns JSON)
- `POST /api/google/xlsx/upload` - Create and upload XLSX file
  ```json
  {
    "fileName": "report.xlsx",
    "data": [
      ["Name", "Email", "Status"],
      ["John Doe", "john@example.com", "Active"],
      ["Jane Smith", "jane@example.com", "Active"]
    ],
    "sheetName": "Users",
    "folderId": "optional-folder-id"
  }
  ```

## Features

✅ Upload any file type to Google Drive
✅ Download files from Google Drive
✅ Read Excel (.xlsx) files and convert to JSON
✅ Create Excel files from JSON data and upload to Drive
✅ List files in Drive
✅ Share files (make publicly accessible)
✅ Delete files
✅ Organize files in folders

## Security Notes

- Never commit `.env` file to git
- Keep OAuth credentials secure
- Refresh tokens have long expiration but can be revoked
- Use environment variables for production deployment

## For Railway Deployment

Add these environment variables in Railway:
- `GOOGLE_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (use your production URL)
- `GOOGLE_REFRESH_TOKEN`

Update the redirect URI in Google Cloud Console to include your Railway URL.

## Troubleshooting

### "Google Drive not configured" error
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart the server after updating `.env`

### "OAuth client not initialized" error
- Missing OAuth credentials in environment variables
- Check for typos in variable names

### "Invalid grant" error
- Refresh token may have expired or been revoked
- Re-run the authorization flow (Step 3)
- Generate a new refresh token

### "Access denied" error
- Check that Drive API is enabled in Google Cloud Console
- Verify OAuth consent screen is configured
- Ensure your account is added as a test user

## Support

For more information, see:
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
