# 🎁 Cursor Credit Code Feature

## Overview

After a user completes check-in, they automatically receive a **Cursor credit code** that they can share with themselves across devices (phone to laptop, etc.).

## How It Works

### 1. Code Assignment Flow

```
User submits check-in form
    ↓
Data saved to "Participants" tab
    ↓
App calls assign-code function
    ↓
Function finds first unassigned code in "Codes" tab
    ↓
Updates assigned_to column with user's email
    ↓
Shows code to user with sharing options
```

### 2. Google Sheets "Codes" Tab Structure

| cursor_credit_code | assigned_to |
|-------------------|-------------|
| CODE-ABC-123 | |
| CODE-DEF-456 | user@example.com |
| CODE-GHI-789 | |

**Columns:**
- `cursor_credit_code`: The actual Cursor credit code
- `assigned_to`: Email of the user it's assigned to (empty = unassigned)

### 3. Code Assignment Logic

- ✅ Checks if user already has a code (returns existing code)
- ✅ Finds first row where `assigned_to` is empty
- ✅ Assigns code to user's email
- ✅ Handles case when no codes are available

### 4. Sharing Options

Users can share their code via:

**📋 Copy to Clipboard**
- One-click copy
- Works on all devices
- Shows "Copied!" confirmation

**📧 Email to Myself**
- Opens default email client
- Pre-filled with code
- Easy to send from phone to laptop

**📤 Native Share (Mobile)**
- Uses device's native share sheet
- Works on iOS/Android
- Can share via any installed app (WhatsApp, Telegram, etc.)

## Files Added

### Backend Function
- `netlify/functions/assign-code.js` - Handles code assignment

### Frontend Component
- `src/components/CursorCreditScreen.jsx` - Displays code with sharing options

### Updated Files
- `src/services/sheetsService.js` - Added `assignCursorCode()` function
- `src/App.jsx` - Added cursor credit screen flow
- `src/App.css` - Added cursor credit styling

## Setup Required

### 1. Create "Codes" Tab in Google Sheets

Add a new tab called **"Codes"** with these columns:
```
cursor_credit_code | assigned_to
```

### 2. Add Your Codes

Fill in the `cursor_credit_code` column with your Cursor credit codes:
```
cursor_credit_code          | assigned_to
----------------------------|-------------
CURSOR-2026-ABC123          |
CURSOR-2026-DEF456          |
CURSOR-2026-GHI789          |
```

Leave `assigned_to` empty - the app will fill this automatically!

### 3. Share Access

Make sure the Google Sheet (with both tabs) is shared with your service account:
```
cursor-hackathon@cursor-hack-483918.iam.gserviceaccount.com
```

## User Experience

### First Time Check-in:
1. User fills out form
2. Submits
3. **Sees their Cursor code** 🎁
4. Can copy, email, or share it
5. Clicks "Continue to Dashboard"
6. Sees their check-in data

### Returning User:
- If they already have a code, they'll see it again
- Same code is returned (not a new one)
- Can still share it

### No Codes Available:
- User sees friendly message
- Can still continue to dashboard
- Should contact organizers

## Testing

1. Add test codes to "Codes" tab
2. Check in with test email
3. Verify code is shown
4. Check "Codes" tab - `assigned_to` should be filled
5. Try checking in with same email - should get same code
6. Test sharing options (copy, email, native share on mobile)

## Mobile Optimization

✅ **Responsive Design** - Looks great on phone screens  
✅ **Large Touch Targets** - Easy to tap buttons  
✅ **Native Share** - Uses device's share functionality  
✅ **Copy/Paste** - Quick transfer between devices

## Security Notes

- Codes are only shown after successful check-in
- Each email can only get one code
- Codes can't be reassigned (assigned_to is permanent)
- All API calls go through secure Netlify Functions

---

## 🎉 Ready to Use!

The feature is fully implemented and ready to test. Just:
1. Create the "Codes" tab with your credit codes
2. Restart dev server: `npm run dev`
3. Test the full flow!

