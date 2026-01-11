# ⚡ Quick Start

## 🎯 Get Started in 5 Minutes!

Your app uses **Netlify Functions** - a serverless backend that's perfect for deployment.

## Step 1: Configure Environment

1. **Get your Google Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

2. **Create `.env` file** in the project root with your credentials:
   ```env
   GOOGLE_SHEET_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
   ```

3. **Share your Google Sheet** with the service account email (give it **Editor** access)

## Step 2: Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:8888 and test with an approved email!

## Step 3: Deploy to Netlify

### Quick Deploy:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Hackathon check-in app"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - "Add new site" → "Import from Git"
   - Select your repository
   - Netlify auto-detects settings ✨

3. **Add Environment Variables in Netlify Dashboard**
   - Site settings → Environment variables
   - Add:
     - `GOOGLE_SHEET_ID`
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`  
     - `GOOGLE_PRIVATE_KEY`

4. **Deploy!**
   - Your site goes live automatically
   - Get a URL like: `your-site-name.netlify.app`

## 🎉 Done!

That's it! Your check-in app is now live on Netlify.

---

## 🆘 Quick Troubleshooting

**Can't connect locally?**
- Make sure `.env` file exists with your credentials
- Verify Google Sheet is shared with service account

**Functions not working on Netlify?**
- Check environment variables are set in Netlify dashboard
- Look at Function logs in Netlify for errors
- Make sure Google Sheet is shared with the service account email
