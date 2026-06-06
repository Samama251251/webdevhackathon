import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    username: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp({
        email: data.email,
        password: data.password,
        username: data.username,
      });

      if (signUpError) {
        setError(
          signUpError.message || "Failed to sign up. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Show email confirmation message
      setShowEmailConfirmation(true);
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex flex-col bg-background/50 noise-overlay">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <Card className="w-full max-w-md border-foreground/10 shadow-lg rounded-2xl bg-card/80 backdrop-blur-xl text-center pb-4">
            <CardHeader className="space-y-3 pb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <CardTitle className="font-display text-4xl tracking-tight">
                Check your email
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                We've sent you a confirmation email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="rounded-xl bg-muted/50 border-foreground/10 text-center">
                <AlertDescription className="text-sm">
                  Please check your email inbox and click the confirmation
                  link to verify your account. Once confirmed, you can sign in
                  to access your dashboard.
                </AlertDescription>
              </Alert>
              <Button
                asChild
                className="w-full h-12 rounded-xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover-lift"
              >
                <Link to="/signin">Go to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/50 noise-overlay">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <Card className="w-full max-w-md border-foreground/10 shadow-lg rounded-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-8 text-center">
            <CardTitle className="font-display text-4xl tracking-tight">
              Create Account
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign up to get started with CareerPrep AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                    className="rounded-xl bg-background/50 border-foreground/10 focus-visible:ring-foreground/20 h-12"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username (Optional)
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    {...register("username")}
                    className="rounded-xl bg-background/50 border-foreground/10 focus-visible:ring-foreground/20 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                    className="rounded-xl bg-background/50 border-foreground/10 focus-visible:ring-foreground/20 h-12"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    className="rounded-xl bg-background/50 border-foreground/10 focus-visible:ring-foreground/20 h-12"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover-lift"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm pt-4 border-t border-foreground/10">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/signin"
                  className="font-medium text-foreground hover:underline underline-offset-4 transition-all"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
