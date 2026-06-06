import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ResumeWithDetails } from '@/types/resume';
import { 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Calendar,
  Building,
  Trash2,
  FileText
} from 'lucide-react';

interface ResumeProfileProps {
  resume: ResumeWithDetails;
  onDelete?: () => void;
}

export const ResumeProfile = ({ resume, onDelete }: ResumeProfileProps) => {
  const { details } = resume;

  if (!details) {
    return (
      <Card className="w-full border-foreground/10 shadow-lg rounded-2xl bg-card">
        <CardHeader className="pb-8 pt-10 text-center">
          <CardTitle className="font-display text-3xl tracking-tight">Resume Profile</CardTitle>
          <CardDescription className="text-base">Your resume is being processed...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto animate-pulse">
                <FileText className="h-8 w-8 text-foreground/50" />
              </div>
              <p className="text-base text-muted-foreground font-medium">
                Resume analysis in progress. Please wait a moment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Delete Button */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-foreground/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-display tracking-tight text-foreground">Resume Overview</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            Uploaded: {new Date(resume.created_at).toLocaleDateString()}
          </p>
        </div>
        {onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Skills Section */}
      {details.skills && details.skills.length > 0 && (
        <Card className="border-foreground/10 shadow-sm rounded-2xl bg-card overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-muted/30 pb-4 border-b border-foreground/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <Code className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Skills</CardTitle>
                <CardDescription>Technical skills and expertise</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {details.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-foreground text-background hover:bg-foreground/90 px-3 py-1 text-sm font-medium">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {details.experience && details.experience.length > 0 && (
        <Card className="border-foreground/10 shadow-sm rounded-2xl bg-card overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-muted/30 pb-4 border-b border-foreground/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Work Experience</CardTitle>
                <CardDescription>Professional work history</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {details.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {index > 0 && <Separator className="my-6 border-foreground/10" />}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{exp.role}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1 font-medium">
                          <Building className="h-4 w-4" />
                          <span>{exp.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-full w-fit">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{exp.duration}</span>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-foreground/80 leading-relaxed mt-3">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {details.education && details.education.length > 0 && (
        <Card className="border-foreground/10 shadow-sm rounded-2xl bg-card overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-muted/30 pb-4 border-b border-foreground/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Education</CardTitle>
                <CardDescription>Academic background</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {details.education.map((edu, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-6 border-foreground/10" />}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">{edu.degree}</h3>
                    <p className="text-base text-muted-foreground font-medium">{edu.school}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/80 mt-2 font-mono">
                      {edu.field && <span>{edu.field}</span>}
                      {edu.year && (
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-0.5 rounded-md">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{edu.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      {details.projects && details.projects.length > 0 && (
        <Card className="border-foreground/10 shadow-sm rounded-2xl bg-card overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-muted/30 pb-4 border-b border-foreground/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <FolderGit2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Projects</CardTitle>
                <CardDescription>Notable projects and achievements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {details.projects.map((project, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-6 border-foreground/10" />}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-foreground">{project.name}</h3>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.split(',').map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs font-medium border-foreground/20 text-foreground/80">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <p className="text-sm text-foreground/80 leading-relaxed mt-2">{project.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!details.skills || details.skills.length === 0) &&
        (!details.experience || details.experience.length === 0) &&
        (!details.education || details.education.length === 0) &&
        (!details.projects || details.projects.length === 0) && (
          <Card className="border-foreground/10 shadow-sm rounded-2xl bg-card">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-medium mb-2">No data extracted</h3>
              <p className="text-muted-foreground">We couldn't extract any structured data from your resume.</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
};
