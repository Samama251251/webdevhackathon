import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Search,
  Brain,
  TrendingUp,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Intelligent Resume Analysis",
    description:
      "Upload your resume in PDF format and let our AI extract and structure key information including skills, experience, education, and projects. Build a comprehensive profile that identifies your technical expertise areas and proficiency levels.",
  },
  {
    icon: Search,
    title: "Automated Job Discovery & Matching",
    description:
      "We automatically discover job opportunities from across the internet, filter them based on your qualifications, and rank them by relevance. Each match includes a compatibility score explaining why it fits your profile.",
  },
  {
    icon: Brain,
    title: "Deep Research-Powered Interview Prep",
    description:
      "Get comprehensive interview preparation materials powered by real-time research. Our AI searches the internet for current, relevant information about your target role and technologies, generating difficulty-appropriate questions and study guides.",
  },
  {
    icon: BarChart3,
    title: "User Dashboard & Analytics",
    description:
      "Track your job search progress with visual analytics. See your skill coverage, identify strengths and gaps, and review your interview preparation history with AI-generated insights and recommendations.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A comprehensive platform that guides you through every step of your
            career journey
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-2"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="h-full transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Advanced algorithms analyze your profile",
              },
              {
                icon: Target,
                title: "Personalized",
                description: "Tailored to your experience and goals",
              },
              {
                icon: TrendingUp,
                title: "Research-Backed",
                description: "Current insights from across the web",
              },
            ].map((highlight) => (
              <div
                key={highlight.title}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <highlight.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

