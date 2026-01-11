# ⚠️ IMPORTANT: Add Photo Consent Column

## Action Required

You need to add a `photo_consent` column to your "Participants" tab in Google Sheets.

## Quick Fix

1. Open your Google Sheet
2. Go to the "Participants" tab
3. **Add a new column** called: `photo_consent`
4. Put it anywhere after `team_name`, `project_idea`, and `food_preferences`

## Recommended Column Order

For best organization, add it here:

```
... | team_name | project_idea | food_preferences | photo_consent | checked_in_at | ...
```

## How It Works

- The app will write `"yes"` or `"no"` to this column
- `"yes"` = User consented to photos
- `"no"` = User did not consent
- The checkbox is now **required** - users must tick it to complete check-in

## Current Sheet Columns (from your sheet)

Your current columns:
```
api_id, name, first_name, last_name, email, phone_number, created_at, 
approval_status, checked_in_at, custom_source, qr_code_url, amount, 
amount_tax, amount_discount, currency, coupon_code, eth_address, 
solana_address, survey_response_rating, survey_response_feedback, 
ticket_type_id, ticket_name, What is your LinkedIn profile?, 
I am aware that the hackathon is in-person in Stuttgart., 
How did you hear about this event?, cursor_credit_code, 
food_preferences, project_idea, team_name
```

**Missing:** `photo_consent` ← **Add this!**

## After Adding the Column

1. Save the Google Sheet
2. Restart your dev server
3. Test check-in - photo_consent will now be recorded!

---

**Note:** The code is already set up to write to `photo_consent`. Just add the column and it will work! ✅

