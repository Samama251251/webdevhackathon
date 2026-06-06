import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft, Target, AlertTriangle, FileText } from 'lucide-react';

interface CallReport {
    id: string;
    strengths: string[];
    weaknesses: string[];
    passed: boolean;
    call_type: 'technical' | 'behavioural';
    created_at: string;
}

export default function CallAnalysis() {
    const { callId } = useParams<{ callId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<CallReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!callId) return;

            setLoading(true);
            setError(null);

            let attempts = 0;
            const maxAttempts = 5; // 10 seconds total

            while (attempts < maxAttempts) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/call-report/${callId}`);

                    if (response.ok) {
                        const data = await response.json();
                        setReport(data);
                        setLoading(false);
                        return;
                    }

                    if (response.status === 404) {
                        // continue to wait
                    } else {
                        // Let's assume we retry for robustness
                    }
                } catch (err) {
                    // Ignore network errors during polling
                }

                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            setError('Could not load the analysis. Please try again later.');
            setLoading(false);
        };

        fetchReport();
    }, [callId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background noise-overlay">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center relative z-10">
                    <div className="text-center space-y-6 max-w-md w-full p-8 rounded-2xl border border-foreground/10 bg-card/50 shadow-lg">
                        <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-foreground/10 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-foreground rounded-full border-t-transparent animate-spin"></div>
                            <FileText className="h-8 w-8 text-foreground relative z-10 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-display tracking-tight text-foreground">Analyzing Interview</h2>
                            <p className="text-muted-foreground">Please wait while our AI models generate your personalized feedback report.</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background noise-overlay">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center relative z-10">
                    <div className="text-center space-y-6 max-w-md w-full p-8 rounded-2xl border border-destructive/20 bg-destructive/5 shadow-lg">
                        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-display tracking-tight text-foreground">Analysis Failed</h2>
                            <p className="text-muted-foreground">{error || 'Report not found'}</p>
                        </div>
                        <Button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full h-12 rounded-xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover-lift"
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background noise-overlay">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 max-w-5xl relative z-10">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Button
                        variant="ghost"
                        className="mb-8 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full px-4"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>

                    <div className="space-y-10">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-foreground/10">
                            <div className="space-y-2">
                                <h1 className="text-4xl lg:text-5xl font-display tracking-tight text-foreground">
                                    Interview Analysis
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Detailed feedback on your <span className="capitalize font-medium text-foreground">{report.call_type}</span> performance.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline" className="text-sm py-1.5 px-4 rounded-full border-foreground/20 bg-foreground/5 capitalize font-medium">
                                    {report.call_type}
                                </Badge>
                                <Badge
                                    className={`text-sm py-1.5 px-4 rounded-full font-medium ${
                                        report.passed 
                                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" 
                                            : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                    }`}
                                >
                                    {report.passed ? (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" /> Passed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4" /> Needs Improvement
                                        </span>
                                    )}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Strengths Card */}
                            <Card className="border-green-500/20 shadow-lg rounded-2xl bg-green-500/[0.02] overflow-hidden border-t-4 border-t-green-500">
                                <CardHeader className="bg-green-500/5 pb-6 border-b border-green-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="font-display text-2xl text-green-700 dark:text-green-400">Strengths</CardTitle>
                                            <CardDescription className="text-green-700/70 dark:text-green-400/70 mt-1">Areas where you excelled</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <ul className="space-y-4">
                                        {report.strengths.map((strength, index) => (
                                            <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-green-500/10 hover:border-green-500/30 transition-colors">
                                                <div className="bg-green-500/10 p-1 rounded-full shrink-0 mt-0.5">
                                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-foreground/90 leading-relaxed text-base">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Weaknesses Card */}
                            <Card className="border-orange-500/20 shadow-lg rounded-2xl bg-orange-500/[0.02] overflow-hidden border-t-4 border-t-orange-500">
                                <CardHeader className="bg-orange-500/5 pb-6 border-b border-orange-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="font-display text-2xl text-orange-700 dark:text-orange-400">Areas for Improvement</CardTitle>
                                            <CardDescription className="text-orange-700/70 dark:text-orange-400/70 mt-1">Suggestions for your next interview</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <ul className="space-y-4">
                                        {report.weaknesses.map((weakness, index) => (
                                            <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-orange-500/10 hover:border-orange-500/30 transition-colors">
                                                <div className="bg-orange-500/10 p-1.5 rounded-full shrink-0 mt-1">
                                                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                                                </div>
                                                <span className="text-foreground/90 leading-relaxed text-base">{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
