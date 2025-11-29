import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResumeUpload } from '@/components/Dashboard/ResumeUpload';
import { ResumeProfile } from '@/components/Dashboard/ResumeProfile';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { resumeService } from '@/services/resumeService';
import type { ResumeWithDetails } from '@/types/resume';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const loadResumeData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const latestResume = await resumeService.getLatestResumeWithDetails(user.id);
      setResume(latestResume);
      
      // If resume exists and has details, switch to profile tab
      if (latestResume && latestResume.details) {
        setActiveTab('profile');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
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
    setActiveTab('profile');
  };

  const handleDeleteResume = async () => {
    if (!resume || !user) return;

    const confirmed = window.confirm('Are you sure you want to delete this resume?');
    if (!confirmed) return;

    const success = await resumeService.deleteResume(resume.id, user.id);
    if (success) {
      setResume(null);
      setActiveTab('overview');
    } else {
      alert('Failed to delete resume. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.username || user?.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="profile" disabled={!resume}>
                My Resume
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Analysis</CardTitle>
                    <CardDescription>
                      Upload and analyze your resume with AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Get intelligent insights from your resume including skills extraction,
                      experience analysis, and more.
                    </p>
                    <Button onClick={() => setActiveTab('upload')}>
                      {resume ? 'Upload New Resume' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Status</CardTitle>
                    <CardDescription>Your current resume status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : resume ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Resume uploaded on{' '}
                          {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                        {resume.details ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-green-600">
                              ✓ Analysis complete
                            </p>
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => setActiveTab('profile')}
                            >
                              View Resume Profile →
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-600">
                            Analysis in progress...
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No resume uploaded yet. Upload your resume to get started.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Email:</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    {user?.username && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Username:</p>
                        <p className="font-medium">{user.username}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <ResumeUpload onUploadComplete={handleUploadComplete} />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              {resume ? (
                <ResumeProfile resume={resume} onDelete={handleDeleteResume} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No resume data available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

