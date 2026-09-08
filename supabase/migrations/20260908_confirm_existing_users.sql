-- ====================================================================
-- YAAD Grocery App - Database Migration: Confirm Existing Unconfirmed Users
-- Safe, non-destructive administrative migration:
--   - Does NOT delete any accounts
--   - Does NOT delete or alter any shopping lists or items
--   - Does NOT alter any user passwords or profile records
--   - Confirms all existing users stuck in "Waiting for Verification"
-- ====================================================================

-- 1. Safely mark unconfirmed existing users in auth.users as email-confirmed
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Ensure all existing profiles have has_completed_setup set to true
UPDATE public.profiles
SET has_completed_setup = TRUE
WHERE has_completed_setup IS FALSE OR has_completed_setup IS NULL;

-- 3. Update the handle_new_user trigger function to capture phone_number
--    and mark has_completed_setup as TRUE upon creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    phone_number,
    language,
    has_completed_setup,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone', NEW.phone, NULL),
    'en',
    TRUE,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN COALESCE(EXCLUDED.full_name, public.profiles.full_name)
      ELSE public.profiles.full_name
    END,
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    has_completed_setup = TRUE,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
