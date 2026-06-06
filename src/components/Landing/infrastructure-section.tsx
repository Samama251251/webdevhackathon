"use client";

import { useEffect, useState, useRef } from "react";

const pipeline = [
  { name: "Resume Parser", stage: "Extraction", status: "pdfplumber + Grok AI" },
  { name: "Job Scraper", stage: "Discovery", status: "Tavily + Web Scraping" },
  { name: "Deep Researcher", stage: "Analysis", status: "LangChain Multi-Agent" },
  { name: "Question Generator", stage: "Preparation", status: "GPT-4 / Grok" },
  { name: "Voice Interviewer", stage: "Simulation", status: "VAPI Voice AI" },
  { name: "Performance Analyzer", stage: "Feedback", status: "AI Scoring Engine" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activePipeline, setActivePipeline] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipeline((prev) => (prev + 1) % pipeline.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              AI Engine
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Powered by
              <br />
              intelligence.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Our multi-agent AI pipeline combines resume parsing, web scraping, 
              deep research, and voice synthesis to deliver a complete career 
              preparation experience.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">6+</div>
                <div className="text-sm text-muted-foreground">AI Models</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">200+</div>
                <div className="text-sm text-muted-foreground">Data Sources</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">&lt;30s</div>
                <div className="text-sm text-muted-foreground">Analysis Time</div>
              </div>
            </div>
          </div>

          {/* Right: Pipeline list */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">AI Pipeline</span>
                <span className="flex items-center gap-2 text-xs font-mono text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All systems active
                </span>
              </div>

              {/* Pipeline stages */}
              <div>
                {pipeline.map((item, index) => (
                  <div
                    key={item.name}
                    className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 flex items-center justify-between transition-all duration-300 ${
                      activePipeline === index ? "bg-foreground/[0.02]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          activePipeline === index ? "bg-foreground" : "bg-foreground/20"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.stage}</div>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
