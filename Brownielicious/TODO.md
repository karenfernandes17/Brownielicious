# TODO: Fix login/signup not saving to database

## Task: Any logins or sign ups do not get saved in the database tables

### Steps:

- [x] 1. Update supabase-setup.sql with trigger function to auto-create user profiles
- [x] 2. Update auth.js to remove manual profile insert (trigger handles it)
- [ ] 3. Apply the SQL changes to Supabase dashboard

### Instructions to apply SQL changes:

1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
2. Select your project (wbntreccoqqwvgbmtcec)
3. Click on "SQL Editor" in the left sidebar
4. Copy the new trigger section from supabase-setup.sql (the part starting with "-- AUTOMATIC USER PROFILE CREATION TRIGGER")
5. Run the SQL in the editor
6. After applying, existing users should be able to sign up and their profiles will be created automatically
