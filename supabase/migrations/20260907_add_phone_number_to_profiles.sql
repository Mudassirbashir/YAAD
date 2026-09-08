-- ====================================================================
-- YAAD Grocery App - Database Migration: Add phone_number to profiles
-- Safe, non-destructive migration ensuring existing accounts are untouched
-- ====================================================================

-- 1. Safely add phone_number column as nullable text
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 2. Add validation constraint allowing NULL or international phone format (7 to 25 chars)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS check_phone_number_format;

ALTER TABLE public.profiles 
ADD CONSTRAINT check_phone_number_format 
CHECK (phone_number IS NULL OR length(trim(phone_number)) BETWEEN 7 AND 25);

-- 3. Add index for quick lookups if queried
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);
