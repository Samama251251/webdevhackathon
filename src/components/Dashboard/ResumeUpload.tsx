import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resumeService } from '@/services/resumeService';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ResumeUploadProps {
  onUploadComplete?: () => void;
}

export const ResumeUpload = ({ onUploadComplete }: ResumeUploadProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(false);
    setProgress(0);

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setError('Please select a file and ensure you are logged in');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      const result = await resumeService.uploadAndAnalyzeResume(
        file,
        user.id,
        (step, progressValue) => {
          setProgressMessage(step);
          setProgress(progressValue);
        }
      );

      if (result.success) {
        setSuccess(true);
        setProgressMessage('Resume analyzed successfully!');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadComplete?.();
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${isDragging
            ? 'border-foreground bg-foreground/5 scale-[1.02]'
            : 'border-foreground/20 hover:border-foreground/50 hover:bg-foreground/[0.02]'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!file ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-foreground/50" />
            </div>
            <div>
              <p className="text-base text-muted-foreground font-medium">
                Drag and drop your resume here, or
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleBrowseClick}
                className="text-foreground font-semibold px-1 underline underline-offset-4 hover:text-foreground/80"
              >
                browse files
              </Button>
            </div>
            <p className="text-sm text-muted-foreground/70 font-mono">PDF only, max 10MB</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground font-mono">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove File
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-3 p-4 border border-foreground/10 rounded-xl bg-muted/30">
          <Progress value={progress} className="w-full h-2 rounded-full" />
          <p className="text-sm text-center text-muted-foreground font-medium animate-pulse">{progressMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500/20 bg-green-500/10 rounded-xl">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-600 font-medium">
            Resume uploaded and analyzed successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full h-12 rounded-xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover-lift"
      >
        {uploading ? 'Processing Resume...' : 'Upload and Analyze'}
      </Button>
    </div>
  );
};
