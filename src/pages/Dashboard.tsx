import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';

import { ResumeUpload } from '@/components/Dashboard/ResumeUpload';
import { ResumeProfile } from '@/components/Dashboard/ResumeProfile';
import { RecommendedJobs } from '@/components/Dashboard/RecommendedJobs';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { resumeService } from '@/services/resumeService';
import type { ResumeWithDetails } from '@/types/resume';
import { PanelLeftClose, PanelLeftOpen, FileText, Briefcase, Mic, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const sidebarItems = [
    {
      id: 'resume',
      label: 'Resume',
      icon: FileText,
      disabled: false
    },
    {
      id: 'jobs',
      label: 'Job Matching',
      icon: Briefcase,
      disabled: !resume
    },
    {
      id: 'interview',
      label: 'AI Interview Prep',
      icon: Mic,
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex-shrink-0 bg-white border-r min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out relative",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <div className="p-4 space-y-6">
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white shadow-md z-10 hover:bg-gray-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <div className={cn("flex items-center gap-3 px-2 overflow-hidden", isCollapsed && "justify-center px-0")}>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden transition-opacity duration-300">
                  <p className="font-medium truncate">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && setActiveTab(item.id)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground px-2",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? "Sign Out" : undefined}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2">Sign Out</span>}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'resume' && (
              <div className="space-y-6">
                {resume ? (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => {
                        if (window.confirm('Uploading a new resume will replace the current one. Continue?')) {
                          setResume(null);
                        }
                      }}>
                        Upload New Resume
                      </Button>
                    </div>
                    <ResumeProfile resume={resume} onDelete={handleDeleteResume} />
                  </div>
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
                    <div>
                      <h3 className="text-lg font-medium">Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mt-2">
                        We are working on a deep-learning powered interview preparation module to help you ace your interviews. Stay tuned!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
