-- VoiceAssist Supabase PostgreSQL Schema & Security Policies
-- WCAG 2.1 AAA Compliant Voice Application Storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Tied to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en-US',
    speech_rate NUMERIC(3,2) DEFAULT 1.0,
    font_scale VARCHAR(20) DEFAULT 'large', -- 'normal', 'large', 'extra-large'
    high_contrast BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. VOICE_INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.voice_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_transcript TEXT NOT NULL,
    ai_response_text TEXT NOT NULL,
    intent_category VARCHAR(50) NOT NULL,
    language_code VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. SAVED_FORMS TABLE
CREATE TABLE IF NOT EXISTS public.saved_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_title TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SIMPLIFIED_DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.simplified_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    simplified_summary TEXT NOT NULL,
    key_action_items TEXT[],
    language_code VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR SPEED
CREATE INDEX IF NOT EXISTS idx_interactions_user ON public.voice_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_user ON public.saved_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_user ON public.simplified_documents(user_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_forms_updated_at ON public.saved_forms;
CREATE TRIGGER update_saved_forms_updated_at BEFORE UPDATE ON public.saved_forms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) / DATA ISOLATION RULES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simplified_documents ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLICIES FOR VOICE INTERACTIONS
DROP POLICY IF EXISTS "Users can view own interactions" ON public.voice_interactions;
CREATE POLICY "Users can view own interactions" ON public.voice_interactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interactions" ON public.voice_interactions;
CREATE POLICY "Users can insert own interactions" ON public.voice_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLICIES FOR SAVED FORMS
DROP POLICY IF EXISTS "Users can view own forms" ON public.saved_forms;
CREATE POLICY "Users can view own forms" ON public.saved_forms FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own forms" ON public.saved_forms;
CREATE POLICY "Users can manage own forms" ON public.saved_forms FOR ALL USING (auth.uid() = user_id);

-- POLICIES FOR SIMPLIFIED DOCUMENTS
DROP POLICY IF EXISTS "Users can view own docs" ON public.simplified_documents;
CREATE POLICY "Users can view own docs" ON public.simplified_documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own docs" ON public.simplified_documents;
CREATE POLICY "Users can manage own docs" ON public.simplified_documents FOR ALL USING (auth.uid() = user_id);
