import { Shield, Scan, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const demoResults = [
  { name: "selfie_portrait.jpg", category: "Normal Selfie", risk: "Safe", flagged: false },
  { name: "cyber_diagram.png", category: "Educational Content", risk: "Safe", flagged: false },
  { name: "blurred_content.jpg", category: "Blurred / Censored", risk: "Moderate Risk", flagged: true },
  { name: "face_sensitive.jpg", category: "Face + Explicit", risk: "High Risk", flagged: true },
];

export default function Explore() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<typeof demoResults | null>(null);

  const runDemo = () => {
    setScanning(true);
    setResults(null);
    setTimeout(() => {
      setScanning(false);
      setResults(demoResults);
    }, 2500);
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container py-16 space-y-16 max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-display font-black">
            Explore <span className="gradient-text">AI Scanning</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Ethicare's AI image classification engine works. Our deep learning models analyze 
            images in real-time to detect sensitive content and protect your privacy.
          </p>
        </div>

        {/* How scanning works */}
        <div className="glass-panel rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-display font-bold">How AI Classification Works</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Normal Selfie</span>
                <p className="text-muted-foreground mt-1">Standard portraits and selfies — Not Flagged</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Educational Content</span>
                <p className="text-muted-foreground mt-1">Diagrams, charts, educational — Not Flagged</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Blurred / Censored</span>
                <p className="text-muted-foreground mt-1">Blurred explicit content — Moderate Risk</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Face + Explicit</span>
                <p className="text-muted-foreground mt-1">Identifiable face with explicit content — High Risk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo */}
        <div className="glass-panel rounded-xl p-8 space-y-6 text-center">
          <Scan className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-display font-bold">Live Demo Preview</h2>
          <p className="text-muted-foreground">Click below to simulate an AI scan on sample images.</p>
          <Button
            onClick={runDemo}
            disabled={scanning}
            className="gradient-primary text-primary-foreground font-semibold px-8 glow-primary"
          >
            {scanning ? "Scanning..." : "Run Demo Scan"}
          </Button>

          {scanning && (
            <div className="space-y-3">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-primary animate-pulse rounded-full" style={{ width: "70%" }} />
              </div>
              <p className="text-sm text-muted-foreground font-mono">Analyzing image patterns...</p>
            </div>
          )}

          {results && (
            <div className="space-y-3 text-left">
              {results.map((r) => (
                <div key={r.name} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-mono text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      r.risk === "Safe" ? "bg-success/20 text-success" :
                      r.risk === "Moderate Risk" ? "bg-warning/20 text-warning" :
                      "bg-destructive/20 text-destructive"
                    }`}>
                      {r.risk}
                    </span>
                    {r.flagged ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
