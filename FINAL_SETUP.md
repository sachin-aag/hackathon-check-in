# 🚀 Final Setup Steps

## Your Credentials Are Ready!

I've created a file called `.env.configured` with your Google Cloud credentials already filled in.

## What You Need to Do:

### Step 1: Get Your Google Sheet ID

1. Open your Google Sheet with the "participants" tab
2. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1ABC-xyz123-DEF456/edit
                                         ^^^^^^^^^^^^^^^^
                                         Copy this part!
   ```
3. Copy everything between `/d/` and `/edit` - that's your **Sheet ID**

### Step 2: Complete the .env File

1. Open the file `.env.configured` in this folder
2. Find this line:
   ```
   VITE_GOOGLE_SHEET_ID=your_sheet_id_here
   ```
3. Replace `your_sheet_id_here` with your actual Sheet ID
4. Save the file
5. Rename `.env.configured` to `.env` (remove the .configured part)

**OR** use this terminal command (after replacing YOUR_SHEET_ID):
```bash
cd "/Users/sachinagrawal/AI/cursor hack/check in app"
cat > .env << 'EOF'
VITE_GOOGLE_SHEET_ID=YOUR_SHEET_ID
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQbt+P9TvPSdnM\nFyW7airQ3eMh8GaIioGe+kZPZjImN36/jpvtac7kZVk+4BPi9I8df9B573YLE3bN\nbjPzQK/qlPbjVsCUM6NK+BzQt6EHa4SRBwdF68v4Ga6c3K844CkC6e30yap3kn5p\nyREGLh649sZ1oGxSs5he+IOOMTXJZmczG01Izm72bF58+NatqCUqgqYuGeZaqH5x\nGVjeIyIn4DyG8+JU34+KEITQ8LW0PD2wRrzNCdFXg4aqcHkuolTq57goLENq0Qwl\njWhVuLFek1dG+xx5ZHoAu/E+7K0+2gwCbsaitDCSwnBgHfFrjJfL2zLrydQDmQbE\niDgvp2+dAgMBAAECggEABfDjFmtbBRGJz7NpM+pWxhVNAA6mHYY1I57mmiTDkStL\nxZH/B8lYSFJLNOuWJYXq/mBCRPd6Wd54KGrXuDtDyF/umZRDcPX31Y804w4Y3OlH\nogqdPnT2H2A8BeSUaf6ZrKeWTL/ix/249LLydUajQYpnJbso20KbOTnEJi1o5xCi\n7VJdjGD4KMwK7TN8WNs4CPm5bYhjND36qsQ4SsHenOVSTN+A6itS4qfYmbuHk+pV\nNYTjAEJ/QEYqKFM+nGqqZblNE1V7wuvqcOxjRKDterDKP/12a2wSe+z1Pt74nmyy\n+v6OtSwiVRuyzf9VymKxcbNu1/he3LmXqKF8/i/qUQKBgQD+nVSlWrSoFxPaYc8t\nktWUogMsX2JAQt+IfJlYH13fySGSoEMSoT3ckG9ZscJKC70/qPoKQb+VFJ1yq53v\nmx317dXwlnIdIbDkTuABI38L1NwLbOpFkPaIgUMENndEXG73bGqS753OO5LQCosL\nznj0x5M7CRRgyZrmggc8K8nCNwKBgQDRkTajt3xgHugtUr8Z+6LAMr2jkis2ueJT\nl3ZDw2ht2HMgAdo6XhU4dbEq58wd5Ii0l7tbxknBFtmvVlbLZ3zb65Grhmmw625b\nzPh6PkIg7kUlX1AZHc9CFKdcVkU9Yw9XgYXjJ3XV1hXfsNOceEhJD6w16WUHFcAh\nDSxXmwoCywKBgQDqUa5psq1ZmEtsCeGZxm0KqYMUHgAUtbZ0LH8PC2bgIYDlKNox\nVfTRfJcNS7tLW7xhzse2EsYWk+9Gbcwei3mqL6RZEouYZb4ejrw2MA2mvNF5LlX3\nia5o99TOFrXyUsLIr5zw9tYaytaU4W8PgYftdZH4naWEYWVNx9KSvJWkRwKBgFEJ\nM/Wut/t7OBB+lML5WP+1HzunA+rPikMEqIifgTwonKvdy4MSamZArFeI9pcAjhQ3\nMA3W6SIvMdHpMvrIc7Ger9+BxFDTWQNKiTLL7EpLmJVQ++oaatCEqAq+mVuZeI8/\n2IPz+E7Nz/uFpu40XM9TriXSsGxC7t5Y97KQkxhtAoGBANNW7OHnRmko6uVQCdxU\nusXddAjSmUbybifcDbD+N4+B9NiM1lwhfBtiPFvjKE3K5p0oO3iShYpy0ZqtKs7O\n21Rb0dAhCTxiU/HLBG5sb9ndexH7XKy9KggeT5VYPivO0c87ztywA3ddGrJJwswJ\nHNGlg+U5Hh3B+irUFKPkPN0n\n-----END PRIVATE KEY-----\n"
EOF
```

### Step 3: Share Your Google Sheet

1. Open your Google Sheet
2. Click the green **Share** button (top right)
3. Add this email as **Editor**:
   ```
   cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com
   ```
4. **Uncheck** "Notify people" (it's a service account)
5. Click **Share**

### Step 4: Verify Your Sheet

Make sure your "participants" tab has:
- A row with your email
- `approval_status` column set to "approved" (lowercase)
- These columns exist: `email`, `approval_status`, `team_name`, `project_idea`, `food_preferences`, `photo_consent`, `checked_in_at`

### Step 5: Run the App!

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

### Step 6: Test It!

1. Enter the email you added to the sheet
2. Fill out the check-in form
3. Submit
4. Check your Google Sheet - the data should appear! 🎉
5. Refresh the app and enter the same email - you should see your data with an Edit button

## Troubleshooting

**"Failed to connect to Google Sheets"**
- Make sure you shared the sheet with: `cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com`
- Verify the Sheet ID is correct
- Check that Google Sheets API is enabled in your Cloud project

**"Email not approved"**
- Verify `approval_status` = "approved" (lowercase, no spaces)
- Check the email spelling matches exactly (case-insensitive)

**Still having issues?**
- Check the browser console for error messages
- Make sure your `.env` file is named exactly `.env` (not `.env.configured`)
- Restart the dev server after changing `.env`

---

## 🎉 You're Almost There!

Just add your Sheet ID and share the sheet, then you're ready to go! 🚀

