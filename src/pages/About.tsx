import { Shield, Eye, Lock, Server } from "lucide-react";

const steps = [
  { icon: Shield, title: "Upload & Scan", desc: "Upload your images. Our AI instantly classifies and flags sensitive content." },
  { icon: Lock, title: "Lock & Secure", desc: "Protect images with PIN, face, or eye recognition for maximum security." },
  { icon: Eye, title: "Monitor & Detect", desc: "Continuous reverse image search scans the web for unauthorized usage." },
  { icon: Server, title: "Alert & Act", desc: "Instant notifications and one-click complaint filing when threats are found." },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24">
      <div className="container py-16 space-y-24">
        {/* Hero */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-black">
            About <span className="gradient-text">ETHICARE</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We believe everyone deserves control over their digital identity. Ethicare uses cutting-edge AI 
            to detect, prevent, and respond to personal image misuse across the internet.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-xl p-8 space-y-4">
            <h3 className="text-2xl font-display font-bold gradient-text">Our Mission</h3>
            <p className="text-muted-foreground">
              To empower individuals with AI-driven tools that protect personal images from unauthorized 
              distribution, deepfakes, and online exploitation — making digital safety accessible to all.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-8 space-y-4">
            <h3 className="text-2xl font-display font-bold gradient-text">Our Vision</h3>
            <p className="text-muted-foreground">
              A world where every person has full control over their digital presence, where AI serves 
              as a guardian rather than a threat, and where online exploitation is identified and stopped in real-time.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-12">
          <h2 className="text-3xl font-display font-bold text-center">
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                  <s.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-sm font-mono text-primary">Step {i + 1}</div>
                <h4 className="font-semibold font-display">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-panel-primary rounded-2xl p-12 text-center space-y-4">
          <Lock className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-2xl font-display font-bold">Data Privacy Commitment</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your images are encrypted at rest and in transit. We never share your data with third parties. 
            All AI processing happens in secure, isolated environments. You maintain full ownership and 
            can delete your data at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
