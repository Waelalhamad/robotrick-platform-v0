import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { ROUTES } from "../shared/constants/routes.constants";
import { Button, Input, Alert, useToast } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const toast = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || ROUTES.HOME;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success("Welcome back!", "Login successful");
      // The AuthProvider will handle the redirection after successful login
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error("Login failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffffcc] via-white to-[#f5f5dc] px-6 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-primary/20 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-mono font-bold text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-[#003300]/70">Sign in to your Robotrick account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={isLoading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              disabled={isLoading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={!isLoading && <LogIn className="w-5 h-5" />}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register link hidden - only admins can create accounts via user management */}
          {/* <div className="mt-8 text-center">
            <p className="text-[#003300]/70 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-[#004d00] font-semibold transition-colors duration-300"
              >
                Create one here
              </Link>
            </p>
          </div> */}

          <div className="mt-6 pt-6 border-t border-primary/10">
            <p className="text-xs text-[#003300]/50 text-center">
              By signing in, you agree to our terms of service and privacy
              policy.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 border-2 border-primary/20 rounded-full animate-float"></div>
        <div
          className="absolute -bottom-10 -right-10 w-16 h-16 border-2 border-primary/30 rounded-lg animate-float"
          style={{ animationDirection: "reverse" }}
        ></div>
      </div>
    </div>
  );
}
