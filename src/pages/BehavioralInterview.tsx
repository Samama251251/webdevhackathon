import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Vapi from '@vapi-ai/web';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, MessageSquare, BookOpen, Target, Lightbulb, Clock, Activity } from 'lucide-react';
import type { VapiMessage } from '@/types/vapi';

export default function BehavioralInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const callIdRef = useRef<string | null>(null);
  const {
    company_name,
    role,
    user_background,
    company_background,
    behavioral_questions
  } = location.state || {};

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [_transcript, setTranscript] = useState<VapiMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  // Get API key from environment variable
  const VAPI_API_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const ASSISTANT_ID = "b6b5ec0c-45c3-4bb0-b0b7-effa05925f1f";

  useEffect(() => {
    const vapiInstance = new Vapi(VAPI_API_KEY);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      setIsConnected(true);
    });

    vapiInstance.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
      if (callIdRef.current) {
        navigate(`/call-analysis/${callIdRef.current}`);
      }
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
      vapi.start(ASSISTANT_ID, {
        variableValues: {
          company: company_name || "Placeholder Company",
          user_background: user_background || "Placeholder background here",
          role: role || "Placeholder Role",
          interviewer_name: "Leah",
          company_research: company_background || "Placeholder company research",
          behavioral_questions: Array.isArray(behavioral_questions)
            ? (behavioral_questions.length > 0
              ? behavioral_questions.join(". ")
              : "Tell me about a time you faced a challenge. How did you overcome it?")
            : (behavioral_questions || "Describe a situation where you demonstrated leadership."),
          call_type: "behavioural",
          user_id: user?.id
        }
      }).then((call: any) => {
        if (call) {
          callIdRef.current = call.id;
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

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background noise-overlay">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 max-w-7xl relative z-10">
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-display tracking-tight text-foreground">
              Behavioral Interview
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Practice your soft skills and behavioral responses with our realistic AI interviewer.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Interview Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card overflow-hidden h-full flex flex-col relative">
                {isConnected && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50 animate-pulse" />
                )}
                <CardHeader className="border-b border-foreground/5 bg-muted/20 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-2xl tracking-tight">Interview Session</CardTitle>
                      <CardDescription className="text-base mt-1">
                        AI will evaluate your responses using the STAR method
                      </CardDescription>
                    </div>
                    {isConnected && (
                      <Badge variant="outline" className="gap-2 px-3 py-1.5 font-mono text-sm border-foreground/20 bg-background">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(callDuration)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-center items-center py-16 space-y-8">
                  {/* Status Visualizer */}
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      isConnected 
                        ? isSpeaking 
                          ? 'border-red-500/30 bg-red-500/10 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.3)]' 
                          : 'border-green-500/30 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                        : 'border-foreground/10 bg-muted'
                    }`}>
                      {isConnected ? (
                        isSpeaking ? (
                          <Activity className="w-12 h-12 text-red-500 animate-pulse" />
                        ) : (
                          <Mic className="w-12 h-12 text-green-500" />
                        )
                      ) : (
                        <MicOff className="w-12 h-12 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    {/* Ripple effects when speaking */}
                    {isConnected && isSpeaking && (
                      <>
                        <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                      </>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-display font-medium">
                      {isConnected
                        ? isSpeaking ? 'AI is speaking...' : 'Listening to your response...'
                        : 'Ready to start'
                      }
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {isConnected 
                        ? 'Ensure you are in a quiet environment and speak clearly into your microphone.' 
                        : 'Click below when you are ready to begin the interview.'}
                    </p>
                  </div>
                </CardContent>

                <div className="p-6 bg-muted/20 border-t border-foreground/5">
                  <Button
                    onClick={isConnected ? endInterview : startInterview}
                    variant={isConnected ? "destructive" : "default"}
                    className={`w-full h-14 rounded-xl text-lg font-medium transition-all hover-lift ${
                      isConnected 
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20' 
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <MicOff className="mr-2 h-5 w-5" />
                        End Interview
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-5 w-5" />
                        Start Interview
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <Card className="border-foreground/10 shadow-lg rounded-2xl bg-card">
                <CardHeader className="pb-4 bg-muted/30 border-b border-foreground/5">
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Interview Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {behavioralTips.map((tip, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/5">
                          <tip.icon className="h-5 w-5 text-foreground/70" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
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
