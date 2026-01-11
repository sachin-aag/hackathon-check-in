# 🚀 Netlify Functions Setup - COMPLETE!

## ✅ What I've Built

Your app now uses **Netlify Functions** (serverless backend) instead of trying to run Google Sheets in the browser.

### Architecture:

```
React Frontend (Browser)
    ↓ API calls
Netlify Functions (Server-side)
    ↓ Secure access
Google Sheets API
```

## 📁 New Files Created

```
netlify/
├── functions/
│   ├── check-email.js       ← Checks if email is approved
│   ├── save-data.js          ← Saves form data to Google Sheets
│   └── package.json          ← Dependencies for functions
└── netlify.toml              ← Netlify configuration
```

## 🔧 Updated Files

- **src/services/sheetsService.js** - Now calls Netlify functions instead of direct Google Sheets
- **package.json** - Added Netlify CLI for local development

## 🏃 Running Locally

### 1. Set Your Google Sheet ID

Edit `.env` file (or rename `.env.configured` to `.env`):
```env
GOOGLE_SHEET_ID=your_actual_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
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

# Set environment variables
npx netlify env:set GOOGLE_SHEET_ID "your_sheet_id"
npx netlify env:set GOOGLE_SERVICE_ACCOUNT_EMAIL "cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com"
npx netlify env:set GOOGLE_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"

# Deploy
npx netlify deploy --prod
```

## 🔒 Security Notes

✅ **Your private key is now secure!**
- It's only in `.env` (which is gitignored)
- It only runs in Netlify Functions (server-side)
- **Never exposed to the browser**

✅ **Environment variables** are managed by Netlify
✅ **CORS is enabled** for your frontend to call the functions
✅ **No API keys exposed** in client-side code

## 📝 Environment Variables Needed on Netlify

When you deploy, add these in Netlify dashboard:

| Variable | Value |
|----------|-------|
| `GOOGLE_SHEET_ID` | Your Sheet ID from URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Full private key with `\n` characters |

## 🧪 Testing the Functions

Test the functions directly:

```bash
# Check email
curl -X POST http://localhost:8888/.netlify/functions/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Save data
curl -X POST http://localhost:8888/.netlify/functions/save-data \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","formData":{"teamName":"Test Team","projectIdea":"Test Idea","dietaryRestrictions":"None","photoConsent":true}}'
```

## 🎉 You're Ready!

1. ✅ Add your Sheet ID to `.env`
2. ✅ Run `npm run dev` to test locally
3. ✅ Push to Git
4. ✅ Deploy to Netlify
5. ✅ Add environment variables in Netlify
6. ✅ Your app is live!

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
- Check `netlify/functions/package.json` exists
- Verify all dependencies are listed

---

**Need help?** Check the Netlify function logs in your dashboard!

