import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Search, FileWarning, Bell, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: KeyRound, title: "OTP Security", desc: "Dual-channel OTP verification via email & SMS for bulletproof account security." },
  { icon: Lock, title: "Image Locking", desc: "Lock your images with PIN, face, or eye recognition to prevent unauthorized use." },
  { icon: Eye, title: "Explicit Detection", desc: "AI-powered scanning classifies images and flags explicit or sensitive content instantly." },
  { icon: Search, title: "Misuse Detection", desc: "Continuous reverse image search monitors the web for unauthorized use of your photos." },
  { icon: FileWarning, title: "Complaint Tracking", desc: "File and track complaints with real-time status updates from submission to resolution." },
  { icon: Bell, title: "Real-time Alerts", desc: "Instant notifications via email, SMS, and in-app when threats are detected." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        <div className="container relative z-10 text-center py-32 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono animate-pulse-glow">
            <Shield className="h-4 w-4" />
            AI-Powered Protection
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight leading-tight">
            <span className="gradient-text">ETHICARE</span>
            <br />
            <span className="text-foreground">Personal Image</span>
            <br />
            <span className="text-foreground">Protection System</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Protecting Your Identity in the AI Era. Advanced AI scanning, real-time monitoring, and instant alerts keep your personal images safe from misuse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 glow-primary">
                Get Started Free
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Comprehensive <span className="gradient-text">Protection</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Six layers of AI-powered security to keep your digital identity safe.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-panel rounded-xl p-6 space-y-4 hover:glow-primary transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold font-display">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="glass-panel-primary rounded-2xl p-12 text-center space-y-6 glow-primary">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Ready to Protect Your <span className="gradient-text">Identity</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join thousands securing their digital presence with Ethicare's AI-powered protection.
            </p>
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
