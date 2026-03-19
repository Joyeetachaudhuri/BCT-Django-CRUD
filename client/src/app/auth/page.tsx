"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, LogIn, ChevronLeft, Sparkles, Quote, Eye, EyeOff } from "lucide-react";

// Page transition variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const formVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  },
};

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginUsername, loginPassword);
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regConfirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setRegLoading(true);
    try {
      await register(regUsername, regEmail, regPassword);
      // Reset form
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Left Side - Visual (Desktop only) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Fashion Background"
            className="h-full w-full object-cover grayscale transition-transform duration-[10s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-white"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-black uppercase tracking-[0.3em]">ÉLEVE</span>
          </motion.div>
        </div>

        <div className="relative z-10 p-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-md space-y-6"
          >
            <Quote className="h-10 w-10 text-primary opacity-50" />
            <p className="text-3xl font-light italic leading-snug text-white">
              "Fashion is the armor to survive the reality of everyday life."
            </p>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white uppercase tracking-widest">— Bill Cunningham</span>
              <span className="text-sm text-white/60">Legendary Fashion Photographer</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-24">
          <motion.div
            variants={formVariants}
            className="w-full max-w-sm space-y-8"
          >
            {/* Mobile Brand / Back Link */}
            <div className="flex items-center justify-between lg:justify-end">
              <div className="flex items-center gap-2 lg:hidden">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-black uppercase tracking-[0.2em]">ÉLEVE</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="group gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Store
              </Button>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Access Your Suite</h2>
              <p className="text-muted-foreground">Welcome back to your curated space.</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  <TabsContent value="login">
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="login-username" className="text-xs font-bold uppercase tracking-widest opacity-70">Username</Label>
                        <Input
                          id="login-username"
                          className="h-12 border-border/50 bg-muted/30 focus-visible:ring-primary/20"
                          placeholder="Your unique identifier"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest opacity-70">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            className="h-12 pr-11 border-border/50 bg-muted/30 focus-visible:ring-primary/20"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                        disabled={loginLoading}
                      >
                        {loginLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        {loginLoading ? "Authenticating..." : "Enter Suite"}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="register">
                    <motion.form
                      key="register-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleRegister}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-xs font-bold uppercase tracking-widest opacity-70">Username</Label>
                        <Input
                          id="reg-username"
                          className="h-11 border-border/50 bg-muted/30 focus-visible:ring-primary/20"
                          placeholder="Choose a username"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-widest opacity-70">Email</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          className="h-11 border-border/50 bg-muted/30 focus-visible:ring-primary/20"
                          placeholder="your@email.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-widest opacity-70">Password</Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showRegPassword ? "text" : "password"}
                            className="h-11 pr-11 border-border/50 bg-muted/30 focus-visible:ring-primary/20"
                            placeholder="Create a password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          >
                            {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm-password" className="text-xs font-bold uppercase tracking-widest opacity-70">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="reg-confirm-password"
                            type={showRegConfirmPassword ? "text" : "password"}
                            className="h-11 pr-11 border-border/50 bg-muted/30 focus-visible:ring-primary/20"
                            placeholder="Confirm your password"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          >
                            {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                        disabled={regLoading}
                      >
                        {regLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {regLoading ? "Creating Profile..." : "Join ÉLEVE"}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>

            <p className="px-8 text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <button className="underline underline-offset-4 hover:text-primary">Terms of Service</button> and{" "}
              <button className="underline underline-offset-4 hover:text-primary">Privacy Policy</button>.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center text-xs text-muted-foreground opacity-50">
          © 2026 ÉLEVE LUXURY RETAIL GROUP. ALL RIGHTS RESERVED.
        </div>
      </div>
    </motion.div>
  );
}
