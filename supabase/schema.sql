-- 1. Create Enums
CREATE TYPE mezmur_language AS ENUM ('Amharic', 'Tigrinya', 'Geez', 'Oromo', 'English');
CREATE TYPE liturgical_season AS ENUM ('Fast of the Prophets', 'Nativity', 'Epiphany', 'Great Lent', 'Holy Week', 'Resurrection', 'Pentecost', 'Assumption', 'General');
CREATE TYPE review_status AS ENUM ('pending_review', 'approved', 'rejected');
CREATE TYPE app_role AS ENUM ('admin', 'moderator');

-- 2. Create User Roles Table
CREATE TABLE public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Create Mezmurs Table
CREATE TABLE public.mezmurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    language mezmur_language NOT NULL,
    liturgical_season liturgical_season NOT NULL,
    lyrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    status review_status NOT NULL DEFAULT 'pending_review',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Helper Security Functions
CREATE OR REPLACE FUNCTION public.authorize(required_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mezmurs ENABLE ROW LEVEL SECURITY;

-- User Roles Policies
CREATE POLICY "Users can read own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles"
ON public.user_roles FOR ALL
USING (public.authorize('admin'));

-- Mezmurs Policies
-- Public Select: Only approved records
CREATE POLICY "Public select approved mezmurs"
ON public.mezmurs FOR SELECT
USING (status = 'approved');

-- Staff Select: Staff can read everything
CREATE POLICY "Staff select all mezmurs"
ON public.mezmurs FOR SELECT
USING (public.is_staff());

-- Public Insert: Anyone can insert, but status must be pending_review
CREATE POLICY "Public insert pending mezmurs"
ON public.mezmurs FOR INSERT
WITH CHECK (status = 'pending_review');

-- Staff Update: Admin and Moderator can edit records and status
CREATE POLICY "Staff update mezmurs"
ON public.mezmurs FOR UPDATE
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- Admin Delete: Only admins can delete
CREATE POLICY "Admin delete mezmurs"
ON public.mezmurs FOR DELETE
USING (public.authorize('admin'));
