import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, MessageSquare, BookOpen, Target, Lightbulb, Clock } from 'lucide-react';
import type { VapiMessage } from '@/types/vapi';

export default function BehavioralInterview() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<VapiMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  // Get API key from environment variable
  const VAPI_API_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const ASSISTANT_ID = "b6b5ec0c-45c3-4bb0-b0b7-effa05925f1f";

  useEffect(() => {
    const vapiInstance = new Vapi(VAPI_API_KEY);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Behavioral interview started');
      setIsConnected(true);
    });

    vapiInstance.on('call-end', () => {
      console.log('Behavioral interview ended');
      setIsConnected(false);
      setIsSpeaking(false);
    });

    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript,
          timestamp: new Date()
        }]);
      }
    });

    vapiInstance.on('error', (error: any) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000) as unknown as number;
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const startInterview = () => {
    if (vapi) {
      // Pass dynamic variables for the behavioral interview prompt
      vapi.start(ASSISTANT_ID, {
        variableValues: {
          company: "Example Corp", // Replace with actual company name
          user_background: "Software Engineer with 3 years of experience in full-stack development, proficient in React and Node.js",
          role: "Senior Software Engineer",
          interviewer_name: "Leah",
          company_research: "Example Corp is a leading tech company known for innovation and collaborative culture",
          behavioral_questions: "Tell me about a time you faced a challenge at work, Describe a situation where you led a team, How do you handle conflicts with colleagues",
          call_type: "behavioural"
        }
      });
    }
  };

  const endInterview = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const behavioralTips = [
    {
      title: "Use the STAR Method",
      description: "Structure answers: Situation, Task, Action, Result",
      icon: Target
    },
    {
      title: "Be Specific",
      description: "Share concrete examples from your experience",
      icon: Lightbulb
    },
    {
      title: "Show Impact",
      description: "Quantify results and emphasize outcomes",
      icon: BookOpen
    }
  ];

  const commonQuestions = [
    "Tell me about a time you faced a challenge at work",
    "Describe a situation where you led a team",
    "How do you handle conflicts with colleagues?",
    "Give an example of when you failed and what you learned",
    "Tell me about a time you had to meet a tight deadline"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Behavioral Interview Practice</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Practice your soft skills and behavioral responses with our AI interviewer
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Interview Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Interview Session Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Interview Session</CardTitle>
                      <CardDescription>
                        Start practicing behavioral questions with AI feedback
                      </CardDescription>
                    </div>
                    {isConnected && (
                      <Badge variant="default" className="gap-2">
                        <Clock className="h-3 w-3" />
                        {formatTime(callDuration)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Controls */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${isConnected
                        ? isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                        : 'bg-gray-400'
                        }`} />
                      <span className="font-medium">
                        {isConnected
                          ? isSpeaking ? 'AI is speaking...' : 'Listening...'
                          : 'Ready to start'
                        }
                      </span>
                    </div>
                    <Button
                      onClick={isConnected ? endInterview : startInterview}
                      variant={isConnected ? "destructive" : "default"}
                      size="lg"
                    >
                      {isConnected ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          End Interview
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Interview
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {behavioralTips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <tip.icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))}
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
