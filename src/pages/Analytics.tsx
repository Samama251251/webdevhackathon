import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Navbar />

            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar
                    user={user}
                    activeTab="analytics"
                    onTabChange={handleTabChange}
                    onSignOut={handleSignOut}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    resumeExists={true} // Assuming true for now or pass actual state if needed
                />

                <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div className="container mx-auto py-8 px-4 max-w-5xl">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Interview Analytics</h1>
                            <p className="text-muted-foreground">
                                Track your progress and review your past interview performance.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Statistics Cards */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalReports}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Completed sessions
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                                            <div className="h-4 w-4 text-muted-foreground font-bold">%</div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{passRate}%</div>
                                            <p className="text-xs text-muted-foreground">
                                                {passedCount} passed, {failedCount} failed
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Last interview date
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Reports List */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Reports</CardTitle>
                                        <CardDescription>
                                            A list of your recent interview sessions and their outcomes.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {reports.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No interview reports found. Start practicing to see results!
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {reports.map((report) => (
                                                    <div
                                                        key={report.id}
                                                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                                        onClick={() => navigate(`/call-analysis/${report.id}`)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-full ${report.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {report.passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium capitalize">
                                                                    {report.call_type} Interview
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(report.created_at).toLocaleDateString()} • {new Date(report.created_at).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            View Report <ArrowRight className="ml-2 h-4 w-4" />
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
