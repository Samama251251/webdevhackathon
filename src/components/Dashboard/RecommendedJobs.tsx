import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Building2, ExternalLink, ThumbsUp, AlertCircle, Briefcase } from 'lucide-react';
import { resumeService } from '@/services/resumeService';
import type { JobRecommendation } from '@/types/resume';

interface RecommendedJobsProps {
    resumeId: string;
    userId: string;
}

export function RecommendedJobs({ resumeId, userId }: RecommendedJobsProps) {
    const [jobs, setJobs] = useState<JobRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await resumeService.getRecommendedJobs(resumeId, userId);
                if (response.success) {
                    setJobs(response.jobs);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError('Failed to load job recommendations');
            } finally {
                setLoading(false);
            }
        };

        if (resumeId && userId) {
            fetchJobs();
        }
    }, [resumeId, userId]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
        if (score >= 60) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
        return 'bg-foreground/5 text-foreground border-foreground/10';
    };

    const getBorderColor = (score: number) => {
        if (score >= 80) return 'border-l-green-500 dark:border-l-green-400';
        if (score >= 60) return 'border-l-yellow-500 dark:border-l-yellow-400';
        return 'border-l-foreground/30';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-6 relative">
                    <Loader2 className="h-8 w-8 animate-spin text-foreground absolute" />
                </div>
                <p className="text-foreground font-medium text-lg mb-2">Finding the best jobs for you...</p>
                <p className="text-sm text-muted-foreground font-mono">This utilizes AI to match your skills with job requirements</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/20 bg-destructive/5 rounded-2xl max-w-2xl mx-auto mt-12">
                <CardContent className="pt-10 pb-8 text-center text-destructive">
                    <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-medium">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-6 rounded-full border-destructive/20 hover:bg-destructive/10 text-destructive"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (jobs.length === 0) {
        return (
            <Card className="border-foreground/10 rounded-2xl bg-card shadow-sm max-w-2xl mx-auto mt-12">
                <CardContent className="py-16 text-center text-muted-foreground">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-xl font-display text-foreground mb-2">No matching jobs found</p>
                    <p className="text-sm">Try updating your resume with more skills or check back later.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-display tracking-tight text-foreground mb-2">Recommended Jobs</h2>
                    <p className="text-muted-foreground">
                        AI-curated matches based on your resume profile
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm py-1.5 px-3 rounded-full bg-foreground/5 border-foreground/10">
                    {jobs.length} Matches Found
                </Badge>
            </div>

            <div className="grid gap-6">
                {jobs.map((job) => (
                    <Card 
                        key={job.job_id} 
                        className={`overflow-hidden hover:shadow-md transition-all duration-300 border border-foreground/10 border-l-4 rounded-2xl bg-card hover:translate-x-1 ${getBorderColor(job.compatibility_score)}`}
                    >
                        <CardHeader className="pb-4 pt-6 px-6 lg:px-8 bg-gradient-to-r from-muted/30 to-transparent border-b border-foreground/5">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-display tracking-tight text-foreground">
                                        {job.title}
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4 opacity-70" />
                                            <span>{job.company_name}</span>
                                        </div>
                                        <span className="hidden sm:inline text-foreground/20">•</span>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 opacity-70" />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 ${getScoreColor(job.compatibility_score)} shrink-0`}>
                                    <ThumbsUp className="h-4 w-4" />
                                    {job.compatibility_score}% Match
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 lg:p-8">
                            <div className="space-y-8">
                                <div className="bg-foreground/[0.02] p-5 rounded-xl border border-foreground/5">
                                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                        <span className="text-lg">✨</span> Why it's a match:
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">{job.match_explanation}</p>

                                    {job.alignment && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-foreground/5">
                                            <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                                                <p className="font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                                    <span className="bg-green-500/20 text-green-700 dark:text-green-400 w-5 h-5 flex items-center justify-center rounded-full text-xs">✓</span> Your Strengths
                                                </p>
                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                    {job.alignment.pros.map((pro, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <span className="text-green-500 mt-0.5">•</span>
                                                            <span className="leading-snug">{pro}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                                <p className="font-medium text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                                                    <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 w-5 h-5 flex items-center justify-center rounded-full text-xs">!</span> Potential Gaps
                                                </p>
                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                    {job.alignment.cons.map((con, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <span className="text-amber-500 mt-0.5">•</span>
                                                            <span className="leading-snug">{con}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {job.key_requirements && job.key_requirements.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Key Requirements</p>
                                        <div className="flex flex-wrap gap-2">
                                            {job.key_requirements.map((req, i) => (
                                                <Badge key={i} variant="secondary" className="bg-foreground/5 text-foreground hover:bg-foreground/10 border-foreground/10 font-medium px-3 py-1">
                                                    {req}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {job.description && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Description</p>
                                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                                            {job.description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-foreground/10 gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        {job.extensions?.salary && (
                                            <Badge variant="outline" className="text-xs font-mono border-foreground/20 text-muted-foreground">
                                                {job.extensions.salary}
                                            </Badge>
                                        )}
                                        {job.extensions?.schedule_type && (
                                            <Badge variant="outline" className="text-xs font-mono border-foreground/20 text-muted-foreground">
                                                {job.extensions.schedule_type}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs font-mono border-foreground/20 text-muted-foreground">
                                            via {job.via}
                                        </Badge>
                                    </div>

                                    {job.apply_link && (
                                        <Button asChild className="rounded-full shrink-0 group hover-lift">
                                            <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                                                Apply Now <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
