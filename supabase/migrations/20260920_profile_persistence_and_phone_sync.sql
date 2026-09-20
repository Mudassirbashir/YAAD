-- ====================================================================
-- YAAD Grocery App - Production Migration: Profile Persistence & Phone Sync
-- Safe, non-destructive migration ensuring:
-- 1. Adds phone_number and phone columns if missing
-- 2. Preserves existing data without data loss
-- 3. Enforces phone format validation constraint
-- 4. Preserves/hardens Row Level Security (RLS) policies
-- 5. Enables authenticated users to read and update their own profile only
-- 6. Prevents users from viewing or modifying other users' profiles
-- 7. Updates handle_new_user() trigger to automatically save phone_number
-- ====================================================================

-- 1. Ensure phone_number and phone columns exist safely
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_setup BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS usage_purpose TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- 2. Bidirectional sync between phone_number and phone for existing records
UPDATE public.profiles
SET phone_number = phone
WHERE phone_number IS NULL AND phone IS NOT NULL;

UPDATE public.profiles
SET phone = phone_number
WHERE phone IS NULL AND phone_number IS NOT NULL;

-- 3. Validation constraint allowing NULL or valid phone string (7 to 25 chars)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_phone_number_format;
ALTER TABLE public.profiles ADD CONSTRAINT check_phone_number_format 
  CHECK (phone_number IS NULL OR length(trim(phone_number)) BETWEEN 7 AND 25);

-- 4. Create performance indexes for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 5. Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Strictly user-scoped access control
-- Policy: Select own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Insert own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Update own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Delete own profile
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 7. Synchronize phone and phone_number columns automatically on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.sync_profile_phone_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL AND (NEW.phone IS NULL OR NEW.phone <> NEW.phone_number) THEN
    NEW.phone := NEW.phone_number;
  ELSIF NEW.phone IS NOT NULL AND (NEW.phone_number IS NULL OR NEW.phone_number <> NEW.phone) THEN
    NEW.phone_number := NEW.phone;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_profile_phone_columns ON public.profiles;
CREATE TRIGGER trg_sync_profile_phone_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_phone_columns();

-- 8. Updated handle_new_user() trigger function with safe metadata extraction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    phone_number,
    phone,
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
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone', NEW.phone, NULL),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    TRUE,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN COALESCE(EXCLUDED.full_name, public.profiles.full_name)
      ELSE public.profiles.full_name
    END,
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    has_completed_setup = TRUE,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
