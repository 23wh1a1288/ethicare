import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    setTimeout(() => {
      if (email === "admin@ethicare.ai" && password === "admin123") {
        localStorage.setItem("ethicare_user", JSON.stringify({ role: "admin", name: "Admin", email }));
        navigate("/admin");
      } else if (email && password) {
        localStorage.setItem("ethicare_user", JSON.stringify({ role: "user", name: "User", email }));
        navigate("/dashboard");
      } else {
        toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center cyber-grid">
      <div className="w-full max-w-md p-8">
        <div className="glass-panel rounded-2xl p-8 space-y-6 glow-primary">
          <div className="text-center space-y-2">
            <Shield className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-display font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your Ethicare account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Demo admin: admin@ethicare.ai / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
