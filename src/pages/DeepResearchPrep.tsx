import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Briefcase, Code, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resumeService } from '@/services/resumeService';

interface DeepResearchResponse {
    company_background: string;
    technical_questions: string[];
    behavioral_questions: string[];
    urls: string[];
}

export default function DeepResearchPrep() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DeepResearchResponse | null>(null);
    const [userResumeString, setUserResumeString] = useState<string>('');
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

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                    Deep Research Interview Prep
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Generate a comprehensive interview dossier tailored to your target company and role using AI-powered deep research.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr,1.5fr]">
                {/* Input Section */}
                <div className="space-y-6">
                    <Card className="border-2 border-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle>Target Role Details</CardTitle>
                            <CardDescription>
                                Enter the details of the position you are applying for.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input
                                        id="company"
                                        placeholder="e.g. Anthropic, Google"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role Title</Label>
                                    <Input
                                        id="role"
                                        placeholder="e.g. Senior Backend Engineer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tech">Key Technologies</Label>
                                    <Input
                                        id="tech"
                                        placeholder="e.g. Python, Rust, AWS"
                                        value={formData.technologies}
                                        onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Researching...
                                        </>
                                    ) : (
                                        'Generate Interview Dossier'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Quick Actions (Visible after result) */}
                    {result && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Ready to Practice?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-12 hover:border-primary hover:text-primary"
                                    onClick={() => handleStartInterview('behavioral')}
                                >
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Behavioral Simulation
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-12 hover:border-primary hover:text-primary"
                                    onClick={() => handleStartInterview('technical')}
                                >
                                    <span className="flex items-center gap-2">
                                        <Code className="h-4 w-4" />
                                        Technical Simulation
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Analyzing Company Profile...</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    Our agents are scanning recent engineering blogs, news, and interview reports.
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl text-muted-foreground bg-muted/30">
                            <Briefcase className="h-16 w-16 mb-4 opacity-20" />
                            <p>Enter job details to generate your prep dossier</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Company Background */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        Company Intelligence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="leading-relaxed text-muted-foreground">
                                        {result.company_background}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Technical Questions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Code className="h-5 w-5 text-blue-500" />
                                        Technical Questions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {result.technical_questions.map((q, i) => (
                                            <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm">{q}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Behavioral Questions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <User className="h-5 w-5 text-green-500" />
                                        Behavioral Questions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {result.behavioral_questions.map((q, i) => (
                                            <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm">{q}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Sources */}
                            {result.urls && result.urls.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <ArrowRight className="h-5 w-5 text-purple-500" />
                                            Sources
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {result.urls.map((url, i) => (
                                                <li key={i} className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline truncate"
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
    );
}
