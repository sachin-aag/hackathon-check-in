# Column Mapping Reference

## Your Google Sheet Columns

The app reads from and writes to these columns in your "participants" tab:

### Columns Used by the App

| Column Name | Purpose | Read/Write | Required |
|------------|---------|------------|----------|
| `email` | Participant identifier | Read | Yes |
| `approval_status` | Must be "approved" to check in | Read | Yes |
| `team_name` | Team name entered by user | Read/Write | Yes (form) |
| `project_idea` | Project description | Read/Write | Yes (form) |
| `food_preferences` | Dietary restrictions/preferences | Read/Write | Optional |
| `photo_consent` | Photo consent ("yes" or "no") | Read/Write | **Yes (required)** |
| `checked_in_at` | Check-in timestamp | Write | Auto-generated |

**⚠️ IMPORTANT:** You need to manually add the `photo_consent` column to your Google Sheet if it doesn't exist!

### Columns Ignored by the App

All other columns in your sheet are ignored:
- api_id
- name
- first_name
- last_name
- phone_number
- created_at
- custom_source
- qr_code_url
- amount
- amount_tax
- amount_discount
- currency
- coupon_code
- eth_address
- solana_address
- survey_response_rating
- survey_response_feedback
- ticket_type_id
- ticket_name
- What is your LinkedIn profile?
- I am aware that the hackathon is in-person in Stuttgart.
- How did you hear about this event?
- cursor_credit_code

**These columns are safe** - the app won't modify them.

## How the App Works

### On Email Entry
1. User enters email
2. App searches for row with matching email (case-insensitive)
3. Checks if `approval_status` == "approved"
4. Checks if `team_name` and `project_idea` are filled

### On Form Submission
1. App finds the row with matching email
2. Updates these columns:
   - `team_name`
   - `project_idea`
   - `food_preferences`
   - `photo_consent` ("yes" or "no")
   - `checked_in_at` (current timestamp)

### On Edit
1. Same as form submission - overwrites existing values
2. Updates `checked_in_at` with new timestamp

## Important Notes

- ✅ The app uses the **"participants"** tab by name
- ✅ If "participants" tab doesn't exist, it falls back to the first sheet
- ✅ All email matching is case-insensitive
- ✅ Team names are stored as entered but matched case-insensitively
- ✅ Only approved participants can check in
- ✅ Existing data in other columns is preserved

## Testing Checklist

Before using the app:
- [ ] Make sure you have a "participants" tab in your sheet
- [ ] Verify you have all 7 required columns (exact names)
- [ ] Add at least one test email with `approval_status` = "approved"
- [ ] Share the sheet with your service account email (Editor access)
- [ ] Configure your `.env` file with the correct credentials

## Quick Test

1. Find your email in the sheet
2. Set `approval_status` to "approved"
3. Leave `team_name`, `project_idea`, `food_preferences`, `photo_consent` empty
4. Run the app and enter your email
5. Fill out the form and submit
6. Check the sheet - the 5 columns should now be filled!
