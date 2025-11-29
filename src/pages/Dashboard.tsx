import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

import { ResumeUpload } from '@/components/Dashboard/ResumeUpload';
import { ResumeProfile } from '@/components/Dashboard/ResumeProfile';
import { RecommendedJobs } from '@/components/Dashboard/RecommendedJobs';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { resumeService } from '@/services/resumeService';
import type { ResumeWithDetails } from '@/types/resume';





export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<string>('resume');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const loadResumeData = async () => {
    if (!user) return;

    try {
      const latestResume = await resumeService.getLatestResumeWithDetails(user.id);
      setResume(latestResume);
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleUploadComplete = () => {
    loadResumeData();
    setActiveTab('resume');
  };

  const handleDeleteResume = async () => {
    if (!resume || !user) return;

    const confirmed = window.confirm('Are you sure you want to delete this resume?');
    if (!confirmed) return;

    const success = await resumeService.deleteResume(resume.id, user.id);
    if (success) {
      setResume(null);
      setActiveTab('resume');
    } else {
      alert('Failed to delete resume. Please try again.');
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={handleSignOut}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          resumeExists={!!resume}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Resume Tab */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Resume</h2>

              {resume ? (
                <ResumeProfile resume={resume} onDelete={handleDeleteResume} />
              ) : (
                <div className="max-w-2xl mx-auto mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Your Resume</CardTitle>
                      <CardDescription>
                        Upload your resume to get started with AI-powered analysis and job matching.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <ResumeUpload onUploadComplete={handleUploadComplete} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Job Matching */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Job Matching</h2>

              {resume && user ? (
                <RecommendedJobs resumeId={resume.id} userId={user.id} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">Please upload a resume to see job recommendations.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('resume')}>
                      Go to Resume
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Interview Prep */}
          {activeTab === 'interview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">AI Interview Prep</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Interview</CardTitle>
                  <CardDescription>Practice for your interviews with AI-powered mock sessions.</CardDescription>
                </CardHeader>

                <CardContent className="py-12 text-center space-y-4">
                  <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <span className="text-2xl">🎙️</span>
                  </div>
                  <h3 className="text-lg font-medium">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    We are working on a deep-learning powered interview preparation module to help you ace your interviews. Stay tuned!
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
