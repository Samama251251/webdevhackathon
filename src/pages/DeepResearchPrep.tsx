import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Briefcase, Code, User, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resumeService } from '@/services/resumeService';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

interface DeepResearchResponse {
    company_background: string;
    technical_questions: string[];
    behavioral_questions: string[];
    urls: string[];
}

export default function DeepResearchPrep() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DeepResearchResponse | null>(null);
    const [userResumeString, setUserResumeString] = useState<string>('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        role: '',
        technologies: ''
    });

    useEffect(() => {
        const fetchResume = async () => {
            if (user) {
                try {
                    const resumeData = await resumeService.getLatestResumeWithDetails(user.id);
                    if (resumeData && resumeData.details) {
                        // Format resume details into a string for the AI
                        const details = resumeData.details;
                        const skills = details.skills?.join(', ') || '';
                        const experience = details.experience?.map((exp: any) =>
                            `${exp.role} at ${exp.company} (${exp.duration}): ${exp.description}`
                        ).join('; ') || '';
                        const projects = details.projects?.map((proj: any) =>
                            `${proj.name} (${proj.technologies}): ${proj.description}`
                        ).join('; ') || '';

                        const resumeString = `Skills: ${skills}. Experience: ${experience}. Projects: ${projects}`;
                        setUserResumeString(resumeString);
                    }
                } catch (error) {
                    console.error('Error fetching resume:', error);
                }
            }
        };

        fetchResume();
    }, [user]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/api/deep-research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success && data.data) {
                setResult(data.data);
            } else {
                console.error('Failed to get research results');
            }
        } catch (error) {
            console.error('Error fetching research:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartInterview = (type: 'behavioral' | 'technical') => {
        if (!result) return;

        const commonState = {
            company_name: formData.company_name,
            role: formData.role,
            technologies: formData.technologies,
            company_background: result.company_background,
            user_background: userResumeString || "Software Engineer with general experience",
        };

        if (type === 'behavioral') {
            navigate('/behavioral-interview', {
                state: {
                    ...commonState,
                    behavioral_questions: result.behavioral_questions,
                }
            });
        } else {
            navigate('/technical-interview', {
                state: {
                    ...commonState,
                    technical_questions: result.technical_questions,
                }
            });
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleTabChange = (tabId: string) => {
        if (tabId === 'interview') {
            return;
        }
        navigate('/dashboard', { state: { tab: tabId } });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background">
            <Navbar />

            <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
                <Sidebar
                    user={user}
                    activeTab="interview"
                    onTabChange={handleTabChange}
                    onSignOut={handleSignOut}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    resumeExists={!!userResumeString}
                />

                <main className="flex-1 px-4 lg:px-8 py-8 lg:py-12 overflow-x-hidden min-h-[calc(100vh-4rem)]">
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mb-12">
                            <h1 className="text-3xl lg:text-5xl font-display tracking-tight text-foreground mb-4">
                                Deep Research Prep
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                                Generate a comprehensive interview dossier tailored to your target company and role using AI-powered deep research.
                            </p>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
                            {/* Input Section */}
                            <div className="space-y-6">
                                <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card">
                                    <CardHeader className="pb-6 border-b border-foreground/5 bg-muted/30">
                                        <CardTitle className="font-display text-2xl tracking-tight">Target Role</CardTitle>
                                        <CardDescription className="text-base">
                                            Enter details of the position you are applying for.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <form onSubmit={handleSearch} className="space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                                                <Input
                                                    id="company"
                                                    placeholder="e.g. Anthropic, Google"
                                                    value={formData.company_name}
                                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                    required
                                                    className="rounded-xl h-12 bg-foreground/[0.02] border-foreground/10 focus-visible:ring-foreground/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role" className="text-sm font-medium">Role Title</Label>
                                                <Input
                                                    id="role"
                                                    placeholder="e.g. Senior Backend Engineer"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    required
                                                    className="rounded-xl h-12 bg-foreground/[0.02] border-foreground/10 focus-visible:ring-foreground/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tech" className="text-sm font-medium">Key Technologies</Label>
                                                <Input
                                                    id="tech"
                                                    placeholder="e.g. Python, Rust, AWS"
                                                    value={formData.technologies}
                                                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                                    required
                                                    className="rounded-xl h-12 bg-foreground/[0.02] border-foreground/10 focus-visible:ring-foreground/20"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 rounded-xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover-lift mt-2"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Researching...
                                                    </>
                                                ) : (
                                                    'Generate Dossier'
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions (Visible after result) */}
                                {result && (
                                    <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card border-t-4 border-t-foreground overflow-hidden">
                                        <CardHeader className="pb-4 bg-muted/20">
                                            <CardTitle className="flex items-center gap-2 font-display text-xl">
                                                <CheckCircle2 className="h-5 w-5 text-foreground" />
                                                Ready to Practice?
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pt-6">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between h-14 rounded-xl border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5 text-base"
                                                onClick={() => handleStartInterview('behavioral')}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    Behavioral Simulation
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between h-14 rounded-xl border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5 text-base"
                                                onClick={() => handleStartInterview('technical')}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                                                        <Code className="h-4 w-4" />
                                                    </div>
                                                    Technical Simulation
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Results Section */}
                            <div className="space-y-6">
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-6 border border-foreground/10 rounded-2xl bg-card/50">
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <div className="absolute inset-0 border-4 border-foreground/10 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-foreground rounded-full border-t-transparent animate-spin"></div>
                                            <Search className="h-8 w-8 text-foreground relative z-10 animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-display tracking-tight">Analyzing Company Profile</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto">
                                                Our AI is scanning recent engineering blogs, news, and interview reports to build your dossier.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!loading && !result && (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-foreground/20 rounded-2xl text-muted-foreground bg-muted/30 p-8 text-center">
                                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                                            <Briefcase className="h-10 w-10 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-xl font-display text-foreground mb-2">No Research Yet</h3>
                                        <p className="max-w-sm">Enter the job details on the left and click generate to build your personalized interview prep dossier.</p>
                                    </div>
                                )}

                                {result && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Company Background */}
                                        <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card overflow-hidden">
                                            <CardHeader className="bg-muted/30 border-b border-foreground/5 pb-4">
                                                <CardTitle className="flex items-center gap-3 font-display text-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                                                        <Briefcase className="h-5 w-5 text-foreground" />
                                                    </div>
                                                    Company Intelligence
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <p className="leading-relaxed text-foreground/80 text-base">
                                                    {result.company_background}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Technical Questions */}
                                        <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card overflow-hidden">
                                            <CardHeader className="bg-blue-500/5 border-b border-blue-500/10 pb-4">
                                                <CardTitle className="flex items-center gap-3 font-display text-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                        <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    Technical Questions
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <ul className="space-y-3">
                                                    {result.technical_questions.map((q, i) => (
                                                        <li key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-foreground/5 hover:border-foreground/10 transition-colors">
                                                            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-semibold mt-0.5">
                                                                {i + 1}
                                                            </span>
                                                            <span className="text-foreground/90 leading-relaxed text-base">{q}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        {/* Behavioral Questions */}
                                        <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card overflow-hidden">
                                            <CardHeader className="bg-green-500/5 border-b border-green-500/10 pb-4">
                                                <CardTitle className="flex items-center gap-3 font-display text-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    Behavioral Questions
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <ul className="space-y-3">
                                                    {result.behavioral_questions.map((q, i) => (
                                                        <li key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-foreground/5 hover:border-foreground/10 transition-colors">
                                                            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-semibold mt-0.5">
                                                                {i + 1}
                                                            </span>
                                                            <span className="text-foreground/90 leading-relaxed text-base">{q}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        {/* Sources */}
                                        {result.urls && result.urls.length > 0 && (
                                            <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card overflow-hidden">
                                                <CardHeader className="bg-muted/30 border-b border-foreground/5 pb-4">
                                                    <CardTitle className="flex items-center gap-3 font-display text-xl">
                                                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                                                            <ArrowRight className="h-5 w-5 text-foreground" />
                                                        </div>
                                                        Sources
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-6">
                                                    <ul className="space-y-2">
                                                        {result.urls.map((url, i) => (
                                                            <li key={i} className="flex gap-3 p-3 rounded-xl bg-muted/20 border border-foreground/5 hover:border-foreground/10 transition-colors">
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-foreground/70 hover:text-foreground font-mono truncate transition-colors hover:underline underline-offset-4"
                                                                >
                                                                    {url}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
