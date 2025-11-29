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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Resume Profile</CardTitle>
          <CardDescription>Your resume is being processed...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500">
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resume Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Uploaded: {new Date(resume.created_at).toLocaleDateString()}
          </p>
        </div>
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Resume
          </Button>
        )}
      </div>

      {/* Skills Section */}
      {details.skills && details.skills.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>Skills</CardTitle>
            </div>
            <CardDescription>Technical skills and expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {details.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-primary text-white">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {details.experience && details.experience.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Work Experience</CardTitle>
            </div>
            <CardDescription>Professional work history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {details.experience.map((exp, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{exp.role}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Building className="h-4 w-4" />
                          <span>{exp.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{exp.duration}</span>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Education</CardTitle>
            </div>
            <CardDescription>Academic background</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {details.education.map((edu, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-1">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.school}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      {edu.field && <span>{edu.field}</span>}
                      {edu.year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
              <CardTitle>Projects</CardTitle>
            </div>
            <CardDescription>Notable projects and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {details.projects.map((project, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.split(',').map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <p className="text-sm text-gray-700">{project.description}</p>
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
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                <p>No data extracted from resume</p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

