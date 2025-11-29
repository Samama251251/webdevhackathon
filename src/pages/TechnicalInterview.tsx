import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Vapi from '@vapi-ai/web';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MicOff, Code, Database, Cpu, Terminal, Clock, Zap } from 'lucide-react';
import type { VapiMessage } from '@/types/vapi';

export default function TechnicalInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const callIdRef = useRef<string | null>(null);
  console.log('TechnicalInterview location.state:', location.state);
  const {
    company_name,
    role,
    user_background,
    company_background,
    technical_questions,
    technologies
  } = location.state || {};



  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [_transcript, setTranscript] = useState<VapiMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  // Get API key from environment variable
  const VAPI_API_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const ASSISTANT_ID = "c23f5137-7e6f-471d-8274-b8d95a13a6d1";

  useEffect(() => {
    const vapiInstance = new Vapi(VAPI_API_KEY);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Technical interview started')
      setIsConnected(true);
    });

    vapiInstance.on('call-end', () => {
      console.log('Technical interview ended');
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
      // Pass dynamic variables for the technical interview prompt
      vapi.start(ASSISTANT_ID, {
        variableValues: {
          company: company_name || "Example Corp",
          user_background: user_background || "Software Engineer with 3 years of experience",
          role: role || "Senior Software Engineer",
          interviewer_name: "Elliot",
          tech_stack: technologies || "React, Node.js, TypeScript, PostgreSQL, AWS, Docker",
          company_research: company_background || "Example Corp uses modern microservices architecture",
          technical_questions: Array.isArray(technical_questions)
            ? technical_questions.join(". ")
            : (technical_questions || "Explain the event loop in Node.js"),
          call_type: "technical",
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

  const technicalTopics = [
    {
      title: "Data Structures",
      topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"],
      icon: Database
    },
    {
      title: "Algorithms",
      topics: ["Sorting", "Searching", "Dynamic Programming", "Recursion"],
      icon: Cpu
    },
    {
      title: "System Design",
      topics: ["Scalability", "Load Balancing", "Caching", "Microservices"],
      icon: Terminal
    }
  ];



  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Technical Interview Practice</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Master coding challenges and technical concepts with AI-guided practice
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
                      <CardTitle>Coding Session</CardTitle>
                      <CardDescription>
                        Practice technical questions and explain your approach
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
                      {isConnected && (
                        <Badge variant="outline" className="ml-2">
                          <Zap className="h-3 w-3 mr-1" />
                          Live Session
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={isConnected ? endInterview : startInterview}
                      variant={isConnected ? "destructive" : "default"}
                      size="lg"
                    >
                      {isConnected ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          End Session
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Session
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Topics Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Topics</CardTitle>
                  <CardDescription>Core technical areas to master</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="data-structures">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="data-structures" className="text-xs">
                        <Database className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="algorithms" className="text-xs">
                        <Cpu className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="system-design" className="text-xs">
                        <Terminal className="h-3 w-3" />
                      </TabsTrigger>
                    </TabsList>
                    {technicalTopics.map((topic, index) => (
                      <TabsContent key={index} value={topic.title.toLowerCase().replace(' ', '-')} className="space-y-2">
                        <h4 className="font-semibold text-sm">{topic.title}</h4>
                        <ul className="space-y-1">
                          {topic.topics.map((item, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                    ))}
                  </Tabs>
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
