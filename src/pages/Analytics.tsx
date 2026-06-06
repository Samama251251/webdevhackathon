import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, FileText, ArrowRight, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CallReport {
    id: string;
    created_at: string;
    passed: boolean;
    call_type: 'behavioral' | 'technical';
    strengths: string[];
    weaknesses: string[];
}

export default function Analytics() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<CallReport[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('call_reports')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching reports:', error);
                } else {
                    setReports(data || []);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleTabChange = (tabId: string) => {
        navigate('/dashboard', { state: { tab: tabId } });
    };

    // Calculate statistics
    const totalReports = reports.length;
    const passedCount = reports.filter(r => r.passed).length;
    const failedCount = totalReports - passedCount;
    const passRate = totalReports > 0 ? Math.round((passedCount / totalReports) * 100) : 0;

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background noise-overlay">
            <Navbar />

            <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative z-10">
                <Sidebar
                    user={user}
                    activeTab="analytics"
                    onTabChange={handleTabChange}
                    onSignOut={handleSignOut}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    resumeExists={true} 
                />

                <main className="flex-1 px-4 lg:px-8 py-8 lg:py-12 overflow-x-hidden min-h-[calc(100vh-4rem)]">
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mb-12">
                            <h1 className="text-3xl lg:text-5xl font-display tracking-tight text-foreground mb-4">
                                Interview Analytics
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                                Track your progress, review past interview performance, and identify areas for improvement.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-[400px] space-y-6 border border-foreground/10 rounded-2xl bg-card/50">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <div className="absolute inset-0 border-4 border-foreground/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-foreground rounded-full border-t-transparent animate-spin"></div>
                                    <BarChart3 className="h-8 w-8 text-foreground relative z-10" />
                                </div>
                                <h3 className="text-xl font-display text-foreground">Loading Analytics...</h3>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Statistics Cards */}
                                <div className="grid gap-6 md:grid-cols-3">
                                    <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card hover:shadow-xl transition-shadow duration-300">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-foreground/5 rounded-t-2xl px-6 pt-6">
                                            <CardTitle className="text-sm font-medium font-mono text-muted-foreground uppercase tracking-wider">Total Interviews</CardTitle>
                                            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-foreground" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 py-6">
                                            <div className="text-5xl font-display tracking-tighter text-foreground mb-2">{totalReports}</div>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                Completed sessions
                                            </p>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                                        <div className={`absolute top-0 inset-x-0 h-1 ${passRate >= 70 ? 'bg-green-500' : passRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-foreground/5 rounded-t-2xl px-6 pt-6">
                                            <CardTitle className="text-sm font-medium font-mono text-muted-foreground uppercase tracking-wider">Pass Rate</CardTitle>
                                            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                                                <Activity className="h-4 w-4 text-foreground" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 py-6">
                                            <div className="text-5xl font-display tracking-tighter text-foreground mb-2 flex items-baseline">
                                                {passRate}<span className="text-3xl text-muted-foreground ml-1">%</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                <span className="text-green-600 dark:text-green-400 font-semibold">{passedCount} passed</span>, <span className="text-red-600 dark:text-red-400 font-semibold">{failedCount} failed</span>
                                            </p>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card hover:shadow-xl transition-shadow duration-300">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-foreground/5 rounded-t-2xl px-6 pt-6">
                                            <CardTitle className="text-sm font-medium font-mono text-muted-foreground uppercase tracking-wider">Recent Activity</CardTitle>
                                            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4 text-foreground" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 py-6">
                                            <div className="text-3xl font-display tracking-tight text-foreground mb-4">
                                                {reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                Last interview date
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Reports List */}
                                <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b border-foreground/5 pb-6">
                                        <CardTitle className="font-display text-2xl">Recent Reports</CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            A list of your recent interview sessions and their outcomes.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {reports.length === 0 ? (
                                            <div className="text-center py-20 px-4 text-muted-foreground flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                                                    <FileText className="h-10 w-10 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-xl font-display text-foreground mb-2">No interview reports found.</p>
                                                <p className="max-w-sm">Start practicing in the dashboard to generate performance analytics.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-foreground/5">
                                                {reports.map((report) => (
                                                    <div
                                                        key={report.id}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors cursor-pointer group"
                                                        onClick={() => navigate(`/call-analysis/${report.id}`)}
                                                    >
                                                        <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                                            <div className={`p-3 rounded-2xl flex items-center justify-center ${report.passed ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                                                                {report.passed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-display text-xl text-foreground capitalize mb-1 group-hover:underline underline-offset-4">
                                                                    {report.call_type} Interview
                                                                </p>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                                                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                                    <span>{new Date(report.created_at).toLocaleTimeString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" className="sm:w-auto w-full justify-between sm:justify-center rounded-xl hover:bg-foreground/5 group-hover:text-foreground">
                                                            View Report <ArrowRight className="ml-2 h-4 w-4 sm:group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
