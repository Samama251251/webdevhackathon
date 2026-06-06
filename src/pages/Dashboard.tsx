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
import { Mic, ArrowRight, Zap } from 'lucide-react';

import { ResumeUpload } from '@/components/Dashboard/ResumeUpload';
import { ResumeProfile } from '@/components/Dashboard/ResumeProfile';
import { RecommendedJobs } from '@/components/Dashboard/RecommendedJobs';

import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { resumeService } from '@/services/resumeService';
import type { ResumeWithDetails } from '@/types/resume';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resume, setResume] = useState<ResumeWithDetails | null>(null);
  
  // Initialize tab from location state if available, default to 'resume'
  const initialTab = location.state?.tab || 'resume';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update active tab if location state changes
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

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
    <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
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
        <main className="flex-1 px-4 lg:px-8 py-8 lg:py-12 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-display tracking-tight mb-2">Resume Profile</h1>
                    <p className="text-muted-foreground">Manage your parsed resume data and skills.</p>
                  </div>
                </div>

                {resume ? (
                  <ResumeProfile resume={resume} onDelete={handleDeleteResume} />
                ) : (
                  <div className="max-w-2xl mx-auto mt-12">
                    <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card">
                      <CardHeader className="text-center pb-8 pt-10">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 border border-foreground/5 shadow-sm">
                          <span className="text-2xl">📄</span>
                        </div>
                        <CardTitle className="font-display text-3xl tracking-tight">Upload Your Resume</CardTitle>
                        <CardDescription className="text-base text-muted-foreground mt-2 max-w-sm mx-auto">
                          Upload your resume to get started with AI-powered analysis and job matching.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="px-8 pb-10">
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
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-display tracking-tight mb-2">Job Matches</h1>
                    <p className="text-muted-foreground">AI-curated opportunities based on your profile.</p>
                  </div>
                </div>

                {resume && user ? (
                  <RecommendedJobs resumeId={resume.id} userId={user.id} />
                ) : (
                  <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card mt-12 max-w-2xl mx-auto text-center">
                    <CardContent className="py-16">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 border border-foreground/5 shadow-sm">
                        <span className="text-2xl">💼</span>
                      </div>
                      <h2 className="text-2xl font-display mb-2">No Resume Found</h2>
                      <p className="text-muted-foreground mb-8">Please upload a resume to see AI-powered job recommendations.</p>
                      <Button onClick={() => setActiveTab('resume')} className="rounded-xl h-12 px-6">
                        Upload Resume
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Interview Prep Tab Content (Redirects or shows CTA) */}
            {activeTab === 'interview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-display tracking-tight mb-2">Interview Preparation</h1>
                    <p className="text-muted-foreground">Master your next interview with AI-powered mock sessions.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card relative overflow-hidden group hover:border-foreground/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-foreground group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                      <Zap className="w-32 h-32" />
                    </div>
                    <CardHeader className="relative z-10 pb-4">
                      <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-foreground" />
                      </div>
                      <CardTitle className="font-display text-2xl">Deep Research</CardTitle>
                      <CardDescription className="text-base">
                        Get company intelligence, tailored questions, and role-specific insights before your interview.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-4">
                      <Button 
                        onClick={() => navigate('/deep-research')}
                        className="w-full h-12 rounded-xl group/btn"
                      >
                        Start Deep Research
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card relative overflow-hidden group hover:border-foreground/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-foreground group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                      <Mic className="w-32 h-32" />
                    </div>
                    <CardHeader className="relative z-10 pb-4">
                      <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-4">
                        <Mic className="w-6 h-6 text-foreground" />
                      </div>
                      <CardTitle className="font-display text-2xl">AI Mock Interviews</CardTitle>
                      <CardDescription className="text-base">
                        Practice behavioral and technical questions with realistic AI voice interviewers.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-4 grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/behavioral-interview')}
                        className="h-12 rounded-xl border-foreground/20 hover:bg-foreground/5"
                      >
                        Behavioral
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/technical-interview')}
                        className="h-12 rounded-xl border-foreground/20 hover:bg-foreground/5"
                      >
                        Technical
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
