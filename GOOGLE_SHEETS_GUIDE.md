# Google Sheets Setup - Visual Guide

## 🎯 What You'll Need

1. A Google Account
2. 10-15 minutes
3. The check-in app running locally

---

## Step 1: Use Your Existing Google Sheet

### 1.1 Navigate to the "participants" Tab
- You already have a Google Sheet with participant data
- Make sure you're looking at the **"participants"** tab
- The app will read/write to this tab

### 1.2 Verify Required Columns

Your sheet already has the needed columns. The app uses these:

| email | approval_status | team_name | project_idea | food_preferences | photo_consent | checked_in_at |
|-------|----------------|-----------|--------------|-----------------|---------------|---------------|

**Other columns in your sheet are ignored** - the app only interacts with these 7 columns.

### 1.3 Check Your Test Data

Find a row with your email and make sure:
- `approval_status` = "approved" (lowercase)
- You can leave `team_name`, `project_idea`, `food_preferences`, `photo_consent`, and `checked_in_at` empty (the app will fill them)

---

## Step 2: Get Your Sheet ID

Look at your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/1ABC-xyz123-DEF456/edit
                                      ^^^^^^^^^^^^^^^^
                                      This is your Sheet ID
```

Copy everything between `/d/` and `/edit` - that's your **SHEET_ID**

---

## Step 3: Set Up Google Cloud Project (if not already done)

**Note**: If your sheet is already connected to a Google Cloud project with a service account, you can skip to Step 6 and just add the credentials to your `.env` file.

### 3.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 3.2 Create a New Project
- Click the project dropdown at the top
- Click "NEW PROJECT"
- Name it: "Hackathon Check-In"
- Click "CREATE"
- Wait for creation (takes ~30 seconds)

### 3.3 Enable Google Sheets API
- In the search bar, type "Sheets API"
- Click "Google Sheets API"
- Click the blue "ENABLE" button
- Wait for it to enable

---

## Step 4: Create Service Account

### 4.1 Navigate to Credentials
- Left sidebar: Click "Credentials"
- Or search "Credentials" in the top search bar

### 4.2 Create Service Account
- Click "**+ CREATE CREDENTIALS**" at the top
- Select "**Service Account**"

### 4.3 Fill Service Account Details
- **Service account name**: `hackathon-checkin`
- **Service account ID**: (auto-generated, keep it)
- **Description**: "Service account for hackathon check-in app"
- Click "**CREATE AND CONTINUE**"

### 4.4 Skip Optional Steps
- Grant access: Click "**CONTINUE**" (skip this)
- User access: Click "**DONE**" (skip this)

### 4.5 Create and Download Key
- You'll see your service account in the list
- Click on the email address (looks like: `hackathon-checkin@your-project.iam.gserviceaccount.com`)
- Go to the "**KEYS**" tab
- Click "**ADD KEY**" → "**Create new key**"
- Choose "**JSON**"
- Click "**CREATE**"
- A JSON file will download - **SAVE THIS SECURELY!**

---

## Step 5: Share Sheet with Service Account

### 5.1 Open the Downloaded JSON File
Find these two values:
```json
{
  "client_email": "hackathon-checkin@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n"
}
```

### 5.2 Share Your Google Sheet
- Go back to your Google Sheet
- Click the green "**Share**" button (top right)
- Paste the **client_email** from the JSON
- Make sure role is "**Editor**"
- **UNCHECK** "Notify people" (it's a service account, not a real person)
- Click "**Share**"

---

## Step 6: Configure the App

### 6.1 Open `.env` File
In your check-in app folder, open the `.env` file

### 6.2 Fill in the Values

```env
# Your Sheet ID (from Step 2)
VITE_GOOGLE_SHEET_ID=1ABC-xyz123-DEF456

# Client email from JSON file
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=hackathon-checkin@your-project.iam.gserviceaccount.com

# Private key from JSON file (keep the quotes!)
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_actual_private_key_goes_here\n-----END PRIVATE KEY-----\n"
```

**Important for Private Key**:
- Keep the double quotes around it
- Keep all the `\n` characters (they represent line breaks)
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts

---

## Step 7: Test the App!

### 7.1 Start the Dev Server
```bash
npm run dev
```

### 7.2 Test the Flow
1. Open http://localhost:5173 in your browser
2. Enter the email you added to the Google Sheet
3. You should see the check-in form!
4. Fill it out and submit
5. Check your Google Sheet - the data should appear! ✨

### 7.3 Test Edit Feature
1. Refresh the page
2. Enter the same email again
3. You should see your submitted data with an "Edit" button
4. Click Edit, change something, submit
5. Check the sheet - it should update!

---

## 🎉 You're Done!

Your check-in app is now connected to Google Sheets!

## Common Issues

### "Failed to connect to Google Sheets"
- ✅ Check that you shared the sheet with the service account email
- ✅ Verify the Sheet ID is correct (no extra spaces)
- ✅ Make sure Google Sheets API is enabled

### "Email not approved"
- ✅ Check spelling of email in sheet
- ✅ Verify `approval_status` = "approved" (lowercase, no extra spaces)

### "Error with private key"
- ✅ Make sure you copied the ENTIRE private key including BEGIN/END lines
- ✅ Keep the quotes around it in .env
- ✅ Don't remove the `\n` characters

---

## Need Help?

Check the main README.md or SETUP.md files for more detailed troubleshooting!

