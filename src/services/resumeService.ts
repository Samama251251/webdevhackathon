import { supabase } from '@/lib/supabase';
import type {
  Resume,
  ResumeDetails,
  ResumeWithDetails,
  ResumeUploadResponse,
  ResumeAnalyzeRequest,
  ResumeAnalyzeResponse,
  JobRecommendResponse,
} from '@/types/resume';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const resumeService = {
  /**
   * Upload a PDF file to Supabase Storage
   */
  async uploadResumePDF(file: File, userId: string): Promise<ResumeUploadResponse> {
    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Create unique file name
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}_${file.name}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Create resume record in database
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          file_url: fileUrl,
          file_name: file.name,
        })
        .select()
        .single();

      if (resumeError) {
        throw new Error(`Failed to create resume record: ${resumeError.message}`);
      }

      return {
        success: true,
        message: 'Resume uploaded successfully',
        resume_id: resumeData.id,
        file_url: fileUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Trigger backend analysis of uploaded resume
   */
  async analyzeResume(
    resumeId: string,
    fileUrl: string,
    userId: string
  ): Promise<ResumeAnalyzeResponse> {
    try {
      const requestBody: ResumeAnalyzeRequest = {
        resume_id: resumeId,
        file_url: fileUrl,
        user_id: userId,
      };

      const response = await fetch(`${BACKEND_URL}/api/resume/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data: ResumeAnalyzeResponse = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Upload and analyze resume in one go
   */
  async uploadAndAnalyzeResume(
    file: File,
    userId: string,
    onProgress?: (step: string, progress: number) => void
  ): Promise<ResumeAnalyzeResponse> {
    try {
      // Step 1: Upload PDF (0-50%)
      onProgress?.('Uploading PDF...', 0);
      const uploadResult = await this.uploadResumePDF(file, userId);

      if (!uploadResult.success || !uploadResult.resume_id || !uploadResult.file_url) {
        throw new Error(uploadResult.message);
      }

      onProgress?.('Upload complete', 50);

      // Step 2: Analyze resume (50-100%)
      onProgress?.('Analyzing resume...', 50);
      const analyzeResult = await this.analyzeResume(
        uploadResult.resume_id,
        uploadResult.file_url,
        userId
      );

      if (!analyzeResult.success) {
        throw new Error(analyzeResult.message);
      }

      onProgress?.('Analysis complete', 100);
      return analyzeResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Get all resumes for a user
   */
  async getUserResumes(userId: string): Promise<Resume[]> {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch resumes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      return [];
    }
  },

  /**
   * Get parsed resume details
   */
  async getResumeDetails(resumeId: string): Promise<ResumeDetails | null> {
    try {
      const { data, error } = await supabase
        .from('resume_details')
        .select('*')
        .eq('resume_id', resumeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to fetch resume details: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching resume details:', error);
      return null;
    }
  },

  /**
   * Get resume with its parsed details
   */
  async getResumeWithDetails(resumeId: string): Promise<ResumeWithDetails | null> {
    try {
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (resumeError) {
        throw new Error(`Failed to fetch resume: ${resumeError.message}`);
      }

      const details = await this.getResumeDetails(resumeId);

      return {
        ...resumeData,
        details,
      };
    } catch (error) {
      console.error('Error fetching resume with details:', error);
      return null;
    }
  },

  /**
   * Delete a resume and its details
   */
  async deleteResume(resumeId: string, userId: string): Promise<boolean> {
    try {
      // First delete from resume_details (if exists)
      await supabase.from('resume_details').delete().eq('resume_id', resumeId);

      // Then delete from resumes
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete resume: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      return false;
    }
  },

  /**
   * Get the most recent resume for a user with details
   */
  async getLatestResumeWithDetails(userId: string): Promise<ResumeWithDetails | null> {
    try {
      const resumes = await this.getUserResumes(userId);

      if (!resumes || resumes.length === 0) {
        return null;
      }

      const latestResume = resumes[0];
      const details = await this.getResumeDetails(latestResume.id);

      return {
        ...latestResume,
        details,
      };
    } catch (error) {
      console.error('Error fetching latest resume:', error);
      return null;
    }
  },

  /**
   * Get recommended jobs based on resume
   */
  async getRecommendedJobs(
    resumeId: string,
    userId: string,
    location: string = 'Remote'
  ): Promise<JobRecommendResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
          user_id: userId,
          location: location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch job recommendations');
      }

      const data: JobRecommendResponse = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: errorMessage,
        jobs: [],
      };
    }
  },
};

