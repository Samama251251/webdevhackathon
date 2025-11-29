import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft, Loader2, Target, AlertTriangle } from 'lucide-react';

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

                    // If 404, we wait and retry
                    if (response.status === 404) {
                        // continue to wait
                    } else {
                        // For other errors, we might want to fail fast or retry?
                        // Let's assume we retry for robustness as requested
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
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <h2 className="text-2xl font-bold">Analyzing Interview...</h2>
                        <p className="text-muted-foreground">Please wait while we generate your feedback report.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <XCircle className="h-12 w-12 text-destructive mx-auto" />
                        <h2 className="text-2xl font-bold">Analysis Failed</h2>
                        <p className="text-muted-foreground">{error || 'Report not found'}</p>
                        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Interview Analysis</h1>
                            <p className="text-muted-foreground text-lg">
                                Detailed feedback on your {report.call_type} interview performance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Badge variant="outline" className="text-lg py-1 px-4 capitalize">
                                {report.call_type}
                            </Badge>
                            <Badge
                                variant={report.passed ? "default" : "destructive"}
                                className="text-lg py-1 px-4"
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

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths Card */}
                        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="h-6 w-6 text-green-600" />
                                    <CardTitle className="text-green-700 dark:text-green-400">Strengths</CardTitle>
                                </div>
                                <CardDescription>Areas where you excelled</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Weaknesses Card */}
                        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                                    <CardTitle className="text-orange-700 dark:text-orange-400">Areas for Improvement</CardTitle>
                                </div>
                                <CardDescription>Suggestions for your next interview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report.weaknesses.map((weakness, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
