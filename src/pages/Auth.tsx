import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Building2, Users, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AppRole = "student" | "placement_cell" | "company";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const roleOptions: { value: AppRole; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, description: "Looking for placement opportunities" },
  { value: "placement_cell", label: "Placement Cell", icon: Users, description: "Manage campus placements" },
  { value: "company", label: "Company", icon: Building2, description: "Recruit talented students" },
];

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && role && !authLoading) {
      const dashboardRoutes: Record<AppRole, string> = {
        student: "/dashboard/student",
        placement_cell: "/dashboard/placement",
        company: "/dashboard/company",
      };
      navigate(dashboardRoutes[role]);
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast({ title: "Select Role", description: "Please select your role to continue.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      nameSchema.parse(signupName);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName, selectedRole);

    if (error) {
      const errorMessage = error.message.includes("already registered")
        ? "This email is already registered. Please sign in instead."
        : error.message;
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "Welcome to PlaceHub!" });
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
              <GraduationCap className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to PlaceHub</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-4" style={{ width: "calc(100% - 2rem)" }}>
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4 pt-4">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {roleOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedRole(option.value)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                            selectedRole === option.value
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedRole === option.value ? "bg-accent text-accent-foreground" : "bg-muted"
                          }`}>
                            <option.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
