export interface Resume {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  field: string;
  year: string;
}

export interface ProjectItem {
  name: string;
  technologies: string;
  description: string;
}

export interface ResumeDetails {
  id: string;
  resume_id: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  parsed_at: string;
}

export interface ResumeWithDetails extends Resume {
  details?: ResumeDetails | null;
}

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  resume_id?: string;
  file_url?: string;
}

export interface ResumeAnalyzeRequest {
  resume_id: string;
  file_url: string;
  user_id: string;
}

export interface ResumeAnalyzeResponse {
  success: boolean;
  message: string;
  data?: ResumeDetails;
}

export interface UploadProgress {
  uploading: boolean;
  analyzing: boolean;
  progress: number;
  error: string | null;
  completed: boolean;
}

export interface JobRecommendation {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  via: string;
  description?: string;
  thumbnail?: string;
  extensions?: Record<string, any>;
  apply_link?: string;
  compatibility_score: number;
  match_explanation: string;
  key_requirements?: string[];
  alignment?: {
    pros: string[];
    cons: string[];
  };
}

export interface JobRecommendResponse {
  success: boolean;
  message: string;
  jobs: JobRecommendation[];
}

