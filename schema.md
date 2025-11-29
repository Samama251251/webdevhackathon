-- 1. PROFILES (Users)
-- Linked to Supabase Auth
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RESUMES
-- Stores the file reference to your Supabase Storage Bucket
CREATE TABLE public.resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL, -- The public/signed URL or path in storage bucket
    file_name TEXT,         -- Original filename (e.g., "john_cv.pdf")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.1 STORAGE POLICIES (Bucket: "resumes")
-- Policy: Users can upload own resumes
-- (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Users can read own resumes
-- (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Users can delete own resumes
-- (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Public read access
-- bucket_id = 'resumes'

-- 3. RESUME DETAILS
-- Stores the parsed data. We use JSONB for flexible lists (Experience, Education, Projects)
-- and specific columns for high-level data.
CREATE TABLE public.resume_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL UNIQUE, -- 1-to-1 link
    
    -- Skills: A simple array of strings. e.g. ['React', 'Python', 'SQL']
    skills TEXT[], 
    
    -- Experience: Store as JSON structure
    -- Example: [{"company": "Google", "role": "Dev", "years": "2020-2022"}]
    experience JSONB, 
    
    -- Education: Store as JSON structure
    -- Example: [{"school": "MIT", "degree": "CS", "year": "2020"}]
    education JSONB, 
    
    -- Projects: Store as JSON structure
    -- Example: [{"name": "E-com App", "tech": "NextJS", "desc": "Built a shop..."}]
    projects JSONB,

    parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Trigger: Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();