# 🚀 Netlify Functions Setup

## ✅ Architecture

```
React Frontend (Browser)
    ↓ API calls
Netlify Functions (Server-side)
    ↓ Secure access
Google Sheets API
```

## 📁 Project Structure

```
netlify/
├── functions/
│   ├── check-email.js       ← Checks if email is approved
│   ├── save-data.js         ← Saves form data to Google Sheets
│   └── assign-code.js       ← Assigns cursor credits
└── netlify.toml              ← Netlify configuration
```

## 🏃 Running Locally

### 1. Set Your Environment Variables

Create a `.env` file in the project root:
```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
```

### 2. Start the Development Server

```bash
npm run dev
```

This will start:
- ✅ Vite dev server (frontend) on `http://localhost:8888`
- ✅ Netlify Functions (backend) on `http://localhost:8888/.netlify/functions/`

### 3. Test It!

Open http://localhost:8888 and try the check-in flow!

## 🌐 Deploying to Netlify

### Option 1: Deploy via Netlify Dashboard (Easiest)

1. **Push your code to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Netlify will auto-detect the settings from `netlify.toml`

3. **Add Environment Variables**
   - In Netlify dashboard: Site settings → Environment variables
   - Add these three variables:
     - `GOOGLE_SHEET_ID`
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`

4. **Deploy!**
   - Click "Deploy site"
   - Every git push will auto-deploy

### Option 2: Deploy via Netlify CLI

```bash
# Login to Netlify
npx netlify login

# Initialize site
npx netlify init

# Set environment variables (use your actual values)
npx netlify env:set GOOGLE_SHEET_ID "your_sheet_id"
npx netlify env:set GOOGLE_SERVICE_ACCOUNT_EMAIL "your-service-account@project.iam.gserviceaccount.com"
npx netlify env:set GOOGLE_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"

# Deploy
npx netlify deploy --prod
```

## 🔒 Security Notes

✅ **Your private key is secure!**
- It's only in `.env` (which is gitignored)
- It only runs in Netlify Functions (server-side)
- **Never exposed to the browser**

✅ **Environment variables** are managed by Netlify
✅ **CORS is enabled** for your frontend to call the functions
✅ **No API keys exposed** in client-side code

## 📝 Environment Variables Needed on Netlify

When you deploy, add these in Netlify dashboard:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEET_ID` | Your Sheet ID from the Google Sheets URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email from Google Cloud |
| `GOOGLE_PRIVATE_KEY` | Full private key with `\n` characters |

## 🔍 Troubleshooting

**"Failed to connect to the server"**
- Make sure Netlify dev server is running (`npm run dev`)
- Check that functions are accessible at `http://localhost:8888/.netlify/functions/`

**"Failed to save data" on Netlify**
- Verify environment variables are set in Netlify dashboard
- Check Netlify function logs for errors
- Make sure Google Sheet is shared with service account

**Functions not deploying**
- Make sure `netlify.toml` is in root directory
- Verify all dependencies are in root `package.json`

---

**Need help?** Check the Netlify function logs in your dashboard!
