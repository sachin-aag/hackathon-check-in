# ⚡ Quick Start - Updated for Netlify Functions!

## 🎯 You're Almost Ready!

Your app now uses **Netlify Functions** - a serverless backend that's perfect for deployment.

## Step 1: Configure Environment (2 minutes)

1. **Get your Google Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

2. **Create `.env` file** in the project root:
   ```bash
   cat > .env << 'EOF'
   GOOGLE_SHEET_ID=paste_your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQbt+P9TvPSdnM\nFyW7airQ3eMh8GaIioGe+kZPZjImN36/jpvtac7kZVk+4BPi9I8df9B573YLE3bN\nbjPzQK/qlPbjVsCUM6NK+BzQt6EHa4SRBwdF68v4Ga6c3K844CkC6e30yap3kn5p\nyREGLh649sZ1oGxSs5he+IOOMTXJZmczG01Izm72bF58+NatqCUqgqYuGeZaqH5x\nGVjeIyIn4DyG8+JU34+KEITQ8LW0PD2wRrzNCdFXg4aqcHkuolTq57goLENq0Qwl\njWhVuLFek1dG+xx5ZHoAu/E+7K0+2gwCbsaitDCSwnBgHfFrjJfL2zLrydQDmQbE\niDgvp2+dAgMBAAECggEABfDjFmtbBRGJz7NpM+pWxhVNAA6mHYY1I57mmiTDkStL\nxZH/B8lYSFJLNOuWJYXq/mBCRPd6Wd54KGrXuDtDyF/umZRDcPX31Y804w4Y3OlH\nogqdPnT2H2A8BeSUaf6ZrKeWTL/ix/249LLydUajQYpnJbso20KbOTnEJi1o5xCi\n7VJdjGD4KMwK7TN8WNs4CPm5bYhjND36qsQ4SsHenOVSTN+A6itS4qfYmbuHk+pV\nNYTjAEJ/QEYqKFM+nGqqZblNE1V7wuvqcOxjRKDterDKP/12a2wSe+z1Pt74nmyy\n+v6OtSwiVRuyzf9VymKxcbNu1/he3LmXqKF8/i/qUQKBgQD+nVSlWrSoFxPaYc8t\nktWUogMsX2JAQt+IfJlYH13fySGSoEMSoT3ckG9ZscJKC70/qPoKQb+VFJ1yq53v\nmx317dXwlnIdIbDkTuABI38L1NwLbOpFkPaIgUMENndEXG73bGqS753OO5LQCosL\nznj0x5M7CRRgyZrmggc8K8nCNwKBgQDRkTajt3xgHugtUr8Z+6LAMr2jkis2ueJT\nl3ZDw2ht2HMgAdo6XhU4dbEq58wd5Ii0l7tbxknBFtmvVlbLZ3zb65Grhmmw625b\nzPh6PkIg7kUlX1AZHc9CFKdcVkU9Yw9XgYXjJ3XV1hXfsNOceEhJD6w16WUHFcAh\nDSxXmwoCywKBgQDqUa5psq1ZmEtsCeGZxm0KqYMUHgAUtbZ0LH8PC2bgIYDlKNox\nVfTRfJcNS7tLW7xhzse2EsYWk+9Gbcwei3mqL6RZEouYZb4ejrw2MA2mvNF5LlX3\nia5o99TOFrXyUsLIr5zw9tYaytaU4W8PgYftdZH4naWEYWVNx9KSvJWkRwKBgFEJ\nM/Wut/t7OBB+lML5WP+1HzunA+rPikMEqIifgTwonKvdy4MSamZArFeI9pcAjhQ3\nMA3W6SIvMdHpMvrIc7Ger9+BxFDTWQNKiTLL7EpLmJVQ++oaatCEqAq+mVuZeI8/\n2IPz+E7Nz/uFpu40XM9TriXSsGxC7t5Y97KQkxhtAoGBANNW7OHnRmko6uVQCdxU\nusXddAjSmUbybifcDbD+N4+B9NiM1lwhfBtiPFvjKE3K5p0oO3iShYpy0ZqtKs7O\n21Rb0dAhCTxiU/HLBG5sb9ndexH7XKy9KggeT5VYPivO0c87ztywA3ddGrJJwswJ\nHNGlg+U5Hh3B+irUFKPkPN0n\n-----END PRIVATE KEY-----\n"
   EOF
   ```

3. **Share your Google Sheet** with the service account:
   ```
   cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com
   ```
   (Give it **Editor** access, uncheck "Notify people")

## Step 2: Test Locally (1 minute)

```bash
npm run dev
```

Open http://localhost:8888 and test with an approved email!

## Step 3: Deploy to Netlify (5 minutes)

### Quick Deploy:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Hackathon check-in app"
   # Connect to your GitHub repo and push
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - "Add new site" → "Import from Git"
   - Select your repository
   - Netlify auto-detects settings ✨

3. **Add Environment Variables in Netlify**
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

## 📚 More Info

- **Full deployment guide**: See `NETLIFY_SETUP.md`
- **Column mapping**: See `COLUMN_MAPPING.md`
- **Troubleshooting**: See `NETLIFY_SETUP.md` (bottom section)

## 🆘 Quick Troubleshooting

**Can't connect locally?**
- Make sure `.env` file exists and has your Sheet ID
- Verify Google Sheet is shared with service account

**Functions not working on Netlify?**
- Check environment variables are set in Netlify dashboard
- Look at Function logs in Netlify for errors
- Make sure Google Sheet is shared with the service account email

