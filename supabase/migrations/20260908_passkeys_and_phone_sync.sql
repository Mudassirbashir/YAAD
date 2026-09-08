-- ====================================================================
-- YAAD Grocery App - Migration: Passkeys (WebAuthn) and Phone Column Support
-- Safe, non-destructive migration ensuring existing accounts remain intact
-- ====================================================================

-- 1. Ensure public.profiles has both phone and phone_number columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Synchronize existing phone_number into phone and vice versa if one is missing
UPDATE public.profiles
SET phone = phone_number
WHERE phone IS NULL AND phone_number IS NOT NULL;

UPDATE public.profiles
SET phone_number = phone
WHERE phone_number IS NULL AND phone IS NOT NULL;

-- 2. Create user_passkeys table for WebAuthn public credential storage
CREATE TABLE IF NOT EXISTS public.user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0 NOT NULL,
  device_name TEXT,
  transports TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON public.user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_credential_id ON public.user_passkeys(credential_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_passkeys
DROP POLICY IF EXISTS "Users can view their own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can view their own passkeys"
  ON public.user_passkeys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can insert their own passkeys"
  ON public.user_passkeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can update their own passkeys"
  ON public.user_passkeys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own passkeys" ON public.user_passkeys;
CREATE POLICY "Users can delete their own passkeys"
  ON public.user_passkeys FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Automatic Trigger: Synchronize phone and phone_number columns in profiles
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

-- 4. Update handle_new_user() trigger function to safely handle OAuth & password signups
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
    avatar_url = CASE
      WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = ''
      THEN COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url)
      ELSE public.profiles.avatar_url
    END,
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    has_completed_setup = TRUE,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
