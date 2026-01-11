# Hackathon Check-In App

A React-based check-in application for hackathon participants that validates users via Google Sheets, collects team information, project ideas, dietary restrictions, and photo consent.

## Features

- ✅ Email validation against approved participant list
- 📝 Team information collection (case-insensitive)
- 💡 Project idea submission
- 🍽️ Dietary restrictions tracking
- 📸 Photo consent management
- ✏️ Edit capability for returning users
- 📱 Mobile-responsive design
- 🔒 Google Sheets backend for data persistence

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Google Sheets API
- **Package**: `google-spreadsheet` v4.1.4
- **Styling**: Modern CSS with responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Google Cloud Project with Sheets API enabled
- A Google Service Account

## Google Sheets Setup

### 1. Use Your Existing Google Sheet

Your Google Sheet should have the "participants" tab with these required columns:

| email | approval_status | team_name | project_idea | food_preferences | photo_consent | checked_in_at |
|-------|----------------|-----------|--------------|-----------------|---------------|---------------|

**Note**: The app uses these specific columns from your existing sheet. Other columns are ignored.

### 2. Set Up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Click "Create and Continue"
   - Skip optional steps and click "Done"

5. Create a Service Account Key:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the JSON file (keep it secure!)

6. Extract the following from the JSON file:
   - `client_email` (service account email)
   - `private_key` (private key)

### 3. Share the Google Sheet

1. Open your Google Sheet
2. Click the "Share" button
3. Add the service account email (from the JSON file) as an **Editor**
4. Get your Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

## Installation

1. Clone the repository:
   ```bash
   cd check-in-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   VITE_GOOGLE_SHEET_ID=your_sheet_id_here
   VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
   ```

   **Important Notes:**
   - Keep the private key in quotes
   - Include the full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers
   - Preserve the `\n` newline characters in the private key

## Running the App

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build

```bash
npm run build
npm run preview
```

## Application Flow

```
User Opens App
      ↓
Email Entry Screen
      ↓
Query Google Sheets
      ↓
   Approved?
   ├─ No → Show "Not Approved" Message
   └─ Yes → Already Filled Form?
            ├─ No → Show Check-in Form
            └─ Yes → Show Existing Data with Edit Button
                     ↓
                  Edit → Update Data in Sheets
```

## Google Sheets Data Structure

### Required Columns

- **email**: Participant email (lowercase, unique identifier)
- **approval_status**: Must be "approved" for user to check in
- **team_name**: Team name (stored case-insensitive)
- **project_idea**: Project description
- **food_preferences**: Dietary needs/food preferences (optional)
- **photo_consent**: "yes" or "no"
- **checked_in_at**: Check-in timestamp (auto-generated)

### Example Data

| email | approval_status | team_name | project_idea | food_preferences | photo_consent | checked_in_at |
|-------|----------------|-----------|--------------|-----------------|---------------|---------------|
| user@example.com | approved | Team Rocket | AI-powered app | Vegetarian | yes | 2026-01-10T20:30:00Z |

## Usage

### For Participants

1. Enter your email address
2. If approved:
   - First time: Fill out the check-in form
   - Returning: View your information with option to edit
3. Submit or update your information

### For Organizers

1. Maintain the Google Sheet with approved participant emails
2. Set `approval_status` to "approved" for authorized participants
3. Monitor check-ins and participant data in real-time
4. Export data as needed from Google Sheets

## Security Considerations

- **Never commit `.env` files** to version control
- Keep your service account credentials secure
- The private key should only be accessible to authorized personnel
- Consider implementing rate limiting for production deployments
- In production, use backend API to hide credentials (not client-side)

## Troubleshooting

### "Failed to connect to Google Sheets"

- Verify your Sheet ID is correct
- Ensure the service account email has Editor access to the sheet
- Check that the Google Sheets API is enabled in your Google Cloud project
- Verify your private key is properly formatted in the `.env` file

### "Email not approved"

- Check that the email exists in the Google Sheet
- Verify `approval_status` column is set to "approved" (lowercase)
- Ensure email matching is exact (case-insensitive)

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)
- Verify all environment variables are set correctly

## Development

### Project Structure

```
check-in-app/
├── src/
│   ├── components/
│   │   ├── EmailScreen.jsx
│   │   ├── NotApprovedScreen.jsx
│   │   ├── CheckInForm.jsx
│   │   └── DataReviewScreen.jsx
│   ├── services/
│   │   └── sheetsService.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## License

MIT

## Support

For issues or questions, please open an issue on the repository or contact the development team.
