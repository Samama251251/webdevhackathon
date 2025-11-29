import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Building2, ExternalLink, ThumbsUp, AlertCircle } from 'lucide-react';
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
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-gray-500">Finding the best jobs for you...</p>
                <p className="text-xs text-gray-400 mt-2">This utilizes AI to match your skills with job requirements</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 text-center text-red-700">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4 border-red-200 hover:bg-red-100"
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
            <Card>
                <CardContent className="py-12 text-center text-gray-500">
                    <p>No matching jobs found at the moment.</p>
                    <p className="text-sm mt-2">Try updating your resume with more skills or check back later.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Recommended Jobs</h2>
                    <p className="text-muted-foreground">
                        AI-curated matches based on your resume profile
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {jobs.length} Matches Found
                </Badge>
            </div>

            <div className="grid gap-6">
                {jobs.map((job) => (
                    <Card key={job.job_id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: job.compatibility_score >= 80 ? '#22c55e' : job.compatibility_score >= 60 ? '#eab308' : '#9ca3af' }}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl text-primary">
                                        {job.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>{job.company_name}</span>
                                        <span className="text-gray-300">•</span>
                                        <MapPin className="h-4 w-4" />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full border text-sm font-semibold flex items-center gap-1.5 ${getScoreColor(job.compatibility_score)}`}>
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    {job.compatibility_score}% Match
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 border border-slate-100">
                                    <p className="font-semibold text-slate-900 mb-1">Why it's a match:</p>
                                    <p className="mb-3">{job.match_explanation}</p>

                                    {job.alignment && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                                            <div>
                                                <p className="font-medium text-green-700 mb-2 flex items-center gap-1">
                                                    <span className="bg-green-100 p-0.5 rounded-full">✓</span> Your Strengths
                                                </p>
                                                <ul className="list-disc list-inside space-y-1 text-slate-600">
                                                    {job.alignment.pros.map((pro, i) => (
                                                        <li key={i}>{pro}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-medium text-amber-700 mb-2 flex items-center gap-1">
                                                    <span className="bg-amber-100 p-0.5 rounded-full">!</span> Potential Gaps
                                                </p>
                                                <ul className="list-disc list-inside space-y-1 text-slate-600">
                                                    {job.alignment.cons.map((con, i) => (
                                                        <li key={i}>{con}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {job.key_requirements && job.key_requirements.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Requirements</p>
                                        <div className="flex flex-wrap gap-2">
                                            {job.key_requirements.map((req, i) => (
                                                <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                                    {req}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {job.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                        {job.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t mt-2">
                                    <div className="flex gap-2">
                                        {job.extensions?.salary && (
                                            <Badge variant="outline" className="text-xs">
                                                {job.extensions.salary}
                                            </Badge>
                                        )}
                                        {job.extensions?.schedule_type && (
                                            <Badge variant="outline" className="text-xs">
                                                {job.extensions.schedule_type}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                            via {job.via}
                                        </Badge>
                                    </div>

                                    {job.apply_link && (
                                        <Button asChild size="sm">
                                            <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                                                Apply Now <ExternalLink className="ml-2 h-3 w-3" />
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
