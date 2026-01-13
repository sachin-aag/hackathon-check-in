# Quick Setup Guide

## Step 1: Install Dependencies
Already done! ✅

## Step 2: Set Up Google Sheets

1. Create a Google Sheet with these columns:
   ```
   email | approval_status | team_name | project_idea | dietary_restrictions | photo_consent | timestamp
   ```

2. Add test data:
   ```
   your.email@example.com | approved | | | | |
   ```

## Step 3: Create Service Account

1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable Google Sheets API
4. Create Service Account > Download JSON key
5. Share your sheet with the service account email (as Editor)

## Step 4: Configure Environment

Create `.env` file:
```env
VITE_GOOGLE_SHEET_ID=your_sheet_id_from_url
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
```

## Step 5: Run the App

```bash
npm run dev
```

Visit http://localhost:5173 (or the port shown in terminal)

## Test Flow

1. Enter your approved email
2. Fill out the check-in form
3. Submit
4. Refresh and enter same email - you'll see your data with edit option!

## Troubleshooting

- **Can't connect to Sheets**: Check service account has Editor access
- **Email not approved**: Verify `approval_status` = "approved" in sheet
- **Build errors**: Delete `node_modules` and run `npm install` again


