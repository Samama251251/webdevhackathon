# Resume Analysis Feature - Setup Guide

This guide will help you set up and use the intelligent resume analysis feature.

## Overview

The resume analysis feature allows users to:
1. Upload PDF resumes
2. Automatically extract structured data (skills, experience, education, projects)
3. View parsed resume data in a clean, organized interface
4. Manage their resume profiles

## Setup Instructions

### 1. Supabase Configuration

#### A. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** section
3. Click **Create Bucket**
4. Name it: `resumes`
5. Set it as **Public** (or configure signed URLs)
6. Click **Create**

#### B. Set Storage Policies

Add these policies for the `resumes` bucket:

```sql
-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own resumes
CREATE POLICY "Users can read own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### C. Database Schema

The schema should already exist in your database (from `schema.md`). If not, run:

```sql
-- PROFILES TABLE (should already exist)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RESUMES TABLE
CREATE TABLE public.resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RESUME DETAILS TABLE
CREATE TABLE public.resume_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL UNIQUE,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    projects JSONB,
    parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "Users can view own resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own resumes"
ON public.resumes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own resumes"
ON public.resumes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for resume_details
CREATE POLICY "Users can view own resume details"
ON public.resume_details FOR SELECT
TO authenticated
USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage resume details"
ON public.resume_details FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### 2. Backend Setup

#### A. Navigate to Backend Directory

```bash
cd fast-backend-nov
```

#### B. Install Dependencies

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install pdfplumber httpx supabase python-dotenv
```

#### C. Configure Environment Variables

Create a `.env` file:

```env
# Grok API Key (get from https://x.ai)
GROK_API_KEY=xai-your-api-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to get these values:**

1. **Grok API Key**: 
   - Visit https://console.x.ai
   - Create an account or sign in
   - Generate an API key

2. **Supabase URL & Service Role Key**:
   - Go to your Supabase project
   - Navigate to **Settings** → **API**
   - Copy the `URL` and `service_role` key

#### D. Start Backend Server

```bash
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

#### A. Update Environment Variables

In `webdevhackathon/.env` (or `.env.local`), add:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### B. Install Dependencies (if not already done)

```bash
cd webdevhackathon
npm install
```

#### C. Start Frontend

```bash
npm run dev
```

## Usage Guide

### For Users

1. **Sign In / Sign Up**
   - Navigate to the sign-in page
   - Create an account or log in

2. **Upload Resume**
   - Go to Dashboard
   - Click on "Upload Resume" tab
   - Drag and drop your PDF resume or click to browse
   - Click "Upload and Analyze"
   - Wait for the analysis to complete (usually 10-30 seconds)

3. **View Resume Profile**
   - After upload completes, you'll be automatically redirected to the "My Resume" tab
   - View your extracted:
     - Skills (displayed as badges)
     - Work Experience (with timeline)
     - Education
     - Projects

4. **Delete Resume**
   - Go to "My Resume" tab
   - Click "Delete Resume" button
   - Confirm deletion

### File Requirements

- **Format**: PDF only
- **Size**: Maximum 10MB
- **Content**: Should contain standard resume sections (experience, education, skills, etc.)

## Architecture

### Data Flow

```
1. User uploads PDF
   ↓
2. Frontend → Supabase Storage (stores file)
   ↓
3. Frontend → Supabase DB (creates resume record)
   ↓
4. Frontend → Backend API (/api/resume/analyze)
   ↓
5. Backend downloads PDF from Supabase Storage
   ↓
6. Backend extracts text using pdfplumber
   ↓
7. Backend calls Grok LLM for structured extraction
   ↓
8. Backend saves to resume_details table
   ↓
9. Frontend displays parsed data
```

### Components

**Backend:**
- `services/resume_processor.py` - PDF processing and LLM integration
- `services/supabase_client.py` - Database operations
- `main.py` - API endpoints

**Frontend:**
- `types/resume.ts` - TypeScript interfaces
- `services/resumeService.ts` - API communication
- `components/Dashboard/ResumeUpload.tsx` - Upload UI
- `components/Dashboard/ResumeProfile.tsx` - Display UI
- `pages/Dashboard.tsx` - Main dashboard

## API Endpoints

### POST /api/resume/analyze

Analyzes uploaded resume.

**Request:**
```json
{
  "resume_id": "uuid",
  "file_url": "https://...",
  "user_id": "uuid"
}
```

### GET /api/resume/{resume_id}/details

Gets parsed resume details.

### GET /api/user/{user_id}/resumes

Gets all resumes for a user.

### DELETE /api/resume/{resume_id}

Deletes a resume.

## Troubleshooting

### Upload Issues

**Problem**: "Upload failed" error
- Check Supabase storage bucket exists and is named `resumes`
- Verify storage policies are set correctly
- Ensure file is a valid PDF under 10MB

**Problem**: "Analysis failed" error
- Check backend server is running
- Verify Grok API key is valid
- Check backend logs for detailed error

### Display Issues

**Problem**: Resume shows "being processed" indefinitely
- Check backend logs for errors
- Verify Grok API is responding
- Check database policies allow service role to write

**Problem**: Resume not showing after upload
- Refresh the page
- Check browser console for errors
- Verify resume_details was created in database

### Backend Issues

**Problem**: Backend won't start
- Ensure all dependencies are installed
- Check `.env` file exists and has all required variables
- Verify Python version is 3.9+

**Problem**: "Failed to download PDF" error
- Ensure file_url in resumes table is accessible
- Check Supabase storage policies
- Verify file exists in storage bucket

## Development

### Adding New Extraction Fields

1. Update Grok prompt in `resume_processor.py`
2. Update TypeScript interfaces in `types/resume.ts`
3. Update database schema to include new fields
4. Update display component `ResumeProfile.tsx`

### Testing

Test with various resume formats:
- Single-column resumes
- Two-column resumes
- Different fonts and layouts
- Various experience levels (entry-level to senior)

## Security Notes

- Storage bucket policies restrict users to their own files
- RLS policies on database tables ensure users only see their data
- Backend verifies ownership before processing
- Service role key is used server-side only

## Next Steps

Future enhancements could include:
- Multiple resume versions
- Resume comparison
- Export to different formats
- Job matching based on resume
- Interview preparation based on resume skills

